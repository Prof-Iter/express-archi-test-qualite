import { Either } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import { Order } from './Order';

/**
 * OrderRepository - Interface for Order entity persistence operations
 *
 * This repository follows the Repository pattern with functional error handling:
 * - All operations return Either<Error, T> to handle errors without exceptions
 * - Optional values are wrapped in Maybe<T> to avoid null/undefined
 * - Each method represents a single unit of work
 */
export interface OrderRepository {
    /**
     * Save a new order or update an existing one
     * @param order - The order entity to save
     * @returns Either<Error, Order> - Right with saved order, or Left with error
     */
    save(order: Order): Promise<Either<Error, Order>>;

    /**
     * Find an order by its ID
     * @param id - The order identifier
     * @returns Either<Error, Maybe<Order>> - Right with Maybe<Order> (empty if not found), or Left with error
     */
    findById(id: number): Promise<Either<Error, Maybe<Order>>>;

    /**
     * Find all orders
     * @returns Either<Error, Order[]> - Right with array of orders (empty if none), or Left with error
     */
    findAll(): Promise<Either<Error, Order[]>>;

    /**
     * Update an existing order
     * @param id - The order identifier
     * @param data - Partial order data to update
     * @returns Either<Error, Maybe<Order>> - Right with Maybe<Order> (empty if not found), or Left with error
     */
    update(id: number, data: Partial<Omit<Order, 'id'>>): Promise<Either<Error, Maybe<Order>>>;

    /**
     * Delete an order by its ID
     * @param id - The order identifier
     * @returns Either<Error, boolean> - Right with true if deleted, false if not found, or Left with error
     */
    delete(id: number): Promise<Either<Error, boolean>>;
}
