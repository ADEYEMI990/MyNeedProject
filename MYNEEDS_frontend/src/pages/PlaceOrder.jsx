import React, { useContext, useState, useEffect } from "react";
import axios from 'axios';
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import PaystackPop from '@paystack/inline-js';

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);

  useEffect(() => {
    const loadPaystackScript = () => {
      if (typeof window.PaystackPop === "undefined") {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v2/inline.js';  // Ensure this is the latest URL
        script.async = true;
        script.onload = () => {
          console.log('Paystack SDK script loaded.');
          if (typeof window.PaystackPop !== "undefined") {
            setIsPaystackLoaded(true);
            console.log("Paystack SDK loaded successfully");
          } else {
            console.error("Paystack SDK initialization failed: window.Paystack is undefined.");
          }
        };
        script.onerror = () => {
          console.error("Failed to load Paystack SDK.");
        };
        document.head.appendChild(script);
      } else {
        setIsPaystackLoaded(true);
        console.log("Paystack SDK was already loaded.");
      }
    };
    loadPaystackScript();
  }, []);
  

  const initPay = (order) => {
    console.log("isPaystackLoaded:", isPaystackLoaded);  // Log the state of isPaystackLoaded
    console.log("window.Paystack:", window.PaystackPop);  // Log window.Paystack
    
      // Ensure Paystack SDK is loaded and available
    if (!isPaystackLoaded || typeof window.PaystackPop === "undefined") {
      console.error("Paystack SDK is not loaded yet.");
      toast.error("Paystack payment service is unavailable.");
      return; // Don't proceed if Paystack SDK isn't loaded
    }

    if (isPaystackLoaded && window.PaystackPop) {
      // Now it's safe to use Paystack SDK
      console.log("Paystack Order:", order);
  
      const paystack = new window.PaystackPop();
      paystack.newTransaction({
        key: import.meta.env.VITE_PAYSTACK_KEY_ID,
        amount: order.amount * 100, // Paystack expects the amount in kobo
        currency: order.currency,
        name: 'Order Payment',
        description: 'Order Payment',
        reference: order.reference, // Reference from the backend
        email: order.email, // User's email
  
        // Callback on successful payment
        onSuccess: (transaction) => { 
          console.log("Payment Successful:", transaction);
          const { reference } = transaction;
          verifyPayment(reference);
        },
  
        // Callback when the user cancels the payment
        onCancel: () => {
          console.log("Payment was cancelled by the user.");
          toast.error("Payment was cancelled");
        }
      });
  
      // Open the Paystack pop-up
      setTimeout(() => {
        paystack.open();
      }, 500); // Add a small delay before executing the payment logic
    } else {
      console.error("Paystack SDK not loaded");
      toast.error("Paystack payment service is unavailable at the moment.");
    }
  };
  
  // Payment verification function after successful transaction
  const verifyPayment = async (reference) => {
    try {
      const verificationResponse = await axios.post(
        backendUrl + '/api/order/verifyPaystack',
        { reference },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (verificationResponse.data.success) {
        toast.success('Payment Successful');
        // Clear cart if payment successful
        console.log("Clearing cart items...");
        setCartItems({});
        navigate('/order'); // Redirect user after payment success
      } else {
        console.log("Payment failed, navigating back to cart...");
        toast.error('Payment Failed');
        navigate('/cart');
      }
    } catch (error) {
      toast.error('Error during payment verification');
    }
  };
  


  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];
      
      console.log('Cart Amount:', getCartAmount());
      console.log('Delivery Fee:', delivery_fee);

      // Iterate over cartItems
      for (const itemId in cartItems) {
        const itemData = cartItems[itemId]; // Get item data (like size/quantity)
        
        for (const size in itemData) {
          const quantity = itemData[size]; // Get the quantity for the size
          
          if (quantity > 0) {
            // Find product info by ID
            const itemInfo = structuredClone(
              products.find((product) => product._id === itemId)
            );
            
            if (itemInfo) {
              itemInfo.size = size;        // Assign size
              itemInfo.quantity = quantity; // Assign quantity
              orderItems.push(itemInfo);   // Push to orderItems array
            }
          }
        }
      }
  
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        paymentMethod: method, // Add paymentMethod field here
      }

      console.log('Order Data:', orderData);

      switch (method) {
        case 'cod': {
          const response = await axios.post(backendUrl + '/api/order/place', orderData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            setCartItems({});
            navigate('/order');
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        case 'stripe':{
          const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (responseStripe.data.success) {
            const {session_url} = responseStripe.data
            window.location.replace(session_url)
          } else {
            toast.error(responseStripe.data.message);
          }
        }
      
        break;

        case 'paystack':{
      
          console.log("Paystack method selected"); // Verify this is being called
          // Ensure you're making the correct API call to the backend
          try {
            const responsePaystack = await axios.post(backendUrl + '/api/order/paystack', orderData, {
            headers: { Authorization: `Bearer ${token}` }
          });
            console.log('Paystack Order Response:', responsePaystack.data);
            
            if (responsePaystack.data.success) {
              initPay(responsePaystack.data.order);
              
            } else {
              console.error('Error placing order:', responsePaystack.data.message);
              toast.error(responsePaystack.data.message);
            }
          } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Error with Paystack payment');
          }
          
        }

        break;
      
        // other cases
        default:
          break;
      }
  
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };


  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* left side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Zipcode"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
        />
      </div>

      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/* Payment Method Selection */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("stripe")}
              className= "flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "stripe" ? "bg-green-400" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="" />
            </div>
            <div
              onClick={() => setMethod("paystack")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "paystack" ? "bg-green-400" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.Paystack_Logo} alt="" />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
