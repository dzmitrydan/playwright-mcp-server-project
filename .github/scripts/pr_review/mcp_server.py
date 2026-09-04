"""Thin FastMCP entry point for GitHub PR review.

Tools: get_pr_commit_refs, get_pr_file_changes, git_fetch, git_diff,
git_diff_names, git_merge_base, git_current_branch, git_head_sha,
git_resolve_ref, save_review_artifact, clean_review_working_directory,
tag_pr_if_needed,
delete_agent_pr_comments, delete_pr_artifacts, assert_thresholds.
Additional GitHub comment tools: list_pr_comments and add_pr_comment.
"""

from __future__ import annotations

import sys
from pathlib import Path

_PACKAGE_DIR = Path(__file__).resolve().parent
if str(_PACKAGE_DIR) not in sys.path:
    sys.path.insert(0, str(_PACKAGE_DIR))

try:
    from mcp.server.fastmcp import Context, FastMCP
    from mcp.types import ToolAnnotations
    import logging_util as log
    from artifact_ops import (
        clean_review_working_directory as _clean_review_working_directory,
        save_review_artifact as _save_review_artifact,
    )
    from github import (
        add_pr_comment as _add_pr_comment,
        get_pr_commit_refs as _get_pr_commit_refs,
        get_pr_file_changes as _get_pr_file_changes,
        list_pr_comments as _list_pr_comments,
    )
    from git_ops import (
        git_current_branch as _git_current_branch,
        git_diff as _git_diff,
        git_diff_names as _git_diff_names,
        git_fetch as _git_fetch,
        git_head_sha as _git_head_sha,
        git_merge_base as _git_merge_base,
        git_resolve_ref as _git_resolve_ref,
    )
    from tag_pr import tag_pr_if_needed as _tag_pr_if_needed
    from testutil.ado_thread_cleanup import delete_agent_pr_comments as _delete_agent_pr_comments
    from testutil.artifact_cleanup import delete_pr_artifacts as _delete_pr_artifacts
    from testutil.assert_thresholds import assert_thresholds as _assert_thresholds
except Exception as exc:
    print(
        "FATAL: unable to import pr-review MCP server dependencies. "
        "Run `uv sync` in the pr-review directory and verify Python 3.11+.",
        file=sys.stderr,
    )
    print(f"FATAL detail: {exc}", file=sys.stderr)
    raise SystemExit(1) from exc

log.setup("pr-review")
mcp = FastMCP("pr-review")

_startup_cleanup = _clean_review_working_directory()
if "error" in _startup_cleanup:
    print(f"FATAL: unable to clean pr-review working directory: {_startup_cleanup['error']}", file=sys.stderr)
    raise SystemExit(1)

_READ = ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=True)
_WRITE = ToolAnnotations(readOnlyHint=False, destructiveHint=False, idempotentHint=True, openWorldHint=True)
_DESTRUCTIVE = ToolAnnotations(readOnlyHint=False, destructiveHint=True, idempotentHint=True, openWorldHint=True)


@mcp.tool("get_pr_commit_refs", annotations=_READ)
@log.timed
async def get_pr_commit_refs(ctx: Context, pr_id: int) -> dict:
    return _get_pr_commit_refs(pr_id)


@mcp.tool("get_pr_file_changes", annotations=_READ)
@log.timed
async def get_pr_file_changes(ctx: Context, pr_id: int) -> dict:
    return _get_pr_file_changes(pr_id)


@mcp.tool("git_fetch", annotations=_WRITE)
@log.timed
async def git_fetch(ctx: Context) -> dict:
    return _git_fetch()


@mcp.tool("git_diff", annotations=_READ)
@log.timed
async def git_diff(ctx: Context, target: str, source: str) -> dict:
    return _git_diff(target, source)


@mcp.tool("git_diff_names", annotations=_READ)
@log.timed
async def git_diff_names(ctx: Context, target: str, source: str) -> dict:
    return _git_diff_names(target, source)


@mcp.tool("git_merge_base", annotations=_READ)
@log.timed
async def git_merge_base(ctx: Context, sha1: str, sha2: str) -> dict:
    return _git_merge_base(sha1, sha2)


@mcp.tool("git_current_branch", annotations=_READ)
@log.timed
async def git_current_branch(ctx: Context) -> dict:
    return _git_current_branch()


@mcp.tool("git_head_sha", annotations=_READ)
@log.timed
async def git_head_sha(ctx: Context) -> dict:
    return _git_head_sha()


@mcp.tool("git_resolve_ref", annotations=_READ)
@log.timed
async def git_resolve_ref(ctx: Context, ref: str) -> dict:
    return _git_resolve_ref(ref)


@mcp.tool("save_review_artifact", annotations=_WRITE)
@log.timed
async def save_review_artifact(ctx: Context, content: str, pr_id: int | None = None, branch: str | None = None, suffix: str = "review") -> dict:
    return _save_review_artifact(pr_id=pr_id, branch=branch, content=content, suffix=suffix)


@mcp.tool("clean_review_working_directory", annotations=_DESTRUCTIVE)
@log.timed
async def clean_review_working_directory(ctx: Context) -> dict:
    return _clean_review_working_directory()


@mcp.tool("tag_pr_if_needed", annotations=_WRITE)
@log.timed
async def tag_pr_if_needed(ctx: Context, pr_id: int, has_comments: bool = True) -> dict:
    return _tag_pr_if_needed(pr_id, has_comments)


@mcp.tool("delete_agent_pr_comments", annotations=_DESTRUCTIVE)
@log.timed
async def delete_agent_pr_comments(ctx: Context, pr_id: int) -> dict:
    return _delete_agent_pr_comments(pr_id)


@mcp.tool("delete_pr_artifacts", annotations=_DESTRUCTIVE)
@log.timed
async def delete_pr_artifacts(ctx: Context, pr_id: int) -> dict:
    return _delete_pr_artifacts(pr_id)


@mcp.tool("assert_thresholds", annotations=_READ)
@log.timed
async def assert_thresholds(ctx: Context, artifact_path: str, expected_path: str) -> dict:
    return _assert_thresholds(artifact_path, expected_path)


@mcp.tool("list_pr_comments", annotations=_READ)
@log.timed
async def list_pr_comments(ctx: Context, pr_id: int) -> dict:
    return _list_pr_comments(pr_id)


@mcp.tool("add_pr_comment", annotations=_WRITE)
@log.timed
async def add_pr_comment(ctx: Context, pr_id: int, body: str, path: str | None = None, line: int | None = None) -> dict:
    return _add_pr_comment(pr_id, body, path, line)


if __name__ == "__main__":
    mcp.run()
