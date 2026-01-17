import Order from "../models/order.js";
import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {

	//User must be logged in to place an order
	if (req.user == null) {
		res.status(401).json({
			message: "Unauthorized",
		});
		return;
	}
	try {
		const latestOrder = await Order.findOne().sort({ date: -1 }); //getting the last order (latest order) by sorting in descending order of date(wadi eke idela adu wena piliwala), this is doiing to get order id , so we can put next order id to new order

		let orderId = "ORD000001"; //default orderId

		if (latestOrder != null) { //if the order id is not null, generate new order id 
			let latestOrderId = latestOrder.orderId; // "ORD000012"
			let latestOrderNumberString = latestOrderId.replace("ORD", ""); // "000012" , removing the "ORD" part
			let latestOrderNumber = parseInt(latestOrderNumberString); // 12 , converting to integer so the front 0 are removed

			let newOrderNumber = latestOrderNumber + 1; // 13, get the new order number by adding 1
			let newOrderNumberString = newOrderNumber.toString().padStart(6, "0"); // "000013", odernum eka string ekak kerela num 6 convert kerela isseraha histhan walata 0 add kerenewa

			orderId = "ORD" + newOrderNumberString; // "ORD000013"
		}

        //order validate part

		const items = [];
		let total = 0;

		for (let i = 0; i < req.body.items.length; i++) {
			const product = await Product.findOne({
				productID: req.body.items[i].productID, //database eke productID ekata samana id ekak request body eke thiyanawada kiyla balanawa
			});

			if (product == null) {
				return res.status(400).json({
					message: `Product with ID ${req.body.items[i].productID} not found`,
				});
			}

			//check if stock is available
			// if(product.stock < req.body.items[i].quantity){
			//     return res.status(400).json({
			//         message : `Only ${product.stock} items available for product ID ${req.body.items[i].productID}`
			//     })
			// }

            //item array eka athulata product detaills tika add kerenawa
			items.push({ 
				productID: product.productID,
				name: product.name,
				price: product.price,
				quantity: req.body.items[i].quantity,
				image: product.images[0],
			});

			total += product.price * req.body.items[i].quantity;
		}

		let name = req.body.name; //request body eke name ekak thiyanawada balanawa nattan login userge first name saha last name eka gannawa
		if (name == null) {
			name = req.user.firstName + " " + req.user.lastName;
		}

		const newOrder = new Order({
			orderId: orderId,
			email: req.user.email,
			name: name,
			address: req.body.address,
			total: total,
			items: items,
			phone: req.body.phone,
		});

		await newOrder.save();

		// for (let i = 0; i < items.length; i++){
		//     await Product.updateOne(
		//         { productID : items[i].productID },
		//         { $inc : { stock : -items[i].quantity } }
		//     )
		// }

		return res.json({
			message: "Order placed successfully",
			orderId: orderId,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error Placing order",
			error: error.message,
		});
	}
}

export async function getOrders(req, res) {
	if (req.user == null) {
		res.status(401).json({
			message: "Unauthorized",
		});
		return;
	}

	if (isAdmin(req)) {
		const orders = await Order.find().sort({ date: -1 }); //latest placed order eka palaweniyata enna hadagannawa date: -1 eken

		res.json(orders);
	} else {
		const orders = await Order.find({ email: req.user.email }).sort({ //normal user kenek unoth eka login wela thiyena userge email eka athule thiyana order tika gannawa
			date: -1,
		});

		res.json(orders);
	}
}

export async function updateOrderStatus(req, res) {
	if (!isAdmin(req)) {
		res.status(401).json({
			message: "Unauthorized",
		});
		return;
	}
	try {
		const orderId = req.params.orderId;
		const status = req.body.status;
		const notes = req.body.notes;

		await Order.updateOne(
			{ orderId: orderId },
			{ status: status, notes: notes }
		);

		res.json({
			message: "Order status updated successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Error updating order status",
			error: error.message,
		});
	}
}

//email: req.user.email, (methenedi penewa userge email eka gannawa . eka ganne param request ekakin neme , ee ganne token eka athule thiyana user info welin,
							//oyata me widihata user ge name last name wage dewal ganna puluwan, methenedi oya front-end eken barrer tocken eka hedder ekata dila beck-end req eka ewanna one.)


