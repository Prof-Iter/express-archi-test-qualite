import { describe, test } from '@jest/globals';
import { createOrderScenario } from '../../../../shared/test/dsl/createOrderScenario';
import { ERROR_KEYS } from "../../../../shared/i18n/errorKeys";

describe("US-3 : Créer une commande", () => {

    test("Scénario 1 : création réussie, montant total de la commande calculée", async () => {
        const result = await createOrderScenario()
            .product({ title: "test", description: "test", price: 75 })
                .existsWithId(1)
            .and.noOrders()
            .when.creating.order({ id: 1, quantity: 2 });

        result.shouldSucceed()
            .with.order(o => {
                o.hasTotalPrice(150);
                o.hasProductId(1);
                o.hasQuantity(2);
            });
    });

    test("Scénario 2: échec, prix total supérieur ou égal à 200€", async () => {
        const result = await createOrderScenario()
            .product({ title: "test2", description: "test2", price: 100 })
                .existsWithId(2)
            .and.noOrders()
            .when.creating.order({ id: 2, quantity: 2 });

        result.shouldFail()
            .withError(ERROR_KEYS.ORDER_PRICE_TOO_HIGH);
    });

    test("Scénario 3 : échec, produit non trouvé", async () => {
        const result = await createOrderScenario()
            .noProducts()
            .and.noOrders()
            .when.creating.order({ id: 999, quantity: 1 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_NOT_FOUND);
    });

    test("Scénario 4 : échec, erreur lors de la sauvegarde", async () => {
        const result = await createOrderScenario()
            .product({ title: "test", description: "test", price: 50 })
                .existsWithId(1)
            .and.repositoryFails.onSave()
            .when.creating.order({ id: 1, quantity: 1 });

        result.shouldFail()
            .withRepositoryError();
    });

});
