import { Either, Left } from 'purify-ts/Either';
import { ProductRepository } from "../ProductRepository";
import { Product } from "../Product";

export class UpdateProductUseCase {

    constructor(private readonly productRepository: ProductRepository) {}

    async execute({id, title, description, price}: {id: number, title: string, description: string, price: number}): Promise<Either<Error, Product>> {

        // Find existing product
        const findResult = await this.productRepository.findById(id);

        return findResult
            .mapLeft(() => new Error("erreur lors de la recherche du produit"))
            .chain(maybeProduct => maybeProduct.toEither(new Error("produit non trouvé")))
            .chain(product => product.update({ title, description, price }))
            .chain(async updatedProduct => {
                const saveResult = await this.productRepository.save(updatedProduct);
                return saveResult.mapLeft(() => new Error("erreur lors de la mise à jour du produit"));
            });
    }

}
