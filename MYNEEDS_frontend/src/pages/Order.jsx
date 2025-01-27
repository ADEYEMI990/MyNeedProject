import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import styles for Toastify

const Order = () => {
  const { orderItems, currency } = useContext(ShopContext);
  const [isRefreshing, setIsRefreshing] = useState(false); // State to trigger refresh
  
  useEffect(() => {
    // If there are no order items, we can trigger an action to show a loading state or error message
    if (orderItems.length === 0) {
      // console.log("No orders found or error fetching orders.");
    }
  }, [orderItems]);

  // Get today's date in a formatted way (MM/DD/YYYY)
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US"); // Use 'en-US' locale for MM/DD/YYYY format
  };

  // Function to convert timestamp to readable date format
  const convertTimestampToDate = (timestamp) => {
    if (timestamp) {
      return new Date(timestamp).toLocaleDateString("en-US"); // Converts to MM/DD/YYYY
    }
    return getTodayDate(); // If no timestamp, return today's date
  };

  // Sort the orderItems by date (most recent first)
  const sortedOrderItems = orderItems.slice().sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Sort in descending order (latest first)
  });

  // Handle Track Order button click
  const handleTrackOrder = () => {
    // Show the toast message
    toast.info("Check your order status!");

    // Trigger page refresh (or you could simulate a refresh by setting state)
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload(); // Refresh the page
    }, 2000); // Wait for 2 seconds before refreshing
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>
      <div>
        {Array.isArray(sortedOrderItems) && sortedOrderItems.length > 0 ? (
          sortedOrderItems.map((order, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 flex flex-col md:justify-between gap-4"
            >
              {/* Iterate through order items */}
              {order.items.map((item, itemIndex) => {
                // Convert the timestamp to readable date format
                const itemDate = convertTimestampToDate(order.date);
                // console.log("Item data:", item); // Log the item to confirm structure
                return (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between gap-4 py-2 border-b"
                  >
                    {/* Product Image */}
                    <img
                      className="w-16 sm:w-20"
                      src={
                        item?.image && item.image.length > 0
                          ? item.image[0]
                          : "defaultImagePath.jpg"
                      }
                      alt={item?.name || "Product Image"}
                    />
                    {/* Product Details */}
                    <div className="flex-1">
                      <p className="sm:text-base font-medium">
                        {item?.name || "Unnamed Product"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                        <p className="text-lg">
                          {currency}
                          {item?.price || "N/A"}
                        </p>
                        <p>Quantity: {item?.quantity || 0}</p>
                        <p>Size: {item?.size || "N/A"}</p>
                      </div>
                      <p className="mt-2">
                        Date <span className="text-gray-400">{itemDate}</span>{" "}
                        {/* Display the calculated date */}
                      </p>
                      <p className="mt-2">
                        Payment Method:{" "}
                        <span className="text-gray-400">
                          {order.paymentMethod || "Not specified"}
                        </span>
                      </p>
                    </div>
                    {/* Order Status and Track Order Button */}
                    <div className="md:w-1/2 flex justify-between">
                      <div className="flex items-center gap-2">
                        <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                        <p className="text-sm md:text-base">{order.status}</p>
                      </div>
                      <button
                        className="border px-4 py-2 text-sm font-medium rounded-full"
                        onClick={handleTrackOrder} // Attach click handler
                      >
                        {isRefreshing ? "Refreshing..." : "Track Order"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default Order;


