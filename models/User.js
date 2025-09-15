import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email : {
            type : String,
            required : true,
            unique : true
        },

        firstName : {
            type : String,
            required : true
        },

        lastName : {
            type : String,
            required : true
        },

        password : {
            type : String,
            required : true
        },

        role : {
            type : String,
            default : "customer"
        },

        isBlocked : {
            type : Boolean,
            default : false
        },

        isEmailVerified : {
            type : Boolean,
            default : false
        },

        image : {
            type : String,
            required : true,
            default : "default.jpg"
        }


    }
)

const User = mongoose.model("User", userSchema) //Collection name, Document structure and connection between DB

export default User;

//required : true means user email is must when signup
//unique : true means email should unique i user to i email
//default : "customer" means when the account creating user not select the role it defult select to customer and create a account as a customer
//isBlocked used to block customers it  has two boolean values true or false, so the defualt value is false  
//isEmailVerified use to send otp code and verified
//const User = mongoose.model("User", userSchema) in this code line "User" is the table(Collection) name in mongoDB it called as "Users" in mongoDB, there are not having any relation collection like mysql  
