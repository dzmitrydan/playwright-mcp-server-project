# CI runner note

Run from the repository root:

```bash
PR_REVIEW_PIPELINE=1 uv run --directory pr-review pr_review/mcp_server.py
```

Authenticate with a short-lived `GITHUB_TOKEN` supplied by the CI secret
manager. Do not write tokens to files. In pipeline context the reviewer must
not prompt for input, and `tag_pr_if_needed` intentionally skips labeling.
