DSL building

Technical Decisions to Confirm


1. DSL Location: src/shared/test/dsl/ or alongside each module?
   - Recommendation: src/shared/test/dsl/ for shared framework, module-specific extensions in module test folders
2. Generic vs Specific: Single generic DSL vs module-specific DSLs?
   - Recommendation: Generic base + module-specific extensions
3. Async handling: Should .then be async or return a promise?
   - Recommendation: The scenario builder returns a promise, making the entire chain awaitable
4. Error assertions: Granular error types or simple error key matching?
   - Recommendation: Support both for flexibility
5. Repository configuration: Inline or builder-based?
   - Recommendation: Builder-based for complex scenarios, inline for simple cases

Phases Breakdown

Phase 1 (Foundation): ~3-4 hours
- Core DSL classes and interfaces
- Basic Given/When/Then structure
- Generic scenario builder

Phase 2 (Product DSL): ~2-3 hours
- Product-specific extensions
- Refactor 2 Product test files

Phase 3 (Order DSL): ~2-3 hours
- Order-specific extensions with Product relationships
- Refactor 1 Order test file

Phase 4 (Integration): ~1-2 hours
- Repository fake integration
- Ensure seamless interop

Phase 5 (Documentation): ~1 hour
- Write DSL guide
- Document patterns