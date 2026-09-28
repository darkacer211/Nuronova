import os
import json
import uuid
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    TranscribeResponse,
    CreatePatientRequest,
    PatientResponse,
)
from app.cpi_engine import cpi_engine
from app.narration import generate_llm_report
from app.transcribe import process_speech_audio
from app.db.factory import get_repository
from app.core.security import get_audit_logs, record_audit_log

load_dotenv()

app = FastAPI(
    title="NeuroNova Cognitive Screening Engine",
    description="Multimodal Cognitive Performance Index (CPI) scoring, SHAP explainability, and speech transcription API.",
    version="1.0.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = get_repository()

@app.get("/")
def root():
    return {
        "system": "NeuroNova Cognitive Screening Engine",
        "status": "active",
        "version": "1.0.0",
        "persistence_enabled": os.getenv("PERSISTENCE_ENABLED", "false").lower() in ("true", "1", "yes"),
        "persistence_backend": os.getenv("PERSISTENCE_BACKEND", "supabase"),
        "endpoints": [
            "/api/v1/health",
            "/api/v1/analyze",
            "/api/v1/transcribe",
            "/api/v1/sessions",
            "/api/v1/patients",
            "/api/v1/audit-log"
        ]
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "NeuroNova-CPI-v1",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
        "persistence_enabled": os.getenv("PERSISTENCE_ENABLED", "false").lower() in ("true", "1", "yes"),
        "persistence_backend": os.getenv("PERSISTENCE_BACKEND", "supabase"),
        "features_indexed": len(cpi_engine.feature_names)
    }

@app.post("/api/v1/analyze", response_model=AnalysisResponse)
async def analyze_screening(payload: AnalysisRequest):
    try:
        # 1. Compute CPI, Domain Scores & SHAP Feature Attributions
        cpi, percentile, domains, shap_factors = cpi_engine.evaluate(payload)
        
        # Confidence interval approximation (±2.5 points based on measurement error)
        ci_lower = round(max(cpi - 2.8, 0.0), 1)
        ci_upper = round(min(cpi + 2.8, 100.0), 1)

        # 2. Generate Structured Narrative
        narrative = await generate_llm_report(cpi, percentile, domains, shap_factors)

        response = AnalysisResponse(
            session_id=payload.session_id or f"sess_{uuid.uuid4().hex[:8]}",
            cpi_score=cpi,
            percentile_rank=percentile,
            confidence_interval=[ci_lower, ci_upper],
            domains=domains,
            shap_explanations=shap_factors,
            narrative_report=narrative,
            raw_feature_count=len(cpi_engine.feature_names)
        )

        # Persist session securely through repository layer
        repo.save_session(response.model_dump())

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")

@app.post("/api/v1/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        return await process_speech_audio(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

@app.get("/api/v1/sessions")
def list_sessions(clinician_id: Optional[str] = None, patient_id: Optional[str] = None, limit: int = 50):
    sessions = repo.list_sessions(clinician_id=clinician_id, patient_id=patient_id, limit=limit)
    return {
        "count": len(sessions),
        "sessions": sessions
    }

@app.get("/api/v1/sessions/{session_id}")
def get_session(session_id: str, clinician_id: Optional[str] = None):
    session = repo.get_session(session_id, clinician_id=clinician_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or access denied")
    return session

# --- Privacy & Compliance Endpoints (Clinician, Longitudinal, GDPR & COPPA) ---

@app.post("/api/v1/patients", response_model=PatientResponse)
def create_patient(payload: CreatePatientRequest, clinician_id: Optional[str] = "clinician_default"):
    try:
        result = repo.create_patient_profile(
            clinician_id=clinician_id,
            pseudonym_id=payload.pseudonym_id,
            is_minor=payload.is_minor,
            parental_consent_verified=payload.parental_consent_verified,
            notes=payload.notes,
        )
        return PatientResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Patient creation failed: {str(e)}")

@app.get("/api/v1/patients/{patient_id}/history")
def get_patient_history(patient_id: str, clinician_id: Optional[str] = None):
    return repo.get_patient_history(patient_id, clinician_id=clinician_id)

@app.get("/api/v1/patients/{patient_id}/export")
def export_patient(patient_id: str, clinician_id: Optional[str] = None):
    """GDPR Article 20: Data Portability Export."""
    return repo.export_patient_data(patient_id, clinician_id=clinician_id)

@app.delete("/api/v1/patients/{patient_id}")
def delete_patient(patient_id: str, clinician_id: Optional[str] = None):
    """GDPR Article 17: Right to Erasure / Purge Data."""
    success = repo.delete_patient_data(patient_id, clinician_id=clinician_id)
    return {"status": "success", "patient_id": patient_id, "purged": success}

@app.get("/api/v1/audit-log")
def view_audit_log(limit: int = 50, clinician_id: Optional[str] = None):
    """HIPAA Technical Safeguard (§ 164.312(b)) & GDPR Article 30 Audit Trail."""
    logs = get_audit_logs(limit=limit, clinician_id=clinician_id)
    return {"count": len(logs), "audit_logs": logs}

# --- Experimental Attention Lab Gaze Endpoint ---

class GazeAnalysisPayload(BaseModel):
    gaze_timeseries: List[Dict[str, Any]]
    stimulus_id: Optional[str] = "free_viewing_nature"
    consent_acknowledged: bool = Field(..., description="Client must affirm explicit consent was granted")

@app.post("/api/v1/gaze/analyze")
def analyze_gaze(payload: GazeAnalysisPayload):
    """Isolated experimental gaze telemetry endpoint. Strictly descriptive, non-diagnostic."""
    if not payload.consent_acknowledged:
        raise HTTPException(status_code=403, detail="Consent Required: Camera analysis is disabled without explicit user consent.")
    try:
        from app.services.gaze_service import analyze
        return analyze(payload.gaze_timeseries, stimulus_id=payload.stimulus_id)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gaze analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
