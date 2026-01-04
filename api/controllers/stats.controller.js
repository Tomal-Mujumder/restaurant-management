import User from "../models/user.model.js";
import FoodItem from "../models/foodCategory.model.js";

export const getPublicStats = async (req, res, next) => {
  try {
    const users = await User.countDocuments();
    const foods = await FoodItem.countDocuments();

    res.status(200).json({
      users,
      foods,
    });
  } catch (error) {
    next(error);
  }
};
