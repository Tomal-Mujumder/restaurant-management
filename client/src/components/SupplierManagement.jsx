import React, { useEffect, useState } from "react";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { formatCurrencyWithCode } from "../utils/currency";
import {
  HiPlus,
  HiPencilAlt,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiStar,
} from "react-icons/hi";
import {
  Button,
  Modal,
  Table,
  Label,
  TextInput,
  Select,
  Textarea,
  Badge,
  Tabs,
} from "flowbite-react";

export default function SupplierManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Supplier Form States
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierFormData, setSupplierFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    itemsSupplied: [],
    rating: "5 Stars",
  });

  // Purchase Order Form States
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showPODetailsModal, setShowPODetailsModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [poFormData, setPoFormData] = useState({
    supplierId: "",
    supplierName: "",
    items: [{ itemName: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
    expectedDeliveryDate: "",
    notes: "",
    tax: 0,
  });

  // Delete Supplier States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/supplier/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Fetch Suppliers Status:", res.status);
      const data = await res.json();
      console.log("Fetch Suppliers Data:", data);

      if (res.ok) {
        if (Array.isArray(data)) {
          setSuppliers(data);
        } else {
          console.error("Suppliers data is not an array:", data);
          setSuppliers([]);
        }
      } else {
        console.error("Failed to fetch suppliers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch("/api/purchaseorder/getAll", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPurchaseOrders(data);
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const res = await fetch("/api/foods/getAllFoods");
      const data = await res.json();
      if (res.ok) setFoodItems(data.foodItems);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchPurchaseOrders();
    fetchFoodItems();
  }, []);

  // Supplier Actions
  const handleSupplierSubmit = async (e) => {
    e.preventDefault();

    // Validation - itemsSupplied is optional, not required
    if (
      !supplierFormData.companyName ||
      !supplierFormData.contactPerson ||
      !supplierFormData.phone ||
      !supplierFormData.email ||
      !supplierFormData.address
    ) {
      Toastify({
        text: "All fields are required!",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        duration: 3000,
      }).showToast();
      return;
    }

    // Phone validation
    if (!/^\d{11}$/.test(supplierFormData.phone)) {
      Toastify({
        text: "Phone number must be exactly 11 digits!",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        duration: 3000,
      }).showToast();
      return;
    }

    setLoading(true);
    try {
      const url = editingSupplier
        ? `/api/supplier/update/${editingSupplier._id}`
        : "/api/supplier/create";
      const method = editingSupplier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(supplierFormData),
      });

      if (res.ok) {
        Toastify({
          text: editingSupplier
            ? "Supplier updated successfully!"
            : "Supplier added successfully!",
          style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
          duration: 3000,
        }).showToast();

        fetchSuppliers();
        setShowSupplierModal(false);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save supplier");
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      Toastify({
        text: error.message || "Error saving supplier!",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        duration: 3000,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const openAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      itemsSupplied: [],
      rating: "5 Stars",
    });
    setShowSupplierModal(true);
  };

  const openEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierFormData({
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      itemsSupplied: supplier.itemsSupplied || [],
      rating: supplier.rating,
    });
    setShowSupplierModal(true);
  };

  const handleDeleteSupplier = async () => {
    try {
      const res = await fetch(`/api/supplier/delete/${supplierToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        Toastify({
          text: "Supplier deleted!",
          backgroundColor: "green",
        }).showToast();
        fetchSuppliers();
        setShowDeleteModal(false);
      } else {
        const err = await res.json();
        Toastify({
          text: err.message || "Failed to delete",
          backgroundColor: "red",
        }).showToast();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Purchase Order Actions
  const addItemRow = () => {
    setPoFormData({
      ...poFormData,
      items: [
        ...poFormData.items,
        { itemName: "", quantity: 1, unitPrice: 0, totalPrice: 0 },
      ],
    });
  };

  const removeItemRow = (index) => {
    const newItems = poFormData.items.filter((_, i) => i !== index);
    setPoFormData({ ...poFormData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...poFormData.items];
    newItems[index][field] = value;

    // Auto-calculate total price
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].totalPrice =
        newItems[index].quantity * newItems[index].unitPrice;
    }

    setPoFormData({ ...poFormData, items: newItems });
  };

  const calculateSubtotal = () => {
    return poFormData.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (parseFloat(poFormData.tax) || 0);
  };

  const handlePOSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !poFormData.supplierId ||
      !poFormData.expectedDeliveryDate ||
      poFormData.items.length === 0
    ) {
      Toastify({
        text: "Please fill all required fields!",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        duration: 3000,
      }).showToast();
      return;
    }

    // Validate items
    const invalidItems = poFormData.items.some(
      (item) => !item.itemName || item.quantity <= 0 || item.unitPrice <= 0
    );

    if (invalidItems) {
      Toastify({
        text: "Please fill all item details correctly!",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        duration: 3000,
      }).showToast();
      return;
    }

    try {
      const response = await fetch("/api/purchaseorder/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(poFormData),
      });

      if (response.ok) {
        Toastify({
          text: "Purchase order created successfully!",
          style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
          duration: 3000,
        }).showToast();

        fetchPurchaseOrders();
        resetPOForm();
        setShowPOModal(false);
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      Toastify({
        text: "Error creating purchase order!",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        duration: 3000,
      }).showToast();
    }
  };

  const resetPOForm = () => {
    setPoFormData({
      supplierId: "",
      supplierName: "",
      items: [{ itemName: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
      expectedDeliveryDate: "",
      notes: "",
      tax: 0,
    });
  };

  const handleSupplierSelect = (e) => {
    const selectedId = e.target.value;
    const supplier = suppliers.find((s) => s._id === selectedId);

    if (supplier) {
      setPoFormData({
        ...poFormData,
        supplierId: selectedId,
        supplierName: supplier.companyName,
      });
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/purchaseorder/status/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        Toastify({
          text: "Order status updated!",
          style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
          duration: 3000,
        }).showToast();
        fetchPurchaseOrders();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeletePO = async (orderId) => {
    if (
      !window.confirm("Are you sure you want to delete this purchase order?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/purchaseorder/delete/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        Toastify({
          text: "Purchase order deleted!",
          style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
          duration: 3000,
        }).showToast();
        fetchPurchaseOrders();
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
    }
  };

  const renderStars = (rating) => {
    // Extract number from rating string like "5 Stars" -> 5
    const numStars = parseInt(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <HiStar
        key={i}
        className={i < numStars ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Supplier Management</h1>

        <Tabs
          aria-label="Tabs with underline"
          variant="underline"
          onActiveTabChange={(tab) => setActiveTab(tab)}
        >
          {/* TAB 1: SUPPLIERS */}
          <Tabs.Item active={activeTab === 0} title="Suppliers">
            <div className="flex justify-between items-center mb-4 mt-4">
              <h2 className="text-xl font-semibold">Our Suppliers</h2>
              <div className="flex gap-4">
                <TextInput
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button color="blue" onClick={openAddSupplier}>
                  <HiPlus className="mr-2 h-5 w-5" /> Add Supplier
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading suppliers...</p>
              </div>
            ) : !Array.isArray(suppliers) ? (
              <div className="text-center py-8 text-red-500">
                Error: Suppliers data is invalid. Check console.
              </div>
            ) : suppliers.filter(
                (s) =>
                  s.companyName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  s.contactPerson
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  s.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 font-medium">
                  {searchTerm
                    ? "No suppliers found matching your search."
                    : "No suppliers found. Add your first supplier above."}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Debug: Total Suppliers: {suppliers?.length || 0}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3 px-6">
                        Company
                      </th>
                      <th scope="col" className="py-3 px-6">
                        Contact Person
                      </th>
                      <th scope="col" className="py-3 px-6">
                        Contact Info
                      </th>
                      <th scope="col" className="py-3 px-6">
                        Items Supplied
                      </th>
                      <th scope="col" className="py-3 px-6">
                        Rating
                      </th>
                      <th scope="col" className="py-3 px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers
                      .filter(
                        (s) =>
                          (s.companyName &&
                            s.companyName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (s.contactPerson &&
                            s.contactPerson
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (s.email &&
                            s.email
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()))
                      )
                      .map((s) => (
                        <tr
                          key={s._id}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                            {s.companyName}
                          </td>
                          <td className="py-4 px-6">{s.contactPerson}</td>
                          <td className="py-4 px-6">
                            <div className="text-sm">{s.email}</div>
                            <div className="text-xs text-gray-500">
                              {s.phone}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1">
                              {s.itemsSupplied?.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                                >
                                  {item}
                                </span>
                              )) || <span className="text-gray-400">None</span>}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex">{renderStars(s.rating)}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditSupplier(s)}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setSupplierToDelete(s);
                                  setShowDeleteModal(true);
                                }}
                                className="font-medium text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tabs.Item>

          {/* TAB 2: PURCHASE ORDERS */}
          <Tabs.Item title="Purchase Orders">
            <div>
              <div className="flex justify-between items-center mb-4 mt-4">
                <h2 className="text-xl font-semibold">Purchase Orders</h2>
                <Button
                  onClick={() => setShowPOModal(true)}
                  className="bg-blue-600"
                >
                  <HiPlus className="mr-2 h-5 w-5" /> Create Order
                </Button>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => fetchPurchaseOrders()}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  All
                </button>
                <button
                  onClick={() => {
                    /* Add filter logic if needed, or rely on backend filtering */
                  }}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  Pending
                </button>
                <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                  Confirmed
                </button>
                <button className="px-4 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
                  Shipped
                </button>
                <button className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200">
                  Delivered
                </button>
              </div>

              {/* Purchase Orders Table */}
              {purchaseOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No purchase orders found. Create your first order!
                </p>
              ) : (
                <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Order #
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Supplier
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Items
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Total Amount
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Order Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Expected Delivery
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Payment
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-mono font-medium text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4">{order.supplierName}</td>
                          <td className="px-6 py-4">
                            {order.items.length} items
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            {formatCurrencyWithCode(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(
                              order.expectedDeliveryDate
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusUpdate(order._id, e.target.value)
                              }
                              className={`px-2 py-1 rounded text-xs border-0 ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : order.status === "Confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.paymentStatus === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : order.paymentStatus === "Partially Paid"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedPO(order);
                                  setShowPODetailsModal(true);
                                }}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeletePO(order._id)}
                                className="font-medium text-red-600 hover:underline"
                              >
                                Delete
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
          </Tabs.Item>
        </Tabs>
      </div>

      {/* Supplier Modal */}
      <Modal
        show={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        size="lg"
      >
        <Modal.Header>
          {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSupplierSubmit} className="space-y-4">
            <div>
              <Label value="Company Name" />
              <TextInput
                required
                value={supplierFormData.companyName}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    companyName: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label value="Contact Person" />
                <TextInput
                  required
                  value={supplierFormData.contactPerson}
                  onChange={(e) =>
                    setSupplierFormData({
                      ...supplierFormData,
                      contactPerson: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label value="Phone (11 Digits)" />
                <TextInput
                  required
                  pattern="\d{11}"
                  value={supplierFormData.phone}
                  onChange={(e) =>
                    setSupplierFormData({
                      ...supplierFormData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label value="Email" />
              <TextInput
                type="email"
                required
                value={supplierFormData.email}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label value="Address" />
              <Textarea
                required
                value={supplierFormData.address}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label value="Items Supplied" />
              <div className="flex flex-wrap gap-2 mb-2">
                {supplierFormData.itemsSupplied.map((itemName, idx) => (
                  <Badge
                    key={idx}
                    color="info"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      setSupplierFormData({
                        ...supplierFormData,
                        itemsSupplied: supplierFormData.itemsSupplied.filter(
                          (name) => name !== itemName
                        ),
                      });
                    }}
                  >
                    {itemName} ✖
                  </Badge>
                ))}
              </div>
              <Select
                onChange={(e) => {
                  if (
                    e.target.value &&
                    !supplierFormData.itemsSupplied.includes(e.target.value)
                  ) {
                    setSupplierFormData({
                      ...supplierFormData,
                      itemsSupplied: [
                        ...supplierFormData.itemsSupplied,
                        e.target.value,
                      ],
                    });
                  }
                  e.target.value = ""; // Reset select
                }}
              >
                <option value="">Add item to supplier...</option>
                {foodItems
                  .filter(
                    (item) =>
                      !supplierFormData.itemsSupplied.includes(item.foodName)
                  )
                  .map((item) => (
                    <option key={item._id} value={item.foodName}>
                      {item.foodName}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <Label value="Rating" />
              <Select
                value={supplierFormData.rating}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    rating: e.target.value,
                  })
                }
              >
                {["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"].map(
                  (v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  )
                )}
              </Select>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button
                color="gray"
                onClick={() => {
                  setShowSupplierModal(false);
                  setEditingSupplier(null);
                  setSupplierFormData({
                    companyName: "",
                    contactPerson: "",
                    email: "",
                    phone: "",
                    address: "",
                    itemsSupplied: [],
                    rating: "5 Stars",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingSupplier
                  ? "Update Supplier"
                  : "Add Supplier"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Create Purchase Order Modal */}
      <Modal
        show={showPOModal}
        size="4xl"
        onClose={() => {
          setShowPOModal(false);
          resetPOForm();
        }}
      >
        <Modal.Header>Create Purchase Order</Modal.Header>
        <Modal.Body>
          <form onSubmit={handlePOSubmit} className="space-y-4">
            {/* Supplier Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Select Supplier *</Label>
                <select
                  id="supplier"
                  value={poFormData.supplierId}
                  onChange={handleSupplierSelect}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="expectedDeliveryDate">
                  Expected Delivery Date *
                </Label>
                <TextInput
                  id="expectedDeliveryDate"
                  type="date"
                  value={poFormData.expectedDeliveryDate}
                  onChange={(e) =>
                    setPoFormData({
                      ...poFormData,
                      expectedDeliveryDate: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Order Items *</Label>
                <Button
                  type="button"
                  size="xs"
                  onClick={addItemRow}
                  className="bg-green-600"
                >
                  + Add Item
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                {poFormData.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-end"
                  >
                    <div className="col-span-5">
                      <Label htmlFor={`itemName-${index}`}>Item Name</Label>
                      <TextInput
                        id={`itemName-${index}`}
                        value={item.itemName}
                        onChange={(e) =>
                          handleItemChange(index, "itemName", e.target.value)
                        }
                        placeholder="e.g., Rice 25kg"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <TextInput
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                      <TextInput
                        id={`unitPrice-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unitPrice",
                            parseFloat(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <TextInput
                        value={item.totalPrice.toFixed(2)}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="col-span-1">
                      {poFormData.items.length > 1 && (
                        <Button
                          type="button"
                          color="failure"
                          size="sm"
                          onClick={() => removeItemRow(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-end space-y-2">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      {formatCurrencyWithCode(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax:</span>
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={poFormData.tax}
                      onChange={(e) =>
                        setPoFormData({
                          ...poFormData,
                          tax: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32"
                      sizing="sm"
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrencyWithCode(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={poFormData.notes}
                onChange={(e) =>
                  setPoFormData({ ...poFormData, notes: e.target.value })
                }
                rows={3}
                placeholder="Any special instructions..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                color="gray"
                onClick={() => {
                  setShowPOModal(false);
                  resetPOForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600">
                Create Purchase Order
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* View Purchase Order Details Modal */}
      <Modal
        show={showPODetailsModal}
        size="3xl"
        onClose={() => setShowPODetailsModal(false)}
      >
        <Modal.Header>Purchase Order Details</Modal.Header>
        <Modal.Body id="purchase-order-print">
          {selectedPO && (
            <div className="space-y-4">
              {/* Order Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-mono font-semibold">
                      {selectedPO.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`px-3 py-1 rounded text-sm inline-block ${
                        selectedPO.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : selectedPO.status === "Shipped"
                          ? "bg-purple-100 text-purple-800"
                          : selectedPO.status === "Confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : selectedPO.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedPO.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Supplier</p>
                    <p className="font-semibold">{selectedPO.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p>{new Date(selectedPO.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected Delivery</p>
                    <p>
                      {new Date(
                        selectedPO.expectedDeliveryDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span
                      className={`px-3 py-1 rounded text-sm inline-block ${
                        selectedPO.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800"
                          : selectedPO.paymentStatus === "Partially Paid"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedPO.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border text-left">Item Name</th>
                      <th className="px-4 py-2 border text-right">Quantity</th>
                      <th className="px-4 py-2 border text-right">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 border text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border">{item.itemName}</td>
                        <td className="px-4 py-2 border text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 border text-right">
                          {formatCurrencyWithCode(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2 border text-right">
                          {formatCurrencyWithCode(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td colSpan="3" className="px-4 py-2 border text-right">
                        Subtotal:
                      </td>
                      <td className="px-4 py-2 border text-right">
                        {formatCurrencyWithCode(selectedPO.subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-4 py-2 border text-right">
                        Tax:
                      </td>
                      <td className="px-4 py-2 border text-right">
                        {formatCurrencyWithCode(selectedPO.tax)}
                      </td>
                    </tr>
                    <tr className="text-lg">
                      <td colSpan="3" className="px-4 py-2 border text-right">
                        Total:
                      </td>
                      <td className="px-4 py-2 border text-right">
                        {formatCurrencyWithCode(selectedPO.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Notes */}
              {selectedPO.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedPO.notes}
                  </p>
                </div>
              )}

              {/* Footer Info */}
              <div className="text-sm text-gray-600 border-t pt-4">
                <p>Created by: {selectedPO.createdBy}</p>
                <p>
                  Created at: {new Date(selectedPO.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowPODetailsModal(false)}>
            Close
          </Button>
          <Button className="bg-blue-600" onClick={() => window.print()}>
            Print Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Supplier Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="md"
      >
        <Modal.Header>Delete Supplier</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <HiXCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <p className="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to delete this supplier? This cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteSupplier}>
                Delete
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
