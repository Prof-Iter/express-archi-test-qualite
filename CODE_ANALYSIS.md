# Codebase Analysis Report

**Date:** Jan 14, 2026
**Scope:** `src/` directory

## 1. Size & Structure (Measurements)

### Lines of Code (CLOC)
*Command:* `npx cloc src`

The codebase is currently small and manageable.

| Language | Files | Blank | Comment | Code |
|----------|-------|-------|---------|------|
| TypeScript | 36 | 547 | 218 | 2479 |
| Markdown | 2 | 138 | 0 | 487 |
| **Total** | **38** | **685** | **218** | **2966** |

### Code Duplication
*Command:* `npx jscpd src`

*   **Status:** ~8% duplication detected.
*   **Findings:** 26 clones found.
*   **Hotspots:** Duplication is primarily located in test DSLs and Scenario files (e.g., `ProductScenario.ts`, `SessionScenario.ts`).
*   **Recommendation:** Refactor common setup and assertion logic in tests into shared helpers to reduce maintenance burden.

### Circular Dependencies
*Command:* `npx madge --circular src`

*   **Status:** Clean.
*   **Findings:** 0 circular dependencies found.
*   **Assessment:** The module architecture (Order, Product, Session) is well-decoupled in terms of import cycles.

---

## 2. Opportunities for Reduction

### Unused Dependencies
*Command:* `npx depcheck`

The following packages are listed in `package.json` but appear unused in the code.

**Dependencies (Runtime):**
*   `mysql`
*   `wait-port`

**DevDependencies:**
*   `supertest`
*   `ts-jest`
*   `testcontainers`
*   `@types/node`
*   `@stryker-mutator/*` packages (unless used in strictly CLI)

*Recommendation:* Verify if these are used in scripts or external configs. If not, remove them to speed up `npm install` and reduce security surface area.

### Dead Code (Unused Exports)
*Command:* `npx ts-prune`

Several exports were found that are not imported by any other file in the project. These are candidates for deletion.

*   **Test Fakes:** `OrderRepositoryDummy`, `ProductRepositoryDummy`
*   **DSL Assertions:** `FailureAssertion` in `UseCaseScenario.ts`
*   **Builders:** Various `*Builder` classes in scenarios may have unused methods.

---

## 3. Executed Recommended Actions

1.  **Cleanup Dependencies:**
    ```bash
    npm uninstall mysql wait-port
    ```
    *(Verify devDependencies usage before removing)*

2.  **Add Complexity Rules:**
    Update `eslint.config.mjs` to warn on high cyclomatic complexity.
    ```js
    rules: {
        "complexity": ["warn", 10],
        // ...
    }
    ```

3.  **Continuous Monitoring:**
    Add an `analyze` script to `package.json` to keep these metrics visible.
    ```json
    "scripts": {
        "analyze": "cloc src && jscpd src && depcheck"
    }
    ```
