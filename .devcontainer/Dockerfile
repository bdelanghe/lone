FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Pin Deno version (change once, everyone gets it)
ARG DENO_VERSION=1.46.3

RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s v${DENO_VERSION} \
  && ln -s /usr/local/bin/deno /usr/bin/deno || true

# Basic utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git nodejs npm \
  && rm -rf /var/lib/apt/lists/*

# AI coding agents (API keys passed at runtime via -e)
RUN npm install -g @anthropic-ai/claude-code @openai/codex
