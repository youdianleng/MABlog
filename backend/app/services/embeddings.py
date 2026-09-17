"""Minimal OpenAI embedding adapter with content-safe failure reporting."""
import httpx

from ..config import EMBEDDING_DIMENSIONS, OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_EMBEDDING_MODEL, OPENAI_TIMEOUT_SECONDS


class OpenAIServiceError(RuntimeError):
    """Represent a provider failure without retaining request or response content."""


def cloud_ai_configured() -> bool:
    """Report whether the backend received a non-empty OpenAI Platform API key."""
    return bool(OPENAI_API_KEY)


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Create normalized-size OpenAI embeddings for approved passage or query text."""
    if not texts:
        return []
    if not OPENAI_API_KEY:
        raise OpenAIServiceError("embedding_not_configured")
    try:
        response = httpx.post(
            f"{OPENAI_BASE_URL}/embeddings",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
            json={"model": OPENAI_EMBEDDING_MODEL, "input": texts, "dimensions": EMBEDDING_DIMENSIONS},
            timeout=OPENAI_TIMEOUT_SECONDS,
        )
    except httpx.HTTPError as error:
        raise OpenAIServiceError("embedding_transport_error") from error
    if response.status_code >= 400:
        raise OpenAIServiceError(f"embedding_http_{response.status_code}")
    try:
        ordered = sorted(response.json()["data"], key=lambda item: item["index"])
        vectors = [item["embedding"] for item in ordered]
        if len(vectors) != len(texts) or any(len(vector) != EMBEDDING_DIMENSIONS for vector in vectors):
            raise ValueError("shape")
        return vectors
    except (KeyError, TypeError, ValueError) as error:
        raise OpenAIServiceError("embedding_invalid_response") from error

