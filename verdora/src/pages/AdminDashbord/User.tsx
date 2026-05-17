// UsersTable.tsx
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaEdit, FaTrash, FaPlusCircle, FaTimes, FaUser, FaShoppingCart, FaStar, FaSearch, FaUsers } from "react-icons/fa";
import * as yup from "yup";
import "../../styles/global.css"
import { supabase } from "../../SupbaseClient/SupbaseClint";


interface UserType {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

type NewUser = Omit<UserType, "id">;

// Yup validation schema
const userSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  role: yup
    .mixed<"user" | "admin">()
    .oneOf(["user", "admin"], "Role must be either user or admin")
    .required("Role is required")
});

const fetchUsers = async (): Promise<UserType[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) throw new Error(error.message);
  return data || [];
};

const deleteUser = async (id: string | number): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id); 

  if (error) throw new Error(error.message);
};

const updateUser = async (user: UserType): Promise<UserType> => {
  const { data, error } = await supabase
    .from("users")
    .update({ 
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const createUser = async (user: NewUser): Promise<UserType> => {
  const { data, error } = await supabase
    .from("users")
    .insert([
      { 
        ...user,
        email: user.email.toLowerCase().trim(),
        role: user.role || "user"
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const PAGE_SIZE = 5;
const BG = "#E9F5DB";
const DARK_GREEN = "#6B7D4F";
const MEDIUM_GREEN = "#8FA872";
const CARD_BG = "#FFFFFF";

const UsersTable: React.FC = () => {
  // react-query
  const queryClient = useQueryClient();
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowForm(false);
      setEditingUser(null);
      setFormErrors({});
    },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowForm(false);
      setNewUser({ name: "", email: "", role: "user" });
      setCurrentPage(1);
      setFormErrors({});
    },
  });

  // local state
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"add" | "edit">("add");
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [newUser, setNewUser] = useState<NewUser>({ name: "", email: "", role: "user" });
  const [currentPage, setCurrentPage] = useState(1);

  // filtered and pagination
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    // clamp current page if filtered changes
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [filtered.length, totalPages]);

  const start = (currentPage - 1) * PAGE_SIZE;
  const currentUsers = filtered.slice(start, start + PAGE_SIZE);

  // handlers
  const onEditClick = (u: UserType) => {
    setEditingUser({ ...u });
    setFormType("edit");
    setShowForm(true);
    setFormErrors({});
  };

  const onAddClick = () => {
    setEditingUser(null);
    setNewUser({ name: "", email: "", role: "user" });
    setFormType("add");
    setShowForm(true);
    setFormErrors({});
  };

  const onDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (userToDelete != null) {
      deleteMutation.mutate(userToDelete, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const validateForm = async (data: NewUser | UserType) => {
    try {
      await userSchema.validate(data, { abortEarly: false });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    
    const isValid = await validateForm(editingUser);
    if (isValid) {
      updateMutation.mutate(editingUser);
    }
  };

  const submitNewUser = async () => {
    const isValid = await validateForm(newUser);
    if (isValid) {
      createMutation.mutate(newUser);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setNewUser({ name: "", email: "", role: "user" });
    setFormErrors({});
  };

  // simple id display like earlier (hex padded)
  const displayId = (id: number) => `#${id.toString(16).padStart(4, "0")}`;

  // simple icon button component
  const IconBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
    return (
      <button
        {...props}
        className={`btn ${props.className ?? ""}`}
        style={{
          ...props.style,
          borderRadius: 8,
          padding: "0.35rem 0.7rem",
          fontSize: "0.85rem",
        }}
      />
    );
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh"}}  className="checkout-page">
      {/* Page content */}
      <div className="container-fluid p-2 p-md-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: DARK_GREEN }}>
              Verdora Management
            </h3>
            <p className="text-muted mb-0">Manage customers and administrators</p>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center w-100 w-md-auto">
            <div className="input-group flex-grow-1" style={{ maxWidth: "100%" }}>
              <input
                type="text"
                className="form-control shadow-sm py-2"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${MEDIUM_GREEN}`,
                }}
              />
            </div>

            <button
              className="btn d-flex align-items-center gap-2 justify-content-center"
              onClick={onAddClick}
              style={{
                backgroundColor: DARK_GREEN,
                color: "#fff",
                borderRadius: 8,
                padding: "0.6rem 1rem",
                border: "none",
                whiteSpace: "nowrap",
                minHeight: "44px"
              }}
            >
              <FaPlusCircle size={16} />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* User Form (appears below header when active) */}
        {showForm && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16, background: CARD_BG }}>
            <div className="card-header d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: DARK_GREEN, color: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <h5 className="mb-0 fw-bold">{formType === "add" ? "Add Customer" : "Edit User"}</h5>
              <button onClick={closeForm} className="btn btn-sm p-1" style={{ color: "#fff", borderRadius: 8 }}>
                <FaTimes size={18} />
              </button>
            </div>
            <div className="card-body p-3 p-md-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Name</label>
                  <input
                    value={formType === "edit" ? editingUser?.name ?? "" : newUser.name}
                    onChange={(e) => {
                      if (formType === "edit") {
                        setEditingUser(editingUser ? { ...editingUser, name: e.target.value } : null);
                      } else {
                        setNewUser({ ...newUser, name: e.target.value });
                      }
                      // Clear error when user starts typing
                      if (formErrors.name) {
                        setFormErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                    style={{ 
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: "16px" // Prevents zoom on iOS
                    }}
                    placeholder="Enter full name"
                  />
                  {formErrors.name && (
                    <div className="invalid-feedback d-block" style={{ fontSize: "14px" }}>
                      {formErrors.name}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    value={formType === "edit" ? editingUser?.email ?? "" : newUser.email}
                    onChange={(e) => {
                      if (formType === "edit") {
                        setEditingUser(editingUser ? { ...editingUser, email: e.target.value } : null);
                      } else {
                        setNewUser({ ...newUser, email: e.target.value });
                      }
                      // Clear error when user starts typing
                      if (formErrors.email) {
                        setFormErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    style={{ 
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: "16px" // Prevents zoom on iOS
                    }}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <div className="invalid-feedback d-block" style={{ fontSize: "14px" }}>
                      {formErrors.email}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Role</label>
                  <select
                    value={formType === "edit" ? editingUser?.role ?? "user" : newUser.role}
                    onChange={(e) => {
                      if (formType === "edit") {
                        setEditingUser(editingUser ? { ...editingUser, role: e.target.value as "user" | "admin" } : null);
                      } else {
                        setNewUser({ ...newUser, role: e.target.value as "user" | "admin" });
                      }
                    }}
                    className="form-select"
                    style={{ 
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: "16px" // Prevents zoom on iOS
                    }}
                  >
                    <option value="user">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="col-12">
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                    <button 
                      className="btn btn-secondary order-2 order-sm-1" 
                      onClick={closeForm} 
                      style={{ 
                        borderRadius: 12,
                        padding: "12px 24px",
                        border: "none",
                        fontSize: "16px"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn order-1 order-sm-2"
                      onClick={formType === "edit" ? saveEdit : submitNewUser}
                      disabled={formType === "edit" ? updateMutation.isLoading : createMutation.isLoading}
                      style={{ 
                        backgroundColor: DARK_GREEN, 
                        color: "#fff", 
                        borderRadius: 12, 
                        border: "none",
                        padding: "12px 24px",
                        fontSize: "16px",
                        minWidth: "140px"
                      }}
                    >
                      {formType === "edit" 
                        ? (updateMutation.isLoading ? "Saving..." : "Save Changes")
                        : (createMutation.isLoading ? "Adding..." : "Add Customer")
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16, background: CARD_BG, border: `2px solid #b33a3a` }}>
            <div className="card-header d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: "#b33a3a", color: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <h5 className="mb-0 fw-bold">Delete User</h5>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-sm p-1" style={{ color: "#fff", borderRadius: 8 }}>
                <FaTimes size={18} />
              </button>
            </div>
            <div className="card-body p-3 p-md-4">
              <p className="mb-3" style={{ fontSize: "16px" }}>Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                <button 
                  className="btn btn-secondary order-2 order-sm-1" 
                  onClick={() => setShowDeleteConfirm(false)} 
                  style={{ 
                    borderRadius: 12,
                    padding: "12px 24px",
                    border: "none",
                    fontSize: "16px"
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger order-1 order-sm-2"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isLoading}
                  style={{ 
                    borderRadius: 12,
                    padding: "12px 24px",
                    fontSize: "16px",
                    minWidth: "120px"
                  }}
                >
                  {deleteMutation.isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Improved mobile layout */}
        <div className="row g-2 g-md-3 mb-4">
          {[
            { 
              title: "Total Users", 
              value: users.length, 
              icon: <FaUsers size={18} style={{ color: DARK_GREEN }} />,
              bg: "#E8F4EA"
            },
            { 
              title: "Customers", 
              value: users.filter((u) => u.role === "user").length, 
              icon: <FaShoppingCart size={18} style={{ color: DARK_GREEN }} />,
              bg: "#E8F4EA"
            },
            { 
              title: "Administrators", 
              value: users.filter((u) => u.role === "admin").length, 
              icon: <FaStar size={18} style={{ color: "#8a6d00" }} />,
              bg: "#FFF9E6"
            },
            { 
              title: "Search Results", 
              value: filtered.length, 
              icon: <FaSearch size={18} style={{ color: "#368c5aff" }} />,
              bg: "#E3F2FD"
            }
          ].map((stat, index) => (
            <div key={index} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, background: CARD_BG }}>
                <div className="card-body d-flex align-items-center gap-3 p-3">
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 12, 
                    background: stat.bg, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {stat.icon}
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-0 fw-bold" style={{ fontSize: "1.25rem" }}>{stat.value}</h5>
                    <div className="text-muted small" style={{ fontSize: "0.8rem" }}>{stat.title}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rest of the table and mobile cards remain the same */}
        {/* Desktop Table */}
        <div className="d-none d-md-block card border-0 shadow-sm" style={{ borderRadius: 12, background: CARD_BG }}>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ backgroundColor: "#FAFAFA", borderBottom: "2px solid #E0E0E0" }}>
                <tr>
                  <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: "0.9rem" }}>ID</th>
                  <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: "0.9rem" }}>Customer</th>
                  <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: "0.9rem" }}>Email</th>
                  <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: "0.9rem" }}>Role</th>
                  <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: "0.9rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="spinner-border" style={{ color: DARK_GREEN }}></div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-danger">Failed to load users</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">No users found</td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid #F0F0F0", transition: "background 0.15s" }}>
                      <td className="px-4 py-3"><span className="text-muted small">{displayId(user.id)}</span></td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div style={{ width: 40, height: 40, borderRadius: 40, background: "#E8F4EA", display: "flex", alignItems: "center", justifyContent: "center", color: DARK_GREEN }}>
                            <FaUser size={16} />
                          </div>
                          <div>
                            <div className="fw-semibold">{user.name}</div>
                            <div className="text-muted small">{user.role === "admin" ? "Administrator" : "Customer"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{user.email}</td>
                      <td className="px-4 py-3">
                        <span style={{ padding: "0.35rem 0.7rem", borderRadius: 8, fontWeight: 500, backgroundColor: user.role === "admin" ? "#FFF9E6" : "#F2FFF2", color: user.role === "admin" ? "#8a6d00" : "#2f6f2f" }}>
                          {user.role === "admin" ? "Administrator" : "Customer"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex gap-2">
                          <IconBtn
                            onClick={() => onEditClick(user)}
                            style={{ borderColor: MEDIUM_GREEN, color: MEDIUM_GREEN }}
                          >
                            <FaEdit size={14} /> <span style={{ marginLeft: 6 }}>Edit</span>
                          </IconBtn>

                          <IconBtn
                            onClick={() => onDeleteClick(user.id)}
                            style={{ borderColor: "#b33a3a", color: "#b33a3a" }}
                          >
                            <FaTrash size={14} /> <span style={{ marginLeft: 6 }}>Delete</span>
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards view */}
        <div className="d-md-none">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: DARK_GREEN }}></div>
            </div>
          ) : isError ? (
            <div className="text-center py-5 text-danger">Failed to load users</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">No users found</div>
          ) : (
            currentUsers.map((user) => (
              <div key={user.id} className="card mb-3 shadow-sm" style={{ borderRadius: 12, background: CARD_BG }}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 45, height: 45, borderRadius: 45, background: "#E8F4EA", display: "flex", alignItems: "center", justifyContent: "center", color: DARK_GREEN }}>
                        <FaUser size={16} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0" style={{ fontSize: "16px" }}>{user.name}</h6>
                        <small className="text-muted">{displayId(user.id)}</small>
                      </div>
                    </div>
                    <span style={{ padding: "0.4rem 0.7rem", borderRadius: 8, backgroundColor: user.role === "admin" ? "#FFF9E6" : "#F2FFF2", color: user.role === "admin" ? "#8a6d00" : "#2f6f2f", fontWeight: 500, fontSize: "0.8rem" }}>
                      {user.role === "admin" ? "Admin" : "Customer"}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Email</small>
                    <div style={{ fontSize: "15px" }}>{user.email}</div>
                  </div>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      className="btn btn-sm d-flex align-items-center gap-2"
                      onClick={() => onEditClick(user)}
                      style={{ 
                        borderRadius: 8, 
                        border: `1px solid ${MEDIUM_GREEN}`, 
                        color: MEDIUM_GREEN,
                        padding: "8px 12px",
                        fontSize: "14px"
                      }}
                    >
                      <FaEdit size={12} />
                      <span>Edit</span>
                    </button>
                    <button 
                      className="btn btn-sm d-flex align-items-center gap-2"
                      onClick={() => onDeleteClick(user.id)}
                      style={{ 
                        borderRadius: 8, 
                        border: `1px solid #b33a3a`, 
                        color: "#b33a3a",
                        padding: "8px 12px",
                        fontSize: "14px"
                      }}
                    >
                      <FaTrash size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination remains the same */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
            <button
              className="btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                borderRadius: 20,
                width: 40,
                height: 40,
                padding: 0,
                border: `1px solid ${DARK_GREEN}`,
                background: currentPage === 1 ? "#fff" : BG,
                color: DARK_GREEN,
              }}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="btn"
                  style={{
                    borderRadius: "50%",
                    width: 38,
                    height: 38,
                    padding: 0,
                    border: `1px solid ${DARK_GREEN}`,
                    background: isActive ? DARK_GREEN : "#fff",
                    color: isActive ? "#fff" : DARK_GREEN,
                    boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {page}
                </button>
              );
            })}

            <button
              className="btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                borderRadius: 20,
                width: 40,
                height: 40,
                padding: 0,
                border: `1px solid ${DARK_GREEN}`,
                background: currentPage === totalPages ? "#fff" : BG,
                color: DARK_GREEN,
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;