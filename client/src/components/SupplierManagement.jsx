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
      const data = await res.json();
      if (res.ok) {
        setSuppliers(data);
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
          text: editingSupplier ? "Supplier updated!" : "Supplier created!",
          backgroundColor: "green",
        }).showToast();
        setShowSupplierModal(false);
        fetchSuppliers();
      } else {
        const err = await res.json();
        Toastify({
          text: err.message || "Failed to save supplier",
          backgroundColor: "red",
        }).showToast();
      }
    } catch (error) {
      console.error(error);
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
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  {searchTerm
                    ? "No suppliers found matching your search."
                    : "No suppliers found. Add your first supplier above."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Name</Table.HeadCell>
                    <Table.HeadCell>Contact Person</Table.HeadCell>
                    <Table.HeadCell>Contact Info</Table.HeadCell>
                    <Table.HeadCell>Items Supplied</Table.HeadCell>
                    <Table.HeadCell>Rating</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {suppliers
                      .filter(
                        (s) =>
                          s.companyName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          s.contactPerson
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          s.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((s) => (
                        <Table.Row key={s._id} className="bg-white">
                          <Table.Cell className="font-medium text-gray-900">
                            {s.companyName}
                          </Table.Cell>
                          <Table.Cell>{s.contactPerson}</Table.Cell>
                          <Table.Cell>
                            <div className="text-sm">{s.email}</div>
                            <div className="text-xs text-gray-500">
                              {s.phone}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-wrap gap-1">
                              {s.itemsSupplied?.map((item, idx) => (
                                <Badge key={idx} color="indigo" size="xs">
                                  {item}
                                </Badge>
                              )) || <span className="text-gray-400">None</span>}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex">{renderStars(s.rating)}</div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditSupplier(s)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <HiPencilAlt className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSupplierToDelete(s);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <HiTrash className="h-5 w-5" />
                              </button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </Tabs.Item>

          {/* TAB 2: PURCHASE ORDERS */}
          <Tabs.Item title="Purchase Orders">
            <div className="flex justify-between items-center mb-4 mt-4">
              <h2 className="text-xl font-semibold">Purchase Orders</h2>
              <Button
                color="blue"
                onClick={() => {
                  setOrderFormData({
                    supplierId: "",
                    items: [{ foodId: "", quantity: 1, unitCost: 0 }],
                    totalCost: 0,
                  });
                  setShowOrderModal(true);
                }}
              >
                <HiPlus className="mr-2 h-5 w-5" /> Create Order
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading purchase orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No purchase orders found. Create your first order above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Order ID</Table.HeadCell>
                    <Table.HeadCell>Supplier</Table.HeadCell>
                    <Table.HeadCell>Total Cost</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {orders.map((o) => (
                      <Table.Row key={o._id} className="bg-white">
                        <Table.Cell className="font-mono text-xs">
                          {o.orderId}
                        </Table.Cell>
                        <Table.Cell>
                          {o.supplierId?.companyName || "N/A"}
                        </Table.Cell>
                        <Table.Cell className="font-semibold">
                          {formatCurrencyWithCode(o.totalCost)}
                        </Table.Cell>
                        <Table.Cell>
                          {o.status === "received" ? (
                            <Badge color="success">Received</Badge>
                          ) : o.status === "cancelled" ? (
                            <Badge color="failure">Cancelled</Badge>
                          ) : (
                            <Badge color="warning">Pending</Badge>
                          )}
                        </Table.Cell>
                        <Table.Cell className="text-xs">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell>
                          {o.status === "pending" && (
                            <Button
                              size="xs"
                              color="success"
                              onClick={() => {
                                setOrderToReceive(o);
                                setShowReceiveModal(true);
                              }}
                            >
                              Receive
                            </Button>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
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
