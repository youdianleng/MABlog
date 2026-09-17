FROM python:3.12-slim AS base
WORKDIR /app
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

FROM base AS test
RUN pip install --no-cache-dir -r requirements-dev.txt
CMD ["python", "-m", "pytest", "tests", "-q"]

FROM base AS runtime
# Schema changes and local account bootstrapping run in Compose's one-shot migrate service.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
