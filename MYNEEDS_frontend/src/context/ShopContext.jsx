import { createContext, useEffect, useState } from "react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    // Retrieve the cart from localStorage if available
    const savedCart = localStorage.getItem("cartItems");
  
    try {
      // If savedCart exists and is not corrupted, parse it
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (error) {
      // If an error occurs (invalid JSON), log the error and return an empty object
      console.error("Error parsing cartItems from localStorage:", error);
      return {}; // Fallback to an empty object
    }
  });
  const [loadingCart, setLoadingCart] = useState(true); // Loading state for cart
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [orderItems, setOrderItems] = useState([]);


  useEffect(() => {
    if (cartItems) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    console.log("Current Cart:", cartData);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    localStorage.setItem("cartItems", JSON.stringify(cartData));

    console.log("Updated Cart:", cartItems);

    // Send data to the backend
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, please log in");
      toast.error("No token found");
      return;
    }

    if (token) {
      console.log("Sending Token:", token); // Log the token to ensure it's not null or undefined
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Add to Cart Response:", response);
      } catch (error) {
        console.log("Error adding to cart:", error.response || error.message);
        toast.error(error.response?.data?.message || "Failed to add to cart");
      }
    } else {
      console.log("No token found");
      toast.error("Please log in to add items to the cart");
    }
  };
  

  const getCartCount = () => {
    let totalCount = 0;
    // Check if cartItems is valid before processing
  if (cartItems && typeof cartItems === 'object') {
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
  }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    // Update the cart data locally first
    const updatedCart = { ...cartItems }; // Shallow clone cartItems to avoid mutating the original state
    if (!updatedCart[itemId]) updatedCart[itemId] = {}; // Ensure the item exists in the cart
    updatedCart[itemId][size] = quantity; // Update the quantity for the specific size

    // Persist the updated cart to localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    

    // Update state
    setCartItems(updatedCart);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // After successful cart update, fetch the updated cart from the backend
        const response = await axios.get(backendUrl + "/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

      } catch (error) {
        console.log("Error adding to cart:", error.response || error.message);
        toast.error(error.response?.data?.message || "Failed to add to cart");
      }
    }
  };

  const placeOrder = () => {
    const newOrderItems = []; // or any transformation you need
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          // Find the product data for this itemId
          const productData = products.find(
            (product) => product._id === itemId
          );
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

  const getCartAmount = () => {
    let totalAmount = 0;
    // Check if cartItems is valid before processing
    if (cartItems && typeof cartItems === 'object') {
      for (const items in cartItems) {
        let itemInfo = products.find((product) => product._id === items);
        for (const item in cartItems[items]) {
          try {
            if (cartItems[items][item] > 0 && itemInfo) {
              totalAmount += itemInfo.price * cartItems[items][item];
            }
          } catch (error) {}
        }
      }
    }
    return totalAmount;
  };

  const getProductData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);

      if (response.data.success) {
        setProducts(response.data.products); // Set products state
      } else {
        toast.error(response.data.message); // Show error if no success flag
      }
    } catch (error) {
      console.error(error); // Log the error
      toast.error("error.message"); // Notify user of error
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.get(backendUrl + "/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        // Check if the response is valid JSON
        if (response.data && response.data.success) {
          setCartItems(response.data.cartItems);  // Update cart items
        } else {
          toast.error('Failed to fetch cart data');
        }
      } else {
        console.error('Error: Unexpected response status:', response.status);
        toast.error('Error fetching cart data');
      }
    } catch (error) {
      if (error.response) {
        // Check for 404 response
        if (error.response.status === 404) {
          console.error("API not found:", error.response.data);
          toast.error('API not found. Please check the backend endpoint.');
        } else {
          console.error("Error fetching cart:", error.response || error.message);
          toast.error(error.response?.data?.message || 'An error occurred.');
        }
      } else {
        console.error("Network error:", error.message);
        toast.error('An error occurred while fetching cart data');
      } 
    } finally {
      setLoadingCart(false); // Mark loading as complete
    }
  };
  

  useEffect(() => {
    getProductData();
  }, []);


  useEffect(() => {
    if (token) {
      axios
        .get(backendUrl + "/api/cart/get", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setCartItems(response.data.cartItems);
        })
        .catch((error) => {
          console.error("Error fetching cart:", error);
          toast.error("Failed to fetch cart");
        });
    }
  }, [token]); // Fetch cart on token change

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && !token) {
      setToken(savedToken); // Ensure token is set from localStorage if it exists
      // getUserCart(savedToken);
      // getCartData()
    }
  }, [token]);

    // Fetch cart items from the backend when token changes
    useEffect(() => {
      if (token) {
        setLoadingCart(true); // Set loading to true before fetching cart
        getUserCart(token);
      }
    }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    placeOrder,
    orderItems,
    backendUrl,
    token,
    setToken,
    // getCartData
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
