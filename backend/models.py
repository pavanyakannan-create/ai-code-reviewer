from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    code_snippet = Column(Text, nullable=False)
    review_result = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())