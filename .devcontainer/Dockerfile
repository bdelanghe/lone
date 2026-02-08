FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Pin Deno version (change once, everyone gets it)
ARG DENO_VERSION=1.46.3

RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s v${DENO_VERSION} \
  && ln -s /usr/local/bin/deno /usr/bin/deno || true

# Basic utilities + beads build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git nodejs npm libicu-dev libzstd-dev \
  && rm -rf /var/lib/apt/lists/*

# Install bd (beads) — detects Linux/arm64 automatically
RUN curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# AI coding agents (API keys passed at runtime via -e)
RUN npm install -g @anthropic-ai/claude-code @openai/codex

# Beads UI
RUN npm install -g beads-ui
