import { expect } from '@jest/globals';
import { GivenContext, WhenAction, SuccessAssertion } from './UseCaseScenario';
import { Either } from 'purify-ts/Either';

// Domain interface/class for DSL (Temporary location to follow Rule 9)
export class Session {
    public id?: number;
    public date: Date;
    public duration: number;
    public availablePacks: number;
    public reservedPacks: number;
    public price: number;
    public status: string;

    constructor(props: {
        date: Date,
        duration: number,
        availablePacks: number,
        reservedPacks: number,
        price: number,
        status: string
    }) {
        this.date = props.date;
        this.duration = props.duration;
        this.availablePacks = props.availablePacks;
        this.reservedPacks = props.reservedPacks;
        this.price = props.price;
        this.status = props.status;
    }
}

export class SessionBuilder {
    private props: any = {
        date: new Date(Date.now() + 86400000), // tomorrow
        duration: 30,
        availablePacks: 20,
        reservedPacks: 0,
        price: 15,
        status: "publié"
    };
    private id?: number;

    withDate(date: Date): SessionBuilder {
        this.props.date = date;
        return this;
    }

    withDuration(duration: number): SessionBuilder {
        this.props.duration = duration;
        return this;
    }

    withAvailablePacks(packs: number): SessionBuilder {
        this.props.availablePacks = packs;
        return this;
    }

    withReservedPacks(packs: number): SessionBuilder {
        this.props.reservedPacks = packs;
        return this;
    }

    withPrice(price: number): SessionBuilder {
        this.props.price = price;
        return this;
    }

    withStatus(status: string): SessionBuilder {
        this.props.status = status;
        return this;
    }

    withId(id: number): SessionBuilder {
        this.id = id;
        return this;
    }

    build(): Session {
        const session = new Session(this.props);
        if (this.id !== undefined) {
            session.id = this.id;
        }
        return session;
    }
}

export interface SessionConfig {
    date?: Date;
    duration?: number;
    availablePacks?: number;
    reservedPacks?: number;
    price?: number;
    status?: string;
}

export class SessionGivenContext<TUseCase, TInput, TOutput> extends GivenContext<TUseCase, TInput, TOutput> {

    noSessions(): this {
        this.entities.set('sessions', []);
        return this;
    }

    session(config: SessionConfig | SessionBuilder): SessionEntityBuilder<TUseCase, TInput, TOutput> {
        return new SessionEntityBuilder(this, config);
    }

    repositoryFails = {
        onSave: (): SessionGivenContext<TUseCase, TInput, TOutput> => {
            this.setRepositoryBehavior('session', 'fail');
            return this;
        }
    };

    protected toWhen(): SessionWhenAction<TUseCase, TInput, TOutput> {
        return new SessionWhenAction(this.useCaseFactory, this.repositories, this.entities, this.repositoryBehaviors);
    }

    get when(): SessionWhenAction<TUseCase, TInput, TOutput> {
        return this.toWhen();
    }
}

export class SessionEntityBuilder<TUseCase, TInput, TOutput> {
    constructor(
        private readonly context: SessionGivenContext<TUseCase, TInput, TOutput>,
        private readonly config: SessionConfig | SessionBuilder
    ) {}

    private buildSession(withId?: number): Session {
        if (this.config instanceof SessionBuilder) {
            if (withId !== undefined) {
                return this.config.withId(withId).build();
            }
            return this.config.build();
        } else {
            const builder = new SessionBuilder()
                .withDate(this.config.date || new Date(Date.now() + 86400000))
                .withDuration(this.config.duration || 30)
                .withAvailablePacks(this.config.availablePacks || 20)
                .withReservedPacks(this.config.reservedPacks || 0)
                .withPrice(this.config.price || 15)
                .withStatus(this.config.status || "publié");

            if (withId !== undefined) {
                builder.withId(withId);
            }
            return builder.build();
        }
    }

    exists(): SessionGivenContext<TUseCase, TInput, TOutput> {
        const session = this.buildSession();
        this.context['addEntity']('sessions', session);
        return this.context;
    }

    existsWithId(id: number): SessionGivenContext<TUseCase, TInput, TOutput> {
        const session = this.buildSession(id);
        this.context['addEntity']('sessions', session);
        return this.context;
    }
}

export class SessionWhenAction<TUseCase, TInput, TOutput> extends WhenAction<TUseCase, TInput, TOutput> {
    get creating() {
        return {
            session: async (input: { date: Date; duration: number; availablePacks: number; price: number }) => {
                return this.executeUseCase(
                    async (useCase: TUseCase, inp: TInput) => {
                        return (useCase as unknown as { execute: (input: TInput) => Promise<Either<Error, TOutput>> }).execute(inp);
                    },
                    input as unknown as TInput
                );
            }
        };
    }
}

export class SessionSuccessAssertion<TOutput> extends SuccessAssertion<TOutput> {
    session(assertions: (s: SessionAssertions) => void): this {
        const output = this.getOutput() as unknown as Session;
        const sessionAssertions = new SessionAssertions(output);
        assertions(sessionAssertions);
        return this;
    }
}

export class SessionAssertions {
    constructor(private readonly session: Session) {}

    hasDate(expected: Date): this {
        expect(this.session.date).toEqual(expected);
        return this;
    }

    hasDuration(expected: number): this {
        expect(this.session.duration).toBe(expected);
        return this;
    }

    hasAvailablePacks(expected: number): this {
        expect(this.session.availablePacks).toBe(expected);
        return this;
    }

    hasReservedPacks(expected: number): this {
        expect(this.session.reservedPacks).toBe(expected);
        return this;
    }

    hasPrice(expected: number): this {
        expect(this.session.price).toBe(expected);
        return this;
    }

    hasStatus(expected: string): this {
        expect(this.session.status).toBe(expected);
        return this;
    }

    hasId(expected: number): this {
        expect(this.session.id).toBe(expected);
        return this;
    }
}
