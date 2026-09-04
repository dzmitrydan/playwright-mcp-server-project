"""Repository and artifact path configuration."""

from __future__ import annotations

import os
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parent
REPO_ROOT = SERVER_DIR.parents[2]


def get_repo_root() -> Path:
    """Return the Git repository root containing this server."""
    candidate = Path(os.environ.get("PR_REVIEW_REPO_ROOT", REPO_ROOT)).resolve()
    return candidate


def get_working_dir() -> Path:
    """Return the isolated server working directory."""
    path = Path(os.environ.get("PR_REVIEW_WORKING_DIR", REPO_ROOT / ".github/memory/temp/pr-review"))
    path = path.resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_artifact_dir() -> Path:
    path = (get_working_dir() / "artifacts").resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


def safe_artifact_path(filename: str) -> Path:
    """Resolve a filename and reject traversal outside the artifact directory."""
    root = get_artifact_dir()
    target = (root / filename).resolve()
    if os.path.commonpath((str(root), str(target))) != str(root):
        raise ValueError("artifact path escapes the working directory")
    return target
