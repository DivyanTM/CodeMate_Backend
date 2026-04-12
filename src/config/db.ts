import mongoose from "mongoose";
import logger from "../utils/logger.js";


export const connectDB = async (): Promise<void> => {
    try {
        const uri = process.env['MONGO_URI'] || "mongodb://localhost:27017/codemate";
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to connect to MongoDB: ${msg}`);
        console.log("System is shutting down now...");
        process.exit(1); 
    }
};