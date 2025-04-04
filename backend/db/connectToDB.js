import mongoose from "mongoose";

// function for connecting to MongoDB Database using mongoose module
const connectToDB = async () => {
  try {
    // using mongoose.connect() method to connect to MongoDB and getting the URI from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to mongoDB ${conn.connection.host}`);
  } catch (error) {
    console.log("Failed to connect to mongoDB", error);
    process.exit(1);
  }
};

export default connectToDB;
