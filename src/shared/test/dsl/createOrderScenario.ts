import { Order } from '../../../module/order/Order';
import { Product, ProductBuilder } from '../../../module/product/Product';
import CreateOrderUseCase from '../../../module/order/createOrder/createOrderUseCase';
import { OrderRepositoryFail, OrderRepositoryInMemory } from '../../../module/order/test/fakes/OrderRepositoryFakes';
import { ProductRepositoryInMemory } from '../../../module/product/test/fakes/ProductRepositoryFakes';
import { OrderSuccessAssertion } from './OrderScenario';
import { ThenAssertion, Repository } from './UseCaseScenario';

interface CreateOrderInput {
    id: number;
    quantity: number;
}

interface ProductConfig {
    title?: string;
    description?: string;
    price?: number;
}

class CreateOrderGiven {
    private repositories: Map<string, Repository> = new Map();
    private entities: Map<string, unknown[]> = new Map();
    private repositoryBehaviors: Map<string, 'fail' | 'succeed'> = new Map();

    constructor() {
        this.entities.set('products', []);
        this.entities.set('orders', []);
    }

    noProducts(): this {
        this.entities.set('products', []);
        return this;
    }

    noOrders(): this {
        this.entities.set('orders', []);
        return this;
    }

    product(config: ProductConfig): ProductForOrderBuilder {
        return new ProductForOrderBuilder(this, config);
    }

    get repositoryFails() {
        return {
            onSave: (): CreateOrderGiven => {
                this.repositoryBehaviors.set('order', 'fail');
                return this;
            }
        };
    }

    get and(): this {
        return this;
    }

    get when(): CreateOrderWhen {
        const behavior = this.repositoryBehaviors.get('order');
        if (behavior) {
            this.repositories.set('orderRepositoryBehavior', behavior);
        }

        const products = this.entities.get('products') as Product[] | undefined;
        if (products) {
            this.repositories.set('products', products);
        }

        const orders = this.entities.get('orders') as Order[] | undefined;
        if (orders) {
            this.repositories.set('orders', orders);
        }

        return new CreateOrderWhen(this.repositories, this.entities);
    }
}

class ProductForOrderBuilder {
    constructor(
        private readonly context: CreateOrderGiven,
        private readonly config: ProductConfig
    ) {}

    existsWithId(id: number): CreateOrderGiven {
        const products = this.context['entities'].get('products') as Product[];
        const product = new ProductBuilder()
            .withTitle(this.config.title || "Default Title")
            .withDescription(this.config.description || "Default Description")
            .withPrice(this.config.price || 100)
            .withId(id)
            .build();
        products.push(product);
        return this.context;
    }
}

class CreateOrderWhen {
    constructor(
        private readonly repositories: Map<string, Repository>,
        private readonly entities: Map<string, unknown[]>
    ) {}

    get creating() {
        return {
            order: async (input: CreateOrderInput): Promise<CreateOrderThen> => {
                const orderBehavior = this.repositories.get('orderRepositoryBehavior') as 'fail' | 'succeed' | undefined;
                let orderRepo;

                if (orderBehavior === 'fail') {
                    orderRepo = new OrderRepositoryFail();
                } else {
                    const orders = this.repositories.get('orders') as Order[] | undefined;
                    orderRepo = new OrderRepositoryInMemory(orders || []);
                }

                const products = this.repositories.get('products') as Product[] | undefined;
                const productRepo = new ProductRepositoryInMemory(products || []);

                const useCase = new CreateOrderUseCase(productRepo, orderRepo);
                const result = await useCase.execute(input);
                return new CreateOrderThen(result, this.repositories, this.entities);
            }
        };
    }
}

class CreateOrderThen extends ThenAssertion<Order> {
    shouldSucceed(): CreateOrderSuccess {
        expect(this['result'].isRight()).toBe(true);
        return new CreateOrderSuccess(this['result'], this['repositories'], this['entities']);
    }
}

class CreateOrderSuccess extends OrderSuccessAssertion<Order> {
    // Inherits order() and other assertions from OrderSuccessAssertion
}

export const createOrderScenario = (): CreateOrderGiven => {
    return new CreateOrderGiven();
};
