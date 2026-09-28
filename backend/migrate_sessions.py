"""
Migration & Deletion Script for Plaintext Sessions Cache
Removes plaintext sessions_cache.json file to satisfy HIPAA / GDPR health data privacy requirements.
Optionally encrypts and migrates existing sessions into the secure repository.
"""

import os
import sys
import json
import time

sys.path.append(os.path.dirname(__file__))

from app.core.security import encrypt_sensitive_field
from app.db.factory import get_repository

SESSIONS_FILE = os.path.join(os.path.dirname(__file__), "sessions_cache.json")
VAULT_BACKUP = os.path.join(os.path.dirname(__file__), "sessions_vault.enc")

def migrate_and_purge(purge_only: bool = False):
    print("=" * 60)
    print(" [SECURITY] NeuroNova Health Data Security Migration")
    print("=" * 60)

    if not os.path.exists(SESSIONS_FILE):
        print("[OK] No plaintext sessions_cache.json file detected. Privacy standard maintained.")
        return

    print(f"[WARN] Found plaintext sessions cache: {SESSIONS_FILE}")
    try:
        with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        count = len(data)
        print(f"[*] Identified {count} plaintext session record(s).")

        if not purge_only:
            print("[*] Encrypting sessions into secure vault backup...")
            encrypted_payload = encrypt_sensitive_field(json.dumps(data))
            with open(VAULT_BACKUP, "w", encoding="utf-8") as f_out:
                f_out.write(encrypted_payload)
            print(f"[OK] Encrypted backup written to: {VAULT_BACKUP}")

            # Also feed to repository
            repo = get_repository()
            for sid, s in data.items():
                repo.save_session(s)
            print("[OK] Records imported into active repository.")

        # Secure Purge
        print("[*] Purging and securely unlinking plaintext sessions_cache.json...")
        # Overwrite with zeroes before unlink
        file_size = os.path.getsize(SESSIONS_FILE)
        with open(SESSIONS_FILE, "wb") as f_wipe:
            f_wipe.write(b"\x00" * file_size)
        os.remove(SESSIONS_FILE)
        print("[OK] Plaintext sessions_cache.json successfully eliminated!")

    except Exception as e:
        print(f"[ERROR] Migration error: {str(e)}")

if __name__ == "__main__":
    purge = "--purge-only" in sys.argv
    migrate_and_purge(purge_only=purge)
