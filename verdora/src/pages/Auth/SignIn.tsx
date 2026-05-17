import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet";
import authImg from "../../assets/download (6).jpeg";
import "../../styles/global.css";
import { useDispatch } from "react-redux";
import { updateCartForUser } from "../../redux/slices/cartSlice"; 
import { supabase } from "../../SupbaseClient/SupbaseClint";

interface SignInFormValues {
  email: string;
  password: string;
}

interface SignInProps {
  onLogin: (token: string, name: string, role: string) => void;
}

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignIn({ onLogin }: SignInProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const form = useForm<SignInFormValues>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(schema),
  });

  const { register, handleSubmit, formState } = form;

 const onSubmit: SubmitHandler<SignInFormValues> = async (values) => {
    setIsLoading(true);
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", values.email.toLowerCase().trim())
        .eq("password", values.password) 
        .single(); 

      if (error || !user) {
        throw new Error("Invalid email or password");
      }

      const token = `mock-token-${user.id}-${Date.now()}`;
      
      localStorage.setItem("token", token);
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);

      dispatch(updateCartForUser());

      onLogin(token, user.name, user.role);

      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }

    } catch (error: any) {
      toast.error(error.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

 

  return (
    <>
      <Helmet>
        <title>Verdora - Sign In</title>
      </Helmet>
      <div
        className="d-flex align-items-center justify-content-center min-vh-100"
        style={{ backgroundColor: "#fff" }}
      >
        <div
          className="row w-100 justify-content-center align-items-center"
          style={{ maxWidth: "900px", fontFamily: "var(--font-family-form)" }}
        >
          <div className="col-md-6">
            <div className="card p-4" style={{ border: "none" }}>
              <h2 className="text-center mb-3">Sign In</h2>
              <p className="text-center text-muted mb-4">
                Welcome back! Please sign in to your account.
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`form-control ${
                      formState.errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                  {formState.errors.email && (
                    <div className="invalid-feedback">
                      {formState.errors.email.message}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className={`form-control ${
                      formState.errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your password"
                    {...register("password")}
                  />
                  {formState.errors.password && (
                    <div className="invalid-feedback">
                      {formState.errors.password.message}
                    </div>
                  )}
                </div>
                <div className="mb-3 text-end">
                  <span
                    className="text-success fw-semibold"
                    onClick={() => navigate("/auth/forget-password")}
                    style={{ cursor: "pointer" }}
                  >
                    Forgot password?
                  </span>
                </div>
                <button
                  type="submit"
                  className="btn w-100"
                  disabled={isLoading}
                  style={{
                    backgroundColor: "var(--color-green-darkest)",
                    color: "#fff",
                  }}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
              <p className="text-center mt-3 mb-0">
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/auth/signup")}
                  className="fw-semibold text-success"
                  style={{ cursor: "pointer" }}
                >
                  Register
                </span>
              </p>
            </div>
          </div>
          <div className="col-md-6 d-md-block">
            <img src={authImg} alt="Sign In" className="img-fluid rounded" />
          </div>
        </div>
      </div>
    </>
  );
}
