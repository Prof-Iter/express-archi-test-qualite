import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Product } from '../product/Product';

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Product)
    @JoinColumn()
    public product: Product;

    @Column({type: "int"})
    public quantity: number;

    @Column({type: "float"})
    public totalPrice: number;

    constructor({product, quantity}: {product: Product, quantity: number}) {
        this.product = product;
        this.quantity = quantity;

        const total = product.price * quantity;

        if (total >= 200) {
            throw new Error("le prix par commande doit être inférieur à 200€");
        }

        this.totalPrice = total;
    }
}