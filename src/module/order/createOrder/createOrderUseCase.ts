import { Either } from 'purify-ts/Either';
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

        // @ts-ignore
        return productResult.chain(maybeProduct =>
            maybeProduct.toEither(new Error("produit non trouvé"))
        ).chain(product => 
            Order.create({product, quantity})
        ).chain(async order => {
            const saveResult = await this.orderRepository.save(order);
            return saveResult;
        });
    }

}