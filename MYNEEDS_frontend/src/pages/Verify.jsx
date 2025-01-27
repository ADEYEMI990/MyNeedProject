import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios';
import { toast } from "react-toastify";
import { useSearchParams } from 'react-router-dom';

// const Verify = () => {

//   const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
//   const [searchParams, setSearchParams] = useSearchParams()

//   const success = searchParams.get('success')
//   const orderId = searchParams.get('orderId')

//   const verifyPayment = async () => {
//     try {
      
//       if (!token) {
//         return null
//       }

//       console.log("Verifying payment with:", { success, orderId });

//       const response = await axios.post(backendUrl+'/api/order/verifyStripe',{success,orderId},{
//         headers: { Authorization: `Bearer ${token}` }
//       })

//       console.log("Backend response:", response.data);
//       console.log("Payment success status:", response.data.success);

//       // if (response.data.success) {

//       //   setCartItems({});
//       //   setTimeout(() => {
//       //     navigate('/order');
//       //   }, 100);

//       //   // setCartItems({}  )
//       //   // navigate('/order')
      
//       // } else {
//       //   navigate('/cart')
//       // }
      
//       if (response.data.success) {
//         console.log("Clearing cart items...");
//         setCartItems({});
//         setTimeout(async () => {
//           console.log("Navigating to order page...");
//           await navigate('/order'); // Await navigation to ensure it's the last action
//         }, 100);
//       } else {
//         console.log("Payment failed, navigating back to cart...");
//         setTimeout(async () => {
//           await navigate('/cart'); // Await navigation after payment failure
//         }, 100);  // Delay the navigation to ensure no state update conflicts
//       }
      

//     } catch (error) {
//       console.log(error);
//       toast.error(error.message)
//     }
//   }
  

//   useEffect(() => {
//     verifyPayment()
//   },[token, success, orderId])

//   // useEffect(() => {
//   //   let isMounted = true;
  
//   //   const verifyPayment = async () => {
//   //     try {
//   //       if (!token) {
//   //         return null;
//   //       }
  
//   //       const response = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, {
//   //         headers: { Authorization: `Bearer ${token}` },
//   //       });
  
//   //       if (isMounted) {
//   //         if (response.data.success) {
//   //           setCartItems({});
//   //           setTimeout(() => {
//   //             navigate('/order');
//   //           }, 100);
//   //         } else {
//   //           navigate('/cart');
//   //         }
//   //       }
//   //     } catch (error) {
//   //       console.log(error);
//   //       toast.error(error.message);
//   //     }
//   //   };
  
//   //   verifyPayment();
  
//   //   return () => { 
//   //     isMounted = false; 
//   //   };
  
//   // }, [token, success, orderId]);
  

//   return (
//     <div>

//     </div>
//   )
// }

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl, cartItems } = useContext(ShopContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  // Save cart data to localStorage before proceeding with payment
  const saveCartToLocalStorage = () => {
    if (cartItems && Object.keys(cartItems).length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  };

  // Verify the payment status
  const verifyPayment = async () => {
    try {
      if (!token) {
        return null;
      }

      // console.log("Verifying payment with:", { success, orderId });

      const response = await axios.post(
        backendUrl + '/api/order/verifyStripe',
        { success, orderId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // console.log("Backend response:", response.data);
      // console.log("Payment success status:", response.data.success);

      if (response.data.success) {
        // Clear cart if payment successful
        // console.log("Clearing cart items...");
        setCartItems({});
        localStorage.removeItem('cartItems'); // Optional: clear cart from localStorage if payment is successful

        setTimeout(async () => {
          // console.log("Navigating to order page...");
          await navigate('/order');
        }, 100);
      } else {
        // console.log("Payment failed, navigating back to cart...");
        setTimeout(async () => {
          // On failure, attempt to recover cart data from localStorage
          const savedCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
          if (savedCart && Object.keys(savedCart).length > 0) {
            // console.log("Recovered cart items from localStorage:", savedCart);
            setCartItems(savedCart); // Recover cart items from localStorage
          }
          await navigate('/cart');
        }, 100);
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    // Before making the payment, save the cart data to localStorage
    saveCartToLocalStorage();

    verifyPayment();
  }, [token, success, orderId]);

  return <div></div>;
};

export default Verify