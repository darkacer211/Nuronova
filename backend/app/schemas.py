from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class PVTMetrics(BaseModel):
    mean_rt: float = Field(..., description="Mean reaction time in ms")
    lapses: int = Field(0, description="Count of lapses (RT > 500ms)")
    false_starts: int = Field(0, description="Count of premature presses (< 100ms)")
    inv_rt: float = Field(..., description="Mean reciprocal RT (1/RT * 1000)")
    trials_count: int = Field(15, description="Total number of valid PVT trials")
    rt_sd: Optional[float] = Field(None, description="Standard deviation of reaction times in ms")
    rt_cv: Optional[float] = Field(None, description="Coefficient of variation of reaction times (SDRT / MeanRT)")
    fast_responses_count: Optional[int] = Field(None, description="Count of fast responses / anticipations (<150ms + premature)")
    slow_responses_count: Optional[int] = Field(None, description="Count of slow responses (>500ms attentional lapses)")

class StroopMetrics(BaseModel):
    mean_congruent_rt: float = Field(..., description="Mean RT on congruent trials in ms")
    mean_incongruent_rt: float = Field(..., description="Mean RT on incongruent trials in ms")
    interference_cost: float = Field(..., description="Incongruent RT - Congruent RT in ms")
    accuracy: float = Field(..., description="Fraction of correct responses 0.0 - 1.0")
    total_trials: int = Field(20, description="Total number of Stroop trials")

class NBackMetrics(BaseModel):
    level: int = Field(2, description="N-back difficulty reached (1, 2, 3)")
    accuracy: float = Field(..., description="Overall accuracy 0.0 - 1.0")
    dprime: float = Field(..., description="Signal detection d' sensitivity index")
    hits: int = Field(0)
    misses: int = Field(0)
    false_alarms: int = Field(0)
    correct_rejections: int = Field(0)

class VerbalFluencyMetrics(BaseModel):
    words_count: int = Field(0, description="Total words spoken")
    speech_rate_wpm: float = Field(0.0, description="Words per minute")
    pause_ratio: float = Field(0.0, description="Ratio of silent pauses to phonation duration (0.0 - 1.0)")
    mean_pause_duration_ms: float = Field(0.0, description="Average duration of pauses in ms")
    hesitation_count: int = Field(0, description="Count of hesitations / filler words")
    transcript: Optional[str] = Field(None, description="Transcribed speech text")

class TasksPayload(BaseModel):
    pvt: PVTMetrics
    stroop: StroopMetrics
    nback: NBackMetrics
    verbal: Optional[VerbalFluencyMetrics] = None

class OculomotorBiomarkers(BaseModel):
    gaze_on_screen: float = Field(0.9, description="Fraction of time gaze was focused on screen (0.0 - 1.0)")
    blink_rate: float = Field(18.0, description="Blinks per minute")
    fixation_dispersion: float = Field(45.0, description="Gaze coordinate dispersion standard deviation in px")
    head_yaw_var: float = Field(4.0, description="Head pose yaw variance in deg^2")
    head_pitch_var: float = Field(3.0, description="Head pose pitch variance in deg^2")
    face_lost_ratio: float = Field(0.02, description="Fraction of frames where face was not detected")

class AcousticBiomarkers(BaseModel):
    rms_variance: float = Field(0.05, description="Variance in acoustic RMS energy")
    pause_ratio: float = Field(0.2, description="Pause to total duration ratio")
    f0_variance: float = Field(30.0, description="Fundamental frequency pitch variance in Hz")

class MotorBiomarkers(BaseModel):
    mean_dwell_time: float = Field(95.0, description="Keydown dwell duration in ms")
    dwell_time_var: float = Field(25.0, description="Keydown dwell duration variance")
    mouse_curvature: float = Field(1.15, description="Mouse trajectory curvature (distance / displacement)")
    hesitation_latency: float = Field(220.0, description="Initial movement latency in ms")

class BiomarkersPayload(BaseModel):
    oculomotor: OculomotorBiomarkers = Field(default_factory=OculomotorBiomarkers)
    acoustic: AcousticBiomarkers = Field(default_factory=AcousticBiomarkers)
    motor: MotorBiomarkers = Field(default_factory=MotorBiomarkers)

class AnalysisRequest(BaseModel):
    session_id: str
    user_id_hash: Optional[str] = "anon_user"
    client_timestamp: Optional[int] = None
    tasks: TasksPayload
    biomarkers: BiomarkersPayload = Field(default_factory=BiomarkersPayload)

class SHAPFeatureImpact(BaseModel):
    feature: str
    label: str
    domain: str
    impact: str
    impact_value: float
    direction: str  # "positive" or "negative"
    description: str

class DomainScores(BaseModel):
    executive_function: float
    sustained_attention: float
    processing_speed: float
    cognitive_stability: float

class NarrativeReport(BaseModel):
    summary: str
    key_strengths: List[str]
    fatigue_indicators: List[str]
    recommendations: List[str]
    disclaimer: str

class AnalysisResponse(BaseModel):
    session_id: str
    cpi_score: float
    percentile_rank: float
    confidence_interval: List[float]
    domains: DomainScores
    shap_explanations: List[SHAPFeatureImpact]
    narrative_report: NarrativeReport
    raw_feature_count: int
    integrated_findings: Optional[Dict[str, Any]] = None

class TranscribeResponse(BaseModel):
    transcript: str
    word_count: int
    speech_rate_wpm: float
    hesitation_count: int
    duration_seconds: float

class ConsentFlags(BaseModel):
    data_storage_opt_in: bool = Field(False, description="Explicit opt-in to persist session data")
    parental_consent_verified: bool = Field(False, description="Mandatory for minors under 13 under COPPA")
    research_share_opt_in: bool = Field(False, description="Optional consent to share de-identified research aggregates")

class CreatePatientRequest(BaseModel):
    pseudonym_id: str = Field(..., description="De-identified participant / patient identifier")
    is_minor: bool = Field(False, description="Flag indicating if participant is under 18 (or under 13 for COPPA)")
    parental_consent_verified: bool = Field(False, description="Verifiable consent from parent or legal guardian")
    notes: Optional[str] = Field(None, description="Optional clinical notes (encrypted at rest)")

class PatientResponse(BaseModel):
    patient_id: str
    clinician_id: str
    is_minor: bool
    parental_consent_verified: bool
    created_at: float

class AuditLogItem(BaseModel):
    timestamp: float
    iso_time: str
    action: str
    clinician_id: str
    resource_type: str
    resource_id: str
    details: Dict[str, Any]
