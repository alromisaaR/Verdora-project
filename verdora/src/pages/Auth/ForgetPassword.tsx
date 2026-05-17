import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import emailjs from "@emailjs/browser";
import authImg from "../../assets/download (6).jpeg";
import "../../styles/global.css";

interface ForgotPasswordForm {
  email: string;
}

const SERVICE_ID = "service_ecijs9p";
const TEMPLATE_ID = "template_mnsja1g";
const PUBLIC_KEY = "Iymd-va1Y_ys9tFw1";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const schema = z.object({
    email: z.string().email("Invalid email").nonempty("Email is required"),
  });

  const { register, handleSubmit, formState } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit: SubmitHandler<ForgotPasswordForm> = async ({ email }) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5005/users?email=${email}`);
      if (!res.data.length) {
        toast.error("Email not found!");
        return;
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const userId = res.data[0].id;

      await axios.patch(`http://localhost:5005/users/${userId}`, { resetCode });

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, { email, resetCode }, PUBLIC_KEY);

      toast.success("Reset code sent! Check your email.");
      navigate("/auth/verify-reset-code", { state: { email } });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verdora - Forgot Password</title>
      </Helmet>
      <section className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: "#fff" }}>
        <div className="row w-100 justify-content-center align-items-center" style={{ maxWidth: "900px" }}>
          <div className="col-md-6">
            <div className="card p-4" style={{ border: "none", fontFamily: "var(--font-family-form)" }}>
              <h2 className="text-center mb-3 fw-bold">Forgot Password</h2>
              <p className="text-center text-muted mb-4">Enter your email to receive a reset code.</p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className={`form-control ${formState.errors.email ? "is-invalid" : ""}`}
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                  {formState.errors.email && <div className="invalid-feedback">{formState.errors.email.message}</div>}
                </div>
                <button
                  type="submit"
                  className="btn w-100"
                  disabled={isLoading}
                  style={{ backgroundColor: "var(--color-green-darkest)", color: "#fff" }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : "Send Reset Code"}
                </button>
              </form>
            </div>
          </div>
          <div className="col-md-6 d-md-block">
            <img src={authImg} alt="Forgot Password" className="img-fluid rounded" />
          </div>
        </div>
      </section>
    </>
  );
}
