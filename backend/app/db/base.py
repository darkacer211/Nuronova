"""
Abstract Repository Interface for Screening Persistence
Defines contracts for Clinicians, Patients, Sessions, Consent, Export, and Erasure.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseScreeningRepository(ABC):
    """Abstract persistence interface ensuring backend-agnostic repository implementations."""

    @abstractmethod
    def save_session(
        self,
        session_data: Dict[str, Any],
        clinician_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        consent_flags: Optional[Dict[str, bool]] = None,
    ) -> Dict[str, Any]:
        """Persist a screening assessment session."""
        pass

    @abstractmethod
    def get_session(self, session_id: str, clinician_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieve a session by ID with row-level ownership verification."""
        pass

    @abstractmethod
    def list_sessions(
        self,
        clinician_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List screening sessions for a specific clinician or pseudonymous patient."""
        pass

    @abstractmethod
    def create_patient_profile(
        self,
        clinician_id: str,
        pseudonym_id: str,
        is_minor: bool = False,
        parental_consent_verified: bool = False,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a pseudonymous patient profile with COPPA parental consent verification."""
        pass

    @abstractmethod
    def get_patient_history(
        self,
        patient_id: str,
        clinician_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Retrieve longitudinal history and trajectory of assessment scores over time."""
        pass

    @abstractmethod
    def export_patient_data(
        self,
        patient_id: str,
        clinician_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Export all data associated with a patient in machine-readable JSON (GDPR Art. 20)."""
        pass

    @abstractmethod
    def delete_patient_data(
        self,
        patient_id: str,
        clinician_id: Optional[str] = None
    ) -> bool:
        """Purge and securely delete all records and sessions for a patient (GDPR Art. 17)."""
        pass
