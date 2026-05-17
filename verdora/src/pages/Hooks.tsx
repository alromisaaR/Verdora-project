import "../styles/global.css"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Products } from "../Types/Products"
,import { supabase } from "../SupbaseClient/SupbaseClint";


export type { Products as Product };

let cachedProducts: Products[] = [];

 

  export default function UseProducts() {
  const [products, setProducts] = useState<Products[]>(cachedProducts);
  
  async function getproducts() {
    if (cachedProducts.length > 0) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error) throw error;

      const fixedData = (data as Products[]).map(p => ({ ...p, id: String(p.id) }));
      cachedProducts = fixedData;
      setProducts(fixedData);
    } catch (error) {
      console.error(error);
    }
  }

   const [filter, setFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const goToDetails = (id: string) => {
    navigate(`/product/${id}`);
  }

  useEffect(() => {
    getproducts();
  }, []);



  let displayedProducts = products;

  if (filter === "bestSelling") displayedProducts = products.filter(p => p.bestseller);
  if (filter === "newArrival") displayedProducts = products.filter(p => p.isNew);
  if (filter === "sale") displayedProducts = products.filter(p => p.oldprice);
  if (filter === "alphabetical") displayedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
  if (filter === "priceHighLow") displayedProducts = [...products].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  if (filter === "priceLowHigh") displayedProducts = [...products].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  if (searchTerm) {
    displayedProducts = displayedProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return { displayedProducts, filter, setFilter, searchTerm, setSearchTerm, goToDetails }
}

