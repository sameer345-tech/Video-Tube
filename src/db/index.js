import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const connectDB = async () => {
    try {
      const dbConnection =  await mongoose.connect(`${process.env.MONGO_DB_URl}/${DB_NAME}`);
        console.log(`Connected to MongoDB: ${dbConnection.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectDB