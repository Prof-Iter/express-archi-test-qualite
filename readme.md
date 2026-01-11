# Express E-commerce API Scaffhold

A robust Express.js e-commerce API built with TypeScript, TypeORM, and PostgreSQL. This project follows Clean Architecture, Domain-Driven Design (DDD) principles, and Vertical Slice Architecture.

## 🚀 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **ORM**: TypeORM 0.3.x
- **Database**: PostgreSQL
- **Testing**: Jest 30.x & Supertest 7.x
- **E2E Testing**: @testcontainers/postgresql

## 🏗️ Architecture

The project is organized using **Vertical Slices**. Each feature lives in its own directory, containing everything it needs from the controller to the repository implementation.

### Module Structure
```
src/module/{domain}/{useCase}/
├── {useCase}Controller.ts        # Express route handler
├── {useCase}UseCase.ts            # Business logic orchestration
├── {useCase}Repository.ts         # Repository interface (port)
├── {useCase}TypeOrmRepository.ts  # TypeORM implementation (adapter)
└── test/
    ├── {useCase}.spec.ts          # BDD with DSL tests
 
```

### Key Principles
- **Domain-Driven Design**: Entities encapsulate business rules and validation.
- **Clean Architecture**: Use Cases depend on abstractions (interfaces), not implementations.
- **Dependency Injection**: Controllers instantiate and inject dependencies into Use Cases.

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Setup

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   Copy the example `.env` to `.env.local`:
   ```bash
   cp .env .env.local
   ```
   *Note: Ensure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PW`, and `DB_NAME` are correctly set in `.env.local`.*

4. **Start the Database**
   ```bash
   docker compose --env-file .env.local up -d
   ```

5. **Run the Application**
   ```bash
   npm run dev
   ```
   The server will start on the port defined in your `.env.local` (default is likely 3000).

6. **Health Check**
   Verify the API is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

## 📜 Available Scripts

- `npm run dev`: Starts the development server with nodemon.
- `npm start`: Starts the production server.
- `npm test`: Runs all tests once.
- `npm run test:watch`: Runs tests in watch mode.

## 🧹 Linter

- `npm run lint`: Runs ESLint on the codebase.
- `npm run lint:fix`: Runs ESLint and fixes any issues it can automatically fix.

## 🧪 Testing Strategy

- **Unit Tests (`*.spec.ts`)**: Focus on business logic in Use Cases and Entities using mocks/dummies for repositories.
- **BDD with DSL (`*.spec.ts`)**: Focus on business logic in Use Cases and Entities using mocks/dummies using fluent DSL , adapted for Product Owners
- **(disabled)  E2E Tests (`*.e2e.spec.ts`)**: Test the full HTTP cycle using Supertest and a real PostgreSQL instance running in a Docker container (via Testcontainers).

## 🛠️ Development Guidelines

- **Language**: Code identifiers are in **English**, but error messages and test descriptions/comments are in **French** (matching the project's convention).
- **Validation**: Business rules should be enforced within the Domain Entities.
- **Errors**: Throw specific errors in the Domain/Use Case layer and catch them in the Controller to return appropriate HTTP status codes (e.g., 400 for validation errors).
