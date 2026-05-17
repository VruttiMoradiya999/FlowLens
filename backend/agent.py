from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.tools import tool
from memory import search_my_day, get_tool_timeline
import os
from dotenv import load_dotenv

load_dotenv()

# Define tools the agent can use
@tool
def search_session(query: str, video_id: str) -> str:
    """Search through the user's recorded session"""
    results = search_my_day(query, video_id)
    return str(results)

@tool  
def get_ai_usage_timeline(video_id: str) -> str:
    """Get timeline of AI tool usage"""
    results = get_tool_timeline(video_id)
    return str(results)

# Create the FlowLens Agent
flowlens_agent = Agent(
    name="FlowLens",
    model=Claude(id="claude-3-5-sonnet-20240620", api_key=os.getenv("ANTHROPIC_API_KEY")),
    tools=[search_session, get_ai_usage_timeline],
    instructions="""
    You are FlowLens — an AI productivity coach who has been 
    watching the user's screen all day.
    
    You have access to their complete session memory through 
    VideoDB's scene search.
    
    Your job is to:
    1. Analyze how they used each AI tool
    2. Score their prompt quality
    3. Detect tool mismatches (wrong tool for the task)
    4. Find their best and worst AI moments
    5. Give 3 sharp, specific, actionable tips for tomorrow
    
    Be honest but encouraging. Give specific examples from 
    what you actually saw. Never be generic.
    
    Always mention: which tool to swap, one prompt rewrite, 
    and their peak productivity moment.
    """,
    markdown=True
)
