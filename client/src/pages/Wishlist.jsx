import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import { formatCurrency } from "../utils/currency";

const Wishlist = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!currentUser) return;

            try {
                // Get wishlist IDs from local storage
                const wishlistKey = `wishlist_${currentUser._id}`;
                const savedIds = JSON.parse(localStorage.getItem(wishlistKey) || '[]');

                if (savedIds.length === 0) {
                    setWishlistItems([]);
                    setLoading(false);
                    return;
                }

                // Fetch all foods to match against IDs
                // Optimization: In a real app, you'd want an endpoint to fetch specific IDs
                const res = await fetch('/api/foods/getAllFoods'); // Assuming this endpoint exists
                const data = await res.json();

                if (res.ok) {
                    const filteredItems = (data.foodItems || []).filter(item => savedIds.includes(item._id));
                    setWishlistItems(filteredItems);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist items", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [currentUser]);

    const removeFromWishlist = (foodId) => {
        const wishlistKey = `wishlist_${currentUser._id}`;
        let savedIds = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        
        savedIds = savedIds.filter(id => id !== foodId);
        localStorage.setItem(wishlistKey, JSON.stringify(savedIds));
        
        setWishlistItems(prev => prev.filter(item => item._id !== foodId));
        
        Toastify({
            text: "Removed from wishlist",
            backgroundColor: "#ff5f6d",
            duration: 2000
        }).showToast();
        
        // Dispatch storage event to sync other tabs/components if needed
        window.dispatchEvent(new Event("storage")); 
        window.dispatchEvent(new Event("wishlistUpdated")); 
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                 <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className='min-h-screen max-w-6xl mx-auto p-4'>
            <h1 className='text-3xl font-semibold text-center my-8 text-red-700 font-["Kavoon"]'>My Wishlist</h1>
            
            {wishlistItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-xl shadow-inner">
                    <HiOutlineExclamationCircle className='text-6xl text-gray-300 mb-4'/>
                    <p className='text-xl text-gray-500 mb-6'>Your wishlist is empty</p>
                    <Link to="/item">
                        <Button color="failure" pill>
                            Browse Items
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {wishlistItems.map((item) => (
                        <div key={item._id} className="group relative flex flex-col bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                             <div className="relative h-64 overflow-hidden">
                                <img
                                    src={item.images && item.images.length > 0 ? item.images[0] : item.image}
                                    alt={item.foodName}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                            </div>
                            
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                     <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{item.foodName}</h3>
                                     <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200">
                                        {item.foodCategory}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-2xl font-bold text-red-600 font-['Poppins']">
                                        {formatCurrency(item.price)}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link to={`/item/${item._id}`}>
                                            <Button size="xs" color="light" pill>
                                                View
                                            </Button>
                                        </Link>
                                        <Button 
                                            size="xs" 
                                            color="failure" 
                                            pill 
                                            outline
                                            onClick={() => removeFromWishlist(item._id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
