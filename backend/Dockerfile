# Use Python 3.12 slim image as base (matching pyproject.toml requirement)
FROM python:3.12-slim

# Metadata labels for container identification and traceability
LABEL org.opencontainers.image.title="Todo App Backend"
LABEL org.opencontainers.image.description="FastAPI backend for Todo application"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Todo App"
LABEL org.opencontainers.image.source="https://github.com/MuhammadTayyab8/hackathon-todo-application"
LABEL org.opencontainers.image.created="2026-02-01"
LABEL maintainer="MuhammadTayyab8"

# Set working directory
WORKDIR /app

# Install system dependencies required for Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
ENV PATH="/root/.local/bin:$PATH"

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen --no-dev

# Copy application code
COPY src/ /app/src/
COPY alembic.ini /app/

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/.venv/bin:$PATH"

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
