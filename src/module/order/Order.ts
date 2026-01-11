import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Product } from '../product/Product';
import { Either, Left, Right } from 'purify-ts/Either';
import { ERROR_KEYS } from "../../shared/i18n/errorKeys";

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
            return Left(new Error(ERROR_KEYS.ORDER_PRICE_TOO_HIGH));
        }

        return Right(new Order({ product, quantity, totalPrice: total }));
    }
}

export class OrderBuilder {
    private props: { product: Product | null, quantity: number, totalPrice: number } = {
        product: null,
        quantity: 1,
        totalPrice: 0
    };
    private id?: number;

    withProduct(product: Product): OrderBuilder {
        this.props.product = product;
        if (product) {
            this.props.totalPrice = product.price * this.props.quantity;
        }
        return this;
    }

    withQuantity(quantity: number): OrderBuilder {
        this.props.quantity = quantity;
        if (this.props.product) {
            this.props.totalPrice = this.props.product.price * quantity;
        }
        return this;
    }

    withTotalPrice(totalPrice: number): OrderBuilder {
        this.props.totalPrice = totalPrice;
        return this;
    }

    withId(id: number): OrderBuilder {
        this.id = id;
        return this;
    }

    build(): Order {
        if (!this.props.product) {
            throw new Error("Product must be set before building Order");
        }
        const order = new Order(this.props as { product: Product, quantity: number, totalPrice: number });
        if (this.id !== undefined) {
            order.id = this.id;
        }
        return order;
    }
}