import { createContext, useEffect, useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const currency = '$';
  const delivery_fee = 10;
  const [search,setSearch] = useState('');
  const [showSearch,setShowSearch] = useState(false);
  const [cartItems,setCartItems] = useState({});
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);


  const addToCart = async (itemId,size) => {

    if (!size) {
      toast.error('Select Product Size');
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      }
      else {
        cartData[itemId][size] = 1;
      }
    }
    else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

  }

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          
        }
      }
      
    }
    return totalCount;
  }

  const updateQuantity = async (itemId,size,quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);
  }

  const placeOrder = () => {
    const newOrderItems = []; // or any transformation you need
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          // Find the product data for this itemId
          const productData = products.find(product => product._id === itemId);
          if (productData) {
            newOrderItems.push({
              _id: itemId,
              size: size,
              quantity: cartItems[itemId][size],
              name: productData.name, // Include name
              price: productData.price, // Include price
              image: productData.image, // Include image
              // Add any additional fields you need
              date: new Date().toLocaleDateString(), // Example date format
            });
          }
          
        }
      }
      console.log(newOrderItems);
    }
    setOrderItems(newOrderItems); // assuming you have setOrderItems in your context
    setCartItems({}); // Optionally clear the cart after placing the order
  };



  const getCartAmount =() => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product)=>product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
            
          }
        } catch (error) {
          
        }
        
      }
      
    }
    return totalAmount;
  }

  const value = {
    products,  currency, delivery_fee,search,setSearch,showSearch,setShowSearch,cartItems,addToCart,getCartCount,updateQuantity,getCartAmount, navigate, placeOrder, orderItems
  }

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  )

}

export default ShopContextProvider;