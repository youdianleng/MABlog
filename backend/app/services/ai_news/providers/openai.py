"""Redacted synchronous OpenAI Responses and moderation adapters for AI news."""

import json
import re
from dataclasses import dataclass

import httpx

from ....config import OPENAI_BASE_URL, OPENAI_TIMEOUT_SECONDS
from ..provider_settings import effective_key


class NewsProviderError(RuntimeError):
    """Represent a retryable or terminal provider failure without response content."""

    def __init__(self, code: str, retry_after: float = 0) -> None:
        """Store only a safe error code and optional provider-directed retry delay."""
        super().__init__(code)
        self.code = code
        self.retry_after = retry_after


@dataclass(frozen=True)
class OpenAIResult:
    """Return model text and bounded usage counters to the pipeline."""

    text: str
    input_tokens: int
    output_tokens: int
    model: str


def _response_text(payload: dict) -> str:
    """Collect output-text items without retaining reasoning or tool-call arguments."""
    direct = payload.get("output_text")
    if isinstance(direct, str) and direct:
        return direct
    parts: list[str] = []
    for output in payload.get("output", []):
        for content in output.get("content", []) if isinstance(output, dict) else []:
            if isinstance(content, dict) and content.get("type") == "output_text" and isinstance(content.get("text"), str):
                parts.append(content["text"])
    return "".join(parts)


def responses_call(model: str, instructions: str, input_text: str, max_output_tokens: int, tools: list[dict] | None = None, idempotency_key: str | None = None, db=None) -> OpenAIResult:
    """Call Responses with provider storage disabled and translate failures into safe codes."""
    api_key = effective_key(db, "openai")
    if not api_key:
        raise NewsProviderError("openai_not_configured")
    payload: dict = {
        "model": model,
        "instructions": instructions,
        "input": input_text,
        "max_output_tokens": max_output_tokens,
        "store": False,
    }
    if tools:
        payload["tools"] = tools
    try:
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        response = httpx.post(
            f"{OPENAI_BASE_URL}/responses",
            headers=headers,
            json=payload,
            timeout=max(OPENAI_TIMEOUT_SECONDS, 90),
        )
    except httpx.HTTPError as error:
        raise NewsProviderError("openai_transport_error") from error
    if response.status_code >= 400:
        retry_after = float(response.headers.get("retry-after", "0") or 0)
        raise NewsProviderError(f"openai_http_{response.status_code}", retry_after)
    try:
        data = response.json()
        text = _response_text(data)
        usage = data.get("usage") or {}
        if not text:
            raise ValueError("missing_text")
        return OpenAIResult(
            text=text,
            input_tokens=int(usage.get("input_tokens", 0) or 0),
            output_tokens=int(usage.get("output_tokens", 0) or 0),
            model=str(data.get("model") or model),
        )
    except (TypeError, ValueError, KeyError) as error:
        raise NewsProviderError("openai_invalid_response") from error


def json_value(result: OpenAIResult) -> dict:
    """Parse one model JSON object while tolerating a single Markdown code fence."""
    text = result.text.strip()
    fenced = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", text, flags=re.DOTALL | re.IGNORECASE)
    if fenced:
        text = fenced.group(1)
    try:
        value = json.loads(text)
    except json.JSONDecodeError as error:
        raise NewsProviderError("openai_invalid_json") from error
    if not isinstance(value, dict):
        raise NewsProviderError("openai_invalid_json_shape")
    return value


def moderate_text(text: str, db) -> dict:
    """Moderate bounded public text and return only category flags and the aggregate result."""
    api_key = effective_key(db, "openai")
    if not api_key:
        raise NewsProviderError("moderation_not_configured")
    try:
        response = httpx.post(
            f"{OPENAI_BASE_URL}/moderations",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": "omni-moderation-latest", "input": text},
            timeout=OPENAI_TIMEOUT_SECONDS,
        )
    except httpx.HTTPError as error:
        raise NewsProviderError("moderation_transport_error") from error
    if response.status_code >= 400:
        raise NewsProviderError(f"moderation_http_{response.status_code}")
    try:
        result = response.json()["results"][0]
        return {"flagged": bool(result.get("flagged")), "categories": {key: bool(value) for key, value in (result.get("categories") or {}).items() if value}}
    except (KeyError, IndexError, TypeError) as error:
        raise NewsProviderError("moderation_invalid_response") from error
