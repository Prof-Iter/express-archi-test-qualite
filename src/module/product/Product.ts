import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Either, Left, Right } from 'purify-ts/Either';

@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: true, type: "float" })
    public price: number;

    @Column({ type: "varchar", length: 255 })
    public title: string;

    @Column({ type: "text", nullable: true })
    public description: string;

    constructor({ title, description, price }: { title: string, description: string, price: number }) {
        this.title = title;
        this.description = description;
        this.price = price;
    }

    static create({ title, description, price }: { title: string, description: string, price: number }): Either<Error, Product> {
        const titleError = Product.validateTitle(title);
        if (titleError) return Left(titleError);

        const priceError = Product.validatePrice(price);
        if (priceError) return Left(priceError);

        return Right(new Product({ title, description, price }));
    }

    update({ title, description, price }: { title: string, description: string, price: number }): Either<Error, Product> {
        const titleError = Product.validateTitle(title);
        if (titleError) return Left(titleError);

        const priceError = Product.validatePrice(price);
        if (priceError) return Left(priceError);

        this.title = title;
        this.description = description;
        this.price = price;
        return Right(this);
    }

    private static validateTitle(title: string): Error | null {
        if (title.length < 3) {
            return new Error("titre trop court");
        }
        return null;
    }

    private static validatePrice(price: number): Error | null {
        if (price <= 0) {
            return new Error("le prix doit être supérieur à 0");
        }

        if (price > 10000) {
            return new Error("le prix doit être inférieur à 10000");
        }
        return null;
    }
}

export class ProductBuilder {
    private props: { title: string, description: string, price: number } = {
        title: "Default Title",
        description: "Default Description",
        price: 100
    };
    private id?: number;

    withTitle(title: string): ProductBuilder {
        this.props.title = title;
        return this;
    }

    withDescription(description: string): ProductBuilder {
        this.props.description = description;
        return this;
    }

    withPrice(price: number): ProductBuilder {
        this.props.price = price;
        return this;
    }

    withId(id: number): ProductBuilder {
        this.id = id;
        return this;
    }

    build(): Product {
        const product = new Product(this.props);
        if (this.id !== undefined) {
            product.id = this.id;
        }
        return product;
    }
}