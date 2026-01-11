import { Either } from 'purify-ts/Either';
import { ProductRepository } from "../ProductRepository";
import { Product } from "../Product";

export class CreateProductUseCase {

    private productRepository: ProductRepository;

    constructor(productRepository: ProductRepository) {
        this.productRepository = productRepository;
    }

    async execute({title, description, price}: {title: string, description: string, price: number}): Promise<Either<Error, Product>> {

        const productResult = Product.create({title, description, price});

        if (productResult.isLeft()) return productResult;

        const product = productResult.extract() as Product;
        const saveResult = await this.productRepository.save(product);

        return saveResult;
    }
}