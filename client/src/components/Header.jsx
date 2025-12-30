import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaUser, FaShoppingBasket } from "react-icons/fa";
import { signoutSuccess } from "../redux/user/userSlice";
// import { useEffect, useState } from "react"; // Search hooks removed
import logo from "../assets/banglar_heshel_logo_final.png";

export default function Header() {
    const path = useLocation().pathname;
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Cart logic placeholder
    const cartCount = 0; 

    const handleSignout = async () => {
        try {
            const res = await fetch('/api/user/signout', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                console.log(data.message);
            } else {
                dispatch(signoutSuccess());
                navigate(`/`);
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <nav className="bg-[#DC0000] border-b border-red-800 sticky top-0 z-50">
            <div className="flex items-center justify-between px-8 md:px-16 lg:px-24 py-4 mx-auto w-full">
                
                {/* Brand Logo (Left) */}
                <Link to="/" className="flex items-center flex-shrink-0">
                    <img src={logo} alt="logo" className="w-12 h-12 rounded-full object-cover mr-3" />
                    <span className="self-center text-2xl sm:text-3xl whitespace-nowrap text-white font-normal font-['Kavoon'] tracking-wider uppercase">
                        Banglar Heshel
                    </span>
                </Link>

                {/* Center Navigation Links (Always Visible) */}
                <ul className="flex items-center gap-6 md:gap-10 mx-4">
                    <Link to="/">
                        <li className={`text-base md:text-lg font-bold font-['Poppins'] uppercase hover:text-black ${path === '/' ? 'text-black' : 'text-white'}`}>
                            Menu
                        </li>
                    </Link>
                    <Link to="/about">
                        <li className={`text-base md:text-lg font-bold font-['Poppins'] uppercase hover:text-black ${path === '/about' ? 'text-black' : 'text-white'}`}>
                            About
                        </li>
                    </Link>
                    <Link to="/item">
                        <li className={`text-base md:text-lg font-bold font-['Poppins'] uppercase hover:text-black ${path === '/item' ? 'text-black' : 'text-white'}`}>
                            Items
                        </li>
                    </Link>
                </ul>

                {/* Right Side Icons (User & Cart) */}
                <div className="flex items-center gap-6 flex-shrink-0">
                    
                    {/* User Icon / Dropdown */}
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            currentUser ? (
                                <img src={currentUser.profilePicture} alt="user" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                            ) : (
                                <FaUser className="w-6 h-6 text-white hover:text-gray-200" />
                            )
                        }
                    >
                        {currentUser ? (
                             <>
                                <Dropdown.Header>
                                    <span className="block text-sm">@{currentUser.username}</span>
                                    <span className="block text-sm font-medium truncate">{currentUser.email}</span>
                                </Dropdown.Header>
                                <Link to={'/dashboard?tab=profile'}>
                                    <Dropdown.Item>Profile</Dropdown.Item>
                                </Link>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
                            </>
                        ) : (
                            <>
                                <Link to="/signin">
                                    <Dropdown.Item>User Login</Dropdown.Item>
                                </Link>
                                <Link to="/employee-login">
                                    <Dropdown.Item>Admin Login</Dropdown.Item>
                                </Link>
                            </>
                        )}
                    </Dropdown>

                    {/* Cart Icon */}
                    <Link to="/shoppingCart" className="relative text-white hover:text-gray-200">
                        <FaShoppingBasket className="w-7 h-7" />
                        <span className="absolute -top-2 -right-2 bg-[#FFC107] text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {cartCount}
                        </span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
