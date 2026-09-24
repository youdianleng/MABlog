"""Economy-limit accounting based on configurable token-price estimates."""

from datetime import datetime, timezone

from sqlalchemy import func, select

from ...config import NEWS_SMALL_INPUT_USD_PER_MILLION, NEWS_SMALL_OUTPUT_USD_PER_MILLION, NEWS_STRONG_INPUT_USD_PER_MILLION, NEWS_STRONG_OUTPUT_USD_PER_MILLION
from ...models import NewsRun, NewsSetting, NewsUsage
from ...utils import now
from .providers.openai import OpenAIResult
from .provider_settings import model_for


def estimated_cost(db, result: OpenAIResult) -> float:
    """Estimate USD from provider token counters and deployment-configured price rates."""
    if result.model == model_for(db, "small"):
        input_rate, output_rate = NEWS_SMALL_INPUT_USD_PER_MILLION, NEWS_SMALL_OUTPUT_USD_PER_MILLION
    else:
        input_rate, output_rate = NEWS_STRONG_INPUT_USD_PER_MILLION, NEWS_STRONG_OUTPUT_USD_PER_MILLION
    return (result.input_tokens * input_rate + result.output_tokens * output_rate) / 1_000_000


def month_start_timestamp(timestamp: float | None = None) -> float:
    """Return the UTC start of the calendar month containing the supplied time."""
    instant = datetime.fromtimestamp(timestamp or now(), tz=timezone.utc)
    return datetime(instant.year, instant.month, 1, tzinfo=timezone.utc).timestamp()


def assert_paid_stage_budget(db, run: NewsRun, projected_cost: float = 0.25) -> None:
    """Block a paid stage when its conservative estimate would exceed run or month limits."""
    settings = db.get(NewsSetting, 1)
    month_spend = float(db.scalar(select(func.coalesce(func.sum(NewsUsage.estimated_cost), 0)).where(NewsUsage.created >= month_start_timestamp())) or 0)
    if run.openai_cost + projected_cost > settings.openai_run_budget:
        raise RuntimeError("openai_run_budget_exceeded")
    if month_spend + projected_cost > settings.openai_month_budget:
        raise RuntimeError("openai_month_budget_exceeded")


def record_openai_usage(db, run: NewsRun, stage: str, result: OpenAIResult) -> float:
    """Add one redacted usage record and update the run's accumulated estimate."""
    cost = estimated_cost(db, result)
    db.add(
        NewsUsage(
            run_id=run.id,
            provider="openai",
            model=result.model,
            stage=stage,
            input_units=result.input_tokens,
            output_units=result.output_tokens,
            estimated_cost=cost,
        )
    )
    run.openai_cost += cost
    return cost
