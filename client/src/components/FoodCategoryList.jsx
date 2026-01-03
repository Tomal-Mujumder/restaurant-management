import React, { useEffect, useState, useRef } from "react";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useNavigate } from "react-router-dom";
import { formatCurrencyWithCode } from "../utils/currency";
import axios from "axios";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { currencyConfig } from "../config/currency.config";

export default function FoodCategoryList() {
    const [foodItems, setFoodCategories] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setCategoryToDelete] = useState(null);
    const [itemToEdit, setCategoryToEdit] = useState(null);
    const [formData, setFormData] = useState({
        foodName: "",
        description: "",
        category: "Breakfast",
        price: "",
        images: [],
    });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    
    // Gallery State
    const [showGallery, setShowGallery] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

    const filePickerRef = useRef();
    const navigate = useNavigate();

    const fetchFoodCategories = async () => {
        try {
            const response = await fetch("/api/foods/getAllFoods", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            setFoodCategories(data.foodItems);
        } catch (error) {
            console.error("Error fetching food categories:", error);
            Toastify({
                text: "Error fetching food categories!",
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                duration: 3000,
                gravity: "top",
                position: "right",
            }).showToast();
        }
    };

    const deleteFoodCategory = async (id) => {
        try {
            const response = await fetch(`/api/foods/deleteFoods/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                setFoodCategories(foodItems.filter((item) => item._id !== id));
                Toastify({
                    text: "Food category deleted successfully!",
                    backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                }).showToast();
                closeDeleteDialog();
            } else {
                Toastify({
                    text: "Failed to delete food category!",
                    backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                }).showToast();
            }
        } catch (error) {
            console.error("Error deleting food category:", error);
            Toastify({
                text: "Error deleting food category!",
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                duration: 3000,
                gravity: "top",
                position: "right",
            }).showToast();
        }
    };

    const handleEdit = (item) => {
        setCategoryToEdit(item);
        // Handle migration/compatibility: item.image (string) -> item.images (array)
        let images = item.images || [];
        if (images.length === 0 && item.image) {
            images = [item.image];
        }

        setFormData({
            foodName: item.foodName,
            description: item.description,
            category: item.category,
            price: item.price,
            images: images,
        });
        setUploading(false);
        setUploadProgress(0);
        setUploadError(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Image Upload Logic (Duplicated from Form)
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
            data.append('images', file);
        });

        try {
            const res = await axios.post('/api/upload/uploadImages', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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

    // Drag and Drop
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

    const updateFoodCategory = async () => {
        if (uploading) {
            alert("Please wait until images are uploaded.");
            return;
        }

        try {
            const response = await fetch(
                `/api/foods/updateFoods/${itemToEdit._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                Toastify({
                    text: "Food item updated successfully",
                    backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                }).showToast();
                setCategoryToEdit(null);
                fetchFoodCategories();
            } else {
                Toastify({
                    text: "Failed to update food item",
                    backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                }).showToast();
            }
        } catch (error) {
            console.error("Error updating food item:", error);
        }
    };

    const openDeleteDialog = (item) => {
        setCategoryToDelete(item);
        setShowDeleteDialog(true);
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
    };

    const openGallery = (item) => {
        let images = item.images || [];
        if (images.length === 0 && item.image) {
            images = [item.image];
        }
        if (images.length > 0) {
            setGalleryImages(images);
            setCurrentGalleryIndex(0);
            setShowGallery(true);
        }
    };

    const closeGallery = () => {
        setShowGallery(false);
        setGalleryImages([]);
    };

    useEffect(() => {
        fetchFoodCategories();
    }, []);

    const getImageSrc = (item) => {
        if (item.images && item.images.length > 0) return item.images[0];
        return item.image; // Fallback
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Food Categories
            </h2>
            {foodItems.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                    No categories available
                </p>
            ) : (
                <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-16 py-3">
                                <span className="sr-only">Image</span>
                            </th>
                            <th scope="col" className="px-6 py-3">Food Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {foodItems.map((item) => (
                            <tr
                                key={item._id}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                <td className="p-4">
                                    <img
                                        src={getImageSrc(item)}
                                        className="w-16 max-w-full max-h-full md:w-32 cursor-pointer hover:opacity-80 transition-opacity"
                                        alt={item.foodName}
                                        onClick={() => openGallery(item)}
                                    />
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    {item.foodName}
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    {item.category}
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    {item.description}
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    {formatCurrencyWithCode(item.price)}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-700 dark:text-white"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDeleteDialog(item)}
                                        className="px-3 py-2 ml-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-700 dark:text-white"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}


            {/* Edit Form */}
            {itemToEdit && (
                <div className="mt-6 p-4 border rounded bg-gray-50">
                    <h3 className="text-xl font-semibold mb-4">Edit Food Category</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            updateFoodCategory();
                        }}
                    >
                        <div className="grid grid-cols-1 gap-4 text-sm gap-y-2 md:grid-cols-5">
                            <div className="md:col-span-5">
                                <label htmlFor="foodName">Food Name</label>
                                <input
                                    type="text"
                                    name="foodName"
                                    value={formData.foodName}
                                    onChange={handleChange}
                                    className="w-full h-10 px-4 mt-1 border rounded bg-white"
                                    required
                                />
                            </div>

                            <div className="md:col-span-5">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full h-20 px-4 mt-1 border rounded bg-white"
                                    required
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label htmlFor="category">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full h-10 px-4 mt-1 border rounded bg-white"
                                >
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Shorties">Shorties</option>
                                    <option value="Drinks">Drinks</option>
                                    <option value="Desserts">Desserts</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="price">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full h-10 px-4 mt-1 border rounded bg-white"
                                    required
                                />
                            </div>

                            {/* Image Upload for Edit */}
                            <div className="md:col-span-5">
                                <label htmlFor="edit-image">Upload Images (Max 5)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    ref={filePickerRef}
                                    disabled={formData.images.length >= 5 || uploading}
                                    className="w-full h-10 px-4 mt-1 border rounded bg-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Drag and drop thumbnails to reorder.
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
                                    className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700 disabled:opacity-50"
                                    disabled={uploading}
                                >
                                    Update Food Category
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoryToEdit(null)}
                                    className="px-4 py-2 ml-2 font-bold text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}


            {/* Delete dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Are you sure you want to delete this category?
                        </p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => deleteFoodCategory(itemToDelete._id)}
                                className="px-4 py-2 mr-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                            <button
                                onClick={closeDeleteDialog}
                                className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Modal */}
            {showGallery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={closeGallery}>
                   <div className="relative max-w-4xl w-full max-h-screen p-4 flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
                            onClick={closeGallery}
                        >
                            &times;
                        </button>
                        
                        <div className="relative w-full h-96 flex justify-center items-center">
                             {/* Previous Button */}
                             {galleryImages.length > 1 && (
                                <button 
                                    className="absolute left-0 text-white text-5xl p-2 bg-black bg-opacity-20 hover:bg-opacity-50 rounded"
                                    onClick={() => setCurrentGalleryIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                                >
                                    &#8249;
                                </button>
                             )}

                            <img 
                                src={galleryImages[currentGalleryIndex]} 
                                alt={`Gallery ${currentGalleryIndex}`} 
                                className="max-w-full max-h-full object-contain"
                            />

                            {/* Next Button */}
                            {galleryImages.length > 1 && (
                                <button 
                                    className="absolute right-0 text-white text-5xl p-2 bg-black bg-opacity-20 hover:bg-opacity-50 rounded"
                                    onClick={() => setCurrentGalleryIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                                >
                                    &#8250;
                                </button>
                             )}
                        </div>
                        
                        {/* Thumbnails */}
                        <div className="flex gap-2 mt-4 overflow-x-auto">
                            {galleryImages.map((img, idx) => (
                                <img 
                                    key={idx}
                                    src={img}
                                    alt={`Thumb ${idx}`}
                                    className={`w-16 h-16 object-cover cursor-pointer border-2 ${idx === currentGalleryIndex ? 'border-white' : 'border-transparent'}`}
                                    onClick={() => setCurrentGalleryIndex(idx)}
                                />
                            ))}
                        </div>
                   </div>
                </div>
            )}
        </div>
    );
}
