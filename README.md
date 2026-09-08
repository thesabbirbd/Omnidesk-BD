# StudyOS — Universal Learning Operating System
**Version**: 1.2.4  
**Architecture**: Local-First, Backend-Powered Modular Monolith  

StudyOS is a comprehensive, evidence-based learning operating system. Originally developed for the **100-Day Backend → DevOps Engineer** curriculum, StudyOS is engineered to support any course, certification, academic subject, or professional roadmap through its universal StudySpace engine.

---

## 🌟 Core Features

- **Universal StudySpace Engine**: Independent workspaces for roadmaps, courses, and certifications.
- **Interactive Mind Map (React Flow)**: Visual node-based dependency trees with 6-stage status tracking (`NORMAL`, `LEARNING`, `COMPLETE`, `BLOCKED`, `REVIEW`, `MASTERED`).
- **Global Timestamped Timer Engine**: Route-persistent focus sessions, floating draggable HUD, and autonomous camera presence verification.
- **Visual Design System**: 3 distinct tactile themes (Apple iOS Frosted Glass, Tactile Claymorphic, Sleek Neumorphic) with 3 atmospheric mesh gradients (*Cyber Aurora*, *Sunset Radiant*, *Emerald Nebula*).
- **Engineering Debug Journal**: Structured logging of problems, hypotheses, commands, root causes, and lessons learned.
- **Spaced Repetition & Quizzes**: Active recall flashcards and automated chapter self-assessments.
- **Security & User Isolation**: JWT access/refresh tokens with bcrypt password encryption and workspace boundaries.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite 8, Tailwind CSS, Lucide React, React Flow (`@xyflow/react`).
- **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn.
- **Database**: PostgreSQL (`studyos_db` on port 5432) with SQLite fallback capability.
- **Authentication**: JWT (JSON Web Tokens) with HS256, bcrypt password hashing.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # or install dependencies via pip
cp ../.env.example .env
alembic upgrade head
python main.py
```
API Documentation will be available at: `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📄 Documentation
- [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) — Comprehensive repository analysis & health report.
- [CHANGELOG.md](./CHANGELOG.md) — Release notes and milestone progression.
- [VERSION](./VERSION) — Semantic version baseline (1.2.4).
