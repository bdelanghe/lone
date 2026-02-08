#!/usr/bin/env bash
set -euo pipefail

cd /workspace

# XDG base dirs (also set via compose env, but ensure directories exist).
: "${XDG_CONFIG_HOME:=$HOME/.config}"
: "${XDG_CACHE_HOME:=$HOME/.cache}"
: "${XDG_DATA_HOME:=$HOME/.local/share}"
: "${XDG_STATE_HOME:=$HOME/.local/state}"

mkdir -p "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME" "$XDG_DATA_HOME" "$XDG_STATE_HOME" "$XDG_CONFIG_HOME/gh"

# Fail-closed: if a persisted home volume contains broken Nix/Home Manager symlinks, error loudly.
for f in "$XDG_CONFIG_HOME/gh/config.yml" "$XDG_CONFIG_HOME/gh/hosts.yml"; do
  if [ -L "$f" ] && [ ! -e "$f" ]; then
    echo "ERROR: $f is a broken symlink. Remove it from the devcontainer home volume and retry." >&2
    exit 1
  fi
done

# Git identity for commits (Git uses user.name/user.email as default author+committer).
if [ -n "${GIT_AUTHOR_NAME:-}" ]; then
  git config --global user.name "$GIT_AUTHOR_NAME"
fi
if [ -n "${GIT_AUTHOR_EMAIL:-}" ]; then
  git config --global user.email "$GIT_AUTHOR_EMAIL"
fi

# Git ergonomics
# Automatically set upstream (origin/<branch>) on first push for branches without tracking.
git config --global push.autoSetupRemote true

# Beads UI
bdui start --host 0.0.0.0 --port 3000 >> "$XDG_CACHE_HOME/bdui.log" 2>&1
