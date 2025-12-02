import { Product } from '../product/Product';

export class Order {

    public totalPrice: number;

    constructor({product, quantity}: {product: Product, quantity: number}) {
        const total = product.price * quantity;

        if (total >= 200) {
            throw new Error("le prix par commande doit être inférieur à 200€");
        }

        this.totalPrice = total;
    }




}