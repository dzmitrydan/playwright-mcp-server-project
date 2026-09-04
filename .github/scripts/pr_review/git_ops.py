"""Safe, read-only Git operations."""

from __future__ import annotations

import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from config import get_repo_root

_REF_RE = re.compile(r"^[A-Za-z0-9._/@+:-]{1,200}$")
_SHA_RE = re.compile(r"^[0-9a-fA-F]{7,64}$")


def _run(args: list[str]) -> dict[str, Any]:
    try:
        result = subprocess.run(args, cwd=get_repo_root(), text=True, capture_output=True, check=True)
        return {"output": result.stdout.strip()}
    except (subprocess.CalledProcessError, OSError) as exc:
        detail = getattr(exc, "stderr", None) or str(exc)
        return {"error": str(detail).strip()}


def _valid(value: str, sha: bool = False) -> bool:
    return bool(( _SHA_RE if sha else _REF_RE).fullmatch(value)) and ".." not in value and "~" not in value and "^" not in value


def git_fetch() -> dict[str, Any]:
    return _run(["git", "fetch", "origin"])


def git_diff(target: str, source: str) -> dict[str, Any]:
    if not _valid(target) or not _valid(source): return {"error": "invalid Git ref"}
    result = _run(["git", "diff", "--no-ext-diff", f"{target}...{source}"])
    if "error" in result: return result
    handle = tempfile.NamedTemporaryFile(prefix="pr-review-", suffix=".diff", delete=False, mode="w", encoding="utf-8")
    Path(handle.name).write_text(result["output"], encoding="utf-8")
    handle.close()
    return {"path": handle.name, "size_bytes": Path(handle.name).stat().st_size}


def git_diff_names(target: str, source: str) -> dict[str, Any]:
    if not _valid(target) or not _valid(source): return {"error": "invalid Git ref"}
    result = _run(["git", "diff", "--name-status", f"{target}...{source}"])
    return {"files": result["output"].splitlines()} if "output" in result else result


def git_merge_base(sha1: str, sha2: str) -> dict[str, Any]:
    if not _valid(sha1, True) or not _valid(sha2, True): return {"error": "invalid commit SHA"}
    result = _run(["git", "merge-base", sha1, sha2])
    return {"sha": result["output"]} if "output" in result else result


def git_current_branch() -> dict[str, Any]:
    result = _run(["git", "branch", "--show-current"])
    return {"branch": result.get("output", "")} if "error" not in result else result


def git_head_sha() -> dict[str, Any]:
    result = _run(["git", "rev-parse", "HEAD"])
    return {"sha": result["output"]} if "output" in result else result


def git_resolve_ref(ref: str) -> dict[str, Any]:
    if not _valid(ref): return {"error": "invalid Git ref"}
    result = _run(["git", "rev-parse", "--verify", f"{ref}^{{commit}}"])
    return {"sha": result["output"]} if "output" in result else result
