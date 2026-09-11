"""Run an automated pull-request review and write a Markdown artifact."""

from __future__ import annotations

import argparse
import json
import logging
import os
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

LOGGER = logging.getLogger("pr-review-runner")
DEFAULT_BASE_URL = "https://api.openai.com/v1"
DEFAULT_MODEL = "gpt-4o-mini"

REVIEW_INSTRUCTIONS = """You are reviewing a GitHub pull request as a production code reviewer.
Review the complete diff and report only reproducible, actionable issues.
Prioritize bugs, security problems, broken CI, data loss, correctness,
reliability, and meaningful test gaps. Do not report style preferences or
speculative risks. For each finding include severity (HIGH, MEDIUM, or LOW),
file and changed line when available, trigger, impact, evidence, and a concrete
fix. If there are no findings, say so and list residual test gaps.
"""


def run_command(args: list[str]) -> str:
    result = subprocess.run(args, check=True, capture_output=True, text=True)
    return result.stdout


def get_pr_data(pr_number: int) -> dict[str, object]:
    output = run_command(
        [
            "gh",
            "pr",
            "view",
            str(pr_number),
            "--json",
            "number,title,url,baseRefName,headRefName,headRefOid,body",
        ]
    )
    return json.loads(output)


def get_diff(pr_number: int) -> str:
    return run_command(["gh", "pr", "diff", str(pr_number), "--patch"])


def call_review_api(diff: str, pr_data: dict[str, object]) -> str:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured in repository secrets")

    base_url = os.environ.get("OPENAI_BASE_URL", "").strip() or DEFAULT_BASE_URL
    model = os.environ.get("OPENAI_MODEL", "").strip() or DEFAULT_MODEL
    prompt = (
        f"Pull request #{pr_data['number']}: {pr_data['title']}\n"
        f"Base branch: {pr_data['baseRefName']}\n"
        f"Head branch: {pr_data['headRefName']}\n\n"
        f"Diff:\n```diff\n{diff}\n```"
    )
    payload = json.dumps(
        {
            "model": model,
            "temperature": 0.1,
            "messages": [
                {"role": "system", "content": REVIEW_INSTRUCTIONS},
                {"role": "user", "content": prompt},
            ],
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=600) as response:
            result = json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"review API returned HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"review API request failed: {exc.reason}") from exc

    try:
        return str(result["choices"][0]["message"]["content"])
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("review API returned an unexpected response") from exc


def write_report(pr_data: dict[str, object], review: str, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    report_path = output_dir / f"pr-{pr_data['number']}-review.md"
    created_at = datetime.now(timezone.utc).isoformat()
    report_path.write_text(
        f"# Pull Request Review\n\n"
        f"- PR: [{pr_data['title']}]({pr_data['url']})\n"
        f"- Head SHA: `{pr_data['headRefOid']}`\n"
        f"- Created: `{created_at}`\n\n"
        f"{review.strip()}\n",
        encoding="utf-8",
    )
    return report_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pr", type=int, required=True)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    if args.pr < 1:
        LOGGER.error("PR number must be positive")
        return 2

    try:
        LOGGER.info("review started for PR #%s", args.pr)
        pr_data = get_pr_data(args.pr)
        diff = get_diff(args.pr)
        if not diff.strip():
            raise RuntimeError("pull request diff is empty")
        review = call_review_api(diff, pr_data)
        output_dir = Path(os.environ.get("PR_REVIEW_OUTPUT_DIR", ".github/pr-review-output"))
        report_path = write_report(pr_data, review, output_dir)
        LOGGER.info("review completed: %s", report_path)
    except (OSError, RuntimeError, subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        LOGGER.error("review failed: %s", exc)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
