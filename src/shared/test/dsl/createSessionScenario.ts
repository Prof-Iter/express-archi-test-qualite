import { expect } from '@jest/globals';
import { Session, SessionGivenContext, SessionSuccessAssertion, SessionWhenAction } from './SessionScenario';
import { ThenAssertion, Repository } from './UseCaseScenario';

// Placeholders for Phase 2 implementation
type CreateSessionUseCase = any;

interface CreateSessionInput {
    date: Date;
    duration: number;
    availablePacks: number;
    price: number;
}

class CreateSessionGiven extends SessionGivenContext<CreateSessionUseCase, CreateSessionInput, Session> {
    constructor() {
        super(() => ({} as any));
    }

    // @ts-ignore
    get when(): CreateSessionWhen {
        return new CreateSessionWhen(this.repositories, this.entities);
    }
}

class CreateSessionWhen {
    constructor(
        private readonly repositories: Map<string, Repository>,
        private readonly entities: Map<string, unknown[]>
    ) {}

    private async   executeSessionCreation(input: CreateSessionInput): Promise<CreateSessionThen> {
        // Placeholder implementation for Phase 1
        const result = {
            isRight: () => false,
            isLeft: () => true,
            extract: () => new Error("UseCase not implemented"),
            ifLeft: (cb: any) => cb(new Error("UseCase not implemented")),
            ifRight: () => {}
        } as any;

        return new CreateSessionThen(result, this.repositories, this.entities);
    }

    get creating() {
        const self = this;
        return {
            session: async (input: CreateSessionInput): Promise<CreateSessionThen> => {
                return self.executeSessionCreation(input);
            },
            get sessionWith(): FluentSessionBuilder {
                return new FluentSessionBuilder(self);
            }
        };
    }
}

class FluentSessionBuilder {
    private data: Partial<CreateSessionInput> = {};

    constructor(private readonly when: CreateSessionWhen) {}

    date(value: Date): this {
        this.data.date = value;
        return this;
    }

    duration(value: number): this {
        this.data.duration = value;
        return this;
    }

    availablePacks(value: number): this {
        this.data.availablePacks = value;
        return this;
    }

    price(value: number): this {
        this.data.price = value;
        return this;
    }

    async execute(): Promise<CreateSessionThen> {
        return this.when.creating.session(this.data as CreateSessionInput);
    }
}

class CreateSessionThen extends ThenAssertion<Session> {
    shouldSucceed(): CreateSessionSuccess {
        expect(this['result'].isRight()).toBe(true);
        return new CreateSessionSuccess(this['result'], this['repositories'], this['entities']);
    }
}

class CreateSessionSuccess extends SessionSuccessAssertion<Session> {}

export const createSessionScenario = (): CreateSessionGiven => {
    return new CreateSessionGiven();
};
