import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AuthNavbar from "./components/AuthNavbar/AuthNavbar";
import MainNavbar from "./components/MainNavbar/MainNavbar";
import ResetPassword from "./pages/Auth/ResetPassword";
import ForgotPassword from "./pages/Auth/ForgetPassword";
import VerifyResetCode from "./pages/Auth/VerifyResetCode";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Order from "./pages/Order";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import Profile from "./pages/profile/Profile";
import Checkout from "./pages/Checkout";
import Indoor from "./pages/categories/Indoor";
import Outdoor from "./pages/categories/Outdoor";
import Flowering from "./pages/categories/Flowering";
import Bonsai_miniature from "./pages/categories/Bonsai_miniature";
import NotFound from "./components/common/NotFound";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import Footer from "./components/footer/Footer";

// Admin pages
import Admin from "./pages/AdminDashbord/Admin";
import User from "./pages/AdminDashbord/User";
import Productsadmin from "./pages/AdminDashbord/Productsadmin";
import Orderadmin from "./pages/AdminDashbord/Orderadmin";
import Reports from "./pages/AdminDashbord/Reports";
import DashboardPage from "./pages/AdminDashbord/DashboardPage";


import PlantQuiz from "./components/PlantQuiz";
// add wishlist import
import Wishlish from "./pages/Wishlist";

const AppContent: React.FC = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("token")
  );
  const [userRole, setUserRole] = useState<string>(
    localStorage.getItem("userRole") || ""
  );
  const [userName, setUserName] = useState<string>(
    localStorage.getItem("userName") || ""
  );
  // const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      const name = localStorage.getItem("userName");
      setIsAuthenticated(!!token);
      setUserRole(role || "");
      setUserName(name || "");
    };

    window.addEventListener("storage", checkAuth);
    checkAuth();
    return () => window.removeEventListener("storage", checkAuth);
  }, [location.pathname]);

  const handleLogin = (token: string, name: string, role: string): void => {
    localStorage.setItem("token", token);
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);
    setUserName(name);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setUserName("");
    setUserRole("");
  };

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      <Toaster position="top-right" />
      <div className="app-container">
        {!isAdminPage &&
          (isAuthenticated ? (
            <MainNavbar
              onLogout={handleLogout}
              // cartCount={cartCount}
              userName={userName}
            />
          ) : (
            <AuthNavbar
              onLogin={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          ))}

        <main className="app-content">
          <Routes>
            {/* Root Redirect */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  userRole === "admin" ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/home" replace />
                  )
                ) : (
                  <Navigate to="/auth/signin" replace />
                )
              }
            />

            {/* Auth Routes */}
            <Route
              path="/auth/signin"
              element={
                isAuthenticated ? (
                  userRole === "admin" ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/home" replace />
                  )
                ) : (
                  <SignIn onLogin={handleLogin} />
                )
              }
            />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forget-password" element={<ForgotPassword />} />
            <Route
              path="/auth/verify-reset-code"
              element={<VerifyResetCode />}
            />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Protected User Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/indoor"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Indoor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/outdoor"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Outdoor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/flowering"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Flowering />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/bonsai_miniature"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Bonsai_miniature />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Cart />
                </ProtectedRoute>
              }
            />

            {/* Wishlist route */}
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Wishlish />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Order />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* {Route of quiz} */}

            <Route
              path="/quiz"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <PlantQuiz />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} role="admin">
                  <Admin />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<User />} />
              <Route path="products" element={<Productsadmin />} />
              <Route path="orders" element={<Orderadmin />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {isAuthenticated &&
          !location.pathname.startsWith("/auth") &&
          !isAdminPage && <Footer />}
      </div>
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
