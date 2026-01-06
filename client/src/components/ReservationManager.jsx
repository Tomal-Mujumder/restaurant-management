import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEdit,
  FaTimesCircle,
  FaExclamationTriangle,
  FaTimes,
  FaFileDownload,
  FaSearch,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReservationManager = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit/Cancel Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [editFormData, setEditFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    partySize: 2,
    reservationDate: "",
    reservationTime: "",
    specialRequests: "",
    status: "",
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Time slots for edit form
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

  // Fetch all reservations
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reservation/all");
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
        setError(null);
      } else {
        throw new Error("Failed to fetch reservations");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setError("Failed to load reservations.");
      toast.error("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Handle status change via checkbox
  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "confirmed" ? "pending" : "confirmed";
    try {
      const response = await fetch(`/api/reservation/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedReservation = await response.json();
      setReservations((prev) =>
        prev.map((res) => (res._id === id ? updatedReservation : res))
      );
      toast.success(`Reservation marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Failed to update reservation status");
      fetchReservations();
    }
  };

  // Open Edit Modal
  const handleEditClick = (reservation) => {
    setSelectedReservation(reservation);
    setEditFormData({
      customerName: reservation.customerName,
      email: reservation.email,
      phoneNumber: reservation.phoneNumber,
      partySize: reservation.partySize,
      reservationDate: new Date(reservation.reservationDate)
        .toISOString()
        .split("T")[0],
      reservationTime: reservation.reservationTime,
      specialRequests: reservation.specialRequests || "",
      status: reservation.status,
    });
    setShowEditModal(true);
  };

  // Open Cancel Modal
  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  // Handle Edit Form Change
  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Submit Edit Form
  const handleUpdateReservation = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    if (editFormData.phoneNumber.length !== 11) {
      toast.error("Phone number must be exactly 11 digits");
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/reservation/update/${selectedReservation._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update reservation");
      }

      const updatedReservation = await response.json();
      setReservations((prev) =>
        prev.map((res) =>
          res._id === selectedReservation._id ? updatedReservation : res
        )
      );
      toast.success("Reservation updated successfully!");
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm Cancellation
  const handleConfirmCancel = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/reservation/update/${selectedReservation._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel reservation");
      }

      const updatedReservation = await response.json();
      setReservations((prev) =>
        prev.map((res) =>
          res._id === selectedReservation._id ? updatedReservation : res
        )
      );
      toast.success("Reservation cancelled successfully!");
      setShowCancelModal(false);
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
            Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
            Pending
          </span>
        );
    }
  };

  // Stats calculation
  const totalReservations = reservations.length;
  const pendingCount = reservations.filter(
    (r) => r.status === "pending"
  ).length;
  const confirmedCount = reservations.filter(
    (r) => r.status === "confirmed"
  ).length;
  const cancelledCount = reservations.filter(
    (r) => r.status === "cancelled"
  ).length;

  // Generate Daily Report
  const generateDailyReport = () => {
    const todayStr = new Date().toLocaleDateString(); // Local date string for comparison
    // Filter for today's confirmed reservations
    const dailyReservations = reservations.filter((res) => {
      const resDate = new Date(res.reservationDate).toLocaleDateString();
      return res.status === "confirmed" && resDate === todayStr;
    });

    if (dailyReservations.length === 0) {
      toast.info("No confirmed reservations found for today.");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Daily Reservation Report - ${todayStr}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("Confirmed Bookings Only", 14, 30);

    // Table Data
    const tableColumn = [
      "Time",
      "Customer Name",
      "Contact",
      "Party",
      "Special Requests",
    ];
    const tableRows = [];

    // Sort by time
    dailyReservations.sort((a, b) => {
      // Simple time string comparison might fail for AM/PM mixed, best to use date object if possible
      // But our reservationTime is a string "11:00 AM". Let's rely on basic sort or the already sorted list if robust.
      // Re-sorting by date object for safety
      return new Date(a.reservationDate) - new Date(b.reservationDate);
    });

    dailyReservations.forEach((res) => {
      const rowData = [
        res.reservationTime,
        res.customerName,
        `${res.phoneNumber}`,
        res.partySize,
        res.specialRequests || "-",
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [22, 163, 74] }, // Green header
    });

    doc.save(`reservations_${todayStr.replace(/\//g, "-")}.pdf`);
    toast.success("Daily report downloaded successfully!");
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 bg-gray-100">
      <div className="w-full max-w-7xl p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Reservation Management
          </h1>
          <button
            onClick={generateDailyReport}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md"
          >
            <FaFileDownload className="mr-2" />
            Download Today's Report
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by customer name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
            <h3 className="text-xl font-bold text-blue-700">
              {totalReservations}
            </h3>
            <p className="text-gray-600">Total Reservations</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
            <h3 className="text-xl font-bold text-yellow-700">
              {pendingCount}
            </h3>
            <p className="text-gray-600">Pending</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <h3 className="text-xl font-bold text-green-700">
              {confirmedCount}
            </h3>
            <p className="text-gray-600">Confirmed</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
            <h3 className="text-xl font-bold text-red-700">{cancelledCount}</h3>
            <p className="text-gray-600">Cancelled</p>
          </div>
        </div>

        {loading && <p className="text-center py-4">Loading reservations...</p>}
        {error && <p className="text-center py-4 text-red-500">{error}</p>}

        {!loading && !error && reservations.length === 0 && (
          <p className="text-center py-4 text-gray-500">
            No reservations found.
          </p>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-collapse border-gray-300 min-w-[1000px]">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">
                    Party
                  </th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">
                    Date & Time
                  </th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">
                    Special Requests
                  </th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700 text-center">
                    Completed
                  </th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations
                  .filter((res) => {
                    const query = searchQuery.toLowerCase();
                    return (
                      res.customerName.toLowerCase().includes(query) ||
                      res.email.toLowerCase().includes(query) ||
                      res.phoneNumber.includes(query)
                    );
                  })
                  .sort(
                    (a, b) =>
                      new Date(b.reservationDate) - new Date(a.reservationDate)
                  )
                  .map((res) => (
                    <tr
                      key={res._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 border border-gray-300 font-medium">
                        {res.customerName}
                      </td>
                      <td className="p-3 border border-gray-300">
                        <div className="text-sm">{res.email}</div>
                        <div className="text-sm text-gray-500">
                          {res.phoneNumber}
                        </div>
                      </td>
                      <td className="p-3 border border-gray-300 text-center">
                        {res.partySize}
                      </td>
                      <td className="p-3 border border-gray-300">
                        <div className="font-medium">
                          {new Date(res.reservationDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {res.reservationTime}
                        </div>
                      </td>
                      <td className="p-3 border border-gray-300 text-sm italic text-gray-600 max-w-xs truncate">
                        {res.specialRequests || "-"}
                      </td>
                      <td className="p-3 border border-gray-300">
                        {getStatusBadge(res.status)}
                      </td>
                      <td className="p-3 border border-gray-300 text-center">
                        <input
                          type="checkbox"
                          checked={res.status === "confirmed"}
                          onChange={() =>
                            handleStatusChange(res._id, res.status)
                          }
                          disabled={res.status === "cancelled"}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="p-3 border border-gray-300 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(res)}
                            disabled={res.status === "cancelled"}
                            className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            title="Edit Reservation"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleCancelClick(res)}
                            disabled={res.status === "cancelled"}
                            className="p-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            title="Cancel Reservation"
                          >
                            <FaTimesCircle />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Reservation Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateReservation} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={editFormData.customerName}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={handleEditFormChange}
                    required
                    maxLength={11}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Size
                  </label>
                  <input
                    type="number"
                    name="partySize"
                    value={editFormData.partySize}
                    onChange={handleEditFormChange}
                    required
                    min={1}
                    max={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="reservationDate"
                    value={editFormData.reservationDate}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <select
                    name="reservationTime"
                    value={editFormData.reservationTime}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableTimeSlots.map((time, idx) => (
                      <option key={idx} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={editFormData.specialRequests}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400"
                >
                  {isUpdating ? "Updating..." : "Update Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex flex-col items-center text-center">
              <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Reservation?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel the reservation for{" "}
                <strong>{selectedReservation?.customerName}</strong>? This
                action will mark it as cancelled.
              </p>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
                >
                  No, Go Back
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 font-medium disabled:bg-red-400"
                >
                  {isUpdating ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ReservationManager;
