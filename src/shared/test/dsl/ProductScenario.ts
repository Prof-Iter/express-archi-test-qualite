import { Product, ProductBuilder } from '../../../module/product/Product';
import { ProductRepository } from '../../../module/product/ProductRepository';
import { GivenContext, WhenAction, SuccessAssertion } from './UseCaseScenario';
import { Either } from 'purify-ts/Either';

export interface ProductConfig {
    title?: string;
    description?: string;
    price?: number;
}

export class ProductGivenContext<TUseCase, TInput, TOutput> extends GivenContext<TUseCase, TInput, TOutput> {

    noProducts(): this {
        this.entities.set('products', []);
        return this;
    }

    product(config: ProductConfig | ProductBuilder): ProductEntityBuilder<TUseCase, TInput, TOutput> {
        return new ProductEntityBuilder(this, config);
    }

    products(configs: ProductConfig[]): ProductEntitiesBuilder<TUseCase, TInput, TOutput> {
        return new ProductEntitiesBuilder(this, configs);
    }

    repositoryFails = {
        onSave: (): ProductGivenContext<TUseCase, TInput, TOutput> => {
            this.setRepositoryBehavior('product', 'fail');
            return this;
        },
        onFind: (): ProductGivenContext<TUseCase, TInput, TOutput> => {
            this.setRepositoryBehavior('product', 'fail');
            return this;
        }
    };

    protected toWhen(): ProductWhenAction<TUseCase, TInput, TOutput> {
        return new ProductWhenAction(this.useCaseFactory, this.repositories, this.entities, this.repositoryBehaviors);
    }

    get when(): ProductWhenAction<TUseCase, TInput, TOutput> {
        return this.toWhen();
    }
}

export class ProductEntityBuilder<TUseCase, TInput, TOutput> {
    constructor(
        private readonly context: ProductGivenContext<TUseCase, TInput, TOutput>,
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

    exists(): ProductGivenContext<TUseCase, TInput, TOutput> {
        const product = this.buildProduct();
        this.context['addEntity']('products', product);
        return this.context;
    }

    existsWithId(id: number): ProductGivenContext<TUseCase, TInput, TOutput> {
        const product = this.buildProduct(id);
        this.context['addEntity']('products', product);
        return this.context;
    }
}

export class ProductEntitiesBuilder<TUseCase, TInput, TOutput> {
    constructor(
        private readonly context: ProductGivenContext<TUseCase, TInput, TOutput>,
        private readonly configs: ProductConfig[]
    ) {}

    exist(): ProductGivenContext<TUseCase, TInput, TOutput> {
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

export class ProductWhenAction<TUseCase, TInput, TOutput> extends WhenAction<TUseCase, TInput, TOutput> {
    get creating() {
        return {
            product: async (input: { title: string; description: string; price: number }) => {
                return this.executeUseCase(
                    async (useCase: TUseCase, inp: TInput) => {
                        return (useCase as unknown as { execute: (input: TInput) => Promise<Either<Error, TOutput>> }).execute(inp);
                    },
                    input as unknown as TInput
                );
            }
        };
    }

    get updating() {
        return {
            product: async (input: { id: number; title: string; description: string; price: number }) => {
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

export class ProductSuccessAssertion<TOutput> extends SuccessAssertion<TOutput> {
    product(assertions: (p: ProductAssertions) => void): this {
        const output = this.getOutput() as unknown as Product;
        const productAssertions = new ProductAssertions(output);
        assertions(productAssertions);
        return this;
    }

    productWasSavedInRepository(): this {
        const repo = this.getRepository<ProductRepository>('product');
        expect(repo).toBeDefined();
        return this;
    }
}

export class ProductAssertions {
    constructor(private readonly product: Product) {}

    hasTitle(expected: string): this {
        expect(this.product.title).toBe(expected);
        return this;
    }

    hasDescription(expected: string): this {
        expect(this.product.description).toBe(expected);
        return this;
    }

    hasPrice(expected: number): this {
        expect(this.product.price).toBe(expected);
        return this;
    }

    hasId(expected: number): this {
        expect(this.product.id).toBe(expected);
        return this;
    }
}
