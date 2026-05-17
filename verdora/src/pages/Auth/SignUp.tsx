import { useState } from "react";
import Fabricimag from "../../assets/download__8_-removebg-preview.png";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "../../styles/global.css";
import { Helmet } from "react-helmet";

import { createClient } from "@supabase/supabase-js";
 
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface FormValues {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  phone: string;
  termsAccepted: boolean;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const schema = z
    .object({
      name: z.string().min(1, "Name is required").max(10, "Max length is 10"),
      email: z.string().min(1, "Email is required").email("Invalid email"),
      password: z
        .string()
        .min(1, "Password is required")
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, "Invalid password"),
      rePassword: z.string().min(1, "confirm your pssword is required"),
      phone: z
        .string()
        .min(1, "Phone number is required")
        .refine(
          (value) =>
            /^01[0-2,5][0-9]{8}$/.test(value) ||
            /^\+201[0-2,5][0-9]{8}$/.test(value) ||
            /^\+\d{10,15}$/.test(value),
          { message: "Invalid phone number" }
        ),
      termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
      }),
    })
    .refine((obj) => obj.password === obj.rePassword, {
      message: "Passwords do not match",
      path: ["rePassword"],
    });

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      phone: "",
      termsAccepted: false,
    },
    resolver: zodResolver(schema),
  });

  const { register, handleSubmit, formState } = form;

  const handleRegister: SubmitHandler<FormValues> = async (values) => {
  setIsLoading(true);
  try {
    const { termsAccepted, rePassword, ...userData } = values;
    const cleanEmail = userData.email.toLowerCase().trim();

    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("id") 
      .eq("email", cleanEmail);

    if (checkError) {
      console.error("خطأ أثناء فحص الإيميل من سوبابيز:", checkError);
      throw checkError;
    }

    if (Array.isArray(existing) && existing.length > 0) {
      toast.error("Email already exists");
      setIsLoading(false); 
      return; 
    }

    const { data: newData, error: insertError } = await supabase
      .from("users")
      .insert([{ ...userData, email: cleanEmail, role: "user", resetCode: null }])
      .select()
      .single();

    if (insertError) throw insertError;

    toast.success(`Registration successful! Welcome ${newData.name}`);
    navigate("/auth/signin");

  } catch (error: any) {
    console.error("تفاصيل الخطأ الكاملة:", error);
    toast.error(error.message || "Something went wrong during registration");
  } finally {
    setIsLoading(false);
  }
};
 

  return (
    <>
      <Helmet>
        <title>Verdora - Register</title>
        <meta name="description" content="Register page for Verdora" />
      </Helmet>

      <div
        className="d-flex align-items-center justify-content-center min-vh-100 mt-5"
      >
        <div
          className="row w-100 justify-content-center align-items-center"
          style={{ maxWidth: "900px", fontFamily: "var(--font-family-form)" }}
        >
          {/*Form */}
          <div className="col-md-6">
            <div className="card p-4" style={{ border: "none" }}>
              <h2 className="text-center mb-3">Sign Up</h2>
              <p className="text-center text-muted mb-4">
                Create your account and join us today!
              </p>

              <form onSubmit={handleSubmit(handleRegister)}>
                {/* Name */}
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    {...register("name")}
                  />
                  {formState.errors.name && formState.touchedFields.name && (
                    <p className="alert alert-danger p-1 mt-1">
                      {formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                  {formState.errors.email && formState.touchedFields.email && (
                    <p className="alert alert-danger p-1 mt-1">
                      {formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    {...register("password")}
                  />
                  {formState.errors.password &&
                    formState.touchedFields.password && (
                      <p className="alert alert-danger p-1 mt-1">
                        {formState.errors.password.message}
                      </p>
                    )}
                </div>

                {/* Re-password */}
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm your password"
                    {...register("rePassword")}
                  />
                  {formState.errors.rePassword &&
                    formState.touchedFields.rePassword && (
                      <p className="alert alert-danger p-1 mt-1">
                        {formState.errors.rePassword.message}
                      </p>
                    )}
                </div>

                {/* Phone */}
                <div className="mb-3">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter your phone"
                    {...register("phone")}
                  />
                  {formState.errors.phone && formState.touchedFields.phone && (
                    <p className="alert alert-danger p-1 mt-1">
                      {formState.errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    {...register("termsAccepted")}
                  />
                  <label className="form-check-label">
                    I agree to all the statements
                  </label>
                  {formState.errors.termsAccepted && (
                    <p className="alert alert-danger p-1 mt-1">
                      {formState.errors.termsAccepted.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn w-100 rounded-2 fs-6 text-light"
                  disabled={isLoading}
                  style={{ backgroundColor: "var(--color-green-darkest)" }}
                >
                  {isLoading ? "Registering..." : "Register"}
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/auth/signin")}
                  className="fw-semibold text-success"
                  style={{ cursor: "pointer" }}
                >
                  Sign In
                </span>
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="col-md-6 d-none d-md-block text-center">
            <img
              src={Fabricimag}
              alt="Register"
              className="img-fluid rounded"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                marginTop: "70px",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
