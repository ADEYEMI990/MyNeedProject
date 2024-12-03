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

    let cartData = userData.cartData || {} ;

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
    
    // Destructure the values from the request body
    const { itemId, size, quantity } = req.body;
    const userId = req.userId;  // Use req.userId from the middleware

     // Log the incoming request data
     console.log('Received:', { userId, itemId, size, quantity });

    const userData = await userModel.findById(userId)
    let cartData = userData.cartData;
    
    
    if (quantity <= 0) {
      // If quantity is 0 or less, delete the item from the cart
      if (cartData[itemId] && cartData[itemId][size]) {
        delete cartData[itemId][size];  // Remove the specific size from the item
        // If no more sizes exist for the item, remove the entire item from the cart
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      // If quantity is greater than 0, update the quantity for the specific item and size
      if (cartData[itemId] && cartData[itemId][size]) {
        cartData[itemId][size] = quantity;  // Update the quantity
      } else {
        // If item doesn't exist in the cart, return an error message
        return res.json({ success: false, message: "Item or size not found in cart" });
      }
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