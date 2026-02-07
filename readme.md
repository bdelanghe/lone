# Beads Worktree Notes

Reference:
- https://github.com/steveyegge/beads/blob/main/docs/WORKTREES.md#fully-separate-beads-repository

## Optional UI Tooling

This project can be used with two companion tools:

- `bdui` (from `beads-ui`): browser UI for Beads
- `bv` (from `beads_viewer`): terminal UI and robot triage commands
- `vscode-beads` (VS Code extension): available via Visual Studio Marketplace,
  which gives it broader and more conventional editor-plugin reach.

### Install

```bash
brew install dicklesworthstone/tap/bv
npm install -g beads-ui --prefix "$HOME/.npm-global"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Usage

Run from any Beads project directory:

```bash
bdui start --open
bv --robot-triage
```
