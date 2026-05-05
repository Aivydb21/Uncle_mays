"""Shared helpers for every ingest module.

Each ingest script writes a parquet to ml/data/raw/<source>_<utc-isoformat>.parquet.
Hashing utilities deidentify emails before they cross the data/raw → data/interim
boundary (raw still holds plain emails so we can re-join across sources).
"""

from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = ROOT / "data" / "raw"
DATA_INTERIM = ROOT / "data" / "interim"
DATA_PROCESSED = ROOT / "data" / "processed"

for d in (DATA_RAW, DATA_INTERIM, DATA_PROCESSED):
    d.mkdir(parents=True, exist_ok=True)


def load_dotenv_if_present() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv

        load_dotenv(env_path)
    except ImportError:
        pass


def load_json_config(env_var: str, default_path: str) -> dict[str, Any]:
    """Load a service config file. Override path via env var."""
    raw_path = os.environ.get(env_var) or default_path
    p = Path(os.path.expanduser(raw_path))
    if not p.exists():
        raise FileNotFoundError(
            f"Config file not found: {p}. Set {env_var} or create the file."
        )
    return json.loads(p.read_text())


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def raw_path(source: str, suffix: str = "parquet") -> Path:
    return DATA_RAW / f"{source}_{utc_now_iso()}.{suffix}"


def latest_raw(source: str, suffix: str = "parquet") -> Path | None:
    matches = sorted(DATA_RAW.glob(f"{source}_*.{suffix}"))
    return matches[-1] if matches else None


def hash_email(email: str | None) -> str | None:
    if not email:
        return None
    norm = email.strip().lower()
    if not norm:
        return None
    return hashlib.sha256(norm.encode()).hexdigest()[:24]


def parse_iso(s: str | None) -> datetime | None:
    if not s:
        return None
    s = s.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None
