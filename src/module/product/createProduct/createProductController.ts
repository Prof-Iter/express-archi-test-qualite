import { ProductTypeOrmRepository } from "../ProductTypeOrmRepository";

const express = require("express");
const router = express.Router();
import {Request, Response} from "express";
import {CreateProductUseCase} from "./createProductUseCase";

router.post('/product', async (request: Request, response: Response) => {

    const {title, description, price} = request.body;

    const productRepository = new ProductTypeOrmRepository();
    const createProductUseCase = new CreateProductUseCase(productRepository);

    const result = await createProductUseCase.execute({title, description, price});

    return result.caseOf({
        Left: (error: Error) => {
            // Return 400 for all errors (domain validation or repository errors)
            return response.status(400).json({message: error.message});
        },
        Right: (_product) => {
            return response.status(201).json();
        }
    });
});




module.exports = router;