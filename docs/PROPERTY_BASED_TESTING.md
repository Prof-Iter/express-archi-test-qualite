# Property-Based Testing (PBT) with DSLs

## What is Property-Based Testing?

Property-Based Testing is a testing approach where you:
1. **Define properties** (invariants) that should always hold true
2. **Generate random inputs** that satisfy certain constraints
3. **Verify properties** hold for all generated inputs
4. **Shrink failures** to find minimal failing cases

Unlike example-based tests that check specific cases, PBT explores the **input space** systematically.

## Why PBT with DSLs?

### 1. **Validates Business Rules Comprehensively**
Your DSL encodes business rules (e.g., "price must be 0-10000"). PBT verifies these rules hold for **all** valid/invalid inputs, not just handpicked examples.

**Example**: Instead of testing prices [0, 100, 10000, -1, 10001], PBT tests 100+ random prices in each range.

### 2. **Discovers Edge Cases Automatically**
PBT finds corner cases you didn't think of:
- Empty strings, whitespace-only strings
- Boundary values (exactly 0, exactly 10000)
- Unicode characters, special symbols
- Very large or very small numbers

### 3. **Tests DSL Consistency**
Verifies that your DSL behaves predictably:
- **Idempotence**: Same input → same output
- **Commutativity**: Builder order doesn't matter (if applicable)
- **Equivalence**: Direct input ≡ Fluent builder

### 4. **Regression Prevention**
Once a property is defined, it's tested against infinite variations. If you change code and break an invariant, PBT catches it.

## How It Works with Your Product DSL

### Your Current DSL Structure

```typescript
createProductScenario()
    .noProducts()
    .when.creating.product({ title: "...", description: "...", price: ... })
```

### Business Rules (Properties to Test)

From your code, these invariants exist:
1. **Valid products succeed**: `3 ≤ title.length ≤ 100 ∧ 0 ≤ price ≤ 10000` → Success
2. **Short titles fail**: `title.length < 3` → `PRODUCT_TITLE_TOO_SHORT`
3. **Negative prices fail**: `price < 0` → `PRODUCT_PRICE_TOO_LOW`
4. **High prices fail**: `price > 10000` → `PRODUCT_PRICE_TOO_HIGH`
5. **Repository failures propagate**: Repository error → Test fails with repository error
6. **Builder equivalence**: Direct input ≡ Fluent builder (same result)

### PBT Implementation

```typescript
test("Property: Any valid product should be created successfully", async () => {
    await fc.assert(
        fc.asyncProperty(
            // Generator: Creates random valid products
            fc.record({
                title: fc.string({ minLength: 3, maxLength: 100 }),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.integer({ min: 0, max: 10000 })
            }),
            // Property: This should always hold
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
        { numRuns: 100 } // Test with 100 random valid products
    );
});
```

## Key Concepts

### 1. Generators (`fc.*`)

Generators create random values within constraints:

```typescript
fc.string({ minLength: 3, maxLength: 100 })  // Random strings 3-100 chars
fc.integer({ min: 0, max: 10000 })           // Random integers 0-10000
fc.constantFrom(0, 10000)                     // Exactly 0 or 10000
fc.record({ ... })                            // Random objects
```

### 2. Properties

Properties are assertions that should **always** be true:

```typescript
// Property: "All valid inputs succeed"
async (validInput) => {
    const result = await createProductScenario()...
    result.shouldSucceed();
}

// Property: "All invalid inputs fail with specific error"
async (invalidInput) => {
    const result = await createProductScenario()...
    result.shouldFail().withError(EXPECTED_ERROR);
}
```

### 3. Shrinking

When PBT finds a failing case, it **shrinks** it to the minimal example:

```
Initial failure: { title: "abc", description: "Lorem ipsum...", price: 5000 }
After shrinking: { title: "abc", description: "", price: 0 }
```

This helps you understand the **root cause** faster.

## Advanced PBT Patterns for DSLs

### Pattern 1: Metamorphic Testing

