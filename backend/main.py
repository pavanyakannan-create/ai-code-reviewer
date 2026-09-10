from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, get_db
import models
from graph import app_graph

Base.metadata.create_all(bind=engine)

app = FastAPI()

class CodeInput(BaseModel):
    code: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/review")
def review_code(input: CodeInput, db: Session = Depends(get_db)):
    result = app_graph.invoke({
        "code": input.code,
        "style_review": "",
        "bug_review": "",
        "security_review": "",
        "summary": ""
    })

    review = models.Review(
        code_snippet=input.code,
        review_result=result["summary"]
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return {"id": review.id, "summary": review.review_result}