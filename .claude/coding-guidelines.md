# Coding Guidelines

This document outlines the architectural principles and testing strategies for this project.

## Architecture Principles

The project follows a **Vertical Slice Architecture** combined with **Domain-Driven Design (DDD)** and **Clean Architecture** principles.

### 1. Vertical Slice Architecture
Each feature (use case) is organized into its own self-contained directory. This minimizes coupling between different parts of the system and makes it easier to navigate the codebase.

**Module Structure:**
```
src/module/{domain}/{useCase}/
├── {useCase}Controller.ts        # Express route handler
├── {useCase}UseCase.ts            # Business logic orchestration
├── {useCase}Repository.ts         # Repository interface (Port)
├── {useCase}TypeOrmRepository.ts  # TypeORM implementation (Adapter)
└── test/
    ├── {useCase}.spec.ts          # Unit tests
    └── {useCase}.e2e.spec.ts      # E2E tests
```

### 2. Domain-Driven Design (DDD)
- **Entities**: Domain entities (e.g., `Product.ts`) encapsulate both data and behavior.
- **Validation**: Business rules and data validation are enforced within the entity constructor and methods.
- **Rich Domain Model**: Avoid anemic domain models; entities should handle their own consistency.

### 3. Clean Architecture (Ports & Adapters)
- **Use Cases**: Contain application-specific business logic and orchestrate flow between entities and repositories.
- **Ports**: Use cases depend on repository interfaces (ports), not concrete implementations.
- **Adapters**: Infrastructure details (like TypeORM) are implemented as adapters that satisfy the repository interfaces.
- **Dependency Injection**: Controllers are responsible for instantiating the concrete repositories and injecting them into the use cases.

---

## Testing Strategy

The project employs a dual-layered testing strategy to ensure both logic correctness and system integration.

### 1. Unit Tests (`*.spec.ts`)
- **Scope**: Individual use cases and domain entities.
- **Isolation**: Use test doubles (Mocks/Dummies) for external dependencies like repositories.
- **Goal**: Verify business rules, edge cases, and error handling in total isolation.
- **Convention**: Follow the Given-When-Then (Étant donné / Quand / Alors) pattern.

### 2. E2E Tests (`*.e2e.spec.ts`)
- **Scope**: Full HTTP request/response cycle.
- **Environment**: Uses `@testcontainers/postgresql` to spin up a real, ephemeral database for each test suite.
- **Tools**: `Supertest` for HTTP assertions.
- **Goal**: Ensure the entire stack (Controller -> Use Case -> Repository -> Database) works correctly.
- **Cleanup**: Database state is cleared before/after tests to ensure isolation between test runs.

---

## Code Conventions

### Language
- **Code Identifiers**: English (variables, functions, classes).
- **Messages & Documentation**: French (error messages, test descriptions, comments).

### Naming
- **Use Cases**: `{Action}{Entity}UseCase` (e.g., `CreateProductUseCase`).
- **Repositories**: Interface: `{Action}{Entity}Repository`; Implementation: `{Action}{Entity}TypeOrmRepository`.
- **Controllers**: `{action}{Entity}Controller.ts`.

### Error Handling
- **Domain Layer**: Throw specific errors for validation failures.
- **Application Layer**: Use cases may wrap or re-throw errors with context.
- **Infrastructure/Controller Layer**: Catch errors and map them to appropriate HTTP status codes (400 for validation, 500 for internal errors).
