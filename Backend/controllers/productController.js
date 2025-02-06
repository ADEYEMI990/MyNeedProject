import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
// const addProduct = async (req,res) => {
//   try {
    
//     const { name, description, price, category, subCategory, sizes, bestseller } = req.body

//     // Handle image uploads

//     // // const image1 = req.files.image1 && req.files.image1[0]
//     // // const image2 = req.files.image2 && req.files.image2[0]
//     // // const image3 = req.files.image3 && req.files.image3[0]
//     // // const image4 = req.files.image4 && req.files.image4[0]

    

//     // const images = [image1,image2,image3,image4].filter((item)=> item !== undefined)

//     const images = [];
//     for (let i = 1; i <= 4; i++) {
//       const image = req.files[`image${i}`] && req.files[`image${i}`][0];
//       if (image) {
//         images.push(image);
//       }
//     }

//     // Upload images to Cloudinary

//     let imagesUrl = await Promise.all(
//       images.map(async (item) => {
//         try {
//           const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
//           return result.secure_url;
//         } catch (uploadError) {
//           console.error("Cloudinary upload error:", uploadError);
//           throw new Error("Image upload failed");
//         }
//       })
//     );

//      // Prepare product data
//     const productData = {
//       name,
//       description,
//       category,
//       price: Number(price),
//       subCategory,
//       bestseller: bestseller === "true" ? true : false,
//       sizes:JSON.parse(sizes),
//       image:imagesUrl,
//       date:Date.now()
//     }

//     console.log(productData);

//     // Save product to database
//     const product = new productModel(productData);
//     await product.save()


//     res.status(201).json({ success: true, message: "Product Added" })
//   } catch (error) {
//     console.log(error)
//     res.json({success:false, message:error.message})
    
//   }

// }

// function for list product

const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

      // Log the received price
      // console.log("Received price:", price);

    // Validate price
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: "Invalid price value" });
    }

    // Handle image uploads
    const images = [];
    for (let i = 1; i <= 4; i++) {
      const image = req.files[`image${i}`] && req.files[`image${i}`][0];
      if (image) {
        images.push(image);
      }
    }

    // Ensure there are images to upload
    if (images.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    // Upload images to Cloudinary
    // let imagesUrl = await Promise.all(
    //   images.map(async (item) => {
    //     try {
    //       const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
    //       return result.secure_url;
    //     } catch (uploadError) {
    //       console.error("Cloudinary upload error:", uploadError);
    //       throw new Error("Image upload failed");
    //     }
    //   })
    // );

      // Upload images to Cloudinary using the buffer
      let imagesUrl = await Promise.all(
        images.map(async (item) => {
          try {
            const result = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                }
              ).end(item.buffer);
            });
  
            return result;  // return the Cloudinary image URL
          } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            throw new Error("Image upload failed");
          }
        })
      );

    // Prepare product data
    const productData = {
      name,
      description,
      category,
      price: parsedPrice,
      subCategory,
      bestseller: bestseller === "true",
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now(),
    };

    console.log(productData);

    // Save product to database
    const product = new productModel(productData);
    await product.save();

    res.status(201).json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


const listProducts = async (req,res) => {
  try {
    
    const products = await productModel.find({});
    res.json({success:true,products})

  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
  }
  
}

// function for removing product
const removeProduct = async (req,res) => {
  try {
    
    await productModel.findByIdAndDelete(req.body.id)
    res.json({success:true,message:"Product Removed"})

  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
  }

}

// function for single product info
const singleProduct = async (req,res) => {
  try {
    
    const { productId } = req.body
    const product = await productModel.findById(productId)
    res.json({success:true,product})

  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
  }

}

export {addProduct, listProducts, removeProduct, singleProduct}