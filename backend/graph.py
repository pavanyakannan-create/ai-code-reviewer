import os
from dotenv import load_dotenv
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

load_dotenv()

# 1. State now carries results from each stage of the review
class ReviewState(TypedDict):
    code: str
    style_review: str
    bug_review: str
    security_review: str
    summary: str

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))

# 2. One node per concern — each only touches its own field
def review_style(state: ReviewState) -> ReviewState:
    prompt = f"Review this code for style and readability issues only:\n\n{state['code']}"
    response = llm.invoke(prompt)
    return {**state, "style_review": response.content}

def review_bugs(state: ReviewState) -> ReviewState:
    prompt = f"Review this code for potential bugs and logic errors only:\n\n{state['code']}"
    response = llm.invoke(prompt)
    return {**state, "bug_review": response.content}

def review_security(state: ReviewState) -> ReviewState:
    prompt = f"Review this code for security vulnerabilities only:\n\n{state['code']}"
    response = llm.invoke(prompt)
    return {**state, "security_review": response.content}

def summarize(state: ReviewState) -> ReviewState:
    prompt = (
        "Combine these three code reviews into one concise summary with clear headings:\n\n"
        f"STYLE REVIEW:\n{state['style_review']}\n\n"
        f"BUG REVIEW:\n{state['bug_review']}\n\n"
        f"SECURITY REVIEW:\n{state['security_review']}"
    )
    response = llm.invoke(prompt)
    return {**state, "summary": response.content}

# 3. Build the graph: sequential chain of 4 nodes
graph = StateGraph(ReviewState)
graph.add_node("review_style", review_style)
graph.add_node("review_bugs", review_bugs)
graph.add_node("review_security", review_security)
graph.add_node("summarize", summarize)

graph.set_entry_point("review_style")
graph.add_edge("review_style", "review_bugs")
graph.add_edge("review_bugs", "review_security")
graph.add_edge("review_security", "summarize")
graph.add_edge("summarize", END)

app_graph = graph.compile()