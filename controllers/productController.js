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

    export function getAllProducts(req, res) {
	if (isAdmin(req)) {
		Product.find()
			.then((products) => {
				res.json(products);
			})
			.catch((error) => {
				res.status(500).json({
					message: "Error fetching products",
					error: error.message,
				});
			});
	} else {
		Product.find({ isAvailable: true })  //giving only available products for normal users
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


    
