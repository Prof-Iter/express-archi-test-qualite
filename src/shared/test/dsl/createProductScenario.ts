import { Product, ProductBuilder } from '../../../module/product/Product';
import { CreateProductUseCase } from '../../../module/product/createProduct/createProductUseCase';
import { ProductRepositoryFail, ProductRepositoryInMemory } from '../../../module/product/test/fakes/ProductRepositoryFakes';
import { ProductSuccessAssertion } from './ProductScenario';
import { ThenAssertion, Repository } from './UseCaseScenario';

interface CreateProductInput {
    title: string;
    description: string;
    price: number;
}

class CreateProductGiven {
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

    get repositoryFails() {
        return {
            onSave: (): CreateProductGiven => {
                this.repositoryBehaviors.set('product', 'fail');
                return this;
            }
        };
    }

    get and(): this {
        return this;
    }

    get when(): CreateProductWhen {
        const behavior = this.repositoryBehaviors.get('product');
        if (behavior) {
            this.repositories.set('repositoryBehavior', behavior);
        }

        const products = this.entities.get('products') as Product[] | undefined;
        if (products) {
            this.repositories.set('products', products);
        }

        return new CreateProductWhen(this.repositories, this.entities);
    }
}

class FluentProductBuilder {
    private data: Partial<CreateProductInput> = {};

    constructor(private readonly when: CreateProductWhen) {}

    title(value: string): this {
        this.data.title = value;
        return this;
    }

    description(value: string): this {
        this.data.description = value;
        return this;
    }

    price(value: number): this {
        this.data.price = value;
        return this;
    }

    async execute(): Promise<CreateProductThen> {
        const input = this.data as CreateProductInput;
        return this.when.creating.product(input);
    }
}

class CreateProductWhen {
    constructor(
        private readonly repositories: Map<string, Repository>,
        private readonly entities: Map<string, unknown[]>
    ) {}

    private async executeProductCreation(input: CreateProductInput): Promise<CreateProductThen> {
        const behavior = this.repositories.get('repositoryBehavior') as 'fail' | 'succeed' | undefined;
        let productRepo;

        if (behavior === 'fail') {
            productRepo = new ProductRepositoryFail();
        } else {
            const products = this.repositories.get('products') as Product[] | undefined;
            productRepo = new ProductRepositoryInMemory(products || []);
        }

        const useCase = new CreateProductUseCase(productRepo);
        const result = await useCase.execute(input);
        return new CreateProductThen(result, this.repositories, this.entities);
    }

    get creating() {
        const self = this;
        return {
            product: async (input: CreateProductInput | ProductBuilder): Promise<CreateProductThen> => {
                let productData: CreateProductInput;
                if (input instanceof ProductBuilder) {
                    const builtProduct = input.build();
                    productData = {
                        title: builtProduct.title,
                        description: builtProduct.description,
                        price: builtProduct.price
                    };
                } else {
                    productData = input;
                }

                return self.executeProductCreation(productData);
            },
            get productWith(): FluentProductBuilder {
                return new FluentProductBuilder(self);
            }
        };
    }
}

class CreateProductThen extends ThenAssertion<Product> {
    shouldSucceed(): CreateProductSuccess {
        expect(this['result'].isRight()).toBe(true);
        return new CreateProductSuccess(this['result'], this['repositories'], this['entities']);
    }
}

class CreateProductSuccess extends ProductSuccessAssertion<Product> {
    // Inherits product() and other assertions from ProductSuccessAssertion
}

export const createProductScenario = (): CreateProductGiven => {
    return new CreateProductGiven();
};
