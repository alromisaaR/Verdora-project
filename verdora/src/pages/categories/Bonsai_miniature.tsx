import "../../styles/global.css";
import ProductsCard from "../../pages/Productscard";
import UseProducts from "../../pages/Hooks";
import type { Product } from "../Hooks";
import CardLoader from "../../components/CardLoader/CardLoader";
// import Bonsaie from '../../assets/bonsoi.jpg';
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import NotFound from "../../components/common/NotFound";
import { Helmet } from "react-helmet-async";

export default function Bonsai_miniature() {
  const {
    displayedProducts,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    goToDetails,
  } = UseProducts();
  const [searchOpen, setSearchOpen] = useState(false);
  const categoryProducts = displayedProducts.filter(
    (product) => product.category === "bonsai_miniature"
  );

  return (
    <>
      <Helmet>
        <title>Bonsai-miniture Plants</title>
        <meta
          name="description"
          content="Verdora - Explore our beautiful house plants"
        />
        <meta name="keywords" content="plants, house plants, verdora, garden" />
      </Helmet>

      <div
        style={{
          height: "200px",
          width: "100%",
          backgroundImage:
            "url('https://i.pinimg.com/1200x/2a/87/be/2a87be0f62dea3adc5922cfeb3db6538.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1
          className="text-light"
          style={{ fontSize: "60px", fontFamily: "var(--font-family-serif)" }}
        >
          BONSAI & MINIATURE PLANTS
        </h1>
      </div>

      <div className="container">
        <div
          className={` search-bar-wrapper mt-3 mb-3 ${
            searchOpen ? "open-margin" : ""
          }`}
        >
          <select
            style={{
              height: "30px",
              borderRadius: "5px",
              backgroundColor: "#ffffff",
            }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="custom-select cuustom"
          >
            <option value="">Select</option>
            <option value="sale">sale</option>
            <option value="bestSelling">Best Selling</option>
            <option value="newArrival">New Arrival</option>
            <option value="priceHighLow">Price from High to Low</option>
            <option value="priceLowHigh">Price from Low to High</option>
          </select>

          <div
            className="search-container"
            style={{ backgroundColor: "#ffffff" }}
          >
            <button
              className="search-icon-btn"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <FaSearch />
            </button>
            <input
              type="text"
              placeholder="Search..."
              className={`search-input-slide ${searchOpen ? "open" : ""}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container p-5" style={{ backgroundColor: "#ffffff" }}>
        <div className="row gy-3">
          {categoryProducts.length === 0 ? (
            <div className="notfound-wrapper">
              <NotFound />
            </div>
          ) : categoryProducts.length ? (
            categoryProducts.map((product: Product) => (
              <ProductsCard
                product={product}
                key={product.id}
                onClick={() => goToDetails(product.id)}
              />
            ))
          ) : (
            Array.from({ length: 15 }).map((_, i) => <CardLoader key={i} />)
          )}
        </div>
      </div>
    </>
  );
}
