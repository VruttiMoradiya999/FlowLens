import os
import base64
import time
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = None
if os.getenv("OPENAI_API_KEY"):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Global store for live prompts
live_data_store = {
    "prompts": [],
    "next_id": 1,
    "current_tool": "None"
}

def analyze_latest_frame():
    """Reads the latest frame, detects Antigravity/prompts, and updates live data."""
    if not client:
        return
        
    latest_img = "/tmp/flowlens_latest.jpg"
    if not os.path.exists(latest_img):
        return

    # Check if the file was modified recently (within 10 seconds)
    if time.time() - os.path.getmtime(latest_img) > 10:
        return

    with open(latest_img, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

    system_prompt = """
    You are an AI assistant monitoring a user's screen in real-time.
    Look at the screen and determine:
    1. Is the user currently interacting with an AI tool/agent? (e.g. Antigravity, ChatGPT, Claude)
    2. If yes, extract the CURRENT PROMPT the user is typing or has just sent.
    3. Evaluate this prompt and give it a score from 0-100.
    4. Provide an improved version of the prompt.
    5. Provide 2-3 short lessons/bullet points on why the improved version is better.

    IMPORTANT: Only return JSON.
    Format:
    {
      "is_ai_active": true/false,
      "tool_name": "Antigravity",
      "prompt_found": true/false,
      "original_prompt": "extracted prompt",
      "score": 65,
      "improved_prompt": "better prompt",
      "lessons": ["lesson 1", "lesson 2"]
    }
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": system_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            response_format={ "type": "json_object" },
            max_tokens=300
        )
        
        result = json.loads(response.choices[0].message.content)
        
        if result.get("is_ai_active"):
            live_data_store["current_tool"] = result.get("tool_name", "AI")
            
            if result.get("prompt_found") and result.get("original_prompt"):
                orig = result["original_prompt"]
                if len(orig) > 5 and not any(p["original"] == orig for p in live_data_store["prompts"]):
                    import datetime
                    now = datetime.datetime.now().strftime("%I:%M %p")
                    
                    new_prompt = {
                        "id": live_data_store["next_id"],
                        "time": now,
                        "score": result.get("score", 50),
                        "original": orig,
                        "improved": result.get("improved_prompt", ""),
                        "lessons": result.get("lessons", [])
                    }
                    live_data_store["prompts"].insert(0, new_prompt) # Prepend
                    live_data_store["next_id"] += 1
                    
                    if len(live_data_store["prompts"]) > 10:
                        live_data_store["prompts"] = live_data_store["prompts"][:10]
                        
    except Exception as e:
        print(f"Error analyzing frame: {e}")

def continuous_analysis_loop():
    while True:
        analyze_latest_frame()
        time.sleep(10)
