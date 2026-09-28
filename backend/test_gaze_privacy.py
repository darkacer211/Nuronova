"""
Backend Unit Test: Attention Lab Network Privacy & Zero-Frame Leakage
Verifies that:
1. Gaze endpoint accepts numerical coordinates and returns descriptive statistics.
2. Gaze endpoint rejects any payload attempting to transmit base64 images or video frames.
3. Strict non-diagnostic regulatory notice is always returned.
"""

import os
import sys

sys.path.append(os.path.dirname(__file__))

from app.services.gaze_service import analyze

def run_gaze_privacy_tests():
    print("=" * 60)
    print(" [TESTS] Running Attention Lab Backend Privacy Tests")
    print("=" * 60)

    # 1. Valid numerical telemetry
    valid_timeseries = [
        {"t": i * 33, "x": 400 + (i % 5), "y": 300 + (i % 5), "on_screen": True}
        for i in range(50)
    ]
    result = analyze(valid_timeseries, stimulus_id="test_stimulus")
    assert result["status"] == "success"
    assert "descriptive_metrics" in result
    assert "regulatory_notice" in result
    assert "ADHD" not in result["descriptive_metrics"]  # Non-diagnostic guarantee
    print("[PASS] 1. Valid numerical gaze telemetry processed without diagnosis")

    # 2. Privacy Leakage Rejection: Reject payload containing base64 image data
    leaked_timeseries = [
        {"t": 100, "x": 200, "y": 200, "frame_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."}
    ]
    rejected = False
    try:
        analyze(leaked_timeseries, stimulus_id="test_stimulus")
    except ValueError as ve:
        if "Privacy Violation" in str(ve):
            rejected = True
    assert rejected is True, "Backend failed to reject illegal video/image frame transmission!"
    print("[PASS] 2. Base64 video/image frame transmission blocked by defensive privacy guard")

    # 3. Regulatory Disclaimer Check
    notice = result.get("regulatory_notice", "")
    assert "NOT a diagnostic tool" in notice
    assert "less precise than clinical" in notice
    print("[PASS] 3. Strict experimental non-diagnostic notice enforced")

    print("\n[SUCCESS] ALL GAZE PRIVACY & TELEMETRY TESTS PASSED!\n")

if __name__ == "__main__":
    run_gaze_privacy_tests()
