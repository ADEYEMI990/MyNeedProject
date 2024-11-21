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
import cartRouter from "./routes/cartRoute.js";
import userModel from "./models/userModel.js";
import authUser from "./middleware/auth.js";
import orderRouter from "./routes/orderRoute.js";
import orderModel from "./models/orderModel.js";
import mongoose from 'mongoose'

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
app.use("/api/cart", cartRouter);
app.use('/api/order', orderRouter);


app.get("/api/cart/get",authUser, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you get the user ID from JWT or session
    const user = await userModel.findById(userId); // Fetch the user by ID

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ cartItems: user.cartData }); // Return the cartData field from user document
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart items" });
  }
});

// app.post("/api/cart/add", authUser, async (req, res) => {
//   try {
//     const { itemId, size } = req.body;
//     const userId = req.user.id;  // Get userId from authenticated user

//     if (!itemId || !size) {
//       return res.status(400).json({ message: "ItemId and Size are required" });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Proceed with adding item to cart
//     const cartData = user.cartData || {};
//     if (!cartData[itemId]) {
//       cartData[itemId] = {};
//     }
//     if (!cartData[itemId][size]) {
//       cartData[itemId][size] = 0;
//     }
//     cartData[itemId][size] += 1; // Increment the cart count for the specific item/size

//     user.cartData = cartData;  // Save the updated cartData
//     await user.save();

//     res.status(200).json({ success: true, message: "Item added to cart", cartData });
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).json({ success: false, message: "Error adding to cart" });
//   }
// });

app.post('/api/order/place', authUser, async (req, res) => {
  try {
    console.log('Authenticated user from request:', req.user);

    const { amount, items, address, paymentMethod } = req.body;
    const userId = req.user?.id;  // Extract the user ID from the token (auth middleware)
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is missing' });
    }

    console.log("Received userId:", userId);

    if (!amount || !items || !address || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newOrder = new orderModel({
      userId,  // Set the userId to the authenticated user's ID
      items,
      amount,
      address,
      status: 'Order Placed', // default status
      paymentMethod,
      payment: false, // Assuming it's unpaid initially
      date: Date.now()  // Save the current timestamp
    });

    await newOrder.save();  // Save the new order in the database
    res.status(201).json({ success: true, order: newOrder });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Error placing order' });
  }
});

// app.get('/api/order/user', authUser, async (req, res) => {
//   try {
//     const userId = req.user.id;  // Assuming you have decoded the token and attached user info
//     console.log("Fetching orders for user:", userId);
//     const orders = await orderModel.find({ userId: userId });
//     console.log("Found orders:", orders);

//     if (orders.length === 0) {
//       return res.status(404).json({ success: false, message: 'No orders found' });
//     }

//     res.status(200).json({
//       success: true,
//       orders: orders
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Failed to fetch orders' });
//   }
// });


// Global error handling

// app.get('/api/order/user', authUser, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     console.log("Fetching orders for user:", userId);

//     // Fetch orders for the user and populate the items with product details
//     const orders = await orderModel.aggregate([
//       { $match: { userId: mongoose.Types.ObjectId(userId) } },
//       {
//         $lookup: {
//           from: 'products',  // Assuming your product collection is named 'products'
//           localField: 'items.itemId',  // The field in orders that refers to product IDs
//           foreignField: '_id',  // The field in the product collection that holds the product ID
//           as: 'orderDetails'  // Alias for the product data in the result
//         }
//       },
//       {
//         $unwind: '$orderDetails'  // Flatten the product details into the order document
//       }
//     ]);

//     console.log("Found orders:", orders);

//     if (orders.length === 0) {
//       return res.status(404).json({ success: false, message: 'No orders found' });
//     }

//     res.status(200).json({
//       success: true,
//       orders: orders.map(order => ({
//         ...order,
//         items: order.items.map(item => ({
//           ...item,
//           product: item.orderDetails  // Attach product details to each item
//         }))
//       }))
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Failed to fetch orders' });
//   }
// });

app.get('/api/order/user', authUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching orders for user:", userId);

    // Fetch orders for the user and populate the items with product details
    const orders = await orderModel.aggregate([
      { $match: { userId:new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'products',  // Assuming your product collection is named 'products'
          localField: 'items.itemId',  // The field in orders that refers to product IDs
          foreignField: '_id',  // The field in the product collection that holds the product ID
          as: 'orderDetails'  // Alias for the product data in the result
        }
      },
      {
        $addFields: {
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$orderDetails',
                          as: 'prod',
                          cond: { $eq: ['$$prod._id', '$$item.itemId'] }
                        }
                      },
                      0
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    console.log("Found orders:", orders);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found' });
    }

    res.status(200).json({
      success: true,
      orders: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

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
