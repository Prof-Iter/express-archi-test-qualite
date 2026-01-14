# Mutation Testing Integration with Stryker

## Overview

Add mutation testing to validate the quality of unit tests, ensuring they properly test business rules and domain logic. Using Stryker Mutator - the industry-standard tool for TypeScript/Jest projects.

## Benefits
- Validates that unit tests actually test business rules (price > 0, title length, etc.)
- Ensures test doubles properly validate behavior
- Complements BDD approach with quantitative quality metrics
- Identifies weak spots in test coverage

## Phases Breakdown

### Phase 1: Installation & Basic Setup (~30 min)
1. Install Stryker dependencies
   - `@stryker-mutator/core`
   - `@stryker-mutator/jest-runner`
   - `@stryker-mutator/typescript-checker`
2. Initialize Stryker configuration file (`stryker.config.json`)
3. Configure basic settings (Jest runner, TypeScript checker)
4. Add npm script for running mutation tests

### Phase 2: Configuration Optimization (~30 min)
1. Configure mutation scope (exclude E2E tests, focus on unit tests)
2. Set up coverage analysis mode (`perTest` for performance)
3. Configure mutator options (mutation operators to use)
4. Set mutation score thresholds (quality gates)
5. Configure file patterns (include only `src/module/**` domain logic)

### Phase 3: Initial Run & Analysis (~45 min)
1. Run mutation tests on single small module (e.g., `createProduct`)
2. Analyze mutation score and identify gaps
3. Document baseline mutation scores
4. Create guidelines for interpreting results

### Phase 4: Integration & Documentation (~30 min)
1. Add mutation testing to project documentation
2. Configure incremental mode for faster runs
3. (Optional) Add to CI/CD workflow
4. Update CLAUDE.md with mutation testing guidelines

## Technical Decisions

1. **Scope**: Start with unit tests only (`.spec.ts`), exclude E2E tests (`.e2e.spec.ts`)
2. **Coverage**: Focus on domain entities and use cases in `src/module/**`
3. **Thresholds**: TBD after initial baseline run
4. **Performance**: Use `perTest` coverage analysis and incremental mode