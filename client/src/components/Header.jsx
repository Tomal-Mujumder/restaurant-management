import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaUser, FaShoppingBasket, FaHeart } from "react-icons/fa";
import { signoutSuccess } from "../redux/user/userSlice";
import { useEffect, useState } from "react";
import { MdOutlineShoppingCart } from "react-icons/md";
import logo from "../assets/banglar_heshel_logo_final.png";

export default function Header() {
  const path = useLocation().pathname;
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Cart logic
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateCartCount = () => {
    if (currentUser?._id) {
      const userId = currentUser._id;
      const userCart = JSON.parse(
        localStorage.getItem(`cart_${userId}`) || "[]"
      );
      setCartCount(userCart.length);
    }
  };

  useEffect(() => {
    updateCartCount();

    // Listen for storage changes (when cart is updated from other components)
    window.addEventListener("storage", updateCartCount);

    // Custom event for same-tab updates
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("wishlistUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("wishlistUpdated", updateCartCount);
    };
  }, [currentUser]);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        setCartCount(0);
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
          <img
            src={logo}
            alt="logo"
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          <span className="self-center text-2xl sm:text-3xl whitespace-nowrap text-white font-normal font-['Kavoon'] tracking-wider uppercase">
            Banglar Heshel
          </span>
        </Link>

        {/* Center Navigation Links (Always Visible) */}
        <ul className="flex items-center gap-6 md:gap-10 mx-4">
          <Link to="/">
            <li
              className={`text-base md:text-lg font-bold font-['Poppins'] uppercase hover:text-black ${
                path === "/" ? "text-black" : "text-white"
              }`}
            >
              Menu
            </li>
          </Link>
          <Link to="/about">
            <li
              className={`text-base md:text-lg font-bold font-['Poppins'] uppercase hover:text-black ${
                path === "/about" ? "text-black" : "text-white"
              }`}
            >
              About
            </li>
          </Link>
          <Link to="/item">
            <li
              className={`text-base md:text-lg font-bold font-['Poppins'] uppercase hover:text-black ${
                path === "/item" ? "text-black" : "text-white"
              }`}
            >
              View Menu
            </li>
          </Link>
        </ul>

        {/* Right Side Icons (User & Cart) */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {/* Cart Icon (Visible only to logged-in non-admin/non-manager users) */}
          {currentUser && (
            <Link to="/shoppingCart" className="relative">
              <MdOutlineShoppingCart className="text-3xl text-[#D4D4D4] hover:text-white cursor-pointer" />
              {cartCount > 0 && (
                <div className="absolute flex items-center justify-center w-5 h-5 p-1 text-white bg-red-600 rounded-full -top-2 -right-2">
                  <p className="text-xs font-semibold">{cartCount}</p>
                </div>
              )}
            </Link>
          )}

          {/* Wishlist Icon (Visible only to logged-in users) */}
          {currentUser && (
            <Link to="/wishlist" className="relative">
              <FaHeart className="text-[#D4D4D4] text-2xl hover:text-white cursor-pointer" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* User Icon / Dropdown */}
          <Dropdown
            arrowIcon={false}
            inline
            label={
              currentUser ? (
                <img
                  src={currentUser.profilePicture}
                  alt="user"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <FaUser className="w-6 h-6 text-white hover:text-gray-200" />
              )
            }
          >
            {currentUser ? (
              <>
                <Dropdown.Header>
                  <span className="block text-sm">@{currentUser.username}</span>
                  <span className="block text-sm font-medium truncate">
                    {currentUser.email}
                  </span>
                </Dropdown.Header>
                <Link to={"/dashboard?tab=profile"}>
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
                  <Dropdown.Item>Employee Login</Dropdown.Item>
                </Link>
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}
