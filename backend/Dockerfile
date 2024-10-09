# Stage 1: Build stage
FROM python:3.11-slim AS builder

# Set environment variables for Poetry
ENV POETRY_HOME=/app/.poetry
ENV PATH="$POETRY_HOME/bin:$PATH"

# Create appuser and app directory
RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser
WORKDIR /app

# Install Poetry
RUN pip install poetry && \
    mkdir -p $POETRY_HOME && \
    chown -R appuser:appuser $POETRY_HOME /app /usr/local/

# Copy pyproject.toml and poetry.lock for dependency installation
COPY --chown=appuser:appuser pyproject.toml poetry.lock* /app/

# Install dependencies in the builder stage
USER appuser
RUN poetry config virtualenvs.create false && \
    poetry install --only main --no-interaction --no-ansi

# Stage 2: Final image
FROM python:3.11-slim

# Create appuser and app directory
RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser
WORKDIR /app

# Set environment variables for Poetry
ENV POETRY_HOME=/app/.poetry
ENV PATH="$POETRY_HOME/bin:$PATH"

# Copy installed dependencies from the builder stage
COPY --from=builder /app /app
COPY --from=builder /usr/local /usr/local

# Copy the rest of the app files
COPY --chown=appuser:appuser ./ /app/

# Expose the port and set the command to run
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
