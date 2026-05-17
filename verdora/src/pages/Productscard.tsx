import React, { useState, useEffect } from "react";
import type { Product } from "./Hooks";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import toast from "react-hot-toast";
import "../components/Home/ExploreProducts/ExploreProducts.css";
import "../styles/global.css";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { loadWishlist, saveWishlist } from "../utils/wishlistStorage";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductsCard({ product, onClick }: ProductCardProps) {
  const dispatch = useDispatch();

  // new state to track whether this product is in wishlist
  const [inWishlist, setInWishlist] = useState<boolean>(false);

  useEffect(() => {
    try {
      const list = loadWishlist();
      const exists = Array.isArray(list) && list.some((p: any) => String(p.id) === String(product.id));
      setInWishlist(Boolean(exists));
    } catch {
      setInWishlist(false);
    }

    const onWishlistUpdated = () => {
      try {
        const list = loadWishlist();
        const exists = Array.isArray(list) && list.some((p: any) => String(p.id) === String(product.id));
        setInWishlist(Boolean(exists));
      } catch {
        setInWishlist(false);
      }
    };

    window.addEventListener("wishlistUpdated", onWishlistUpdated as EventListener);
    return () => window.removeEventListener("wishlistUpdated", onWishlistUpdated as EventListener);
  }, [product.id]);

  const handleAddToCart = () => {
    if (!product.stock || product.stock === 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }

    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  // toggle wishlist (add/remove) and update UI immediately
  const addToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const list = loadWishlist();

      const existsIndex = list.findIndex((p: any) => String(p.id) === String(product.id));
      if (existsIndex >= 0) {
        // remove
        const next = [...list];
        next.splice(existsIndex, 1);
        saveWishlist(next);
        window.dispatchEvent(new Event("wishlistUpdated"));
        setInWishlist(false);
        toast.success(`${product.name} removed from wishlist`);
        return;
      }

      // add
      const item = {
  id: product.id,
  title: product.name ?? "Product",
  price: parseFloat(product.price) || 0,
  image: product.image,
};

      const next = [...list, item];
      saveWishlist(next);
      window.dispatchEvent(new Event("wishlistUpdated"));
      setInWishlist(true);
      toast.success(`${item.title} added to wishlist`);
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  const { name, image, price, oldprice } = product;

  const extractNumber = (value: string | undefined): number => {
    if (!value) return 0;
    const match = value.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  const old = extractNumber(product.oldprice);
  const current = extractNumber(product.price);

  const discountPercentage =
    old && current ? Math.round(((old - current) / old) * 100) : 0;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div
        className="product-card-explore text-center"
        style={{
          border: "none",
          fontFamily: "var(--font-family-serif)",
          color: "var(--color-green-darkest)",
          // height:"370px"
        }}
      >
        <div className="product-image-wrapper-explore">
          <img
            src={image}
            className="card-img-top product-image-explore"
            alt="..."
            onClick={onClick}
            style={{ cursor: "pointer" }}
          />

          {oldprice && <span className="badge onsale">SALE</span>}

          {discountPercentage > 0 && (
            <>
              <span className="badge discount">-{discountPercentage}%</span>
            </>
          )}

          <button
            className={`wishlist-overlay ${inWishlist ? "added" : ""}`}
            onClick={addToWishlist}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            type="button"
            aria-label="Toggle wishlist"
          >
            {inWishlist ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
          </button>

          <button className="add-to-cart-overlay" onClick={handleAddToCart}>
            {" "}
            Add to Cart
          </button>
        </div>

        <div>
          <div className="product-info-explore">
            <h5 className="card-title fw-bold  product-name-explore">
              {" "}
              {name ? name.split(" ").splice(0, 2).join(" ") : "No title"}
            </h5>
            <div>
              <p className="product-price-explore">{price}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
