import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        let uri = (process.env.MONGODB_URI || "").trim().replace(/\/+$/, "");
        const dbName = process.env.DB_NAME || DB_NAME || "viewtube";

        const connectionInstance = await mongoose.connect(`${uri}/${dbName}`);
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host} | DB NAME : ${connectionInstance.connection.name} \n`);
        
    } catch (error) {
        console.log("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

export default connectDB;
