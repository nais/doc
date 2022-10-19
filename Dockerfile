FROM library/python:3.11.0rc2-slim as builder
# Inspired by: https://medium.com/@harpalsahota/dockerizing-python-poetry-applications-1aa3acb76287

RUN useradd mkdocs \
    --shell /bin/bash \
    --create-home
RUN pip3 install --upgrade pip
RUN pip3 --no-input install \
    --no-cache-dir \
    poetry

USER mkdocs
WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN poetry install


ARG PORT=8080
ENV PORT=$PORT
EXPOSE "$PORT"
CMD poetry run mkdocs serve \
    --config-file mkdocs.yml \
    --dev-addr "127.0.0.1:$PORT"
