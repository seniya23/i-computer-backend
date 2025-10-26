import express from "express"
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken"
import productRouter from "./routes/productRouter.js"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const mongoURI = process.env.MONGO_URL

// const mongoURI = "mongodb+srv://admin:1234@cluster0.5ohbwpd.mongodb.net/seniya?retryWrites=true&w=majority&appName=Cluster0" //after past mongodb connection url add the mongoose library "npm install mongoose@8.10", After install package "import mongoose from "mongoose""", 
                                                                                                                        // and inside this uri cluster name, database name and table names are all included.

mongoose.connect(mongoURI).then(()=> {
    console.log("Connected to MongoDB Cluster")    //the code connection between project and mongodDB cluster, but there have a problem this connection depend on one ip address , 
                                                 // if it change couldn't connect to stop go to "Network Access" in MOngoDB inside the cluster and add ip adress and give "allow acess from anywhere" 
})                                               //for access with collection need to create sperate connection for that create models folder create student sctructure

const app = express()

app.use(cors())

app.use(express.json()) //This is a middleware to print json request without a middlewhere you can't get and print the json value

//For incrypt dcrypt user information from a token first create a middleware app.use((req,res,next),
//Then assign the token to authorizationHeader and print to see the token
//Next check authorizationHeader  != null and assign that token to token variable , when assigning replace "Bearer " part,
//Decrypt token from this jwt.verify(token, "secretKey96#2025" and check invalid token or not , if it's not it assign to req.user pass with next() function 

app.use((req,res,next) =>{  //next() function is used for handover token to next matching thing, It is coming from hedder of the request

    const authorizationHeader = req.header("Authorization")  //Authorization is coming from get request, req.header have more keys ex: host, user-Aget, Connectio, etc that's why we called header("Authorization")

    //console.log(authorizationHeader) //problem is now the token print with "Bearer " like this Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNlbml5YUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJzZW5, So that bearer need to cut and get original tocken for that........
    
    if(authorizationHeader != null){

        const token = authorizationHeader.replace("Bearer ", "") //here replace token with "Bearer " from empty string (, ""), It's look like this eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNlbml5YUBnbWFpbC5jb20iLCJmaXJzdE5
        console.log("token :"+token) //next step is decrypt the incrypt code , import jwt from "jsonwebtoken"

        jwt.verify(token, process.env.JWT_SECRET,            //pass token and secrete Key we prapared in userController.js and function for parameter

            (error, content)=>{     //decrypt informations are inside the content
                    

                if(content == null){
                    
                    console.log("invalid token")

                    res.status(401).json({
                        message: "invalid token"
                    })

                }else {
                    console.log(content)  //you can see all the information inside the token like this firstName: 'seniya',lastName: 'Lenora',role: 'admin',isEmailVerified: false,image: 'default.jpg',iat: 1756979406
                    req.user = content
                    next()
                }
            }
        ) 

    }else{
            next()
        }
   

})

app.use("/api/users",userRouter) //plug userRouter to 5000 port (app.use all are middlewares)
                            //"/users" is route name that connect to userRouter department with 5000 port, get post put delete reqs are in userRouter.js 

app.use("/api/products",productRouter)  
                      
app.listen(5000,  ()=>{
console.log("Srever is running on 5000 port")

})

