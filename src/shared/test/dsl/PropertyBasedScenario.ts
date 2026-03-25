import * as fc from "fast-check";

interface PropertyTestConfig {
    runs?: number;
    timeout?: number;
}

type PropertyAssertion<T> = (input: T) => Promise<void> | void;

export class PropertyBasedScenario<T> {
    constructor(
        private readonly generator: fc.Arbitrary<T>,
        private readonly config: PropertyTestConfig = {}
    ) {}

    async shouldAlwaysHold(assertion: PropertyAssertion<T>): Promise<void> {
        await fc.assert(
            fc.asyncProperty(this.generator, assertion),
            {
                numRuns: this.config.runs ?? 100,
                timeout: this.config.timeout
            }
        );
    }

    async shouldNeverHold(assertion: PropertyAssertion<T>): Promise<void> {
        await fc.assert(
            fc.asyncProperty(this.generator, async (input) => {
                let errorThrown = false;
                try {
                    await assertion(input);
                } catch {
                    errorThrown = true;
                }
                if (!errorThrown) {
                    throw new Error("Expected assertion to fail but it succeeded");
                }
            }),
            {
                numRuns: this.config.runs ?? 100,
                timeout: this.config.timeout
            }
        );
    }

    withRuns(runs: number): PropertyBasedScenario<T> {
        return new PropertyBasedScenario(this.generator, { ...this.config, runs });
    }

    withTimeout(timeout: number): PropertyBasedScenario<T> {
        return new PropertyBasedScenario(this.generator, { ...this.config, timeout });
    }
}

const validTitle = (): fc.Arbitrary<string> =>
    fc.string({ minLength: 3, maxLength: 100, unit: 'grapheme' }).filter(s => s.trim().length > 0);

export class ProductPropertyGenerator {
    static validProducts(): PropertyBasedScenario<{ title: string; description: string; price: number }> {
        return new PropertyBasedScenario(
            fc.record({
                title: validTitle(),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.integer({ min: 1, max: 10000 })
            })
        );
    }

    static productsWithShortTitle(): PropertyBasedScenario<{ title: string; description: string; price: number }> {
        return new PropertyBasedScenario(
            fc.record({
                title: fc.string({ minLength: 0, maxLength: 2 }),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.integer({ min: 1, max: 10000 })
            })
        );
    }

    static productsWithNegativePrice(): PropertyBasedScenario<{ title: string; description: string; price: number }> {
        return new PropertyBasedScenario(
            fc.record({
                title: validTitle(),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.integer({ min: -10000, max: -1 })
            })
        );
    }

    static productsWithExcessivePrice(): PropertyBasedScenario<{ title: string; description: string; price: number }> {
        return new PropertyBasedScenario(
            fc.record({
                title: validTitle(),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.integer({ min: 10001, max: 1000000 })
            })
        );
    }

    static productsWithBoundaryPrices(): PropertyBasedScenario<{ title: string; description: string; price: number }> {
        return new PropertyBasedScenario(
            fc.record({
                title: validTitle(),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                price: fc.constantFrom(1, 10000)
            })
        );
    }

    static anyValidProductInput(): PropertyBasedScenario<{ title: string; description: string; price: number }> {
        return this.validProducts();
    }
}

export class SessionPropertyGenerator {
    static validSessions(): PropertyBasedScenario<{ date: Date; duration: number; availablePacks: number; maxPlayers: number }> {
        return new PropertyBasedScenario(
            fc.record({
                date: fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
                duration: fc.integer({ min: 15, max: 180 }),
                availablePacks: fc.integer({ min: 1, max: 100 }),
                maxPlayers: fc.integer({ min: 2, max: 50 })
            })
        );
    }

    static sessionsWithInvalidDuration(): PropertyBasedScenario<{ date: Date; duration: number; availablePacks: number; maxPlayers: number }> {
        return new PropertyBasedScenario(
            fc.record({
                date: fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
                duration: fc.integer({ min: -100, max: 14 }),
                availablePacks: fc.integer({ min: 1, max: 100 }),
                maxPlayers: fc.integer({ min: 2, max: 50 })
            })
        );
    }

    static sessionsWithPastDate(): PropertyBasedScenario<{ date: Date; duration: number; availablePacks: number; maxPlayers: number }> {
        return new PropertyBasedScenario(
            fc.record({
                date: fc.date({ min: new Date('2000-01-01'), max: new Date(Date.now() - 24 * 60 * 60 * 1000) }),
                duration: fc.integer({ min: 15, max: 180 }),
                availablePacks: fc.integer({ min: 1, max: 100 }),
                maxPlayers: fc.integer({ min: 2, max: 50 })
            })
        );
    }

    static anyValidSessionInput(): PropertyBasedScenario<{ date: Date; duration: number; availablePacks: number; maxPlayers: number }> {
        return this.validSessions();
    }
}

export const forAllValidProducts = ProductPropertyGenerator.validProducts;
export const forAllProductsWithShortTitle = ProductPropertyGenerator.productsWithShortTitle;
export const forAllProductsWithNegativePrice = ProductPropertyGenerator.productsWithNegativePrice;
export const forAllProductsWithExcessivePrice = ProductPropertyGenerator.productsWithExcessivePrice;
export const forAllProductsWithBoundaryPrices = ProductPropertyGenerator.productsWithBoundaryPrices;

export const forAllValidSessions = SessionPropertyGenerator.validSessions;
export const forAllSessionsWithInvalidDuration = SessionPropertyGenerator.sessionsWithInvalidDuration;
export const forAllSessionsWithPastDate = SessionPropertyGenerator.sessionsWithPastDate;
