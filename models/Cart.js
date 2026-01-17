import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        email : {
            type : String,
            required : true
        },
        items : [            
            {
                productID: {
                    type: String,
                    required: true 
                },
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                labelledPrice: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                image: {
                    type: String,
                    required: true
                }
            }
        ]
    }
);



const Cart = mongoose.model("Cart", cartSchema);
export default Cart;