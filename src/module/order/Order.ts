import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Product } from '../product/Product';
import { Either, Left, Right } from 'purify-ts/Either';

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Product)
    @JoinColumn()
    public product: Product;

    @Column({ type: "int" })
    public quantity: number;

    @Column({ type: "float" })
    public totalPrice: number;

    constructor({ product, quantity, totalPrice }: { product: Product, quantity: number, totalPrice: number }) {
        this.product = product;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
    }

    static create({ product, quantity }: { product: Product, quantity: number }): Either<Error, Order> {
        const total = product.price * quantity;

        if (total >= 200) {
            return Left(new Error("le prix par commande doit être inférieur à 200€"));
        }

        return Right(new Order({ product, quantity, totalPrice: total }));
    }
}