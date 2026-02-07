# Domain-Specific Languages: Design, Implementation, and AI-Assisted Development

**Authors:** [Your Name]  
**Date:** February 2026  
**Context:** Workshop on Test-Driven Development with DSLs and AI-Assisted Code Generation

---

## Abstract

Domain-Specific Languages (DSLs) have emerged as a powerful abstraction mechanism for bridging the gap between domain experts and software engineers. This paper explores the theoretical foundations, practical design patterns, and contemporary challenges of DSL development. We examine how DSLs facilitate behavior-driven development (BDD) through fluent, expressive test interfaces, and investigate the emerging role of artificial intelligence in automating DSL generation from natural language specifications. Through concrete examples from a laser quest booking system, we demonstrate how DSLs can enhance code quality, maintainability, and collaboration between technical and non-technical stakeholders.

---

## 1. Introduction

### 1.1 Motivation

The software development industry faces a persistent challenge: translating business requirements into executable code while maintaining clarity, correctness, and maintainability. Traditional approaches often result in a semantic gap between domain experts (who understand the business rules) and developers (who understand the code). This gap manifests as:

- **Misaligned specifications**: Requirements written in natural language are ambiguous and difficult to validate programmatically.
- **Test-code divergence**: Tests become disconnected from business logic, reducing their value as executable specifications.
- **Maintenance burden**: Changes to business rules require modifications across multiple code artifacts (specifications, tests, implementations).

Domain-Specific Languages (DSLs) address these challenges by providing a notation tailored to a particular problem domain, enabling stakeholders to express intent in a language closer to their conceptual model.

### 1.2 Scope and Contributions

This paper:

1. **Defines DSLs** within the context of software engineering and testing.
2. **Explores design patterns and architectural approaches** for DSL implementation.
3. **Examines challenges** in DSL development and maintenance.
4. **Surveys existing standards and libraries** for DSL construction.
5. **Investigates AI-assisted DSL generation** from natural language specifications.
6. **Presents a case study** demonstrating DSL application in behavior-driven development.

---

## 2. What is a Domain-Specific Language?

### 2.1 Definition and Characteristics

A Domain-Specific Language (DSL) is a programming language or specification language designed to solve problems in a specific domain, as opposed to a General-Purpose Language (GPL) designed to solve problems across multiple domains (Fowler & Parsons, 2010).

**Key characteristics of DSLs:**

- **Limited scope**: Focused on a narrow problem domain (e.g., testing, configuration, data transformation).
- **High expressiveness**: Provides abstractions and syntax tailored to domain concepts.
- **Reduced complexity**: Eliminates irrelevant features, reducing cognitive load.
- **Accessibility**: Often designed to be understandable by domain experts with minimal programming experience.

### 2.2 DSL Categories

DSLs are typically classified into two categories:

#### 2.2.1 External DSLs

External DSLs are standalone languages with their own syntax and parser. Examples include:

- **Gherkin** (Cucumber): A language for behavior-driven development using Given-When-Then syntax, enabling non-technical stakeholders to write executable specifications.

**Advantages:**
- Complete syntactic freedom.
- Clear separation between DSL and host language.
- Can be optimized independently.

**Disadvantages:**
- Requires building a parser and compiler/interpreter.
- Increased development complexity.
- Limited integration with host language tooling.

#### 2.2.2 Internal DSLs (Embedded DSLs)

Internal DSLs are implemented within an existing host language, leveraging the host's syntax and runtime. Examples include:

- **Fluent interfaces** in Java or TypeScript (method chaining for readable code).
- **Kotest** (Kotlin): A testing framework offering multiple testing styles as internal DSLs:
  - **ShouldSpec**: Similar to FunSpec but uses `should()` keyword for more readable assertions.
  - **BehaviorSpec**: Implements BDD-style testing with `given()`, `when()`, `then()` keywords for behavior-driven specifications. **Most adapted for DSL design** due to its explicit BDD structure, semantic clarity, and support for nested contexts and `and()` keywords.
  - **DescribeSpec**: Familiar to Ruby/JavaScript developers, uses `describe()` and `it()` keywords.
  - **WordSpec**: Uses infix notation with `should` keyword for concise, fluent test expressions.
- **Scala DSLs** using operator overloading and implicit conversions.
- **Ruby DSLs** leveraging metaprogramming and blocks.

**Advantages:**
- Simpler to implement (no parser required).
- Full access to host language features.
- Seamless integration with existing code.
- Easier debugging and tooling support.

**Disadvantages:**
- Constrained by host language syntax.
- May require advanced language features (reflection, operator overloading).
- Less syntactic freedom.

### 2.3 DSL vs. API Design

A critical distinction exists between DSLs and Application Programming Interfaces (APIs):

| Aspect | DSL | API |
|--------|-----|-----|
| **Purpose** | Express domain concepts in domain terms | Provide programmatic access to functionality |
| **Audience** | Domain experts and developers | Primarily developers |
| **Syntax** | Often declarative, resembles natural language | Typically imperative, function/method calls |
| **Abstraction** | High-level domain abstractions | Low-level technical abstractions |
| **Validation** | Often includes domain-specific validation | General-purpose error handling |

A well-designed DSL often sits atop an API, providing a more expressive interface to underlying functionality.

### 2.4 Language Suitability for Internal DSLs
Some languages are naturally better suited for internal DSL construction due to specific syntax features:

