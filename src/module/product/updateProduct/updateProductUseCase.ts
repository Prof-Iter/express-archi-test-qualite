import { Either } from 'purify-ts/Either';
import { ProductRepository } from "../ProductRepository";
import { Product } from "../Product";
import { ERROR_KEYS } from "../../../shared/i18n/errorKeys";

export class UpdateProductUseCase {

    constructor(private readonly productRepository: ProductRepository) {}

    async execute({id, title, description, price}: {id: number, title: string, description: string, price: number}): Promise<Either<Error, Product>> {

        // Find existing product
        const findResult = await this.productRepository.findById(id);

        return findResult
            .mapLeft(() => new Error(ERROR_KEYS.PRODUCT_FETCH_ERROR))
            .chain(maybeProduct => maybeProduct.toEither(new Error(ERROR_KEYS.PRODUCT_NOT_FOUND)))
            .chain(product => product.update({ title, description, price }))
            .chain(async updatedProduct => {
                const saveResult = await this.productRepository.save(updatedProduct);
                return saveResult.mapLeft(() => new Error(ERROR_KEYS.PRODUCT_UPDATE_ERROR));
            });
    }

}
