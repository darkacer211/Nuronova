import os
import io
import json
import base64
import httpx
from fastapi import UploadFile
from app.schemas import TranscribeResponse

async def process_speech_audio(file: UploadFile) -> TranscribeResponse:
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    audio_bytes = await file.read()
    filename = file.filename or "recording.webm"
    raw_content_type = file.content_type or "audio/webm"
    content_type = raw_content_type.split(";")[0].strip() or "audio/webm"
    
    # 1. Attempt Groq Whisper Large v3
    if groq_api_key and len(audio_bytes) > 500:
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                files = {
                    "file": (filename, audio_bytes, content_type)
                }
                data = {
                    "model": "whisper-large-v3-turbo",
                    "response_format": "verbose_json"
                }
                res = await client.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {groq_api_key}"},
                    files=files,
                    data=data
                )
                if res.status_code == 200:
                    json_resp = res.json()
                    text = json_resp.get("text", "").strip()
                    duration = float(json_resp.get("duration", 25.0))
                    words = [w for w in text.split() if w]
                    word_count = len(words)
                    duration_min = max(duration / 60.0, 0.1)
                    wpm = round(word_count / duration_min, 1)
                    hesitations = sum(1 for w in words if w.lower().strip(".,!?") in ["um", "uh", "er", "ah", "like"])

                    return TranscribeResponse(
                        transcript=text,
                        word_count=word_count,
                        speech_rate_wpm=wpm,
                        hesitation_count=hesitations,
                        duration_seconds=round(duration, 1)
                    )
        except Exception:
            pass  # Fall through to Gemini

    # 2. Attempt Google Gemini Audio Transcription
    if gemini_api_key and len(audio_bytes) > 500:
        try:
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

            # 2a. First try gemini-3.5-transcribe (Google's specialized speech transcription model)
            try:
                transcribe_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent?key={gemini_api_key}"
                async with httpx.AsyncClient(timeout=20.0) as client:
                    res = await client.post(
                        transcribe_url,
                        headers={"Content-Type": "application/json"},
                        json={
                            "contents": [{
                                "parts": [
                                    {"inline_data": {"mime_type": content_type, "data": audio_b64}}
                                ]
                            }]
                        }
                    )
                    if res.status_code == 200:
                        candidates = res.json().get("candidates", [])
                        text = ""
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts and isinstance(parts[0], dict):
                                text = parts[0].get("audioTranscription", {}).get("text", "") or parts[0].get("text", "")
                        text = text.strip()
                        words = [w for w in text.split() if w]
                        word_count = len(words)
                        duration = 25.0
                        duration_min = duration / 60.0
                        wpm = round(word_count / duration_min, 1) if word_count > 0 else 0.0
                        hesitations = sum(1 for w in words if w.lower().strip(".,!?") in ["um", "uh", "er", "ah", "like"])
                        return TranscribeResponse(
                            transcript=text,
                            word_count=word_count,
                            speech_rate_wpm=wpm,
                            hesitation_count=hesitations,
                            duration_seconds=round(duration, 1)
                        )
            except Exception:
                pass  # Fall through to multimodal flash models only if transcribe endpoint crashed/unavailable

            # 2b. Fallback to Gemini Flash models if transcribe endpoint is busy or errored
            for model_name in ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"]:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_api_key}"
                    async with httpx.AsyncClient(timeout=15.0) as client:
                        res = await client.post(
                            url,
                            headers={"Content-Type": "application/json"},
                            json={
                                "contents": [{
                                    "parts": [
                                        {"text": "Transcribe ONLY the spoken words in this audio verbatim. If there is no distinct human speech or only silence, output an empty string. Do not reply or converse."},
                                        {"inline_data": {"mime_type": content_type, "data": audio_b64}}
                                    ]
                                }],
                                "generationConfig": {
                                    "temperature": 0.0
                                }
                            }
                        )
                        if res.status_code == 200:
                            candidates = res.json().get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                if parts:
                                    first_part = parts[0]
                                    raw_text = first_part.get("text", "").strip() if isinstance(first_part, dict) else ""
                                    # Filter conversational chatbot phrases
                                    meta_chat_phrases = ["not sure what you mean", "cannot assist", "i cannot", "no spoken words", "no speech", "ambient noise", "there is no audio", "silence", "hello!"]
                                    if any(phrase in raw_text.lower() for phrase in meta_chat_phrases):
                                        raw_text = ""
                                    if raw_text:
                                        words = [w for w in raw_text.split() if w]
                                        word_count = len(words)
                                        duration = 25.0
                                        duration_min = duration / 60.0
                                        wpm = round(word_count / duration_min, 1)
                                        hesitations = sum(1 for w in words if w.lower().strip(".,!?") in ["um", "uh", "er", "ah", "like"])
                                        return TranscribeResponse(
                                            transcript=raw_text,
                                            word_count=word_count,
                                            speech_rate_wpm=wpm,
                                            hesitation_count=hesitations,
                                            duration_seconds=round(duration, 1)
                                        )
                except Exception:
                    continue
        except Exception:
            pass

    # 3. Clean fallback: If no speech was detected or STT could not process,
    # return exact 0 metrics instead of fabricating a fake word count.
    return TranscribeResponse(
        transcript="",
        word_count=0,
        speech_rate_wpm=0.0,
        hesitation_count=0,
        duration_seconds=25.0
    )