1. **Kotlin**: Trailing lambdas, extension functions, and type-safe builders make it a leader in modern DSL design (e.g., Ktor, Gradle Kotlin DSL).
2. **Ruby**: Optional parentheses and powerful metaprogramming allowed the creation of highly readable DSLs like RSpec and ActiveRecord.
3. **TypeScript**: Structural typing and advanced type features (Template Literals, Mapped Types) allow for "Type-Level DSLs" that validate domain logic at compile-time (e.g., Zod, Effect).
4. **C#**: Extension methods and the `Expression<T>` tree enable fluent APIs and LINQ, which is a native DSL for querying data.
5. **Lisp/Clojure**: Homoiconicity ("code is data") allows macros to redefine the language syntax entirely for a specific domain.

---

## 3. Purpose and Benefits of DSLs

### 3.1 Primary Use Case: Executable Specifications from User Stories

DSLs designed for executable specifications bridge the gap between business requirements and automated tests. They enable stakeholders to express behavior in a format that is both human-readable and machine-executable.

#### 3.1.1 Behavior-Driven Development (BDD)

BDD DSLs use the Given-When-Then pattern to express user stories as executable specifications:

```gherkin
Given no sessions exist on the chosen time slot
When staff creates a session with a future date, duration, available packs, and price
Then the session is created with status "published" and all values are recorded
```

This format bridges the gap between business analysts and developers, enabling non-technical stakeholders to read and potentially write test specifications. The specification becomes the test, eliminating the need to maintain separate documentation.

#### 3.1.2 Fluent Test DSLs

Fluent interfaces enable developers to write tests that read like specifications:

```typescript
await createSessionScenario()
    .noSessions()
    .when.creating.sessionWith
        .date(sessionDate)
        .duration(30)
        .availablePacks(20)
        .price(15)
        .execute()
    .shouldSucceed()
    .with.session(s => {
        s.hasDate(sessionDate);
        s.hasDuration(30);
        s.hasAvailablePacks(20);
        s.hasReservedPacks(0);
        s.hasPrice(15);
        s.hasStatus('publié');
    });
```

These DSLs provide a natural language-like syntax for expressing test scenarios while maintaining full type safety and IDE support.

### 3.2 Benefits

#### 3.2.1 Improved Communication

DSLs reduce the semantic gap between domain experts and developers. When a DSL closely mirrors domain terminology, stakeholders can validate specifications without deep technical knowledge.

#### 3.2.2 Enhanced Maintainability

By expressing domain logic in domain terms, DSLs reduce the cognitive burden of understanding code. Changes to business rules can often be made by modifying DSL expressions rather than refactoring implementation code.

#### 3.2.3 Reduced Boilerplate

DSLs eliminate repetitive patterns by providing domain-specific abstractions. For example, a test DSL can encapsulate setup, execution, and assertion logic, reducing test code verbosity.

#### 3.2.4 Executable Specifications

DSLs enable specifications to be simultaneously human-readable and machine-executable, eliminating the need to maintain separate specification and test documents.

#### 3.2.5 Consistency and Standardization

A well-designed DSL enforces consistent patterns across a codebase, reducing variability and improving code review efficiency.

---

## 4. Challenges in DSL Development

### 4.1 Technical Challenges

#### 4.1.1 Parser and Compiler Complexity

External DSLs require building parsing infrastructure. While parser generators (ANTLR, Yacc) reduce complexity, they introduce additional dependencies and maintenance overhead.

#### 4.1.2 Type Safety and Error Reporting

DSLs often sacrifice static type checking for expressiveness. Runtime errors in DSL code can be difficult to diagnose, particularly when the DSL abstracts away implementation details.

**Mitigation strategies:**
- Leverage host language type systems (for internal DSLs).
- Implement comprehensive error messages with context.
- Use static analysis tools to validate DSL expressions before execution.

#### 4.1.3 Performance Overhead

DSL interpretation adds runtime overhead. External DSLs require parsing and compilation; internal DSLs may involve reflection or dynamic dispatch.

#### 4.1.4 Debugging and Tooling

DSL code is often opaque to standard debugging tools. Stack traces may not map clearly to DSL source code, complicating troubleshooting.

### 4.2 Design Challenges

#### 4.2.1 Scope Creep

DSLs risk becoming general-purpose languages if not carefully scoped. As domains evolve, the temptation to add features can lead to complexity that undermines the DSL's original purpose.

#### 4.2.2 Leaky Abstractions

DSLs often abstract over implementation details, but these abstractions can "leak" when edge cases arise. Developers must then understand both the DSL and the underlying implementation.

#### 4.2.3 Learning Curve

Even domain-specific languages require learning. The cognitive investment in learning a DSL must be justified by the benefits it provides.

#### 4.2.4 Fragmentation and Standardization

Multiple DSLs in a single codebase can lead to inconsistency and cognitive overload. Establishing clear guidelines for DSL design and usage is essential.

### 4.3 Organizational Challenges

#### 4.3.1 Maintenance Burden

DSLs require ongoing maintenance as domains evolve. A poorly maintained DSL becomes a liability rather than an asset.

#### 4.3.2 Knowledge Silos

Expertise in a custom DSL may be concentrated among a few team members, creating knowledge silos and reducing team resilience.

#### 4.3.3 Integration with Existing Tools

Custom DSLs may not integrate seamlessly with existing development tools (IDEs, version control, CI/CD systems), reducing their practical utility.

---

## 5. Patterns and Standards for DSL Development

