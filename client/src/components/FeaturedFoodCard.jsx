import { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineArrowRight } from "react-icons/hi";
import { formatCurrencyWithCode } from "../utils/currency";

export default function FeaturedFoodCard({ food }) {
  const [imageError, setImageError] = useState(false);

  // Fallback image using a reliable placeholder or local asset
  const fallbackImage =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-[#e93b92] transition-all duration-300 hover:shadow-xl h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={
            imageError
              ? fallbackImage
              : food.images?.[0] || food.image || fallbackImage
          }
          alt={food.foodName}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase bg-[#e93b92] rounded-full shadow-lg">
            {food.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="mb-2 text-xl font-bold text-gray-900 line-clamp-1 font-['Poppins'] group-hover:text-[#e93b92] transition-colors">
          {food.foodName}
        </h3>

        <p className="mb-2 text-sm text-gray-600 line-clamp-2 flex-1">
          {food.description}
        </p>

        {/* Stock Status */}
        <div className="mb-4 text-xs font-semibold">
          {food.stock !== undefined &&
            (food.stock > 0 ? (
              <span
                className={food.stock < 10 ? "text-red-500" : "text-green-600"}
              >
                {food.stock < 10
                  ? `Only ${food.stock} left!`
                  : `In Stock: ${food.stock} units`}
              </span>
            ) : (
              <span className="text-red-600 uppercase font-bold">
                Out of Stock
              </span>
            ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            {food.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrencyWithCode(food.oldPrice || food.price * 1.3)}
              </span>
            )}
            <div className="text-[#e93b92] font-bold text-lg">
              {formatCurrencyWithCode(food.price)}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {food.discount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                {food.discount}% OFF
              </span>
            )}
            <Link
              to={`/item/${food._id}`}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 transition-all group-hover:text-[#e93b92] group-hover:translate-x-1"
            >
              Details <HiOutlineArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
