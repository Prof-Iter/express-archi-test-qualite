import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { DataSource } from 'typeorm';
import { Product, ProductBuilder } from '../Product';
import { ProductTypeOrmRepository } from '../ProductTypeOrmRepository';

describe('ProductRepository - Tests unitaires avec base de données en mémoire', () => {
    let dataSource: DataSource;
    let repository: ProductTypeOrmRepository;

    beforeAll(async () => {
        // Créer une DataSource TypeORM avec sql.js (SQLite en mémoire)
        dataSource = new DataSource({
            type: 'sqljs',
            synchronize: true,
            logging: false,
            entities: [Product],
            entitySkipConstructor: true
        });

        await dataSource.initialize();

        // Override AppDataSource with in-memory database
        const AppDataSource = require('../../../config/db.config').default;
        Object.assign(AppDataSource, dataSource);

        repository = new ProductTypeOrmRepository();
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
    });

    beforeEach(async () => {
        // Nettoyer la base de données avant chaque test
        await dataSource.getRepository(Product).clear();
    });

    describe('save()', () => {
        test('doit sauvegarder un nouveau produit et retourner Right avec le produit sauvegardé', async () => {
            // Étant donné un nouveau produit valide
            const product = new ProductBuilder()
                .withTitle('Nintendo Switch')
                .withDescription('Console de jeu portable')
                .withPrice(299.99)
                .build();

            // Quand on le sauvegarde
            const result = await repository.save(product);

            // Alors le résultat doit être Right avec le produit sauvegardé incluant un ID
            expect(result.isRight()).toBe(true);
            result.ifRight(savedProduct => {
                expect(savedProduct.id).toBeDefined();
                expect(savedProduct.title).toBe('Nintendo Switch');
                expect(savedProduct.description).toBe('Console de jeu portable');
                expect(savedProduct.price).toBe(299.99);
            });
        });

        test('doit retourner Left en cas d\'erreur de validation du domaine', async () => {
            // Étant donné un produit invalide (prix négatif)
            // On utilise quand même create ici car on veut tester la validation du domaine déclenchée par create
            const result = Product.create({
                title: 'Produit invalide',
                description: 'Prix négatif',
                price: -10
            });

            // Alors le résultat doit être Left
            expect(result.isLeft()).toBe(true);
            result.mapLeft(error => {
                expect(error.message).toBe('le prix doit être supérieur à 0');
            });
        });
    });

    describe('findById()', () => {
        test('doit retourner Right avec Maybe.of(product) quand le produit existe', async () => {
            // Étant donné un produit sauvegardé
            const product = new ProductBuilder()
                .withTitle('PlayStation 5')
                .withDescription('Console nouvelle génération')
                .withPrice(499.99)
                .build();
            const saveResult = await repository.save(product);
            let savedId: number = 0;
            saveResult.ifRight(p => { savedId = p.id; });

            // Quand on le recherche par ID
            const result = await repository.findById(savedId);

            // Alors le résultat doit être Right avec Maybe contenant le produit
            expect(result.isRight()).toBe(true);
            result.ifRight(maybeProduct => {
                expect(maybeProduct.isJust()).toBe(true);
                maybeProduct.ifJust(foundProduct => {
                    expect(foundProduct.id).toBe(savedId);
                    expect(foundProduct.title).toBe('PlayStation 5');
                });
            });
        });

        test('doit retourner Right avec Maybe.empty() quand le produit n\'existe pas', async () => {
            // Étant donné un ID qui n'existe pas
            const nonExistentId = 99999;

            // Quand on recherche ce produit
            const result = await repository.findById(nonExistentId);

            // Alors le résultat doit être Right avec Maybe vide
            expect(result.isRight()).toBe(true);
            result.ifRight(maybeProduct => {
                expect(maybeProduct.isNothing()).toBe(true);
            });
        });
    });

    describe('findAll()', () => {
        test('doit retourner Right avec tous les produits', async () => {
            // Étant donné plusieurs produits sauvegardés
            const product1 = new ProductBuilder().withTitle('Xbox Series X').withDescription('Console Microsoft').withPrice(499).build();
            const product2 = new ProductBuilder().withTitle('Nintendo Switch').withDescription('Console Nintendo').withPrice(299).build();

            await repository.save(product1);
            await repository.save(product2);

            // Quand on récupère tous les produits
            const result = await repository.findAll();

            // Alors le résultat doit être Right avec un tableau de 2 produits
            expect(result.isRight()).toBe(true);
            result.ifRight(products => {
                expect(products).toHaveLength(2);
                expect(products[0].title).toBe('Xbox Series X');
                expect(products[1].title).toBe('Nintendo Switch');
            });
        });

        test('doit retourner Right avec un tableau vide quand aucun produit n\'existe', async () => {
            // Étant donné qu'aucun produit n'existe
            // (beforeEach a déjà nettoyé la base)

            // Quand on récupère tous les produits
            const result = await repository.findAll();

            // Alors le résultat doit être Right avec un tableau vide
            expect(result.isRight()).toBe(true);
            result.ifRight(products => {
                expect(products).toHaveLength(0);
            });
        });
    });

    describe('update()', () => {
        test('doit mettre à jour un produit existant et retourner Right avec Maybe.of(product)', async () => {
            // Étant donné un produit sauvegardé
            const product = new ProductBuilder()
                .withTitle('Steam Deck')
                .withDescription('Console portable PC')
                .withPrice(399)
                .build();
            const saveResult = await repository.save(product);
            let savedId: number = 0;
            saveResult.ifRight(p => { savedId = p.id; });

            // Quand on met à jour le produit
            const result = await repository.update(savedId, {
                title: 'Steam Deck OLED',
                price: 449
            });

            // Alors le résultat doit être Right avec Maybe contenant le produit mis à jour
            expect(result.isRight()).toBe(true);
            result.ifRight(maybeProduct => {
                expect(maybeProduct.isJust()).toBe(true);
                maybeProduct.ifJust(updatedProduct => {
                    expect(updatedProduct.id).toBe(savedId);
                    expect(updatedProduct.title).toBe('Steam Deck OLED');
                    expect(updatedProduct.price).toBe(449);
                    expect(updatedProduct.description).toBe('Console portable PC'); // Inchangé
                });
            });
        });

        test('doit retourner Right avec Maybe.empty() quand le produit n\'existe pas', async () => {
            // Étant donné un ID qui n'existe pas
            const nonExistentId = 99999;

            // Quand on tente de mettre à jour ce produit
            const result = await repository.update(nonExistentId, {
                title: 'Nouveau titre'
            });

            // Alors le résultat doit être Right avec Maybe vide
            expect(result.isRight()).toBe(true);
            result.ifRight(maybeProduct => {
                expect(maybeProduct.isNothing()).toBe(true);
            });
        });
    });

    describe('delete()', () => {
        test('doit supprimer un produit existant et retourner Right(true)', async () => {
            // Étant donné un produit sauvegardé
            const product = new ProductBuilder()
                .withTitle('Game Boy')
                .withDescription('Console rétro')
                .withPrice(89)
                .build();
            const saveResult = await repository.save(product);
            let savedId: number = 0;
            saveResult.ifRight(p => { savedId = p.id; });

            // Quand on supprime le produit
            const result = await repository.delete(savedId);

            // Alors le résultat doit être Right(true)
            expect(result.isRight()).toBe(true);
            result.ifRight(deleted => {
                expect(deleted).toBe(true);
            });

            // Et le produit ne doit plus exister
            const findResult = await repository.findById(savedId);
            findResult.ifRight(maybeProduct => {
                expect(maybeProduct.isNothing()).toBe(true);
            });
        });

        test('doit retourner Right(false) quand le produit n\'existe pas', async () => {
            // Étant donné un ID qui n'existe pas
            const nonExistentId = 99999;

            // Quand on tente de supprimer ce produit
            const result = await repository.delete(nonExistentId);

            // Alors le résultat doit être Right(false)
            expect(result.isRight()).toBe(true);
            result.ifRight(deleted => {
                expect(deleted).toBe(false);
            });
        });
    });
});
