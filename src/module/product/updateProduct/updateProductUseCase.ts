import { Either, Left } from 'purify-ts/Either';
import { ProductRepository } from "../ProductRepository";
import { Product } from "../Product";

export class UpdateProductUseCase {

    constructor(private readonly productRepository: ProductRepository) {}

    async execute({id, title, description, price}: {id: number, title: string, description: string, price: number}): Promise<Either<Error, Product>> {

        // Find existing product
        const findResult = await this.productRepository.findById(id);

        // Handle repository errors
        if (findResult.isLeft()) {
            return Left(new Error("erreur lors de la recherche du produit"));
        }

        // Get Maybe<Product> from Right side
        return findResult.caseOf({
            Left: (error) => Left(error),
            Right: (maybeProduct) => {
                // Check if product exists
                if (maybeProduct.isNothing()) {
                    return Left(new Error("produit non trouvé"));
                }

                // Validate and update product (domain validation happens in Product entity)
                try {
                    const product = maybeProduct.extract();

                    // Trigger domain validation by creating a new instance
                    const validatedProduct = new Product({ title, description, price });
                    validatedProduct.id = product.id;

                    // Save updated product - this returns a Promise, so we need to handle it differently
                    return this.productRepository.save(validatedProduct)
                        .then(saveResult => saveResult.mapLeft(() => new Error("erreur lors de la mise à jour du produit")));
                } catch (error) {
                    // Domain validation errors from Product constructor
                    if (error instanceof Error) {
                        return Promise.resolve(Left(error));
                    }
                    return Promise.resolve(Left(new Error("erreur lors de la mise à jour du produit")));
                }
            }
        });
    }

}
