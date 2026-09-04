# Project context

This repository contains a TypeScript npm Playwright test project and a standalone Python FastMCP server under `.github/scripts/pr_review/` after alignment.

## Stack

- TypeScript and Playwright
- Python 3.11+, uv, FastMCP for MCP tooling

## Validation

```bash
npm ci
npx playwright test --project=chromium
uv sync --directory .github/scripts/pr_review
```

Agent customizations live under `.github/`. The canonical context is this file; do not duplicate project-wide rules in individual agents.
