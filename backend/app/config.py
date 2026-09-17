"""Environment-backed application settings and documented business defaults."""
import os
from pathlib import Path

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://mablog:mablog-local-development@localhost:5432/mablog")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
APP_ORIGIN = os.getenv("APP_ORIGIN", "http://localhost:3000")
APP_SECRET = os.getenv("APP_SECRET", "local-development-change-before-production-at-least-32-characters")
APP_ENV = os.getenv("APP_ENV", "local").strip().lower()
# Durations are seconds; these defaults implement the accepted local verification policy.
VERIFICATION_SECONDS = 7 * 24 * 60 * 60
CODE_SECONDS = int(os.getenv("CODE_TTL_SECONDS", "600"))
CODE_ATTEMPTS = int(os.getenv("CODE_MAX_ATTEMPTS", "5"))
RESEND_SECONDS = int(os.getenv("CODE_RESEND_SECONDS", "60"))
IMAGE_LIMIT_MB = int(os.getenv("IMAGE_LIMIT_MB", "10"))
VIDEO_LIMIT_MB = int(os.getenv("VIDEO_LIMIT_MB", "100"))
CACHE_SECONDS = int(os.getenv("PUBLIC_CACHE_SECONDS", "15"))
LIKE_WINDOW_SECONDS = 14 * 24 * 60 * 60

# Cloud AI settings stay on the backend and can change without rebuilding database records.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
OPENAI_ANSWER_MODEL = os.getenv("OPENAI_ANSWER_MODEL", "gpt-5.6-terra")
# The pgvector migration is dimensioned to 1536; changing this requires a new migration.
EMBEDDING_DIMENSIONS = 1536
OPENAI_TIMEOUT_SECONDS = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "45"))
OPENAI_MAX_OUTPUT_TOKENS = int(os.getenv("OPENAI_MAX_OUTPUT_TOKENS", "500"))

# Search limits are named because they are product policy and deployment capacity controls.
ANONYMOUS_ENHANCED_SEARCHES_PER_HOUR = int(os.getenv("ANONYMOUS_ENHANCED_SEARCHES_PER_HOUR", "10"))
SIGNED_IN_ENHANCED_SEARCHES_PER_HOUR = int(os.getenv("SIGNED_IN_ENHANCED_SEARCHES_PER_HOUR", "60"))
ANONYMOUS_KEYWORD_SEARCHES_PER_HOUR = int(os.getenv("ANONYMOUS_KEYWORD_SEARCHES_PER_HOUR", "60"))
SIGNED_IN_KEYWORD_SEARCHES_PER_HOUR = int(os.getenv("SIGNED_IN_KEYWORD_SEARCHES_PER_HOUR", "300"))
GLOBAL_ENHANCED_SEARCHES_PER_DAY = int(os.getenv("GLOBAL_ENHANCED_SEARCHES_PER_DAY", "500"))
GLOBAL_INDEXED_PASSAGES_PER_DAY = int(os.getenv("GLOBAL_INDEXED_PASSAGES_PER_DAY", "10000"))
SEARCH_QUERY_MAX_CHARACTERS = 500
SEARCH_PAGE_SIZE = 10
SEARCH_CANDIDATE_LIMIT = int(os.getenv("SEARCH_CANDIDATE_LIMIT", "200"))
SEARCH_CONTEXT_PASSAGES = 8
SEARCH_CONTEXT_POSTS = 5
SEARCH_CONTEXT_PASSAGES_PER_POST = 2
SEARCH_TOKEN_SECONDS = int(os.getenv("SEARCH_TOKEN_SECONDS", "600"))

# RRF combines incomparable lexical/vector ranks; engagement remains a bounded tie-breaker.
RRF_K = float(os.getenv("SEARCH_RRF_K", "60"))
LIKE_BOOST_CAP = float(os.getenv("SEARCH_LIKE_BOOST_CAP", "0.06"))
FRESHNESS_BOOST_CAP = float(os.getenv("SEARCH_FRESHNESS_BOOST_CAP", "0.04"))
FRESHNESS_HALF_LIFE_DAYS = float(os.getenv("SEARCH_FRESHNESS_HALF_LIFE_DAYS", "30"))

# Five increasing retry delays cover transient outages before creator-visible failure.
INDEX_RETRY_SECONDS = (60, 300, 900, 3600, 21600)
INDEX_WORKER_POLL_SECONDS = float(os.getenv("INDEX_WORKER_POLL_SECONDS", "2"))

