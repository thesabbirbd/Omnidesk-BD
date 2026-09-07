from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class StudySpace(Base):
    __tablename__ = "study_spaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)

    topics = relationship("Topic", back_populates="study_space")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    status = Column(String, default="normal") # normal, learning, complete
    progress = Column(Integer, default=0)
    study_space_id = Column(Integer, ForeignKey("study_spaces.id"))

    study_space = relationship("StudySpace", back_populates="topics")
    tasks = relationship("Task", back_populates="topic")
    sessions = relationship("StudySession", back_populates="topic")
    notes = relationship("Note", back_populates="topic")
    materials = relationship("Material", back_populates="topic")

class Dependency(Base):
    __tablename__ = "dependencies"
    id = Column(Integer, primary_key=True, index=True)
    source_topic_id = Column(Integer, ForeignKey("topics.id"))
    target_topic_id = Column(Integer, ForeignKey("topics.id"))

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    is_completed = Column(Boolean, default=False)
    topic_id = Column(Integer, ForeignKey("topics.id"))

    topic = relationship("Topic", back_populates="tasks")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(String, default="planning") # planning, building, complete
    completion_percentage = Column(Integer, default=0)

class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    duration_minutes = Column(Integer, default=0)
    mode = Column(String, default="focus") # focus, pomodoro

    topic = relationship("Topic", back_populates="sessions")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)

    topic = relationship("Topic", back_populates="notes")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    url = Column(String, nullable=True)
    type = Column(String) # video, doc, pdf
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)

    topic = relationship("Topic", back_populates="materials")
