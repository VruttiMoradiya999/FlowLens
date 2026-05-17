import os
import videodb
from videodb import SceneExtractionType
from dotenv import load_dotenv

load_dotenv()

conn = videodb.connect(api_key=os.getenv("VIDEODB_API_KEY"))
coll = conn.get_collection()

# These are the AI tools FlowLens knows about
AI_TOOLS = {
    "chatgpt.com": "ChatGPT",
    "claude.ai": "Claude", 
    "perplexity.ai": "Perplexity",
    "midjourney.com": "Midjourney",
    "gemini.google.com": "Gemini",
    "copilot.microsoft.com": "Copilot",
    "cursor.sh": "Cursor"
}

def index_session(video_id: str):
    """
    Takes the recorded session video and asks VideoDB to:
    1. Extract scenes (every meaningful moment)
    2. Understand what's happening in each scene
    3. Store it as searchable memory
    """
    
    video = coll.get_video(video_id)
    
    # Step 1: Extract scenes from the recording
    video.extract_scenes(
        extraction_type=SceneExtractionType.time_based,
        extraction_config={"time": 10},  # Every 10 seconds = one scene
        force=True
    )
    
    # Step 2: Index each scene with AI understanding
    # This is where VideoDB reads each screenshot and understands it
    video.index_scenes(
        extraction_type=SceneExtractionType.time_based,
        extraction_config={"time": 10},
        prompt="""
        Look at this screenshot carefully and tell me:
        1. Which AI tool is visible? (ChatGPT, Claude, Perplexity, etc.)
           If none, say "No AI tool"
        2. What task is the user doing? 
           (writing, coding, research, image generation, summarizing, chatting)
        3. Is a prompt visible? If yes, rate its quality 1-10
           (1=very vague, 10=very specific with context)
        4. Did the user seem to get a good response? 
           (Are they scrolling through it, copying it, or re-prompting?)
        5. Any sign of frustration? (multiple retries, rapid switching)
        
        Reply in this exact format:
        TOOL: [tool name]
        TASK: [task type]  
        PROMPT_QUALITY: [1-10 or N/A]
        GOOD_RESPONSE: [yes/no/unclear]
        FRUSTRATION: [yes/no]
        """
    )
    
    print(f"✅ Session indexed successfully!")
    return video