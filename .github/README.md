# Copilot agent architecture

`AGENTS.md` is the canonical repository context. Agents are flat files in
`.github/agents/`; deterministic path rules belong in `.github/instructions/`;
reusable capabilities belong in `.github/skills/`; private material belongs in
`.github/resources/`; and ephemeral data belongs in `.github/memory/temp/`.

MCP servers are under `.github/scripts/pr_review/` and are registered in both `.vscode/mcp.json`
(VS Code) and `.mcp.json` (Copilot CLI). Claude and Gemini mirrors are intentionally
not enabled in this repository.
