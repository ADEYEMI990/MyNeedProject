import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Order from './pages/Order'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SeachBar from './components/SeachBar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AOS from "aos";
import "aos/dist/aos.css";
import Verify from './pages/Verify'
import MyProfile from './pages/MyProfile'
// import VerifyPaystack from './pages/VerifyPaystack'

const App = () => {
  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);
  return (
    <div className= 'px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar />
      <SeachBar />
      <Routes>
        <Route path='/'element={<Home/>} />
        <Route path='/collection'element={<Collection/>} />
        <Route path='/about'element={<About/>} />
        <Route path='/contact'element={<Contact/>} />
        <Route path='/product/:productId' element={<Product/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/place-order' element={<PlaceOrder/>} />
        <Route path='/order' element={<Order/>} />
        <Route path='/verify' element={<Verify/>} />
        <Route path='/myprofile' element={<MyProfile/>} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App