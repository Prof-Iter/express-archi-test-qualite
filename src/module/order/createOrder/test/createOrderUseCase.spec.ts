import { describe, expect, test } from '@jest/globals';
import CreateOrderOrderRepository from '../createOrderOrderRepository';
import { CreateOrderProductRepository } from '../createOrder.productRepository';
import { Product } from '../../../product/Product';
import CreateOrderUseCase from '../createOrderUseCase';
import { Order } from '../../Order';

class CreateOrderDummyOrderRepository implements CreateOrderOrderRepository {

    orders: Order[] = [];

    async save(order: Order): Promise<void> {
        this.orders.push(order);
    }
}

class CreateOrderProductDummyRepository implements  CreateOrderProductRepository {
    async getById(id: number): Promise<Product> {
        const product = new Product({title: "test", description: "test", price: 75});
        product.id = 1;
        return product;
    }
}

describe("US-3 : Créer une commande",  () => {

    test("Scénario 1 : création réussie, montant total de la commande calculée", async () => {

        // Étant donné qu'il n'y a pas de commande enregistrée
        // et qu'un produit existe avec l'id 1 et un prix de 75€
        const createOrderOrderRepository = new CreateOrderDummyOrderRepository();
        const createOrderProductRepository = new CreateOrderProductDummyRepository();

        // Quand je créé une commande avec un produit d'id 1 et une quantité de 2
        const createOrderUseCase = new CreateOrderUseCase(createOrderProductRepository, createOrderOrderRepository);

        await createOrderUseCase.execute({id: 1, quantity: 2});

        // Alors la commande doit être créée avec un prix total de 150€ (calculé automatiquement : 75€ * 2)
        expect(createOrderOrderRepository.orders[0].totalPrice).toBe(150);
    });

});