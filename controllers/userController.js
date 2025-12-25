import User  from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export function createUser(req,res){

    const data = req.body  // request body assign into data variable  

    const hashedPassword = bcrypt.hashSync(data.password,10)   //hashed the password & number 10 means hash password 10 times 

    // res.json({
    //     hashedPassword   //you can see again and again hashing the same password the hash looks deferen like this "hashedPassword": "$2b$10$MKDHlIXKjjF6FPzZV7eo.uAd/f2D66JYJuNqb/6ztpnUd.y9Xnu7a"  /  "hashedPassword": "$2b$10$a2AUhspJDH.TBNh4n5vzkuM7mbpporMrMWWcg1dG/U27eXqUsne26"
    // })                   //that beacuase every time add a random word to the end of the password this called add salt , so finaly password+salt is inside hash value, every time that random value is change when changing the password, that's why we getting deferent hash values when hashing the same password.  

    const user = new User({     //create a user and assign values
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        
        
    })

    //const user = new User(req.body)     create user collection inside seniya database, 
                                    // that seniya databse cration is done by mongoURI, In mongoURI type your databse name after this line "mongodb.net/your_database_name?retryWrites"
    
    
    user.save().then(() =>{     //save the user and desplay a respond massage
    res.json({
        message : "User Created Succesfully"
        })
    }

    ) 
}

export function loginUser(req,res){

    const email = req.body.email
    const password = req.body.password

    User.find({email : email}).then(    //find a user email that similar to entered email
                                        //the User in ../models/User.js is used because it is my Mongoose model for the user collection in MongoDB.
        (users)=>{
            if(users[0] == null){    //if(users[0] == null) says when we use this function  user.find({email : email}) the result should be display as an array inside user details or empty array, so users[0] == null means it does't have a similar user print "User not found"

                res.status(404).json({
                    massage : "User not found"
                })
            }else{
                const user = users[0]    //else the details of  the user inside the array assign to user variable and pass as a json respond
               // res.json(user)

                const isPasswordCorrect = bcrypt.compareSync(password,user.password)  //password means user enetered password and user.password means the password inside the database, Those password will compare with this function , password : sahan123
                if(isPasswordCorrect){

                    const payload = {     //After compare password get user details as json request to payload variable  
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        password: user.hashedPassword,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                        image: user.image 
                    };

                    const token = jwt.sign(payload, process.env.JWT_SECRET, {  //make sure to  import dotenv from "dotenv"; , other vise it's value getting null beacuse it's in .env file
                                                                                                     //dotenv.config();
                        expiresIn: "150h" //token expire time

                    }) //convert those user data into a token, First give the content(payload) to encrypt for inside sign() and second add a custom secrete key

                res.json({
                    //matching : isPasswordCorrect
                    
                    massage : "Login successful",
                    role : user.role,
                    token: token   //pass the token to frot-end, user will received a token like this "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNlbml5YUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJzZW5peWEiZGVmYXVsdC5qcGciLCJpYXQiOjE3NTY5Nzk0MDZ9.L2N2oBUDuVPS4XXp4p-shFQbMSpzt00zkU-HLXfWhPk"
                                    //Next step is create a guard room to identify user by the token it is in index.js

                })
                }else{
                    res.status(401).json({             //standerd error validations 401-user cred error, 403-trying to access not accessible page
                        massage : "Invalid password"
                    })

                }
            }
        
                                 
        }
    )  
}

export function isAdmin(req){
        if(req.user == null){
        return false
        }

        if(req.user.role != "admin"){
        return false
        }

        return true

    }

export function getUser(req, res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        });
        return;
    }res.json(req.user);
}    

export async function googleLogin(req, res) {
	console.log(req.body.token);
	try {
		const response = await axios.get(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: {
					Authorization: `Bearer ${req.body.token}`,
				},
			}
		);

		console.log(response.data); //response.data have all the information about the user from google

        //check user already in database or not
		const user = await User.findOne({ email: response.data.email });
		if (user == null) {
			const newUser = new User({
				email: response.data.email,
				firstName: response.data.given_name,
				lastName: response.data.family_name,
				password: "123", // get a default password because google login don't need password
				image: response.data.picture,
			});
			await newUser.save();

			const payload = {
				email: newUser.email,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				role: newUser.role,
				isEmailVerified: true,
				image: newUser.image,
			};

			const token = jwt.sign(payload, process.env.JWT_SECRET, {
				expiresIn: "150h",
			});

			res.json({
				message: "Login successful",
				token: token,
				role: user.role,
			});
		} else {
			if (user.isBlocked) {
				res.status(403).json({
					message: "User is blocked. Contact admin.",
				});
				return;
			}
			const payload = {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				isEmailVerified: user.isEmailVerified,
				image: user.image,
			};

			const token = jwt.sign(payload, process.env.JWT_SECRET, {
				expiresIn: "150h",
			});

			res.json({
				message: "Login successful",
				token: token,
				role: user.role,
			});
		}
	} catch (error) {
		res.status(500).json({
			message: "Google login failed",
			error: error.message,
		});
	}
}
