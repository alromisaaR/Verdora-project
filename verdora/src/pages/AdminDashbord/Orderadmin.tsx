import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { updateOrderStatus } from "../../redux/slices/ordersSlice";
import {
  Search,
  RefreshCw,
  MoreVertical,
  Check,
  X,
  Truck,
  Package,
  Clock,
  Settings,
  Trash2,
} from "lucide-react";
import "./Orderadmin.css";
import { supabase } from "../../SupbaseClient/SupbaseClint";

interface Order {
  id: string;
  orderDate: string;
  items: any[];
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  paymentMethod: string;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
}

const PAGE_SIZE = 10;

const Orderadmin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusChangeMessage, setStatusChangeMessage] = useState<string | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("orderDate", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error.message);
        setOrders([]);
        return;
      }

      if (data) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // don't close when clicking inside a position-relative (button) or the dropdown itself
      if (
        showDropdown &&
        !target.closest(".position-relative") &&
        !target.closest(".order-dropdown-fixed")
      ) {
        setShowDropdown(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setStatusChangeMessage(null);
  };

  const handleRemoveOrder = async (orderId: string | number) => {
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) {
        console.error("Supabase Error:", error.message);
        return;
      }

      setOrders((prev) =>
        prev.filter((order) => String(order.id) !== String(orderId)),
      );
      setShowDropdown(null);
      setDropdownPosition(null);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };
  const toggleDropdown = (
    orderId: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (showDropdown === orderId) {
      setShowDropdown(null);
      setDropdownPosition(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom,
        left: buttonRect.right - 150, // 150px is the minWidth of dropdown
      });
      setShowDropdown(orderId);
    }
  };

  const handleStatusChange = async (
    orderId: string | number,
    newStatus: "pending" | "confirmed" | "processing" | "shipped" | "cancelled",
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Supabase Error:", error.message);
        setStatusChangeMessage(
          "Failed to update order status. Please try again.",
        );
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === String(orderId)
            ? { ...order, status: newStatus }
            : order,
        ),
      );

      dispatch(updateOrderStatus({ orderId, status: newStatus }));

      setStatusChangeMessage(
        `Order status successfully changed to ${newStatus.toUpperCase()}!`,
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      setStatusChangeMessage(
        "An error occurred while updating the order status.",
      );
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingInfo.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.shippingInfo.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.shippingInfo.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    // Reset to page 1 if current page exceeds total pages after filtering
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [filteredOrders.length, totalPages]);

  const start = (currentPage - 1) * PAGE_SIZE;
  const currentOrders = filteredOrders.slice(start, start + PAGE_SIZE);

  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "cancelled",
    "delivered",
  ];

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return "var(--color-green-sage)";
      case "confirmed":
        return "var(--color-green-medium)";
      case "processing":
        return "var(--color-green-dark)";
      case "shipped":
        return "var(--color-green-darker)";
      case "cancelled":
        return "#e63946";
      case "delivered":
        return "var(--color-green-darkest)";
      default:
        return null; // unknown -> handled as neutral
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "confirmed":
        return <Check size={16} />;
      case "processing":
        return <Package size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "cancelled":
        return <X size={16} />;
      case "delivered":
        return <Check size={16} />;
      default:
        return null; // unknown -> no icon
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div
          className="spinner-border"
          style={{ color: "var(--color-green-darkest)" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      {/* Header Card */}
      <div className="orders-card orders-header">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="orders-title">Orders Management</h1>
          <button
            className="btn d-flex align-items-center gap-2 refresh-btn"
            onClick={fetchOrders}
            style={{
              backgroundColor: "var(--color-green-darkest)",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              fontWeight: "600",
            }}
          >
            <RefreshCw size={18} />
            <span className="refresh-text">Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Card */}
      <div className="orders-card p-3">
        <div className="row">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-table orders-card">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead style={{ backgroundColor: "var(--color-green-lightest)" }}>
              <tr>
                <th>#</th>
                <th>Customer E-mail</th>
                <th>Customer Name</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-muted">
                    No orders found
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => (
                  <tr key={order.id}>
                    <td>{start + index + 1}</td>
                    <td>{order.shippingInfo.email}</td>
                    <td>
                      {order.shippingInfo.firstName}{" "}
                      {order.shippingInfo.lastName}
                    </td>
                    <td>
                      {allowedStatuses.includes(order.status) ? (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor:
                              getStatusColor(order.status) || undefined,
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {getStatusIcon(order.status)}
                          {(order.status || "PENDING").toUpperCase()}
                        </span>
                      ) : (
                        <span className="status-badge neutral">
                          {(order.status || "UNKNOWN").toString().toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                    <td>{order.total.toFixed(2)} EGP</td>
                    <td>
                      <div className="position-relative">
                        <button
                          className="btn btn-sm btn-light border"
                          onClick={(e) => toggleDropdown(order.id, e)}
                          style={{ position: "relative" }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {showDropdown === order.id && dropdownPosition && (
                          <div
                            style={{
                              position: "fixed",
                              top: dropdownPosition.top,
                              left: dropdownPosition.left,
                              zIndex: 9999,
                              backgroundColor: "white",
                              border: "1px solid var(--color-green-sage)",
                              borderRadius: "6px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              minWidth: "150px",
                            }}
                          >
                            <button
                              className="btn w-100 text-start d-flex align-items-center gap-2"
                              style={{
                                padding: "0.75rem 1rem",
                                border: "none",
                                backgroundColor: "transparent",
                                color: "var(--color-green-darkest)",
                                fontSize: "0.9rem",
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#statusModal"
                              onClick={() => {
                                handleSelectOrder(order);
                                setShowDropdown(null);
                                setDropdownPosition(null);
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--color-green-lightest)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <Settings size={16} />
                              Set Status
                            </button>
                            <hr
                              style={{
                                margin: 0,
                                borderColor: "var(--color-green-sage)",
                              }}
                            />
                            <button
                              className="btn w-100 text-start d-flex align-items-center gap-2"
                              style={{
                                padding: "0.75rem 1rem",
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#e63946",
                                fontSize: "0.9rem",
                              }}
                              onClick={() => {
                                handleRemoveOrder(order.id);
                                setShowDropdown(null);
                                setDropdownPosition(null);
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fef2f2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <Trash2 size={16} />
                              Remove Order
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="mobile-cards">
        {currentOrders.map((order, index) => (
          <div key={order.id} className="order-mobile-card">
            <div className="order-mobile-header">
              <div>
                <h6 className="mb-1">Order {start + index + 1}</h6>
                <small className="text-muted">{order.shippingInfo.email}</small>
              </div>
              <span
                style={{
                  backgroundColor: getStatusColor(order.status) || undefined,
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {getStatusIcon(order.status)}
                {(order.status || "pending").toUpperCase()}
              </span>
            </div>

            <div className="order-mobile-details">
              <div className="order-mobile-detail">
                <span className="order-mobile-label">Customer</span>
                <span className="order-mobile-value">
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                </span>
              </div>
              <div className="order-mobile-detail">
                <span className="order-mobile-label">Date</span>
                <span className="order-mobile-value">
                  {new Date(order.orderDate).toLocaleString()}
                </span>
              </div>
              <div className="order-mobile-detail">
                <span className="order-mobile-label">Total</span>
                <span className="order-mobile-value fw-bold">
                  {order.total.toFixed(2)} EGP
                </span>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-sm"
                onClick={(e) => toggleDropdown(order.id, e)}
                style={{
                  backgroundColor: "var(--color-green-lightest)",
                  color: "var(--color-green-darkest)",
                  border: "1px solid var(--color-green-sage)",
                }}
              >
                <Settings size={16} className="me-2" />
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Global dropdown render so it works on mobile & desktop */}
      {showDropdown &&
        dropdownPosition &&
        (() => {
          const order = orders.find(
            (o) => String(o.id) === String(showDropdown),
          );
          if (!order) return null;
          return (
            <div
              className="order-dropdown-fixed"
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 9999,
                backgroundColor: "white",
                border: "1px solid var(--color-green-sage)",
                borderRadius: "6px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                minWidth: "150px",
              }}
            >
              <button
                className="btn w-100 text-start d-flex align-items-center gap-2"
                style={{
                  padding: "0.75rem 1rem",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--color-green-darkest)",
                  fontSize: "0.9rem",
                }}
                data-bs-toggle="modal"
                data-bs-target="#statusModal"
                onClick={() => {
                  handleSelectOrder(order);
                  setShowDropdown(null);
                  setDropdownPosition(null);
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-green-lightest)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Settings size={16} />
                Set Status
              </button>
              <hr
                style={{ margin: 0, borderColor: "var(--color-green-sage)" }}
              />
              <button
                className="btn w-100 text-start d-flex align-items-center gap-2"
                style={{
                  padding: "0.75rem 1rem",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#e63946",
                  fontSize: "0.9rem",
                }}
                onClick={() => {
                  handleRemoveOrder(order.id);
                  setShowDropdown(null);
                  setDropdownPosition(null);
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fef2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Trash2 size={16} />
                Remove Order
              </button>
            </div>
          );
        })()}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
          <button
            className="btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              borderRadius: 20,
              width: 40,
              height: 40,
              padding: 0,
              border: "1px solid var(--color-green-darkest)",
              background:
                currentPage === 1 ? "#fff" : "var(--color-green-lightest)",
              color: "var(--color-green-darkest)",
            }}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="btn"
                style={{
                  borderRadius: "50%",
                  width: 38,
                  height: 38,
                  padding: 0,
                  border: "1px solid var(--color-green-darkest)",
                  background: isActive ? "var(--color-green-darkest)" : "#fff",
                  color: isActive ? "#fff" : "var(--color-green-darkest)",
                  boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {page}
              </button>
            );
          })}

          <button
            className="btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              borderRadius: 20,
              width: 40,
              height: 40,
              padding: 0,
              border: "1px solid var(--color-green-darkest)",
              background:
                currentPage === totalPages
                  ? "#fff"
                  : "var(--color-green-lightest)",
              color: "var(--color-green-darkest)",
            }}
          >
            ›
          </button>
        </div>
      )}

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="statusModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{
                backgroundColor: "var(--color-green-lightest)",
                borderBottom: "1px solid var(--color-green-sage)",
              }}
            >
              <h5
                className="modal-title"
                style={{
                  color: "var(--color-green-darkest)",
                  fontWeight: "700",
                }}
              >
                Change Order Status
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Conditional rendering for success message or status buttons */}
              {statusChangeMessage ? (
                <div
                  className="alert alert-success"
                  role="alert"
                  style={{
                    color: "var(--color-green-darkest)",
                    backgroundColor: "var(--color-green-lightest)",
                    border: "1px solid var(--color-green-sage)",
                    fontWeight: "600",
                  }}
                >
                  {statusChangeMessage}
                </div>
              ) : (
                selectedOrder && (
                  <>
                    <p>
                      <strong>Order ID:</strong> {selectedOrder.id}
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        "pending",
                        "confirmed",
                        "processing",
                        "shipped",
                        "cancelled",
                      ].map((status) => (
                        <button
                          key={status}
                          style={{
                            backgroundColor:
                              selectedOrder.status === status
                                ? "var(--color-green-darkest)"
                                : "transparent",
                            color:
                              selectedOrder.status === status
                                ? "white"
                                : "var(--color-green-darkest)",
                            border: `2px solid var(--color-green-darkest)`,
                            borderRadius: "6px",
                            padding: "0.5rem 1rem",
                            fontWeight: "600",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--color-green-darker)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              selectedOrder.status === status
                                ? "var(--color-green-darkest)"
                                : "transparent")
                          }
                          onClick={() =>
                            handleStatusChange(selectedOrder.id, status as any)
                          }
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                style={{
                  backgroundColor: "var(--color-green-darkest)",
                  color: "white",
                }}
                onClick={() => {
                  setSelectedOrder(null);
                  setStatusChangeMessage(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderadmin;
