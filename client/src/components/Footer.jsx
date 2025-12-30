import { Footer as FlowbiteFooter } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsTwitterX, BsLinkedin, BsYoutube, BsTiktok } from 'react-icons/bs';

export default function Footer() {
  return (
    <FlowbiteFooter container className="text-white bg-[#111111] border-t-2 border-[#AC5180]">
      <div className="w-full max-w-screen-xl p-4 py-6 mx-auto lg:py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Column 1: Book A Table */}
            <div>
                <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-white">Book A Table</h2>
                <p className="mb-2 text-gray-400 text-sm">Save time with proper planning</p>
                <p className="text-3xl font-bold text-[#FFC107]">01537500439</p>
            </div>

            {/* Column 2: Opening Hours */}
            <div>
                <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-white">Opening Hours</h2>
                <p className="text-gray-400 text-sm">Everyday: 11:00 am – 10:30 pm</p>
            </div>

            {/* Column 3: Useful Links */}
            <div>
                <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-white">Useful Links</h2>
                <ul className="text-gray-400 font-medium space-y-2 text-sm">
                    <li>
                        <Link to="/privacy-policy" className="hover:text-[#FFC107] hover:underline">Privacy Policy</Link>
                    </li>
                    <li>
                        <Link to="/order-tracking" className="hover:text-[#FFC107] hover:underline">Order Tracking</Link>
                    </li>
                     <li>
                        <Link to="/faq" className="hover:text-[#FFC107] hover:underline">FAQ</Link>
                    </li>
                </ul>
            </div>

            {/* Column 4: Address */}
             <div>
                <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-white">Address</h2>
                <div className="text-gray-400 text-sm space-y-3">
                    <p><span className="text-white font-semibold">Restaurant</span> | 2/1, Alauddin tower, Lift 2, East Rampura, DIT Road, Dhaka, 1219, Dhaka, Bangladesh</p>
                </div>
            </div>
        </div>

        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
             {/* Brand */}
            <div className="mb-4 sm:mb-0">
                 <Link to="/" className="flex items-center">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                        Banglar Heshel
                    </span>
                </Link>
            </div>
            
            {/* Copyright */}
             <div className="mb-4 sm:mb-0">
                <span className="text-sm text-gray-400 sm:text-center">
                    © {new Date().getFullYear()} Banglar Heshel. All Rights Reserved.
                </span>
            </div>

            {/* Socials */}
            <div className="flex space-x-6 sm:justify-center">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="Facebook">
                    <BsFacebook className="w-5 h-5" />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="Instagram">
                    <BsInstagram className="w-5 h-5" />
                    <span className="sr-only">Instagram</span>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="X (Twitter)">
                    <BsTwitterX className="w-5 h-5" />
                    <span className="sr-only">X (Twitter)</span>
                  </a>
                  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="LinkedIn">
                    <BsLinkedin className="w-5 h-5" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                  <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="YouTube">
                    <BsYoutube className="w-5 h-5" />
                    <span className="sr-only">YouTube</span>
                  </a>
                  <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="TikTok">
                    <BsTiktok className="w-5 h-5" />
                    <span className="sr-only">TikTok</span>
                  </a>
            </div>
        </div>
      </div>
    </FlowbiteFooter>
  );
}
