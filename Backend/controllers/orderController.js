import dotenv from 'dotenv';
dotenv.config();  // Load environment variables from .env
import axios from 'axios';
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import Paystack from 'paystack';

// global variables
const currency = 'USD'
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const paystackInstance = new Paystack({
//   key_id : process.env.PAYSTACK_KEY_ID,
//   key_secret : process.env.PAYSTACK_KEY_SECRET
// })

// Correct initialization
const paystackInstance = Paystack(process.env.PAYSTACK_KEY_SECRET); // Secret key used for server-side requests

// Placing orders using COD Method
const placeOrder = async (req,res) => {

  try {
    
    // Use the userId from the authenticated user (set by authUser middleware)
    const userId = req.user.id; // You don't need to get userId from req.body anymore
    const { items, address, amount } = req.body;

    // Log the received values to ensure they're correct
    console.log("User ID from Auth Middleware:", userId);
    console.log("Order Details:", { items, address, amount });

    // Check if required fields are provided
    if (!userId || !items || !address || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: 'COD',
      payment: false,
      date: Date.now()
    }

    const newOrder = new orderModel(orderData)
    const savedOrder = await newOrder.save()

    console.log("Saved Order:", savedOrder); // Check if order is saved properly

    await userModel.findByIdAndUpdate(userId,{cartData:{}})

    res.json({success:true,message:"Order Placed"})

  } catch (error) {
    console.log(error)
    res.json({sucess:false, message:error.message})
  }

}

// Placing orders using Stripe Method
// const placeOrderStripe = async (req,res) => {
//   try {
    
//     const { userId, items, address, amount } = req.body;
//     const { origin } = req.headers;

//     const orderData = {
//       userId,
//       items,
//       address,
//       amount,
//       paymentMethod: 'stripe',
//       payment: false,
//       date: Date.now()
//     }

//     const newOrder = new orderModel(orderData)
//     const savedOrder = await newOrder.save()

//     const line_items = items.map((item) => ({
//       price_data: {
//         currency:currency,
//         product_data : {
//           name: item.name
//         },
//         unit_amount: item.price * 100
//       },
//       quantity: item.quantity
//     }))

//     line_items.push({
//       price_data: {
//         currency:currency,
//         product_data : {
//           name: 'Delivey Charges'
//         },
//         unit_amount: deliveryCharge * 100
//       },
//       quantity: 1
//     })

//     const session = await stripe.checkout.sessions.create({
//       success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
//       cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
//       line_items,
//       mode:'payment',
//     })

//     res.json({success:true,session_url:session.url});

//   } catch (error) {
//     console.log(error)
//     res.json({sucess:false, message:error.message})
//   }
// }

const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address, amount } = req.body;
    
    const origin = req.headers.origin || 'http://localhost:4000';

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: 'stripe',
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    const savedOrder = await newOrder.save();

    console.log("Items received:", items);

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity || 1,
    }));
    
    

    line_items.push({
      price_data: {
        currency,
        product_data: { name: 'Delivery Charges' },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${savedOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${savedOrder._id}`,
      line_items,
      mode: 'payment',
    });
    console.log("Stripe Session Response:", session);
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// verify stripe
const verifyStripe = async (req,res) => {

  const userId = req.user.id;
  const { orderId, success} = req.body;

  try {
    if (success === 'true') {
      await orderModel.findByIdAndUpdate(orderId, {payment:true});
      await userModel.findByIdAndUpdate(userId, {cartData: {}});
      res.json({success: true})
    } else {
      await orderModel.findByIdAndDelete(orderId)
      res.json({ success: false, message: 'Payment failed, order not confirmed.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

}

// Placing orders using Razorpay Method
const placeOrderPaystack = async (req,res) => {
  try {
    
    const userId = req.user.id;
    const { items, address, amount } = req.body;

    console.log("User ID from Auth Middleware:", userId);
    console.log("Received Order Details:", { items, address, amount });
    
     // Ensure the required fields are present
     if (!userId || !items || !address || !amount) {
      console.log("Missing required fields in the request.");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Fetch the authenticated user's email from the database
    const user = await userModel.findById(userId);

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userEmail = user.email; // Use the user's email for the Paystack request

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: 'paystack',
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    const savedOrder = await newOrder.save();

     // Log the saved order and its ID
     console.log("Saved Order to DB:", savedOrder);  // This will show the full order data including orderId
     console.log("Order ID for Paystack:", savedOrder._id);  // This logs the orderId

    const options = {
      amount: amount * 100,
      currency: 'NGN',
      reference : savedOrder._id.toString(),
      email: userEmail, // Add the user's email here
    }

    console.log("Paystack Options Sent:", options);
    console.log('Initializing Paystack payment...');

    paystackInstance.transaction.initialize(options, (error,order)=> {
      console.log('Callback reached');
      if (error) {
        console.log('Error initializing Paystack transaction:', error);
        return res.status(500).json({success:false, message: error})
      }
       // Log the order object for debugging
        console.log('Paystack Order:', order);

        if (order.status === true) {
          // Return the order details to the frontend if successful
          res.json({
            success: true,
            order: {
              amount: savedOrder.amount,
              reference: savedOrder._id.toString(),
              email: userEmail,
              currency: 'NGN',
            },
          });
        } else {
          console.log('Paystack Order Failed:', order);
          res.status(500).json({ success: false, message: 'Paystack initialization failed' });
        }
      
    })

  } catch (error) {
    console.log(error)
    res.json({
      sucess:false, 
      message:error.message,
    })
  }
}

const verifyPaystack = async (req, res) => {
  const { reference } = req.body;


  console.log("Received Paystack verification request for reference:", reference);

  try {
    const paymentDetails = await paystackInstance.transaction.verify(reference);
    console.log("Paystack Payment Details:", paymentDetails);
    if (paymentDetails.status === true) {
      // Payment was successful, update the order status
      await orderModel.findByIdAndUpdate(paymentDetails.data.reference, { payment: true });
      res.json({ success: true, message: 'Payment successful' });
    } else {
      console.log('Payment failed with Paystack response:', paymentDetails);  // Add more details in the log
      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.log("Error verifying Paystack payment:",error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// All Orders data for Admin Panel
const allOrders = async (req,res) => {
  

  try {
    
    const orders = await orderModel.find({})
    res.json({success:true,orders})

  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message})
  }

}

// All Orders data for Admin Panel
const userOrders = async (req,res) => {
  // try {
    
  //   const { userId } = req.body

  //   const orders = await orderModel.find({ userId })
  //   res.json({success:true, orders})

  // } catch (error) {
  //   console.log(error);
  //   res.json({success:false, message:error.message})
    
  // }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
  try {
    
    const { orderId, status } = req.body

    await orderModel.findByIdAndUpdate(orderId, { status })
    res.json({success:true,message:'Status Updated'})

  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message})
  }
}

export { verifyPaystack, verifyStripe ,placeOrder, placeOrderStripe, placeOrderPaystack, allOrders, userOrders, updateStatus }