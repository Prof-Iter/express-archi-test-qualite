import {describe, expect, test} from "@jest/globals";
import { Either, Left, Right } from 'purify-ts/Either';
import { Maybe } from 'purify-ts/Maybe';
import {CreateProductUseCase} from "../createProductUseCase";
import { ProductRepository } from "../../ProductRepository";
import {Product} from "../../Product";


class CreateProductDummyRepository implements ProductRepository {

    async save(product: Product): Promise<Either<Error, Product>> {
        // Simule une sauvegarde réussie
        return Right(product);
    }

    async findById(id: number): Promise<Either<Error, Maybe<Product>>> {
        return Right(Maybe.empty());
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

class CreateProductMockFailRepository implements ProductRepository {

    async save(product: Product): Promise<Either<Error, Product>> {
        // Simule une erreur de sauvegarde
        return Left(new Error("fail gtredeapkdzepnip"));
    }

    async findById(id: number): Promise<Either<Error, Maybe<Product>>> {
        return Right(Maybe.empty());
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

describe("US-1 : Créer un produit",  () => {

    test("Scénario 1 : création réussie", async () => {

        // Étant donné qu'il n'y a pas de produit enregistré
        const createProductRepository = new CreateProductDummyRepository();
        const createProductUseCase = new CreateProductUseCase(createProductRepository);

        // Quand je créé un produit avec en titre «switch 2», description «nouvelle console» et un prix à 500
        const result = await createProductUseCase.execute({title: "switch 2", description: "nouvelle console", price: 500});

        // Alors le produit doit être créé (Right)
        expect(result.isRight()).toBe(true);
        result.ifRight(product => {
            expect(product.title).toBe("switch 2");
            expect(product.description).toBe("nouvelle console");
            expect(product.price).toBe(500);
        });
    });

    test('Scénario 2 : echec, titre trop court', async () => {

        //Étant donné qu'il n'y a pas de produit enregistré
        const createProductRepository = new CreateProductDummyRepository();
        const createProductUseCase = new CreateProductUseCase(createProductRepository);

        // Quand je créé un produit avec en titre «sw»
        const result = await createProductUseCase.execute({title: "sw", description: "nouvelle console", price: 500});

        // Alors une erreur doit être retournée "titre trop court"
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("titre trop court");
        });
    });


    test('Scénario 3 : echec, prix négatif', async () => {

        //Étant donné qu'il n'y a pas de produit enregistré
        const createProductRepository = new CreateProductDummyRepository();
        const createProductUseCase = new CreateProductUseCase(createProductRepository);

        // Quand je créé un produit avec en prix -10
        const result = await createProductUseCase.execute({title: "switch 2", description: "nouvelle console", price: -10});

        // Alors une erreur doit être retournée "le prix doit être supérieur à 0"
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("le prix doit être supérieur à 0");
        });
    });

    test('Scénario 4 : création échouée, prix supérieur à 10000', async () => {
        //Étant donné qu'il n'y a pas de produit enregistré
        const createProductRepository = new CreateProductDummyRepository();
        const createProductUseCase = new CreateProductUseCase(createProductRepository);

        // Quand je créé un produit avec en prix 11000
        const result = await createProductUseCase.execute({title: "switch 2", description: "nouvelle console", price: 11000});

        // Alors une erreur doit être retournée "le prix doit être inférieur à 10000"
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("le prix doit être inférieur à 10000");
        });
    });

    //    - Exemple 5/ Scénario 5 : création échouée, échec de sauvegarde non prévue
    //       - Étant donné qu'il n'y a pas de produit enregistré
    //       - Quand je créé un produit, si la sauvegarde échoue
    //       - Alors une erreur doit être envoyée «erreur lors de la création du produit»

    test('Scénario 5 : création échouée, échec de sauvegarde non prévue', async () => {
        //Étant donné qu'il n'y a pas de produit enregistré
        const createProductRepository = new CreateProductMockFailRepository();
        const createProductUseCase = new CreateProductUseCase(createProductRepository);

        // Quand je créé un produit
        const result = await createProductUseCase.execute({title: "switch 2", description: "nouvelle console", price: 500});

        // Alors une erreur doit être retournée «erreur lors de la création du produit»
        expect(result.isLeft()).toBe(true);
        result.ifLeft(error => {
            expect(error.message).toBe("erreur lors de la création du produit");
        });
    });

});