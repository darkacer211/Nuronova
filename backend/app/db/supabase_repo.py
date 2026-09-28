"""
Supabase Repository Adapter
Connects to Supabase PostgreSQL instance via PostgREST / REST endpoints using httpx.
Features:
- Encrypted clinical data payloads at rest (AES/HMAC)
- Pseudonymous patient tracking
- Longitudinal history aggregation
- COPPA verifiable parental consent flags
- GDPR export and right-to-erasure deletion
"""

import os
import json
import time
import httpx
from typing import Dict, Any, List, Optional
from app.db.base import BaseScreeningRepository
from app.core.security import (
    encrypt_sensitive_field,
    decrypt_sensitive_field,
    record_audit_log
)

class SupabaseScreeningRepository(BaseScreeningRepository):
    """Production-grade Supabase / PostgreSQL adapter with client-side field-level encryption."""

    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.api_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
        self.headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.is_configured = bool(self.supabase_url and self.api_key)
        # In-memory fallback if Supabase credentials are dummy / not yet provisioned
        self._fallback_store: Dict[str, Dict] = {}
        self._fallback_patients: Dict[str, Dict] = {}

    def _post(self, table: str, payload: dict) -> Optional[dict]:
        """Execute POST to Supabase table endpoint."""
        if not self.is_configured:
            return None
        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.post(f"{self.supabase_url}/rest/v1/{table}", headers=self.headers, json=payload)
                if res.status_code in (200, 201):
                    data = res.json()
                    return data[0] if isinstance(data, list) and data else payload
                return None
        except Exception:
            return None

    def _get(self, table: str, query_params: dict) -> List[dict]:
        """Execute GET with query filters to Supabase table endpoint."""
        if not self.is_configured:
            return []
        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.get(f"{self.supabase_url}/rest/v1/{table}", headers=self.headers, params=query_params)
                if res.status_code == 200:
                    return res.json()
                return []
        except Exception:
            return []

    def _delete(self, table: str, query_params: dict) -> bool:
        """Execute DELETE on Supabase table endpoint."""
        if not self.is_configured:
            return False
        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.delete(f"{self.supabase_url}/rest/v1/{table}", headers=self.headers, params=query_params)
                return res.status_code in (200, 204)
        except Exception:
            return False

    def save_session(
        self,
        session_data: Dict[str, Any],
        clinician_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        consent_flags: Optional[Dict[str, bool]] = None,
    ) -> Dict[str, Any]:
        session_id = session_data.get("session_id", f"sess_{int(time.time()*1000)}")
        
        # Encrypt the full raw feature payload and report at rest
        raw_json = json.dumps(session_data)
        encrypted_blob = encrypt_sensitive_field(raw_json)

        record = {
            "session_id": session_id,
            "clinician_id": clinician_id or "ANONYMOUS_CLIENT",
            "patient_id": patient_id or "ANONYMOUS_PATIENT",
            "cpi_score": session_data.get("cpi_score"),
            "percentile_rank": session_data.get("percentile_rank"),
            "encrypted_payload": encrypted_blob,
            "consent_flags": json.dumps(consent_flags or {"data_storage_opt_in": True}),
            "created_at": time.time(),
        }

        # Try Supabase if configured; otherwise use secure in-memory fallback
        if self.is_configured:
            db_res = self._post("sessions", record)
            if db_res:
                record_audit_log("WRITE", clinician_id, "session", session_id, {"patient_id": patient_id})
                return session_data

        self._fallback_store[session_id] = record
        record_audit_log("WRITE", clinician_id, "session_local", session_id, {"patient_id": patient_id})
        return session_data

    def get_session(self, session_id: str, clinician_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        record = None
        if self.is_configured:
            filters = {"session_id": f"eq.{session_id}"}
            if clinician_id:
                filters["clinician_id"] = f"eq.{clinician_id}"
            rows = self._get("sessions", filters)
            if rows:
                record = rows[0]

        if not record:
            record = self._fallback_store.get(session_id)
            if record and clinician_id and record.get("clinician_id") != clinician_id:
                return None  # Row-level security restriction

        if not record:
            return None

        # Decrypt payload
        decrypted = decrypt_sensitive_field(record.get("encrypted_payload", ""))
        try:
            parsed = json.loads(decrypted)
            record_audit_log("READ", clinician_id, "session", session_id)
            return parsed
        except Exception:
            return None

    def list_sessions(
        self,
        clinician_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        results = []
        if self.is_configured:
            filters = {"limit": str(limit), "offset": str(offset), "order": "created_at.desc"}
            if clinician_id:
                filters["clinician_id"] = f"eq.{clinician_id}"
            if patient_id:
                filters["patient_id"] = f"eq.{patient_id}"
            rows = self._get("sessions", filters)
            for r in rows:
                results.append({
                    "session_id": r.get("session_id"),
                    "patient_id": r.get("patient_id"),
                    "cpi_score": r.get("cpi_score"),
                    "percentile_rank": r.get("percentile_rank"),
                    "created_at": r.get("created_at"),
                })
            return results

        # Fallback list
        for sid, s in reversed(list(self._fallback_store.items())):
            if clinician_id and s.get("clinician_id") != clinician_id:
                continue
            if patient_id and s.get("patient_id") != patient_id:
                continue
            results.append({
                "session_id": sid,
                "patient_id": s.get("patient_id"),
                "cpi_score": s.get("cpi_score"),
                "percentile_rank": s.get("percentile_rank"),
                "created_at": s.get("created_at"),
            })
            if len(results) >= limit:
                break
        return results

    def create_patient_profile(
        self,
        clinician_id: str,
        pseudonym_id: str,
        is_minor: bool = False,
        parental_consent_verified: bool = False,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Enforces COPPA requirements: Minor records require verified parental consent."""
        if is_minor and not parental_consent_verified:
            raise ValueError("COPPA Compliance: Verifiable parental consent is mandatory for minors under 13.")

        encrypted_notes = encrypt_sensitive_field(notes or "") if notes else ""
        profile = {
            "patient_id": pseudonym_id,
            "clinician_id": clinician_id,
            "is_minor": is_minor,
            "parental_consent_verified": parental_consent_verified,
            "encrypted_notes": encrypted_notes,
            "created_at": time.time(),
        }

        if self.is_configured:
            self._post("patients", profile)

        self._fallback_patients[pseudonym_id] = profile
        record_audit_log("WRITE", clinician_id, "patient", pseudonym_id, {"is_minor": is_minor})
        return {
            "patient_id": pseudonym_id,
            "clinician_id": clinician_id,
            "is_minor": is_minor,
            "parental_consent_verified": parental_consent_verified,
            "created_at": profile["created_at"]
        }

    def get_patient_history(
        self,
        patient_id: str,
        clinician_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Aggregate longitudinal trajectory of scores over time for a patient."""
        sessions = self.list_sessions(clinician_id=clinician_id, patient_id=patient_id, limit=100)
        sessions_sorted = sorted(sessions, key=lambda s: s.get("created_at", 0))

        record_audit_log("READ", clinician_id, "patient_history", patient_id, {"sessions_count": len(sessions)})
        return {
            "patient_id": patient_id,
            "total_assessments": len(sessions_sorted),
            "timeline": sessions_sorted,
            "score_trajectory": [
                {
                    "session_id": s["session_id"],
                    "cpi_score": s.get("cpi_score"),
                    "percentile_rank": s.get("percentile_rank"),
                    "date": time.strftime("%Y-%m-%d", time.gmtime(s.get("created_at", time.time()))),
                }
                for s in sessions_sorted
            ]
        }

    def export_patient_data(
        self,
        patient_id: str,
        clinician_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """GDPR Article 20 Right to Data Portability export package."""
        history = self.get_patient_history(patient_id, clinician_id=clinician_id)
        full_sessions = []
        for s in history["timeline"]:
            full_data = self.get_session(s["session_id"], clinician_id=clinician_id)
            if full_data:
                full_sessions.append(full_data)

        patient_meta = self._fallback_patients.get(patient_id, {})
        notes = decrypt_sensitive_field(patient_meta.get("encrypted_notes", ""))

        record_audit_log("EXPORT", clinician_id, "patient_export", patient_id)
        return {
            "export_version": "1.0",
            "export_date": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "gdpr_compliance": "Article 20 Data Portability Standard",
            "patient_profile": {
                "patient_id": patient_id,
                "is_minor": patient_meta.get("is_minor", False),
                "parental_consent_verified": patient_meta.get("parental_consent_verified", False),
                "clinical_notes": notes,
            },
            "longitudinal_history": history,
            "complete_screening_records": full_sessions,
        }

    def delete_patient_data(
        self,
        patient_id: str,
        clinician_id: Optional[str] = None
    ) -> bool:
        """GDPR Article 17 Right to Erasure: Purge patient profile and all associated sessions."""
        if self.is_configured:
            filters = {"patient_id": f"eq.{patient_id}"}
            if clinician_id:
                filters["clinician_id"] = f"eq.{clinician_id}"
            self._delete("sessions", filters)
            self._delete("patients", filters)

        # Purge from fallback memory store
        to_del = [sid for sid, s in self._fallback_store.items() if s.get("patient_id") == patient_id]
        for sid in to_del:
            del self._fallback_store[sid]

        if patient_id in self._fallback_patients:
            del self._fallback_patients[patient_id]

        record_audit_log("DELETE", clinician_id, "patient_purge", patient_id, {"purged_sessions": len(to_del)})
        return True
