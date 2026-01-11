import { describe, test } from "@jest/globals";
import { createProductScenario } from "../../../../shared/test/dsl/createProductScenario";
import { ERROR_KEYS } from "../../../../shared/i18n/errorKeys";

describe("US-1 : Créer un produit", () => {

    test("Scénario 1 : création réussie", async () => {
        const result = await createProductScenario()
            .noProducts()
            .when.creating.product({ title: "switch 2", description: "nouvelle console", price: 500 });

        result.shouldSucceed()
            .with.product(p => {
                p.hasTitle("switch 2");
                p.hasDescription("nouvelle console");
                p.hasPrice(500);
            });
    });

    test('Scénario 2 : echec, titre trop court', async () => {
        const result = await createProductScenario()
            .noProducts()
            .when.creating.product({ title: "sw", description: "nouvelle console", price: 500 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_TITLE_TOO_SHORT);
    });

    test('Scénario 3 : echec, prix négatif', async () => {
        const result = await createProductScenario()
            .noProducts()
            .when.creating.product({ title: "switch 2", description: "nouvelle console", price: -10 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_PRICE_TOO_LOW);
    });

    test('Scénario 4 : création échouée, prix supérieur à 10000', async () => {
        const result = await createProductScenario()
            .noProducts()
            .when.creating.product({ title: "switch 2", description: "nouvelle console", price: 11000 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_PRICE_TOO_HIGH);
    });

    test('Scénario 5 : création échouée, échec de sauvegarde non prévue', async () => {
        const result = await createProductScenario()
            .noProducts()
            .and.repositoryFails.onSave()
            .when.creating.product({ title: "switch 2", description: "nouvelle console", price: 500 });

        result.shouldFail()
            .withRepositoryError();
    });

});
