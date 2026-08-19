import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        let uri = (process.env.MONGODB_URI || "").trim().replace(/\/+$/, "");
        const dbName = process.env.DB_NAME || DB_NAME || "viewtube";

        const connectionInstance = await mongoose.connect(`${uri}/${dbName}`);
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host} | DB NAME : ${connectionInstance.connection.name} \n`);
        
        // Auto-fix index issue
        try {
            await mongoose.connection.db.collection('newusers').dropIndex('name_1');
            console.log('✅ Dropped obsolete name_1 unique index successfully.');
        } catch (e) {
            if (e.codeName !== 'IndexNotFound') {
                console.log('Index name_1 already dropped or not found.');
            }
        }
        
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        console.error("⚠️  Server will start without database. API calls requiring DB will fail.");
        // Don't exit — let the server start so it can return proper HTTP errors
        // instead of ERR_CONNECTION_REFUSED
    }
}

export default connectDB;
