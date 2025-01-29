// import jwt from "jsonwebtoken";
// import userModel from "../models/userModel.js";

// const authUser = async (req, res, next) => {

//   const token = req.headers.authorization?.split(" ")[1]; // Extract the token after "Bearer "
//   console.log('Received Token:', token); // Log the token to ensure it's being sent
//   console.log('Authorization Header:', req.headers.authorization);

//   if (!token) {
    
//     return res.status(401).json({ sucess: false, message: 'Not Authorized Login Again' })

//   }

//   try {

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded || !decoded.id) {
//       return res.status(401).json({ success: false, message: 'Invalid token payload' });
//     }
//     console.log('Decoded JWT:', decoded); 

//      // Attach the userId to req.userId
//      req.userId = decoded.id; // Use decoded.id for userId
//      console.log('Authenticated User ID:', req.userId);
     
//     // req.userId = decoded.id; // Assuming token contains userId
//     // console.log('Authenticated User ID:', req.userId);
    

//     const user = await userModel.findById(decoded.id); // Fetch the user from the DB
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     req.user = user; // Attach the full user object to req.user
//     console.log('Authenticated User:', req.user);

//     next();

//   } catch (error) {
//     console.error('Error in authUser middleware:', error);  // Log error here

    

//     res.status(401).json({ success: false, message: error.message })
//   }
  
// }

// export default authUser


import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authUser = async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Invalid authorization header format' });
  }
  const token = authHeader.split(' ')[1];

  // Log token and header in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Received Token:', token);
    console.log('Authorization Header:', req.headers.authorization);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in again.' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    // Log decoded token in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Decoded JWT:', decoded);
    }

    // Attach userId to request object
    req.userId = decoded.id;

    // Fetch user from database
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is active (optional)
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'User account is inactive' });
    }

    // Attach user object to request
    req.user = user;

    // Log authenticated user in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Authenticated User ID:', req.userId);
      console.log('Authenticated User:', req.user);
    }

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Log error in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in authUser middleware:', error);
    }

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    } else {
      return res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
    }
  }
};

export default authUser;