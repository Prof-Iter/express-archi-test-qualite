import { Product, ProductBuilder } from '../../../module/product/Product';
import { UpdateProductUseCase } from '../../../module/product/updateProduct/updateProductUseCase';
import { ProductRepositoryFail, ProductRepositoryInMemory } from '../../../module/product/test/fakes/ProductRepositoryFakes';
import { ProductSuccessAssertion } from './ProductScenario';
import { ThenAssertion, Repository } from './UseCaseScenario';

interface UpdateProductInput {
    id: number;
    title: string;
    description: string;
    price: number;
}

interface ProductConfig {
    title?: string;
    description?: string;
    price?: number;
}

class UpdateProductGiven {
    private repositories: Map<string, Repository> = new Map();
    private entities: Map<string, unknown[]> = new Map();
    private repositoryBehaviors: Map<string, 'fail' | 'succeed'> = new Map();

    constructor() {
        this.entities.set('products', []);
    }

    noProducts(): this {
        this.entities.set('products', []);
        return this;
    }

    product(config: ProductConfig): ProductBuilder_DSL {
        return new ProductBuilder_DSL(this, config);
    }

    get repositoryFails() {
        return {
            onSave: (): UpdateProductGiven => {
                this.repositoryBehaviors.set('product', 'fail');
                return this;
            }
        };
    }

    get and(): this {
        return this;
    }

    get when(): UpdateProductWhen {
        const behavior = this.repositoryBehaviors.get('product');
        if (behavior) {
            this.repositories.set('repositoryBehavior', behavior);
        }

        const products = this.entities.get('products') as Product[] | undefined;
        if (products) {
            this.repositories.set('products', products);
        }

        return new UpdateProductWhen(this.repositories, this.entities);
    }
}

class ProductBuilder_DSL {
    constructor(
        private readonly context: UpdateProductGiven,
        private readonly config: ProductConfig
    ) {}

    existsWithId(id: number): UpdateProductGiven {
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

class UpdateProductWhen {
    constructor(
        private readonly repositories: Map<string, Repository>,
        private readonly entities: Map<string, unknown[]>
    ) {}

    get updating() {
        return {
            product: async (input: UpdateProductInput): Promise<UpdateProductThen> => {
                const behavior = this.repositories.get('repositoryBehavior') as 'fail' | 'succeed' | undefined;
                let productRepo;

                if (behavior === 'fail') {
                    productRepo = new ProductRepositoryFail();
                } else {
                    const products = this.repositories.get('products') as Product[] | undefined;
                    productRepo = new ProductRepositoryInMemory(products || []);
                }

                const useCase = new UpdateProductUseCase(productRepo);
                const result = await useCase.execute(input);
                return new UpdateProductThen(result, this.repositories, this.entities);
            }
        };
    }
}

class UpdateProductThen extends ThenAssertion<Product> {
    shouldSucceed(): UpdateProductSuccess {
        expect(this['result'].isRight()).toBe(true);
        return new UpdateProductSuccess(this['result'], this['repositories'], this['entities']);
    }
}

class UpdateProductSuccess extends ProductSuccessAssertion<Product> {
    // Inherits product() and other assertions from ProductSuccessAssertion
}

export const updateProductScenario = (): UpdateProductGiven => {
    return new UpdateProductGiven();
};
