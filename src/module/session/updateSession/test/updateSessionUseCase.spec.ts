import { describe, test } from "@jest/globals";
import { updateSessionScenario } from "../../../../shared/test/dsl/updateSessionScenario";
import { ERROR_KEYS } from "../../../../shared/i18n/errorKeys";

describe("US-2 : Mettre à jour le nombre de packs d'une session", () => {

    test("Scénario 1 : mise à jour réussie du nombre de packs", async () => {
        // Étant donné une session existante avec 10 packs disponibles et 3 réservés
        const result = await updateSessionScenario()
            .session({ availablePacks: 10, reservedPacks: 3 })
                .existsWithId(1)
            .when.updating.session({ id: 1, availablePacks: 20 });

        // Alors la session est mise à jour avec 20 packs disponibles
        result.shouldSucceed()
            .with.session(s => {
                s.hasId(1);
                s.hasAvailablePacks(20);
            });
    });

    test("Scénario 2 : échec, session introuvable", async () => {
        // Étant donné aucune session existante
        const result = await updateSessionScenario()
            .noSessions()
            .when.updating.session({ id: 999, availablePacks: 20 });

        // Alors une erreur indique que la session est introuvable
        result.shouldFail()
            .withError(ERROR_KEYS.SESSION_NOT_FOUND);
    });

    test("Scénario 3 : échec, nombre de packs dépasse 30", async () => {
        // Étant donné une session existante avec 10 packs disponibles
        const result = await updateSessionScenario()
            .session({ availablePacks: 10, reservedPacks: 0 })
                .existsWithId(1)
            .when.updating.session({ id: 1, availablePacks: 31 });

        // Alors une erreur indique que le nombre de packs dépasse le maximum autorisé
        result.shouldFail()
            .withError(ERROR_KEYS.SESSION_AVAILABLE_PACKS_TOO_HIGH);
    });

    test("Scénario 4 : échec, nombre de packs inférieur ou égal à 0", async () => {
        // Étant donné une session existante avec 10 packs disponibles
        const result = await updateSessionScenario()
            .session({ availablePacks: 10, reservedPacks: 0 })
                .existsWithId(1)
            .when.updating.session({ id: 1, availablePacks: 0 });

        // Alors une erreur indique que le nombre de packs doit être supérieur à 0
        result.shouldFail()
            .withError(ERROR_KEYS.SESSION_AVAILABLE_PACKS_TOO_LOW);
    });

    test("Scénario 5 : échec, nombre de packs inférieur aux réservations existantes", async () => {
        // Étant donné une session existante avec 10 packs disponibles et 5 réservés
        const result = await updateSessionScenario()
            .session({ availablePacks: 10, reservedPacks: 5 })
                .existsWithId(1)
            .when.updating.session({ id: 1, availablePacks: 3 });

        // Alors une erreur indique que le nombre de packs ne peut pas être inférieur aux réservations
        result.shouldFail()
            .withError(ERROR_KEYS.SESSION_AVAILABLE_PACKS_BELOW_RESERVED);
    });
});
