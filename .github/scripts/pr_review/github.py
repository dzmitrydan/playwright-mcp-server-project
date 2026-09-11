"""GitHub adapter using the authenticated GitHub CLI."""

from __future__ import annotations

import json
import os
import subprocess
from typing import Any


def _run(args: list[str]) -> dict[str, Any]:
    env = os.environ.copy()
    try:
        result = subprocess.run(["gh", *args], text=True, capture_output=True, check=True, env=env)
        return {"data": json.loads(result.stdout) if result.stdout.strip() else {}}
    except (subprocess.CalledProcessError, OSError, json.JSONDecodeError) as exc:
        return {"error": (getattr(exc, "stderr", None) or str(exc)).strip()}


def _repo() -> str | None:
    result = _run(["repo", "view", "--json", "nameWithOwner"])
    return result.get("data", {}).get("nameWithOwner") if "error" not in result else None


def get_pr_commit_refs(pr_id: int) -> dict[str, Any]:
    if pr_id < 1: return {"error": "invalid pr_id"}
    return _run(["pr", "view", str(pr_id), "--json", "number,headRefName,headRefOid,baseRefName,baseRefOid,url"])


def get_pr_file_changes(pr_id: int) -> dict[str, Any]:
    if pr_id < 1: return {"error": "invalid pr_id"}
    return _run(["pr", "view", str(pr_id), "--json", "files"])


def list_pr_comments(pr_id: int) -> dict[str, Any]:
    if pr_id < 1: return {"error": "invalid pr_id"}
    return _run(["api", f"repos/{_repo()}/pulls/{pr_id}/comments"])


def add_pr_comment(pr_id: int, body: str, path: str | None = None, line: int | None = None) -> dict[str, Any]:
    if pr_id < 1 or not body.strip(): return {"error": "invalid comment"}
    if path and line:
        return _run(["api", "-X", "POST", f"repos/{_repo()}/pulls/{pr_id}/comments", "-f", f"body={body}", "-f", f"commit_id={_head_sha(pr_id)}", "-f", f"path={path}", "-F", f"line={line}"])
    return _run(["pr", "comment", str(pr_id), "--body", body])


def _head_sha(pr_id: int) -> str:
    data = get_pr_commit_refs(pr_id).get("data", {})
    return str(data.get("headRefOid", ""))


def delete_agent_pr_comments(pr_id: int) -> dict[str, Any]:
    comments = list_pr_comments(pr_id)
    if "error" in comments: return comments
    deleted = 0
    for comment in comments.get("data", []):
        if "github-actions" in str(comment.get("user", {}).get("login", "")).lower():
            result = _run(["api", "-X", "DELETE", f"repos/{_repo()}/pulls/comments/{comment['id']}"])
            if "error" not in result: deleted += 1
    return {"deleted": deleted}


def add_pr_label(pr_id: int, label: str = "PR Review Agent") -> dict[str, Any]:
    if pr_id < 1 or not label.strip(): return {"error": "invalid label request"}
    return _run(["pr", "edit", str(pr_id), "--add-label", label])
