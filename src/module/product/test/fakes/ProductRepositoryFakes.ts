import { Either, Left, Right } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import { ProductRepository } from '../../ProductRepository';
import { Product } from '../../Product';

/**
 * ProductRepositoryDummy - Test double that returns successful results
 *
 * Use this for testing happy path scenarios where repository operations
 * should succeed without errors.
 */
export class ProductRepositoryDummy implements ProductRepository {

    async save(product: Product): Promise<Either<Error, Product>> {
        return Right(product);
    }

    async findById(_id: number): Promise<Either<Error, Maybe<Product>>> {
        return Right(Maybe.empty());
    }

    async findAll(): Promise<Either<Error, Product[]>> {
        return Right([]);
    }

    async update(_id: number, _data: Partial<Omit<Product, 'id'>>): Promise<Either<Error, Maybe<Product>>> {
        return Right(Maybe.empty());
    }

    async delete(_id: number): Promise<Either<Error, boolean>> {
        return Right(false);
    }
}

/**
 * ProductRepositoryFail - Test double that simulates repository failures
 *
 * Use this for testing error handling when repository operations fail.
 */
export class ProductRepositoryFail implements ProductRepository {

    async save(_product: Product): Promise<Either<Error, Product>> {
        return Left(new Error("repository save failed"));
    }

    async findById(_id: number): Promise<Either<Error, Maybe<Product>>> {
        return Left(new Error("repository findById failed"));
    }

    async findAll(): Promise<Either<Error, Product[]>> {
        return Left(new Error("repository findAll failed"));
    }

    async update(_id: number, _data: Partial<Omit<Product, 'id'>>): Promise<Either<Error, Maybe<Product>>> {
        return Left(new Error("repository update failed"));
    }

    async delete(_id: number): Promise<Either<Error, boolean>> {
        return Left(new Error("repository delete failed"));
    }
}

/**
 * ProductRepositoryInMemory - Test double with in-memory storage
 *
 * Use this for testing scenarios that require state persistence across
 * multiple operations (e.g., create then update).
 */
export class ProductRepositoryInMemory implements ProductRepository {

    products: Map<number, Product> = new Map();
    private nextId: number = 1;

    constructor(initialProducts: Product[] = []) {
        initialProducts.forEach(product => {
            if (!product.id) {
                product.id = this.nextId++;
            }
            this.products.set(product.id, product);
            if (product.id >= this.nextId) {
                this.nextId = product.id + 1;
            }
        });
    }

    async save(product: Product): Promise<Either<Error, Product>> {
        if (!product.id) {
            product.id = this.nextId++;
        }
        this.products.set(product.id, product);
        return Right(product);
    }

    async findById(id: number): Promise<Either<Error, Maybe<Product>>> {
        const product = this.products.get(id);
        return Right(Maybe.fromNullable(product));
    }

    async findAll(): Promise<Either<Error, Product[]>> {
        return Right(Array.from(this.products.values()));
    }

    async update(id: number, data: Partial<Omit<Product, 'id'>>): Promise<Either<Error, Maybe<Product>>> {
        const product = this.products.get(id);
        if (!product) {
            return Right(Maybe.empty());
        }

        if (data.title !== undefined) product.title = data.title;
        if (data.description !== undefined) product.description = data.description;
        if (data.price !== undefined) product.price = data.price;

        this.products.set(id, product);
        return Right(Maybe.of(product));
    }

    async delete(id: number): Promise<Either<Error, boolean>> {
        const deleted = this.products.delete(id);
        return Right(deleted);
    }
}
