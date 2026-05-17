import "../styles/global.css"
import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  bestseller?: boolean;
  isNew?: boolean;
  image?: string;
  rate?: string;
  category: string;
  oldprice: string;
  stock?: number;
  [key: string]: unknown;
}

export type { Product };

let cachedProducts: Product[] = [];

export default function UseProducts() {
  const [products, setProducts] = useState<Product[]>(cachedProducts);
  const [filter, setFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  async function getproducts() {
    if (cachedProducts.length > 0) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error) throw error;

      const fixedData = (data as Product[]).map(p => ({ ...p, id: String(p.id) }));
      cachedProducts = fixedData;
      setProducts(fixedData);
    } catch (error) {
      console.error(error);
    }
  }

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
