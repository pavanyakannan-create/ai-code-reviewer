import os
from dotenv import load_dotenv
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

load_dotenv()

class ReviewState(TypedDict):
    code: str
    language: str
    style_review: str
    bug_review: str
    security_review: str
    summary: str

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))

CONCISE_INSTRUCTION = (
    "Be concise. Use short headings and 1-2 lines per point. "
    "Skip a section entirely if there's nothing meaningful to say. "
    "Do not include code refactors or long explanations — just the key points."
)

def review_style(state: ReviewState) -> ReviewState:
    prompt = (
        f"Review this {state['language']} code for style and readability issues only. "
        f"{CONCISE_INSTRUCTION}\n\n{state['code']}"
    )
    response = llm.invoke(prompt)
    return {"style_review": response.content}

def review_bugs(state: ReviewState) -> ReviewState:
    prompt = (
        f"Review this {state['language']} code for potential bugs and logic errors only. "
        f"{CONCISE_INSTRUCTION}\n\n{state['code']}"
    )
    response = llm.invoke(prompt)
    return {"bug_review": response.content}

def review_security(state: ReviewState) -> ReviewState:
    prompt = (
        f"Review this {state['language']} code for security vulnerabilities only. "
        f"{CONCISE_INSTRUCTION}\n\n{state['code']}"
    )
    response = llm.invoke(prompt)
    return {"security_review": response.content}

def summarize(state: ReviewState) -> ReviewState:
    prompt = (
        "Combine these three code reviews into ONE short, well-organized summary. "
        "Use brief headings (Style, Bugs, Security) with 1-2 lines each. "
        "Skip a heading if that section says there's nothing to report. "
        "Keep the whole summary under 150 words.\n\n"
        f"STYLE REVIEW:\n{state['style_review']}\n\n"
        f"BUG REVIEW:\n{state['bug_review']}\n\n"
        f"SECURITY REVIEW:\n{state['security_review']}"
    )
    response = llm.invoke(prompt)
    return {"summary": response.content}

graph = StateGraph(ReviewState)
graph.add_node("review_style", review_style)
graph.add_node("review_bugs", review_bugs)
graph.add_node("review_security", review_security)
graph.add_node("summarize", summarize)

graph.set_entry_point("review_style")
graph.set_entry_point("review_bugs")
graph.set_entry_point("review_security")

graph.add_edge("review_style", "summarize")
graph.add_edge("review_bugs", "summarize")
graph.add_edge("review_security", "summarize")
graph.add_edge("summarize", END)

app_graph = graph.compile()