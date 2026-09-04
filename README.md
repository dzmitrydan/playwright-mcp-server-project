# Playwright MCP Server Project

## Description

### 1. Playwright MCP Server

### 2. Playwright Test Agents
- planner
- generator
- healer

### 3. Data-driven approach
- JSON
- CSV
- EXCEL

### 4. PowerShell Tests

PowerShell script + CSV/Excel + Playwright

Data Driven Testing
Test data (CSV / Excel)
↓
Script execution
↓
Validation
↓
Report

Excel → PowerShell → Playwright → HTML Report → CI

The project also contains TypeScript UI tests, custom GitHub Copilot agents,
and a separate Python MCP server for safe GitHub pull-request and local-branch
reviews.

## Project Contents

### Playwright tests

- `pages/` — Page Object Model.
	- `pages/computeEngine/` — Google Cloud Pricing Calculator, Compute Engine,
	  delete-dialog and Share Estimate page objects.
	- `pages/saucedemo/` — login, products, cart and checkout page objects for
	  SauceDemo.
- `tests/` — Playwright tests:
	- `google-cloud-calculator.spec.ts` — calculator scenarios;
	- `google-cloud-calculator-estimate-cost.spec.ts` — cost calculation and
	  verification;
	- `saucedemo-login.spec.ts` — authentication;
	- `saucedemo-order-flow.spec.ts` — order checkout;
	- `saucedemo-sorting.spec.ts` — product sorting;
	- `seed.spec.ts` — test template;
	- `test-1.spec.ts` — experimental test.
- `specs/` — Google Cloud Calculator and Compute Engine test plans.
- `test-data/` — JSON and CSV data for data-driven tests.
- `utils/` — JSON, CSV and Excel readers plus cost-estimate helpers.
- `playwright.config.ts` — Chromium, Firefox and WebKit configuration, HTML/list
  reporters, and trace/video/screenshot capture on failure.

### Agent customization

- `.github/agents/` — custom Copilot agents.
- `.github/prompts/pr_review/` — prompts for launching the PR-review workflow.
- `.github/skills/` — on-demand skills, including PR review.
- `.github/instructions/` — file instructions for the Python MCP server.
- `.github/copilot-instructions.md` — rule to read the root `AGENTS.md`.
- `.github/workflows/` — CI configuration.

### PR review MCP server

- `.github/scripts/pr_review/mcp_server.py` — FastMCP server entry point.
- `.github/scripts/pr_review/` — GitHub API, Git, review artifacts, labeling and
	maintenance tools.
- `.github/scripts/pr_review/pyproject.toml` — Python 3.11+ and
	`mcp[cli]>=1.26.0,<2` dependency.

The server provides 17 MCP tools:

- PR: `get_pr_commit_refs`, `get_pr_file_changes`, `list_pr_comments`,
	`add_pr_comment`;
- Git: `git_fetch`, `git_diff`, `git_diff_names`, `git_merge_base`,
	`git_current_branch`, `git_head_sha`, `git_resolve_ref`;
- review results: `save_review_artifact`, `tag_pr_if_needed`;
- maintenance: `delete_agent_pr_comments`, `delete_pr_artifacts`,
	`assert_thresholds`.

## Custom agents

All agents are located in `.github/agents/`. The `user-invocable: true` field
means that an agent can be launched directly from Copilot. Agents with
`user-invocable: false` are internal steps of other workflows.

### Playwright test planning and generation

#### `playwright-test-planner`

File: `.github/agents/playwright-test-planner.agent.md`

The planner explores a web application in a browser and creates a detailed
Markdown test plan. It must call `planner_setup_page`, inspect the interface
with snapshots and browser actions, cover happy paths, edge cases, validation
and error handling, and save the plan with `planner_save_plan`.

Input: web application, URL and coverage requirements. Output: Markdown test plan.

#### `playwright-test-generator`

File: `.github/agents/playwright-test-generator.agent.md`

The generator turns a scenario from a test plan into a Playwright TypeScript
test. It receives the plan, seed file and scenario, calls
`generator_setup_page`, performs the steps with browser tools, reads
`generator_read_log`, writes the result with `generator_write_test` to `tests/`,
and runs the test until it passes.

Tests must use `@playwright/test`, POM, stable locators and comments containing
the step text. Page Objects belong in `pages/`, and utilities belong in `utils/`.

#### `generate-test`

File: `.github/agents/generate-test.agent.md`

