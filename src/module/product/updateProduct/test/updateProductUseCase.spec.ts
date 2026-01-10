import {describe, expect, test} from "@jest/globals";
import { UpdateProductUseCase } from "../updateProductUseCase";
import { ProductRepositoryInMemory, ProductRepositoryFail } from "../../test/fakes/ProductRepositoryFakes";
import {ProductBuilder} from "../../Product";

describe("UpdateProductUseCase",  () => {

    test("Scénario 1 : mise à jour réussie", async () => {

        // Étant donné un produit existant avec id=1
        const existingProduct = new ProductBuilder()
            .withTitle("Test Product")
            .withDescription("Test Description")
            .withPrice(100)
            .withId(1)
            .build();

        const repository = new ProductRepositoryInMemory([existingProduct]);
        const updateProductUseCase = new UpdateProductUseCase(repository);

        // Quand je mets à jour le produit
        const result = await updateProductUseCase.execute({id: 1, title: "Updated Title", description: "Updated Description", price: 150});

        // Alors le produit doit être mis à jour (Right)
        expect(result.isRight()).toBe(true);
        result.ifRight(product => {
            expect(product.id).toBe(1);
            expect(product.title).toBe("Updated Title");
            expect(product.description).toBe("Updated Description");
            expect(product.price).toBe(150);
        });
    });

    test('Scénario 2 : échec, produit non trouvé', async () => {

        // Étant donné qu'aucun produit avec id=999 n'existe
        const repository = new ProductRepositoryInMemory();
        const updateProductUseCase = new UpdateProductUseCase(repository);

        // Quand je tente de mettre à jour le produit inexistant
        const result = await updateProductUseCase.execute({id: 999, title: "Title", description: "Description", price: 100});

        // Alors une erreur doit être retournée "produit non trouvé"
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("produit non trouvé");
        });
    });

    test('Scénario 3 : échec, validation du prix (négatif)', async () => {

        // Étant donné un produit existant
        const existingProduct = new ProductBuilder()
            .withTitle("Test Product")
            .withDescription("Test Description")
            .withPrice(100)
            .withId(1)
            .build();

        const repository = new ProductRepositoryInMemory([existingProduct]);
        const updateProductUseCase = new UpdateProductUseCase(repository);

        // Quand je tente de mettre à jour avec un prix négatif
        const result = await updateProductUseCase.execute({id: 1, title: "Title", description: "Description", price: -10});

        // Alors une erreur de validation doit être retournée
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("le prix doit être supérieur à 0");
        });
    });

    test('Scénario 4 : échec, validation du titre (trop court)', async () => {

        // Étant donné un produit existant
        const existingProduct = new ProductBuilder()
            .withTitle("Test Product")
            .withDescription("Test Description")
            .withPrice(100)
            .withId(1)
            .build();

        const repository = new ProductRepositoryInMemory([existingProduct]);
        const updateProductUseCase = new UpdateProductUseCase(repository);

        // Quand je tente de mettre à jour avec un titre trop court
        const result = await updateProductUseCase.execute({id: 1, title: "ab", description: "Description", price: 100});

        // Alors une erreur de validation doit être retournée
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("titre trop court");
        });
    });

    test('Scénario 5 : échec de sauvegarde', async () => {

        // Étant donné un repository qui échoue lors de la sauvegarde
        const repository = new ProductRepositoryFail();
        const updateProductUseCase = new UpdateProductUseCase(repository);

        // Quand je tente de mettre à jour le produit
        const result = await updateProductUseCase.execute({id: 1, title: "Title", description: "Description", price: 100});

        // Alors une erreur doit être retournée
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("erreur lors de la recherche du produit");
        });
    });

});
