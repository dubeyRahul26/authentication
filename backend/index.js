// import statements
import express from "express";
import dotenv from "dotenv";
import connectToDB from "./db/connectToDB.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from 'path';

// To read data from the .env file
dotenv.config();

// Creating an express application
const app = express();
// Defining the port value for the server to listen on and the value is read from .env file for safety purpose
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(cors({
  origin: ["http://localhost:5173", "https://authentication-mbj2.onrender.com"],  // Allow both local and deployed frontend
  credentials: true
}));

// For parsing json data recieved from frontend
app.use(express.json());

// allows to parse incoming cookies
app.use(cookieParser());


// Middleware to handle requests related to authentication
app.use("/api/auth", authRoutes);



if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

//Listening on localhost
// Connecting to database first
connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Database connection failed", err);
  process.exit(1);
});

