import "../../styles/global.css"
import ProductsCard from "../../pages/Productscard";
import UseProducts from '../../pages/Hooks';
import type {Product} from "../Hooks"
import CardLoader from "../../components/CardLoader/CardLoader";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import NotFound from "../../components/common/NotFound";


export default function Indoor() {
const { displayedProducts, filter, setFilter, searchTerm, setSearchTerm,goToDetails} = UseProducts();
const [searchOpen, setSearchOpen] = useState(false);
const categoryProducts = displayedProducts.filter(
  (product) => product.category === "Indoor"
);

   return (
    <>
     <Helmet>
      <title>Indoor Plants</title>
      <meta name="description" content="Verdora - Explore our beautiful house plants" />
      <meta name="keywords" content="plants, house plants, verdora, garden" />
    </Helmet>

    <div style={{height:"200px", width: "100%", backgroundImage:"url('https://i.pinimg.com/1200x/98/85/f3/9885f38dc02d4aad94ffe92bfc728894.jpg')", backgroundSize: "cover",  
    backgroundPosition: "center", 
    backgroundRepeat: "no-repeat",opacity: .9,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}>
    
    <h1 className="text-light ms-md-2" style={{fontSize: "60px", fontFamily: "var(--font-family-serif)"}}>INDOOR PLANTS</h1>
    </div>


    <div className="container">
         <div  className={` search-bar-wrapper mt-3 mb-3 ${searchOpen ? "open-margin" : ""}`}     
          >
           <select
             style={{ height: "30px", borderRadius: "5px" }}
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
 
           <div className="search-container" style={{backgroundColor: "#ffffff"}}>
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
   
   <div className="contaier p-5" style={{backgroundColor: "#ffffff"}}>
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
  )
}
