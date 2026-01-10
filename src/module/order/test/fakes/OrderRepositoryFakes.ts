import { Either, Left, Right } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import { OrderRepository } from '../../OrderRepository';
import { Order } from '../../Order';

/**
 * OrderRepositoryDummy - Test double that returns successful results
 *
 * Use this for testing happy path scenarios where repository operations
 * should succeed without errors.
 */
export class OrderRepositoryDummy implements OrderRepository {

    async save(order: Order): Promise<Either<Error, Order>> {
        return Right(order);
    }

    async findById(_id: number): Promise<Either<Error, Maybe<Order>>> {
        return Right(Maybe.empty());
    }

    async findAll(): Promise<Either<Error, Order[]>> {
        return Right([]);
    }

    async update(_id: number, _data: Partial<Omit<Order, 'id'>>): Promise<Either<Error, Maybe<Order>>> {
        return Right(Maybe.empty());
    }

    async delete(_id: number): Promise<Either<Error, boolean>> {
        return Right(false);
    }
}

/**
 * OrderRepositoryFail - Test double that simulates repository failures
 *
 * Use this for testing error handling when repository operations fail.
 */
export class OrderRepositoryFail implements OrderRepository {

    async save(_order: Order): Promise<Either<Error, Order>> {
        return Left(new Error("repository save failed"));
    }

    async findById(_id: number): Promise<Either<Error, Maybe<Order>>> {
        return Left(new Error("repository findById failed"));
    }

    async findAll(): Promise<Either<Error, Order[]>> {
        return Left(new Error("repository findAll failed"));
    }

    async update(_id: number, _data: Partial<Omit<Order, 'id'>>): Promise<Either<Error, Maybe<Order>>> {
        return Left(new Error("repository update failed"));
    }

    async delete(_id: number): Promise<Either<Error, boolean>> {
        return Left(new Error("repository delete failed"));
    }
}

/**
 * OrderRepositoryInMemory - Test double with in-memory storage
 *
 * Use this for testing scenarios that require state persistence across
 * multiple operations (e.g., create then update).
 */
export class OrderRepositoryInMemory implements OrderRepository {

    orders: Map<number, Order> = new Map();
    private nextId: number = 1;

    constructor(initialOrders: Order[] = []) {
        initialOrders.forEach(order => {
            if (!order.id) {
                order.id = this.nextId++;
            }
            this.orders.set(order.id, order);
            if (order.id >= this.nextId) {
                this.nextId = order.id + 1;
            }
        });
    }

    async save(order: Order): Promise<Either<Error, Order>> {
        if (!order.id) {
            order.id = this.nextId++;
        }
        this.orders.set(order.id, order);
        return Right(order);
    }

    async findById(id: number): Promise<Either<Error, Maybe<Order>>> {
        const order = this.orders.get(id);
        return Right(Maybe.fromNullable(order));
    }

    async findAll(): Promise<Either<Error, Order[]>> {
        return Right(Array.from(this.orders.values()));
    }

    async update(id: number, data: Partial<Omit<Order, 'id'>>): Promise<Either<Error, Maybe<Order>>> {
        const order = this.orders.get(id);
        if (!order) {
            return Right(Maybe.empty());
        }

        if (data.product !== undefined) order.product = data.product;
        if (data.quantity !== undefined) order.quantity = data.quantity;
        if (data.totalPrice !== undefined) order.totalPrice = data.totalPrice;

        this.orders.set(id, order);
        return Right(Maybe.of(order));
    }

    async delete(id: number): Promise<Either<Error, boolean>> {
        const deleted = this.orders.delete(id);
        return Right(deleted);
    }
}
