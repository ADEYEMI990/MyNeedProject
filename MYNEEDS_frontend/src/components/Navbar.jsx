import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { CiSearch } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { IoCartOutline } from "react-icons/io5";
import { IoIosMenu } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const {setShowSearch, getCartCount, loadingCart, navigate, token, setToken, setCartItems, cartItems} = useContext(ShopContext);

  

  const cartCount = getCartCount(); // This will now handle cases where cartItems is undefined or null
  
  

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
  }

  return (
    <div className= 'flex items-center justify-between py-5 font-medium'>
      <Link to='/'>
        <div className= 'flex'> 
          <span className= 'text-4xl'>
            MyNeeds<span className= 'text-4xl text-red-700'>.</span>
          </span>
        
          {/* <img src={assets.logo} className= 'w-36' alt="" /> */}
        </div>
      </Link>
        
      
      <ul className= 'hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to='/' className= "flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className= 'w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/collection' className= "flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className= 'w-2/4 border-none h-[1.5px] bg-gray-700 hidden ' />
        </NavLink>
        <NavLink to='/about' className= "flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className= 'w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/contact' className= "flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className= 'w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
       
      </ul>

      <div className= 'flex items-center gap-6'>
        {/* <img src={assets.search_icon} className= 'w-5 cursor-pointer' alt="" /> */}
        <CiSearch onClick={()=>setShowSearch(true)} className= 'w-7 h-7 cursor-pointer' />

        <div className= 'group relative'>
          {/* <img src={assets.profile_icon} className= 'w-5 cursor-pointer' alt="" /> */}
           <CgProfile onClick={() => token ? null : navigate('/login')} className= 'w-7 h-7 cursor-pointer' />
          {/* Dropdown menu */}
        {token && 
          <div className= 'group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
            <div className= 'flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
              <p className= 'cursor-pointer hover:text-black'>My Profile</p>
              <p onClick={()=>navigate('/order')} className= 'cursor-pointer hover:text-black'>Orders</p>
              <p onClick={logout} className= 'cursor-pointer hover:text-black'>Logout</p>
            </div>
          </div>}
        </div>
        <Link to='/cart' className= 'relative'>
          {/* <img src={assets.cart_icon} className= 'w-5 min-w-5' alt="" /> */}
          <IoCartOutline className= 'w-7 h-7 cursor-pointer' />

          {/* Cart Count or Loading Spinner */}
          {loadingCart ? (
            <div className= "absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px] flex items-center justify-center">
              <span className= "animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
            </div>
          ) : (
            <p className= 'absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
              {cartCount}
            </p>
          )}

          {/* <p className= 'absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p> */}
        </Link>
        {/* <img onClick={()=> {setVisible(true)}} src={assets.menu_icon} className= 'w-5 cursor-pointer sm:hidden' alt="" /> */}
        <IoIosMenu onClick={()=> {setVisible(true)}} className= 'w-7 h-7 cursor-pointer sm:hidden' />

      </div>

      {/* sidebar menu for small screens */}
      <div className= { `absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className= 'flex flex-col text-gray-600'>
          <div onClick={()=> setVisible(false)} className= 'flex items-center gap-4 p-3 cursor-pointer'>
            {/* <img className= 'h-4 rotate-180' src={assets.dropdown_icon} alt="" /> */}
            <IoIosArrowBack className= 'h-5 ' />

            <p>Back</p>
          </div>
          <NavLink onClick={()=>setVisible(false)} className="py-2 pl-6 border" to='/'>HOME</NavLink>
          <NavLink onClick={()=>setVisible(false)} className="py-2 pl-6 border" to='/collection'>COLLECTION</NavLink>
          <NavLink onClick={()=>setVisible(false)} className="py-2 pl-6 border" to='/about'>ABOUT</NavLink>
          <NavLink onClick={()=>setVisible(false)} className="py-2 pl-6 border" to='/contact'>CONTACT</NavLink>
        </div>
      </div>
    </div>
  )
}

export default Navbar