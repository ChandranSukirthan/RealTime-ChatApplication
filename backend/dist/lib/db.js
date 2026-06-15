import mongoose from "mongoose";

async function connectDB() {
    try{
        const mongoUri = process.env.MONGO_URI

        if(!mongoUri){
            throw new Error("MONGO_URI is required");
        }

        const conn = await mongoose.connect(mongoUri)
        console.log("MongoDB connected", conn.connection.host)
        
    }
    catch(error){
         console.error("MongoDB connction error:",error.message);
         process.exit(1);
    }
    
}
export { connectDB };