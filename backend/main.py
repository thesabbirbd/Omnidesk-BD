from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Study OS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Legacy route from blueprint if needed
@app.get("/api/roadmap")
def get_roadmap():
    return {
        "title": "100-Day Backend DevOps Engineer",
        "nodes": [
            {"id": "1", "label": "Python & Foundation", "status": 1},
            {"id": "2", "label": "Backend Engineering", "status": 0},
            {"id": "3", "label": "DevOps Foundation", "status": 0}
        ]
    }

# Topics CRUD
@app.get("/api/topics", response_model=List[schemas.TopicResponse])
def get_topics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Topic).offset(skip).limit(limit).all()

@app.post("/api/topics", response_model=schemas.TopicResponse)
def create_topic(topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    db_topic = models.Topic(**topic.model_dump())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

@app.put("/api/topics/{topic_id}", response_model=schemas.TopicResponse)
def update_topic(topic_id: int, topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    db_topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    for key, value in topic.model_dump().items():
        setattr(db_topic, key, value)
    db.commit()
    db.refresh(db_topic)
    return db_topic

# StudySession CRUD
@app.get("/api/sessions", response_model=List[schemas.StudySessionResponse])
def get_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.StudySession).offset(skip).limit(limit).all()

@app.post("/api/sessions", response_model=schemas.StudySessionResponse)
def create_session(session: schemas.StudySessionCreate, db: Session = Depends(get_db)):
    db_session = models.StudySession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session