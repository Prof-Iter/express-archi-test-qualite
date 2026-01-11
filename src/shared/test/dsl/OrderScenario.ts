import { Order } from '../../../module/order/Order';
import { Product, ProductBuilder } from '../../../module/product/Product';
import { OrderRepository } from '../../../module/order/OrderRepository';
import { GivenContext, WhenAction, SuccessAssertion } from './UseCaseScenario';
import { Either } from 'purify-ts/Either';
import { expect } from '@jest/globals';

export interface OrderConfig {
    productId: number;
    quantity: number;
}

export interface ProductConfig {
    title?: string;
    description?: string;
    price?: number;
}

export class OrderGivenContext<TUseCase, TInput, TOutput> extends GivenContext<TUseCase, TInput, TOutput> {

    noOrders(): this {
        this.entities.set('orders', []);
        return this;
    }

    noProducts(): this {
        this.entities.set('products', []);
        return this;
    }

    product(config: ProductConfig | ProductBuilder): ProductForOrderBuilder<TUseCase, TInput, TOutput> {
        return new ProductForOrderBuilder(this, config);
    }

    products(configs: ProductConfig[]): ProductsForOrderBuilder<TUseCase, TInput, TOutput> {
        return new ProductsForOrderBuilder(this, configs);
    }

    repositoryFails = {
        onSave: (): OrderGivenContext<TUseCase, TInput, TOutput> => {
            this.setRepositoryBehavior('order', 'fail');
            return this;
        },
        onFind: (): OrderGivenContext<TUseCase, TInput, TOutput> => {
            this.setRepositoryBehavior('order', 'fail');
            return this;
        }
    };

    protected toWhen(): OrderWhenAction<TUseCase, TInput, TOutput> {
        return new OrderWhenAction(this.useCaseFactory, this.repositories, this.entities, this.repositoryBehaviors);
    }

    get when(): OrderWhenAction<TUseCase, TInput, TOutput> {
        return this.toWhen();
    }
}

export class ProductForOrderBuilder<TUseCase, TInput, TOutput> {
    constructor(
        private readonly context: OrderGivenContext<TUseCase, TInput, TOutput>,
        private readonly config: ProductConfig | ProductBuilder
    ) {}

    private buildProduct(withId?: number): Product {
        if (this.config instanceof ProductBuilder) {
            // Use the provided builder directly
            if (withId !== undefined) {
                return this.config.withId(withId).build();
            }
            return this.config.build();
        } else {
            // Use inline config
            const builder = new ProductBuilder()
                .withTitle(this.config.title || "Default Title")
                .withDescription(this.config.description || "Default Description")
                .withPrice(this.config.price || 100);

            if (withId !== undefined) {
                builder.withId(withId);
            }
            return builder.build();
        }
    }

    exists(): OrderGivenContext<TUseCase, TInput, TOutput> {
        const product = this.buildProduct();
        this.context['addEntity']('products', product);
        return this.context;
    }

    existsWithId(id: number): OrderGivenContext<TUseCase, TInput, TOutput> {
        const product = this.buildProduct(id);
        this.context['addEntity']('products', product);
        return this.context;
    }
}

export class ProductsForOrderBuilder<TUseCase, TInput, TOutput> {
    constructor(
        private readonly context: OrderGivenContext<TUseCase, TInput, TOutput>,
        private readonly configs: ProductConfig[]
    ) {}

    exist(): OrderGivenContext<TUseCase, TInput, TOutput> {
        this.configs.forEach(config => {
            const product = new ProductBuilder()
                .withTitle(config.title || "Default Title")
                .withDescription(config.description || "Default Description")
                .withPrice(config.price || 100)
                .build();
            this.context['addEntity']('products', product);
        });
        return this.context;
    }
}

export class OrderWhenAction<TUseCase, TInput, TOutput> extends WhenAction<TUseCase, TInput, TOutput> {
    get creating() {
        return {
            order: async (input: { productId: number; quantity: number }) => {
                return this.executeUseCase(
                    async (useCase: TUseCase, inp: TInput) => {
                        return (useCase as unknown as { execute: (input: TInput) => Promise<Either<Error, TOutput>> }).execute(inp);
                    },
                    input as unknown as TInput
                );
            }
        };
    }
}

export class OrderSuccessAssertion<TOutput> extends SuccessAssertion<TOutput> {
    order(assertions: (o: OrderAssertions) => void): this {
        const output = this.getOutput() as unknown as Order;
        const orderAssertions = new OrderAssertions(output);
        assertions(orderAssertions);
        return this;
    }

    orderWasSavedInRepository(): this {
        const repo = this.getRepository<OrderRepository>('order');
        expect(repo).toBeDefined();
        return this;
    }
}

export class OrderAssertions {
    constructor(private readonly order: Order) {}

    hasTotalPrice(expected: number): this {
        expect(this.order.totalPrice).toBe(expected);
        return this;
    }

    hasProductId(expected: number): this {
        expect(this.order.product.id).toBe(expected);
        return this;
    }

    hasQuantity(expected: number): this {
        expect(this.order.quantity).toBe(expected);
        return this;
    }

    hasId(expected: number): this {
        expect(this.order.id).toBe(expected);
        return this;
    }
}
