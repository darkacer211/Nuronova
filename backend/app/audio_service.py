import os
import json
import base64
from pathlib import Path
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException
from fastapi.responses import FileResponse

AUDIO_CACHE_DIR = Path(__file__).resolve().parent / "audio_cache"
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

async def synthesize_gemini_audio(
    text: str,
    language: str = "en",
    test_key: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synthesizes speech using Google Gemini Live / REST Audio API.
    Saves and caches the generated audio file to backend/app/audio_cache/.
    """
    gemini_key = (api_key or os.getenv("GEMINI_API_KEY") or "").strip()
    cache_filename = f"{test_key or 'voice_speech'}_{language}.wav"
    cache_path = AUDIO_CACHE_DIR / cache_filename

    # If already cached, return immediately
    if cache_path.exists() and cache_path.stat().st_size > 0:
        return {
            "status": "cached",
            "audio_url": f"/api/v1/audio/cache/{cache_filename}",
            "language": language,
            "test_key": test_key
        }

    if not gemini_key:
        return {
            "status": "no_key",
            "message": "Gemini API key not configured. Using high-fidelity client-side audio engine.",
            "audio_url": None,
            "language": language
        }

    # Call Gemini REST API with audio response modality (gemini-2.0-flash)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
    
    # Prompt instructing Gemini to read out the exact text naturally
    voice_name = "Aoede" if language == "en" else "Puck"
    payload = {
        "contents": [{
            "parts": [{
                "text": f"Read the following clinical instruction out loud in a warm, natural, calm tone in {language}: {text}"
            }]
        }],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": voice_name
                    }
                }
            }
        }
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    for part in parts:
                        inline_data = part.get("inlineData", {})
                        if inline_data.get("mimeType", "").startswith("audio"):
                            audio_b64 = inline_data.get("data")
                            if audio_b64:
                                audio_bytes = base64.b64decode(audio_b64)
                                with open(cache_path, "wb") as f:
                                    f.write(audio_bytes)
                                return {
                                    "status": "generated",
                                    "audio_url": f"/api/v1/audio/cache/{cache_filename}",
                                    "language": language,
                                    "test_key": test_key
                                }
            
            # Fallback if audio modality is unavailable on model
            return {
                "status": "fallback",
                "message": f"Gemini response code {res.status_code}. Using client-side speech engine.",
                "audio_url": None,
                "language": language
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Gemini audio synthesis exception: {str(e)}",
            "audio_url": None,
            "language": language
        }

def get_cached_audio_file(filename: str):
    """Safely retrieves a cached audio file from disk."""
    safe_name = os.path.basename(filename)
    file_path = AUDIO_CACHE_DIR / safe_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    mime_type = "audio/wav" if safe_name.endswith(".wav") else "audio/mpeg"
    return FileResponse(path=file_path, media_type=mime_type, filename=safe_name)
