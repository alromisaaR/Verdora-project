import { createSlice } from "@reduxjs/toolkit";
import type { Product } from "../../Types/Products";

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}


const getCartKey = (): string => {
  const user = localStorage.getItem("loggedInUser");
  if (user) {
    const userData = JSON.parse(user);
    return `cart_items_${userData.email || userData.userName}`;
  }
  return "cart_items_guest"; 
};

// Load cart safely
const loadCart = (): CartItem[] => {
  try {
    const cartKey = getCartKey();
    const storedCart = localStorage.getItem(cartKey);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
};

// Save cart safely
const saveCart = (items: CartItem[]) => {
  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(items));
};

const initialState: CartState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: { payload: { product: Product; quantity: number } }) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...product, quantity });
      }
      saveCart(state.items);
    },

    removeFromCart: (state, action: { payload: string }) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },

    updateCartForUser: (state) => {
      // Reload cart when user changes
      state.items = loadCart();
    },

  // reducer to remove
    clearAllCartData: (state) => {
      state.items = [];
      
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateCartForUser, clearAllCartData } =
  cartSlice.actions;
export default cartSlice.reducer;