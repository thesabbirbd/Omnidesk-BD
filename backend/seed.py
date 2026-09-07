from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    # Check if we already have topics
    if db.query(models.Topic).count() > 0:
        print("Database already seeded")
        db.close()
        return

    # Create mock topics
    topics = [
        models.Topic(title="100-Day Backend & DevOps", status="mastered", progress=100),
        models.Topic(title="1. Python & OOP", status="complete", progress=100),
        models.Topic(title="2. Backend (FastAPI)", status="learning", progress=60),
        models.Topic(title="3. Docker & Containers", status="normal", progress=0),
        models.Topic(title="4. Kubernetes Basics", status="blocked", progress=0),
        models.Topic(title="5. CI/CD Pipelines", status="review", progress=20),
    ]

    db.add_all(topics)
    db.commit()

    # Create some mock tasks for FastAPI
    fastapi_topic = db.query(models.Topic).filter(models.Topic.title.contains("FastAPI")).first()
    if fastapi_topic:
        tasks = [
            models.Task(title="Understand REST Principles", is_completed=True, topic_id=fastapi_topic.id),
            models.Task(title="Create basic CRUD endpoints", is_completed=True, topic_id=fastapi_topic.id),
            models.Task(title="Implement JWT Authentication", is_completed=False, topic_id=fastapi_topic.id),
            models.Task(title="Connect to PostgreSQL via SQLAlchemy", is_completed=False, topic_id=fastapi_topic.id),
        ]
        db.add_all(tasks)
        db.commit()

    db.close()
    print("Database successfully seeded with mock topics and tasks.")

if __name__ == "__main__":
    seed()
