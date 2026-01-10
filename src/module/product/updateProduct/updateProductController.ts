import { ProductTypeOrmRepository } from "../ProductTypeOrmRepository";

const express = require("express");
const router = express.Router();
import {Request, Response} from "express";
import { UpdateProductUseCase } from "./updateProductUseCase";

router.put('/product/:id', async (request: Request, response: Response) => {

    const {id} = request.params;
    const {title, description, price} = request.body;

    const productRepository = new ProductTypeOrmRepository();
    const updateProductUseCase = new UpdateProductUseCase(productRepository);

    const result = await updateProductUseCase.execute({id: Number(id), title, description, price});

    return result.caseOf({
        Left: (error: Error) => {
            // Return 400 for all errors (domain validation, not found, or repository errors)
            return response.status(400).json({message: error.message});
        },
        Right: (product) => {
            return response.status(200).json(product);
        }
    });
});




module.exports = router;