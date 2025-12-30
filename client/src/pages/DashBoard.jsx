import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSideBar from "../components/DashSideBar";
import DashUsers from "../components/DashUsers.jsx";
import MemberDashProfile from "../components/MemberDashProfile.jsx";
export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlparams = new URLSearchParams(location.search);
    const tabFromUrl = urlparams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      setTab('profile'); // Default to profile tab
    }
  }, [location.search]);

  return (
    <>
      <div className="flex flex-col min-h-screen text-white md:flex-row">
        <div className="md:w-56">
          {/* sidebar */}
          <DashSideBar className="custom-sidebar" />
        </div>
        {/* profile */}
        {tab === 'profile' && <MemberDashProfile/>}
        {/* users */}
        {tab === 'users' && <DashUsers />}
      </div>
    </>
  );
}