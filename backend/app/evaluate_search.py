"""Run the checked-in bilingual retrieval gate against the configured embedding model."""
import argparse
import json
import math
from pathlib import Path

from .services.embeddings import OpenAIServiceError, cloud_ai_configured, embed_texts

DEFAULT_FIXTURE = Path(__file__).resolve().parents[1] / "evaluation" / "rag_retrieval.json"


def document_text(document: dict) -> str:
    """Render the same user-visible metadata and block signals used by the production index."""
    return "\n".join(
        [
            f"Title: {document['title']}",
            f"Summary: {document['summary']}",
            f"Category: {document['category']}",
            f"Author: {document['author']}",
            document["content"],
            document["link_label"],
            document["image_alt"],
        ]
    )


def cosine_similarity(left: list[float], right: list[float]) -> float:
    """Measure normalized semantic closeness without adding an evaluation-only dependency."""
    numerator = sum(a * b for a, b in zip(left, right, strict=True))
    denominator = math.sqrt(sum(value * value for value in left)) * math.sqrt(sum(value * value for value in right))
    return numerator / denominator if denominator else 0.0


def evaluate_fixture(path: Path) -> tuple[int, int, int, int, list[str]]:
    """Embed synthetic stories and questions, returning aggregate top-five gate counts."""
    fixture = json.loads(path.read_text(encoding="utf-8"))
    documents = fixture["documents"]
    cases = fixture["cases"]
    document_vectors = embed_texts([document_text(document) for document in documents])
    query_vectors = embed_texts([case["query"] for case in cases])
    successes = 0
    bilingual_successes = 0
    bilingual_total = 0
    failed: list[str] = []
    for case, query_vector in zip(cases, query_vectors, strict=True):
        ranked = sorted(
            zip(documents, document_vectors, strict=True),
            key=lambda item: -cosine_similarity(query_vector, item[1]),
        )
        found = case["expected_key"] in {document["key"] for document, _ in ranked[:5]}
        successes += int(found)
        if case["bilingual"]:
            bilingual_total += 1
            bilingual_successes += int(found)
        if not found:
            failed.append(case["id"])
    return successes, len(cases), bilingual_successes, bilingual_total, failed


def main() -> None:
    """Print privacy-safe aggregate scores and fail when either accepted threshold is missed."""
    parser = argparse.ArgumentParser(description="Evaluate MAblog bilingual semantic retrieval")
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE)
    arguments = parser.parse_args()
    if not cloud_ai_configured():
        raise SystemExit("OPENAI_API_KEY is not configured; the live embedding gate was not run.")
    fixture = json.loads(arguments.fixture.read_text(encoding="utf-8"))
    try:
        successes, total, bilingual_successes, bilingual_total, failed = evaluate_fixture(arguments.fixture)
    except OpenAIServiceError as error:
        raise SystemExit(f"Embedding evaluation unavailable: {error}") from error
    overall_rate = successes / total if total else 0.0
    bilingual_rate = bilingual_successes / bilingual_total if bilingual_total else 0.0
    print(f"Overall top-5: {overall_rate:.1%} ({successes}/{total})")
    print(f"Bilingual top-5: {bilingual_rate:.1%} ({bilingual_successes}/{bilingual_total})")
    if failed:
        print(f"Failed case IDs: {', '.join(failed)}")
    thresholds = fixture["thresholds"]
    if overall_rate < thresholds["overall_top_five"] or bilingual_rate < thresholds["bilingual_top_five"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