Minimal Playwright test generator based on a scenario. It requires step-by-step
execution through Playwright MCP, saves the result to `tests/`, runs it and
repeats fixes until it passes. It is a simplified version of
`playwright-test-generator` with less detailed POM and tool requirements.

#### `generate-po-test`

File: `.github/agents/generate-po-test.agent.md`

Test generator with a required Page Object Model: POM classes are created in
`pages/`, tests in `tests/`, and shared utilities in `utils/`. Locators and
interactions belong in POMs, while assertions belong in tests. The agent runs
the scenario through MCP, executes `npx playwright test --headed`, and repeats
the cycle until it passes. Its functionality substantially overlaps with
`generate-test`.

#### `generate-google-cloud-calculator`

File: `.github/agents/generate-google-cloud-calculator.agent.md`

Specialized generator for Google Cloud Cost Calculator scenarios. It additionally
requires `acceptDownloads: true`, the Playwright Download API, saving downloads
to the test directory, event/locator-based waiting instead of hard waits, and a
clean browser context for each test.

Input: calculator scenario. Output: POM, TypeScript test and verified execution.

### Test healing

#### `playwright-test-healer`

File: `.github/agents/playwright-test-healer.agent.md`

Diagnoses and fixes failing Playwright tests. The agent runs tests, debugs each
failure, analyzes snapshots, console/network output and locators, then fixes
selectors, assertions, synchronization and test isolation. It reruns the test
after every fix. If the issue cannot be resolved reliably, it may add
`test.fixme()` with an explanation. It must not use `networkidle`, hard waits or
deprecated APIs.

### Code review

#### `pr-review`

File: `.github/agents/pr-review.agent.md`

Primary agent for safe reviews of GitHub PRs and local branches. It analyzes and
reports, but does not edit source files or create commits.

Supported modes are `review pr <id>`, `review pr <id> comment`,
`review current branch` and `review branch <name>`. Without `comment`, the
agent saves an HTML artifact based on the review report template through
`save_review_artifact`. The `Assumptions and validation` and `Summary` body text
uses the same 14px size as finding descriptions. In comment mode,
it hands findings to `pr-review-commenter` and may then call
`tag_pr_if_needed`. CI uses `PR_REVIEW_PIPELINE=1`: the agent does not prompt,
publishes the artifact and exits.

In simple terms, a **finding** is a review comment about a problem in the code.
It includes the severity, file, line, code snippet, explanation and suggested
fix.

`pr-review` always does the review. It creates the findings and puts them in a
local HTML report. With `review pr <id>`, the findings stay in that local report
and are not posted to GitHub.

To post approved findings to a GitHub pull request, use:

```text
review pr <id> comment
```

In this mode, `pr-review` passes the approved findings to
`pr-review-commenter`. The commenter posts inline comments on the changed files
and adds a summary comment to the pull request. `pr-review-commenter` is an
internal agent (`user-invocable: false`), so it is not started directly and does
not run automatically after a commit. You can run the review manually at any
time while the pull request exists.

#### `pr-review-commenter`

File: `.github/agents/pr-review-commenter.agent.md`

Internal agent for publishing PR review results. It receives only findings
explicitly approved by `pr-review` and posts inline comments and a summary
through GitHub tools. It does not edit source files, create commits, delete
comments or use maintenance tools. `user-invocable: false`.

## MCP configuration

Configurations are stored in `.vscode/mcp.json` for VS Code and `.mcp.json` for
Copilot CLI. Three stdio servers are registered:

| Server | Command | Purpose |
| --- | --- | --- |
| `playwright` | `npx @playwright/mcp@latest` | General browser automation: open pages, click elements, fill forms, inspect snapshots and take screenshots. |
| `playwright-test` | `npx playwright run-test-mcp-server` | Playwright Test workflows: create and run tests, generate locators and work with test tooling. |
| `pr-review` | `.github/scripts/pr_review/.venv/bin/python mcp_server.py` | Review GitHub pull requests and local branches through the Python FastMCP server. |

The two Playwright servers are intentional. Use `playwright` for general
browser interaction and `playwright-test` for test generation and execution.
Removing `playwright-test` will disable agents that depend on Playwright Test
tools.

### `playwright`

It runs with `npx @playwright/mcp@latest` and provides browser/MCP tools for
working with web pages.

### `pr-review`

It runs with:

```bash
.github/scripts/pr_review/.venv/bin/python .github/scripts/pr_review/mcp_server.py
```

