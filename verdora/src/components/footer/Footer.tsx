import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaLeaf } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import Logo from '../../assets/logo.png';
import "./footer.css";

const Footer: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLLIElement>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (): void => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleCategoryClick = (): void => {
        setIsDropdownOpen(false);
    };

    return (
        <footer className="footer">
            <div className="footer-container">

                <div className="footer-section footer-about">
                    <div className="footer-logo">
                        <img
                            src={Logo}
                            alt="Verdora Logo"
                            className="logo-img"
                        />
                    </div>
                    <p className="footer-text">
                        Bringing nature closer to you — explore indoor, outdoor, and flowering plants
                        for every home and space.
                    </p>
                </div>


                <div className="footer-section footer-links-section">
                    <h5 className="footer-title">Quick Links</h5>
                    <ul className="footer-links">
                        <li><Link to="/home">Home</Link></li>
                        <li><Link to="/products">Products</Link></li>


                        <li className="footer-dropdown" ref={dropdownRef}>
                            <span
                                className="dropdown-title"
                                onClick={toggleDropdown}
                            >
                                Categories
                                <RiArrowDropDownLine
                                    size={22}
                                    style={{
                                        transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        transition: "transform 0.3s ease",
                                    }}
                                />
                            </span>

                            {isDropdownOpen && (
                                <ul className="footer-dropdown-menu show">
                                    <li>
                                        <Link
                                            to="/categories/indoor"
                                            onClick={handleCategoryClick}
                                        >
                                            Indoor
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/categories/outdoor"
                                            onClick={handleCategoryClick}
                                        >
                                            Outdoor
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/categories/flowering"
                                            onClick={handleCategoryClick}
                                        >
                                            Flowering
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/categories/bonsai_miniature"
                                            onClick={handleCategoryClick}
                                        >
                                            Bonsai & Miniature
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>


                <div className="footer-section footer-social-section">
                    <h5 className="footer-title">Follow Us</h5>
                    <div className="footer-social">
                        <a href="#" aria-label="Facebook" className="social-link">
                            <FaFacebookF />
                        </a>
                        <a href="#" aria-label="Instagram" className="social-link">
                            <FaInstagram />
                        </a>
                        <a href="#" aria-label="Twitter" className="social-link">
                            <FaTwitter />
                        </a>
                    </div>
                    <div className="footer-contact">
                        <p>
                            <span className="black-icon">📧</span>
                            support@verdora.com
                        </p>
                        <p>
                            <span className="black-icon">📞</span>
                            +1 234 567 890
                        </p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Verdora<FaLeaf className="footer-leaf" /> All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;