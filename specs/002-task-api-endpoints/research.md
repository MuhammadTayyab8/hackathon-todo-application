# Research Findings: Task API Endpoints

## Decisions

### 1. Task Model
**Decision**: Use SQLModel with UUID primary key and `user_id` foreign key.
**Rationale**: Existing `User` model uses UUID primary keys. Consistency ensures easier integration and future scalability.
**Relationship**: 1:N (One User has Many Tasks). `Task.user_id` references `User.id`.

### 2. Authentication & Authorization
**Decision**: Leverage existing `JWTAuthMiddleware` and `request.state.user_id`.
**Rationale**: Middleware already correctly validates JWTs and populates request state.
**Enforcement**: Verify `path_param.user_id == request.state.user_id` in every endpoint to ensure strict ownership isolation. Allow minimal overhead by reusing existing validated session data.

### 3. Database Access
**Decision**: Dependency injection with `get_session()` from `src/db.py`.
**Rationale**: Standard FastAPI dependency pattern already established in `auth.py`. Handles async session lifecycle management cleanly.

### 4. Frontend API Client
**Decision**: Extend `ApiClient` in `frontend/src/lib/api.ts`.
**Rationale**: Existing client handles base URL and Bearer token insertion automatically.
**Additions Needed**: `put<T>()`, `delete<T>()`, and `patch<T>()` methods are missing and must be added to support full CRUD.

## Alternatives Considered

### Alternative 1: Integer IDs for Tasks
Rejected to maintain consistency with `User` model (UUID). Prevents ID enumeration attacks.

### Alternative 2: Separate Service Layer
Rejected for simplicity. Direct CRUD in route handlers (or small helper functions) is sufficient for current scope. Will refactor if business logic becomes complex.

### Alternative 3: Client-side User ID in Request Body
Rejected for security. User ID must be trusted from the JWT token, not user input. Path parameter is acceptable for RESTfulness but must be validated against the token.
