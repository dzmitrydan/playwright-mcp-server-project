---
name: pr-review-review
description: "Run a safe GitHub pull-request or branch review."
argument-hint: "review pr <id> [comment] | review current branch | review branch <name>"
---

Delegate to the `pr-review` agent. Never edit source files or create commits.
Without `comment`, save only a review artifact. With `comment`, require an
explicit PR target and post only approved findings.
