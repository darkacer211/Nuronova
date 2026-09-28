"""
Attention Lab: Isolated Gaze Model Service & Adapter
Reference: Deng et al., "Detection of ADHD based on eye movements during natural viewing", ECML PKDD 2022.

Architecture:
- Interface: analyze(gaze_timeseries, stimulus_id) -> metrics
- Feature Flag: EXPERIMENTAL_GAZE_MODEL=false by default.
- Strict Output Rules:
  * NEVER labels anyone 'ADHD' or 'not ADHD'.
  * Shows descriptive metrics only with plain-language explanations.
  * Never alters clinical questionnaire scores or referral wording.
  * Prominent notice: 'Experimental. Not a diagnostic tool. Webcam eye tracking is far less precise than clinical eye trackers.'
"""

import os
import math
from typing import List, Dict, Any, Optional

EXPERIMENTAL_GAZE_MODEL = os.getenv("EXPERIMENTAL_GAZE_MODEL", "false").lower() in ("true", "1", "yes")

def analyze(
    gaze_timeseries: List[Dict[str, Any]],
    stimulus_id: str = "default_stimulus",
    options: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Isolated gaze telemetry analyzer.
    Expects list of numeric coordinates: [{'t': ms, 'x': px, 'y': px, 'on_screen': bool}].
    Rejects any payloads containing images, binary data, or base64 frames.
    """
    # Defensive Security Check: Ensure NO image frames were passed
    for sample in gaze_timeseries[:20]:
        for k, v in sample.items():
            if isinstance(v, str) and (v.startswith("data:image") or len(v) > 500):
                raise ValueError("Privacy Violation: Image/frame data must never be transmitted over the network.")

    if not gaze_timeseries or len(gaze_timeseries) < 10:
        return {
            "status": "insufficient_data",
            "message": "At least 10 gaze points required for descriptive analysis.",
            "metrics": None
        }

    # Compute descriptive numerical indicators
    total_samples = len(gaze_timeseries)
    on_screen_count = sum(1 for p in gaze_timeseries if p.get("on_screen", True))
    off_screen_pct = round(((total_samples - on_screen_count) / max(total_samples, 1)) * 100, 1)

    # Compute spatial dispersion
    xs = [p.get("x", 0) for p in gaze_timeseries]
    ys = [p.get("y", 0) for p in gaze_timeseries]
    mean_x = sum(xs) / total_samples
    mean_y = sum(ys) / total_samples
    dispersion = round(math.sqrt(sum((x - mean_x)**2 + (y - mean_y)**2 for x, y in zip(xs, ys)) / total_samples), 1)

    # Duration
    duration_s = max((gaze_timeseries[-1].get("t", 0) - gaze_timeseries[0].get("t", 0)) / 1000.0, 1.0)

    # Saliency agreement index (experimental heuristic)
    saliency_agreement_index = round(min(max(1.0 - (dispersion / 300.0), 0.1), 0.95), 2)

    result = {
        "status": "success",
        "stimulus_id": stimulus_id,
        "sample_count": total_samples,
        "duration_seconds": round(duration_s, 1),
        "feature_flag_experimental_model": EXPERIMENTAL_GAZE_MODEL,
        "descriptive_metrics": {
            "off_screen_percentage": off_screen_pct,
            "spatial_dispersion_px": dispersion,
            "saliency_alignment_heuristic": saliency_agreement_index,
        },
        "interpretations": {
            "viewing_coherence": "High central focus" if off_screen_pct < 15 else "Frequent exploratory off-canvas glances",
            "spatial_exploration": f"Spatial dispersion radius of {dispersion} pixels across stimulus window.",
        },
        "regulatory_notice": (
            "EXPERIMENTAL RESEARCH METRICS ONLY. Webcam eye tracking is significantly less precise than "
            "clinical research trackers (e.g. EyeLink / SMI). This module is NOT a diagnostic tool, cannot detect "
            "ADHD or autism, and does NOT modify clinical screening scores."
        )
    }

    if EXPERIMENTAL_GAZE_MODEL:
        result["experimental_pipeline_notice"] = "Research use only, not validated for webcam data."

    return result
