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
import path from 'path';
import { fileURLToPath } from 'url'; // Import this to handle __dirname in ES modules
import fs from 'fs';

dotenv.config();

const app = express();
connectDB();
connectCloudinary();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Function to check if the uploads directory is writable
function checkUploadsDirectory(res) {
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');

    // Check if the directory exists, if not, create it
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created:', uploadsDir);
  } else {
    console.log('Uploads directory already exists:', uploadsDir);
  }

  try {
    fs.accessSync(uploadsDir, fs.constants.W_OK); // Check if directory is writable
    console.log('Uploads directory is writable');
  } catch (err) {
    console.error('Permission error: Unable to write to uploads directory');
    // Send response if permission error
    res.status(500).json({ success: false, message: 'Permission error: Unable to write to uploads directory' });
    return false;  // Return false to indicate failure
  }
  return true;  // Directory is writable
}

// Call the function in your route or application setup
app.use((req, res, next) => {
  if (!checkUploadsDirectory(res)) {
    return;  // Stop the request flow if there's a directory permission error
  }
  next();  // Continue processing if directory is writable
});

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
