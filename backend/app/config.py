"""Environment-backed application settings and documented business defaults.

All deployment-controlled values are declared once on ``Settings`` so pydantic validates their
types and ranges at startup. Environment variable names are the upper-case field names (for example
``CODE_TTL_SECONDS`` sets ``code_ttl_seconds``). The upper-case module constants below remain the
stable import surface for the rest of the application; values that are product policy rather than
deployment configuration stay plain constants beside them.
"""

from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

LOCAL_SECRET_PREFIX = "local-development-"
# HMAC keys shorter than 32 characters weaken session and search-token signatures.
MINIMUM_PRODUCTION_SECRET_LENGTH = 32
DAY_SECONDS = 24 * 60 * 60


class Settings(BaseSettings):
    """Typed deployment configuration read from process environment variables.

    Booleans accept the usual ``1/true/yes/on`` and ``0/false/no/off`` spellings. Invalid numbers or
    out-of-range values raise a ``ValidationError`` at import time so a misconfigured container stops
    before serving requests instead of failing later inside a handler.
    """

    # Compose supplies every value explicitly; reading a .env file here could silently pick up a
    # developer's root credentials when running tools outside Docker.
    model_config = SettingsConfigDict(case_sensitive=False, extra="ignore")

    database_url: str = "postgresql+psycopg://mablog:mablog-local-development@localhost:5432/mablog"
    redis_url: str = "redis://localhost:6379/0"
    upload_dir: Path = Path("./uploads")
    app_origin: str = "http://localhost:3000"
    app_secret: str = "local-development-change-before-production-at-least-32-characters"
    app_env: str = "local"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    # Session cookies need Secure once the site is served over HTTPS.
    cookie_secure: bool = False

    smtp_host: str = ""
    smtp_port: int = Field(1025, ge=1, le=65535)

    # Durations are seconds; these defaults implement the accepted local verification policy.
    code_ttl_seconds: int = Field(600, ge=60)
    code_max_attempts: int = Field(5, ge=1)
    code_resend_seconds: int = Field(60, ge=0)
    image_limit_mb: int = Field(10, ge=1)
    video_limit_mb: int = Field(100, ge=1)
    public_cache_seconds: int = Field(15, ge=0)

    # Cloud AI settings stay on the backend and can change without rebuilding database records.
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_answer_model: str = "gpt-5.6-terra"
    openai_timeout_seconds: float = Field(45, gt=0)
    openai_max_output_tokens: int = Field(500, ge=1)

    # Search limits are product policy and deployment capacity controls.
    anonymous_enhanced_searches_per_hour: int = Field(10, ge=0)
    signed_in_enhanced_searches_per_hour: int = Field(60, ge=0)
    anonymous_keyword_searches_per_hour: int = Field(60, ge=0)
    signed_in_keyword_searches_per_hour: int = Field(300, ge=0)
    global_enhanced_searches_per_day: int = Field(500, ge=0)
    global_indexed_passages_per_day: int = Field(10000, ge=0)
    search_candidate_limit: int = Field(200, ge=1)
    search_token_seconds: int = Field(600, ge=1)
    # RRF combines incomparable lexical/vector ranks; engagement remains a bounded tie-breaker.
    search_rrf_k: float = Field(60, gt=0)
    search_like_boost_cap: float = Field(0.06, ge=0)
    search_freshness_boost_cap: float = Field(0.04, ge=0)
    search_freshness_half_life_days: float = Field(30, gt=0)
    index_worker_poll_seconds: float = Field(2, gt=0)

    # AI-news settings are named deployment controls; PostgreSQL stores curator-editable policy.
    news_master_enabled: bool = True
    news_small_model: str = "gpt-5.6-luna"
    news_strong_model: str = "gpt-5.6-terra"
    # Per-million-token USD estimates so budget calculations can follow provider pricing changes.
    news_small_input_usd_per_million: float = Field(0.25, ge=0)
    news_small_output_usd_per_million: float = Field(2, ge=0)
    news_strong_input_usd_per_million: float = Field(1.25, ge=0)
    news_strong_output_usd_per_million: float = Field(10, ge=0)
    brave_api_key: str = ""
    brave_api_url: str = "https://api.search.brave.com/res/v1/web/search"
    news_timezone: str = "Europe/Madrid"
    # Python weekday numbering: Monday is 0.
    news_weekday: int = Field(0, ge=0, le=6)
    news_hour: int = Field(9, ge=0, le=23)
    news_minute: int = Field(0, ge=0, le=59)
    news_run_budget_usd: float = Field(2, ge=0)
    news_month_budget_usd: float = Field(10, ge=0)
    news_brave_query_budget: int = Field(15, ge=0)
    news_worker_poll_seconds: float = Field(3, gt=0)
    news_job_lease_seconds: int = Field(300, ge=1)
    news_fetch_timeout_seconds: float = Field(20, gt=0)
    news_fetch_max_bytes: int = Field(10 * 1024 * 1024, ge=1)
    news_fetch_max_redirects: int = Field(5, ge=0)
    news_crawler_user_agent: str = "MAblog-NewsBot/1.0 (+http://localhost:3000/ai-news-methodology)"
    # Full extracted source text stays 30 days; evidence metadata and hashes stay permanently.
    news_snapshot_seconds: int = Field(30 * DAY_SECONDS, ge=0)
    news_failed_retention_seconds: int = Field(90 * DAY_SECONDS, ge=0)
    news_operation_retention_seconds: int = Field(365 * DAY_SECONDS, ge=0)
    news_diagnostic_retention_seconds: int = Field(30 * DAY_SECONDS, ge=0)
    admin_step_up_seconds: int = Field(600, ge=1)

    # Local password-only test administrator; validated in detail by ``app.bootstrap``.
    local_admin_enabled: bool = False
    local_admin_username: str = "mablog_admin"
    local_admin_email: str = "admin@mablog.local"
    local_admin_password: str = "mablog-admin-local-2026"
    # Ten years keeps the local test login convenient without a verification bypass in auth routes.
    local_admin_verification_seconds: int = 10 * 365 * DAY_SECONDS
    local_admin_step_up_bypass: bool = False

    @field_validator("app_env", "local_admin_username", "local_admin_email")
    @classmethod
    def _normalize_identifier(cls, value: str) -> str:
        """Compare environment names and local account identifiers case-insensitively."""
        return value.strip().lower()

    @field_validator("log_level", mode="before")
    @classmethod
    def _upper_level(cls, value: str) -> str:
        """Accept lower-case logging level names from the environment."""
        return str(value).strip().upper()

    @field_validator("openai_api_key", "brave_api_key", "smtp_host")
    @classmethod
    def _strip(cls, value: str) -> str:
        """Treat whitespace-only credentials and hosts as unset."""
        return value.strip()

    @field_validator("openai_base_url", "brave_api_url")
    @classmethod
    def _strip_trailing_slash(cls, value: str) -> str:
        """Let callers append paths without producing a double slash."""
        return value.rstrip("/")

    @model_validator(mode="after")
    def _reject_unsafe_deployment(self) -> "Settings":
        """Refuse local conveniences and development secrets outside their intended environment.

        Raises:
            ValueError: when the step-up bypass is enabled outside ``local`` or production uses a
                development or short ``APP_SECRET``.
        """
        if self.app_env != "local" and self.local_admin_step_up_bypass:
            raise ValueError("LOCAL_ADMIN_STEP_UP_BYPASS is allowed only when APP_ENV=local")
        if self.app_env == "production":
            if self.app_secret.startswith(LOCAL_SECRET_PREFIX):
                raise ValueError("Production requires a non-default APP_SECRET")
            if len(self.app_secret) < MINIMUM_PRODUCTION_SECRET_LENGTH:
                raise ValueError(f"Production APP_SECRET must contain at least {MINIMUM_PRODUCTION_SECRET_LENGTH} characters")
        return self


