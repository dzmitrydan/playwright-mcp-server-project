# pr-review MCP server

Standalone FastMCP server for GitHub pull-request and local branch reviews.
It provides safe read-only Git operations, GitHub PR metadata/comments/labels,
review artifacts, and test-maintenance tools.

## Requirements

- Python 3.11+
- `uv`
- Git
- GitHub CLI (`gh`) authenticated with `gh auth login`, or `GITHUB_TOKEN` in CI

No token is stored in this project or accepted as an MCP tool argument.
The repository owner and name are read from the current Git remote.

## Run

```bash
uv sync
uv run pr_review/mcp_server.py
```

The server is registered for VS Code and Copilot CLI. Review agents support:
`review pr <id> [comment]`, `review current branch`, and `review branch <name>`.
Without `comment`, only a local HTML artifact is written using
`.github/resources/pr-review/review-report.template.html`.

## Automatic PR comments

The GitHub Actions workflow currently runs the review and uploads the result as
an artifact. It does not publish comments to the pull request.

Comments can be enabled by making both changes below:

1. Grant the workflow permission to write pull-request comments:

	```yaml
	permissions:
	  contents: read
	  pull-requests: write
	```

2. Update `review_runner.py` to publish the report with GitHub CLI:

	```bash
	gh pr comment <number> --body-file <report>
	```

For safer automation, publish a comment only when the review contains a HIGH
or MEDIUM finding. Until these changes are enabled, the workflow remains in
artifact-only mode: it analyzes the pull request and stores the report without
writing comments.

The server clears its isolated `PR_REVIEW_WORKING_DIR` on startup. The same
operation is available as the destructive MCP tool
`clean_review_working_directory`.
