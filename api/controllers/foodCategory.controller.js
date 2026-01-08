import FoodItem from "../models/foodCategory.model.js";
import Stock from "../models/stock.model.js";
import { errorHandler } from "../utils/error.js";
import { deleteImageFromCloudinary } from "../utils/cloudinaryHelper.js";

// Function to find food item by ID
export const findFoodById = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const foodItem = await FoodItem.findById(foodId);
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json(foodItem);
  } catch (error) {
    next(error);
  }
};

// Create a new food category
export const createFoodItem = async (req, res, next) => {
  try {
    if (req.user.role !== "Manager" && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to create a food category")
      );
    }

    const { foodId, foodName, description, category, price, images } = req.body;

    if (!foodId || foodId.trim() === "") {
      return next(new Error("Food ID is required"));
    }

    if (!foodName || foodName.trim() === "") {
      return next(new Error("Food name is required"));
    }

    const newFoodItem = new FoodItem({
      foodId,
      foodName,
      description,
      category,
      price,
      images,
    });

    const savedItem = await newFoodItem.save();

    // Auto-create stock entry as requested
    await Stock.create({
      foodId: savedItem._id,
      quantity: 0, // Start with 0, manager will update
      unit: "pieces",
      minThreshold: 10,
      maxThreshold: 100,
    });

    res.status(201).json(savedItem);
  } catch (error) {
    next(error);
  }
};

// Get all food items
// export const getFoodItem = async (req, res, next) => {
//   try {
//     const startIndex = parseInt(req.query.startIndex) || 0;
//     const sortDirection = req.query.order === 'asc' ? 1 : -1;
//     const item = req.query.item;

//     const query = item ? { item } : {};

//     const foodItems = await FoodItem.find(query)
//       .sort({ updatedAt: sortDirection })
//       .skip(startIndex)
//       .exec();

//     if (!foodItems || foodItems.length === 0) {
//       return res.status(404).json({ message: 'No food categories found' });
//     }

//     res.status(200).json({ foodItems });
//   } catch (error) {
//     console.error('Error fetching food categories:', error); // Log the error
//     res.status(500).json({ message: 'Internal server error', error });
//   }
// };

// Delete a food category by ID
export const deleteFoodItem = async (req, res, next) => {
  try {
    // if (!req.user.isAdmin) {
    if (req.user.role !== "Manager" && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to delete this food category")
      );
    }

    const foodItem = await FoodItem.findById(req.params.itemId);
    if (!foodItem) {
      return next(errorHandler(404, "Food item not found"));
    }

    // Delete images from Cloudinary
    if (foodItem.images && foodItem.images.length > 0) {
      for (const imageUrl of foodItem.images) {
        // Skip default image if it's the specific pinimg one, though the helper handles failures gracefully
        if (!imageUrl.includes("pinimg.com")) {
          await deleteImageFromCloudinary(imageUrl);
        }
      }
    }

    await FoodItem.findByIdAndDelete(req.params.itemId);
    res.status(200).json({ message: "Food category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Update a food category by ID
export const updateFoodItem = async (req, res, next) => {
  try {
    // if (!req.user.isAdmin) {
    if (req.user.role !== "Manager" && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to update this food category")
      );
    }

    const { foodId, foodName, description, category, price, images } = req.body;

    const oldFoodItem = await FoodItem.findById(req.params.itemId);
    if (!oldFoodItem) {
      return next(errorHandler(404, "Food item not found"));
    }

    // Cleanup removed images
    if (oldFoodItem.images && oldFoodItem.images.length > 0) {
      const newImages = images || [];
      const imagesToDelete = oldFoodItem.images.filter(
        (img) => !newImages.includes(img)
      );

      for (const imageUrl of imagesToDelete) {
        if (!imageUrl.includes("pinimg.com")) {
          await deleteImageFromCloudinary(imageUrl);
        }
      }
    }

    const updatedItem = await FoodItem.findByIdAndUpdate(
      req.params.itemId,
      {
        $set: {
          foodId,
          foodName,
          description,
          category,
          price,
          images,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

// Get all food items or filter by search query
export const getFoodItem = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const searchQuery = req.query.search || "";

    // Build query object
    const query = {};
    if (searchQuery) {
      query.foodName = { $regex: searchQuery, $options: "i" };
    }

    const foodItems = await FoodItem.find(query)
      .sort({ createdAt: sortDirection })
      .limit(limit);

    // For specific search queries that return no results, we might want to return 404,
    // but for a general "get all" (even with limit), returning an empty array is often valid.
    // However, sticking to the existing pattern:
    if (foodItems.length === 0 && searchQuery) {
      return res.status(404).json({ message: "No food items found" });
    }

    res.status(200).json({ foodItems });
  } catch (error) {
    next(error);
  }
};
