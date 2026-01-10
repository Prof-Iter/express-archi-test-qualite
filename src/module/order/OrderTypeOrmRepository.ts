import { Either, Left, Right } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import { OrderRepository } from './OrderRepository';
import { Order } from './Order';
import AppDataSource from '../../config/db.config';

/**
 * OrderTypeOrmRepository - TypeORM implementation of OrderRepository
 *
 * Handles all database operations for Order entity using TypeORM.
 * Returns Either for error handling without throwing exceptions.
 */
export class OrderTypeOrmRepository implements OrderRepository {

    async save(order: Order): Promise<Either<Error, Order>> {
        try {
            const repository = AppDataSource.getRepository<Order>(Order);
            const savedOrder = await repository.save(order);
            return Right(savedOrder);
        } catch (error) {
            return Left(new Error(`Erreur lors de la sauvegarde de la commande: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }

    async findById(id: number): Promise<Either<Error, Maybe<Order>>> {
        try {
            const repository = AppDataSource.getRepository<Order>(Order);
            const order = await repository.findOne({ where: { id }, relations: ['product'] });
            return Right(Maybe.fromNullable(order));
        } catch (error) {
            return Left(new Error(`Erreur lors de la recherche de la commande par ID: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }

    async findAll(): Promise<Either<Error, Order[]>> {
        try {
            const repository = AppDataSource.getRepository<Order>(Order);
            const orders = await repository.find({ relations: ['product'] });
            return Right(orders);
        } catch (error) {
            return Left(new Error(`Erreur lors de la récupération des commandes: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }

    async update(id: number, data: Partial<Omit<Order, 'id'>>): Promise<Either<Error, Maybe<Order>>> {
        try {
            const repository = AppDataSource.getRepository<Order>(Order);

            // Find existing order
            const existingOrder = await repository.findOne({ where: { id }, relations: ['product'] });

            if (!existingOrder) {
                return Right(Maybe.empty());
            }

            // Update fields
            if (data.product !== undefined) existingOrder.product = data.product;
            if (data.quantity !== undefined) existingOrder.quantity = data.quantity;
            if (data.totalPrice !== undefined) existingOrder.totalPrice = data.totalPrice;

            // Save updated order
            const updatedOrder = await repository.save(existingOrder);
            return Right(Maybe.of(updatedOrder));
        } catch (error) {
            return Left(new Error(`Erreur lors de la mise à jour de la commande: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }

    async delete(id: number): Promise<Either<Error, boolean>> {
        try {
            const repository = AppDataSource.getRepository<Order>(Order);
            const result = await repository.delete(id);

            // affected is the number of rows affected, or undefined
            const deleted = (result.affected !== undefined && result.affected > 0);
            return Right(deleted);
        } catch (error) {
            return Left(new Error(`Erreur lors de la suppression de la commande: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
        }
    }
}
