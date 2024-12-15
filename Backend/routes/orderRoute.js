import express from 'express'
import { placeOrder, placeOrderStripe, placeOrderPaystack, allOrders, userOrders, updateStatus, verifyStripe, verifyPaystack, } from "../controllers/orderController.js";
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)

// payment Features
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.post('/paystack',authUser,placeOrderPaystack)

//User Feature
orderRouter.post('/userorders',authUser,userOrders)

// verify payment
orderRouter.post('/verifyStripe',authUser, verifyStripe)
orderRouter.post('/verifyPaystack',authUser, verifyPaystack)

export default orderRouter