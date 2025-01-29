import multer from "multer";
import { fileURLToPath } from 'url';  // Import this function to handle file URLs
import path from "path";
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

// Define __dirname using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     // Ensure the directory exists or is created
//     const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
//     console.log("Uploading to path:", uploadPath);  // Log the path
//     callback(null, uploadPath);  // Correct path
//   },
//   filename: function (req, file, callback) {
//     // Generate a unique filename using the current timestamp and file extension
//     const filename = Date.now() + path.extname(file.originalname);
//     console.log("Saving file as:", filename);  // Log the filename
//     callback(null, filename);  // Unique filename based on timestamp
//   }
// })

// Use memory storage to keep files in memory instead of disk

const storage = multer.memoryStorage();  // Store the file in memory as a buffer

const upload = multer({ storage: storage })

export default upload