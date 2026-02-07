# Property-Based Testing DSL: Before & After

## The Problem

The standard `fast-check` library syntax is powerful but verbose and not domain-friendly:

```typescript
// ❌ Before: Technical, verbose, requires understanding of fast-check API
test("Property: Any valid product should be created successfully", async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({
                title: fc.string({ minLength: 3, maxLength: 100 }),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.integer({ min: 0, max: 10000 })
            }),
            async (productInput) => {
                const result = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                result.shouldSucceed()
                    .with.product(p => {
                        p.hasTitle(productInput.title);
                        p.hasDescription(productInput.description);
                        p.hasPrice(productInput.price);
                    });
            }
        ),
        { numRuns: 100 }
    );
});
```

**Issues:**
- `fc.assert`, `fc.asyncProperty`, `fc.record` - technical jargon
- Generator definitions mixed with test logic
- Not immediately clear what business rule is being tested
- Difficult for non-technical stakeholders to understand

## The Solution

Domain-friendly DSL that hides `fast-check` complexity:

```typescript
// ✅ After: Domain-friendly, readable, self-documenting
test("Property: Any valid product should be created successfully", async () => {
    await forAllValidProducts()
        .shouldAlwaysHold(async (productInput) => {
            const result = await createProductScenario()
                .noProducts()
                .when.creating.product(productInput);

            result.shouldSucceed()
                .with.product(p => {
                    p.hasTitle(productInput.title);
                    p.hasDescription(productInput.description);
                    p.hasPrice(productInput.price);
                });
        });
});
```

**Benefits:**
- `forAllValidProducts()` - clear domain intent
- `.shouldAlwaysHold()` - reads like a business rule
- No `fc.*` boilerplate visible
- Business stakeholders can understand the test

## Complete Comparison

### Test 1: Valid Products Always Succeed

**Before:**
```typescript
await fc.assert(
    fc.asyncProperty(
        fc.record({
            title: fc.string({ minLength: 3, maxLength: 100 }),
            description: fc.string({ minLength: 0, maxLength: 500 }),
            price: fc.integer({ min: 0, max: 10000 })
        }),
        async (productInput) => { /* test logic */ }
    ),
    { numRuns: 100 }
);
```

**After:**
```typescript
await forAllValidProducts()
    .shouldAlwaysHold(async (productInput) => { /* test logic */ });
```

### Test 2: Short Titles Always Fail

**Before:**
```typescript
await fc.assert(
    fc.asyncProperty(
        fc.record({
            title: fc.string({ minLength: 0, maxLength: 2 }),
            description: fc.string({ minLength: 0, maxLength: 500 }),
            price: fc.integer({ min: 0, max: 10000 })
        }),
        async (productInput) => { /* test logic */ }
    ),
    { numRuns: 50 }
);
```

**After:**
```typescript
await forAllProductsWithShortTitle()
    .withRuns(50)
    .shouldAlwaysHold(async (productInput) => { /* test logic */ });
```

### Test 3: Negative Prices Always Fail

**Before:**
```typescript
await fc.assert(
    fc.asyncProperty(
        fc.record({
            title: fc.string({ minLength: 3, maxLength: 100 }),
            description: fc.string({ minLength: 0, maxLength: 500 }),
            price: fc.integer({ min: -10000, max: -1 })
        }),
        async (productInput) => { /* test logic */ }
    ),
    { numRuns: 50 }
);
```

**After:**
```typescript
await forAllProductsWithNegativePrice()
    .withRuns(50)
    .shouldAlwaysHold(async (productInput) => { /* test logic */ });
```

## Architecture

### Layer 1: PropertyBasedScenario (Generic Wrapper)

```typescript
export class PropertyBasedScenario<T> {
    constructor(
        private readonly generator: fc.Arbitrary<T>,
        private readonly config: PropertyTestConfig = {}
    ) {}

    async shouldAlwaysHold(assertion: PropertyAssertion<T>): Promise<void> {
        await fc.assert(
            fc.asyncProperty(this.generator, assertion),
            { numRuns: this.config.runs ?? 100 }
        );
    }

    withRuns(runs: number): PropertyBasedScenario<T> {
        return new PropertyBasedScenario(this.generator, { ...this.config, runs });
    }
}
```

**Purpose:** Encapsulates `fast-check` boilerplate in a fluent, reusable API.

### Layer 2: Domain Generators (Product, Session, etc.)

```typescript
export class ProductPropertyGenerator {
    static validProducts(): PropertyBasedScenario<ProductInput> {
        return new PropertyBasedScenario(
            fc.record({
                title: fc.string({ minLength: 3, maxLength: 100 }),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.integer({ min: 0, max: 10000 })
            })
        );
    }

    static productsWithShortTitle(): PropertyBasedScenario<ProductInput> {
        return new PropertyBasedScenario(
            fc.record({
                title: fc.string({ minLength: 0, maxLength: 2 }),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.integer({ min: 0, max: 10000 })
            })
        );
    }
}
```

