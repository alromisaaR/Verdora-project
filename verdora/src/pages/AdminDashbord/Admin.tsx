import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  ArrowLeftCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";

const Admin: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={22} /> },
    { name: "Users", path: "/admin/users", icon: <Users size={22} /> },
    { name: "Products", path: "/admin/products", icon: <Package size={22} /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingCart size={22} /> },
    { name: "Reports", path: "/admin/reports", icon: <BarChart3 size={22} /> },
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
        setIsSidebarOpen(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  
  const handleNavClick = () => { 
    if (isMobile) closeSidebar(); 
  };

  const sidebarWidth = isMobile ? "85vw" : isCollapsed ? "80px" : "250px";
  const mainMargin = isMobile ? "0" : isCollapsed ? "80px" : "250px";

  return (
    <>
      <Helmet>
        <title>Admin Dashboard</title>
      </Helmet>

      <div className="d-flex" style={{ minHeight: "100vh", fontFamily: "'Domaine Display', serif" }}>
        {/* Mobile Header */}
        {isMobile && (
          <header
            className="d-lg-none text-white position-fixed w-100"
            style={{
              background: "linear-gradient(135deg, #667F4D 0%, #5A7245 100%)",
              zIndex: 1040,
              top: 0,
              left: 0,
              padding: "12px 16px",
              height: "60px",
              boxShadow: "0 2px 15px rgba(0,0,0,0.15)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn p-1" 
                  onClick={toggleSidebar}
                  style={{ 
                    color: "#fff", 
                    border: "none",
                    borderRadius: "8px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.1)"
                  }}
                >
                  {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <h5 className="mb-0 fw-bold text-white" style={{ fontSize: "18px" }}>Admin Panel</h5>
              </div>
              
              <button
                onClick={() => navigate("/home")}
                className="btn p-1"
                style={{ 
                  color: "#fff", 
                  border: "none",
                  borderRadius: "8px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.1)"
                }}
              >
                <Home size={20} />
              </button>
            </div>
          </header>
        )}

        {/* Sidebar overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div
            className="position-fixed w-100 h-100"
            style={{ 
              backgroundColor: "rgba(0,0,0,0.6)", 
              zIndex: 1039, 
              top: 0, 
              left: 0,
              backdropFilter: "blur(2px)"
            }}
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`text-white shadow-lg d-flex flex-column ${
            isMobile ? (isSidebarOpen ? "d-block" : "d-none") : "d-none d-lg-flex"
          }`}
          style={{
            width: sidebarWidth,
            position: "fixed",
            height: "100vh",
            top: 0,
            left: 0,
            background: "linear-gradient(180deg, #718351 0%, #5A7245 100%)",
            zIndex: 1040,
            transform: isMobile ? (isSidebarOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            boxShadow: isMobile ? "4px 0 20px rgba(0,0,0,0.3)" : "none"
          }}
        >
          {/* Sidebar Header */}
          {!isMobile && (
            <div 
              className="p-4 border-bottom border-white border-opacity-25"
              style={{ 
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "space-between"
              }}
            >
              {!isCollapsed && (
                <h4 className="mb-0 fw-bold text-white" style={{ fontSize: "20px" }}>Admin Panel</h4>
              )}
              
              <button
                onClick={toggleCollapse}
                className="btn p-1"
                style={{ 
                  color: "#fff", 
                  border: "none",
                  borderRadius: "8px",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.1)"
                }}
              >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
          )}

          {/* Mobile Sidebar Header */}
          {isMobile && (
            <div 
              className="p-4 border-bottom border-white border-opacity-25"
              style={{ 
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "80px"
              }}
            >
              <h4 className="mb-0 fw-bold text-white" style={{ fontSize: "22px" }}>Admin Menu</h4>
              <button
                onClick={closeSidebar}
                className="btn p-1"
                style={{ 
                  color: "#fff", 
                  border: "none",
                  borderRadius: "8px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.1)"
                }}
              >
                <X size={22} />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <ul className="nav flex-column flex-grow-1 p-3" style={{ gap: "8px" }}>
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className={`d-flex align-items-center nav-link ${
                    location.pathname === item.path
                      ? "fw-bold bg-white text-dark rounded shadow-sm"
                      : "text-white hover-bg-light hover-text-dark"
                  }`}
                  style={{ 
                    textDecoration: "none", 
                    transition: "all 0.3s ease",
                    padding: isMobile ? "16px 20px" : "12px 16px",
                    borderRadius: "12px",
                    gap: isCollapsed && !isMobile ? "0" : "16px",
                    justifyContent: isCollapsed && !isMobile ? "center" : "flex-start",
                    fontSize: isMobile ? "16px" : "14px",
                    border: location.pathname === item.path ? "2px solid rgba(255,255,255,0.3)" : "none"
                  }}
                >
                  <div style={{ 
                    width: "24px", 
                    height: "24px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center" 
                  }}>
                    {item.icon}
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <span style={{ 
                      opacity: isCollapsed && !isMobile ? 0 : 1,
                      transition: "opacity 0.2s ease",
                      whiteSpace: "nowrap",
                      fontWeight: "500"
                    }}>
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Bottom Actions */}
          <div className="p-3 border-top border-white border-opacity-25" style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
            {/* Back to Website */}
            <button
              onClick={() => {
                navigate("/home");
                if (isMobile) closeSidebar();
              }}
              className={`d-flex align-items-center w-100 btn btn-light text-dark fw-semibold shadow-sm ${
                (isCollapsed && !isMobile) ? "justify-content-center" : "justify-content-start"
              }`}
              style={{
                padding: isMobile ? "16px 20px" : "12px 16px",
                borderRadius: "12px",
                border: "none",
                gap: (isCollapsed && !isMobile) ? "0" : "16px",
                transition: "all 0.3s ease",
                fontSize: isMobile ? "16px" : "14px",
                background: "#fff",
                color: "#5A7245"
              }}
            >
              <ArrowLeftCircle size={22} />
              {(isMobile || !isCollapsed) && (
                <span style={{ 
                  opacity: (isCollapsed && !isMobile) ? 0 : 1,
                  transition: "opacity 0.2s ease",
                  fontWeight: "600"
                }}>
                  Back to Site
                </span>
              )}
            </button>

          </div>
        </aside>
        {/* Main Content */}
        <main
          className="flex-grow-1 bg-light"
          style={{
            marginLeft: mainMargin,
            padding: isMobile ? "70px 15px 20px 15px" : "30px",
            minHeight: "100vh",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflowX: "hidden",
            background: "#f8f9fa"
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>
        {`
          .hover-bg-light:hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            transform: translateY(-1px);
          }
          
          .hover-text-dark:hover {
            color: #333 !important;
          }
          
          .nav-link {
            position: relative;
            overflow: hidden;
          }
          
          .nav-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: #fff;
            transform: scaleY(0);
            transition: transform 0.3s ease;
          }
          
          .nav-link:hover::before,
          .nav-link.bg-white::before {
            transform: scaleY(1);
          }
          
          .nav-link.bg-white {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            transform: translateY(-1px);
          }
          
          /* Smooth transitions for mobile */
          @media (max-width: 1023px) {
            main {
              padding: 70px 15px 20px 15px !important;
            }
            
            aside {
              box-shadow: 4px 0 25px rgba(0,0,0,0.4) !important;
            }
          }
          
          @media (max-width: 767px) {
            main {
              padding: 70px 12px 15px 12px !important;
            }
            
            .nav-link {
              font-size: 16px !important;
              padding: 18px 20px !important;
            }
          }
          
          @media (max-width: 480px) {
            main {
              padding: 70px 10px 12px 10px !important;
            }
            
            aside {
              width: 90vw !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default Admin;