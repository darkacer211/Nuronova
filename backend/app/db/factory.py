"""
Repository Factory
Controls persistence adapter resolution based on environment flags.
Persistence is strictly OFF by default to preserve anonymous client-side operation.
"""

import os
from app.db.base import BaseScreeningRepository
from app.db.supabase_repo import SupabaseScreeningRepository

class AnonymousScreeningRepository(BaseScreeningRepository):
    """
    Default repository when PERSISTENCE_ENABLED is false.
    Keeps everything in temporary memory; writes zero health data to persistent disk.
    Preserves 100% privacy and existing anonymous client-side workflow.
    """
    def __init__(self):
        self._temp_cache = {}

    def save_session(self, session_data, clinician_id=None, patient_id=None, consent_flags=None):
        sid = session_data.get("session_id", "temp_sess")
        self._temp_cache[sid] = session_data
        return session_data

    def get_session(self, session_id, clinician_id=None):
        return self._temp_cache.get(session_id)

    def list_sessions(self, clinician_id=None, patient_id=None, limit=50, offset=0):
        items = list(reversed(list(self._temp_cache.values())))
        return items[offset : offset + limit]

    def create_patient_profile(self, clinician_id, pseudonym_id, is_minor=False, parental_consent_verified=False, notes=None):
        return {"patient_id": pseudonym_id, "status": "ephemeral_client_only"}

    def get_patient_history(self, patient_id, clinician_id=None):
        return {"patient_id": patient_id, "timeline": [], "notice": "Persistence is disabled; history not stored."}

    def export_patient_data(self, patient_id, clinician_id=None):
        return {"patient_id": patient_id, "records": []}

    def delete_patient_data(self, patient_id, clinician_id=None):
        return True

_ACTIVE_REPOSITORY: BaseScreeningRepository = None

def get_repository() -> BaseScreeningRepository:
    """Return singleton active repository based on PERSISTENCE_ENABLED flag."""
    global _ACTIVE_REPOSITORY
    if _ACTIVE_REPOSITORY is None:
        persistence_enabled = os.getenv("PERSISTENCE_ENABLED", "false").lower() in ("true", "1", "yes")
        backend = os.getenv("PERSISTENCE_BACKEND", "supabase").lower()

        if not persistence_enabled:
            _ACTIVE_REPOSITORY = AnonymousScreeningRepository()
        elif backend == "supabase":
            _ACTIVE_REPOSITORY = SupabaseScreeningRepository()
        else:
            _ACTIVE_REPOSITORY = SupabaseScreeningRepository()

    return _ACTIVE_REPOSITORY
