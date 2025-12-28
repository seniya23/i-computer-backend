import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req, res) {
	if (!isAdmin(req)) {
		res.status(403).json({
			message: "Forbidden",
		});
		return;
	}

	const product = new Product(req.body);

	product.save().then(() => {
			res.json({
				message: "Product created successfully",
			});
		})
		.catch((error) => {
			res.status(500).json({
				message: "Error creating product",
				error: error.message,
			});
		});
}


export async function getAllProducts(req, res) {
	
    try {
		if (isAdmin(req)) {
			// Product.find()
			// 	.then((products) => {
			// 		res.json(products);
			// 	})
			// 	.catch((error) => {
			// 		res.status(500).json({
			// 			message: "Error fetching products",
			// 			error: error.message,
			// 		});
			// 	});

			// Using async-await

			const products = await Product.find();

			res.json(products);
		} else {
			Product.find({ isAvailable: true }) //giving only available products for normal users
				.then((products) => {
					res.json(products);
				})
				.catch((error) => {
					res.status(500).json({
						message: "Error fetching products",
						error: error.message,
					});
				});
		}
	} catch (error) {
		res.status(500).json({
			message: "Error fetching products",
			error: error,
		});
	}
}



export function deleteProduct(req,res){

    if(!isAdmin(req)){
        res.status(403).json({
            massage : "Only admin can delete products"
        })
        return
    }

    const productID = req.params.productID      //productID comming from http request not as a json body request (localhost:5000/products/PC1001), 
                                                // this method can use only for small request ex: pass productID

    Product.deleteOne({productID : productID}).then(()=>{
        res.json({
            massage : "Product deleted Successfully"
        })
    })
}


export function updateProduct(req,res){

    if(!isAdmin(req)){
        res.status(403).json({
            massage : "Only admin can update products"
        })
        return
    }

    const productID = req.params.productID

    Product.updateOne({productID : productID},req.body).then(()=>{
        res.json({
            massage : "Product update successfully"
        })
    })
}

export function getProductByID(req,res){

    const productID = req.params.productID

    Product.findOne({productID : productID}).then((product)=>{
        
            if(product == null){
                res.status(404).json({
                    massage : "Product not found"
                })

            }else{
                res.json(product)
            }

        
    }).catch((error)=>{
        res.status(500).json({
            massage : "Error fetching product",
            error : error.massage
        })
    })
}


export async function searchProducts(req,res){
	const query = req.params.query

	try {

		const products = await Product.find(
			{
				$or : [  																		//$or eka pawichchi keranne yata thiyana names or altnames walin ekak match wenna ona nisa, or nathi unoth $and use wenne , ehema unoth search keraddi yata two conditions dekama match wenna one
					{ name : { $regex : query , $options : "i" } }, 							//$regex is used to search partial text match, $options : "i" is used to ignore case sensitivity, me part eka names galapenna
					{ altNames : { $elemMatch : { $regex : query , $options : "i" } } } 		//altNames eke athule elements match wenna ona nisa $elemMatch use karanne, me part eka altNames galapenna
					
				],
				isAvailable : true
			}
		)

		return res.json(products)
	}catch(error){
		res.status(500).json({
			message : "Error searching products",
			error : error.message
		})
	}

}


    
