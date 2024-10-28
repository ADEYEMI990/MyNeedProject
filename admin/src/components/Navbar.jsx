import React from "react";
import { assets } from "../assets/assets";

const Navbar = () => {
  return (
    <div className= "flex items-center py-2 px-[4%] justify-between">
      <div className= "flex flex-col w-[max(10%,80px)] min-w-[80px] justify-center">
        <span className= "text-4xl">
          MyNeeds<span className= "text-4xl text-red-700">.</span>
        </span>
        <span className= "text-sm sm:text-lg text-red-700 whitespace-nowrap ">
          ADMIN PANEL
        </span>
      </div>
      <button className= "bg-gray-600 text-white rounded-full text-xs sm:text-sm px-8 py-2 mt-0 hover:bg-gray-700">
        Logout
      </button>
    </div>
  );
};

export default Navbar;
