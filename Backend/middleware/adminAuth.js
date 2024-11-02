// import jwt from "jsonwebtoken"
// import { connect } from "mongoose"

// const adminAuth = async (req,res,next) => {
//   try {
//     const { token } = req.headers
//     if (!token) {
//       return res.json({success:false,message:"Not Authorized Login Again"})
//     }
//     const token_decode = jwt.verify(token,process.env.JWT_SECRET);
//     if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
//       return res.json({success:false,message:"Not Authorized Login Again"})
//     }
//     next();
//   } catch (error) {
//     console.log(error)
//     res.json({success:false, message: error.message})
//   }
// }

// export default adminAuth


// import jwt from "jsonwebtoken";

// const adminAuth = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1]; // Correctly extract the token
//     if (!token) {
//       return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
//     }

//     const token_decode = jwt.verify(token, process.env.JWT_SECRET);

//     // Assuming the token contains user role info, check if user is admin
//     if (token_decode.role !== 'admin') { // Adjust this based on how you encode roles in the token
//       return res.status(403).json({ success: false, message: "Not Authorized Login Again" });
//     }

//     req.user = token_decode; // Attach user info to the request
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export default adminAuth;

import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Correctly extract the token
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }

    let token_decode;
    try {
      token_decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", token_decode);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: "Invalid token" });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: "Token expired" });
      }
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log("Decoded Token before role check:", token_decode); // Log the decoded token

    // Check if the role exists
    if (token_decode.role !== 'admin') {
      console.log("User Role:", token_decode.role);
      return res.status(403).json({ success: false, message: "Not Authorized. Admin access required." });
    }
    

    req.user = token_decode; // Attach user info to the request
    next();
  } catch (error) {
    console.log("Admin Auth Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default adminAuth;