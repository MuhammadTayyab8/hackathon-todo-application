# Quickstart: Phase II Task Updates

## Prerequisites
- Backend: `pip install alembic` (if not present)
- Database: Running Postgres instance.

## Setup
1. **Migrations**:
   - Run `alembic upgrade head` to apply schema changes (after implementation).
   - *Note*: During implementation, we will initialize Alembic.
2. **Seeding**:
   - You may need to create some Categories in the DB before creating Tasks.
   - Use `POST /api/categories` (if implemented) or SQL insert.

## Testing
- Backend: `pytest`
- Frontend: Manual verification at `/tasks` (to be built).
