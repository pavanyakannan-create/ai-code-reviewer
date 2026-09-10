from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, get_db
import models
from graph import app_graph
from auth import hash_password, verify_password

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeInput(BaseModel):
    code: str
    language: str

class UserCreate(BaseModel):
    username: str
    password: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    new_user = models.User(
        username=user.username,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"id": new_user.id, "username": new_user.username}

@app.post("/review")
def review_code(input: CodeInput, db: Session = Depends(get_db)):
    result = app_graph.invoke({
        "code": input.code,
        "language": input.language,
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