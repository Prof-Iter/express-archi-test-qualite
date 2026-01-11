import { describe, test } from '@jest/globals';
import { createProductScenario } from './createProductScenario';
import { updateProductScenario } from './updateProductScenario';
import { createOrderScenario } from './createOrderScenario';
import { ERROR_KEYS } from '../../i18n/errorKeys';

describe("DSL Examples - Product Creation", () => {

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

    test("Scénario 2 : echec, titre trop court", async () => {
        const result = await createProductScenario()
            .noProducts()
            .when.creating.product({ title: "sw", description: "nouvelle console", price: 500 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_TITLE_TOO_SHORT);
    });

    test("Scénario 3 : echec, prix négatif", async () => {
        const result = await createProductScenario()
            .noProducts()
            .when.creating.product({ title: "switch 2", description: "nouvelle console", price: -10 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_PRICE_TOO_LOW);
    });

    test("Scénario 4 : création échouée, prix supérieur à 10000", async () => {
        const result = await createProductScenario()
            .noProducts()
            .when.creating.product({ title: "switch 2", description: "nouvelle console", price: 11000 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_PRICE_TOO_HIGH);
    });

    test("Scénario 5 : création échouée, échec de sauvegarde non prévue", async () => {
        const result = await createProductScenario()
            .noProducts()
            .and.repositoryFails.onSave()
            .when.creating.product({ title: "switch 2", description: "nouvelle console", price: 500 });

        result.shouldFail()
            .withRepositoryError();
    });
});

describe("DSL Examples - Product Update", () => {

    test("Scénario 1 : mise à jour réussie", async () => {
        const result = await updateProductScenario()
            .product({ title: "Test Product", description: "Test Description", price: 100 })
                .existsWithId(1)
            .when.updating.product({ id: 1, title: "Updated Title", description: "Updated Description", price: 150 });

        result.shouldSucceed()
            .with.product(p => {
                p.hasId(1);
                p.hasTitle("Updated Title");
                p.hasDescription("Updated Description");
                p.hasPrice(150);
            });
    });

    test("Scénario 2 : échec, produit non trouvé", async () => {
        const result = await updateProductScenario()
            .noProducts()
            .when.updating.product({ id: 999, title: "Title", description: "Description", price: 100 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_NOT_FOUND);
    });
});

describe("DSL Examples - Order Creation", () => {

    test("Scénario 1 : création réussie, montant total de la commande calculée", async () => {
        const result = await createOrderScenario()
            .product({ title: "test", price: 75 })
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
            .product({ title: "test2", price: 100 })
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
            .product({ title: "test", price: 50 })
                .existsWithId(1)
            .and.repositoryFails.onSave()
            .when.creating.order({ id: 1, quantity: 1 });

        result.shouldFail()
            .withRepositoryError();
    });
});
