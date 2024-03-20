const mongoose = require("mongoose");
const mongoUrl =process.env.DATABASE
const mongoDb = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
    const fetchedData = await mongoose.connection.db.collection("food_items");
    const data = await fetchedData.find({}).toArray();
    const foodCategory = await mongoose.connection.db.collection("food_category");
    const catData = await foodCategory.find({}).toArray();
    global.food_items = data;
    global.food_category = catData;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = mongoDb;