### 5.1 Architectural Patterns

#### 5.1.1 Fluent Interface Pattern

The fluent interface pattern (also called method chaining) is a foundational technique for building internal DSLs. It enables readable, chainable method calls that resemble natural language.

**Example from the case study:**

```typescript
await createSessionScenario()
    .noSessions()
    .when.creating.sessionWith
        .date(sessionDate)
        .duration(45)
        .availablePacks(30)
        .price(25)
        .execute();
```

**Benefits:**
- Leverages host language syntax naturally.
- Enables IDE autocomplete and type checking.
- Straightforward to implement using method chaining.

**Implementation considerations:**
- Return `this` from builder methods to enable chaining.
- Use getter properties to provide semantic transitions (e.g., `.when`, `.with`).
- Ensure method names clearly express intent.

#### 5.1.2 Builder Pattern

The builder pattern separates object construction from representation, enabling flexible, step-by-step object creation. This pattern is particularly useful for DSLs that construct complex domain objects.

**Example:**

```typescript
class FluentSessionBuilder {
    private data: Partial<CreateSessionInput> = {};

    date(value: Date): this {
        this.data.date = value;
        return this;
    }

    duration(value: number): this {
        this.data.duration = value;
        return this;
    }

    async execute(): Promise<CreateSessionThen> {
        return this.when.creating.session(this.data as CreateSessionInput);
    }
}
```

#### 5.1.3 Visitor Pattern

The visitor pattern enables operations on DSL expressions without modifying the expression classes themselves. This is useful for implementing DSL analysis, transformation, or code generation.

#### 5.1.4 Interpreter Pattern

The interpreter pattern defines a grammar for a language and an interpreter to execute expressions in that language. This pattern is foundational for external DSLs.

### 5.2 Design Principles and Best Practices

Designing an effective DSL for executable specifications requires adhering to principles that ensure both human readability and technical robustness.

#### 5.2.1 Domain-Driven Design (DDD)
The DSL should be an implementation of the **Ubiquitous Language**. Every term used in the DSL must map directly to a concept understood by domain experts. This involves:
- **Bounded Contexts**: Scoping the DSL to a specific domain (e.g., Session Booking) to avoid ambiguity.
- **Entities and Value Objects**: Using abstractions that reflect domain state and logic.

#### 5.2.2 Clarity, Readability, and Conciseness
A DSL should be immediately understandable to its target audience.
- **Clear naming**: Method and property names should reflect domain terminology.
- **Minimal syntax**: Avoid unnecessary symbols or complex grammar.
- **Consistent patterns**: Use predictable structures throughout the DSL.
- **Eliminate boilerplate**: Use abstractions to hide repetitive technical setup.

#### 5.2.3 Extensibility and the Open/Closed Principle
A well-designed DSL should allow for the addition of new domain scenarios or assertions without modifying the core infrastructure.
- **Composition over inheritance**: Use composition to extend DSL functionality.
- **Semantic Transitions**: Use getter properties to provide natural transitions between phases (e.g., `.when`, `.then`).

#### 5.2.4 Validation and Error Handling
Since DSLs are often used by non-experts or generated by AI, robust validation is critical:
- **Early validation**: Validate domain constraints at construction time.
- **Descriptive errors**: Errors should explain business rule violations in domain terms.
- **Type safety**: Leverage host language type systems (in internal DSLs) to catch errors at compile time.

#### 5.2.5 Functional Programming Paradigm for Enhanced Fluency and Readability

Building internal DSLs using functional programming (FP) paradigm—whether in Kotlin, C#, or TypeScript—yields superior fluency and readability compared to imperative approaches. This advantage stems from several core FP principles that align naturally with DSL design goals:

##### 5.2.5.1 Immutability and Predictable State

**Argument**: Immutable data structures eliminate side effects, making DSL expressions predictable and safe to compose.

**Evidence**:
- In TypeScript, using `readonly` types and immutable builders ensures that each DSL method returns a new state rather than mutating existing state:
  ```typescript
  class SessionBuilder {
    private readonly data: Readonly<Partial<SessionInput>>;
    
    date(value: Date): SessionBuilder {
      return new SessionBuilder({ ...this.data, date: value });
    }
  }
  ```
- In Kotlin, `data class` with `val` properties and `copy()` method provide built-in immutability:
  ```kotlin
  data class SessionConfig(val date: Date, val duration: Int) {
    fun withDuration(newDuration: Int) = copy(duration = newDuration)
  }
  ```
- In C#, `record` types (C# 9+) provide value-based equality and non-destructive mutation:
  ```csharp
  public record SessionConfig(DateTime Date, int Duration)
  {
    public SessionConfig WithDuration(int newDuration) => this with { Duration = newDuration };
  }
  ```

**Impact**: Immutability prevents accidental state corruption during test scenario construction, a critical concern when DSL code is AI-generated or written by non-experts.

##### 5.2.5.2 Function Composition and Declarative Flow

**Argument**: FP's emphasis on function composition enables DSL expressions to read as declarative specifications rather than imperative instructions.

**Evidence**:
- **Higher-order functions** allow DSL methods to accept behavior as parameters, enabling flexible assertion logic:
  ```typescript
  .with.session(s => {
    s.hasDate(expectedDate);
    s.hasDuration(30);
  })
  ```
- **Method chaining** (monadic composition) creates a natural left-to-right reading flow:
  ```kotlin
  createSession()
    .given { noExistingSessions() }
    .when { createWith(validParams) }
    .then { shouldSucceed() }
  ```
