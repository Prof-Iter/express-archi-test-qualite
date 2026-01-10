import {describe, expect, test} from "@jest/globals";
import { Either, Left, Right } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import { UpdateProductUseCase } from "../updateProductUseCase";
import { ProductRepository } from "../../ProductRepository";
import {Product} from "../../Product";


class UpdateProductDummyRepository implements ProductRepository {

    products: Map<number, Product> = new Map();

    constructor() {
        // Pre-populate with test product
        const product = new Product({ title: "Test Product", description: "Test Description", price: 100 });
        product.id = 1;
        this.products.set(1, product);
    }

    async save(product: Product): Promise<Either<Error, Product>> {
        this.products.set(product.id, product);
        return Right(product);
    }

    async findById(id: number): Promise<Either<Error, Maybe<Product>>> {
        const product = this.products.get(id);
        return Right(Maybe.fromNullable(product));
    }

    async findAll(): Promise<Either<Error, Product[]>> {
        return Right(Array.from(this.products.values()));
    }

    async update(id: number, data: Partial<Omit<Product, 'id'>>): Promise<Either<Error, Maybe<Product>>> {
        return Right(Maybe.empty());
    }

    async delete(id: number): Promise<Either<Error, boolean>> {
        return Right(false);
    }
}

class UpdateProductFailRepository implements ProductRepository {

    async save(product: Product): Promise<Either<Error, Product>> {
        return Left(new Error("save failed"));
    }

    async findById(id: number): Promise<Either<Error, Maybe<Product>>> {
        const product = new Product({ title: "Test Product", description: "Test Description", price: 100 });
        product.id = id;
        return Right(Maybe.of(product));
    }

    async findAll(): Promise<Either<Error, Product[]>> {
        return Right([]);
    }

    async update(id: number, data: Partial<Omit<Product, 'id'>>): Promise<Either<Error, Maybe<Product>>> {
        return Right(Maybe.empty());
    }

    async delete(id: number): Promise<Either<Error, boolean>> {
        return Right(false);
    }
}

describe("UpdateProductUseCase",  () => {

    test("Scénario 1 : mise à jour réussie", async () => {

        // Étant donné un produit existant avec id=1
        const repository = new UpdateProductDummyRepository();
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
        const repository = new UpdateProductDummyRepository();
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
        const repository = new UpdateProductDummyRepository();
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
        const repository = new UpdateProductDummyRepository();
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
        const repository = new UpdateProductFailRepository();
        const updateProductUseCase = new UpdateProductUseCase(repository);

        // Quand je tente de mettre à jour le produit
        const result = await updateProductUseCase.execute({id: 1, title: "Title", description: "Description", price: 100});

        // Alors une erreur doit être retournée
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("erreur lors de la mise à jour du produit");
        });
    });

});
