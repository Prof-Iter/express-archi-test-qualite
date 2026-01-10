# Modern Asynchronous TypeScript Best Practices

This guide outlines the recommended approach for handling asynchronous operations in this project, focusing on `async/await` and its integration with our functional programming patterns.

## 1. Favor `async/await` over raw Promises
`async/await` provides a cleaner, more readable syntax that looks and behaves more like synchronous code, making it easier to reason about the execution flow.

### ✅ Recommended: `async/await`
```typescript
async function getProductData(id: number) {
  const product = await repository.findById(id);
  return product.map(p => p.toJSON());
}
```

### ❌ Avoid: Raw `.then()` chains
```typescript
function getProductData(id: number) {
  return repository.findById(id)
    .then(product => product.map(p => p.toJSON()));
}
```

---

## 2. Error Handling

### Standard Approach: `try/catch`
Use `try/catch` for standard imperative code.

```typescript
try {
  const result = await someAsyncOperation();
} catch (error) {
  console.error("Operation failed", error);
}
```

### Functional Approach: `purify-ts` (Preferred)
In our Use Cases and Repositories, we prefer returning `Either` encapsulated in a `Promise`. This makes errors explicit in the type system.

```typescript
async function execute(): Promise<Either<Error, Data>> {
  return ResultAsync.fromPromise(
    api.call(),
    () => new Error("API failure")
  );
}
```

---

## 3. Parallel Execution
Don't `await` sequentially if operations are independent. Use `Promise.all` to execute them in parallel.

### ✅ Correct: Parallel
```typescript
const [products, categories] = await Promise.all([
  productRepo.findAll(),
  categoryRepo.findAll()
]);
```

### ❌ Suboptimal: Sequential
```typescript
const products = await productRepo.findAll(); // Waits for products
const categories = await categoryRepo.findAll(); // Then waits for categories
```

---

## 4. Avoiding the `Promise` Constructor
The `new Promise((resolve, reject) => ...)` constructor should only be used when wrapping old callback-based APIs. For everything else, use `async` functions or `Promise.resolve()`.

---

## 5. Explicit Return Types
Always explicitly define the return type of an async function as `Promise<T>`.

```typescript
// Good
async function save(user: User): Promise<void> { ... }

// Less clear (relying on inference)
async function save(user: User) { ... }
```

---

## 6. Floating Promises (Fire and Forget)
Never leave a Promise "floating" without handling its completion or error. If you truly want to fire and forget, explicitly mark it or use a utility that handles background errors.

```typescript
// Potential danger: if it fails, it might crash the process or leave it in an unstable state
this.logAnalytics(); 

// Better: handle the error even if you don't await the result
this.logAnalytics().catch(err => console.error(err));
```

---

## 7. Integration with `purify-ts`
Since we use `purify-ts`, you will often deal with `Promise<Either<L, R>>`.

- Use `await` to unwrap the Promise.
- Use `.map()`, `.chain()`, `.caseOf()` to work with the `Either` result.

Refer to `docs/purify-ts-quicktour.md` for more details on functional async patterns.
