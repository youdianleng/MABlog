FROM python:3.12-slim AS base
# Unbuffered output keeps worker logs visible in `docker compose logs` without delay.
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

FROM base AS test
RUN pip install --no-cache-dir -r requirements-dev.txt
CMD ["python", "-m", "pytest", "tests", "-q"]

FROM base AS runtime
# Fixed UID/GID 10001 so Compose's one-shot migrate service can chown existing upload volumes to it.
RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --no-create-home app \
    && mkdir -p /data/uploads \
    && chown app:app /data/uploads
USER app
# Schema changes and local account bootstrapping run in Compose's one-shot migrate service.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
