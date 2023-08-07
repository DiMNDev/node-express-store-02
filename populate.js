require("dotenv").config();

const connectDB = require("./db/connect");
const product = require("./models/product");
const Product = require("./models/product");

const jsonProducts = require("./products.json");

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Product.deleteMany();
    await product.create(jsonProducts);
    console.log("SUCCESS!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
