import { Footer as FlowbiteFooter } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsTwitter, BsLinkedin, BsWhatsapp, BsTiktok } from 'react-icons/bs';

export default function Footer() {
  const currentUrl = window.location.href; // Get current URL for sharing
  const shareText = "Check out Banglar Heshel - The best restaurant management system!";

  // Share Links
  const socialLinks = [
    {
      name: "Facebook",
      icon: BsFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
      color: "hover:text-blue-600"
    },
    {
      name: "Twitter",
      icon: BsTwitter, // Twitter is now X, but icon often remains familiar or use X icon
      url: `https://twitter.com/intent/tweet?url=${currentUrl}&text=${shareText}`,
      color: "hover:text-blue-400"
    },
    {
       name: "LinkedIn",
       icon: BsLinkedin,
       url: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
       color: "hover:text-blue-700"
    },
    {
        name: "WhatsApp",
        icon: BsWhatsapp,
        url: `https://api.whatsapp.com/send?text=${shareText} ${currentUrl}`,
        color: "hover:text-green-500"
    },
    {
      name: "Instagram",
      icon: BsInstagram,
      url: "https://www.instagram.com/", // Web share not standard, linking to home
      color: "hover:text-pink-600"
    },
    {
        name: "TikTok",
        icon: BsTiktok,
        url: "https://www.tiktok.com/",
        color: "hover:text-black"
    }
  ];

  return (
    <FlowbiteFooter container className="text-white bg-gradient-to-r from-[#AC5180] to-[#160121]">
      <div className="w-full max-w-screen-xl p-4 py-6 mx-auto lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="self-center text-2xl font-semibold whitespace-nowrap">
                Banglar Heshel
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase">About</h2>
              <ul className="font-medium">
                <li className="mb-4">
                  <a
                    href="https://www.100jsprojects.com"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Feedback
                  </a>
                </li>
                <li>
                  <Link to="/about" className="hover:underline">
                    Banglar Heshel
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase">Legal</h2>
              <ul className="font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase">Share Us</h2>
              <div className="flex gap-4 sm:grid-cols-3">
                 {socialLinks.map((social) => (
                    <a 
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors duration-300 ${social.color} hover:scale-125`}
                        title={`Share on ${social.name}`}
                    >
                        <social.icon className="w-6 h-6" />
                        <span className="sr-only">{social.name}</span>
                    </a>
                 ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <span className="text-sm">
            © {new Date().getFullYear()} Banglar Heshel. All Rights Reserved.
          </span>
        </div>
      </div>
    </FlowbiteFooter>
  );
}
