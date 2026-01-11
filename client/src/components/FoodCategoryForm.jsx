import React, { useState, useEffect, useRef } from "react";
import Toastify from "toastify-js";
import axios from "axios";
import "toastify-js/src/toastify.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { currencyConfig } from "../config/currency.config";

export default function FoodCategoryForm() {
  const [formData, setFormData] = useState({
    foodId: "",
    foodName: "",
    description: "",
    category: "Breakfast",
    price: "",
    discount: 0,
    images: [],
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const filePickerRef = useRef();

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      validateAndUpload(files);
    }
  };

  const validateAndUpload = (files) => {
    if (formData.images.length + files.length > 5) {
      Toastify({
        text: "Maximum 5 images allowed!",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        Toastify({
          text: `File ${file.name} exceeds 2MB!`,
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      uploadImages(validFiles);
    }
  };

  const uploadImages = async (files) => {
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    const data = new FormData();
    files.forEach((file) => {
      data.append("images", file);
    });

    try {
      const res = await axios.post("/api/upload/uploadImages", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress.toFixed(0));
        },
      });

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...res.data.urls],
      }));
      setUploading(false);
      setUploadProgress(0);

      Toastify({
        text: "Images uploaded successfully!",
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();

      // Clear file input
      if (filePickerRef.current) {
        filePickerRef.current.value = "";
      }
    } catch (error) {
      setUploadError("Error uploading images. Please try again.");
      setUploading(false);
      Toastify({
        text: "Error uploading images!",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
      console.error(error);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    if (draggedItemIndex === null) return;

    const newImages = [...formData.images];
    const draggedItem = newImages[draggedItemIndex];
    newImages.splice(draggedItemIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setFormData({ ...formData, images: newImages });
    setDraggedItemIndex(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) {
      alert("Please wait until images are uploaded.");
      return;
    }

    try {
      const discount = parseFloat(formData.discount) || 0;
      const price = parseFloat(formData.price);
      let oldPrice;

      if (discount > 0) {
        oldPrice = price / (1 - discount / 100);
      } else {
        oldPrice = price * 1.3;
      }

      const finalFormData = {
        ...formData,
        oldPrice: parseFloat(oldPrice.toFixed(2)),
        discount: discount,
      };

      const response = await fetch("/api/foods/createFood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      });

      if (response.ok) {
        Toastify({
          text: "Food item created successfully!",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();

        setFormData({
          foodId: "",
          foodName: "",
          description: "",
          category: "Breakfast",
          price: "",
          discount: 0,
          images: [],
        });
        setUploadProgress(0);
      } else {
        Toastify({
          text: "Failed to create food item!",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();
      }
    } catch (error) {
      console.error("Error creating food item:", error);
      Toastify({
        text: "Error occurred while creating food item!",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="container max-w-screen-lg mx-auto">
        <div className="p-8 mb-6 bg-white rounded shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-600">
            Food Adding Form
          </h2>
          <p className="mb-6 text-gray-500">
            Please fill out the form below to create a new food category.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 text-sm gap-y-2 md:grid-cols-5">
              <div className="md:col-span-5">
                <label htmlFor="foodId">Food ID (Unique)</label>
                <input
                  type="text"
                  name="foodId"
                  value={formData.foodId}
                  onChange={handleChange}
                  placeholder="e.g., FOOD001, BBQ-CHICKEN-01"
                  className="w-full h-10 px-4 mt-1 border rounded bg-gray-50"
                  required
                />
              </div>

              <div className="md:col-span-5">
                <label htmlFor="foodName">Food Name</label>
                <input
                  type="text"
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleChange}
                  placeholder="Enter food name"
                  className="w-full h-10 px-4 mt-1 border rounded bg-gray-50"
                  required
                />
              </div>

              <div className="md:col-span-5">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="w-full h-20 px-4 mt-1 border rounded bg-gray-50"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label htmlFor="category">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-10 px-4 mt-1 border rounded bg-gray-50"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Shorties">Shorties</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="price">Price ({currencyConfig.code})</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={`Enter price in ${currencyConfig.code}`}
                  className="w-full h-10 px-4 mt-1 border rounded bg-gray-50"
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label htmlFor="discount">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full h-10 px-4 mt-1 border rounded bg-gray-50"
                />
              </div>

              <div className="md:col-span-5">
                <label htmlFor="image">Upload Images (Max 5)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  ref={filePickerRef}
                  disabled={formData.images.length >= 5 || uploading}
                  className="w-full h-10 px-4 mt-1 border rounded bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can select multiple images. Drag and drop thumbnails to
                  reorder.
                </p>
              </div>

              {/* Image Previews */}
              <div className="md:col-span-5 flex flex-wrap gap-4 mt-2">
                {formData.images.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 border rounded overflow-hidden cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-700"
                      title="Remove"
                    >
                      ✕
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {uploading && (
                <div className="flex justify-center md:col-span-5 items-center gap-2">
                  <div style={{ width: 40, height: 40 }}>
                    <CircularProgressbar
                      value={uploadProgress}
                      text={`${uploadProgress}%`}
                      strokeWidth={5}
                    />
                  </div>
                  <span className="text-gray-600">Uploading images...</span>
                </div>
              )}

              {uploadError && (
                <p className="text-red-500 error md:col-span-5">
                  {uploadError}
                </p>
              )}

              <div className="text-right md:col-span-5 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Create Food Category"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
