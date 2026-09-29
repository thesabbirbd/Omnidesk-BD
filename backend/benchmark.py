import time
import uuid
import sys
import os

# Add backend to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.services.command_center import CommandCenterService

# Mock WeaknessDetectorService to return many HIGH severity weaknesses
from app.services.weakness_detector import WeaknessDetectorService

def setup_benchmark():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    user_id = uuid.uuid4()
    user = User(id=user_id, email="test@test.com", hashed_password="pw")
    db.add(user)

    space_id = uuid.uuid4()
    space = StudySpace(id=space_id, user_id=user_id, title="Test Space")
    db.add(space)

    # Create 100 topics
    topics = []
    for i in range(100):
        topic_id = uuid.uuid4()
        topic = Topic(id=topic_id, user_id=user_id, study_space_id=space_id, title=f"Topic {i}")
        db.add(topic)
        topics.append(topic)

    db.commit()

    return db, user_id, topics

def benchmark_n_plus_one():
    db, user_id, topics = setup_benchmark()

    # Mock weakness detector to return weaknesses for all topics
    weaknesses = [
        {"topic_id": str(t.id), "severity": "HIGH", "reasons": ["Test"]}
        for t in topics
    ]

    # Monkey patch detect_weaknesses
    WeaknessDetectorService.detect_weaknesses = lambda u, d: weaknesses

    # Measure
    start_time = time.perf_counter()
    for _ in range(10): # Run 10 times to get a stable reading
        CommandCenterService.get_what_to_study_now(user_id, db)
    end_time = time.perf_counter()

    duration = (end_time - start_time) / 10.0
    print(f"Average time per call: {duration * 1000:.2f} ms")

    return duration

if __name__ == "__main__":
    benchmark_n_plus_one()
