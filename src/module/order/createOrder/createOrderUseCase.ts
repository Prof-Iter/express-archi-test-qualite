import { Either, Left } from 'purify-ts/Either';
import { Order } from '../Order';
import { OrderRepository } from '../OrderRepository';
import { ProductRepository } from '../../product/ProductRepository';

export default class CreateOrderUseCase {

    constructor(
        private readonly productRepository: ProductRepository,
        private readonly orderRepository: OrderRepository
    ) {}

    async execute({id, quantity}: {id: number; quantity: number}): Promise<Either<Error, Order>> {
        const productResult = await this.productRepository.findById(id);

        return productResult.chain(maybeProduct => 
            maybeProduct.toEither(new Error("produit non trouvé"))
        ).chain(product => 
            Order.create({product, quantity})
        ).chain(order => 
            this.orderRepository.save(order)
        );
    }

}