import { createClient } from "@supabase/supabase-js";
import type { LoginCredentials, RegisterData, User } from './Types/authTypes';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", credentials.email)
      .eq("password", credentials.password)
      .single();

    if (error || !data) throw new Error("Invalid credentials");
    return data as User;
  },

  register: async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email)
      .single();

    if (existing) throw new Error("Email already exists");

    const { error } = await supabase
      .from("users")
      .insert([{ ...userData, role: "user", resetCode: null }]);

    if (error) throw new Error(error.message);
    return { success: true, message: "Registration successful" };
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    // Extract user id from token: "mock-token-{id}-{timestamp}"
    const parts = token.split("-");
    const id = parts[2];
    if (!id) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as User;
  },
};