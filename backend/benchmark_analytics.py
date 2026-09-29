import time
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.quiz import Quiz, QuizAttempt
from app.models.project import Project, DebugJournal
from app.services.analytics_service import AnalyticsService

engine = create_engine('sqlite:///:memory:')
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

user_id = uuid.uuid4()

# Create fake data
user = User(id=user_id, email="test@example.com", hashed_password="pw")
db.add(user)

for i in range(20):
    space_id = uuid.uuid4()
    space = StudySpace(id=space_id, user_id=user_id, title=f"Space {i}")
    db.add(space)

    for j in range(200):
        topic_id = uuid.uuid4()
        topic = Topic(id=topic_id, study_space_id=space_id, user_id=user_id, title=f"Topic {i}-{j}", status="mastered")
        db.add(topic)

        quiz_id = uuid.uuid4()
        quiz = Quiz(id=quiz_id, study_space_id=space_id, topic_id=topic_id, title="Test Quiz")
        db.add(quiz)

        attempt_id = uuid.uuid4()
        attempt = QuizAttempt(id=attempt_id, quiz_id=quiz_id, user_id=user_id, score=85, max_score=100)
        db.add(attempt)

        if j % 2 == 0:
            bug_id = uuid.uuid4()
            bug = DebugJournal(id=bug_id, user_id=user_id, topic_id=topic_id, title="Test bug", problem="Problem desc")
            db.add(bug)

    project_id = uuid.uuid4()
    project = Project(id=project_id, user_id=user_id, study_space_id=space_id, title="Test Project")
    db.add(project)

db.commit()

# Warmup cache
AnalyticsService.check_anti_fake_progress_v2(user_id, db)

# Measure performance
start_time = time.time()
res = AnalyticsService.check_anti_fake_progress_v2(user_id, db)
end_time = time.time()

print(f"Time taken: {end_time - start_time:.4f} seconds")
print(f"Warnings found: {res['weak_areas_count']}")

db.close()
