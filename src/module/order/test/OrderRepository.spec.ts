import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { DataSource } from 'typeorm';
import { Order, OrderBuilder } from '../Order';
import { Product, ProductBuilder } from '../../product/Product';
import { OrderTypeOrmRepository } from '../OrderTypeOrmRepository';

describe('OrderRepository - Tests unitaires avec base de données en mémoire', () => {
    let dataSource: DataSource;
    let repository: OrderTypeOrmRepository;
    let testProduct: Product;

    beforeAll(async () => {
        // Créer une DataSource TypeORM avec sql.js (SQLite en mémoire)
        dataSource = new DataSource({
            type: 'sqljs',
            synchronize: true,
            logging: false,
            entities: [Order, Product],
            entitySkipConstructor: true
        });

        await dataSource.initialize();

        // Override AppDataSource with in-memory database
        const AppDataSource = require('../../../config/db.config').default;
        Object.assign(AppDataSource, dataSource);

        repository = new OrderTypeOrmRepository();

        // Create a test product for use in tests
        testProduct = new ProductBuilder()
            .withTitle('Test Product')
            .withDescription('Test Description')
            .withPrice(75)
            .build();
        await dataSource.getRepository(Product).save(testProduct);
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
    });

    beforeEach(async () => {
        // Nettoyer la base de données avant chaque test
        await dataSource.getRepository(Order).clear();
    });

    describe('save()', () => {
        test('doit sauvegarder une nouvelle commande et retourner Right avec la commande sauvegardée', async () => {
            // Étant donné une nouvelle commande valide
            const order = new OrderBuilder()
                .withProduct(testProduct)
                .withQuantity(2)
                .build();

            // Quand on la sauvegarde
            const result = await repository.save(order);

            // Alors le résultat doit être Right avec la commande sauvegardée incluant un ID
            expect(result.isRight()).toBe(true);
            result.ifRight(savedOrder => {
                expect(savedOrder.id).toBeDefined();
                expect(savedOrder.quantity).toBe(2);
                expect(savedOrder.totalPrice).toBe(150);
                expect(savedOrder.product.id).toBe(testProduct.id);
            });
        });

        test('doit retourner Left en cas d\'erreur de validation du domaine', async () => {
            // Étant donné une commande invalide (prix total >= 200)
            const expensiveProduct = new ProductBuilder()
                .withTitle('Expensive')
                .withDescription('Expensive Product')
                .withPrice(100)
                .build();
            await dataSource.getRepository(Product).save(expensiveProduct);

            // On utilise create ici pour tester la validation du domaine déclenchée par create
            const result = Order.create({ product: expensiveProduct, quantity: 2 });
            
            // Alors le résultat doit être Left
            expect(result.isLeft()).toBe(true);
            result.mapLeft(error => {
                expect(error.message).toBe("le prix par commande doit être inférieur à 200€");
            });
        });
    });

    describe('findById()', () => {
        test('doit retourner Right avec Maybe.of(order) quand la commande existe', async () => {
            // Étant donné une commande sauvegardée
            const order = new OrderBuilder()
                .withProduct(testProduct)
                .withQuantity(2)
                .build();
            const saveResult = await repository.save(order);
            let savedId: number = 0;
            saveResult.ifRight(o => { savedId = o.id; });

            // Quand on la recherche par ID
            const result = await repository.findById(savedId);

            // Alors le résultat doit être Right avec Maybe contenant la commande
            expect(result.isRight()).toBe(true);
            result.ifRight(maybeOrder => {
                expect(maybeOrder.isJust()).toBe(true);
                maybeOrder.ifJust(foundOrder => {
                    expect(foundOrder.id).toBe(savedId);
                    expect(foundOrder.quantity).toBe(2);
                    expect(foundOrder.totalPrice).toBe(150);
                });
            });
        });

        test('doit retourner Right avec Maybe.empty() quand la commande n\'existe pas', async () => {
            // Étant donné un ID qui n'existe pas
            const nonExistentId = 99999;

            // Quand on recherche cette commande
            const result = await repository.findById(nonExistentId);

            // Alors le résultat doit être Right avec Maybe vide
            expect(result.isRight()).toBe(true);
            result.ifRight(maybeOrder => {
                expect(maybeOrder.isNothing()).toBe(true);
            });
        });
    });

    describe('findAll()', () => {
        test('doit retourner Right avec toutes les commandes', async () => {
            // Étant donné plusieurs commandes sauvegardées
            const order1 = new OrderBuilder().withProduct(testProduct).withQuantity(1).build();
            const order2 = new OrderBuilder().withProduct(testProduct).withQuantity(2).build();

            await repository.save(order1);
            await repository.save(order2);

            // Quand on récupère toutes les commandes
            const result = await repository.findAll();

            // Alors le résultat doit être Right avec un tableau de 2 commandes
            expect(result.isRight()).toBe(true);
            result.ifRight(orders => {
                expect(orders).toHaveLength(2);
                expect(orders[0].quantity).toBe(1);
                expect(orders[1].quantity).toBe(2);
            });
        });

        test('doit retourner Right avec un tableau vide quand aucune commande n\'existe', async () => {
            // Étant donné qu'aucune commande n'existe
            // (beforeEach a déjà nettoyé la base)

            // Quand on récupère toutes les commandes
            const result = await repository.findAll();

            // Alors le résultat doit être Right avec un tableau vide
            expect(result.isRight()).toBe(true);
            result.ifRight(orders => {
                expect(orders).toHaveLength(0);
            });
        });
    });

    describe('update()', () => {
        test('doit mettre à jour une commande existante et retourner Right avec Maybe.of(order)', async () => {
            // Étant donné une commande sauvegardée
            const order = new OrderBuilder().withProduct(testProduct).withQuantity(1).build();
            const saveResult = await repository.save(order);
            let savedId: number = 0;
            saveResult.ifRight(o => { savedId = o.id; });

            // Quand on met à jour la commande
            const result = await repository.update(savedId, {
                quantity: 2,
                totalPrice: 150
            });

            // Alors le résultat doit être Right avec Maybe contenant la commande mise à jour
            expect(result.isRight()).toBe(true);
            result.ifRight(maybeOrder => {
                expect(maybeOrder.isJust()).toBe(true);
                maybeOrder.ifJust(updatedOrder => {
                    expect(updatedOrder.id).toBe(savedId);
                    expect(updatedOrder.quantity).toBe(2);
                    expect(updatedOrder.totalPrice).toBe(150);
                });
            });
        });

        test('doit retourner Right avec Maybe.empty() quand la commande n\'existe pas', async () => {
            // Étant donné un ID qui n'existe pas
            const nonExistentId = 99999;

            // Quand on tente de mettre à jour cette commande
            const result = await repository.update(nonExistentId, {
                quantity: 5
            });

            // Alors le résultat doit être Right avec Maybe vide
            expect(result.isRight()).toBe(true);
            result.ifRight(maybeOrder => {
                expect(maybeOrder.isNothing()).toBe(true);
            });
        });
    });

    describe('delete()', () => {
        test('doit supprimer une commande existante et retourner Right(true)', async () => {
            // Étant donné une commande sauvegardée
            const order = new OrderBuilder().withProduct(testProduct).withQuantity(1).build();
            const saveResult = await repository.save(order);
            let savedId: number = 0;
            saveResult.ifRight(o => { savedId = o.id; });

            // Quand on supprime la commande
            const result = await repository.delete(savedId);

            // Alors le résultat doit être Right(true)
            expect(result.isRight()).toBe(true);
            result.ifRight(deleted => {
                expect(deleted).toBe(true);
            });

            // Et la commande ne doit plus exister
            const findResult = await repository.findById(savedId);
            findResult.ifRight(maybeOrder => {
                expect(maybeOrder.isNothing()).toBe(true);
            });
        });

        test('doit retourner Right(false) quand la commande n\'existe pas', async () => {
            // Étant donné un ID qui n'existe pas
            const nonExistentId = 99999;

            // Quand on tente de supprimer cette commande
            const result = await repository.delete(nonExistentId);

            // Alors le résultat doit être Right(false)
            expect(result.isRight()).toBe(true);
            result.ifRight(deleted => {
                expect(deleted).toBe(false);
            });
        });
    });
});
