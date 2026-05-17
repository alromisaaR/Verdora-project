import React, { useEffect, useState } from "react";
import "../../styles/global.css"
import { TrendingUp, Users, Package, BarChart3, DollarSign, Leaf } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./DashboardPage.css";
import { supabase } from "../../SupbaseClient/SupbaseClint";


const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Fetch Data
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [usersResult, ordersResult, productsResult] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("orders").select("*"),
        supabase.from("products").select("*"),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;

      setUsers(usersResult.data || []);
      setOrders(ordersResult.data || []);
      setProducts(productsResult.data || []);

      console.log("Dashboard data loaded successfully!");
    } catch (error) {
      console.error("Error fetching dashboard data from Supabase:", error);
    }
  };

  fetchData();
}, []);

  // KPI Calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalProducts = products.length;

  // Chart Data
  const salesOverviewData = orders.map((order) => ({
    date: new Date(order.createdAt).toLocaleDateString(),
    total: order.total,
  }));

  const userGrowthData = [
    { month: "Jan", users: 2 },
    { month: "Feb", users: 3 },
    { month: "Mar", users: totalUsers },
  ];

  const ordersSummaryData = [
    { name: "Cash", value: orders.filter((o) => o.paymentMethod === "cash-on-delivery").length },
    { name: "Online", value: orders.filter((o) => o.paymentMethod === "online").length },
  ];

  const revenueData = salesOverviewData;
  const COLORS = ["#6DA34D", "#A3C9A8", "#52734D", "#B7E4C7"];

  return (
    <div className="dashboard-page checkout-page">
      <h1 className="dashboard-title">📊 Admin Dashboard</h1>

      {/* KPI CARDS */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <DollarSign className="kpi-icon" size={40} />
          <div>
            <h3>{totalRevenue} EGP</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="kpi-card">
          <Users className="kpi-icon" size={40} />
          <div>
            <h3>{totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="kpi-card">
          <Package className="kpi-icon" size={40} />
          <div>
            <h3>{totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="kpi-card">
          <Leaf className="kpi-icon" size={40} />
          <div>
            <h3>{totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-grid">
        {/* Sales Overview */}
        <div className="chart-card">
          <div className="chart-header">
            <TrendingUp className="chart-icon" />
            <h3>Sales Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salesOverviewData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6DA34D" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6DA34D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#6DA34D" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="chart-card">
          <div className="chart-header">
            <Users className="chart-icon" />
            <h3>User Growth</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#52734D" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Summary */}
        <div className="chart-card">
          <div className="chart-header">
            <Package className="chart-icon" />
            <h3>Orders Summary</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ordersSummaryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {ordersSummaryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <BarChart3 className="chart-icon" />
            <h3>Revenue Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#6DA34D" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
