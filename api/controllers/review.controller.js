import Review from "../models/review.model.js";
import { errorHandler } from "../utils/error.js";

export const createReview = async (req, res, next) => {
  try {
    const { foodId, userId, username, email, rating, comment } = req.body;

    if (!foodId || !userId || !username || !email || !rating || !comment) {
      return next(errorHandler(400, "All fields are required"));
    }

    if (rating < 1 || rating > 5) {
      return next(errorHandler(400, "Rating must be between 1 and 5"));
    }

    const newReview = new Review({
      foodId,
      userId,
      username,
      email,
      rating,
      comment,
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
};

export const getReviewsByFoodId = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const reviews = await Review.find({ foodId })
      .populate("userId", "username email photoUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return next(errorHandler(404, "Review not found"));
    }

    // Check ownership (userId matches or isAdmin/Manager logic if applicable)
    // Assuming req.user is populated by verifyToken middleware
    // For now, allow if userId matches or if user role is Manager/internal logic

    if (
      req.user.id !== review.userId.toString() &&
      req.user.role !== "Manager" &&
      !req.user.isAdmin
    ) {
      return next(
        errorHandler(403, "You are not allowed to delete this review")
      );
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.status(200).json("Review has been deleted");
  } catch (error) {
    next(error);
  }
};
