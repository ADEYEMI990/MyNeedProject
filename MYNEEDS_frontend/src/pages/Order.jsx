import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';

const Order = () => {
  const { orderItems, currency } = useContext(ShopContext);

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>
      <div>
        {Array.isArray(orderItems) && orderItems.length > 0 ? (
          orderItems.map((item, index) => (
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.image && item.image.length > 0 ? item.image[0] : 'defaultImagePath.jpg'} alt={item.name || 'Product Image'} />
                <div>
                  <p className='sm:text-base font-medium'>{item.name || 'Unnamed Product'}</p>
                  <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                    <p className='text-lg'>{currency}{item.price || 'N/A'}</p>
                    <p>Quantity: {item.quantity || 0}</p>
                    <p>Size: {item.size || 'N/A'}</p>
                  </div>
                  <p className='mt-2'>Date <span className='text-gray-400'>{item.date || 'N/A'}</span></p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                  <p className='text-sm md:text-base'>Ready to ship</p>
                </div>
                <button className='border px-4 py-2 text-sm font-medium rounded-full'>Track Order</button>
              </div>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
}

export default Order;
