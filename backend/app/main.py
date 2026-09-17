"""FastAPI application composition, middleware, and global error translation."""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from .api.router import api_router
from .config import APP_ORIGIN

app = FastAPI(title="MAblog API", version="0.1.0")
app.include_router(api_router)

@app.middleware("http")
async def request_security(request: Request, call_next):
    """Require same-origin intent for mutations and prevent browser caching of private data."""
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        if request.headers.get("x-mablog") != "1" or request.headers.get("origin", APP_ORIGIN) != APP_ORIGIN:
            return JSONResponse({"detail": "Invalid request origin"}, status_code=403)
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

@app.exception_handler(ValidationError)
async def invalid_document(request: Request, error: ValidationError):
    """Return a client error for invalid nested composition data."""
    return JSONResponse({"detail": "Invalid document: check block dimensions and content limits"}, status_code=422)

@app.exception_handler(IntegrityError)
async def duplicate_record(request: Request, error: IntegrityError):
    """Translate concurrent uniqueness conflicts into a retryable API response."""
    return JSONResponse({"detail": "This record already exists; refresh and try again"}, status_code=409)


