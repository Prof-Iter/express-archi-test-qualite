import { describe, test } from "@jest/globals";
import { createSessionScenario } from "../../../../shared/test/dsl/createSessionScenario";

describe("US-1 : Créer une session", () => {

    test("Scénario 1 : création d'une session valide", async () => {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + 1); // Tomorrow

        const result = await createSessionScenario()
            .noSessions()
            .when.creating.session({
                date: sessionDate,
                duration: 30,
                availablePacks: 20,
                price: 15
            });

        result.shouldSucceed()
            .with.session(s => {
                s.hasDate(sessionDate);
                s.hasDuration(30);
                s.hasAvailablePacks(20);
                s.hasReservedPacks(0);
                s.hasPrice(15);
                s.hasStatus('publié');
            });
    });

    test("Scénario 1bis : création d'une session valide avec Builder fluent", async () => {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + 7); // Next week

        const result = await createSessionScenario()
            .noSessions()
            .when.creating.sessionWith
                .date(sessionDate)
                .duration(45)
                .availablePacks(30)
                .price(25)
                .execute();

        result.shouldSucceed()
            .with.session(s => {
                s.hasDate(sessionDate);
                s.hasDuration(45);
                s.hasAvailablePacks(30);
                s.hasReservedPacks(0);
                s.hasPrice(25);
                s.hasStatus('publié');
            });
    });

    test("Temporary: verify failure because not implemented", async () => {
        const result = await createSessionScenario()
            .noSessions()
            .when.creating.session({
                date: new Date(),
                duration: 30,
                availablePacks: 20,
                price: 15
            });

        result.shouldFail()
            .withError("UseCase not implemented");
    });
});
