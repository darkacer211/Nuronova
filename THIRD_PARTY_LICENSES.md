# Third-Party Licenses & Intellectual Property Acknowledgements

This document outlines the intellectual property, copyright notices, and open-source licenses governing third-party libraries, research models, datasets, and clinical screening instruments utilized in **NeuroNova**.

---

## 1. Research Codebases & Vision Models

### ecml-ADHD
* **Source**: [https://github.com/aeye-lab/ecml-ADHD](https://github.com/aeye-lab/ecml-ADHD)
* **Citation**: Deng, N., et al. (2022). *Detection of ADHD based on eye movements during natural viewing*. European Conference on Machine Learning and Principles and Practice of Knowledge Discovery in Databases (ECML PKDD 2022).
* **License**: **MIT License** (Copyright © 2023 AEye).
* **Usage**: Code architecture, sequence model concepts, and fixation feature definitions referenced in the experimental Attention Lab module.
* **Commercial Status**: Permitted for code modification and integration with attribution.

### MediaPipe Tasks Vision (`@mediapipe/tasks-vision`)
* **Source**: Google LLC ([https://developers.google.com/mediapipe](https://developers.google.com/mediapipe))
* **License**: **Apache License 2.0**
* **Usage**: On-device FaceLandmarker execution in WebAssembly/GPU delegates for real-time iris tracking and head pose estimation.

### DeepGaze II / Pretrained Saliency Weights
* **Source**: Kümmerer, M., Wallis, T. S., & Bethge, M. (Bethge Lab, University of Tübingen).
* **License**: **Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA 4.0)**
* **Terms**: Weights and models derived from DeepGaze II are strictly for non-commercial research use. Not bundled in production commercial software.

### Healthy Brain Network (HBN) Dataset
* **Source**: Child Mind Institute ([https://healthybrainnetwork.org](https://healthybrainnetwork.org))
* **License / Terms**: **HBN Data Use Agreement (DUA)**
* **Terms**: Redistribution of raw participant eye-tracking trajectories or clinical profiles is prohibited without institutional agreements. No HBN participant data is hosted or bundled in this repository.

---

## 2. Clinical Screening Instruments & Psychometric Scales

| Instrument | Authors & Citation | Copyright Holder | Repository Implementation & License Status |
| :--- | :--- | :--- | :--- |
| **ASRS-v1.1 (6-Question Screener)** | Kessler, R. C., et al. (2005). *Psychological Medicine*, 35(2), 245–256. | World Health Organization (WHO) & Harvard Medical School | **Free with Conditions**: Free for clinical, research, and non-commercial self-screening use. |
| **AQ-10 (Adult Autism Screener)** | Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). *JAACAP*, 51(2), 202–212. | Autism Research Centre (ARC), University of Cambridge | **Free with Conditions**: Open-access published clinical screening instrument (NICE CG142 recommended). |
| **CAT-Q (Camouflaging Autistic Traits)** | Hull, L., et al. (2019). *Molecular Autism*, 10, Article 43. | Laura Hull et al. | **Open Access**: Published under **Creative Commons Attribution 4.0 International (CC-BY 4.0)**. |
| **M-CHAT-R/F (Toddler Autism)** | Robins, D. L., Fein, D., & Barton, M. L. (2009). *Pediatrics*, 133(1), 37–45. | © 2009 Diana Robins, Deborah Fein, & Marianne Barton | **Permission Pending**: Free for paper clinical use; commercial or electronic integration requires explicit authorization via mchatscreen.com. **Held as marked placeholders.** |
| **AQ-Child (Childhood Autism)** | Auyeung, B., Baron-Cohen, S., et al. (2008). *J Autism Dev Disord*, 38(7), 1230–1240. | Autism Research Centre, University of Cambridge | **Permission Pending**: Electronic distribution pending formal agreement. **Held as marked placeholders.** |
| **RAADS-R (Adult Autism, 80 items)** | Ritvo, R. A., et al. (2011). *J Autism Dev Disord*, 41(8), 884–897. | © 2011 Riva Ariella Ritvo & Western Psychological Services (WPS) | **Permission Pending**: Proprietary clinical diagnostic scale. **Held as marked placeholders.** |
| **AQ-50 (Autism Quotient, 50 items)** | Baron-Cohen, S., et al. (2001). *J Autism Dev Disord*, 31(1), 5–17. | © 2001 Simon Baron-Cohen & Autism Research Centre | **Permission Pending**: Electronic authorization pending. **Held as marked placeholders.** |
| **RBQ-2A (Repetitive Behaviors)** | Barrett, S. L., et al. (2015). *Molecular Autism*, 6, Article 58. | © 2015 Sarah Barrett et al. | **Permission Pending**: **Held as marked placeholders.** |
| **Vanderbilt Assessment Scale** | Wolraich, M. L., et al. (2003). *J Pediatr Psychol*, 28(8), 559–568. | © 2002 American Academy of Pediatrics & NICHQ | **Permission Pending**: **Held as marked placeholders.** |

---

## 3. Core Software & Frontend / Backend Frameworks

| Package | License | Project URL |
| :--- | :--- | :--- |
| **React** | MIT | https://react.dev |
| **Vite** | MIT | https://vite.dev |
| **FastAPI** | MIT | https://fastapi.tiangolo.com |
| **Uvicorn** | BSD-3-Clause | https://www.uvicorn.org |
| **Pydantic** | MIT | https://docs.pydantic.dev |
| **Scikit-Learn** | BSD-3-Clause | https://scikit-learn.org |
| **SHAP** | MIT | https://github.com/shap/shap |
| **HTTPX** | BSD-3-Clause | https://www.python-httpx.org |
| **Lucide React** | ISC | https://lucide.dev |
| **Recharts** | MIT | https://recharts.org |
| **Canvas Confetti** | ISC | https://github.com/catdad/canvas-confetti |
| **Python-Dotenv** | BSD-3-Clause | https://github.com/theskumar/python-dotenv |
