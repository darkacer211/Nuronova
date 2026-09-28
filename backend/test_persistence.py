"""
Unit Tests for Database Persistence, Encryption, and Compliance Layer
"""

import os
import sys
import json
import time

sys.path.append(os.path.dirname(__file__))

from app.core.security import (
    hash_password,
    verify_password,
    encrypt_sensitive_field,
    decrypt_sensitive_field,
    record_audit_log,
    get_audit_logs,
)
from app.db.supabase_repo import SupabaseScreeningRepository

def run_persistence_tests():
    print("=" * 60)
    print(" [TESTS] Running Security & Persistence Unit Tests")
    print("=" * 60)

    # 1. Password Hashing Tests
    pw = "ClinicianSecurePass#2026"
    stored_hash = hash_password(pw)
    assert verify_password(stored_hash, pw) is True, "Password verification failed for correct password"
    assert verify_password(stored_hash, "WrongPassword") is False, "Password verification allowed wrong password"
    print("[PASS] 1. PBKDF2 Password Hashing & Salt Verification")

    # 2. Field-Level Authenticated Encryption Tests
    sample_phi = json.dumps({"patient_diagnosis": "ADHD Combined", "notes": "Highly sensitive clinical notes."})
    encrypted_token = encrypt_sensitive_field(sample_phi)
    assert encrypted_token != sample_phi, "Encryption returned plaintext"
    decrypted = decrypt_sensitive_field(encrypted_token)
    assert decrypted == sample_phi, "Decrypted data does not match original plaintext"

    # Tamper Detection Test
    tampered = encrypted_token[:-5] + "AAAAA"
    tampered_result = decrypt_sensitive_field(tampered)
    assert "Decryption Error" in tampered_result or "failed" in tampered_result, "Tampered ciphertext was not rejected!"
    print("[PASS] 2. Authenticated Encryption at Rest & Tamper Detection")

    # 3. Repository CRUD & Pseudonymous Tracking
    repo = SupabaseScreeningRepository()
    clinician_id = "dr_smith_849"
    patient_id = "pseudonym_pt_9921"

    # Create minor profile without parental consent -> Expect error (COPPA)
    coppa_blocked = False
    try:
        repo.create_patient_profile(clinician_id, "minor_unconsented", is_minor=True, parental_consent_verified=False)
    except ValueError:
        coppa_blocked = True
    assert coppa_blocked is True, "COPPA gate failed: unconsented minor was registered!"
    print("[PASS] 3. COPPA Minor Parental Consent Gating")

    # Create minor profile WITH parental consent
    patient = repo.create_patient_profile(
        clinician_id,
        patient_id,
        is_minor=True,
        parental_consent_verified=True,
        notes="Referred for AuDHD diagnostic assessment."
    )
    assert patient["patient_id"] == patient_id
    assert patient["parental_consent_verified"] is True

    # Save multiple longitudinal sessions
    session_1 = {
        "session_id": "sess_time_1",
        "cpi_score": 72.4,
        "percentile_rank": 58.0,
        "domains": {"executive_function": 70.0}
    }
    session_2 = {
        "session_id": "sess_time_2",
        "cpi_score": 81.2,
        "percentile_rank": 74.0,
        "domains": {"executive_function": 82.0}
    }
    repo.save_session(session_1, clinician_id=clinician_id, patient_id=patient_id)
    repo.save_session(session_2, clinician_id=clinician_id, patient_id=patient_id)

    # 4. Longitudinal History
    history = repo.get_patient_history(patient_id, clinician_id=clinician_id)
    assert history["total_assessments"] >= 2, "Longitudinal history count mismatch"
    assert len(history["score_trajectory"]) >= 2
    print("[PASS] 4. Longitudinal Score Trajectory Aggregation")

    # 5. GDPR Article 20 Export
    export_pkg = repo.export_patient_data(patient_id, clinician_id=clinician_id)
    assert export_pkg["patient_profile"]["patient_id"] == patient_id
    assert "clinical_notes" in export_pkg["patient_profile"]
    assert len(export_pkg["complete_screening_records"]) >= 2
    print("[PASS] 5. GDPR Article 20 Data Portability Export")

    # 6. GDPR Article 17 Erasure
    erased = repo.delete_patient_data(patient_id, clinician_id=clinician_id)
    assert erased is True
    post_delete_history = repo.get_patient_history(patient_id, clinician_id=clinician_id)
    assert post_delete_history["total_assessments"] == 0, "Patient records were not purged after erasure!"
    print("[PASS] 6. GDPR Article 17 Right-to-Erasure Purge")

    # 7. Audit Trail
    logs = get_audit_logs(clinician_id=clinician_id)
    assert len(logs) > 0, "Audit trail recorded no logs"
    actions = [l["action"] for l in logs]
    assert "WRITE" in actions
    assert "READ" in actions
    assert "EXPORT" in actions
    assert "DELETE" in actions
    print("[PASS] 7. HIPAA § 164.312(b) & GDPR Art. 30 Audit Trail")

    print("\n[SUCCESS] ALL 7 PERSISTENCE & PRIVACY COMPLIANCE TESTS PASSED!\n")

if __name__ == "__main__":
    run_persistence_tests()
