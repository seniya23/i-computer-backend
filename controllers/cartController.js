import Cart from "../models/Cart.js";
import Product from "../models/Product.js";


export async function getCart(req, res) {
	if (req.user == null) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}

	try {
		const targetEmail = req.user.email; 
		const cart = await Cart.findOne({ email: targetEmail });

		if (cart == null) {
			return res.status(404).json({ message: "Cart not found" });
		}

		res.json(cart);
	} catch (error) {
		res.status(500).json({ message: "Error fetching cart", error: error.message });
	}
}

export async function createCart(req, res) {
	if (req.user == null) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}

	try {
    
		let itemsIn = [];

    if (Array.isArray(req.body.items)) { // check if items is an array
      itemsIn = req.body.items;
    } else if (req.body.items) {
      itemsIn = [req.body.items]; // wrap single item in an array if it is not an array
    }

		if (itemsIn.length === 0) {
			return res.status(400).json({ message: "No items provided" });
		}

		// validate and build items
		const items = [];
		for (let i = 0; i < itemsIn.length; i++) {
			const it = itemsIn[i];
			if (!it || !it.productID || typeof it.quantity !== "number") {  //check "it" is not null, it.productID exist, it.quantity is number, if either one is true print error.
				return res.status(400).json({ message: "Invalid item format" });
			}

			const product = await Product.findOne({ productID: it.productID });
			if (product == null) {
				return res.status(400).json({ message: `Product with ID ${it.productID} not found` });
			}

			items.push({
				productID: product.productID,
				name: product.name,
				price: product.price,
				labelledPrice: product.labelledPrice ?? product.price,
				quantity: it.quantity,
				image: (product.images && product.images.length) ? product.images[0] : "",
			});
		}

		// prevent duplicate cart for same email
		const existing = await Cart.findOne({ email: req.user.email });
		if (existing != null) {
			return res.status(400).json({ message: "Cart already exists for user" });
		}

		const newCart = new Cart({ email: req.user.email, items });
		await newCart.save();

		res.status(201).json({ message: "Cart created successfully", cart: newCart });
	} catch (error) {
		res.status(500).json({ message: "Error creating cart", error: error.message });
	}
}

export async function updateCart(req, res) {
	if (req.user == null) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}

	try {
		const productID = req.body.productID;
		const quantityDelta = req.body.quantity; // positive to add, negative to remove

		if (!productID || typeof quantityDelta !== "number") {
			return res.status(400).json({ message: "productID and numeric quantity are required" });
		}

		const cart = await Cart.findOne({ email: req.user.email });
		if (cart == null) {
			return res.status(404).json({ message: "Cart not found" });
		}

		const index = cart.items.findIndex((it) => it.productID === productID);

		if (index === -1) {
			// product not present in cart; only allow adding when quantityDelta > 0
			if (quantityDelta <= 0) {
				return res.status(400).json({ message: "Product not in cart" });
			}

			const product = await Product.findOne({ productID });
			if (product == null) {
				return res.status(400).json({ message: "Product not found" });
			}

			cart.items.push({
				productID: product.productID,
				name: product.name,
				price: product.price,
				labelledPrice: product.labelledPrice ?? product.price,
				quantity: quantityDelta,
				image: (product.images && product.images.length) ? product.images[0] : "",
			});
		} else {
			const newQty = cart.items[index].quantity + quantityDelta;
			if (newQty <= 0) {
				cart.items.splice(index, 1);
			} else {
				cart.items[index].quantity = newQty;
			}
		}

		await cart.save();
		res.json({ message: "Cart updated successfully", cart });
	} catch (error) {
		res.status(500).json({ message: "Error updating cart", error: error.message });
	}
}

// ternary operator:
// condition ? valueIfTrue : valueIfFalse
