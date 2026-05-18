from agent import flowlens_agent
from analyzer import live_data_store
import json

def generate_daily_report(video_id: str):
    """Generate the end-of-day FlowLens report using the agent"""
    
    # Extract actual real-time captured prompts and tools
    live_prompts = live_data_store.get("prompts", [])
    tool_counts = live_data_store.get("tool_counts", {})
    
    prompts_context = json.dumps(live_prompts, indent=2)
    tools_context = json.dumps(tool_counts, indent=2)
    
    response = flowlens_agent.run(
        f"""
        Analyze today's AI usage session.
        Video Session ID: {video_id}
        
        Real-time Captured Live Prompts:
        {prompts_context}
        
        Real-time Tool Usage Counts:
        {tools_context}
        
        Instructions:
        1. Analyze the Captured Live Prompts (if any exist, grade them; if empty, use your VideoDB tools).
        2. Extract a dynamic Mastery Score (out of 100) reflecting their real prompt quality grades.
        3. Format your report dynamically based on the exact tools they used today.
        4. Provide 3 sharp, short, crisp tips tailored directly to their AI usage.
        5. Rewrite their lowest-scoring prompt into a premium prompt.
        6. Do not include introductory or sign-off fluff. Keep it extremely crisp and clean.
        """
    )
    
    return response.content
