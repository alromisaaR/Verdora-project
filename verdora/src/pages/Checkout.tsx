import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../redux/store";
import { clearCart } from "../redux/slices/cartSlice";
import { addOrder } from "../redux/slices/ordersSlice";
import { supabase } from "../SupbaseClient/SupbaseClint";
import "../styles/global.css";

const Checkout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Read current signed-in user's email from localStorage
  const userEmail = useMemo(() => localStorage.getItem("userEmail") || "", []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "credit-card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Responsive helper
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => {
    const price =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^\d.]/g, ""))
        : item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Allow only numbers for phone, zipCode, cardNumber, and cvv fields
    if (
      name === "phone" ||
      name === "zipCode" ||
      name === "cardNumber" ||
      name === "cvv"
    ) {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const nowIso = new Date().toISOString();
      const status =
        formData.paymentMethod === "credit-card" ? "confirmed" : "pending";

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            id: `ORD-${Date.now()}`,
            items: cartItems,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: userEmail,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            zip_code: formData.zipCode,
            payment_method: formData.paymentMethod,
            total: totalPrice,
            status: status,
            created_at: nowIso,
            order_date: nowIso,
          },
        ])
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);

      const legacyOrderFormat = {
        id: orderData.id,
        items: orderData.items,
        shippingInfo: {
          firstName: orderData.first_name,
          lastName: orderData.last_name,
          email: orderData.email,
          phone: orderData.phone,
          address: orderData.address,
          city: orderData.city,
          zipCode: orderData.zip_code,
        },
        paymentMethod: orderData.payment_method,
        total: orderData.total,
        createdAt: orderData.created_at,
        orderDate: orderData.order_date,
        status: orderData.status,
      };

      dispatch(addOrder(legacyOrderFormat));

      for (const item of cartItems) {
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (fetchError)
          console.error(
            `Failed to fetch product ${item.id}:`,
            fetchError.message,
          );

        if (product) {
          const updatedStock = (product.stock ?? 0) - item.quantity;

          const { error: updateError } = await supabase
            .from("products")
            .update({ stock: updatedStock })
            .eq("id", item.id);

          if (updateError)
            console.error(
              `Failed to update stock for product ${item.id}:`,
              updateError.message,
            );
        }
      }

      // Clear cart after storing order
      dispatch(clearCart());

      // Navigate to order page
      navigate("/order");
    } catch (error: any) {
      alert(error.message || "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div
        style={{ textAlign: "center", padding: "100px 20px" }}
        className="checkout-page"
      >
        <h2>Your cart is empty</h2>
        <p>Please add some items to your cart before checkout.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#0f1010ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: isMobile ? "20px 12px" : "40px 20px",
      }}
      className="checkout-page"
    >
      <h1
        style={{
          marginBottom: "32px",
          textAlign: "center",
          color: "var(--color-green-darkest)",
        }}
      >
        Checkout
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "24px" : "40px",
        }}
      >
        {/* Checkout Form */}
        <div>
          <h2
            style={{
              marginBottom: "24px",
              color: "var(--color-green-darkest)",
            }}
          >
            Shipping Information
          </h2>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>

            {/* Email is now auto-assigned from the logged-in account and not editable */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
              <div
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {userEmail || "Not signed in"}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter numbers only"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  placeholder="Numbers only"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>

            <h3
              style={{
                marginBottom: "16px",
                color: "var(--color-green-darkest)",
              }}
            >
              Payment Method
            </h3>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit-card"
                  checked={formData.paymentMethod === "credit-card"}
                  onChange={handleInputChange}
                  style={{ marginRight: "8px" }}
                />
                Credit Card
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash-on-delivery"
                  checked={formData.paymentMethod === "cash-on-delivery"}
                  onChange={handleInputChange}
                  style={{ marginRight: "8px" }}
                />
                Cash on Delivery
              </label>
            </div>

            {formData.paymentMethod === "credit-card" && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Card Number *
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required={formData.paymentMethod === "credit-card"}
                    placeholder="Numbers only (1234567890123456)"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "16px",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Expiry Date *
                    </label>
                    <input
                      type="month"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required={formData.paymentMethod === "credit-card"}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      CVV *
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required={formData.paymentMethod === "credit-card"}
                      placeholder="Numbers only (123)"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: isProcessing
                  ? "#ccc"
                  : "var(--color-green-darkest)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "18px",
                fontWeight: "600",
                cursor: isProcessing ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "var(--color-green-dark)";
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "var(--color-green-darkest)";
                  (e.target as HTMLButtonElement).style.transform = "scale(1)";
                }
              }}
            >
              {isProcessing
                ? "Processing..."
                : `Place Order - ${totalPrice.toFixed(2)} ${cartItems.length > 0 && typeof cartItems[0].price === "string" && cartItems[0].price.includes("EGP") ? "EGP" : "$"}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <h2
            style={{
              marginBottom: "24px",
              color: "var(--color-green-darkest)",
            }}
          >
            Order Summary
          </h2>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: isMobile ? "12px" : "20px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              {cartItems.map((item) => {
                const productName = item.name || "Product";
                const productImage =
                  typeof item.image === "string"
                    ? item.image
                    : item.image[0] || "";
                const price =
                  typeof item.price === "string"
                    ? parseFloat(item.price.replace(/[^\d.]/g, ""))
                    : item.price;
                const currency =
                  typeof item.price === "string" && item.price.includes("EGP")
                    ? "EGP"
                    : "$";

                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: isMobile ? "12px" : "16px",
                      gap: isMobile ? "8px" : "12px",
                    }}
                  >
                    <img
                      src={productImage}
                      alt={productName}
                      style={{
                        width: isMobile ? "48px" : "60px",
                        height: isMobile ? "48px" : "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        marginRight: isMobile ? "8px" : "12px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: isMobile ? "13px" : "14px",
                        }}
                      >
                        {productName}
                      </h4>
                      <p
                        style={{
                          margin: "0",
                          color: "#666",
                          fontSize: isMobile ? "13px" : "14px",
                        }}
                      >
                        Qty: {item.quantity} × {currency}
                        {price.toFixed(2)}
                      </p>
                    </div>
                    <div
                      style={{
                        fontWeight: "600",
                        minWidth: isMobile ? "60px" : undefined,
                        textAlign: "right",
                      }}
                    >
                      {currency}
                      {(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                borderTop: "1px solid #ddd",
                paddingTop: isMobile ? "12px" : "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "600",
                  }}
                >
                  Total:
                </span>
                <span
                  style={{
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: "700",
                    color: "var(--color-green-darkest)",
                  }}
                >
                  {totalPrice.toFixed(2)}{" "}
                  {cartItems.length > 0 &&
                  typeof cartItems[0].price === "string" &&
                  cartItems[0].price.includes("EGP")
                    ? "EGP"
                    : "$"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
