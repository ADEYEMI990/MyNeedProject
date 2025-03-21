import React, { useContext, useEffect, useState } from 'react'
import Title from './Title';
import ProductItem from './ProductItem';
import { ShopContext } from '../context/ShopContext';

const BestSeller = () => {

    const {products} = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);

    useEffect(() => {
      const bestProduct = products.filter((item) => (item.bestseller));
      setBestSeller(bestProduct.slice(8,13))
      
    },[products])

  return (
    <div className= 'my-10'>
      <div className= 'text-center text-3xl py-8'>
        <Title text1={"BEST"} text2={"SELLERS"} />
        <p data-aos ="fade-up"  className= "w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
        Discover What Everyone’s Talking About! Our Best-Selling Items Await..
        </p>
      </div>
  
      <div className= 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
          bestSeller.map((item,index) => (
            <div data-aos ="fade-up"
            data-aos-delay={item.aosDelay}
            key={index}
            className= "space-y-3">
              <ProductItem key={index} _id={item._id} name={item.name} image={item.image} price={item.price} />
            </div>
            
          ))
          
        }
      </div>
    </div>
  )
}

export default BestSeller