import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from typing import List

from app.core.config import settings
from app.core.gemini import stream_gemini_response

app = FastAPI(title="Poteshu")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = "/Users/syamgot/projects/syamgot/Poteshu/frontend"
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

@app.get("/")
async def serve_gui():
    return FileResponse(os.path.join(frontend_path, "index.html"))

class SubtitlePayload(BaseModel):
    text: str
    timestamp: float
    title: str = "YouTube Video"

class ChatPayload(BaseModel):
    message: str

# In-memory buffer for subtitles (keeps last 100 items for context)
subtitle_buffer: List[dict] = []
total_received_count = 0
current_video_title = "Waiting for YouTube..."

@app.post("/clear")
async def clear_buffer():
    global subtitle_buffer
    subtitle_buffer.clear()
    print("\n[Poteshu API] 🧹 AIの記憶（コンテキスト）をリセットしました！")
    return {"status": "cleared"}

@app.post("/subtitle")
async def receive_subtitle(payload: SubtitlePayload):
    global total_received_count, current_video_title
    current_video_title = payload.title
    print(f"\n[Poteshu API] 📝 字幕を受信: {payload.text} (from: {payload.title})")
    
    sub = {"text": payload.text, "timestamp": payload.timestamp, "title": payload.title, "id": total_received_count}
    total_received_count += 1
    
    subtitle_buffer.append(sub)
    if len(subtitle_buffer) > settings.MAX_SUBTITLE_BUFFER_SIZE:
        subtitle_buffer.pop(0) # Keep buffer from growing indefinitely
        
    return {"status": "ok", "received": payload.text}

@app.get("/stream")
async def subtitle_stream(request: Request):
    """SSE endpoint for streaming real-time subtitles to the frontend"""
    async def event_generator():
        global total_received_count, current_video_title
        last_id = total_received_count - 1 # Only stream new items after connection
        
        # Emit current title immediately on connection
        yield f"data: {json.dumps({'type': 'status', 'title': current_video_title})}\n\n"
        
        try:
            while True:
                if await request.is_disconnected():
                    break
                
                new_items = [s for s in subtitle_buffer if s.get("id", -1) > last_id]
                for sub in new_items:
                    payload = json.dumps({'type': 'subtitle', 'text': sub['text'], 'title': sub['title']})
                    yield f"data: {payload}\n\n"
                    last_id = sub["id"]
                    
                await asyncio.sleep(0.5)
        except asyncio.CancelledError:
            # Uvicorn shutdown sends CancelledError, exit gracefully
            pass
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/chat")
async def chat_with_gemini(payload: ChatPayload):
    """Streaming endpoint for AI chat that yields response words in real-time"""
    async def generate():
        async for chunk in stream_gemini_response(subtitle_buffer, payload.message):
            yield chunk
            
    return StreamingResponse(generate(), media_type="text/plain")
