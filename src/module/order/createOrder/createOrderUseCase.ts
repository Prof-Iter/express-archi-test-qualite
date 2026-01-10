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

        return productResult.caseOf({
            Left: (error) => Left(error),
            Right: (maybeProduct) => {
                return maybeProduct.caseOf({
                    Nothing: () => Left(new Error("produit non trouvé")),
                    Just: async (product) => {
                        try {
                            const order = new Order({product, quantity});
                            const saveResult = await this.orderRepository.save(order);
                            return saveResult;
                        } catch (error) {
                            if (error instanceof Error) {
                                return Left(error);
                            }
                            return Left(new Error("erreur lors de la création de la commande"));
                        }
                    }
                });
            }
        });
    }

}