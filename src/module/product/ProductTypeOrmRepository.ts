import { Either, Left, Right } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import { ProductRepository } from './ProductRepository';
import { Product } from './Product';
import AppDataSource from '../../config/db.config';

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
        } catch (error) {
            return Left(new Error(`Erreur lors de la sauvegarde du produit: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }

    async findById(id: number): Promise<Either<Error, Maybe<Product>>> {
        try {
            const repository = AppDataSource.getRepository<Product>(Product);
            const product = await repository.findOne({ where: { id } });
            return Right(Maybe.fromNullable(product));
        } catch (error) {
            return Left(new Error(`Erreur lors de la recherche du produit par ID: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }

    async findAll(): Promise<Either<Error, Product[]>> {
        try {
            const repository = AppDataSource.getRepository<Product>(Product);
            const products = await repository.find();
            return Right(products);
        } catch (error) {
            return Left(new Error(`Erreur lors de la récupération des produits: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
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
        } catch (error) {
            return Left(new Error(`Erreur lors de la mise à jour du produit: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }

    async delete(id: number): Promise<Either<Error, boolean>> {
        try {
            const repository = AppDataSource.getRepository<Product>(Product);
            const result = await repository.delete(id);

            // affected is the number of rows affected, or undefined
            const deleted = (result.affected !== undefined && result.affected > 0);
            return Right(deleted);
        } catch (error) {
            return Left(new Error(`Erreur lors de la suppression du produit: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }
}
