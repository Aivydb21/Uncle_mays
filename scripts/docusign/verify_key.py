"""One-off: confirm the saved private key parses and matches the public key
DocuSign showed for keypair 36fa94cc."""
import os
from cryptography.hazmat.primitives import serialization

EXPECTED_PUB = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvLbstqvDt1cqgqeCPu0v
Gc+C6+QalfC9G6eitkSJdJcGqEeNS+RXh4rBzkLzfSlSahGnMOdzjPJmN/nzJ/SW
S71Y506rC/Db8cIihWZFOCMJjUZ+B9wDm5wT/ebWUt578yw54K4c7SmDisNUjMBg
LLk7oELcRLconQPXxDQUdSYJnH5YHJ/oEjhyEkXJjfZRkZ7kIhnW9XQtP9aP9j6t
oVfRxhR4KeL7Hu/Vh0EeZv+F+1q2T+XhskDeplr2O2UGtaU2HwT5ZINvO53o2frD
7OvlZ1emojyoUWV5cpl6oFxPThlSS7atVs7J97harSgZCKFAfI4xPpa6nAHlapca
HwIDAQAB
-----END PUBLIC KEY-----"""

path = os.path.expanduser("~/.claude/docusign-private.key")
with open(path, "rb") as f:
    raw = f.read()

try:
    priv = serialization.load_pem_private_key(raw, password=None)
    print("Private key PARSED OK. Bits:", priv.key_size)
except Exception as e:
    raise SystemExit(f"Private key FAILED to parse: {e!r}")

derived = priv.public_key().public_bytes(
    serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo
).decode().strip()

norm = lambda s: "".join(s.split())
if norm(derived) == norm(EXPECTED_PUB):
    print("MATCH: private key corresponds to DocuSign keypair 36fa94cc.")
    print("=> Key is intact. Problem is DocuSign-side (app association / consent / propagation).")
else:
    print("MISMATCH: private key does NOT match the 36fa94cc public key.")
    print("--- derived public key ---")
    print(derived)
