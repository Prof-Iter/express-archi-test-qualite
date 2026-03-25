import { expect } from '@jest/globals';
import { Session, SessionBuilder, SessionSuccessAssertion } from './SessionScenario';
import { ThenAssertion, Repository } from './UseCaseScenario';

type UpdateSessionUseCase = any;

interface UpdateSessionInput {
    id: number;
    availablePacks: number;
}

interface SessionConfig {
    date?: Date;
    duration?: number;
    availablePacks?: number;
    reservedPacks?: number;
    price?: number;
    status?: string;
}

class UpdateSessionGiven {
    private repositories: Map<string, Repository> = new Map();
    private entities: Map<string, unknown[]> = new Map();
    private repositoryBehaviors: Map<string, 'fail' | 'succeed'> = new Map();

    constructor() {
        this.entities.set('sessions', []);
    }

    noSessions(): this {
        this.entities.set('sessions', []);
        return this;
    }

    session(config: SessionConfig): SessionBuilder_DSL {
        return new SessionBuilder_DSL(this, config);
    }

    get repositoryFails() {
        return {
            onSave: (): UpdateSessionGiven => {
                this.repositoryBehaviors.set('session', 'fail');
                return this;
            },
            onFind: (): UpdateSessionGiven => {
                this.repositoryBehaviors.set('session', 'fail');
                return this;
            }
        };
    }

    get and(): this {
        return this;
    }

    get when(): UpdateSessionWhen {
        const behavior = this.repositoryBehaviors.get('session');
        if (behavior) {
            this.repositories.set('repositoryBehavior', behavior);
        }

        const sessions = this.entities.get('sessions') as Session[] | undefined;
        if (sessions) {
            this.repositories.set('sessions', sessions);
        }

        return new UpdateSessionWhen(this.repositories, this.entities);
    }
}

class SessionBuilder_DSL {
    constructor(
        private readonly context: UpdateSessionGiven,
        private readonly config: SessionConfig
    ) {}

    existsWithId(id: number): UpdateSessionGiven {
        const sessions = this.context['entities'].get('sessions') as Session[];
        const session = new SessionBuilder()
            .withDate(this.config.date || new Date(Date.now() + 86400000))
            .withDuration(this.config.duration || 30)
            .withAvailablePacks(this.config.availablePacks || 20)
            .withReservedPacks(this.config.reservedPacks || 0)
            .withPrice(this.config.price || 15)
            .withStatus(this.config.status || "publié")
            .withId(id)
            .build();
        sessions.push(session);
        return this.context;
    }
}

class UpdateSessionWhen {
    constructor(
        private readonly repositories: Map<string, Repository>,
        private readonly entities: Map<string, unknown[]>
    ) {}

    get updating() {
        return {
            session: async (input: UpdateSessionInput): Promise<UpdateSessionThen> => {
                // Placeholder – Phase 2 will wire the real UseCase
                const result = {
                    isRight: () => false,
                    isLeft: () => true,
                    extract: () => new Error("UseCase not implemented"),
                    ifLeft: (cb: any) => cb(new Error("UseCase not implemented")),
                    ifRight: () => {}
                } as any;

                return new UpdateSessionThen(result, this.repositories, this.entities);
            }
        };
    }
}

class UpdateSessionThen extends ThenAssertion<Session> {
    shouldSucceed(): UpdateSessionSuccess {
        expect(this['result'].isRight()).toBe(true);
        return new UpdateSessionSuccess(this['result'], this['repositories'], this['entities']);
    }
}

class UpdateSessionSuccess extends SessionSuccessAssertion<Session> {}

export const updateSessionScenario = (): UpdateSessionGiven => {
    return new UpdateSessionGiven();
};
