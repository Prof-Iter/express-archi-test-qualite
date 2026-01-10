import { Either, Left } from 'purify-ts/Either';
import { ProductRepository } from "../ProductRepository";
import { Product } from "../Product";

export class CreateProductUseCase {

    private productRepository: ProductRepository;

    constructor(productRepository: ProductRepository) {
        this.productRepository = productRepository;
    }

    async execute({title, description, price}: {title: string, description: string, price: number}): Promise<Either<Error, Product>> {

        // Validate and create product (domain validation happens in constructor)
        try {
            const product = new Product({title, description, price});

            // Save product using repository
            const saveResult = await this.productRepository.save(product);

            // Return the result (Either<Error, Product>)
            return saveResult.mapLeft(_error =>
                new Error("erreur lors de la création du produit")
            );
        } catch (error) {
            // Domain validation errors from Product constructor
            if (error instanceof Error) {
                return Left(error);
            }
            return Left(new Error("erreur lors de la création du produit"));
        }
    }
}