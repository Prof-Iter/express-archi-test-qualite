import { ProductTypeOrmRepository } from "../../product/ProductTypeOrmRepository";
import { OrderTypeOrmRepository } from "../OrderTypeOrmRepository";

const express = require("express");
const router = express.Router();
import {Request, Response} from "express";
import CreateOrderUseCase from "./createOrderUseCase";
import { translate } from "../../../shared/i18n/translator";

router.post('/order', async (request: Request, response: Response) => {

    const {productId, quantity} = request.body;

    const productRepository = new ProductTypeOrmRepository();
    const orderRepository = new OrderTypeOrmRepository();
    const createOrderUseCase = new CreateOrderUseCase(productRepository, orderRepository);

    const result = await createOrderUseCase.execute({productId, quantity});

    return result.caseOf({
        Left: (error: Error) => {
            // Return 400 for all errors (domain validation, product not found, or repository errors)
            return response.status(400).json({message: translate(error.message)});
        },
        Right: (_) => {
            return response.status(201).json();
        }
    });
});




module.exports = router;
