# Use Case Test DSL

A fluent, expressive DSL (Domain-Specific Language) for writing use case tests that are readable by product owners and eliminate the need for comments.

## Table of Contents

- [Philosophy](#philosophy)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Migration Guide](#migration-guide)
- [Architecture](#architecture)

## Philosophy

### Goals

1. **Comment-free tests** - Code should be self-documenting
2. **Product Owner readable** - Tests should read like Gherkin user stories
3. **Type-safe** - Leverage TypeScript for compile-time safety
4. **Fluent API** - Method chaining that reads like natural language
5. **Consistent structure** - All tests follow the same Given-When-Then pattern

### Design Principles

- **Expressive over concise** - Prioritize readability
- **Fluent over functional** - Chain methods naturally
- **Inline configuration** - Simple scenarios need simple setup
- **Builder pattern** - Complex scenarios use builders
- **Type inference** - Let TypeScript infer types where possible

## Quick Start

### Installation

The DSL is already integrated into the test framework. Simply import the scenario factory for your use case:

```typescript
import { createProductScenario } from '../../../../shared/test/dsl/createProductScenario';
import { updateProductScenario } from '../../../../shared/test/dsl/updateProductScenario';
import { createOrderScenario } from '../../../../shared/test/dsl/createOrderScenario';
import { ERROR_KEYS } from '../../../../shared/i18n/errorKeys';
```

### Basic Example

```typescript
test("création réussie", async () => {
    const result = await createProductScenario()
        .noProducts()
        .when.creating.product({ title: "switch 2", description: "nouvelle console", price: 500 });

    result.shouldSucceed()
        .with.product(p => {
            p.hasTitle("switch 2");
            p.hasPrice(500);
        });
});
```

### Error Handling Example

```typescript
test("échec, titre trop court", async () => {
    const result = await createProductScenario()
        .noProducts()
        .when.creating.product({ title: "sw", description: "nouvelle console", price: 500 });

    result.shouldFail()
        .withError(ERROR_KEYS.PRODUCT_TITLE_TOO_SHORT);
});
```

## API Reference

### Product Scenarios

#### createProductScenario()

Factory function for creating product creation scenarios.

**Given Phase:**
- `.noProducts()` - Start with no products in repository
- `.repositoryFails.onSave()` - Configure repository to fail on save operations
- `.and` - Chain multiple given conditions

**When Phase:**
- `.when.creating.product({ title, description, price })` - Execute product creation

**Then Phase:**
- `.shouldSucceed()` - Assert operation succeeded (returns `Right`)
- `.shouldFail()` - Assert operation failed (returns `Left`)
- `.withError(errorKey)` - Assert specific error key
- `.withRepositoryError()` - Assert any repository error
- `.with.product(assertions)` - Assert product properties

**Product Assertions:**
- `p.hasTitle(expected)` - Assert title matches
- `p.hasDescription(expected)` - Assert description matches
- `p.hasPrice(expected)` - Assert price matches
- `p.hasId(expected)` - Assert ID matches

#### updateProductScenario()

Factory function for updating product scenarios.

**Given Phase:**
- `.noProducts()` - Start with no products
- `.product({ title, description, price }).existsWithId(id)` - Setup existing product
- `.repositoryFails.onSave()` - Configure repository failure

**When Phase:**
- `.when.updating.product({ id, title, description, price })` - Execute product update

**Then Phase:**
Same as `createProductScenario()`.

### Order Scenarios

#### createOrderScenario()

Factory function for creating order scenarios.

**Given Phase:**
- `.noProducts()` - Start with no products
- `.noOrders()` - Start with no orders
- `.product({ title, description, price }).existsWithId(id)` - Setup existing product
- `.repositoryFails.onSave()` - Configure repository failure
- `.and` - Chain multiple given conditions

**When Phase:**
- `.when.creating.order({ id: productId, quantity })` - Execute order creation

**Then Phase:**
- `.shouldSucceed()` - Assert operation succeeded
- `.shouldFail()` - Assert operation failed
- `.withError(errorKey)` - Assert specific error key
- `.withRepositoryError()` - Assert any repository error
- `.with.order(assertions)` - Assert order properties

**Order Assertions:**
- `o.hasTotalPrice(expected)` - Assert total price matches
- `o.hasProductId(expected)` - Assert product ID matches
- `o.hasQuantity(expected)` - Assert quantity matches
- `o.hasId(expected)` - Assert order ID matches

## Examples

### Success Scenarios

#### Simple Creation
```typescript
test("Scénario 1 : création réussie", async () => {
    const result = await createProductScenario()
        .noProducts()
        .when.creating.product({
            title: "switch 2",
            description: "nouvelle console",
            price: 500
        });

    result.shouldSucceed()
        .with.product(p => {
            p.hasTitle("switch 2");
            p.hasDescription("nouvelle console");
            p.hasPrice(500);
        });
});
```

#### Update with Existing Entity
```typescript
test("Scénario 1 : mise à jour réussie", async () => {
    const result = await updateProductScenario()
        .product({ title: "Test Product", description: "Test Description", price: 100 })
            .existsWithId(1)
        .when.updating.product({
            id: 1,
            title: "Updated Title",
            description: "Updated Description",
            price: 150
        });

    result.shouldSucceed()
        .with.product(p => {
            p.hasId(1);
            p.hasTitle("Updated Title");
            p.hasPrice(150);
        });
});
```

#### Order with Product Relationship
```typescript
test("Scénario 1 : création réussie, montant total calculée", async () => {
    const result = await createOrderScenario()
        .product({ title: "test", price: 75 })
            .existsWithId(1)
        .and.noOrders()
        .when.creating.order({ id: 1, quantity: 2 });

    result.shouldSucceed()
        .with.order(o => {
            o.hasTotalPrice(150);
            o.hasProductId(1);
            o.hasQuantity(2);
        });
});
```

### Failure Scenarios

#### Domain Validation Error
```typescript
test("Scénario 2 : echec, titre trop court", async () => {
    const result = await createProductScenario()
        .noProducts()
        .when.creating.product({
            title: "sw",  // Too short
            description: "nouvelle console",
            price: 500
        });

    result.shouldFail()
        .withError(ERROR_KEYS.PRODUCT_TITLE_TOO_SHORT);
});
```

#### Business Rule Violation
```typescript
test("Scénario 2: échec, prix total supérieur ou égal à 200€", async () => {
    const result = await createOrderScenario()
        .product({ title: "test2", price: 100 })
            .existsWithId(2)
        .and.noOrders()
        .when.creating.order({ id: 2, quantity: 2 });  // Total: 200€

    result.shouldFail()
        .withError(ERROR_KEYS.ORDER_PRICE_TOO_HIGH);
});
```

#### Entity Not Found
```typescript
test("Scénario 3 : échec, produit non trouvé", async () => {
    const result = await createOrderScenario()
        .noProducts()
        .and.noOrders()
        .when.creating.order({ id: 999, quantity: 1 });  // Product doesn't exist

    result.shouldFail()
        .withError(ERROR_KEYS.PRODUCT_NOT_FOUND);
});
```

#### Repository Failure
```typescript
test("Scénario 5 : création échouée, échec de sauvegarde", async () => {
    const result = await createProductScenario()
        .noProducts()
        .and.repositoryFails.onSave()
        .when.creating.product({
            title: "switch 2",
            description: "nouvelle console",
            price: 500
        });

    result.shouldFail()
        .withRepositoryError();
});
```

## Migration Guide

### Before: Comment-Based Tests

```typescript
test("Scénario 1 : création réussie", async () => {
    // Étant donné qu'il n'y a pas de produit enregistré
    const createProductRepository = new ProductRepositoryDummy();
    const createProductUseCase = new CreateProductUseCase(createProductRepository);

    // Quand je créé un produit avec en titre «switch 2», description «nouvelle console» et un prix à 500
    const result = await createProductUseCase.execute({
        title: "switch 2",
        description: "nouvelle console",
        price: 500
    });

    // Alors le produit doit être créé (Right)
    expect(result.isRight()).toBe(true);
    result.ifRight(product => {
        expect(product.title).toBe("switch 2");
        expect(product.description).toBe("nouvelle console");
        expect(product.price).toBe(500);
    });
});
```

### After: DSL-Based Tests

```typescript
test("Scénario 1 : création réussie", async () => {
    const result = await createProductScenario()
        .noProducts()
        .when.creating.product({
            title: "switch 2",
            description: "nouvelle console",
            price: 500
        });

    result.shouldSucceed()
        .with.product(p => {
            p.hasTitle("switch 2");
            p.hasDescription("nouvelle console");
            p.hasPrice(500);
        });
});
```

### Migration Steps

1. **Replace imports:**
   ```typescript
   // Before
   import { CreateProductUseCase } from "../createProductUseCase";
   import { ProductRepositoryDummy, ProductRepositoryFail } from "...";

   // After
   import { createProductScenario } from '../../../../shared/test/dsl/createProductScenario';
   ```

2. **Remove repository setup:**
   - Delete manual repository instantiation
   - DSL handles repository setup internally

3. **Replace Given comments with DSL:**
   ```typescript
   // Before: // Étant donné qu'il n'y a pas de produit enregistré
   // After:  .noProducts()
   ```

4. **Replace When comments with DSL:**
   ```typescript
   // Before: const result = await useCase.execute({...});
   // After:  .when.creating.product({...});
   ```

5. **Replace Then assertions with DSL:**
   ```typescript
   // Before: expect(result.isRight()).toBe(true);
   // After:  result.shouldSucceed()
   ```

6. **Use fluent assertions:**
   ```typescript
   // Before: expect(product.title).toBe("switch 2");
   // After:  p.hasTitle("switch 2");
   ```

## Architecture

### Core Framework

The DSL is built on a layered architecture:

```
UseCaseScenario.ts          # Base classes and interfaces
    ├── GivenContext        # Setup phase
    ├── WhenAction          # Execution phase
    ├── ThenAssertion       # Verification phase
    ├── SuccessAssertion    # Success case assertions
    └── FailureAssertion    # Failure case assertions
```

### Domain Extensions

Each domain extends the core framework:

```
ProductScenario.ts          # Product-specific DSL
    ├── ProductGivenContext
    ├── ProductWhenAction
    ├── ProductSuccessAssertion
    └── ProductAssertions

OrderScenario.ts           # Order-specific DSL
    ├── OrderGivenContext
    ├── OrderWhenAction
    ├── OrderSuccessAssertion
    └── OrderAssertions
```

### Concrete Scenarios

Each use case has a scenario factory:

```
createProductScenario.ts   # Product creation scenarios
updateProductScenario.ts   # Product update scenarios
createOrderScenario.ts     # Order creation scenarios
```

### Repository Integration

The DSL integrates with existing test doubles:

- **ProductRepositoryDummy** - Success scenarios
- **ProductRepositoryFail** - Repository failure scenarios
- **ProductRepositoryInMemory** - State-dependent scenarios
- **OrderRepositoryInMemory** - Order state scenarios
- **OrderRepositoryFail** - Order repository failures

## Best Practices

1. **Keep scenarios focused** - One test should verify one behavior
2. **Use descriptive test names** - Maintain French Gherkin-style names
3. **Group related assertions** - Use `.with.product()` or `.with.order()`
4. **Avoid complex setup** - If setup is complex, consider refactoring
5. **Use `.and` for readability** - Chain related given conditions
6. **Verify error keys** - Always assert specific error keys, not just failure
7. **Test repository failures** - Always include repository failure scenarios

## Troubleshooting

### Common Issues

**Issue: Type errors with assertions**
```typescript
// Problem: TypeScript can't infer type
result.shouldSucceed().with.product(p => {
    p.hasTitle("test");  // Error: Property 'hasTitle' does not exist
});

// Solution: Ensure result type is correctly inferred
const result: CreateProductThen = await createProductScenario()...
```

**Issue: Promise not awaited**
```typescript
// Problem: Forgetting to await
const result = createProductScenario()...  // Missing await

// Solution: Always await the scenario
const result = await createProductScenario()...
```

**Issue: `.then` conflicts with Promise**
```typescript
// Problem: Using .then() conflicts with Promise.prototype.then
.when.creating.product({...})
.then.shouldSucceed()  // Error

// Solution: Store result first, then assert
const result = await scenario().when.creating.product({...});
result.shouldSucceed();
```

## Contributing

To add a new scenario:

1. Create scenario factory in `src/shared/test/dsl/`
2. Extend appropriate base classes
3. Implement domain-specific assertions
4. Add examples to `DSL.example.spec.ts`
5. Update this README

## See Also

- [DSL.example.spec.ts](./DSL.example.spec.ts) - Complete working examples
- [coding-guidelines.md](../../../.claude/coding-guidelines.md) - Project coding standards
- [CLAUDE.md](../../../CLAUDE.md) - Project overview and architecture
