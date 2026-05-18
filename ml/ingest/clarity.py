"""DEPRECATED — Clarity replaced by LogRocket (2026-05-18).

This module is kept for reference only. Do not call it.
Session analytics are now handled by the LogRocket ingest pipeline
(ml/ingest/logrocket.py and ml/ingest/bigquery_logrocket_loader.py).
"""

def extract(*args, **kwargs):
    raise RuntimeError(
        "[clarity] DEPRECATED: Clarity has been replaced by LogRocket. "
        "Use ml/ingest/logrocket.py instead."
    )


if __name__ == "__main__":
    extract()
