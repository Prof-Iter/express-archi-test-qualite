import { Either, Left, Right } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import { ProductRepository } from './ProductRepository';
import { Product } from './Product';
import AppDataSource from '../../config/db.config';
import { ERROR_KEYS } from '../../shared/i18n/errorKeys';

/**
 * ProductTypeOrmRepository - TypeORM implementation of ProductRepository
 *
 * Handles all database operations for Product entity using TypeORM.
 * Returns Either for error handling without throwing exceptions.
 */
export class ProductTypeOrmRepository implements ProductRepository {

    async save(product: Product): Promise<Either<Error, Product>> {
        try {
            const repository = AppDataSource.getRepository<Product>(Product);
            const savedProduct = await repository.save(product);
            return Right(savedProduct);
        } catch (_error) {
            return Left(new Error(ERROR_KEYS.PRODUCT_SAVE_ERROR));
        }
    }

    async findById(id: number): Promise<Either<Error, Maybe<Product>>> {
        try {
            const repository = AppDataSource.getRepository<Product>(Product);
            const product = await repository.findOne({ where: { id } });
            return Right(Maybe.fromNullable(product));
        } catch (_error) {
            return Left(new Error(ERROR_KEYS.PRODUCT_FETCH_ERROR));
        }
    }

    async findAll(): Promise<Either<Error, Product[]>> {
        try {
            const repository = AppDataSource.getRepository<Product>(Product);
            const products = await repository.find();
            return Right(products);
        } catch (_error) {
            return Left(new Error(ERROR_KEYS.PRODUCT_FETCH_ERROR));
        }
    }

    async update(id: number, data: Partial<Omit<Product, 'id'>>): Promise<Either<Error, Maybe<Product>>> {
        try {
            const repository = AppDataSource.getRepository<Product>(Product);

            // Find existing product
            const existingProduct = await repository.findOne({ where: { id } });

            if (!existingProduct) {
                return Right(Maybe.empty());
            }

            // Update fields
            if (data.title !== undefined) existingProduct.title = data.title;
            if (data.description !== undefined) existingProduct.description = data.description;
            if (data.price !== undefined) existingProduct.price = data.price;

            // Save updated product
            const updatedProduct = await repository.save(existingProduct);
            return Right(Maybe.of(updatedProduct));
        } catch (_error) {
            return Left(new Error(ERROR_KEYS.PRODUCT_UPDATE_ERROR));
        }
    }

    async delete(id: number): Promise<Either<Error, boolean>> {
        try {
            const repository = AppDataSource.getRepository<Product>(Product);
            const result = await repository.delete(id);

            // affected is the number of rows affected, or undefined
            const deleted = (result.affected !== undefined && result.affected > 0);
            return Right(deleted);
        } catch (_error) {
            return Left(new Error(ERROR_KEYS.PRODUCT_DELETE_ERROR));
        }
    }
}