# AI-news settings are named deployment controls; PostgreSQL stores curator-editable policy.
NEWS_MASTER_ENABLED = os.getenv("NEWS_MASTER_ENABLED", "true").strip().lower() in {"1", "true", "yes", "on"}
NEWS_SMALL_MODEL = os.getenv("NEWS_SMALL_MODEL", "gpt-5.6-luna")
NEWS_STRONG_MODEL = os.getenv("NEWS_STRONG_MODEL", "gpt-5.6-terra")
# Per-million-token estimates are deployment values so budget calculations can follow provider pricing changes.
NEWS_SMALL_INPUT_USD_PER_MILLION = float(os.getenv("NEWS_SMALL_INPUT_USD_PER_MILLION", "0.25"))
NEWS_SMALL_OUTPUT_USD_PER_MILLION = float(os.getenv("NEWS_SMALL_OUTPUT_USD_PER_MILLION", "2"))
NEWS_STRONG_INPUT_USD_PER_MILLION = float(os.getenv("NEWS_STRONG_INPUT_USD_PER_MILLION", "1.25"))
NEWS_STRONG_OUTPUT_USD_PER_MILLION = float(os.getenv("NEWS_STRONG_OUTPUT_USD_PER_MILLION", "10"))
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY", "").strip()
BRAVE_API_URL = os.getenv("BRAVE_API_URL", "https://api.search.brave.com/res/v1/web/search").rstrip("/")
NEWS_TIMEZONE = os.getenv("NEWS_TIMEZONE", "Europe/Madrid")
NEWS_WEEKDAY = int(os.getenv("NEWS_WEEKDAY", "0"))
NEWS_HOUR = int(os.getenv("NEWS_HOUR", "9"))
NEWS_MINUTE = int(os.getenv("NEWS_MINUTE", "0"))
NEWS_RUN_BUDGET_USD = float(os.getenv("NEWS_RUN_BUDGET_USD", "2"))
NEWS_MONTH_BUDGET_USD = float(os.getenv("NEWS_MONTH_BUDGET_USD", "10"))
NEWS_BRAVE_QUERY_BUDGET = int(os.getenv("NEWS_BRAVE_QUERY_BUDGET", "15"))
NEWS_WORKER_POLL_SECONDS = float(os.getenv("NEWS_WORKER_POLL_SECONDS", "3"))
NEWS_JOB_LEASE_SECONDS = int(os.getenv("NEWS_JOB_LEASE_SECONDS", "300"))
# Three increasing delays implement the accepted one/five/twenty-minute retry policy.
NEWS_RETRY_SECONDS = (60, 300, 1200)
NEWS_FETCH_TIMEOUT_SECONDS = float(os.getenv("NEWS_FETCH_TIMEOUT_SECONDS", "20"))
NEWS_FETCH_MAX_BYTES = int(os.getenv("NEWS_FETCH_MAX_BYTES", str(10 * 1024 * 1024)))
NEWS_FETCH_MAX_REDIRECTS = int(os.getenv("NEWS_FETCH_MAX_REDIRECTS", "5"))
NEWS_CRAWLER_USER_AGENT = os.getenv("NEWS_CRAWLER_USER_AGENT", "MAblog-NewsBot/1.0 (+http://localhost:3000/ai-news-methodology)")
NEWS_SNAPSHOT_SECONDS = int(os.getenv("NEWS_SNAPSHOT_SECONDS", str(30 * 24 * 60 * 60)))
NEWS_FAILED_RETENTION_SECONDS = int(os.getenv("NEWS_FAILED_RETENTION_SECONDS", str(90 * 24 * 60 * 60)))
NEWS_OPERATION_RETENTION_SECONDS = int(os.getenv("NEWS_OPERATION_RETENTION_SECONDS", str(365 * 24 * 60 * 60)))
NEWS_DIAGNOSTIC_RETENTION_SECONDS = int(os.getenv("NEWS_DIAGNOSTIC_RETENTION_SECONDS", str(30 * 24 * 60 * 60)))
ADMIN_STEP_UP_SECONDS = int(os.getenv("ADMIN_STEP_UP_SECONDS", "600"))
LOCAL_ADMIN_STEP_UP_BYPASS = os.getenv("LOCAL_ADMIN_STEP_UP_BYPASS", "false").strip().lower() in {"1", "true", "yes", "on"}

if APP_ENV != "local" and LOCAL_ADMIN_STEP_UP_BYPASS:
    raise RuntimeError("LOCAL_ADMIN_STEP_UP_BYPASS is allowed only when APP_ENV=local")
if APP_ENV == "production" and APP_SECRET.startswith("local-development-"):
    raise RuntimeError("Production requires a non-default APP_SECRET")
