import express from 'express';
import { loginUser, registerUser, adminLogin,getUserProfile, updateUserProfile, updateUserProfileImage } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';  // Import multer for image upload
// import multer from 'multer';

// // Set up multer for image upload (use Cloudinary if needed)
// const upload = multer({ dest: 'public/uploads/profiles/' });  // Local storage for images

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)

// Profile Routes
userRouter.get('/profile', authUser, getUserProfile);  // Fetch user profile
userRouter.put('/updateProfile', authUser, updateUserProfile);  // Update user profile (name, email, password)
userRouter.post('/updateProfileImage', authUser, upload.single('profileImage'), updateUserProfileImage);  // Upload new profile image

export default userRouter;