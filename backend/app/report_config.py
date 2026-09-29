"""
Python configuration for NeuroNova clinical references, psychometric cutoffs, and glossary.
Every entry contains a source field.
"""

MEASURE_REFERENCES = {
    "pvt_mean_rt": {
        "name": "PVT Mean Reaction Time",
        "unit": "ms",
        "typical_range": "220 – 290 ms",
        "source": "Basner & Dinges (2011), Sleep; Roizen et al. (2019)",
        "clinical_note": "Slowed mean RT indicates reduced psychomotor vigilance, sedating fatigue, or attentional lapses.",
    },
    "pvt_rt_sd": {
        "name": "PVT Reaction Time Variability (SD)",
        "unit": "ms",
        "typical_range": "18 – 45 ms",
        "source": "Kofler et al. (2013), Psychological Bulletin; Tamm et al. (2012)",
        "clinical_note": "Intra-individual reaction time variability (IIV) is a core neurobiological marker of ADHD alerting instability.",
    },
    "pvt_rt_cv": {
        "name": "RT Coefficient of Variation (CV)",
        "unit": "ratio",
        "typical_range": "< 0.15 (15%)",
        "source": "Klein et al. (2006); Kofler et al. (2013)",
        "clinical_note": "Standardizes trial-to-trial instability across individuals with different baseline reaction speeds.",
    },
    "pvt_lapses": {
        "name": "Attentional Lapses (>500ms)",
        "unit": "count",
        "typical_range": "0 – 1 lapses",
        "source": "Dinges & Powell (1985); Basner et al. (2015)",
        "clinical_note": "Represents micro-dropouts in sustained attentional readiness.",
    },
    "stroop_cost": {
        "name": "Stroop Interference Cost",
        "unit": "ms",
        "typical_range": "+70 to +150 ms",
        "source": "MacLeod (1991), Psychological Bulletin; Stroop (1935)",
        "clinical_note": "Reflects anterior cingulate cortex and dorsolateral prefrontal inhibitory resolution.",
    },
    "gaze_on_screen": {
        "name": "On-Screen Gaze Fixation Ratio",
        "unit": "%",
        "typical_range": "≥ 90%",
        "source": "Holmqvist et al. (2011), Eye Tracking Guide; needs clinical review for webcam tracking",
        "clinical_note": "Webcam-based proxy for visual distraction and off-task glances.",
    },
    "fixation_dispersion": {
        "name": "Gaze Fixation Dispersion",
        "unit": "px",
        "typical_range": "25 – 55 px (~0.6°–1.4° visual angle at 60cm)",
        "source": "Rayner (1998); Hessels et al. (2018); needs clinical review for device pixel mapping",
        "clinical_note": "Pixel values depend on webcam focal length, screen resolution, and distance. Qualitative indicator.",
    },
}

SCREENER_REFERENCES = {
    "asrs": {
        "name": "Adult ADHD Self-Report Scale (ASRS v1.1)",
        "cutoff": "Part A ≥ 4 shaded boxes",
        "source": "Kessler et al. (2005), World Health Organization",
    },
    "aq10": {
        "name": "Autism Spectrum Quotient (AQ-10 Adult)",
        "cutoff": "Score ≥ 6 / 10",
        "source": "Allison, Auyeung, & Baron-Cohen (2012), BMJ",
    },
    "catq": {
        "name": "Camouflaging Autistic Traits Questionnaire (CAT-Q)",
        "cutoff": "Total score ≥ 100",
        "source": "Hull et al. (2019), Journal of Autism and Developmental Disorders",
    },
    "vanderbilt": {
        "name": "Vanderbilt ADHD Parent Rating Scale",
        "cutoff": "≥ 6 symptoms in Inattentive or Hyperactive domains",
        "source": "Wolraich et al. (2003), Journal of Pediatric Psychology",
    },
    "mchat": {
        "name": "Modified Checklist for Autism in Toddlers (M-CHAT-R/F)",
        "cutoff": "Low: 0–2, Medium: 3–7, High: 8–20",
        "source": "Robins et al. (2014), Pediatrics",
    },
}
