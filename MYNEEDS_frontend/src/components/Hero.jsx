import React from 'react'
import {assets} from '../assets/assets'
import Slider from "react-slick"

const ImageList = [
  {
    id: 1,
    img: assets.hero_img,
    title: "OUR BESTSELLERS",
    description:
      "Latest Arrivals",
  },
  {
    id: 2,
    img: assets.hero_img1,
    title: "OUR BESTSELLERS",
    description:
      "Latest Arrivals",
  },
  {
    id: 3,
    img: assets.hero_img2,
    title: "OUR BESTSELLERS",
    description:
      "Latest Arrivals",
  },
];

const Hero = () => {

  var settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "ease-in-out",
    pauseOnHover: false,
    pauseOnFocus: true,
  };

  return (
    <div>
      {/* background pattern */}
      <div className= "container pb-8 sm:pb-0">
        <Slider {...settings}>
        {
          ImageList.map((data,index) => (
            <div key={index}>
              <div className= 'flex flex-col sm:flex-row border border-gray-400'>
                {/* text content section */} {/* Hero left side */}
                <div className= 'w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
                <div className= 'text-[#414141]'>
                  <div className= 'flex items-center gap-2'>
                    <p className= 'w-8 md:w-11 h-[2px] bg-[#414141]'></p>
                    <p className= 'font-medium text-sm md:text-base'>{data.title}</p>

                  </div>
                  <h1 className= 'prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>
                  {data.description}
                  </h1>
                  <div className= 'flex items-center gap-2'>
                    <p className= 'font-semibold text-sm md:text-base'>
                      SHOP NOW
                    </p>
                    <p className= 'w-8 md:w-11 h-[2px] bg-[#414141]'></p>
                  </div>
                </div>

                </div>
                {/* Hero right side */} {/* image section */}
                <img src={data.img} className= 'w-full sm:w-1/2' alt="" />
              </div>
            </div>
          ))
        }
        </Slider>
      </div>
    </div>
  )
}

// const Hero = () => {
//   return (
    
//       <div className= 'flex flex-col sm:flex-row border border-gray-400'>
//         {/* Hero left side */}
//         <div className= 'w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
//           <div className= 'text-[#414141]'>
//             <div className= 'flex items-center gap-2'>
//               <p className= 'w-8 md:w-11 h-[2px] bg-[#414141]'></p>
//               <p className= 'font-medium text-sm md:text-base'>OUR BESTSELLERS</p>
//             </div>
//             <h1 className= 'prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>
//               Latest Arrivals
//             </h1>
//             <div className= 'flex items-center gap-2'>
//               <p className= 'font-semibold text-sm md:text-base'>
//                 SHOP NOW
//               </p>
//               <p className= 'w-8 md:w-11 h-[2px] bg-[#414141]'></p>
//             </div>
//           </div>
//         </div>
//         {/* Hero right side */}
//         <img src={assets.hero_img} className= 'w-full sm:w-1/2' alt="" />
//       </div>
    
//   )
// }

export default Hero