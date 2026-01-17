import express from "express";
import { createCart, getCart, updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.get("/", getCart);
cartRouter.post("/", createCart);
cartRouter.put("/", updateCart);

export default cartRouter;