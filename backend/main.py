from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, get_db
import models
from graph import app_graph
from auth import hash_password, verify_password, create_access_token, decode_access_token

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    token = credentials.credentials
    try:
        username = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

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

@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/review")
def review_code(
    input: CodeInput,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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
        review_result=result["summary"],
        user_id=current_user.id
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return {"id": review.id, "summary": review.review_result}
