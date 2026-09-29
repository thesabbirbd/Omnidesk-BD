import sys
import os
import uuid
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.insert(0, os.path.abspath("backend"))

from app.models.quiz import Quiz, QuizAttempt
from app.services.knowledge_graph_service import KnowledgeGraphService
from app.db.base import Base

def measure():
    # setup in-memory db
    engine = create_engine('sqlite:///:memory:', echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Needs to match all models imported by get_topic_graph
    from app.models.study_space import StudySpace
    from app.models.topic import Topic

    topic_id = uuid.uuid4()
    user_id = uuid.uuid4()

    space = StudySpace(id=uuid.uuid4(), user_id=user_id, title="Test Space")
    topic = Topic(id=topic_id, study_space_id=space.id, user_id=user_id, title="Test Topic")

    db.add(space)
    db.add(topic)

    # insert many quizzes and attempts to make N+1 obvious
    for i in range(100):
        q = Quiz(id=uuid.uuid4(), study_space_id=space.id, topic_id=topic_id, title=f"Q {i}")
        db.add(q)
        for j in range(5):
            a = QuizAttempt(id=uuid.uuid4(), quiz_id=q.id, user_id=user_id, score=j*10, passed=(j*10 >= 80))
            db.add(a)

    db.commit()

    # Time it
    start = time.time()
    for _ in range(10):
        KnowledgeGraphService.get_topic_graph(topic_id, user_id, db)
    end = time.time()

    print(f"Time taken: {end - start:.4f}s")

if __name__ == '__main__':
    measure()
