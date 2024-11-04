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

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors"; // Import the CORS packagenpm ru
// import connectDB from "./config/mongodb.js";
// import connectCloudinary from "./config/cloudinary.js";
// import userRouter from "./routes/userRoute.js";
// import productRouter from "./routes/productRoute.js";

// dotenv.config(); // Load environment variables

// const app = express();
// connectDB();
// connectCloudinary();

// // Enable CORS
// app.use(cors({
//   origin: 'http://localhost:5174', // Allow requests from this origin
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed methods
//   credentials: true, // Allow credentials (optional)
// }));

// // middlewares
// app.use(express.json());

// // api endpoints
// app.use("/api/user", userRouter);
// app.use("/api/product", productRouter);

// // Define a route for the root URL
// app.get("/", (req, res) => {
//   res.send("Welcome to my API!");
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ success: false, message: 'Internal Server Error' });
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


import express from "express";
import dotenv from "dotenv";
import cors from "cors"; 
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import morgan from "morgan"; // HTTP request logging

dotenv.config();

const app = express();
connectDB();
connectCloudinary();

// Enable CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Log requests to the console

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

// Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
