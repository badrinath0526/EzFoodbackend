const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
const fetch=require("../fetch")

router.post("/foodData", async (req, res) => {
  try {
    res.send([global.food_items,global.food_category]);
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
});

router.post("/orderdata", async (req, res) => {
    try {
        // Extract data from the request body
        const { order_data, email, order_date } = req.body;

        // Check if the required fields are present
        if (!order_data || !email || !order_date) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        // Initialize data as an empty array if it's not already an array
        let data = Array.isArray(order_data) ? order_data : [];

        // Prepend the order_date to the order_data array
        data.unshift({ Order_date: order_date });

        // Remove any undefined img properties from the order_data items
        data = data.map(item => {
            // Filter out undefined img properties
            const { img, ...rest } = item;
            return rest; // Return the item without the img property
        });

        // Find the user's order data
        let userOrder = await Order.findOne({ email });

        // If user's order data doesn't exist, create a new entry
        if (!userOrder) {
            await Order.create({ email, order_data: [data] });
        } else {
            // If user's order data already exists, update the existing entry
            await Order.findOneAndUpdate({ email }, { $push: { order_data: data } });
        }

        // Send a success response
        res.status(200).json({ success: true });
    } catch (error) {
        // Handle any errors that occur during processing
        console.error("Error in /orderdata:", error);
        res.status(500).json({ success: false, error: "Failed to process order data" });
    }
});


  
  router.post("/myorderdata", async (req, res) => {
    try {
      let eId = await Order.findOne({ email: req.body.email });
      if (eId === null) {
        res.json({ orderData: [] }); // Return an empty array if no order data is found
      } else {
        res.json({ orderData: eId.order_data });
      }
    } catch (error) {
      console.error("Error in /myorderdata:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  

module.exports = router;