**Purpose:** Provides domain-specific generators that encode business rules.

### Layer 3: Convenience Functions

```typescript
export const forAllValidProducts = ProductPropertyGenerator.validProducts;
export const forAllProductsWithShortTitle = ProductPropertyGenerator.productsWithShortTitle;
export const forAllProductsWithNegativePrice = ProductPropertyGenerator.productsWithNegativePrice;
```

**Purpose:** Short, readable function names for test authors.

## Usage Patterns

### Basic Property Test

```typescript
test("Property: Valid products always succeed", async () => {
    await forAllValidProducts()
        .shouldAlwaysHold(async (product) => {
            const result = await createProductScenario()
                .when.creating.product(product);
            result.shouldSucceed();
        });
});
```

### Configuring Test Runs

```typescript
test("Property: Boundary prices are valid", async () => {
    await forAllProductsWithBoundaryPrices()
        .withRuns(20)  // Run fewer tests for boundary cases
        .shouldAlwaysHold(async (product) => {
            const result = await createProductScenario()
                .when.creating.product(product);
            result.shouldSucceed();
        });
});
```

### Combining with Existing DSL

```typescript
test("Property: Repository failures propagate", async () => {
    await forAllValidProducts()
        .withRuns(30)
        .shouldAlwaysHold(async (product) => {
            const result = await createProductScenario()
                .noProducts()
                .and.repositoryFails.onSave()  // ← Existing DSL
                .when.creating.product(product);
            
            result.shouldFail()
                .withRepositoryError();
        });
});
```

## Available Generators

### Product Generators

- `forAllValidProducts()` - Valid products (title ≥ 3, 0 ≤ price ≤ 10000)
- `forAllProductsWithShortTitle()` - Invalid: title < 3 chars
- `forAllProductsWithNegativePrice()` - Invalid: price < 0
- `forAllProductsWithExcessivePrice()` - Invalid: price > 10000
- `forAllProductsWithBoundaryPrices()` - Boundary: price = 0 or 10000

### Session Generators

- `forAllValidSessions()` - Valid sessions (future date, 15-180 min duration)
- `forAllSessionsWithInvalidDuration()` - Invalid: duration < 15 min
- `forAllSessionsWithPastDate()` - Invalid: date in the past

## Extending the DSL

### Adding a New Generator

```typescript
// In PropertyBasedScenario.ts
export class ProductPropertyGenerator {
    // ... existing generators ...

    static productsWithEmptyDescription(): PropertyBasedScenario<ProductInput> {
        return new PropertyBasedScenario(
            fc.record({
                title: fc.string({ minLength: 3, maxLength: 100 }),
                description: fc.constant(""),  // Always empty
                price: fc.integer({ min: 0, max: 10000 })
            })
        );
    }
}

export const forAllProductsWithEmptyDescription = 
    ProductPropertyGenerator.productsWithEmptyDescription;
```

### Using the New Generator

```typescript
test("Property: Empty descriptions are allowed", async () => {
    await forAllProductsWithEmptyDescription()
        .shouldAlwaysHold(async (product) => {
            const result = await createProductScenario()
                .when.creating.product(product);
            result.shouldSucceed();
        });
});
```

## Benefits Summary

### For Developers
- **Less boilerplate**: 60% reduction in test code
- **Better readability**: Tests read like specifications
- **Reusable generators**: Define once, use everywhere
- **Type safety**: Full TypeScript support

### For Domain Experts
- **Understandable tests**: No technical jargon
- **Clear intent**: `forAllValidProducts()` vs `fc.record(...)`
- **Business rules visible**: Generators encode domain constraints

### For AI Code Generation
- **Simpler prompts**: "Test that all valid products succeed"
- **Fewer errors**: Less complex syntax to generate
- **Better alignment**: DSL matches domain language

## Comparison Table

| Aspect | Before (raw fast-check) | After (domain DSL) |
|--------|------------------------|-------------------|
| **Lines of code** | ~15 per test | ~8 per test |
| **Domain clarity** | Low (technical) | High (business) |
| **Learning curve** | Steep (need to learn fast-check) | Gentle (reads like English) |
| **Reusability** | Low (copy-paste generators) | High (shared generators) |
| **Maintainability** | Hard (scattered constraints) | Easy (centralized in generators) |
| **AI generation** | Complex (many APIs to learn) | Simple (few domain functions) |
| **Stakeholder review** | Difficult | Easy |

## Next Steps

1. **Run the tests**: `npm test -- createProductUseCase.pbt.spec.ts`
2. **Add session PBT**: Apply same patterns to session creation
3. **Extend generators**: Add more domain-specific generators as needed
4. **Document in paper**: Add this pattern to the DSL paper as an advanced technique
