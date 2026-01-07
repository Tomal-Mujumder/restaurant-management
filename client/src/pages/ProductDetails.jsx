import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaHeart,
  FaRegHeart,
  FaStar,
} from "react-icons/fa";
import { formatCurrencyWithCode } from "../utils/currency";

export default function ProductDetails() {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [foodItem, setFoodItem] = useState(null);
  const [stock, setStock] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodItem();
    fetchStock();
    fetchReviews();
  }, [foodId]);

  useEffect(() => {
    if (foodItem) {
      fetchRelatedProducts();
      if (foodItem.images && foodItem.images.length > 0) {
        setMainImage(foodItem.images[0]);
        setCurrentImageIndex(0);
      } else if (foodItem.image) {
        setMainImage(foodItem.image);
      }
    }
  }, [foodItem]);

  useEffect(() => {
    if (currentUser && foodItem) {
      const wishlist = JSON.parse(
        localStorage.getItem(`wishlist_${currentUser._id}`) || "[]"
      );
      setIsWishlisted(wishlist.includes(foodItem._id));
    }
  }, [currentUser, foodItem]);

  const fetchFoodItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/foods/${foodId}`);
      if (response.ok) {
        const data = await response.json();
        setFoodItem(data);
      } else {
        setFoodItem(null);
      }
    } catch (error) {
      console.error("Error fetching food item:", error);
      setFoodItem(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStock = async () => {
    try {
      const response = await fetch(`/api/stock/${foodId}`);
      if (response.ok) {
        const data = await response.json();
        setStock(data.quantity);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/${foodId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`/api/foods/getAllFoods`);
      if (response.ok) {
        const data = await response.json();
        // Filter by same category, exclude current item, take first 4
        const related = data.foodItems
          .filter(
            (item) =>
              item.category === foodItem.category && item._id !== foodItem._id
          )
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const handlePrevImage = () => {
    if (!foodItem?.images || foodItem.images.length === 0) return;
    const newIndex =
      (currentImageIndex - 1 + foodItem.images.length) % foodItem.images.length;
    setCurrentImageIndex(newIndex);
    setMainImage(foodItem.images[newIndex]);
  };

  const handleNextImage = () => {
    if (!foodItem?.images || foodItem.images.length === 0) return;
    const newIndex = (currentImageIndex + 1) % foodItem.images.length;
    setCurrentImageIndex(newIndex);
    setMainImage(foodItem.images[newIndex]);
  };

  const handleThumbnailClick = (index) => {
    if (!foodItem?.images) return;
    setCurrentImageIndex(index);
    setMainImage(foodItem.images[index]);
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }

    if (stock < quantity) {
      Toastify({
        text: `Only ${stock} units available`,
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
      return;
    }

    const cartKey = `cart_${currentUser._id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

    // Check if item already exists by comparing ID strings
    const existingItemIndex = cart.findIndex(
      (item) => item.id === foodItem._id
    );

    if (existingItemIndex > -1) {
      if (cart[existingItemIndex].quantity + quantity > stock) {
        Toastify({
          text: `Cannot add more. Only ${stock} units available in total.`,
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();
        return;
      }
      cart[existingItemIndex].quantity += quantity;
    } else {
      const cartItem = {
        id: foodItem._id, // Ensure we use 'id' consistency
        foodName: foodItem.foodName,
        price: foodItem.price,
        quantity: quantity,
        image:
          foodItem.images && foodItem.images.length > 0
            ? foodItem.images[0]
            : foodItem.image,
      };
      cart.push(cartItem);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));

    Toastify({
      text: "Item added to cart!",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      duration: 3000,
      gravity: "top",
      position: "right",
    }).showToast();

    // Dispatch event for header cart updates if listening
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleBuyNow = () => {
    if (stock < quantity) {
      Toastify({
        text: `Only ${stock} units available`,
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
      return;
    }
    handleAddToCart();
    setTimeout(() => {
      navigate("/shoppingCart");
    }, 100);
  };

  const handleWishlist = () => {
    if (!currentUser) {
      Toastify({
        text: "Please login to add to wishlist",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
      return;
    }

    const wishlistKey = `wishlist_${currentUser._id}`;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");

    if (isWishlisted) {
      wishlist = wishlist.filter((id) => id !== foodItem._id);
      Toastify({
        text: "Removed from wishlist",
        backgroundColor: "#ff5f6d",
        duration: 2000,
      }).showToast();
    } else {
      wishlist.push(foodItem._id);
      Toastify({
        text: "Added to wishlist",
        backgroundColor: "#00b09b",
        duration: 2000,
      }).showToast();
    }

    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    setIsWishlisted(!isWishlisted);

    // Dispatch events
    window.dispatchEvent(new Event("wishlistUpdated"));
    window.dispatchEvent(new Event("storage"));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      Toastify({
        text: "Please login to leave a review",
        backgroundColor: "#ff5f6d",
        duration: 3000,
      }).showToast();
      return;
    }

    try {
      const res = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: foodItem._id,
          userId: currentUser._id,
          username: currentUser.username,
          email: currentUser.email,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (res.ok) {
        Toastify({
          text: "Review submitted successfully!",
          backgroundColor: "#00b09b",
          duration: 3000,
        }).showToast();
        setNewReview({ rating: 5, comment: "" });
        fetchReviews();
      } else {
        Toastify({
          text: "Failed to submit review",
          backgroundColor: "#ff5f6d",
          duration: 3000,
        }).showToast();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
        },
      });

      if (response.ok) {
        Toastify({
          text: "Review deleted successfully",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();

        fetchReviews(); // Refresh the reviews list
      } else {
        const data = await response.json();
        Toastify({
          text: data.message || "Failed to delete review",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      Toastify({
        text: "Error deleting review",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
    }
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Check out ${foodItem.foodName} at Banglar Heshel!`
    );

    let shareUrl = "";
    if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={i < rating ? "text-yellow-500" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <div className="text-center py-20 text-xl font-semibold">Loading...</div>
    );
  if (!foodItem)
    return (
      <div className="text-center py-20 text-xl font-semibold text-red-500">
        Food item not found
      </div>
    );

  const images =
    foodItem.images && foodItem.images.length
      ? foodItem.images
      : [foodItem.image];
  const originalPrice = foodItem.price;
  const oldPrice = originalPrice * 1.3;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-amber-500">
          Home
        </Link>{" "}
        /
        <Link to="/item" className="hover:text-amber-500 mx-1">
          Items
        </Link>{" "}
        /<span className="mx-1">{foodItem.category}</span> /
        <span className="text-gray-900 font-semibold mx-1">
          {foodItem.foodName}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Sidebar Thumbnails */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`w-16 h-16 md:w-20 md:h-20 border-2 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 ${
                  currentImageIndex === idx
                    ? "border-amber-500"
                    : "border-transparent"
                }`}
                onClick={() => handleThumbnailClick(idx)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 relative bg-gray-100 rounded-2xl overflow-hidden aspect-square h-[400px] md:h-[500px] flex items-center justify-center group">
            <img
              src={mainImage}
              alt={foodItem.foodName}
              className="max-w-full max-h-full object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &lt;
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &gt;
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {foodItem.foodName}
          </h1>
          <div className="flex items-center gap-2">
            {renderStars(5)}{" "}
            <span className="text-gray-500 text-sm">
              ({reviews.length} reviews)
            </span>
          </div>

          <div className="flex items-end gap-3 my-2">
            <span className="text-xl text-gray-400 line-through">
              {formatCurrencyWithCode(oldPrice)}
            </span>
            <span className="text-3xl font-bold text-red-500">
              {formatCurrencyWithCode(originalPrice)}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <p>
              Category:{" "}
              <span className="font-semibold text-gray-900">
                {foodItem.category}
              </span>
            </p>
            <p>
              ID:{" "}
              <span className="font-semibold text-gray-900">
                {foodItem.foodId || "N/A"}
              </span>
            </p>
            <div className="mt-2 text-base">
              {stock > 0 ? (
                <span
                  className={`font-semibold ${
                    stock < 10 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {stock < 10
                    ? `Only ${stock} left!`
                    : `In Stock: ${stock} units`}
                </span>
              ) : (
                <span className="font-bold text-red-600 text-lg uppercase tracking-wider">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-b py-4 my-2">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  className="px-3 py-1 hover:bg-gray-100 border-r disabled:opacity-50"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={stock === 0 || quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  className="w-12 text-center p-1 outline-none"
                  value={stock === 0 ? 0 : quantity}
                  readOnly
                />
                <button
                  className="px-3 py-1 hover:bg-gray-100 border-l disabled:opacity-50"
                  onClick={() =>
                    setQuantity((prev) => Math.min(stock, prev + 1))
                  }
                  disabled={stock === 0 || quantity >= stock}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                stock === 0
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gray-800 text-white hover:bg-gray-900"
              }`}
            >
              {stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={stock === 0}
              className={`flex-1 border-2 py-3 rounded-lg font-semibold transition-colors ${
                stock === 0
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-800 text-gray-800 hover:bg-gray-50"
              }`}
            >
              Buy This Now!
            </button>
            <button
              onClick={handleWishlist}
              className="p-3 border-2 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
            >
              {isWishlisted ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-xl" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <span className="font-semibold text-sm">Share:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleShare("facebook")}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80"
              >
                <FaFacebookF />
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-80"
              >
                <FaTwitter />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center hover:opacity-80"
              >
                <FaLinkedinIn />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16">
        <div className="flex border-b">
          <button
            className={`px-6 py-4 font-semibold ${
              activeTab === "description"
                ? "border-b-2 border-amber-500 text-amber-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`px-6 py-4 font-semibold ${
              activeTab === "reviews"
                ? "border-b-2 border-amber-500 text-amber-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className="py-8">
          {activeTab === "description" ? (
            <div className="prose max-w-none text-gray-600 leading-relaxed">
              <p>{foodItem.description}</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
              <div className="space-y-6 mb-10">
                {reviews.length === 0 ? (
                  <p className="text-gray-500">
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="border-b pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {review.username}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Delete Button - Only show if user owns review or is admin */}
                        {currentUser &&
                          (currentUser._id === review.userId?._id ||
                            currentUser._id === review.userId ||
                            currentUser.role === "Manager") && (
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="px-3 py-1 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors"
                            >
                              Delete
                            </button>
                          )}
                      </div>
                      <div className="flex mb-2 text-sm">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Review Form */}
              {currentUser ? (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold mb-4">Write a Review</h4>
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block mb-2 font-semibold">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() =>
                              setNewReview({ ...newReview, rating: star })
                            }
                            className="text-2xl focus:outline-none"
                          >
                            <FaStar
                              className={
                                star <= newReview.rating
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2 font-semibold">
                        Your Comment
                      </label>
                      <textarea
                        className="w-full p-3 border rounded-lg h-32"
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comment: e.target.value,
                          })
                        }
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="bg-amber-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-600 transition-transform hover:-translate-y-1"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
                  Please{" "}
                  <Link to="/signin" className="underline font-bold">
                    login
                  </Link>{" "}
                  to write a review.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((item) => (
              <Link
                to={`/item/${item._id}`}
                key={item._id}
                className="group block h-full border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={
                      item.images && item.images.length > 0
                        ? item.images[0]
                        : item.image
                    }
                    alt={item.foodName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-amber-500 transition-colors">
                    {item.foodName}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    {item.category}
                  </div>
                  <div className="font-bold text-red-500">
                    {formatCurrencyWithCode(item.price)}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">
              No related products found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
