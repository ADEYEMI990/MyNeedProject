import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authUser = async (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1]; // Extract the token after "Bearer "
  console.log('Received Token:', token); // Log the token to ensure it's being sent
  console.log('Authorization Header:', req.headers.authorization);

  if (!token) {
    
    return res.status(401).json({ sucess: false, message: 'Not Authorized Login Again' })

  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }
    console.log('Decoded JWT:', decoded); 

     // Attach the userId to req.userId
     req.userId = decoded.id; // Use decoded.id for userId
     console.log('Authenticated User ID:', req.userId);
     
    // req.userId = decoded.id; // Assuming token contains userId
    // console.log('Authenticated User ID:', req.userId);
    

    const user = await userModel.findById(decoded.id); // Fetch the user from the DB
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user; // Attach the full user object to req.user
    console.log('Authenticated User:', req.user);

    next();

  } catch (error) {
    console.error('Error in authUser middleware:', error);  // Log error here

    

    res.status(401).json({ success: false, message: error.message })
  }
  
}

export default authUser