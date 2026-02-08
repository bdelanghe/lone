FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Pin Deno version (change once, everyone gets it)
ARG DENO_VERSION=1.46.3

RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s v${DENO_VERSION} \
  && ln -s /usr/local/bin/deno /usr/bin/deno || true

# Basic utilities + beads build deps
#
# Install Node.js (via NodeSource apt repo) so global npm tools can require modern engines.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git gnupg libicu-dev libzstd-dev \
  && install -d -m 0755 /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

# GitHub CLI (gh)
RUN install -d -m 0755 /etc/apt/keyrings \
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    > /etc/apt/sources.list.d/github-cli.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends gh \
  && rm -rf /var/lib/apt/lists/*

# Install bd (beads) — detects Linux/arm64 automatically
RUN curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# AI coding agents (API keys passed at runtime via -e)
#
# The Claude installer sets up a per-user launcher under ~/.local/bin.
# During image build this runs as root, so we copy the launcher into
# /usr/local/bin to ensure it's on PATH for the devcontainer user.
RUN export PATH="/root/.local/bin:$PATH" \
  && curl -fsSL https://claude.ai/install.sh | bash \
  && if [ -x /root/.local/bin/claude ]; then install -m 0755 /root/.local/bin/claude /usr/local/bin/claude; fi
RUN npm install -g @openai/codex

# Trust the bind-mounted workspace (host UID may differ from container user)
RUN git config --system --add safe.directory /workspace

# Beads UI
RUN npm install -g beads-ui
