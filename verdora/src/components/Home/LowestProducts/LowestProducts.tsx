import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { addToCart } from "../../../redux/slices/cartSlice";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { loadWishlist, saveWishlist } from "../../../utils/wishlistStorage";
import "./LowestProducts.css";
import { supabase } from "./../../../SupbaseClient/SupbaseClint";


interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
    category: string;
    rate: string;
    stock: number;
}

const fetchProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from("products")
        .select("*");

    if (error) {
        console.error("Error fetching products:", error);
        throw new Error(error.message);
    }

    const products = data || [];


    const sorted = products
        .filter((p: any) => p.price) 
        .map((p: any) => ({
            ...p,
            numericPrice: typeof p.price === 'string' 
                ? parseFloat(p.price.replace(/[^\d.]/g, "")) 
                : p.price,
        }))
        .sort((a: any, b: any) => a.numericPrice - b.numericPrice);

    return sorted.slice(0, 8);
};

const LowestProducts: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data: lowestProducts, isLoading, isError } = useQuery<Product[]>({
        queryKey: ["lowestProducts"],
        queryFn: fetchProducts,
        staleTime: 1000 * 60 * 5,
    });

   const handleAddToCart = (product: Product) => {
  if (!product.stock || product.stock === 0) {
    toast.error(`${product.name} is out of stock!`);
    return;
  }
  const fullProduct = {
    ...product,
    id: String(product.id),
    description: "",
    bestseller: false,
    oldprice: "",
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
  dispatch(addToCart({ product: fullProduct, quantity: 1 }));
  toast.success(`${product.name} added to cart!`);
};
    const NextArrow = (props: any) => {
        const { onClick } = props;
        return (
            <div className="lp-final-arrow-next" onClick={onClick}>
                <FaChevronRight />
            </div>
        );
    };

    const PrevArrow = (props: any) => {
        const { onClick } = props;
        return (
            <div className="lp-final-arrow-prev" onClick={onClick}>
                <FaChevronLeft />
            </div>
        );
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 3 } },
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } },
        ],
    };

    const [wishlistMap, setWishlistMap] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const buildMap = () => {
            try {
                const list = loadWishlist();
                const map: { [key: string]: boolean } = {};
                if (Array.isArray(list)) {
                    list.forEach((item: any) => {
                        map[item.id] = true;
                    });
                }
                setWishlistMap(map);
            } catch {
                setWishlistMap({});
            }
        };
        buildMap();
        const onWishlistUpdated = () => buildMap();
        window.addEventListener("wishlistUpdated", onWishlistUpdated as EventListener);
        return () => window.removeEventListener("wishlistUpdated", onWishlistUpdated as EventListener);
    }, []);

    const toggleWishlist = (product: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const items = loadWishlist();

            const exists = items.some((p: any) => String(p.id) === String(product.id));
            if (exists) {
                // Remove
                const filtered = items.filter((p: any) => String(p.id) !== String(product.id));
                saveWishlist(filtered);
                setWishlistMap((prev) => ({ ...prev, [product.id]: false }));
                toast.success(`${product.name} removed from wishlist`);
            } else {
                // Add
                const item = {
                    id: product.id,
                    title: product.name,
                    price: product.price,
                    image: product.image,
                };
                const next = [...items, item];
                saveWishlist(next);
                setWishlistMap((prev) => ({ ...prev, [product.id]: true }));
                toast.success(`${product.name} added to wishlist`);
            }
            window.dispatchEvent(new Event("wishlistUpdated"));
        } catch {
            toast.error("Could not update wishlist");
        }
    };

    if (isLoading) {
        return (
            <div className="lp-final-loading-container">
                <ClipLoader
                    size={60}
                    color="#5b6d51"
                    cssOverride={{
                        borderColor: 'transparent',
                        borderTopColor: '#5b6d51',
                    }}
                />

            </div>
        );
    }

    if (isError) {
        return <p className="lp-final-error-message">Failed to load products. Please try again later.</p>;
    }

    return (
        <div className="lp-final-category-container">
            <h2 className="lp-final-category-slider-title">Lowest Priced Products</h2>

            <div className="lp-final-slider-wrapper">
                <Slider {...settings}>
                    {lowestProducts?.map((p) => (
                        <div key={p.id} className="lp-final-category-slide">
                            <div className="lp-final-image-container">
                                <img
                                    src={p.image}
                                    alt={p.name}
                                    className="lp-final-category-image"
                                    onClick={() => navigate(`/product/${p.id}`)}
                                />
                                <button
                                    className="lp-final-add-cart-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(p);
                                    }}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    className={`wishlist-overlay ${wishlistMap[p.id] ? "added" : ""}`}
                                    onClick={(e) => toggleWishlist(p, e)}
                                    title={wishlistMap[p.id] ? "Remove from wishlist" : "Add to wishlist"}
                                    type="button"
                                >
                                    {wishlistMap[p.id] ? (
                                        <IoHeart size={18} />
                                    ) : (
                                        <IoHeartOutline size={18} />
                                    )}
                                </button>
                            </div>
                            <div className="lp-final-details">
                                <h3 className="lp-final-name-explore">{p.name}</h3>
                                <p className="lp-final-price-explore">{p.price}</p>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default LowestProducts;