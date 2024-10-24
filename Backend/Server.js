// import express from 'express'
// import cors from 'cors'
// import 'dotenv/config.js'

// // App Config
// const app = express();
// const poer = process.env.PORT || 4000

// // middlewares
// app.arguments(express.json())
// app.arguments(cors())

// // api endpoints

// app.get('/',(reg,res)=>{
//   res.send('API working')
// })

// app.listen(port, ()=> console.log('Server started on PORT : '+ port))

// import express from 'express';

// const app = express();

// // Use express.json() middleware
// app.use(express.json());

// // Your other middleware and routes here

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";

dotenv.config(); // Load environment variables

const app = express();
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
