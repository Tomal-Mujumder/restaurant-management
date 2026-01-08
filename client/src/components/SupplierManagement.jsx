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
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    supplierId: "",
    items: [{ foodId: "", quantity: 1, unitCost: 0 }],
    totalCost: 0,
  });

  // Receive Order States
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [orderToReceive, setOrderToReceive] = useState(null);

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/purchaseorder/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
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
    fetchOrders();
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
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/purchaseorder/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderFormData),
      });

      if (res.ok) {
        Toastify({
          text: "Purchase order created successfully!",
          backgroundColor: "green",
        }).showToast();
        setShowOrderModal(false);
        // Refresh the orders list
        await fetchOrders();
      } else {
        const err = await res.json();
        Toastify({
          text: err.message || "Failed to create order",
          backgroundColor: "red",
        }).showToast();
      }
    } catch (error) {
      console.error(error);
      Toastify({
        text: "Error creating order",
        backgroundColor: "red",
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const handleAddRangeRow = () => {
    setOrderFormData({
      ...orderFormData,
      items: [...orderFormData.items, { foodId: "", quantity: 1, unitCost: 0 }],
    });
  };

  const handleOrderRowChange = (index, field, value) => {
    const newItems = [...orderFormData.items];
    newItems[index][field] = value;

    // Auto-calculate total
    const total = newItems.reduce(
      (acc, item) => acc + item.quantity * item.unitCost,
      0
    );

    setOrderFormData({
      ...orderFormData,
      items: newItems,
      totalCost: total,
    });
  };

  const handleRemoveOrderRow = (index) => {
    const newItems = orderFormData.items.filter((_, i) => i !== index);
    const total = newItems.reduce(
      (acc, item) => acc + item.quantity * item.unitCost,
      0
    );
    setOrderFormData({ ...orderFormData, items: newItems, totalCost: total });
  };

  const handleReceiveOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/purchaseorder/receive/${orderToReceive._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) {
        Toastify({
          text: "Order received & Stock updated!",
          backgroundColor: "green",
        }).showToast();
        setShowReceiveModal(false);
        // Refresh the orders list
        await fetchOrders();
      } else {
        const err = await res.json();
        Toastify({
          text: err.message || "Failed to receive order",
          backgroundColor: "red",
        }).showToast();
      }
    } catch (error) {
      console.error(error);
      Toastify({
        text: "Error receiving order",
        backgroundColor: "red",
      }).showToast();
    } finally {
      setLoading(false);
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
            <div className="p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Purchase Orders</h2>
              <p className="text-gray-600">
                Purchase orders functionality is coming soon...
              </p>
              <p className="text-gray-500 mt-2">
                This section will allow you to:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-500">
                <li>Create purchase orders from suppliers</li>
                <li>Track order status</li>
                <li>Manage stock reorders</li>
                <li>View order history</li>
              </ul>
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

      {/* Purchase Order Modal */}
      <Modal
        show={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        size="2xl"
      >
        <Modal.Header>Create Purchase Order</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div>
              <Label value="Target Supplier" />
              <Select
                required
                value={orderFormData.supplierId}
                onChange={(e) =>
                  setOrderFormData({
                    ...orderFormData,
                    supplierId: e.target.value,
                  })
                }
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.companyName}
                  </option>
                ))}
              </Select>
            </div>

            <div className="border-t pt-4">
              <Label value="Order Items" />
              {orderFormData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 mt-2 items-end"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <Select
                      required
                      value={item.foodId}
                      onChange={(e) =>
                        handleOrderRowChange(index, "foodId", e.target.value)
                      }
                    >
                      <option value="">Select Food</option>
                      {foodItems.map((fi) => (
                        <option key={fi._id} value={fi._id}>
                          {fi.foodName}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <TextInput
                      type="number"
                      placeholder="Qty"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleOrderRowChange(
                          index,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <TextInput
                      type="number"
                      placeholder="Cost"
                      required
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) =>
                        handleOrderRowChange(
                          index,
                          "unitCost",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-1">
                    <Button
                      color="failure"
                      size="xs"
                      onClick={() => handleRemoveOrderRow(index)}
                      disabled={orderFormData.items.length === 1}
                    >
                      <HiTrash />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                color="gray"
                size="xs"
                className="mt-4"
                onClick={handleAddRangeRow}
              >
                <HiPlus className="mr-1" /> Add Row
              </Button>
            </div>

            <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
              <span>Total Cost:</span>
              <span className="text-blue-600">
                {formatCurrencyWithCode(orderFormData.totalCost)}
              </span>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" color="blue" disabled={loading}>
                {loading ? "Processing..." : "Submit Order"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Receive Confirmation Modal */}
      <Modal
        show={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        size="md"
      >
        <Modal.Header>Receive Order</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <HiCheckCircle className="mx-auto mb-4 h-14 w-14 text-green-400" />
            <p className="mb-5 text-lg font-normal text-gray-500">
              Confirm receiving this order? This will automatically update your
              stock levels.
            </p>
            <div className="flex justify-center gap-4">
              <Button color="success" onClick={handleReceiveOrder}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowReceiveModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
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
