import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { addToCart } from "../redux/slices/cartSlice";
import "../styles/global.css";
import { IoCartOutline } from "react-icons/io5";
import {
  loadWishlist,
  removeFromWishlistById,
  clearWishlist,
} from "../utils/wishlistStorage";

type Product = {
  id: number | string;
  title?: string;
  price?: number;
  image?: string;
  [key: string]: any;
};

const Wishlish: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState<Product[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string>("");
  const authUser = useSelector((state: RootState) => state.auth.user);

  const load = () => {
    setItems(loadWishlist());
  };

  useEffect(() => {
    load();
    const onStorage = () => load();
    window.addEventListener("storage", onStorage);
    window.addEventListener("wishlistUpdated", onStorage as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wishlistUpdated", onStorage as EventListener);
    };
  }, []);

  useEffect(() => {
    // reload wishlist when logged-in user changes
    load();
  }, [authUser]);

  const removeFromWishlist = (id: number | string) => {
    const next = removeFromWishlistById(id);
    setItems(next);
  };

  const moveAllToCart = () => {
    try {
      // Add each wishlist item to cart using Redux dispatch
      items.forEach((item) => {
        const cartItem = {
          id: item.id,
          name: item.title || item.name || "Product",
          price: String(item.price || 0),
          image: item.image || "",
          quantity: 1,
          description: "",
        category: "",
        stock: 0,
        bestseller: false,
        oldprice: "",
        rate: "",
        review: "",
        discount: "",
        isNew: false,
        scientificName: "",
        nativeRegion: "",
        lifeCycle: "",
        genus: "",
        type: "",
        climate: "",
        soilType: "",
        wateringNeeds: "",
        sunlight: "",
        humidity: "",
        growthRate: "",
        propagation: "",
        toxicity: "",
        careTips: "",
        floweringSeason: "",
        height: "",
        containerType: "",
        };

        dispatch(addToCart({ product: cartItem, quantity: 1 }));
      });

      // Clear wishlist
      clearWishlist();
      setItems([]);

      // Navigate to cart
      navigate("/cart");
    } catch (err) {
      console.error("Failed to move items to cart:", err);
    }
  };

  if (!items.length) {
    return (
      <div
        className="wishlist-page container py-5 checkout-page"
        style={{ minHeight: "70vh" }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
            paddingTop: "80px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              marginBottom: "24px",
              opacity: 0.3,
            }}
          >
            🌿
          </div>
          <h1
            style={{
              color: "var(--color-green-darker)",
              fontSize: "32px",
              fontWeight: "700",
              marginBottom: "16px",
            }}
          >
            Your Wishlist is Empty
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "16px",
              marginBottom: "32px",
            }}
          >
            Start adding your favorite plants to your wishlist and watch your
            garden dreams grow!
          </p>
          <Link
            to="/products"
            className="btn btn-outline-success"
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Explore Our Plants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="wishlist-page container py-5 checkout-page"
      style={{ maxWidth: "1400px" }}
    >
      <div style={{ marginBottom: "48px" }}>
        <h1
          style={{
            color: "var(--color-green-darker)",
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          My Wishlist
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "16px",
          }}
        >
          {items.length} {items.length === 1 ? "plant" : "plants"} waiting to
          join your collection
        </p>
      </div>

      <div className="row g-3">
        {items.map((p) => (
          <div key={p.id} className="col-6 col-sm-6 col-md-4 col-lg-3">
            <div
              className="card h-100"
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                overflow: "hidden",
                transition: "all 0.3s ease",
                boxShadow:
                  hoveredCard === p.id
                    ? "0 8px 24px rgba(0,0,0,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                transform:
                  hoveredCard === p.id ? "translateY(-8px)" : "translateY(0)",
              }}
              onMouseEnter={() => setHoveredCard(p.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {p.image && (
                <div
                  style={{
                    position: "relative",
                    paddingTop: "100%",
                    overflow: "hidden",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <img
                    src={p.image}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt={p.title || "product"}
                  />
                </div>
              )}
              <div
                className="card-body d-flex flex-column ms-2"
                style={{ padding: "5px" }}
              >
                <h5
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "4px",
                    minHeight: "34px",
                    lineHeight: "1.3",
                  }}
                >
                  {p.title || "Product"}
                </h5>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "var(--color-green-darker)",
                    marginBottom: "10px",
                  }}
                >
                  {p.price ? `${p.price}` : ""}
                </p>
                <div className="mt-auto d-flex gap-2">
                  <Link
                    to={`/product/${p.id}`}
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      borderRadius: "8px",
                      fontWeight: "600",
                      border: "2px solid var(--color-green-darker)",
                      color: "var(--color-green-darker)",
                      backgroundColor: "transparent",
                      transition: "all 0.2s ease",
                      padding: "8px 12px",
                      fontSize: "13px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-green-darker)";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--color-green-darker)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    👁️ View
                  </Link>
                  <button
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      borderRadius: "8px",
                      fontWeight: "600",
                      border: "2px solid #dc3545",
                      color: "#fff",
                      backgroundColor: "#dc3545",
                      transition: "all 0.2s ease",
                      padding: "8px 12px",
                      fontSize: "13px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#c82333";
                      e.currentTarget.style.borderColor = "#c82333";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc3545";
                      e.currentTarget.style.borderColor = "#dc3545";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onClick={() => removeFromWishlist(p.id)}
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "48px",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <button
          className="btn btn-lg"
          style={{
            backgroundColor:
              hoveredButton === "moveAll"
                ? "var(--color-green-dark)"
                : "var(--color-green-darker)",
            color: "#fff",
            width: "100%",
            padding: "16px 0",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "700",
            transition: "all 0.3s ease",
            transform:
              hoveredButton === "moveAll"
                ? "translateY(-2px)"
                : "translateY(0)",
            boxShadow:
              hoveredButton === "moveAll"
                ? "0 6px 20px rgba(76, 175, 80, 0.3)"
                : "0 4px 16px rgba(76, 175, 80, 0.2)",
          }}
          onMouseEnter={() => setHoveredButton("moveAll")}
          onMouseLeave={() => setHoveredButton("")}
          onClick={moveAllToCart}
          aria-label="Move all wishlist items to cart"
        >
          <IoCartOutline
            size={22}
            style={{ marginRight: "8px", marginTop: "-1px" }}
          />
          Move All to Cart ({items.length})
        </button>
      </div>
    </div>
  );
};

export default Wishlish;