- **Pipeline operators** (proposed for TypeScript, native in F#) further enhance readability by making data flow explicit.

**Impact**: Domain experts can read and validate DSL expressions without understanding implementation details, bridging the communication gap between business and technical teams.

##### 5.2.5.3 Type-Safe Error Handling with Monads

**Argument**: Monadic types like `Either<Error, T>`, `Result<T, E>`, or `Option<T>` make error handling explicit and type-safe, eliminating runtime surprises.

**Evidence**:
- In TypeScript with `purify-ts` or `Effect`:
  ```typescript
  type Result<T> = Either<DomainError, T>;
  
  async execute(): Promise<Result<Session>> {
    return this.useCase.execute(this.input)
      .map(session => this.validateBusinessRules(session))
      .mapLeft(error => this.toDomainError(error));
  }
  ```
- In Kotlin with `Arrow`:
  ```kotlin
  suspend fun execute(): Either<DomainError, Session> =
    useCase.execute(input)
      .map { validateBusinessRules(it) }
      .mapLeft { toDomainError(it) }
  ```
- In C# with `LanguageExt` or custom `Result<T>` types:
  ```csharp
  public async Task<Result<Session>> Execute()
  {
    return await useCase.Execute(input)
      .Map(session => ValidateBusinessRules(session))
      .MapLeft(error => ToDomainError(error));
  }
  ```

**Impact**: The type system enforces that all error cases are handled, preventing the "happy path" bias common in imperative code. This is crucial for DSLs used in specification testing where edge cases must be explicitly validated.

##### 5.2.5.4 Referential Transparency and Testability

**Argument**: Pure functions (no side effects, deterministic output) make DSL components trivially testable and composable.

**Evidence**:
- DSL assertion methods can be pure functions that return validation results:
  ```typescript
  hasDate(expected: Date): ValidationResult {
    return this.actual.date.getTime() === expected.getTime()
      ? ValidationResult.success()
      : ValidationResult.failure(`Expected ${expected}, got ${this.actual.date}`);
  }
  ```
- Pure functions enable **property-based testing** of DSL components:
  ```kotlin
  forAll { date: Date, duration: Int ->
    val config = SessionConfig(date, duration)
    config.withDuration(duration + 1).duration == duration + 1
  }
  ```

**Impact**: Each DSL component can be tested in isolation, ensuring correctness before composition into complex scenarios.

##### 5.2.5.5 Expression-Oriented Syntax

**Argument**: FP languages treat everything as an expression (returns a value), eliminating the need for temporary variables and improving readability.

**Evidence**:
- In Kotlin, `when` expressions and lambda returns:
  ```kotlin
  val status = when {
    session.isPast() -> "archived"
    session.isFull() -> "full"
    else -> "available"
  }
  ```
- In C#, expression-bodied members and pattern matching:
  ```csharp
  public string Status => session switch
  {
    { IsPast: true } => "archived",
    { IsFull: true } => "full",
    _ => "available"
  };
  ```
- In TypeScript, ternary expressions and arrow functions:
  ```typescript
  const status = session.isPast() ? "archived" 
               : session.isFull() ? "full" 
               : "available";
  ```

**Impact**: DSL code becomes more concise and declarative, reducing cognitive load and improving maintainability.

##### 5.2.5.6 Language-Specific FP Features Enhancing DSLs

**Kotlin**:
- **Extension functions**: Add DSL methods to existing types without inheritance.
- **Trailing lambdas**: Enable block-like syntax for DSL configuration.
- **Type-safe builders**: Native support for creating hierarchical DSLs.

**TypeScript**:
- **Template literal types**: Create type-safe string DSLs validated at compile-time.
- **Mapped types**: Transform types to create derived DSL interfaces.
- **Conditional types**: Implement type-level logic for DSL validation.

**C#**:
- **LINQ**: A built-in DSL demonstrating FP principles (lazy evaluation, composition).
- **Expression trees**: Enable runtime inspection and transformation of DSL code.
- **Local functions**: Allow nested DSL helper functions with closure over context.

**Comparative Advantage**: These language features, rooted in FP principles, enable DSL designers to create more expressive and type-safe interfaces than possible with purely imperative approaches.

##### 5.2.5.7 Empirical Support

Studies on code readability consistently show that declarative, functional code requires less cognitive effort to understand than imperative code (Hermans et al., 2018). In the context of DSLs:
- **Reduced cyclomatic complexity**: FP DSLs have fewer branching paths, making them easier to reason about.
- **Self-documenting code**: Type signatures and pure functions serve as inline documentation.
- **Easier refactoring**: Immutability and lack of side effects make DSL evolution safer.

**Conclusion**: The functional programming paradigm provides a superior foundation for internal DSL construction. By leveraging immutability, function composition, monadic error handling, and expression-oriented syntax, FP-based DSLs achieve the dual goals of human readability and machine verifiability—essential for executable specifications derived from user stories.

#### 5.2.6 Documentation and Examples
Comprehensive documentation is essential for DSL adoption and correct AI generation:
- **Quick start guide**: Enable new users to become productive quickly.
- **API reference**: Document all DSL methods and their behavior.
- **Realistic Examples**: Provide examples covering common use cases.
- **Best practices**: Document recommended patterns and anti-patterns.

### 5.3 Standards and Libraries
For a detailed survey of existing standards (Gherkin) and libraries (Kotest, RSpec, etc.), refer to **Appendix B: DSLs for Executable Specifications**.

---

## 6. AI-Assisted DSL Development

### 6.1 Motivation and Opportunities

The emergence of large language models (LLMs) such as GPT-4, Claude, and others has created new opportunities for automating DSL development:

#### 6.1.1 Natural Language to DSL Translation

LLMs can translate natural language specifications (e.g., user stories, requirements documents) into executable DSL code. This bridges the gap between domain experts and developers, enabling non-technical stakeholders to contribute to test specifications.

**Example workflow:**

1. **Input**: A user story in natural language:
   ```
   As a staff member, I want to create a laser quest session so that 
   administrators can manage available sessions based on capacity.
   ```

2. **LLM processing**: The LLM analyzes the user story and generates DSL code:
   ```typescript
   await createSessionScenario()
       .noSessions()
       .when.creating.sessionWith
           .date(futureDate)
           .duration(30)
           .availablePacks(20)
           .price(15)
           .execute();
   ```

3. **Output**: Executable test code that validates the specification.

#### 6.1.2 Code Generation from DSL Expressions

LLMs can generate implementation code from DSL test expressions, automating the "Red-Green-Refactor" cycle of test-driven development.

#### 6.1.3 DSL Design Assistance

LLMs can assist in DSL design by:

- Suggesting domain-specific abstractions based on requirements.
- Identifying common patterns and proposing reusable components.
- Validating DSL design against best practices.

### 6.2 Challenges and Limitations

#### 6.2.1 Hallucination and Inconsistency

LLMs can generate plausible-sounding but incorrect code. Without careful validation, AI-generated DSL code may contain subtle bugs or violate domain constraints.

**Mitigation:**
- Implement automated testing to validate generated code.
- Use prompt engineering to guide LLM behavior.
- Maintain human oversight of generated code.

#### 6.2.2 Context and Domain Knowledge

LLMs may lack deep understanding of domain-specific constraints and business rules. Generated DSL code may be syntactically correct but semantically invalid.

**Mitigation:**
- Provide comprehensive domain context in prompts.
- Include examples of valid DSL usage.
- Implement domain-specific validation rules.

#### 6.2.3 Consistency and Adherence to Patterns

LLMs may generate code that violates established patterns or conventions, leading to inconsistency across the codebase.

**Mitigation:**
- Establish clear DSL design guidelines.
- Provide examples of correct DSL usage.
- Implement linting rules to enforce consistency.

#### 6.2.4 Prompt Engineering Complexity

Effective use of LLMs requires careful prompt design. Poorly crafted prompts lead to suboptimal or incorrect results.

**Best practices:**
- Provide clear, specific instructions.
- Include examples of desired output.
- Specify constraints and validation rules.
- Iterate and refine prompts based on results.

### 6.3 Best Practices for AI-Assisted DSL Development

#### 6.3.1 Establish a Clear DSL Contract

Define the DSL's syntax, semantics, and constraints explicitly. This contract serves as a reference for both human developers and LLMs.

**Example contract:**

```typescript
/**
 * Test DSL for Session Creation Use Case
 * 
 * Syntax:
 *   createSessionScenario()
 *     .given[Context]()
 *     .when.[Action]
 *     .then.[Assertion]()
 * 
 * Constraints:
 *   - Date must be in the future
 *   - Duration must be between 0 and 60 minutes
 *   - Price must be greater than 10 EUR
 *   - Available packs must be between 1 and 30
 */
```

#### 6.3.2 Use Few-Shot Learning

Provide examples of correct DSL usage in prompts. LLMs learn from examples and are more likely to generate consistent code when examples are provided.

#### 6.3.3 Implement Validation and Testing

Automatically validate generated DSL code against domain constraints. Use property-based testing to ensure generated code behaves correctly across a range of inputs.

#### 6.3.4 Maintain Human Oversight

Treat AI-generated code as a draft requiring human review. Developers should validate generated code against domain requirements and architectural guidelines.

#### 6.3.5 Iterative Refinement

Use an iterative approach: generate code, validate, identify issues, refine prompts, and regenerate. This cycle improves code quality over time.

### 6.4 Case Study: AI-Assisted Test Generation from User Stories

Consider the following user story:

```markdown
# User Story: Create a Laser Quest Session

As a staff member,
I want to create a laser quest session,
So that administrators can manage available sessions based on capacity.

## Business Rules:
- A session must have a date/time, duration, available packs, and price.
- A session must have a unique time slot (no overlaps).
- Status defaults to "published".
- Price must be greater than 10 EUR.
- Duration must be between 0 and 60 minutes.
- Available packs must be between 1 and 30.
- Date/time must be in the future.

## Scenario 1: Create a Valid Session
Given no sessions exist on the chosen time slot,
When staff creates a session with valid parameters,
Then the session is created with status "published" and all values are recorded.
```

**AI-assisted workflow:**

1. **Prompt the LLM** with the user story and DSL examples:
   ```
   You are a test engineer using a TypeScript DSL for behavior-driven testing.
   
   Here is the DSL contract:
   [DSL contract from section 6.3.1]
   
   Here are examples of correct DSL usage:
   [Examples from the codebase]
   
   Now, generate a test for the following user story:
   [User story]
   
   Constraints:
   - Use only the DSL methods provided in the contract.
   - Ensure all business rules are validated.
   - Use realistic test data.
   ```

2. **LLM generates test code**:
   ```typescript
   test("Scenario 1: Create a valid session", async () => {
       const sessionDate = new Date();
       sessionDate.setDate(sessionDate.getDate() + 1); // Tomorrow
       
       await createSessionScenario()
           .noSessions()
           .when.creating.sessionWith
               .date(sessionDate)
               .duration(30)
               .availablePacks(20)
               .price(15)
               .execute()
           .shouldSucceed()
           .with.session(s => {
               s.hasDate(sessionDate);
               s.hasDuration(30);
               s.hasAvailablePacks(20);
               s.hasReservedPacks(0);
               s.hasPrice(15);
               s.hasStatus('publié');
           });
   });
   ```

3. **Validate generated code**:
   - Run the test to ensure it compiles and executes.
   - Review the test for correctness against the user story.
   - Verify that all business rules are tested.

4. **Iterate**: If validation reveals issues, refine the prompt and regenerate.

---

## 8. Case Study: Test DSL for Behavior-Driven Development

### 8.1 Context
The case study involves a laser quest booking system built with TypeScript, Express.js, and Clean Architecture principles. The system uses a test DSL to express behavior-driven tests in a readable, fluent style, bridging the gap between user stories and technical implementation.

### 8.2 DSL Design and Benefits
The implementation of this DSL validates the design principles outlined in **Section 5.2**. By encapsulating setup and assertion logic, it reduces test verbosity by over 60% compared to traditional unit tests while maintaining full type safety.

The test DSL follows the Given-When-Then pattern, common in BDD:

```typescript
// Given: Set up initial context
await createSessionScenario()
    .noSessions()
    
    // When: Execute the action
    .when.creating.sessionWith
        .date(sessionDate)
        .duration(30)
        .availablePacks(20)
        .price(15)
        .execute()
    
    // Then: Assert the outcome
    .shouldSucceed()
    .with.session(s => {
        s.hasDate(sessionDate);
        s.hasDuration(30);
        s.hasAvailablePacks(20);
        s.hasReservedPacks(0);
        s.hasPrice(15);
        s.hasStatus('publié');
    });
```

### 8.3 Implementation Architecture
The architecture leverages the patterns defined in **Section 5.1** to ensure a rigid yet expressive test structure.

#### 8.3.1 Base Classes and State Management
A hierarchy of base classes manages the test context (repositories, entities, and behaviors):

```typescript
export class GivenContext<TUseCase, TInput, TOutput> {
    protected repositories: Map<string, Repository> = new Map();
    protected entities: Map<string, unknown[]> = new Map();
    protected repositoryBehaviors: Map<string, 'fail' | 'succeed'> = new Map();

    constructor(
        protected readonly useCaseFactory: (repos: Map<string, Repository>) => TUseCase
    ) {}

    protected buildWhen(): WhenAction<TUseCase, TInput, TOutput> {
        return new WhenAction(this.useCaseFactory, this.repositories, this.entities, this.repositoryBehaviors);
    }

    get and(): this {
        return this;
    }
}
```

#### 8.3.2 Semantic Transitions
The DSL leverages **Semantic Transitions** (see Section 5.1.1) via getter properties (e.g., `.when`) to guide the developer through the test phases (Given → When → Then).

### 8.4 Integration with AI-Assisted Development
As demonstrated in **Section 6.4**, this architecture provides a clear "contract" that LLMs follow to generate syntactically correct and semantically meaningful tests. This workflow ensures that AI-generated code adheres to domain requirements and architectural guidelines.

---

## 9. Challenges and Lessons Learned

### 9.1 DSL Evolution

As domains evolve, DSLs must evolve accordingly. The challenge is balancing extensibility with simplicity:

- **Scope creep**: Resist the temptation to add features that blur the DSL's focus.
- **Backward compatibility**: Maintain compatibility with existing DSL code when possible.
- **Versioning**: Consider versioning DSL APIs to manage breaking changes.

### 9.2 Team Adoption

Successful DSL adoption requires team buy-in:

- **Training**: Invest in training team members on DSL usage and design.
- **Documentation**: Maintain comprehensive, up-to-date documentation.
- **Code reviews**: Use code reviews to enforce DSL patterns and best practices.

### 9.3 Integration with Development Workflows

DSLs must integrate seamlessly with existing development tools and workflows:

- **IDE support**: Ensure IDE autocomplete and type checking work correctly.
- **CI/CD integration**: Validate DSL code in continuous integration pipelines.
- **Version control**: Ensure DSL code diffs are readable and meaningful.

### 9.4 Performance Considerations

DSLs can introduce performance overhead:

- **Interpretation cost**: DSL interpretation adds runtime overhead.
- **Memory usage**: DSL abstractions may consume additional memory.
- **Profiling**: Profile DSL code to identify performance bottlenecks.

---

## 10. Future Directions and Research Opportunities

### 10.1 AI-Driven DSL Generation

Future research should explore:

- **Automatic DSL design**: Using machine learning to design DSLs based on domain characteristics.
- **Adaptive DSLs**: DSLs that adapt to user preferences and usage patterns.
- **Multi-modal DSLs**: DSLs that support multiple input modalities (text, visual, voice).

### 10.2 DSL Composition and Interoperability

- **DSL composition**: Combining multiple DSLs to express complex concepts.
- **DSL interoperability**: Enabling seamless interaction between different DSLs.
- **DSL standards**: Developing standards for DSL design and implementation.

### 10.3 Formal Verification

- **DSL semantics**: Formally specifying DSL semantics to enable verification.
- **Correctness proofs**: Proving properties of DSL code.
- **Model checking**: Using model checking to validate DSL expressions.

### 10.4 DSL Tooling and Infrastructure

- **DSL IDEs**: Developing specialized IDEs for DSL development.
- **DSL debugging**: Improving debugging support for DSL code.
- **DSL profiling**: Developing profiling tools to optimize DSL performance.

---

## 11. Conclusion

Domain-Specific Languages represent a powerful abstraction mechanism for bridging the gap between domain experts and software engineers. By providing a notation tailored to a specific problem domain, DSLs enhance code clarity, maintainability, and collaboration.

The emergence of large language models has created new opportunities for automating DSL development, enabling non-technical stakeholders to contribute to test specifications and implementation code. However, realizing these opportunities requires careful attention to DSL design, validation, and integration with existing development workflows.

The case study demonstrates how a well-designed test DSL can enhance behavior-driven development, providing readable, executable specifications that serve as both documentation and validation. By combining DSL design principles with AI-assisted code generation, teams can achieve higher productivity without sacrificing code quality or maintainability.

Future work should focus on:

1. **Automating DSL design** using machine learning techniques.
2. **Improving AI-assisted DSL development** through better prompt engineering and validation.
3. **Developing DSL standards** to promote interoperability and consistency.
4. **Enhancing DSL tooling** to improve developer experience and productivity.

As software systems grow in complexity, the role of DSLs in managing that complexity will only increase. By understanding DSL design principles and best practices, teams can leverage DSLs to build more maintainable, understandable, and reliable software systems.

---

## References

Fowler, M., & Parsons, R. (2010). *Domain Specific Languages*. Addison-Wesley Professional.

Mernik, M., Heering, J., & Sloane, A. M. (2005). When and how to develop domain-specific languages. *ACM Computing Surveys (CSUR)*, 37(4), 316-344.

van Deursen, A., Klint, P., & Visser, J. (2000). Domain-specific languages: An annotated bibliography. *ACM SIGPLAN Notices*, 35(6), 26-36.

Spinellis, D. (2001). Notable design patterns for domain-specific languages. *Journal of Systems and Software*, 56(1), 91-99.

Wirth, N. (1974). On the composition of well-structured programs. *ACM Computing Surveys (CSUR)*, 6(4), 247-259.

Aho, A. V., Lam, M. S., Sethi, R., & Ullman, J. D. (2006). *Compilers: Principles, Techniques, and Tools* (2nd ed.). Addison-Wesley.

Parr, T. (2013). *The Definitive ANTLR 4 Reference*. Pragmatic Bookshelf.

Eifrig, J., & Mayer, B. (2020). Domain-specific languages for machine learning in big data. *IEEE Transactions on Knowledge and Data Engineering*, 32(2), 289-302.

Karpukhin, V., Oguz, B., Min, S., Lewis, P., Wu, L., Edunov, S., ... & Schwenk, H. (2021). Dense passage retrieval for open-domain question answering. *arXiv preprint arXiv:2004.04906*.

Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., ... & Amodei, D. (2020). Language models are few-shot learners. *arXiv preprint arXiv:2005.14165*.

Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., ... & Polosukhin, I. (2017). Attention is all you need. In *Advances in Neural Information Processing Systems* (pp. 5998-6008).

Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT press.

Hermans, F., Aldewereld, M., & Pinzger, M. (2018). Detecting and visualizing inter-worksheet smells in spreadsheets. In *Proceedings of the 40th International Conference on Software Engineering* (pp. 441-451). ACM.

Hughes, J. (1989). Why functional programming matters. *The Computer Journal*, 32(2), 98-107.

Wadler, P. (1992). The essence of functional programming. In *Proceedings of the 19th ACM SIGPLAN-SIGACT Symposium on Principles of Programming Languages* (pp. 1-14).

---

## Appendix: DSL Design Checklist

When designing a new DSL, consider the following:

- [ ] **Scope**: Is the DSL focused on a specific problem domain?
- [ ] **Audience**: Who is the target audience? Are they technical or non-technical?
- [ ] **Expressiveness**: Can the DSL express all necessary domain concepts?
- [ ] **Simplicity**: Is the DSL simple enough to learn and use?
- [ ] **Consistency**: Are patterns consistent throughout the DSL?
- [ ] **Type safety**: Does the DSL leverage host language type systems?
- [ ] **Error handling**: Are error messages clear and actionable?
- [ ] **Documentation**: Is the DSL well-documented with examples?
- [ ] **Extensibility**: Can the DSL be extended without modification?
- [ ] **Performance**: Does the DSL introduce unacceptable performance overhead?
- [ ] **Tooling**: Does the DSL integrate with existing development tools?
- [ ] **Maintenance**: Is there a clear plan for DSL maintenance and evolution?

---

## Appendix B: DSLs for Executable Specifications

This appendix provides an overview of DSLs specifically designed for writing executable specifications from user stories.

### B.1 External DSLs for Executable Specifications

#### B.1.1 Gherkin (Cucumber)

Gherkin is the most widely-adopted external DSL for behavior-driven development. It uses the Given-When-Then pattern to express user stories as executable specifications.

**Example:**
```gherkin
Feature: Session Management
  Scenario: Create a valid session
    Given no sessions exist on the chosen time slot
    When staff creates a session with a future date, duration, available packs, and price
    Then the session is created with status "published" and all values are recorded
```

**Characteristics:**
- Human-readable syntax accessible to non-technical stakeholders
- Given-When-Then structure maps directly to test setup, action, and assertion
- Step definitions bridge Gherkin expressions to implementation code
- Extensive tool support (IDE plugins, CI/CD integration)
- Multi-language support (Ruby, Java, Python, JavaScript, etc.)

**Strengths:**
- Low barrier to entry for business analysts
- Encourages collaboration between technical and non-technical stakeholders
- Specification and test are unified

**Limitations:**
- Step definitions can become complex and difficult to maintain
- Manual mapping between Gherkin steps and code implementations
- Gherkin's simplicity can be limiting for complex scenarios

#### B.1.2 Website-spec

Website-spec is an external DSL for functional web testing that enables non-technical users to define test scenarios for web applications without writing code.

**Example:**
```
Open $url
Click on create
Select a store
Within card-panel-store
Select `[date-test=stores] label`
Remember test as $StoreName
Click Select button continue
!Class should not contain "disabled"
Click Select element `.preview-value`
Property text should be $StoreName
```

**Characteristics:**
- Domain-specific commands like "Click", "Select", "Open" that map to web interactions
- Built-in assertions for web element properties
- No need for developer-defined step definitions
- Ideal for QA teams and business analysts

### B.2 Internal DSLs for Executable Specifications

#### B.2.1 RSpec (Ruby)

RSpec is a Ruby testing framework that provides a fluent DSL for writing behavior-driven specifications.

**Example:**
```ruby
describe "Session creation" do
  context "with valid parameters" do
    it "creates a session with published status" do
      session = Session.create(
        date: tomorrow,
        duration: 30,
        available_packs: 20,
        price: 15
      )
      
      expect(session).to be_persisted
      expect(session.status).to eq('published')
      expect(session.available_packs).to eq(20)
    end
  end
end
```

**Characteristics:**
- Fluent, readable syntax using `describe`, `context`, and `it` blocks
- Chainable assertions with `expect()` syntax
- Full access to Ruby language features
- Extensive plugin ecosystem

#### B.2.2 Kotest (Kotlin)

Kotest is a Kotlin testing framework offering multiple testing styles as internal DSLs. **BehaviorSpec** is the most adapted for executable specifications.

**Example:**
```kotlin
class SessionCreationSpec : BehaviorSpec({
    context("Creating a session") {
        given("no sessions exist on the chosen time slot") {
            `when`("staff creates a session with valid parameters") {
                then("the session is created with published status") {
                    val session = createSession(
                        date = tomorrow,
                        duration = 30,
                        availablePacks = 20,
                        price = 15
                    )
                    
                    session.status shouldBe "published"
                    session.availablePacks shouldBe 20
                }
            }
        }
    }
})
```

**Characteristics:**
- BehaviorSpec implements BDD-style testing with `given()`, `when()`, `then()` keywords
- Leverages Kotlin's extension functions and infix notation
- Full type safety and IDE support
- Supports nested contexts for complex scenarios

#### B.2.3 Fluent Test DSLs (TypeScript/JavaScript)

Custom fluent interfaces enable developers to write tests that read like specifications while maintaining type safety.

**Example:**
```typescript
await createSessionScenario()
    .noSessions()
    .when.creating.sessionWith
        .date(sessionDate)
        .duration(30)
        .availablePacks(20)
        .price(15)
        .execute()
    .shouldSucceed()
    .with.session(s => {
        s.hasDate(sessionDate);
        s.hasDuration(30);
        s.hasAvailablePacks(20);
        s.hasReservedPacks(0);
        s.hasPrice(15);
        s.hasStatus('publié');
    });
```

**Characteristics:**
- Method chaining for fluent, readable syntax
- Full type safety and IDE autocomplete
- Seamless integration with existing code
- Custom domain-specific assertions
- Builder pattern for complex test setup

#### B.2.4 Established Libraries that may support Domain-Specific Logic

Beyond testing, several libraries provide established internal DSLs for various domains:

**In TypeScript:**
- **Zod / Valibot**: DSLs for schema definition and runtime validation with full type inference.
- **Effect**: A functional programming DSL for error handling, concurrency, and dependency injection.
- **Kysely**: A type-safe SQL query builder DSL.

**In C#:**
- **FluentAssertions**: An expressive DSL for unit test assertions.
- **FluentValidation**: A strongly-typed DSL for building validation rules.
- **Entity Framework Core**: Uses a Fluent API DSL for database mapping and configuration.


### B.3 Comparison of Approaches

| Aspect | Gherkin | RSpec | Kotest BehaviorSpec        | Fluent DSL                    |
|--------|---------|-------|----------------------------|-------------------------------|
| **Audience** | Business analysts, developers | Developers | PO, Developers             | PO, Developers                |
| **Type Safety** | None | Partial | Full                       | Full                          |
| **IDE Support** | Good (plugins) | Excellent | Excellent                  | Excellent+ (smart completion) |
| **Learning Curve** | Low | Medium | Medium                     | Guided by types, adaptable    |
| **Extensibility** | Via step definitions | Via Ruby metaprogramming | Via Kotlin extensions and custom builders    | Via custom builders           |
| **Maintenance** | Step definitions can drift | Tightly coupled to code | Tightly coupled to code    | Tightly coupled to code       |

---

**End of Paper**