def load_settings() -> Settings:
    """Read the current environment into a fresh validated settings object.

    Most code uses the module-level ``settings`` snapshot. One-shot commands and tests that change
    environment variables at runtime (for example the local administrator bootstrap) call this instead.
    """
    return Settings()


settings = load_settings()

DATABASE_URL = settings.database_url
REDIS_URL = settings.redis_url
UPLOAD_DIR = settings.upload_dir
APP_ORIGIN = settings.app_origin
APP_SECRET = settings.app_secret
APP_ENV = settings.app_env
LOG_LEVEL = settings.log_level
COOKIE_SECURE = settings.cookie_secure
SMTP_HOST = settings.smtp_host
SMTP_PORT = settings.smtp_port
# Seven days is the confirmed verified-access window for regular accounts.
VERIFICATION_SECONDS = 7 * DAY_SECONDS
CODE_SECONDS = settings.code_ttl_seconds
CODE_ATTEMPTS = settings.code_max_attempts
RESEND_SECONDS = settings.code_resend_seconds
IMAGE_LIMIT_MB = settings.image_limit_mb
VIDEO_LIMIT_MB = settings.video_limit_mb
CACHE_SECONDS = settings.public_cache_seconds
# The featured carousel ranks likes received during the last 14 days.
LIKE_WINDOW_SECONDS = 14 * DAY_SECONDS
# Browsers may reuse public, approved media for one hour; permission-gated media is never cached.
PUBLIC_MEDIA_CACHE_SECONDS = 60 * 60

