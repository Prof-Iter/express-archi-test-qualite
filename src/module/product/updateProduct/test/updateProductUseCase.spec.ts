import { describe, test } from "@jest/globals";
import { updateProductScenario } from "../../../../shared/test/dsl/updateProductScenario";
import { ERROR_KEYS } from "../../../../shared/i18n/errorKeys";

describe("UpdateProductUseCase", () => {

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

    test('Scénario 2 : échec, produit non trouvé', async () => {
        const result = await updateProductScenario()
            .noProducts()
            .when.updating.product({ id: 999, title: "Title", description: "Description", price: 100 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_NOT_FOUND);
    });

    test('Scénario 3 : échec, validation du prix (négatif)', async () => {
        const result = await updateProductScenario()
            .product({ title: "Test Product", description: "Test Description", price: 100 })
                .existsWithId(1)
            .when.updating.product({ id: 1, title: "Title", description: "Description", price: -10 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_PRICE_TOO_LOW);
    });

    test('Scénario 4 : échec, validation du titre (trop court)', async () => {
        const result = await updateProductScenario()
            .product({ title: "Test Product", description: "Test Description", price: 100 })
                .existsWithId(1)
            .when.updating.product({ id: 1, title: "ab", description: "Description", price: 100 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_TITLE_TOO_SHORT);
    });

    test('Scénario 5 : échec de sauvegarde', async () => {
        const result = await updateProductScenario()
            .repositoryFails.onSave()
            .when.updating.product({ id: 1, title: "Title", description: "Description", price: 100 });

        result.shouldFail()
            .withError(ERROR_KEYS.PRODUCT_FETCH_ERROR);
    });

});
