import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'

const About = () => {
  return (
    <div>
      <div className= 'text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className= 'my-10 flex flex-col md:flex-row gap-16'>
        <img className= 'w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className= 'flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>At MyNeeds, fashion is more than just clothing it's a celebrations of individuality and self-expression. Born from a passion for creativity and a love for quality craftsmanship, we set out to redefine the shopping experience. Our journey began with a simple belief: everyone deserves to feel confident and stylish in their own skin.</p>
          <p>Each piece in our collections tells a story, blending timeless designs with contemporary trends. We source sustainable materials and collaborate with talented artisans to ensure every item is crafted with care. Our mission is to empower you to embrace your unique style while making mindful choices.</p>
          <b className= 'text-gray-800'>Our Mission</b>
          <p> Our mission is to curate unique, high-quality pieces that inspire confidence and creativity in every individual. We strive to make fashion accessible, sustainable, and inclusive, celebrating diverse styles and stories. Join us on this journey to redefine your wardrobe and express your authentic self, one outfit at a time. Together, let’s make every day a fashion statement!</p>
        </div>
      </div>

      <div className= 'text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className= 'flex flex-col md:flex-row text-sm mb-20'>
        <div className= 'border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quantity Assurance:</b>
          <p className= 'text-gray-600'>At MyNeeds, quality isn’t just a promise—it’s our passion. Each piece is meticulously crafted, ensuring that every stitch, fabric, and detail meets the highest standards. Our dedicated Quality Assurance team works tirelessly behind the scenes, conducting rigorous inspections and tests, so you can shop with confidence. Because we believe that true style deserves nothing less than excellence.</p>
        </div>
        <div className= 'border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className= 'text-gray-600'>At MyNeeds, we understand that convenience is key in your shopping experience. That’s why we’ve streamlined every step—from effortless browsing to quick checkout and fast shipping. Our user-friendly platform is designed to fit seamlessly into your busy life, so you can find the perfect style without the hassle. With easy returns and dedicated customer support, we’re here to ensure your shopping journey is as enjoyable as your new wardrobe. Fashion should be fun, not stressful!</p>
        </div>
        <div className= 'border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className= 'text-gray-600'>At MyNeeds, we believe that exceptional fashion goes hand in hand with exceptional service. Our dedicated team is here to ensure your shopping experience is seamless and enjoyable, from browsing our latest collections to receiving your order at your doorstep. We’re committed to addressing your needs, answering your questions, and providing personalized support every step of the way. Because at the heart of our brand is you—our valued customer. Experience fashion with a personal touch, and let us turn your shopping dreams into reality!</p>
        </div>
      </div>

      <NewsLetterBox />

    </div>
  )
}

export default About