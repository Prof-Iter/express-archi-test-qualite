import { describe, expect, test } from '@jest/globals';
import { createProductScenario } from "../../../../shared/test/dsl/createProductScenario";
import { ERROR_KEYS } from "../../../../shared/i18n/errorKeys";
import {
    forAllValidProducts,
    forAllProductsWithShortTitle,
    forAllProductsWithNegativePrice,
    forAllProductsWithExcessivePrice,
    forAllProductsWithBoundaryPrices
} from "../../../../shared/test/dsl/PropertyBasedScenario";

describe("US-1 : Créer un produit - Property-Based Tests", () => {

    test("Property: Any valid product should be created successfully", async () => {
        await forAllValidProducts()
            .shouldAlwaysHold(async (productInput) => {
                const result = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                result.shouldSucceed()
                    .with.product(p => {
                        p.hasTitle(productInput.title);
                        p.hasDescription(productInput.description);
                        p.hasPrice(productInput.price);
                    });
            });
    });

    test("Property: Products with title < 3 chars always fail", async () => {
        await forAllProductsWithShortTitle()
            .withRuns(50)
            .shouldAlwaysHold(async (productInput) => {
                const result = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                result.shouldFail()
                    .withError(ERROR_KEYS.PRODUCT_TITLE_TOO_SHORT);
            });
    });

    test("Property: Products with negative price always fail", async () => {
        await forAllProductsWithNegativePrice()
            .withRuns(50)
            .shouldAlwaysHold(async (productInput) => {
                const result = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                result.shouldFail()
                    .withError(ERROR_KEYS.PRODUCT_PRICE_TOO_LOW);
            });
    });

    test("Property: Products with price > 10000 always fail", async () => {
        await forAllProductsWithExcessivePrice()
            .withRuns(50)
            .shouldAlwaysHold(async (productInput) => {
                const result = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                result.shouldFail()
                    .withError(ERROR_KEYS.PRODUCT_PRICE_TOO_HIGH);
            });
    });

    test("Property: Fluent builder produces same result as direct input", async () => {
        await forAllValidProducts()
            .withRuns(50)
            .shouldAlwaysHold(async (productInput) => {
                const resultDirect = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                const resultFluent = await createProductScenario()
                    .noProducts()
                    .when.creating.productWith
                        .title(productInput.title)
                        .description(productInput.description)
                        .price(productInput.price)
                        .execute();

                resultDirect.shouldSucceed()
                    .with.product(p => {
                        p.hasTitle(productInput.title);
                        p.hasDescription(productInput.description);
                        p.hasPrice(productInput.price);
                    });

                resultFluent.shouldSucceed()
                    .with.product(p => {
                        p.hasTitle(productInput.title);
                        p.hasDescription(productInput.description);
                        p.hasPrice(productInput.price);
                    });
            });
    });

    test("Property: Repository failure always results in error regardless of input", async () => {
        await forAllValidProducts()
            .withRuns(30)
            .shouldAlwaysHold(async (productInput) => {
                const result = await createProductScenario()
                    .noProducts()
                    .and.repositoryFails.onSave()
                    .when.creating.product(productInput);

                result.shouldFail()
                    .withRepositoryError();
            });
    });

    test("Property: Price boundaries are exact (0 and 10000 are valid)", async () => {
        await forAllProductsWithBoundaryPrices()
            .withRuns(20)
            .shouldAlwaysHold(async (productInput) => {
                const result = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                result.shouldSucceed()
                    .with.product(p => {
                        p.hasPrice(productInput.price);
                    });
            });
    });

    test("Property: DSL is idempotent - same input produces same result", async () => {
        await forAllValidProducts()
            .withRuns(50)
            .shouldAlwaysHold(async (productInput) => {
                const result1 = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                const result2 = await createProductScenario()
                    .noProducts()
                    .when.creating.product(productInput);

                const isSuccess1 = result1['result'].isRight();
                const isSuccess2 = result2['result'].isRight();

                expect(isSuccess1).toBe(isSuccess2);

                if (isSuccess1) {
                    const product1 = result1['result'].extract();
                    const product2 = result2['result'].extract();
                    
                    expect(product1.title).toBe(product2.title);
                    expect(product1.description).toBe(product2.description);
                    expect(product1.price).toBe(product2.price);
                }
            });
    });
});
