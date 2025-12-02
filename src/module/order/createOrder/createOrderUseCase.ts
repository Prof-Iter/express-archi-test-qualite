import { CreateOrderProductRepository } from './createOrder.productRepository';
import { Order } from '../Order';
import CreateOrderOrderRepository from './createOrderOrderRepository';

export default class CreateOrderUseCase {

    constructor(
        private readonly createOrderProductRepository: CreateOrderProductRepository,
        private readonly createOrderOrderRepository: CreateOrderOrderRepository
    ) {}

    async execute({id, quantity}: {id: number; quantity: number}){
        const product = await this.createOrderProductRepository.getById(id);

        const order = new Order();

        order.totalPrice = product.price * quantity;

        await this.createOrderOrderRepository.save(order);
    }

}