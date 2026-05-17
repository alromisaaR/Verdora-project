import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Logo from "../../assets/logo.png";
import {
  IoPersonOutline,
  IoCartOutline,
  IoClose,
  IoLogOutOutline,
  IoHeartOutline,
} from "react-icons/io5";
import { CiMenuFries } from "react-icons/ci";
import { RiArrowDropDownLine } from "react-icons/ri";
import { GoHistory } from "react-icons/go";
import { loadWishlist } from "../../utils/wishlistStorage";
import "./MainNavbar.css";

interface Category {
  name: string;
  path: string;
}

interface MainNavbarProps {
  onLogout: () => void;
  userName: string;
}

type ActiveLinkType = "home" | "products" | "categories";

const MainNavbar: React.FC<MainNavbarProps> = ({ onLogout}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<ActiveLinkType>("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState<boolean>(false);
  const [storedName, setStoredName] = useState<string>("");
  const [cartCount, setCartCount] = useState<number>(0);
  const [isCartAnimating, setIsCartAnimating] = useState<boolean>(false);


  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isWishAnimating, setIsWishAnimating] = useState<boolean>(false);

  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const categories: Category[] = [
    { name: "Indoor", path: "/categories/indoor" },
    { name: "Outdoor", path: "/categories/outdoor" },
    { name: "Flowering Plants", path: "/categories/flowering" },
    { name: "Bonsai & Miniature Plants", path: "/categories/bonsai_miniature" },
  ];

  const updateCartCount = (): void => {
    const cart = JSON.parse(localStorage.getItem("cart_items") || "[]");
    const previousCount = cartCount;
    const newCount = Array.isArray(cart) ? cart.length : 0;

    setCartCount(newCount);

    if (newCount > previousCount) {
      setIsCartAnimating(true);
      setTimeout(() => setIsCartAnimating(false), 600);
    }
  };

  const updateWishlistCount = (): void => {
    const wishlist = loadWishlist();
    const previous = wishlistCount;
    const newCount = Array.isArray(wishlist) ? wishlist.length : 0;
    setWishlistCount(newCount);
    if (newCount > previous) {
      setIsWishAnimating(true);
      setTimeout(() => setIsWishAnimating(false), 600);
    }
  };


  useEffect(() => {
    const nameFromStorage = localStorage.getItem("userName");
    setStoredName(nameFromStorage || "");
    updateCartCount();
    updateWishlistCount();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCartCount();
      updateWishlistCount();
    }, 1000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart_items") {
        updateCartCount();
      }
      if (e.key && e.key.startsWith("wishlist_items_")) {
        updateWishlistCount();
      }
    };

    const handleCartUpdate = () => {
      updateCartCount();
    };
    const handleWishlistUpdate = () => {
      updateWishlistCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [cartCount, wishlistCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = (): void => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsMobileDropdownOpen(false);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("orders_state");
    // also clear guest wishlist to avoid showing stale badge for guests
    localStorage.removeItem("wishlist_items_guest");

    setStoredName("");
    setWishlistCount(0);
    onLogout();
    navigate("/auth/signin", { replace: true });
  };

  const handleCategoryClick = (path: string): void => {
    setActiveLink("categories");
    setIsDropdownOpen(false);
    setIsMobileDropdownOpen(false);
    closeMenu();
    navigate(path);
  };

  const handleLinkClick = (link: ActiveLinkType): void => {
    setActiveLink(link);
    closeMenu();
  };

  return (
    <nav className="navbar navbar-light shadow-sm">
      <div className="container-fluid px-4">
        <div className="navbar-container">
          <Link
            className="navbar-brand d-flex align-items-center"
            to="/home"
            onClick={() => handleLinkClick("home")}
          >
            <img src={Logo} alt="logo" style={{ height: "80px", width: "220px" }} />
          </Link>


          <div className="navbar-nav-desktop">
            <Link
              className={`main-navbar ${activeLink === "home" ? "active" : ""}`}
              to="/home"
              onClick={() => handleLinkClick("home")}
            >
              Home
            </Link>
            <Link
              className={`main-navbar ${activeLink === "products" ? "active" : ""}`}
              to="/products"
              onClick={() => handleLinkClick("products")}
            >
              Products
            </Link>


            <div ref={categoriesDropdownRef} className="nav-item dropdown">
              <button
                className={`main-navbar dropdown-toggle-btn d-flex align-items-center ${activeLink === "categories" ? "active" : ""}`}
                onClick={() => {
                  setActiveLink("categories");
                  setIsDropdownOpen((prev) => !prev);
                }}
              >
                Categories <RiArrowDropDownLine size={22} />
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu show">
                  {categories.map((cat: Category) => (
                    <Link
                      key={cat.path}
                      to={cat.path}
                      className="dropdown-item"
                      onClick={() => handleCategoryClick(cat.path)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>


          <div className="navbar-icons-desktop">
            {storedName && (
              <span className="fw-bold text-success me-2 welcome">
                Welcome, {storedName}
              </span>
            )}

            <Link
              to="/wishlist"
              className={`btn position-relative btn-wishlist ${isWishAnimating ? "wish-animate" : ""}`}

              title="Wishlist"
            >
              <IoHeartOutline size={26} />
              {wishlistCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className={`btn position-relative btn-cart ${isCartAnimating ? "cart-animate" : ""}`}
            >
              <IoCartOutline size={26} />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/order" className="btn btn-orders">
              <GoHistory size={26} />
            </Link>

            <Link to="/profile" className="btn position-relative btn-cart">
              <IoPersonOutline size={26} />
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-logout"
              type="button"
              title="Logout"
            >
              <IoLogOutOutline size={26} />
            </button>
          </div>

          <button className="menu-toggle-btn" onClick={toggleMenu} type="button">
            <CiMenuFries size={28} />
          </button>
        </div>


        {isMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMenu}>
            <div
              className="mobile-menu-content"
              ref={mobileMenuRef}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-menu-btn" onClick={closeMenu} type="button">
                <IoClose size={32} />
              </button>

              <div className="mobile-nav-links">
                <Link
                  className={`main-navbar-mobile ${activeLink === "home" ? "active" : ""}`}
                  to="/home"
                  onClick={() => handleLinkClick("home")}
                >
                  Home
                </Link>

                <Link
                  className={`main-navbar-mobile ${activeLink === "products" ? "active" : ""}`}
                  to="/products"
                  onClick={() => handleLinkClick("products")}
                >
                  Products
                </Link>


                <div className="nav-item dropdown">
                  <button
                    className={`main-navbar-mobile d-flex align-items-center justify-content-between ${activeLink === "categories" ? "active" : ""}`}
                    onClick={() => {
                      setActiveLink("categories");
                      setIsMobileDropdownOpen((prev) => !prev);
                    }}
                  >
                    Categories
                    <RiArrowDropDownLine
                      size={25}
                      style={{
                        transform: isMobileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </button>

                  {isMobileDropdownOpen && (
                    <div className="mobile-dropdown-menu">
                      {categories.map((cat: Category) => (
                        <Link
                          key={cat.path}
                          to={cat.path}
                          className="dropdown-item"
                          onClick={() => handleCategoryClick(cat.path)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mobile-icons mt-3">
                {storedName && (
                  <p className="fw-bold text-success mb-2">Welcome, {storedName}</p>
                )}

                <Link
                  to="/wishlist"
                  className={`mobile-wish-btn ${isWishAnimating ? "wish-animate" : ""}`}

                  onClick={closeMenu}
                >
                  <IoHeartOutline size={26} /> Wishlist
                  {wishlistCount > 0 && (
                    <span className="ms-2 badge bg-danger">{wishlistCount}</span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className={`mobile-cart-btn ${isCartAnimating ? "cart-animate" : ""}`}
                  onClick={closeMenu}
                >
                  <IoCartOutline size={30} /> Cart
                  {cartCount > 0 && (
                    <span className="ms-2 badge bg-success">{cartCount}</span>
                  )}
                </Link>

                <Link to="/order" className="mobile-order-btn" onClick={closeMenu}>
                  <GoHistory size={25} /> Orders
                </Link>

                <Link to="/profile" className="mobile-profile-btn" onClick={closeMenu}>
                  <IoPersonOutline size={25} /> Profile
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="mobile-logout-btn"
                  type="button"
                >
                  <IoLogOutOutline size={25} /> Logout
                </button>
              </div>
            </div>
          </div>
        )
        }

      </div >
    </nav >
  );
};

export default MainNavbar;