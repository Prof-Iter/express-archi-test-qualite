import { Either } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import { Product } from './Product';

/**
 * ProductRepository - Interface for Product entity persistence operations
 *
 * This repository follows the Repository pattern with functional error handling:
 * - All operations return Either<Error, T> to handle errors without exceptions
 * - Optional values are wrapped in Maybe<T> to avoid null/undefined
 * - Each method represents a single unit of work
 */
export interface ProductRepository {
    /**
     * Save a new product or update an existing one
     * @param product - The product entity to save
     * @returns Either<Error, Product> - Right with saved product, or Left with error
     */
    save(product: Product): Promise<Either<Error, Product>>;

    /**
     * Find a product by its ID
     * @param id - The product identifier
     * @returns Either<Error, Maybe<Product>> - Right with Maybe<Product> (empty if not found), or Left with error
     */
    findById(id: number): Promise<Either<Error, Maybe<Product>>>;

    /**
     * Find all products
     * @returns Either<Error, Product[]> - Right with array of products (empty if none), or Left with error
     */
    findAll(): Promise<Either<Error, Product[]>>;

    /**
     * Update an existing product
     * @param id - The product identifier
     * @param data - Partial product data to update
     * @returns Either<Error, Maybe<Product>> - Right with Maybe<Product> (empty if not found), or Left with error
     */
    update(id: number, data: Partial<Omit<Product, 'id'>>): Promise<Either<Error, Maybe<Product>>>;

    /**
     * Delete a product by its ID
     * @param id - The product identifier
     * @returns Either<Error, boolean> - Right with true if deleted, false if not found, or Left with error
     */
    delete(id: number): Promise<Either<Error, boolean>>;
}
