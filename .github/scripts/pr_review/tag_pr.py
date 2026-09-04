"""Conditional GitHub PR labeling."""

from __future__ import annotations

import os
from typing import Any

from github import add_pr_label


def tag_pr_if_needed(pr_id: int, has_comments: bool = True) -> dict[str, Any]:
    if os.getenv("CI") or os.getenv("PR_REVIEW_PIPELINE") == "1":
        return {"skipped": True, "reason": "pipeline context"}
    if not has_comments:
        return {"skipped": True, "reason": "no review comments"}
    return add_pr_label(pr_id)
