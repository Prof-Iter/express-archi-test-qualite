import { Order } from '../Order';

export default interface CreateOrderOrderRepository  {

    save(order: Order): Promise<void>;

}