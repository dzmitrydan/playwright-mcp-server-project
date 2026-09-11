---
applyTo: ".github/scripts/pr_review/**/*.py"
paths:
  - ".github/scripts/pr_review/**/*.py"
description: "Rules for developing the pr-review Python MCP server."
---

- Every MCP tool must use `@log.timed` below `@mcp.tool(...)`.
- Use Context-aware lifecycle logging: `→` on entry, `✓` on success, `✗` on failure.
- A returned `{"error": ...}` is a failure and must not be raised for user errors.
- Use logger spans for multi-step operations.
- After editing server Python, run the import/tool-list smoke test.
- Ask the user to restart the MCP server whenever the tool surface changes.
- Never put GitHub tokens in arguments, source, or committed configuration.
- Keep Group-B maintenance tools out of reviewer and commenter agent tool lists.