This requires `uv`, Python 3.11+, Git and an authenticated GitHub CLI (`gh`), or
`GITHUB_TOKEN` in CI. Tokens are not passed as MCP tool arguments or stored in
the repository.

Important: Playwright agents refer to an MCP server named `playwright-test` and
the command `npx playwright run-test-mcp-server`, while the current configuration
registers `playwright` with `@playwright/mcp@latest`. These are different tool
surfaces, so planner/generator/healer may require server-name and tool alignment.

## Installation

```bash
npm ci
npx playwright install chromium --with-deps
uv sync --directory .github/scripts/pr_review
```

For all configured browser projects, also install Firefox and WebKit:

```bash
npx playwright install firefox webkit
```

## GitHub CLI Installation and Authentication

PR reviews require an installed and authenticated GitHub CLI (`gh`).

### Ubuntu/Debian

Install GitHub CLI:

```bash
type -p curl >/dev/null || sudo apt update && sudo apt install curl -y
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg |
	sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" |
	sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
sudo apt update
sudo apt install gh -y
```

### Windows

In PowerShell, install GitHub CLI using one of the following methods:

```powershell
winget install --id GitHub.cli
```

Or, if you use Chocolatey:

```powershell
choco install gh
```

### Verify Installation and Authenticate

Verify the installation and start authentication:

```bash
gh --version
gh auth login
```

In the authentication menu, select:

1. `GitHub.com`
2. `HTTPS`
3. `Login with a web browser`

The CLI will display a one-time code and open a GitHub page. Enter the code in
the browser and confirm access for GitHub CLI.

It is normal for GitHub to display the message:
`Enter the code displayed in the app or on the device you're signing in to.`

Return to the terminal where `gh auth login` is running and find a line such as:

```text
First copy your one-time code: ABCD-1234
```

Copy this code, paste it into the browser field `Enter the code displayed...`,
and click `Continue`. Use the code from your own terminal, not a code sent by
someone else.

After completing the process, verify authentication:

```bash
gh auth status
```

You should see a message confirming that you are logged in to GitHub as your
user.

## Running Playwright tests

```bash
npx playwright test --project=chromium
npx playwright test --headed
npx playwright test tests/saucedemo-sorting.spec.ts --headed --project=chromium
npx playwright show-report
npx playwright show-report --port 8997
```

To generate browser actions with Codegen:

```bash
npx playwright codegen tests/google-cloud-calculator-estimate-cost.spec.ts --headed --debug
```

## Running the PR review MCP server

From the repository root:

```bash
uv sync --directory .github/scripts/pr_review
.github/scripts/pr_review/.venv/bin/python .github/scripts/pr_review/mcp_server.py
```

Or from the Python server directory:

```bash
cd .github/scripts/pr_review
uv sync
./.venv/bin/python mcp_server.py
```

The server uses stdio, so no terminal output on successful startup is expected:
messages are exchanged through the MCP client's stdin/stdout.

## Validation and known limitations

- `package.json` has no npm scripts, so commands are run directly through `npx`.
- The original description mentions PowerShell tests, but no PowerShell scripts
	exist in the current tree.
- Test plans may refer to test directories that are not present in the current
	tree; verify paths before running them.
- Make sure every file required by tests is present in `test-data/` before running
	the full suite.
- The Python server instruction is located at
	`.github/instructions/agents/pr-review.instructions.md`, but its `applyTo`
	pattern uses `pr-review` while the code directory is `pr_review`. The
	instruction may therefore not be applied automatically.
- `generate-test` and `generate-po-test` duplicate each other.

## CI

The current workflow is `.github/workflows/copilot-setup-steps.yml`. Before
making checks mandatory, verify its trigger, installed browser set and the
availability of all npm/Python dependencies in CI.

### Automatic PR comments

The PR review workflow currently analyzes the pull request and uploads the
review as an artifact. It does not publish comments to the pull request.

To enable automatic comments:

1. In the workflow, replace:

	```yaml
	pull-requests: read
	```

	with:

	```yaml
	pull-requests: write
	```

2. In `.github/scripts/pr_review/review_runner.py`, publish the review report
	with:

	```bash
	gh pr comment <number> --body-file <report>
	```

For safer automation, publish a comment only when the review contains a HIGH
or MEDIUM finding. Until these changes are enabled, the workflow remains in
artifact-only mode: it analyzes the pull request and stores the report without
writing comments.
