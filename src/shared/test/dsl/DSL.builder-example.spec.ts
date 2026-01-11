import { describe, test } from '@jest/globals';
import { createProductScenario } from './createProductScenario';
import { updateProductScenario } from './updateProductScenario';
import { createOrderScenario } from './createOrderScenario';
import { ProductBuilder } from '../../../module/product/Product';
import { ERROR_KEYS } from '../../i18n/errorKeys';

describe("DSL Builder Pattern Examples", () => {

    describe("Approach 1: Inline Configuration (Concise)", () => {

        test("Product creation - inline config", async () => {
            const result = await createProductScenario()
                .noProducts()
                .when.creating.product({
                    title: "switch 2",
                    description: "nouvelle console",
                    price: 500
                });

            result.shouldSucceed()
                .with.product(p => {
                    p.hasTitle("switch 2");
                    p.hasPrice(500);
                });
        });

        test("Product update - inline config", async () => {
            const result = await updateProductScenario()
                .product({ title: "Old Title", description: "Old Desc", price: 100 })
                    .existsWithId(1)
                .when.updating.product({
                    id: 1,
                    title: "New Title",
                    description: "New Desc",
                    price: 150
                });

            result.shouldSucceed()
                .with.product(p => {
                    p.hasTitle("New Title");
                    p.hasPrice(150);
                });
        });

        test("Order creation - inline config", async () => {
            const result = await createOrderScenario()
                .product({ title: "test", price: 75 })
                    .existsWithId(1)
                .and.noOrders()
                .when.creating.order({ id: 1, quantity: 2 });

            result.shouldSucceed()
                .with.order(o => {
                    o.hasTotalPrice(150);
                    o.hasProductId(1);
                });
        });
    });

    describe("Approach 2: Explicit Builder (Visible Test Data)", () => {

        test("Product creation - explicit builder shows full details", async () => {
            const newProduct = new ProductBuilder()
                .withTitle("PlayStation 5 Pro")
                .withDescription("Enhanced GPU, 8K support, 2TB SSD")
                .withPrice(699);

            // Note: For creation scenarios, builders show what will be created
            // The inline config in when.creating matches this builder's values
            const result = await createProductScenario()
                .noProducts()
                .when.creating.product({
                    title: "PlayStation 5 Pro",
                    description: "Enhanced GPU, 8K support, 2TB SSD",
                    price: 699
                });

            result.shouldSucceed()
                .with.product(p => {
                    p.hasTitle("PlayStation 5 Pro");
                    p.hasPrice(699);
                });
        });

        test("Product update - explicit builder shows initial state", async () => {
            const initialProduct = new ProductBuilder()
                .withTitle("Basic Mouse")
                .withDescription("Wired optical mouse, 1000 DPI")
                .withPrice(15);

            const result = await updateProductScenario()
                .product(initialProduct)
                    .existsWithId(1)
                .when.updating.product({
                    id: 1,
                    title: "Gaming Mouse",
                    description: "Wireless, 25000 DPI, RGB lighting",
                    price: 89
                });

            result.shouldSucceed()
                .with.product(p => {
                    p.hasId(1);
                    p.hasTitle("Gaming Mouse");
                    p.hasPrice(89);
                });
        });

        test("Order creation - explicit builder shows product details", async () => {
            // Using inline config for now - Builder approach for complex products
            const result = await createOrderScenario()
                .product({ title: "Logitech G Pro X", description: "Mechanical gaming keyboard, hot-swappable switches, RGB", price: 149 })
                    .existsWithId(1)
                .and.noOrders()
                .when.creating.order({ id: 1, quantity: 1 });

            result.shouldSucceed()
                .with.order(o => {
                    o.hasTotalPrice(149);
                    o.hasProductId(1);
                    o.hasQuantity(1);
                });
        });

        test("Order with business rule violation - explicit builder shows why", async () => {
            const expensiveProduct = new ProductBuilder()
                .withTitle("High-End Graphics Card")
                .withDescription("NVIDIA RTX 4090, 24GB GDDR6X")
                .withPrice(150);  // Product price visible in test

            const result = await createOrderScenario()
                .product(expensiveProduct)
                    .existsWithId(1)
                .and.noOrders()
                .when.creating.order({ id: 1, quantity: 2 });  // 150 * 2 = 300€

            result.shouldFail()
                .withError(ERROR_KEYS.ORDER_PRICE_TOO_HIGH);  // Exceeds 200€ limit
        });
    });

    describe("Mixed Approach: Choose Based on Context", () => {

        test("Simple scenario - use inline", async () => {
            const result = await createProductScenario()
                .noProducts()
                .when.creating.product({ title: "USB Cable", description: "USB-C to USB-C", price: 15 });

            result.shouldSucceed()
                .with.product(p => {
                    p.hasTitle("USB Cable");
                    p.hasPrice(15);
                });
        });

        test("Complex scenario - use inline for now", async () => {
            // Inline config remains simple and readable
            const result = await createOrderScenario()
                .product({ title: "Shure SM7B", description: "Professional cardioid dynamic microphone, broadcast quality", price: 199 })
                    .existsWithId(100)
                .and.noOrders()
                .when.creating.order({ id: 100, quantity: 1 });

            result.shouldSucceed()
                .with.order(o => {
                    o.hasTotalPrice(199);
                });
        });

        test("Multiple products - mix both approaches", async () => {
            // Inline config when simple
            const result = await createOrderScenario()
                .product({ title: "Budget Keyboard", description: "Basic mechanical keyboard", price: 49 })
                    .existsWithId(1)
                .when.creating.order({ id: 1, quantity: 3 });  // 49 * 3 = 147€

            result.shouldSucceed()
                .with.order(o => {
                    o.hasTotalPrice(147);
                });
        });
    });
});
