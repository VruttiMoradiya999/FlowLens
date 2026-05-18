from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from capture import start_screen_capture_session, stop_screen_capture_session
from indexer import index_session
from report import generate_daily_report
from memory import search_my_day
from analyzer import continuous_analysis_loop, live_data_store

app = FastAPI(title="FlowLens API")

@app.get("/")
async def root():
    return {
        "message": "FlowLens Backend API is running successfully! 👁️",
        "health": "http://localhost:8000/health",
        "live_prompts": "http://localhost:8000/live_prompts",
        "dashboard_ui": "Please open your frontend dashboard at http://localhost:5173"
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Store current session
current_session = {"video_id": None, "active": False, "analyzer_task": None}

@app.post("/session/start")
async def start_session():
    """Start watching the screen"""
    current_session["active"] = True
    # Start capture in background
    asyncio.create_task(
        asyncio.to_thread(start_screen_capture_session)
    )
    if not current_session["analyzer_task"]:
        current_session["analyzer_task"] = asyncio.create_task(
            asyncio.to_thread(continuous_analysis_loop)
        )
    return {"status": "FlowLens is now watching 👁️"}

@app.post("/session/stop")
async def stop_session():
    """Stop watching and index everything"""
    current_session["active"] = False
    
    # Stop capture and upload to videoDB
    video_id = await asyncio.to_thread(stop_screen_capture_session)
    current_session["video_id"] = video_id
    
    if video_id:
        # Start indexing in the background so the HTTP response returns INSTANTLY to prevent timeouts!
        asyncio.create_task(
            asyncio.to_thread(index_session, video_id)
        )
        return {"status": "Session indexed ✅", "video_id": video_id}
    else:
        return {"status": "Session stopped but upload failed ❌", "video_id": None}

@app.get("/report/{video_id}")
async def get_report(video_id: str):
    """Generate the end-of-day report"""
    report = generate_daily_report(video_id)
    return {"report": report}

@app.get("/search/{video_id}")
async def search_session(video_id: str, query: str):
    """Search your session memory"""
    results = search_my_day(query, video_id)
    return {"results": results}

@app.get("/health")
async def health():
    return {"status": "FlowLens running 🚀"}

@app.get("/live_prompts")
async def get_live_prompts():
    """Get the live analyzed prompt data"""
    return live_data_store
