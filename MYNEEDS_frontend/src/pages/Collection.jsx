import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';


const Collection = () => {

  const { products, search, showSearch } = useContext(ShopContext);
  // const { products } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] =useState([]);
  const [category,setCategory] = useState([]);
  const [subCategory, setSubCategory]=useState([]);
  const [sortType,setSortType] = useState('relevant');

  const toggleCategory = (e) => {
    const value = e.target.value;
    
    if (value && category.includes(value)) {
      setCategory(prev => prev.filter(item => item !== value));
    } else if (value) {
      setCategory(prev => [...prev, value]);
    }
  }
  const toggleSubCategory = (e) => {
    const value = e.target.value;
    
    if (value && subCategory.includes(value)) {
      setSubCategory(prev => prev.filter(item => item !== value));
    } else if (value) {
      setSubCategory(prev => [...prev, value]);
    }
  }

  const applyFilter = () => {
    let productCopy = products.slice()

    if (showSearch && search) {
      productCopy = productCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productCopy = productCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productCopy = productCopy.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productCopy)
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)))
        break;
    
      default:
        applyFilter()
        break;
    }
  }

  // useEffect(()=> {
  //   setFilterProducts(products);
  // },[])   it should be apply before settling up the applyFilter function

  useEffect(()=> {
    applyFilter();
  },[category,subCategory,search,showSearch])

  useEffect(()=> {
    sortProduct();
  },[sortType])

  return (
    <div className= 'flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Options */}
      <div className= 'min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className= 'my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className= {`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        {/* Category Filter */}
        <div className= {`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className= 'mb-3 text-sm font-medium font-medium'>CATEGORIES</p>
          <div className= 'flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className= 'flex gap-2'>
              <input  className= 'w-3' type="checkbox" value={'Men'} onChange={toggleCategory} checked={category.includes('Men')}/> Men
            </p>
            <p className= 'flex gap-2'>
              <input  className= 'w-3' type="checkbox" value={'Women'} onChange={toggleCategory} checked={category.includes('Women')} /> Women
            </p>
            <p className= 'flex gap-2'>
              <input  className= 'w-3' type="checkbox" value={'Kids'} onChange={toggleCategory} checked={category.includes('Kids')}/> Kids
            </p>
          </div>
        </div>
        {/* SubCategory Filter */}
        <div className= {`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className= 'mb-3 text-sm font-medium font-medium'>TYPE</p>
          <div className= 'flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className= 'flex gap-2'>
              <input className= 'w-3' type="checkbox" value={'Topwear'} onChange={toggleSubCategory}/> Topwear
            </p>
            <p className= 'flex gap-2'>
              <input className= 'w-3' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory}/> Bottomwear
            </p>
            <p className= 'flex gap-2'>
              <input className= 'w-3' type="checkbox" value={'Winterwear'} onChange={toggleSubCategory}/> Winterwear
            </p>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className= 'flex-1'>
        <div className= 'flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTION'} />
          {/* product Sort */}
          <select onChange={(e)=>setSortType(e.target.value)} className= 'border-2 border-gray-300 text-sm px-2'>
            <option value="relavant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        {/* Map Products */}
        <div className= 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item,index) =>(
              <div data-aos ="fade-up"
              data-aos-delay={item.aosDelay}
              key={index}
              className= "space-y-3">
                <ProductItem name={item.name} _id={item._id} price={item.price} image={item.image} />
              </div>
              
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Collection