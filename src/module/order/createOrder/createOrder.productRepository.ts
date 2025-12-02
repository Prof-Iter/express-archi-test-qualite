import { Product } from '../../product/Product';

export interface CreateOrderProductRepository {

    getById(id: number): Promise<Product> | null;

}