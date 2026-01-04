import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedFoodCard from '../components/FeaturedFoodCard.jsx';
import FoodCardSkeleton from '../components/FoodCardSkeleton.jsx';
import StatCard from '../components/StatCard.jsx';
import { HiOutlineArrowRight, HiOutlineLocationMarker, HiPhone, HiClock } from 'react-icons/hi';
import { MdRestaurantMenu, MdDeliveryDining, MdVerified, MdTableRestaurant } from 'react-icons/md';

import bgImage from '../assets/bg_edited.png';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [stats, setStats] = useState({ users: 0, foods: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [foodsRes, statsRes] = await Promise.all([
        fetch('/api/foods/getAllFoods?limit=6&sort=desc'),
        fetch('/api/stats/public')
      ]);

      const foodsData = await foodsRes.json();
      const statsData = await statsRes.json();

      if (!foodsRes.ok) throw new Error(foodsData.message || 'Failed to fetch foods');
      
      setFeaturedItems(foodsData.foodItems || []);
      
      if (statsRes.ok) {
         setStats(statsData);
      }
      
    } catch (err) {
      console.error("Error fetching home data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <MdRestaurantMenu className="text-4xl text-white" />,
      title: "Authentic Cuisine",
      desc: "Traditional Bengali recipes passed down through generations",
      color: "bg-pink-500",
      lightColor: "bg-pink-100"
    },
    {
      icon: <MdDeliveryDining className="text-4xl text-white" />,
      title: "Fast Delivery",
      desc: "Hot and fresh food delivered right to your doorstep",
      color: "bg-orange-500",
      lightColor: "bg-orange-100"
    },
    {
      icon: <MdVerified className="text-4xl text-white" />,
      title: "Quality Assured",
      desc: "We use only the freshest ingredients daily",
      color: "bg-teal-500",
      lightColor: "bg-teal-100"
    },
    {
      icon: <MdTableRestaurant className="text-4xl text-white" />,
      title: "Easy Booking",
      desc: "Reserve your perfect table in seconds",
      color: "bg-purple-500",
      lightColor: "bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 1. Hero Section */}
      <section 
        className="relative w-full h-screen min-h-[600px] flex items-center justify-center pb-32 bg-center bg-cover bg-fixed"
        style={{ backgroundImage: `linear-gradient(to right bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.05)), url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-white/20"></div> {/* Reduced white fade, slightly darker top for contrast */}
        <div className="container relative px-4 mx-auto text-center z-10">
          <h2 className="mb-4 text-3xl font-light text-white font-['Italianno'] md:text-5xl animate-fade-in-down drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Welcome to
          </h2>
          <h1 className="mb-6 text-6xl font-bold tracking-tight text-white md:text-8xl lg:text-9xl font-['Italianno'] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            Banglar Heshel
          </h1>
          <p className="max-w-xl mx-auto mb-10 text-xl text-white font-medium md:text-2xl drop-shadow-md bg-black/30 backdrop-blur-[4px] rounded-full py-2 px-6 border border-white/20 inline-block">
            Special goodies for you foodies. Experience the true taste of tradition.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 w-full">
            <Link to="/item">
              <button className="px-10 py-4 text-lg font-bold text-white uppercase transition-all bg-[#e93b92] rounded-full hover:bg-[#c92a7b] hover:shadow-[0_0_30px_rgba(233,59,146,0.6)] transform hover:-translate-y-1 ring-4 ring-[#e93b92]/30">
                Order Now
              </button>
            </Link>
            <Link to="/signin">
               <button className="px-10 py-4 text-lg font-bold text-white uppercase transition-all bg-white/10 backdrop-blur-md border-2 border-white rounded-full hover:bg-white hover:text-[#e93b92] hover:shadow-lg transform hover:-translate-y-1">
                Sign In
              </button>
            </Link>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-[30px] h-[50px] rounded-full border-2 border-white/50 flex justify-center p-2 bg-black/20 backdrop-blur-sm">
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* 2. Featured Menu Section */}
      <section className="py-24 bg-gradient-to-b from-white via-pink-50/50 to-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="px-4 py-1 mb-4 text-sm font-bold tracking-wider text-[#e93b92] uppercase bg-pink-100 rounded-full">
              Our Specialties
            </span>
            <h2 className="text-4xl font-bold text-gray-900 font-['Poppins'] mb-4">Popular Dishes</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#e93b92] to-orange-400 rounded-full" />
          </div>

          {error ? (
             <div className="text-center p-10 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-500">Failed to load menu items. Please try again later.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loading 
                ? Array(6).fill(0).map((_, i) => <FoodCardSkeleton key={i} />)
                : featuredItems.map((food) => (
                    <FeaturedFoodCard key={food._id} food={food} />
                  ))
              }
            </div>
          )}

          {!loading && !error && featuredItems.length === 0 && (
             <div className="text-center text-gray-500 py-10">No items found.</div>
          )}

          <div className="mt-16 text-center">
            <Link to="/item">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-[#e93b92] uppercase transition-all bg-white border-2 border-[#e93b92] rounded-full hover:bg-[#e93b92] hover:text-white hover:shadow-lg shadow-pink-100">
                View Full Menu <HiOutlineArrowRight />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
        
        <div className="container px-4 mx-auto max-w-7xl relative">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-['Poppins']">Why People Love Us</h2>
             <p className="mt-4 text-gray-500 max-w-2xl mx-auto">We don't just serve food; we serve memories with a side of joy.</p>
           </div>
           
           <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
             {features.map((feature, index) => (
               <div key={index} className="group p-8 text-center transition-all bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-2">
                 <div className={`inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl ${feature.color} shadow-lg shadow-${feature.color.split('-')[1]}-200 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {feature.icon}
                 </div>
                 <h3 className="mb-3 text-xl font-bold text-gray-800">{feature.title}</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* 4. Statistics Section */}
      <section className="py-20 bg-[#160121] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4c0042] to-[#160121] opacity-90" />
        
        {/* Colorful Gradients in background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e93b92] rounded-full mix-blend-overlay filter blur-[80px] opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFC107] rounded-full mix-blend-overlay filter blur-[80px] opacity-30 animate-pulse delay-1000" />

        <div className="container relative px-4 mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 divide-x divide-white/5">
            <StatCard label="Happy Customers" value={stats.users} />
            <StatCard label="Menu Items" value={stats.foods} />
            <StatCard label="Years of Service" value={5} />
            <StatCard label="Awards Won" value={10} />
          </div>
        </div>
      </section>

      {/* 5. Location & Hours */}
      <section className="py-24 bg-gray-50">
        <div className="container px-4 mx-auto max-w-6xl">
           <div className="flex flex-col gap-12 lg:flex-row">
             {/* Locations */}
             <div className="flex-1 space-y-8">
               <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-8 border-[#e93b92] pl-6">Find Us</h2>
               
               {[
                 { title: "Restaurant", address: "2/1, Alauddin tower, East Rampura, DIT Road", bg: "bg-pink-50", iconColor: "text-pink-500", borderColor: "border-pink-200" },
                 { title: "Cafe", address: "257 West Rampura, DIT Road", bg: "bg-purple-50", iconColor: "text-purple-500", borderColor: "border-purple-200" },
                 { title: "Express", address: "25/B 3rd Floor, MANAMA MW Heights", bg: "bg-orange-50", iconColor: "text-orange-500", borderColor: "border-orange-200" }
               ].map((loc, idx) => (
                 <div key={idx} className={`flex items-start gap-4 p-5 rounded-xl border ${loc.borderColor} ${loc.bg} hover:shadow-md transition-shadow`}>
                   <div className={`mt-1 text-2xl ${loc.iconColor}`}><HiOutlineLocationMarker /></div>
                   <div>
                     <h4 className="text-lg font-bold text-gray-900">{loc.title}</h4>
                     <p className="text-gray-600 mt-1">{loc.address}</p>
                   </div>
                 </div>
               ))}
             </div>

             {/* Hours & Contact */}
             <div className="flex-1 space-y-8 lg:pl-12 lg:border-l-2 border-dashed border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-8 border-[#FFC107] pl-6">Opening Hours</h2>
                
                <div className="flex gap-6 items-center p-8 bg-white rounded-2xl border border-yellow-100 shadow-[0_4px_20px_rgb(255,193,7,0.1)] hover:-translate-y-1 transition-transform">
                   <div className="p-4 bg-yellow-100 text-[#FFC107] rounded-full text-3xl"><HiClock /></div>
                   <div>
                     <h4 className="text-xl font-bold text-gray-900">Everyday</h4>
                     <p className="text-gray-600 font-medium">11:00 am – 10:30 pm</p>
                   </div>
                </div>

                <div className="flex gap-6 items-center p-8 bg-white rounded-2xl border border-teal-100 shadow-[0_4px_20px_rgb(0,176,155,0.1)] hover:-translate-y-1 transition-transform">
                   <div className="p-4 bg-teal-100 text-[#00b09b] rounded-full text-3xl"><HiPhone /></div>
                   <div>
                     <h4 className="text-xl font-bold text-gray-900">Call for Reservation</h4>
                     <p className="text-gray-600 font-medium tracking-wide">01877-771188</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* 6. Contact/CTA Section */}
      <section className="py-28 text-center relative overflow-hidden bg-gradient-to-br from-[#e93b92] to-purple-700">
         {/* Abstract Shapes */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/prism.png')]"></div>
         
         <div className="container relative px-4 mx-auto max-w-4xl">
            <h2 className="mb-6 text-4xl font-bold text-white md:text-6xl drop-shadow-sm font-['Poppins']">Ready to Taste the Magic?</h2>
            <p className="mb-10 text-xl text-pink-100 max-w-2xl mx-auto">Join thousands of happy foodies experiencing the authentic taste of Bengal. Order online or book your table today.</p>
            
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/item">
                <button className="px-12 py-4 text-lg font-bold text-[#e93b92] bg-white rounded-full shadow-2xl hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-white/20">
                  Start Ordering Now
                </button>
              </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
