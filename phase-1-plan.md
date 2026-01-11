# Phase 1 Plan: Test Implementation for User Story 1 - Création de session

In this phase, we will implement the test for Scenario 1 of User Story 1 using a Domain-Specific Language (DSL) that follows the existing patterns in the project.

## Steps

1. **Analyze Existing Test Patterns** (Done)
   - Reviewed `src/shared/test/dsl/README.md` and `src/shared/test/dsl/createProductScenario.ts`.
   - Identified the Given-When-Then structure and the use of fluent builders.

2. **DSL Infrastructure Setup**
   - **Create `src/shared/test/dsl/SessionScenario.ts`**: This will contain the base classes for Session-specific assertions (`SessionSuccessAssertion`, `SessionAssertions`).
   - **Create `src/shared/test/dsl/createSessionScenario.ts`**: This will be the factory and implementation of the DSL for creating a session, following the `createProductScenario.ts` pattern.
   - **Define temporary interfaces**: Since Phase 2 will handle the implementation, we will define the necessary interfaces (e.g., `Session`, `CreateSessionInput`) within the DSL or in a temporary domain file to ensure type safety in tests.

3. **Check and Prepare Test Directory**
   - Verify that `src/module/session/createSession/test/` directory exists.
   - Create it if it doesn't exist.

4. **Implement the Test File**
   - **Create `src/module/session/createSession/test/createSessionUseCase.spec.ts`**.
   - Implement **Scénario 1 – Création d’une session valide**:
     - **Given**: `noSessions()`
     - **When**: `creating.session({ ... })` with valid date/time, duration, capacity, and price.
     - **Then**: `shouldSucceed()` and verify status is "published" and all values match.

5. **DSL Completion**
   - Ensure the DSL supports all business rules mentioned (date/time, duration, pack count, price, status).
   - Add a `SessionBuilder` for more complex scenarios if needed.

6. **Validation**
   - Present the complete test implementation and the DSL code.
   - Note: Tests will be Red at this stage as Phase 2 (implementation) has not started yet.

## Rules
- No code outside of the test file and the DSL.
- Maintain consistent fluent syntax.
- Ensure the test is readable and matches the user story scenario.
