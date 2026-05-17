// src/mockAuthAPI.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  phone?: string;
  resetCode?: string | null;
}

export const mockAuthAPI = {
  // Sign In
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) throw new Error("Incorrect email or password");

    const token = `mock-token-${data.id}-${Date.now()}`;
    return { message: "success", token, user: data };
  },

  // Sign Up
  signUp: async (userData: { name: string; email: string; password: string; phone?: string }) => {
    // Check if email exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email)
      .single();

    if (existing) throw new Error("Email already exists");

    const { data, error } = await supabase
      .from("users")
      .insert([{ ...userData, role: "user", resetCode: null }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { message: "success", user: data };
  },

  // Forgot Password
  forgotPassword: async (email: string) => {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) throw new Error("Email not found");

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await supabase
      .from("users")
      .update({ resetCode })
      .eq("email", email);

    console.log(`Reset code for ${email}: ${resetCode}`);
    return { statusMsg: "success", resetCode };
  },

  // Verify Reset Code
  verifyResetCode: async (email: string, code: string) => {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("resetCode", code)
      .single();

    if (!user) throw new Error("Invalid reset code");
    return { status: "Success" };
  },

  // Reset Password
  resetPassword: async (email: string, newPassword: string) => {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user || !user.resetCode) throw new Error("Invalid request or code missing");

    await supabase
      .from("users")
      .update({ password: newPassword, resetCode: null })
      .eq("email", email);

    const token = `mock-token-${user.id}-${Date.now()}`;
    return { token };
  },

  // Get All Users (admin)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) throw new Error(error.message);
    return data as User[];
  },
};