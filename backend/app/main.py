import os
import json
import uuid
from typing import Dict, List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.schemas import AnalysisRequest, AnalysisResponse, TranscribeResponse
from app.cpi_engine import cpi_engine
from app.narration import generate_llm_report
from app.transcribe import process_speech_audio

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

# Local in-memory session cache for fast retrieval & demo history
SESSIONS_DB: Dict[str, Dict] = {}
SESSIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "sessions_cache.json")

def _load_sessions():
    global SESSIONS_DB
    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
                SESSIONS_DB = json.load(f)
        except Exception:
            SESSIONS_DB = {}

def _save_session(session_id: str, data: dict):
    SESSIONS_DB[session_id] = data
    try:
        with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(SESSIONS_DB, f, indent=2)
    except Exception:
        pass

_load_sessions()

@app.get("/")
def root():
    return {
        "system": "NeuroNova Cognitive Screening Engine",
        "status": "active",
        "version": "1.0.0",
        "endpoints": ["/api/v1/health", "/api/v1/analyze", "/api/v1/transcribe", "/api/v1/sessions"]
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "NeuroNova-CPI-v1",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
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

        # Persist session
        _save_session(response.session_id, response.model_dump())

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
def list_sessions():
    return {
        "count": len(SESSIONS_DB),
        "sessions": [
            {
                "session_id": sid,
                "cpi_score": s.get("cpi_score"),
                "percentile_rank": s.get("percentile_rank"),
                "domains": s.get("domains")
            }
            for sid, s in reversed(list(SESSIONS_DB.items()))
        ]
    }

@app.get("/api/v1/sessions/{session_id}")
def get_session(session_id: str):
    if session_id not in SESSIONS_DB:
        raise HTTPException(status_code=404, detail="Session not found")
    return SESSIONS_DB[session_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
