# Coding Guidelines

This document outlines the architectural principles and testing strategies for this project.

## Test first approach

Always write tests first, then implement the code. Whenever it's unit test, acceptance test, or integration test

## Clean code
 - favor immutable classes (records) and variables
 - favor Builder pattern for complex objects
 - favor fluent interfaces
 - interface segregation, wisely
 - favor pure functions
 - favor composability over inheritance
 - follow the SOLID principles
 - favor the use of design patterns
 - follow the Unix Philosophy, applied to classes and functions (small, focused, single responsibility)
 - favor the use of functional programming
 - favor the use of reactive programming
 - don't hesitate to suggest the use of existing libraries instead of reinventing the wheel 
 - Builder pattern for tests,  do not use directly constructors of entities in tests.
 - `create()` should be used only in UseCases for initial entity creation.
 - Always use the Builder pattern in tests for entity instantiation (except when testing the `create()` method's validation logic).
 - Constructors must not contain any logic, and never throw exceptions.
 - favor the use of dependency injection
 - favor the use of the builder pattern

### the Repository pattern
 - one interface per repository
 - one repository per entity, including all CRUD functions
 - one default implementation per repository, ORM based
 - favor the use of dependency injection
 - catch repository errors and return `Either` (Monad)

## Modern TypeScript style
- use imports instead of require
- use async/await instead of promises
- **Asynchronous Best Practices**: See `docs/async-await-best-practices.md` for a detailed guide on modern async/await patterns.



## Architecture Principles

The project follows a **Vertical Slice Architecture** combined with **Domain-Driven Design (DDD)** and **Clean Architecture** principles.

### Functional Programming & Monads
The project uses `purify-ts` to handle side effects and errors in a type-safe manner.
 - **Error Handling**: Use `Either` (Left/Right) instead of throwing exceptions in Use Cases and Repositories.
 - **Optional Values**: Use `Maybe` (Just/Nothing) instead of `null` or `undefined`.
 - **Repository Errors**: Catch infrastructure-level errors in repositories and wrap them in a `Left`.
 - **Refer to the Guide**: See `docs/purify-ts-quicktour.md` for hands-on examples and patterns.

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
