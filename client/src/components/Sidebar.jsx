import React from "react";
import { HiX, HiFilter } from "react-icons/hi";

export default function Sidebar({
  filters,
  setFilters,
  categories,
  minPrice,
  maxPrice,
  isOpen,
  toggleSidebar,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category });
  };

  const handlePriceChange = (e, type) => {
    // Ensure value is a valid number, fallback to appropriate bound
    let value = parseInt(e.target.value);

    if (isNaN(value)) {
      return; // Or handle generically
    }

    const currentMin = filters.priceRange[0];
    const currentMax = filters.priceRange[1];

    if (type === "min") {
      // Optional: Prevent min from crossing max
      // if (value > currentMax) value = currentMax;
      setFilters({
        ...filters,
        priceRange: [value, currentMax],
      });
    } else {
      // Optional: Prevent max from crossing min
      // if (value < currentMin) value = currentMin;
      setFilters({
        ...filters,
        priceRange: [currentMin, value],
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "All",
      priceRange: [minPrice, maxPrice],
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white shadow-xl h-screen transition-all duration-300 ease-in-out z-40 fixed md:relative left-0 top-0 overflow-y-auto overflow-x-hidden
        ${
          isOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full md:translate-x-0 md:w-0"
        }`}
      >
        <div className="p-6 w-72">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <HiFilter className="text-[#e93b92]" />
              Filters
            </h2>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-gray-500 hover:text-[#e93b92] rounded-full hover:bg-pink-50 transition-colors"
            >
              <HiX size={24} />
            </button>
          </div>

          {/* Search Filter */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Search food name..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e93b92] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Categories
            </label>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange("All")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  filters.category === "All"
                    ? "bg-[#e93b92] text-white shadow-md"
                    : "text-gray-600 hover:bg-pink-50 hover:text-[#e93b92]"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    filters.category === cat
                      ? "bg-[#e93b92] text-white shadow-md"
                      : "text-gray-600 hover:bg-pink-50 hover:text-[#e93b92]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Price Range (৳)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Min
                </span>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(e, "min")}
                  min={minPrice}
                  max={filters.priceRange[1]}
                  className="w-full pl-10 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e93b92] transition-all outline-none"
                />
              </div>
              <div className="text-gray-400">-</div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Max
                </span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(e, "max")}
                  min={filters.priceRange[0]}
                  max={maxPrice} // Use global/initial max price here
                  className="w-full pl-10 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e93b92] transition-all outline-none"
                />
              </div>
            </div>

            {/* Simple Visual Range Indicator */}
            <div className="mt-4 px-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e93b92]"
                  style={{
                    marginLeft: `${
                      ((filters.priceRange[0] - minPrice) /
                        (maxPrice - minPrice || 1)) *
                      100
                    }%`,
                    width: `${
                      ((filters.priceRange[1] - filters.priceRange[0]) /
                        (maxPrice - minPrice || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            Reset Filters
          </button>
        </div>
      </aside>
    </>
  );
}