OPENAI_API_KEY = settings.openai_api_key
OPENAI_BASE_URL = settings.openai_base_url
OPENAI_EMBEDDING_MODEL = settings.openai_embedding_model
OPENAI_ANSWER_MODEL = settings.openai_answer_model
# The pgvector migration is dimensioned to 1536; changing this requires a new migration.
EMBEDDING_DIMENSIONS = 1536
OPENAI_TIMEOUT_SECONDS = settings.openai_timeout_seconds
OPENAI_MAX_OUTPUT_TOKENS = settings.openai_max_output_tokens

ANONYMOUS_ENHANCED_SEARCHES_PER_HOUR = settings.anonymous_enhanced_searches_per_hour
SIGNED_IN_ENHANCED_SEARCHES_PER_HOUR = settings.signed_in_enhanced_searches_per_hour
ANONYMOUS_KEYWORD_SEARCHES_PER_HOUR = settings.anonymous_keyword_searches_per_hour
SIGNED_IN_KEYWORD_SEARCHES_PER_HOUR = settings.signed_in_keyword_searches_per_hour
GLOBAL_ENHANCED_SEARCHES_PER_DAY = settings.global_enhanced_searches_per_day
GLOBAL_INDEXED_PASSAGES_PER_DAY = settings.global_indexed_passages_per_day
SEARCH_QUERY_MAX_CHARACTERS = 500
SEARCH_PAGE_SIZE = 10
SEARCH_CANDIDATE_LIMIT = settings.search_candidate_limit
SEARCH_CONTEXT_PASSAGES = 8
SEARCH_CONTEXT_POSTS = 5
SEARCH_CONTEXT_PASSAGES_PER_POST = 2
SEARCH_TOKEN_SECONDS = settings.search_token_seconds

RRF_K = settings.search_rrf_k
LIKE_BOOST_CAP = settings.search_like_boost_cap
FRESHNESS_BOOST_CAP = settings.search_freshness_boost_cap
FRESHNESS_HALF_LIFE_DAYS = settings.search_freshness_half_life_days

# Five increasing retry delays cover transient outages before creator-visible failure.
INDEX_RETRY_SECONDS = (60, 300, 900, 3600, 21600)
INDEX_WORKER_POLL_SECONDS = settings.index_worker_poll_seconds

NEWS_MASTER_ENABLED = settings.news_master_enabled
NEWS_SMALL_MODEL = settings.news_small_model
NEWS_STRONG_MODEL = settings.news_strong_model
NEWS_SMALL_INPUT_USD_PER_MILLION = settings.news_small_input_usd_per_million
NEWS_SMALL_OUTPUT_USD_PER_MILLION = settings.news_small_output_usd_per_million
NEWS_STRONG_INPUT_USD_PER_MILLION = settings.news_strong_input_usd_per_million
NEWS_STRONG_OUTPUT_USD_PER_MILLION = settings.news_strong_output_usd_per_million
BRAVE_API_KEY = settings.brave_api_key
BRAVE_API_URL = settings.brave_api_url
NEWS_TIMEZONE = settings.news_timezone
NEWS_WEEKDAY = settings.news_weekday
NEWS_HOUR = settings.news_hour
NEWS_MINUTE = settings.news_minute
NEWS_RUN_BUDGET_USD = settings.news_run_budget_usd
NEWS_MONTH_BUDGET_USD = settings.news_month_budget_usd
NEWS_BRAVE_QUERY_BUDGET = settings.news_brave_query_budget
NEWS_WORKER_POLL_SECONDS = settings.news_worker_poll_seconds
NEWS_JOB_LEASE_SECONDS = settings.news_job_lease_seconds
# Three increasing delays implement the accepted one/five/twenty-minute retry policy.
NEWS_RETRY_SECONDS = (60, 300, 1200)
NEWS_FETCH_TIMEOUT_SECONDS = settings.news_fetch_timeout_seconds
NEWS_FETCH_MAX_BYTES = settings.news_fetch_max_bytes
NEWS_FETCH_MAX_REDIRECTS = settings.news_fetch_max_redirects
NEWS_CRAWLER_USER_AGENT = settings.news_crawler_user_agent
NEWS_SNAPSHOT_SECONDS = settings.news_snapshot_seconds
NEWS_FAILED_RETENTION_SECONDS = settings.news_failed_retention_seconds
NEWS_OPERATION_RETENTION_SECONDS = settings.news_operation_retention_seconds
NEWS_DIAGNOSTIC_RETENTION_SECONDS = settings.news_diagnostic_retention_seconds
ADMIN_STEP_UP_SECONDS = settings.admin_step_up_seconds
LOCAL_ADMIN_USERNAME = settings.local_admin_username
LOCAL_ADMIN_STEP_UP_BYPASS = settings.local_admin_step_up_bypass
