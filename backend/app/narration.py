import os
import json
import httpx
from typing import List, Dict, Any
from app.schemas import DomainScores, SHAPFeatureImpact, NarrativeReport

DISCLAIMER_TEXT = (
    "NeuroNova Cognitive Screening is an automated psychometric and neuro-behavioral performance assessment. "
    "This report provides functional performance indicators and is strictly intended for wellness, cognitive awareness, "
    "and research tracking. It does NOT constitute a clinical diagnosis of any neurological or psychiatric disorder."
)

def generate_deterministic_report(
    cpi: float,
    percentile: float,
    domains: DomainScores,
    shap_factors: List[SHAPFeatureImpact]
) -> NarrativeReport:
    """Deterministic, clinically structured narrative generator for offline and zero-quota resilience."""
    
    # 1. Performance tier
    if cpi >= 85:
        tier_desc = "exceptional cognitive processing efficiency and robust attentional resilience"
    elif cpi >= 72:
        tier_desc = "solid, well-balanced cognitive functioning within normative performance bounds"
    elif cpi >= 60:
        tier_desc = "moderate cognitive endurance with observable susceptibility to fatigue or distraction"
    else:
        tier_desc = "reduced cognitive throughput, indicating transient fatigue, stress, or neuromotor latency"

    summary = (
        f"Your overall Cognitive Performance Index (CPI) is {cpi}/100, placing your performance at the "
        f"{percentile}th percentile relative to age-standardized normative benchmarks. Overall testing demonstrated "
        f"{tier_desc}. Executive function scored {domains.executive_function}/100, sustained attention reached "
        f"{domains.sustained_attention}/100, processing speed was measured at {domains.processing_speed}/100, "
        f"and cognitive stability was {domains.cognitive_stability}/100."
    )

    # 2. Extract top positive drivers and drag factors from SHAP
    positives = [s for s in shap_factors if s.direction == "positive"]
    negatives = [s for s in shap_factors if s.direction == "negative"]

    key_strengths = []
    if positives:
        for s in positives[:3]:
            key_strengths.append(f"{s.label}: Demonstrated strong performance ({s.impact} impact on overall index). {s.description}")
    else:
        key_strengths.append("Consistent response timing across basic psychomotor vigilance trials.")
        key_strengths.append("High adherence to visual screening targets during working memory trials.")

    fatigue_indicators = []
    if negatives:
        for s in negatives[:3]:
            fatigue_indicators.append(f"{s.label}: Exhibited notable cognitive latency or dispersion ({s.impact} drag). {s.description}")
    else:
        fatigue_indicators.append("Minimal signs of task-induced cognitive fatigue or attentional drift observed.")

    # 3. Evidence-based recommendations
    recommendations = []
    if domains.sustained_attention < 70 or any("Vigilance" in s.label or "Lapses" in s.label for s in negatives[:2]):
        recommendations.append("Adopt structured 25-minute Pomodoro intervals to prevent attention degradation during sustained screen tasks.")
    if domains.executive_function < 70:
        recommendations.append("Engage in working memory dual-task exercises and minimize cognitive multitasking during complex problem solving.")
    if domains.cognitive_stability < 70 or any("Blink" in s.label or "Gaze" in s.label for s in negatives[:2]):
        recommendations.append("Apply the 20-20-20 visual rest guideline (every 20 minutes, gaze at an object 20 feet away for 20 seconds) to mitigate oculomotor strain.")
    
    if len(recommendations) < 2:
        recommendations.append("Maintain consistent sleep architecture (7-8 hours) to consolidate executive working memory buffers.")
        recommendations.append("Incorporate light aerobic physical activity prior to intensive cognitive workflows to optimize reaction speed.")

    return NarrativeReport(
        summary=summary,
        key_strengths=key_strengths,
        fatigue_indicators=fatigue_indicators,
        recommendations=recommendations,
        disclaimer=DISCLAIMER_TEXT
    )


async def generate_llm_report(
    cpi: float,
    percentile: float,
    domains: DomainScores,
    shap_factors: List[SHAPFeatureImpact]
) -> NarrativeReport:
    """Generates an executive narrative report via Groq LLM or Gemini fallback with automatic deterministic safety net."""
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()

    prompt_data = {
        "cpi_score": cpi,
        "percentile_rank": percentile,
        "domains": {
            "executive_function": domains.executive_function,
            "sustained_attention": domains.sustained_attention,
            "processing_speed": domains.processing_speed,
            "cognitive_stability": domains.cognitive_stability
        },
        "top_shap_factors": [
            {"label": s.label, "impact": s.impact, "direction": s.direction, "domain": s.domain}
            for s in shap_factors[:5]
        ]
    }

    system_instruction = (
        "You are NeuroNova AI, a specialized psychometric and cognitive neuro-analytics reporting engine. "
        "Analyze the provided screening scores and SHAP feature attributions. "
        "Rules: "
        "1. Never give medical diagnoses (do NOT mention ADHD, autism, dementia, depression, clinical impairment). "
        "2. Frame all findings around functional cognitive performance, attention endurance, processing speed, and mental fatigue. "
        "3. Return ONLY a valid JSON object matching this exact schema: "
        '{"summary": "string", "key_strengths": ["string"], "fatigue_indicators": ["string"], "recommendations": ["string"]}'
    )

    # 1. Attempt Groq LLaMA 3.3 70B
    if groq_api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {"role": "system", "content": system_instruction},
                            {"role": "user", "content": f"Screening Data: {json.dumps(prompt_data)}"}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 800
                    }
                )
                if res.status_code == 200:
                    raw_json = res.json()["choices"][0]["message"]["content"]
                    parsed = json.loads(raw_json)
                    return NarrativeReport(
                        summary=parsed.get("summary", ""),
                        key_strengths=parsed.get("key_strengths", []),
                        fatigue_indicators=parsed.get("fatigue_indicators", []),
                        recommendations=parsed.get("recommendations", []),
                        disclaimer=DISCLAIMER_TEXT
                    )
        except Exception:
            pass  # Fall through to Gemini or deterministic

    # 2. Attempt Gemini Flash
    if gemini_api_key:
        for model_name in ["gemini-flash-latest", "gemini-3.8-flash", "gemini-1.5-flash"]:
            try:
                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_api_key}"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(
                        gemini_url,
                        headers={"Content-Type": "application/json"},
                        json={
                            "contents": [{
                                "parts": [{
                                    "text": f"{system_instruction}\n\nScreening Data: {json.dumps(prompt_data)}"
                                }]
                            }],
                            "generationConfig": {
                                "responseMimeType": "application/json",
                                "temperature": 0.2
                            }
                        }
                    )
                    if res.status_code == 200:
                        raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(raw_text)
                        return NarrativeReport(
                            summary=parsed.get("summary", ""),
                            key_strengths=parsed.get("key_strengths", []),
                            fatigue_indicators=parsed.get("fatigue_indicators", []),
                            recommendations=parsed.get("recommendations", []),
                            disclaimer=DISCLAIMER_TEXT
                        )
            except Exception:
                continue

    # 3. Deterministic Fallback (Guaranteed 100% reliability, no external network dependence)
    return generate_deterministic_report(cpi, percentile, domains, shap_factors)
