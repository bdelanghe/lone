FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Pin Deno version (change once, everyone gets it)
ARG DENO_VERSION=1.46.3

RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s v${DENO_VERSION} \
  && ln -s /usr/local/bin/deno /usr/bin/deno || true

# Optional: basic utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git \
  && rm -rf /var/lib/apt/lists/*
