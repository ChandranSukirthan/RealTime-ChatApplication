import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: "",
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
} , 
 {timestamps: true}
);

const User = mongoose.model("User",userSchema)
export default User;