import os
from dotenv import load_dotenv
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

load_dotenv()

# 1. Define the shape of data that flows through the graph
class ReviewState(TypedDict):
    code: str
    review: str

# 2. Create the LLM client (Groq, via LangChain's wrapper)
llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))

# 3. Define a node — a function that takes state, does work, returns updated state
def review_code(state: ReviewState) -> ReviewState:
    prompt = f"Review this code and point out any issues:\n\n{state['code']}"
    response = llm.invoke(prompt)
    return {"code": state["code"], "review": response.content}

# 4. Build the graph: one node, start -> review_code -> end
graph = StateGraph(ReviewState)
graph.add_node("review_code", review_code)
graph.set_entry_point("review_code")
graph.add_edge("review_code", END)

app_graph = graph.compile()

# 5. Run it with sample input
result = app_graph.invoke({"code": "def add(a, b):\n  return a+b", "review": ""})
print(result["review"])