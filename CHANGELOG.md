# Changelog

All notable changes to the StudyOS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.1] - 2026-09-08 — Master Full-Stack Foundation

### Added
- **Repository Audit**: Comprehensive audit document `PROJECT_AUDIT.md` covering frontend, backend, routing, database, and security foundation.
- **SQLAlchemy 2.x Modular ORM Architecture**:
  - Full modular entities with UUID primary keys, foreign keys, timestamps, indexes, and delete-orphan cascades.
  - `User`, `UserProfile`, `UserSettings` for secure user account and preference management.
  - `StudySpace` multi-journey workspace scoping.
  - `Topic`, `TopicDependency` (directed learning DAGs), and `CompetencyItem` (6-stage mastery evidence).
  - `StudyPlan`, `StudyWeek`, `StudyDay`, and `Task` for adaptive workload scheduling.
  - `Material` and `MaterialTopic` for local document/file tracking with hash and MIME checks.
  - `Note` markdown entity with topic and project linking.
  - `Project`, `ProjectTask`, and `DebugJournal` (engineering root cause journal).
  - `StudySession` with timestamps, pause tracking, and presence audit.
  - `Review` (spaced repetition) and `Flashcard` entities.
  - `Quiz`, `QuizQuestion`, and `QuizAttempt` models.
  - `ActivityLog` event stream entity.
- **Security & Authentication**:
  - Secure bcrypt password hashing.
  - JWT access tokens and refresh tokens with expiration.
  - User isolation dependency and authorization verification.
  - UserProfile endpoints (`GET /api/users/profile`, `PUT /api/users/profile`).
- **Alembic Migrations**:
  - Complete PostgreSQL schema migration for v1.3.1 models.
- **Environment Configuration**:
  - Root `.env.example` with development and production guidelines.

### Changed
- Refactored backend settings `VERSION` to `1.3.1`.
- Upgraded models to use SQLAlchemy 2.0 type annotations (`Mapped`, `mapped_column`).

---

## [1.3.0] - 2026-09-08 — Glass Atmosphere & Frontend Refinement

### Added
- Universal Apple iOS-style frosted glass material across all cards, panels, inputs, and drawers.
- 3 selectable glass atmosphere gradients: Cyber Aurora (`aurora`), Sunset Radiant (`sunset`), and Emerald Nebula (`emerald`).
- TopBar atmosphere quick-switch pill and Settings visual configuration.
- Interactive Dashboard Mind Map with status filtering and node expansion.
- Notification Center modal with OS desktop push integration.
- Engineer Profile modal with `admin` password security lock.
- Global timer active mode protection guard.

---

## [1.0.0] - 2026-09-07 — Initial Prototype

### Added
- Initial React frontend and FastAPI prototype for 100-Day Backend → DevOps study track.
