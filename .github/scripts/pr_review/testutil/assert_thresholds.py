"""Simple structured review-artifact threshold scoring."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def assert_thresholds(artifact_path: str, expected_path: str) -> dict[str, Any]:
    try:
        artifact = Path(artifact_path).read_text(encoding="utf-8")
        expected = json.loads(Path(expected_path).read_text(encoding="utf-8"))
        checks = {str(key): str(value) in artifact for key, value in expected.items()}
        return {"passed": all(checks.values()), "checks": checks}
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        return {"error": str(exc)}
