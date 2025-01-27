// import mongoose from "mongoose";

// const connectDB = async () => {

//   mongoose.connection.on('connected',() => {
//     console.log("DB Connected");
//   })

//   await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)
// }

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log("DB Connected");
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;