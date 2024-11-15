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
    console.log('Decoded JWT:', decoded); 
    // req.userId = decoded.id; // Assuming token contains userId
    // console.log('Authenticated User ID:', req.userId);
    
    // Assign the userId to req.userId
    req.userId = decoded.id;

    const user = await userModel.findById(decoded.id); // Fetch the user from the DB
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user; // Attach the full user object to req.user
    console.log('Authenticated User:', req.user);

    next();

  } catch (error) {
    console.log('JWT verification failed:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }

    res.status(401).json({ success: false, message: error.message })
  }
  
}

export default authUser