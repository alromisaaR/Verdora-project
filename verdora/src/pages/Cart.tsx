import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { RootState, AppDispatch } from "../redux/store";
import {
  removeFromCart,
  clearCart,
  updateCartForUser,
} from "../redux/slices/cartSlice";

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.auth.user);

  // Keep cart synced when user changes (login/logout)
  useEffect(() => {
    dispatch(updateCartForUser());
  }, [user, dispatch]);

  // If user not logged in
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2>Please log in to view your cart</h2>
        <Link to="/auth/signin" style={{ color: "#2e7d32", textDecoration: "none" }}>
          Go to Sign In
        </Link>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2 style={{fontFamily: "var(--font-family-serif)"}}>Your cart is empty</h2>
        <Link to="/" style={{ color: "#2e7d32", textDecoration: "none", fontFamily: "var(--font-family-serif)" }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  //Calculate total
  const totalPrice = cartItems.reduce((sum, item) => {
    const price =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^\d.]/g, ""))
        : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        padding: "40px 30px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          marginBottom: "32px",
          color: "#1b5e20",
          textAlign: "center",
          fontFamily: "var(--font-family-serif)"
        }}
      >
        Your Cart
      </h1>

      {cartItems.map((item) => {
        const productName = item.name || "Product";
        const productImage =
          typeof item.image === "string" ? item.image : item.image[0] || "";
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
              gap: "20px",
              marginBottom: "24px",
              borderBottom: "1px solid #eee",
              paddingBottom: "16px",
              fontFamily: "var(--font-family-serif)",
            }}
          >
            <img
              src={productImage}
              alt={productName}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 8px 0" }}>{productName}</h3>
              <p style={{ margin: "0 0 8px 0", color: "#555" }}>
                {item.quantity} × {currency}
                {price.toFixed(2)}
              </p>
              {/* <p style={{ fontWeight: "700", margin: 0 }}>
                Subtotal: {currency}
                {(price * item.quantity).toFixed(2)}
              </p> */}
            </div>

          {/* <button>
  onClick={() => dispatch(removeFromCart(item.id))}
  style={{
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  }}
  onMouseEnter={(e) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#f44336"; // lighter red
    (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#e53935"; // original red
    (e.target as HTMLButtonElement).style.transform = "scale(1)";
  }}
>
  Remove
</button> */}


              <div style={{display: "flex", gap: "20px"}}>
               <p style={{ fontWeight: "700", margin: 0 }}>
                {currency}
                {(price * item.quantity).toFixed(2)}
              </p>
            {/* <button
              onClick={() => dispatch(removeFromCart(item.id))}
              style={{
                backgroundColor: "#e53935",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Remove
            </button> */}

            <p className="circle"  style={{fontSize: "12px"}}onClick={() => dispatch(removeFromCart(String(item.id)))}>X</p>
            </div>
          </div>
          
        );
      })}

      <h2
        style={{
          marginTop: "32px",
          color: "#1b5e20",
          textAlign: "right",
            fontFamily: "var(--font-family-serif)"
        }}
      >
        Total: {totalPrice.toFixed(2)}{" "}
        {typeof cartItems[0].price === "string" &&
        cartItems[0].price.includes("EGP")
          ? "EGP"
          : "$"}
      </h2>

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          marginTop: "16px",
            fontFamily: "var(--font-family-serif)"
        }}
      >
        <button
  onClick={() => dispatch(clearCart())}
  style={{
    padding: "12px 20px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  }}
  onMouseEnter={(e) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#868e96"; // lighter gray
    (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#6c757d"; // original gray
    (e.target as HTMLButtonElement).style.transform = "scale(1)";
  }}
>
  Clear Cart
</button>

       <button
  onClick={() => navigate("/checkout")}
  style={{
    padding: "12px 20px",
    backgroundColor: "#1b5e20",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  }}
  onMouseEnter={(e) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#2e7d32"; 
    (e.target as HTMLButtonElement).style.transform = "scale(1.05)";   
  }}
  onMouseLeave={(e) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#1b5e20"; // original color
    (e.target as HTMLButtonElement).style.transform = "scale(1)";      // normal size
  }}
>
  Proceed to Checkout
</button>


      </div>
    </div>
  );
};

export default Cart;
