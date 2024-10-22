import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className= 'flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <div className= 'flex mb-2 font-semibold'> 
            <span className= 'text-4xl'>
              MyNeeds<span className= 'text-4xl text-red-700'>.</span>
            </span>

            {/* <img src={assets.logo} className= 'mb-5 w-32' alt="" /> */}
          </div>
          <p className= 'w-full md:2/3 text-gray-600'>
          Shop Your Heart Out: Quality and Style Await!, Where Style Meets Convenience: Discover Your New Favorites!.Elevate Your Everyday: Unique Finds Just a Click Away!, Curated Just for You: Shop the Best in Trend and Quality!,Your One-Stop Shop for All Things Fabulous! ✨.
          </p>
        </div>
        <div>
          <p className= 'text-xl font-medium mb-5'>COMPANY</p>
          <ul className= 'flex flex-col gap-1 text-gray-600'>
            <li>Home</li>
            <li>Abour Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <p className= 'text-xl font-medium mb-5'>GET IN TOUCH </p>
          <ul className= 'flex flex-col gap-1 text-gray-600'>
            <li>+234-706-965-9137</li>
            <li>contact@myneeds.com</li>
          </ul>
        </div>

      </div>
      <div>
        <hr />
        <p className= 'py-5 text-sm text-center'>
          Copyright 2024 @myneeds.com - All Right Reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer