import { useState } from "react";
import {
  FaCalendarAlt,
  FaUtensils,
  FaUser,
  FaPhone,
  FaClipboardList,
  FaClock,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    partySize: 2,
    reservationDate: "",
    reservationTime: "11:00 AM",
    specialRequests: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const timeSlots = [];
  const startHour = 11;
  const endHour = 22; // 10 PM

  for (let i = startHour; i <= endHour; i++) {
    const hour = i > 12 ? i - 12 : i;
    const ampm = i >= 12 ? "PM" : "AM";
    timeSlots.push(`${hour}:00 ${ampm}`);
    if (i !== endHour || (i === endHour && 30 <= 30)) {
      // Add 10:30 PM
      timeSlots.push(`${hour}:30 ${ampm}`);
    }
  }
  // Adjust logic to strictly match 11:00 AM - 10:30 PM
  // The loop above adds 11:00 AM to 10:30 PM correctly except for the edge case logic, simplifying strictly:
  const generateTimeSlots = () => {
    const slots = [];
    let currentHour = 11;
    let currentMinute = 0;

    while (currentHour < 22 || (currentHour === 22 && currentMinute <= 30)) {
      const ampm = currentHour >= 12 ? "PM" : "AM";
      let displayHour = currentHour > 12 ? currentHour - 12 : currentHour;
      const displayMinute = currentMinute === 0 ? "00" : "30";
      slots.push(`${displayHour}:${displayMinute} ${ampm}`);

      if (currentMinute === 0) {
        currentMinute = 30;
      } else {
        currentMinute = 0;
        currentHour++;
      }
    }
    return slots;
  };
  const availableTimeSlots = generateTimeSlots();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.phoneNumber.length !== 11) {
      Toastify({
        text: "Phone number must be exactly 11 digits",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reservation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setShowModal(true);

      setFormData({
        customerName: "",
        email: "",
        phoneNumber: "",
        partySize: 2,
        reservationDate: "",
        reservationTime: "11:00 AM",
        specialRequests: "",
      });
    } catch (error) {
      Toastify({
        text: error.message,
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-[#AC5180] to-[#160121] p-8 rounded-2xl shadow-2xl text-white">
      <h2 className="text-3xl font-bold text-center mb-6 font-['Poppins']">
        Reserve Your Table
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1 pl-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-pink-300" />
            </div>
            <input
              type="text"
              id="customerName"
              placeholder="John Doe"
              required
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
              value={formData.customerName}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1 pl-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-pink-300 font-bold">@</span>
            </div>
            <input
              type="email"
              id="email"
              placeholder="john@example.com"
              required
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Phone & Party Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 pl-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-pink-300 transform flip-horizontal" />
              </div>
              <input
                type="text"
                id="phoneNumber"
                placeholder="01712345678"
                required
                pattern="\d{11}"
                title="Please enter exactly 11 digits"
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 pl-1">
              Party Size
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUtensils className="text-pink-300" />
              </div>
              <input
                type="number"
                id="partySize"
                min="1"
                max="20"
                required
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
                value={formData.partySize}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 pl-1">Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-pink-300" />
              </div>
              <input
                type="date"
                id="reservationDate"
                min={today}
                required
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
                value={formData.reservationDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 pl-1">Time</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaClock className="text-pink-300" />
              </div>
              <select
                id="reservationTime"
                required
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-white placeholder-gray-400 outline-none transition-all appearance-none"
                value={formData.reservationTime}
                onChange={handleChange}
              >
                {availableTimeSlots.map((time, idx) => (
                  <option key={idx} value={time} className="text-gray-900">
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium mb-1 pl-1">
            Special Requests (Optional)
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <FaClipboardList className="text-pink-300" />
            </div>
            <textarea
              id="specialRequests"
              rows="3"
              placeholder="Allergies, high chair needed, etc."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-white placeholder-gray-400 outline-none transition-all resize-none"
              value={formData.specialRequests}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3 bg-[#e93b92] text-white font-bold rounded-full shadow-lg hover:bg-[#c92a7b] hover:shadow-[0_0_20px_rgba(233,59,146,0.5)] transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Booking...
            </>
          ) : (
            "Confirm Reservation"
          )}
        </button>
      </form>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up">
            {/* Gradient Details */}
            <div className="h-2 bg-gradient-to-r from-[#AC5180] via-[#FFC107] to-[#160121]"></div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FaCheckCircle className="text-5xl text-green-500" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-gray-900 font-['Poppins']">
                Reservation Received!
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Thank you for choosing us! Our team will contact you shortly to
                confirm your table and ensure everything is perfect for your
                visit.
              </p>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-[#e93b92] text-white font-bold rounded-xl shadow-md hover:bg-[#c92a7b] transition-all transform hover:-translate-y-1"
              >
                Okay, Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
