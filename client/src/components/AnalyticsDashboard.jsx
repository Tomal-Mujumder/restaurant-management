import React, { useEffect, useState } from "react";
import { formatCurrencyWithCode } from "../utils/currency";
import { Card } from "flowbite-react";
import {
  HiChartBar,
  HiCurrencyDollar,
  HiExclamationCircle,
  HiXCircle,
} from "react-icons/hi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days"); // '7days', '30days', '3months'

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/analytics/dashboard?timeRange=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        } else {
          console.error("Failed to fetch analytics:", data.message);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (loading) {
    return <div className="text-center py-10">Loading analytics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-10">Failed to load data.</div>;
  }

  return (
    <div className="p-4">
      {/* Date Filter */}
      <div className="flex justify-end mb-4">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm uppercase">Total Items</p>
              <h3 className="text-2xl font-bold">{stats.totalItems}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 text-2xl">
              <HiChartBar />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm uppercase">
                Total Stock Value
              </p>
              <h3 className="text-2xl font-bold">
                {formatCurrencyWithCode(stats.totalStockValue)}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600 text-2xl">
              <HiCurrencyDollar />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm uppercase">
                Low Stock Alerts
              </p>
              <h3 className="text-2xl font-bold text-yellow-600">
                {stats.lowStockCount}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 text-2xl">
              <HiExclamationCircle />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm uppercase">Out of Stock</p>
              <h3 className="text-2xl font-bold text-red-600">
                {stats.outOfStockCount}
              </h3>
            </div>
            <div className="p-3 bg-red-100 rounded-full text-red-600 text-2xl">
              <HiXCircle />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 h-96">
        {/* Top 5 Selling Items */}
        <div className="bg-white p-4 rounded-lg shadow-md h-full dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Top 5 Selling Items
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={stats.topSelling}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Quantity Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock by Category */}
        <div className="bg-white p-4 rounded-lg shadow-md h-full dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Stock Distribution by Category
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={stats.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {stats.categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Transactions Over Time */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 h-80 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Stock Activity Over Time
        </h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart
            data={stats.transactionsChart}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="purchases"
              stroke="#82ca9d"
              name="Restocks"
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#8884d8"
              name="Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Food Item
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3">
                  Performed By
                </th>
                <th scope="col" className="px-6 py-3">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((t) => (
                <tr
                  key={t._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4">
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {t.foodId?.foodName || "Deleted Item"}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${
                        t.transactionType === "sale"
                          ? "bg-red-500"
                          : t.transactionType === "restock"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {t.transactionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">{t.quantity}</td>
                  <td className="px-6 py-4">{t.performedBy || "Unknown"}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {t.reason || "No reason provided"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
