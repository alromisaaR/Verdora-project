import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Product } from "../../Types/Products";
import { supabase } from "../../SupbaseClient/SupbaseClint";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[]>(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("products").select("*");

      if (error) throw error;

      console.log("Supabase Raw Data:", data);

      const productsWithStringIds = (data || []).map((product: any) => ({
        ...product,
        id: String(product.id),
      }));

      return productsWithStringIds;
    } catch (error: any) {
      console.error("Error fetching products from Supabase:", error);
      return rejectWithValue(error.message || "Failed to load products");
    }
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        console.log("Products loaded successfully:", action.payload.length);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load products";
        console.error("Products loading failed:", action.payload);
      });
  },
});

export default productsSlice.reducer;
