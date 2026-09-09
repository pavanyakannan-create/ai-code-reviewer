from fastapi import FastAPI
from pydantic import BaseModel
from database import Base, engine
import models
from graph import app_graph  # we'll move the graph here in a moment

Base.metadata.create_all(bind=engine)

app = FastAPI()

class CodeInput(BaseModel):
    code: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/review")
def review_code(input: CodeInput):
    result = app_graph.invoke({
        "code": input.code,
        "style_review": "",
        "bug_review": "",
        "security_review": "",
        "summary": ""
    })
    return {"summary": result["summary"]}