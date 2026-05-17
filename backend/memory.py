import os
import videodb
from dotenv import load_dotenv

load_dotenv()

conn = videodb.connect(api_key=os.getenv("VIDEODB_API_KEY"))
coll = conn.get_collection()

def search_my_day(query: str, video_id: str):
    """Searches a specific session."""
    try:
        video = coll.get_video(video_id)
        results = video.search(query=query, index_type="scene")
        return results.get_text()
    except Exception as e:
        return f"Search error: {e}"

def get_tool_timeline(video_id: str):
    """Gets a timeline of tools used."""
    try:
        video = coll.get_video(video_id)
        results = video.search(query="Timeline of AI tools used", index_type="scene")
        return results.get_text()
    except Exception as e:
        return f"Search error: {e}"
