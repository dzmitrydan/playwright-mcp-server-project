"""Review artifact persistence with traversal protection."""

from __future__ import annotations

import re
import shutil
from pathlib import Path
from typing import Any

from config import get_artifact_dir, safe_artifact_path


def clean_review_working_directory() -> dict[str, Any]:
    root = get_artifact_dir().parent
    deleted = 0
    try:
        for path in root.iterdir():
            if path.is_dir() and not path.is_symlink():
                shutil.rmtree(path)
            else:
                path.unlink()
            deleted += 1
        return {"deleted": deleted, "path": str(root)}
    except OSError as exc:
        return {"error": str(exc), "path": str(root), "deleted": deleted}


def save_review_artifact(pr_id: int | None = None, branch: str | None = None, content: str = "", suffix: str = "review") -> dict[str, Any]:
    if pr_id is None and not branch: return {"error": "pr_id or branch is required"}
    if pr_id is not None and pr_id < 1: return {"error": "invalid pr_id"}
    if not content.lstrip().lower().startswith("<!doctype html>"): return {"error": "content must be a complete HTML report"}
    token = str(pr_id) if pr_id is not None else re.sub(r"[^A-Za-z0-9_.-]+", "-", branch or "branch").strip("-")
    prefix = "PRREVIEW-" if pr_id is not None else "BRANCHREVIEW-"
    clean_suffix = re.sub(r"[^A-Za-z0-9_.-]+", "-", suffix).strip("-") or "review"
    filename = f"{prefix}{token}-{clean_suffix}.html"
    try:
        path = safe_artifact_path(filename)
        path.write_text(content, encoding="utf-8")
        return {"path": str(path), "filename": filename, "size_bytes": path.stat().st_size}
    except (OSError, ValueError) as exc:
        return {"error": str(exc)}


def delete_pr_artifacts(pr_id: int) -> dict[str, Any]:
    if pr_id < 1: return {"error": "invalid pr_id"}
    prefix = f"PRREVIEW-{pr_id}-"
    deleted = 0
    for path in get_artifact_dir().glob(f"{prefix}*.html"):
        if path.is_file(): path.unlink(); deleted += 1
    return {"deleted": deleted}
