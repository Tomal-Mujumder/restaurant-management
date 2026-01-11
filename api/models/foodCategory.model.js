import mongoose from "mongoose";

const foodCategorySchema = new mongoose.Schema({
  foodId: {
    type: String,
    required: true,
    unique: true,
  },
  foodName: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
    enum: [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Shorties",
      "Drinks",
      "Desserts",
      "Snacks",
    ], // Define the valid categories
  },

  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
  },

  images: {
    type: [String],
    default: [
      "https://i.pinimg.com/originals/2b/f0/e0/2bf0e06f26135c159a64591c817f639e.jpg",
    ],
    validate: {
      validator: function (arr) {
        return arr.length <= 5;
      },
      message: "Maximum 5 images allowed",
    },
  },
});

const FoodItem = mongoose.model("FoodItem", foodCategorySchema);

export default FoodItem;
