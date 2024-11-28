import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

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
const placeOrderStripe = async (req,res) => {
  
}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
  
}

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

export {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus }