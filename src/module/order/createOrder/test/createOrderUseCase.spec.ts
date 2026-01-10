import { describe, expect, test } from '@jest/globals';
import { Product } from '../../../product/Product';
import CreateOrderUseCase from '../createOrderUseCase';
import { OrderRepositoryInMemory, OrderRepositoryFail } from '../../test/fakes/OrderRepositoryFakes';
import { ProductRepositoryInMemory } from '../../../product/test/fakes/ProductRepositoryFakes';

describe("US-3 : Créer une commande",  () => {

    test("Scénario 1 : création réussie, montant total de la commande calculée", async () => {

        // Étant donné qu'il n'y a pas de commande enregistrée
        // et qu'un produit existe avec l'id 1 et un prix de 75€
        const product1 = new Product({title: "test", description: "test", price: 75});
        product1.id = 1;
        
        const orderRepository = new OrderRepositoryInMemory();
        const productRepository = new ProductRepositoryInMemory([product1]);

        // Quand je créé une commande avec un produit d'id 1 et une quantité de 2
        const createOrderUseCase = new CreateOrderUseCase(productRepository, orderRepository);

        const result = await createOrderUseCase.execute({id: 1, quantity: 2});

        // Alors la commande doit être créée avec un prix total de 150€ (calculé automatiquement : 75€ * 2)
        expect(result.isRight()).toBe(true);
        result.map(order => {
            expect(order.totalPrice).toBe(150);
            expect(order.product.id).toBe(1);
        });
        
        const orders = await orderRepository.findAll();
        orders.map(o => expect(o.length).toBe(1));
    });

    test("Scénario 2: échec, prix total supérieur ou égal à 200€", async () => {

        // Étant donné qu'il n'y a pas de commande enregistrée
        // et qu'un produit existe avec l'id 2 et un prix de 100€
        const product2 = new Product({title: "test2", description: "test2", price: 100});
        product2.id = 2;

        const orderRepository = new OrderRepositoryInMemory();
        const productRepository = new ProductRepositoryInMemory([product2]);

        // Quand je créé une commande avec une quantité de 2 (prix total calculé = 200€)
        const createOrderUseCase = new CreateOrderUseCase(productRepository, orderRepository);

        const result = await createOrderUseCase.execute({id: 2, quantity: 2});

        // Alors une erreur doit être envoyée "le prix par commande doit être inférieur à 200€"
        expect(result.isLeft()).toBe(true);
        result.mapLeft(error => {
            expect(error.message).toBe("le prix par commande doit être inférieur à 200€");
        });
    });

    test("Scénario 3 : échec, produit non trouvé", async () => {
        // Étant donné qu'aucun produit n'existe
        const orderRepository = new OrderRepositoryInMemory();
        const productRepository = new ProductRepositoryInMemory();
        const createOrderUseCase = new CreateOrderUseCase(productRepository, orderRepository);

        // Quand je tente de créer une commande pour un produit inexistant
        const result = await createOrderUseCase.execute({id: 999, quantity: 1});

        // Alors une erreur "produit non trouvé" doit être retournée
        expect(result.isLeft()).toBe(true);
        result.mapLeft(error => {
            expect(error.message).toBe("produit non trouvé");
        });
    });

    test("Scénario 4 : échec, erreur lors de la sauvegarde", async () => {
        // Étant donné qu'un produit existe
        const product = new Product({title: "test", description: "test", price: 50});
        product.id = 1;
        const productRepository = new ProductRepositoryInMemory([product]);
        
        // Et que le repository de commande échoue
        const orderRepository = new OrderRepositoryFail();
        const createOrderUseCase = new CreateOrderUseCase(productRepository, orderRepository);

        // Quand je tente de créer une commande
        const result = await createOrderUseCase.execute({id: 1, quantity: 1});

        // Alors l'erreur du repository doit être retournée
        expect(result.isLeft()).toBe(true);
        result.mapLeft(error => {
            expect(error.message).toBe("repository save failed");
        });
    });

});