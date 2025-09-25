import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSignUp = new Schema(
    {
        name:{
            type:String,
            requiered:true,
            unique: true,
            trim: true,
            index: true
        },
        email:{
            type:String,
            requiered:true,
            unique: true,
            lowercase: true,
            trim: true 
        },
        password:{
            type:String,
            requiered:true
        },
        avatar:{
            type:String
        },
        watchHistory:[
            {
                type : Schema.Types.ObjectId,
                ref: "Video"         //3. Error - Token error -Step1 - fixed from "video" to "Video"
            }
        ],
        refreshToken:{
            type: String
        }
    },
    {
        timestamps:true
    }
)


// hash if changed
userSignUp.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSignUp.methods.isPasswordCorrect = async function (password) {

    /*
       3.ERROR - Token Error - step2 - return this.password === password;
    */
    return bcrypt.compare(password, this.password);     
};

userSignUp.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d"
        }
    )
}
userSignUp.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY ||"30d"
        }
    )
}


export const newUser = mongoose.model("newUser" , userSignUp)