import userModel from "../models/userModel.js";

// Route for user login
const loginUser = async () => {


}

// Route for user register
const registerUser = async (req,res) => {

  try {
    
    const {name, email, password} = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({email});
    if (exists) {
      return res.json({success:false, message:"user already exists"})
    }

    // validating email format & strong password
    if (condition) {
      
    }

  } catch (error) {
    
  }

}

// Route for admin login
const adminLogin = async (req,res) => {


}

export { loginUser,registerUser,adminLogin }