from agent import flowlens_agent

def generate_daily_report(video_id: str):
    """Generate the end-of-day FlowLens report using the agent"""
    
    response = flowlens_agent.run(
        f"""
        Analyze today's AI usage session (video_id: {video_id}).
        
        Search for:
        1. All AI tools used and for how long
        2. Prompt quality patterns
        3. Tool-task mismatches
        4. Frustration or retry moments
        5. Best performing AI interactions
        
        Then generate a complete FlowLens Daily Report with:
        - Overall AI Mastery Score (out of 100)
        - Time breakdown per tool
        - Top 3 insights
        - 3 tips for tomorrow
        - One specific prompt rewrite example
        """
    )
    
    return response.content
