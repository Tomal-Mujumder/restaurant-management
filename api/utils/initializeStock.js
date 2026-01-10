import mongoose from "mongoose";
import dotenv from "dotenv";
import FoodItem from "../models/foodCategory.model.js";
import Stock from "../models/stock.model.js";

// Load environment variables
// Adjust path if necessary depending on where this script is run from.
// Assuming run from project root: node api/utils/initializeStock.js
dotenv.config();

const initializeStock = async () => {
  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB.");

    // 2. Fetch all FoodItems
    const foodItems = await FoodItem.find();
    console.log(`Found ${foodItems.length} food items.`);

    let createdCount = 0;
    let existingCount = 0;

    // 3. Loop through each FoodItem
    for (const food of foodItems) {
      // Check if Stock entry exists
      const existingStock = await Stock.findOne({ foodId: food._id });

      if (existingStock) {
        existingCount++;
        // console.log(`Stock already exists for ${food.foodName}`);
        continue;
      }

      // Create Stock with default values
      const newStock = new Stock({
        foodId: food._id,
        quantity: 50, // Default quantity
        unit: "pieces",
        minThreshold: 10,
        maxThreshold: 100,
        costPerUnit: food.price, // Estimated cost (60% of selling price)
        lastRestocked: Date.now(),
      });

      await newStock.save();
      createdCount++;
      console.log(`Created stock for: ${food.foodName}`);
    }

    console.log(`\nInitialization Complete!`);
    console.log(`- Created stock records: ${createdCount}`);
    console.log(`- Existing stock records: ${existingCount}`);
  } catch (error) {
    console.error("Error initializing stock:", error);
  } finally {
    // 5. Disconnect
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit();
  }
};

// Run the function
initializeStock();
