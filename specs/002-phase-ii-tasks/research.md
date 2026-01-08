# Research: Phase II Task Updates & Category Integration

**Feature**: Phase II Task Updates
**Status**: Research Complete

## Technical Decisions

### 1. Database Schema & Migration
- **Decision**: Update `Task` model and introduce `Category` model using SQLModel.
- **Migration Strategy**: Introduce Alembic for schema migrations.
  - *Rationale*: Modifying existing `Task` table (adding columns) requires a migration strategy. `SQLModel.metadata.create_all` only adds new tables, it does not alter existing ones.
  - *Alternative*: Drop and recreate tables (Data loss). Acceptable for local dev, but Alembic is better for "Phase II" maturity.
  - *Selected Approach*: Setup basic Alembic configuration for the backend.

### 2. API Response Strategy (Joins)
- **Decision**: Use `select(Task, Category).join(Category)` queries.
- **Response Model**: Create a `TaskReadWithCategory` Pydantic model that flattens the response or includes `category_name`.
  - *Rationale*: User requested explicitly "include category_name". Flattening is often easier for frontend tables.
  - *Implementation*:
    ```python
    class TaskRead(BaseModel):
        ...
        category_name: Optional[str] = None
    ```
    Query logic will map `task.category.name` to this field or unpack the tuple result.

### 3. Frontend Implementation
- **Context**: Current Frontend lacks Task UI (only Landing/Auth exists).
- **Decision**: Plan tasks to *create* the Task List and Task Form components.
- **Tech**: React Hook Form + Zod for validation.
- **State**: Use a hook (e.g., `useTasks`) to fetch data.

### 4. Category Management
- **Decision**: Need to seed Categories or provide a simple GET endpoint for the form dropdown to work.
- **Assumption**: A simple seed script or `POST /categories` endpoint is needed for the user to select a category. The Spec includes `Category` entity but didn't explicitly mandate CRUD for Categories, only that Tasks reference them. I will include a "List Categories" endpoint plan to support the UI dropdown.

## Unknowns & Clarifications (Resolved)
- *Database State*: Current state is development-only (create_all). Migration to Alembic is planned.
- *Frontend State*: Verified no existing Task UI. Tasks will include creating these components.
