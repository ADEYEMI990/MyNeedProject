import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Route for user login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken({ id: user._id, role: user.role }); // Include user role
      console.log("Generated Token:", token);
      return res.status(200).json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });}
};

// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.json({ success: false, message: "user doesn't exists" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (isMatch) {
//       const token = createToken(user._id);
//       res.json({ success: true, token });
//     } else {
//       res.json({ success: false, message: "Invalid credentials" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// Route for user register
const registerUser = async (req, res) => {
  try {
    
    const { name, email, password } = req.body;  // Directly access the data without .payload

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "user already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Make sure the token payload is a plain object
    const token = createToken({ id: user._id });

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
// const adminLogin = async (req, res) => {
//   try {
//     const {email,password} = req.body
//     if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//       const token = jwt.sign(email+password,process.env.JWT_SECRET);
//       res.json({success:true,token})
//     } else {
//       res.json({success:false,message:"Invalid credentials"})
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Email and password are required" });
//     }

//     // Check admin credentials
//     if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//       const token = createToken('admin'); // Use a static identifier or ID
//       return res.status(200).json({ success: true, token });
//     } else {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check admin credentials
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = createToken({ id: 'admin', role: 'admin' }); // Include role in token
      return res.status(200).json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin };
