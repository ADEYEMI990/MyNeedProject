import userModel from "../models/userModel.js"

// add products to user cart
const addToCart = async (req,res) => {

  try {
    
    const { itemId, size } = req.body;
    const  userId = req.userId;

    console.log('Received:', { userId, itemId, size }); // Debugging log

    const userData = await userModel.findById(userId)
    if (!userData) {
      console.log('User not found');
      return res.json({ success: false, message: 'User not found' });
    }

    let cartData = await userData.cartData || {} ;

    console.log('Current Cart Data:', cartData);
    
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1

      } else {
        cartData[itemId][size] = 1
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    console.log("Updated Cart Data:", cartData);

    const updatedUser = await userModel.findByIdAndUpdate(userId, {cartData}, { new: true })

    console.log('Updated User data after update:', updatedUser);  // Log the updated user document

    res.json({ success: true, message: "Added To Cart" })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
    
  }

}

// update user cart
const updateCart = async (req,res) => {
  try {
    
    const { userId, itemId, size, quantity } = req.body

    const userData = await userModel.findById(userId)
    let cartData = await userData.cartData;
    
    // Check if item and size exist before updating
    if (cartData[itemId] && cartData[itemId][size]) {
      cartData[itemId][size] = quantity;
    } else {
      return res.json({ success: false, message: "Item or size not found in cart" });
    }

    await userModel.findByIdAndUpdate(userId, {cartData})

    res.json({ success: true, message: "Cart Updated" })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
  
}

// get user cart data
const getUserCart = async (req,res) => {
  
try {
  console.log("Received request for /api/cart/get");
  const userId = req.userId;  // This comes from the authentication middleware
  console.log(`User ID: ${userId}`);
  // Check if the userId exists
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is missing from request" });
  }

  const userData = await userModel.findById(userId);

  // Check if the user data was found
  if (!userData) {
    return res.json({ success: false, message: 'User not found' });
  }

  let cartData = await userData.cartData || {};
  console.log('User Data:', userData);
    // Check if cartData is undefined or empty
  if (Object.keys(cartData).length === 0) {
    cartData = {};    // Optional since the default value is already an empty object.
  }

  res.json({ success: true, cartData })

} catch (error) {
  console.log(error);
    res.json({ success: false, message: error.message })
}

}

export { addToCart, updateCart, getUserCart }