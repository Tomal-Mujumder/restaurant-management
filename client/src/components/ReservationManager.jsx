import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReservationManager = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    // Optimistic UI update could be done here, but let's wait for server response for consistency

    // Show a loading toast or similar if needed, but for checkboxes typical UX is instant feedback or quick toggle
    // We'll update the state locally first for responsiveness, then revert if failed

    // Actually, user requested "Show loading state during update".
    // Since it's a checkbox, a full page loader is annoying.
    // We can just rely on the toast and data refresh.

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

      // Update local state
      setReservations((prev) =>
        prev.map((res) => (res._id === id ? updatedReservation : res))
      );

      toast.success(`Reservation marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Failed to update reservation status");
      // Optionally fetch data again to revert UI to server state
      fetchReservations();
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

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 bg-gray-100">
      <div className="w-full max-w-7xl p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
          Reservation Management
        </h1>

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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations
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
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ReservationManager;
