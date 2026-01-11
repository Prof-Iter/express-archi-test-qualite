import { Either } from 'purify-ts/Either';

export interface Repository {
    [key: string]: unknown;
}

export interface EntityConfig {
    [key: string]: unknown;
}

export class GivenContext<TUseCase, TInput, TOutput> {
    protected repositories: Map<string, Repository> = new Map();
    protected entities: Map<string, unknown[]> = new Map();
    protected repositoryBehaviors: Map<string, 'fail' | 'succeed'> = new Map();

    constructor(
        protected readonly useCaseFactory: (repos: Map<string, Repository>) => TUseCase
    ) {}

    protected addEntity(entityType: string, entity: unknown): this {
        const existing = this.entities.get(entityType) || [];
        this.entities.set(entityType, [...existing, entity]);
        return this;
    }

    protected setRepositoryBehavior(repoType: string, behavior: 'fail' | 'succeed'): this {
        this.repositoryBehaviors.set(repoType, behavior);
        return this;
    }

    protected buildWhen(): WhenAction<TUseCase, TInput, TOutput> {
        return new WhenAction(this.useCaseFactory, this.repositories, this.entities, this.repositoryBehaviors);
    }

    get and(): this {
        return this;
    }
}

export class WhenAction<TUseCase, TInput, TOutput> {
    private input?: TInput;
    private result?: Either<Error, TOutput>;

    constructor(
        protected readonly useCaseFactory: (repos: Map<string, Repository>) => TUseCase,
        protected readonly repositories: Map<string, Repository>,
        protected readonly entities: Map<string, unknown[]>,
        protected readonly repositoryBehaviors: Map<string, 'fail' | 'succeed'>
    ) {}

    protected async executeUseCase(
        executor: (useCase: TUseCase, input: TInput) => Promise<Either<Error, TOutput>>,
        input: TInput
    ): Promise<ThenAssertion<TOutput>> {
        this.input = input;
        const useCase = this.useCaseFactory(this.repositories);
        this.result = await executor(useCase, input);
        return new ThenAssertion(this.result, this.repositories, this.entities);
    }
}

export class ThenAssertion<TOutput> {
    constructor(
        private readonly result: Either<Error, TOutput>,
        private readonly repositories: Map<string, Repository>,
        private readonly entities: Map<string, unknown[]>
    ) {}

    shouldSucceed(): SuccessAssertion<TOutput> {
        expect(this.result.isRight()).toBe(true);
        return new SuccessAssertion(this.result, this.repositories, this.entities);
    }

    shouldFail(): FailureAssertion {
        expect(this.result.isLeft()).toBe(true);
        return new FailureAssertion(this.result);
    }

    get and(): this {
        return this;
    }
}

export class SuccessAssertion<TOutput> {
    constructor(
        private readonly result: Either<Error, TOutput>,
        private readonly repositories: Map<string, Repository>,
        private readonly entities: Map<string, unknown[]>
    ) {}

    get with(): this {
        return this;
    }

    get and(): this {
        return this;
    }

    protected getOutput(): TOutput {
        return this.result.extract() as TOutput;
    }

    protected getRepository<T extends Repository>(name: string): T | undefined {
        return this.repositories.get(name) as T | undefined;
    }

    protected getEntities<T>(entityType: string): T[] {
        return (this.entities.get(entityType) || []) as T[];
    }
}

export class FailureAssertion {
    constructor(private readonly result: Either<Error, unknown>) {}

    withError(errorKey: string): this {
        this.result.ifLeft(error => {
            expect(error.message).toBe(errorKey);
        });
        return this;
    }

    withDomainError(errorKey: string): this {
        return this.withError(errorKey);
    }

    withRepositoryError(): this {
        this.result.ifLeft(error => {
            expect(error).toBeDefined();
            expect(error.message).toBeTruthy();
        });
        return this;
    }

    get and(): this {
        return this;
    }
}
