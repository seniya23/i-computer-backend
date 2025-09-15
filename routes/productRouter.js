import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductByID, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts)

productRouter.post("/", createProduct)

productRouter.get("/:productID", getProductByID)

productRouter.delete("/:productID", deleteProduct)   //always remember to put id routers place in below like this otherwise it will conflict with other routers

productRouter.put("/:productID", updateProduct)

export default productRouter