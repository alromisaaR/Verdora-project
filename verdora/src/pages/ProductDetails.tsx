import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import type { Product } from "../Types/Products";
import { fetchProducts } from "../redux/slices/productsSlice";
import { addToCart } from "../redux/slices/cartSlice";
import Loader from "../pages/Loader/Loader";
import { toast } from "react-hot-toast";
import "../styles/global.css";
import { loadWishlist, saveWishlist } from "../utils/wishlistStorage";

interface ProductDetailsProps {}

interface QuantityState {
  value: number;
}

const ProductDetails: React.FC<ProductDetailsProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.products,
  );

  const [quantity, setQuantity] = useState<QuantityState>({ value: 1 });
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchProducts());
    window.scrollTo(0, 0);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const productId = Number(id);
      console.log("Searching for product ID:", productId);
      console.log(
        "Available products:",
        products.map((p) => ({
          id: p.id,
          name: p.name,
          rate: p.rate,
        })),
      );

      const found = products.find((p) => Number(p.id) === productId);

      if (found) {
        console.log("Product found:", found);
        console.log("Product rate:", found.rate);
        console.log("Product stock:", found.stock);
      } else {
        console.log("Product not found!");
        console.log(
          "Available IDs:",
          products.map((p) => p.id),
        );
      }

      setProduct(found);
    }
  }, [loading, products, id]);

  useEffect(() => {
    if (product) {
      const list = loadWishlist();
      const exists = list.some((p: any) => String(p.id) === String(product.id));
      setIsInWishlist(exists);
    }
  }, [product]);

  const handleAddToCart = (): void => {
    if (product) {
      dispatch(addToCart({ product, quantity: quantity.value }));
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleAddToWishlist = (): void => {
    if (!product) return;
    try {
      const list = loadWishlist();
      const exists = list.some((p: any) => String(p.id) === String(product.id));

      if (exists) {
        // Remove from wishlist
        const updatedList = list.filter(
          (p: any) => String(p.id) !== String(product.id),
        );
        saveWishlist(updatedList);
        setIsInWishlist(false);
        toast.success(`${product.name} removed from wishlist!`);
        return;
      }

      // Add to wishlist
      const wishlistItem = {
  id: product.id,
  title: product.name || "Product",
  price: parseFloat(product.price) || 0,
  image: product.image,
};
      list.push(wishlistItem);
      saveWishlist(list);
      setIsInWishlist(true);
      toast.success(`${wishlistItem.title} added to wishlist!`);
    } catch (err) {
      toast.error("Could not update wishlist");
    }
  };

  const handleQuantityChange = (action: "increment" | "decrement"): void => {
    setQuantity((prev) => ({
      value:
        action === "increment" ? prev.value + 1 : Math.max(1, prev.value - 1),
    }));
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 20px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontSize: "18px",
          color: "#d32f2f",
        }}
      >
        {error}
      </div>
    );

  if (!product)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 20px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontSize: "18px",
          color: "#999",
        }}
      >
        Product not found
      </div>
    );

  const relatedProducts: Product[] = products
    .filter(
      (p: Product) => p.category === product.category && p.id !== product.id,
    )
    .slice(0, 4);

  const productImages = [product.image];
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        fontFamily: "var(--font-family-sans-serif)",
        paddingTop: isMobile ? "20px" : "40px",
        paddingBottom: isMobile ? "40px" : "60px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        {/* BREADCRUMB */}
        <div
          style={{
            marginBottom: isMobile ? "24px" : "40px",
            fontSize: isMobile ? "13px" : "15px",
            color: "#999",
          }}
        >
          <Link to="/" style={{ color: "#999", textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link
            to={`/categories/${product.category}`}
            style={{ color: "#999", textDecoration: "none" }}
          >
            {product.category}
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#333" }}>{product.name}</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "32px" : "60px",
            alignItems: "start",
            gridTemplateRows: "auto",
          }}
        >
          {/* LEFT SIDE - IMAGE GALLERY */}
          <div>
            {/* Main Image */}
            <div
              style={{
                marginBottom: isMobile ? "16px" : "20px",
                backgroundColor: "#fff",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <img
                src={productImages[activeImageIndex]}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "auto",
                  minHeight: isMobile ? "400px" : "600px",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: isMobile ? "8px" : "10px",
                  flexWrap: "wrap",
                }}
              >
                {productImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: isMobile ? "60px" : "70px",
                      height: isMobile ? "60px" : "70px",
                      border:
                        activeImageIndex === idx
                          ? "2px solid #333"
                          : "1px solid #ddd",
                      borderRadius: "2px",
                      padding: "0",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      overflow: "hidden",
                      transition: "border 0.2s ease",
                    }}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE - PRODUCT DETAILS */}
          <div>
            {/* Title & Category */}
            <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
              <div
                style={{
                  fontSize: isMobile ? "12px" : "15px",
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: isMobile ? "8px" : "12px",
                }}
              >
                {product.category}
              </div>
              <h1
                style={{
                  fontSize: isMobile ? "24px" : "36px",
                  fontWeight: "700",
                  margin: "0 0 20px 0",
                  lineHeight: "1.2",
                  color: "#333",
                }}
              >
                {product.name}
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "2px", color: "#f0c040" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{ fontSize: isMobile ? "12px" : "14px" }}
                  >
                    {i < Math.floor(Number(product.rate || 4.5)) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <span
                style={{ fontSize: isMobile ? "12px" : "13px", color: "#999" }}
              >
                ({product.stock || 0} InStock)
              </span>
            </div>

            {/* Price */}
            <div
              style={{
                marginBottom: "32px",
                display: "flex",
                alignItems: "baseline",
                gap: isMobile ? "8px" : "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? "28px" : "38px",
                  fontWeight: "700",
                  color: "#333",
                }}
              >
                {product.price}
              </span>
              {product.oldprice && (
                <span
                  style={{
                    fontSize: isMobile ? "16px" : "18px",
                    color: "#999",
                    textDecoration: "line-through",
                  }}
                >
                  {product.oldprice}
                </span>
              )}
            </div>

            {/* Quick Info Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: isMobile ? "16px" : "20px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  padding: isMobile ? "16px" : "20px",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? "11px" : "12px",
                    color: "#999",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  ☀️ Sunlight
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {product.sunlight || "N/A"}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  padding: isMobile ? "16px" : "20px",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? "11px" : "12px",
                    color: "#999",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  💧 Water
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {product.wateringNeeds || "N/A"}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "32px", lineHeight: "1.6" }}>
              <p
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  color: "#666",
                  margin: "0",
                }}
              >
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "16px" : "20px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? "13px" : "14px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Quantity:
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => handleQuantityChange("decrement")}
                  disabled={quantity.value <= 1}
                  style={{
                    width: isMobile ? "36px" : "40px",
                    height: isMobile ? "36px" : "40px",
                    border: "none",
                    backgroundColor: "#f5f5f5",
                    cursor: quantity.value <= 1 ? "not-allowed" : "pointer",
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "600",
                    color: quantity.value <= 1 ? "#ccc" : "#333",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    width: isMobile ? "40px" : "50px",
                    textAlign: "center",
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {quantity.value}
                </span>
                <button
                  onClick={() => handleQuantityChange("increment")}
                  style={{
                    width: isMobile ? "36px" : "40px",
                    height: isMobile ? "36px" : "40px",
                    border: "none",
                    backgroundColor: "#f5f5f5",
                    cursor: "pointer",
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart & Wishlist Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: isMobile ? "14px" : "16px",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: isMobile ? "13px" : "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#555")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#333")
                }
              >
                ADD TO CART
              </button>

              <button
                onClick={handleAddToWishlist}
                style={{
                  width: isMobile ? "52px" : "56px",
                  height: isMobile ? "48px" : "52px",
                  backgroundColor: isInWishlist
                    ? "var(--color-green-darker)"
                    : "#fff",
                  color: isInWishlist ? "#fff" : "#333",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  if (!isInWishlist) {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isInWishlist) {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }
                }}
              >
                ♥
              </button>
            </div>

            {/* Additional Info */}
            <div
              style={{
                borderTop: "1px solid #e0e0e0",
                paddingTop: isMobile ? "24px" : "32px",
                marginTop: isMobile ? "24px" : "32px",
              }}
            >
              <h3
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "20px",
                  color: "#333",
                }}
              >
                Plant Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: isMobile ? "16px" : "24px",
                  fontSize: isMobile ? "12px" : "13px",
                }}
              >
                <div>
                  <div style={{ color: "#999", marginBottom: "6px" }}>
                    Scientific Name
                  </div>
                  <div style={{ color: "#333", fontWeight: "600" }}>
                    {product.scientificName || "N/A"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#999", marginBottom: "6px" }}>
                    Native Region
                  </div>
                  <div style={{ color: "#333", fontWeight: "600" }}>
                    {product.nativeRegion || "N/A"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#999", marginBottom: "6px" }}>
                    Mature Height
                  </div>
                  <div style={{ color: "#333", fontWeight: "600" }}>
                    {product.height || "N/A"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#999", marginBottom: "6px" }}>
                    Life Cycle
                  </div>
                  <div style={{ color: "#333", fontWeight: "600" }}>
                    {product.lifeCycle || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div
          style={{
            marginTop: isMobile ? "60px" : "80px",
            paddingTop: isMobile ? "40px" : "60px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: "700",
              marginBottom: "32px",
              color: "#333",
            }}
          >
            Description
          </h2>
          <div
            style={{
              maxWidth: "600px",
              lineHeight: "1.8",
              color: "#666",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            <p>{product.description}</p>
            {product.review && (
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  padding: isMobile ? "16px" : "24px",
                  borderRadius: "4px",
                  marginTop: "32px",
                  fontStyle: "italic",
                  borderLeft: "3px solid #333",
                }}
              >
                <p style={{ margin: "0", color: "#666" }}>"{product.review}"</p>
              </div>
            )}
          </div>
        </div>

        {/* CARE GUIDE SECTION */}
        <div
          style={{
            marginTop: isMobile ? "60px" : "80px",
            paddingTop: isMobile ? "40px" : "60px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: "700",
              marginBottom: "32px",
              color: "#333",
            }}
          >
            Care Guide
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(280px, 1fr))",
              gap: isMobile ? "32px" : "40px",
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "16px",
                  color: "#333",
                }}
              >
                💧 Watering & Light
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: "0",
                  margin: "0",
                  fontSize: isMobile ? "13px" : "14px",
                  lineHeight: "1.8",
                  color: "#666",
                }}
              >
                <li>
                  <strong>Watering Needs:</strong>{" "}
                  {product.wateringNeeds || "N/A"}
                </li>
                <li>
                  <strong>Sunlight:</strong> {product.sunlight || "N/A"}
                </li>
                <li>
                  <strong>Humidity:</strong> {product.humidity || "N/A"}
                </li>
              </ul>
            </div>
            <div>
              <h4
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "16px",
                  color: "#333",
                }}
              >
                🌱 Growth & Characteristics
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: "0",
                  margin: "0",
                  fontSize: isMobile ? "13px" : "14px",
                  lineHeight: "1.8",
                  color: "#666",
                }}
              >
                <li>
                  <strong>Growth Rate:</strong> {product.growthRate || "N/A"}
                </li>
                <li>
                  <strong>Height:</strong> {product.height || "N/A"}
                </li>
                <li>
                  <strong>Type:</strong> {product.type || "N/A"}
                </li>
              </ul>
            </div>
            <div>
              <h4
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "16px",
                  color: "#333",
                }}
              >
                🌍 Environment & Soil
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: "0",
                  margin: "0",
                  fontSize: isMobile ? "13px" : "14px",
                  lineHeight: "1.8",
                  color: "#666",
                }}
              >
                <li>
                  <strong>Climate:</strong> {product.climate || "N/A"}
                </li>
                <li>
                  <strong>Soil Type:</strong> {product.soilType || "N/A"}
                </li>
                <li>
                  <strong>Container Type:</strong>{" "}
                  {product.containerType || "N/A"}
                </li>
              </ul>
            </div>
          </div>
          {product.careTips && (
            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: isMobile ? "16px" : "24px",
                borderRadius: "4px",
                marginTop: "32px",
                borderLeft: "3px solid #333",
              }}
            >
              <h5
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                💡 Pro Care Tips
              </h5>
              <p
                style={{
                  margin: "0",
                  fontSize: isMobile ? "13px" : "14px",
                  lineHeight: "1.6",
                  color: "#666",
                }}
              >
                {product.careTips}
              </p>
            </div>
          )}
        </div>

        {/* YOU MAY ALSO LIKE */}
        {relatedProducts.length > 0 && (
          <div
            style={{
              marginTop: isMobile ? "60px" : "80px",
              paddingTop: isMobile ? "40px" : "60px",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <h2
              style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: "700",
                marginBottom: isMobile ? "32px" : "40px",
                color: "#333",
                textAlign: "center",
              }}
            >
              You May Also Like
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(240px, 1fr))",
                gap: isMobile ? "24px" : "40px",
              }}
            >
              {relatedProducts.map((item: Product) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ cursor: "pointer" }}>
                    <div
                      style={{
                        marginBottom: "16px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={
                          typeof item.image === "string"
                            ? item.image
                            : item.image[0]
                        }
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: isMobile ? "240px" : "280px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                    <h3
                      style={{
                        fontSize: isMobile ? "13px" : "14px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "#333",
                        minHeight: "36px",
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      style={{
                        fontSize: isMobile ? "12px" : "13px",
                        color: "#999",
                        marginBottom: "12px",
                        lineHeight: "1.4",
                        minHeight: isMobile ? "32px" : "39px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: isMobile ? "14px" : "15px",
                          fontWeight: "700",
                          color: "#333",
                        }}
                      >
                        {item.price}
                      </span>
                      {item.oldprice && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#999",
                            textDecoration: "line-through",
                          }}
                        >
                          {item.oldprice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
