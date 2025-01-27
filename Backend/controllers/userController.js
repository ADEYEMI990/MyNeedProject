import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url'; // Import this function to handle file URLs
import path from 'path';  // Path module is still used to resolve file paths
import fs from 'fs';
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary"

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Get user profile

const getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the JWT token (from the authenticated user)
    const userId = req.user.id;
    
    // Fetch the user from the database using the userId
    const user = await userModel.findById(userId);
    
    if (!user) {
      // If the user doesn't exist, return an error response
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send the user profile data as a response
    return res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || "Not Provided",  // Add the phone field
        profileImage: user.profileImage || null,  // Add the profile image URL
        cartData: user.cartData,
        // Add any other fields you want to send in the profile response
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // If an error occurs, make sure only one response is sent
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
};

// Update user profile (name, email, password)
const updateUserProfile = async (req, res) => {
  console.log('Received request to update profile:', req.body);  // Log incoming request body

  try {
    const { name, email, password, phone } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if email is changed and already taken
    if (email && email !== user.email) {
      const emailExists = await userModel.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
    }

    // Update user data
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;  // Update phone number if provided

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // await user.save();

     // Save user data with error handling
     try {
      await user.save();
    } catch (saveError) {
      console.error("Error saving user:", saveError);
      return res.status(500).json({ success: false, message: "Failed to update user profile in the database" });
    }

    res.status(200).json({
       success: true,
       message: "Profile updated successfully",
       user: {
        name: user.name,
        email: user.email,
        phone: user.phone || "Not Provided",  // Return the phone number or "Not Provided"
        profileImage: user.profileImage || null,  // Return the profile image URL or null if not set
        cartData: user.cartData
      }
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update user profile image
// const updateUserProfileImage = async (req, res) => {
//     try {
//       console.log('Received request to update profile image');

//       // Get the user ID from the JWT token (from the authenticated user)
//       const userId = req.user.id;
      
//       // Fetch the user from the database using the userId
//       const user = await userModel.findById(userId);
//       if (!user) {
//         return res.status(404).json({ success: false, message: "User not found" });
//       }

//       // Check if a file was uploaded
//       if (req.file) {
//         // Generate the image URL
//         const imageUrl = `/uploads/profiles/${req.file.filename}`;

//         // Log to ensure image upload is being handled
//         console.log('Uploaded image: ', req.file);

//         // Remove the old profile image if it exists
//         if (user.profileImage) {
//           // Use import.meta.url to get the current directory in ES modules
//           const __filename = fileURLToPath(import.meta.url);
//           const __dirname = path.dirname(__filename);
          
//           const oldImagePath = path.join(__dirname, '..', 'public', user.profileImage);
          
//           // Log before trying to delete the old image
//           console.log('Attempting to delete old image:', oldImagePath);

//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath); // Delete the old image
//             console.log('Old image deleted successfully');
//           } else {
//             console.log('Old image not found:', oldImagePath); // Log if old image does not exist
//           }
//         }

//         // Update the user's profile image URL in the database
//         user.profileImage = imageUrl;
//         await user.save();  // Save the updated user profile

//         console.log('Profile image updated in the database:', imageUrl);

//         // Return the updated profile image URL in the response
//         return res.status(200).json({
//            success: true, 
//            updatedProfileImage: imageUrl,
//            user: {
//             name: user.name,
//             email: user.email,
//             phone: user.phone || "Not Provided",  // Ensure phone field is included
//             profileImage: imageUrl  // Return the updated profile image URL
//           }
//         });
//       } else {
//         return res.status(400).json({ success: false, message: "No image file provided" });
//       }
//     } catch (error) {
//       console.error('Error updating profile image:', error);

//       // Send the error response
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };

const updateUserProfileImage = async (req, res) => {
  try {
    console.log('Received request to update profile image');

    // Get the user ID from the JWT token (from the authenticated user)
    const userId = req.user.id;
    
    // Fetch the user from the database using the userId
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if a file was uploaded
    if (req.file) {
      // Upload the image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
        folder: 'profile_images',  // Optional: Set a folder in Cloudinary
      });

      const imageUrl = uploadResult.secure_url;  // Get the URL of the uploaded image

      // Log to ensure image upload is being handled
      console.log('Uploaded image: ', req.file);

      // Remove the old profile image from Cloudinary (if it exists)
      if (user.profileImage) {
        // Extract public ID from old image URL to delete it from Cloudinary
        const oldImagePublicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`profile_images/${oldImagePublicId}`);
        console.log('Old image deleted successfully');
      }

      // Update the user's profile image URL in the database
      user.profileImage = imageUrl;
      await user.save();  // Save the updated user profile

      console.log('Profile image updated in the database:', imageUrl);

      // Return the updated profile image URL in the response
      return res.status(200).json({
         success: true, 
         updatedProfileImage: imageUrl,
         user: {
          name: user.name,
          email: user.email,
          phone: user.phone || "Not Provided",  // Ensure phone field is included
          profileImage: imageUrl  // Return the updated profile image URL
        }
      });
    } else {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }
  } catch (error) {
    console.error('Error updating profile image:', error);

    // Send the error response
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
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

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, updateUserProfileImage };