Test relationships between inputs/outputs:

```typescript
test("Property: Doubling price doesn't change validation logic", async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.integer({ min: 0, max: 5000 }),
            async (basePrice) => {
                const result1 = await createProductScenario()
                    .when.creating.product({ title: "test", description: "test", price: basePrice });
                
                const result2 = await createProductScenario()
                    .when.creating.product({ title: "test", description: "test", price: basePrice * 2 });

                // Both should succeed (if basePrice * 2 ≤ 10000)
                if (basePrice * 2 <= 10000) {
                    result1.shouldSucceed();
                    result2.shouldSucceed();
                }
            }
        )
    );
});
```

### Pattern 2: Inverse Operations

Test that operations can be reversed:

```typescript
test("Property: Created product can be retrieved with same data", async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({ title: fc.string({ minLength: 3 }), ... }),
            async (input) => {
                const createResult = await createProductScenario()
                    .when.creating.product(input);
                
                createResult.shouldSucceed();
                
                // If you had a "get product" DSL:
                // const getResult = await getProductScenario()
                //     .when.gettingProductById(createdId);
                // getResult.shouldHaveTitle(input.title);
            }
        )
    );
});
```

### Pattern 3: Commutativity

Test that order doesn't matter (when applicable):

```typescript
test("Property: Builder method order doesn't affect result", async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({ title: fc.string({ minLength: 3 }), description: fc.string(), price: fc.integer({ min: 0, max: 10000 }) }),
            async ({ title, description, price }) => {
                const result1 = await createProductScenario()
                    .when.creating.productWith
                        .title(title)
                        .description(description)
                        .price(price)
                        .execute();

                const result2 = await createProductScenario()
                    .when.creating.productWith
                        .price(price)
                        .title(title)
                        .description(description)
                        .execute();

                // Both should produce identical results
                result1.shouldSucceed();
                result2.shouldSucceed();
            }
        )
    );
});
```

## Running PBT Tests

```bash
# Run all tests (including PBT)
npm test

# Run only PBT tests
npm test -- createProductUseCase.pbt.spec.ts

# Run with verbose output
npm test -- --verbose createProductUseCase.pbt.spec.ts
```

## PBT Configuration

Adjust `numRuns` based on test complexity:
- **Simple properties**: 50-100 runs
- **Complex properties**: 100-500 runs
- **Critical invariants**: 1000+ runs (in CI)

```typescript
{ numRuns: 100, timeout: 5000 }
```

## Benefits in Your Context

### 1. **AI-Generated Tests Validation**
If AI generates DSL test code, PBT verifies the DSL itself is correct before trusting AI-generated tests.

### 2. **Specification Compliance**
User stories define rules. PBT ensures **all** cases (not just examples) comply with those rules.

### 3. **Refactoring Confidence**
When refactoring DSL internals, PBT ensures behavior remains consistent across the entire input space.

### 4. **Documentation**
Properties serve as **executable documentation** of business rules:
```typescript
// This test documents: "Price must be 0-10000"
test("Property: Products with price > 10000 always fail", ...)
```

## Combining PBT with Example-Based Tests

**Best Practice**: Use both approaches

- **Example-based tests**: Document specific scenarios from user stories
- **PBT tests**: Validate invariants across the entire domain

```
createProductUseCase.spec.ts       → Example-based (user story scenarios)
createProductUseCase.pbt.spec.ts   → Property-based (business rule invariants)
```

## Next Steps

1. **Run the PBT tests**: `npm test -- createProductUseCase.pbt.spec.ts`
2. **Add custom properties**: Think about other invariants in your domain
3. **Extend to sessions**: Apply same patterns to `createSessionScenario`
4. **Integrate in CI**: Run PBT on every commit to catch regressions early

## Further Reading

- [fast-check documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing with fast-check](https://dev.to/dubzzz/property-based-testing-with-fast-check-1h9g)
- [An introduction to property-based testing](https://fsharpforfunandprofit.com/posts/property-based-testing/)
