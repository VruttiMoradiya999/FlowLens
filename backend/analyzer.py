import os
import base64
import time
import json
import requests
from dotenv import load_dotenv

load_dotenv()

# Global store for live prompts
live_data_store = {
    "prompts": [],
    "next_id": 1,
    "current_tool": "None",
    "tool_counts": {
        "ChatGPT": 0,
        "Claude": 0,
        "Perplexity": 0
    }
}

def analyze_latest_frame():
    """Reads the latest frame, detects Antigravity/prompts, and updates live data using local Ollama."""
    latest_img = "/tmp/flowlens_latest.jpg"
    if not os.path.exists(latest_img):
        return

    # Check if the file was modified recently (within 10 seconds)
    if time.time() - os.path.getmtime(latest_img) > 10:
        return

    try:
        with open(latest_img, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        print(f"Error reading frame: {e}")
        return

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
        # Use llama3.2-vision (or llava) for local Vision processing
        payload = {
            "model": "llama3.2-vision",
            "messages": [
                {
                    "role": "user",
                    "content": system_prompt,
                    "images": [base64_image]
                }
            ],
            "stream": False,
            "format": "json"
        }
        
        response = requests.post("http://localhost:11434/api/chat", json=payload, timeout=15)
        
        if response.status_code != 200:
            # Fallback to llava
            payload["model"] = "llava"
            response = requests.post("http://localhost:11434/api/chat", json=payload, timeout=15)

        if response.status_code == 200:
            response_data = response.json()
            message_content = response_data["message"]["content"]
            result = json.loads(message_content)
            
            if result.get("is_ai_active"):
                tool = result.get("tool_name", "AI")
                live_data_store["current_tool"] = tool
                
                # Dynamic tool counting
                if tool in live_data_store["tool_counts"]:
                    live_data_store["tool_counts"][tool] += 1
                else:
                    live_data_store["tool_counts"][tool] = 1
                
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
        else:
            print(f"Ollama returned error status: {response.status_code}")
                            
    except requests.exceptions.ConnectionError:
        # Avoid massive traceback spam if Ollama is not yet active/installed
        pass
    except Exception as e:
        print(f"Error analyzing frame via Ollama: {e}")

def continuous_analysis_loop():
    while True:
        analyze_latest_frame()
        time.sleep(10)
