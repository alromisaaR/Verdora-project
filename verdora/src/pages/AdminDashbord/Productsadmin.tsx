import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../../styles/global.css";
import type { Products } from "../../Types";
import axios from "axios";
import toast from "react-hot-toast";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { supabase } from "../../SupbaseClient/SupbaseClint";




export default function Productsadmin() {
  const [products, setProducts] = useState<Products[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Products | null>(null);
  const [newProduct, setNewProduct] = useState<Products | null>(null);
  const [loading, setLoading] = useState(false);

  // Schema validation
  const productValidationSchema = Yup.object({
    name: Yup.string()
      .required("Product name is required")
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name cannot exceed 100 characters"),

    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description cannot exceed 1000 characters"),

    image: Yup.string()
      .required("Product image is required")
      .test(
        "is-valid-image",
        "Please enter a valid image URL or upload an image",
        function (value) {
          if (!value) return false;

          // Check for image
          if (value.startsWith("data:image/")) return true;

          // Check for valid URL with image extension
          try {
            const url = new URL(value);
            const validExtensions = [
              ".jpg",
              ".jpeg",
              ".png",
              ".gif",
              ".webp",
              ".svg",
            ];
            const pathname = url.pathname.toLowerCase();
            return validExtensions.some((ext) => pathname.endsWith(ext));
          } catch {
            return false;
          }
        }
      ),

    category: Yup.string()
      .required("Category is required")
      .oneOf(
        ["Indoor", "Outdoor", "bonsai_miniature", "Flowering"],
        "Please select a valid category"
      ),

    price: Yup.number()
      .required("Price is required")
      .min(0.01, "Price must be greater than 0 EGP")
      .max(100000, "Price cannot exceed 100,000 EGP"),

    stock: Yup.number()
      .required("Stock is required")
      .min(0, "Stock cannot be negative")
      .max(10000, "Stock cannot exceed 10,000 units")
      .integer("Stock must be a whole number"),

    scientificName: Yup.string().max(
      100,
      "Scientific name cannot exceed 100 characters"
    ),

    wateringNeeds: Yup.string().max(
      50,
      "Watering needs cannot exceed 50 characters"
    ),

    sunlight: Yup.string().max(50, "Sunlight cannot exceed 50 characters"),

    soilType: Yup.string().max(50, "Soil type cannot exceed 50 characters"),

    humidity: Yup.string().max(50, "Humidity cannot exceed 50 characters"),

    growthRate: Yup.string().max(50, "Growth rate cannot exceed 50 characters"),

    propagation: Yup.string().max(
      50,
      "Propagation cannot exceed 50 characters"
    ),

    toxicity: Yup.string().max(50, "Toxicity cannot exceed 50 characters"),

    careTips: Yup.string().max(500, "Care tips cannot exceed 500 characters"),

    floweringSeason: Yup.string().max(
      50,
      "Flowering season cannot exceed 50 characters"
    ),

    height: Yup.string().max(50, "Height cannot exceed 50 characters"),

    containerType: Yup.string().max(
      50,
      "Container type cannot exceed 50 characters"
    ),

    nativeRegion: Yup.string().max(
      100,
      "Native region cannot exceed 100 characters"
    ),

    lifeCycle: Yup.string().max(50, "Life cycle cannot exceed 50 characters"),

    genus: Yup.string().max(50, "Genus cannot exceed 50 characters"),

    type: Yup.string().max(50, "Type cannot exceed 50 characters"),

    climate: Yup.string().max(50, "Climate cannot exceed 50 characters"),

    rate: Yup.string().max(10, "Rating cannot exceed 10 characters"),

    review: Yup.string().max(200, "Review cannot exceed 200 characters"),

    discount: Yup.string().max(10, "Discount cannot exceed 10 characters"),

    oldprice: Yup.string().max(20, "Old price cannot exceed 20 characters"),

    bestseller: Yup.boolean(),
    isNew: Yup.boolean(),
  });

  // Formik form initialization
  const formik = useFormik({
    initialValues: {
      id: 0,
      name: "",
      image: "",
      category: "Indoor",
      price: "0 EGP",
      stock: 0,
      bestseller: false,
      oldprice: "",
      rate: "4.5",
      description: "",
      review: "",
      discount: "0%",
      isNew: false,
      scientificName: "",
      nativeRegion: "",
      lifeCycle: "",
      genus: "",
      type: "",
      climate: "",
      soilType: "",
      wateringNeeds: "",
      sunlight: "",
      humidity: "",
      growthRate: "",
      propagation: "",
      toxicity: "",
      careTips: "",
      floweringSeason: "",
      height: "",
      containerType: "",
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values) => {
      await handleSave(values);
    },
  });

  // Update form values when editingProduct or newProduct changes
  useEffect(() => {
    if (editingProduct) {
      const priceValue = parseFloat(editingProduct.price.replace(" EGP", ""));
      formik.setValues({
        ...editingProduct,
        price: priceValue,
      });
    } else if (newProduct) {
      const numericIds = products
        .map((p) => Number(p.id))
        .filter((id) => !isNaN(id));
      const lastId = numericIds.length > 0 ? Math.max(...numericIds) : 0;

      const priceValue = parseFloat(newProduct.price.replace(" EGP", ""));
      formik.setValues({
        ...newProduct,
        id: lastId + 1,
        price: priceValue,
      });
    }
  }, [editingProduct, newProduct]);


 async function getproducts() {
  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) throw error;

    console.log("Products data from Supabase:", data);

    if (data) {
      const formattedProducts = data.map((p: any) => ({
        ...p,
        id: String(p.id)
      }));
      setProducts(formattedProducts);
    }

  } catch (error: any) {
    console.error("Error fetching products:", error);
    toast.error(error.message || "Error fetching products");
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  getproducts();
}, []);

  // delete product
  const handleDelete = async (productId: number, productName: string) => {
  const result = await Swal.fire({
    title: `Delete "${productName}"?`,
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    background: "#fff",
    color: "#333",
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`http://localhost:5005/products/${productId}`);

   
    setProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== productId)
    );

  
    await Swal.fire({
      title: "Deleted!",
      text: `"${productName}" has been removed successfully.`,
      icon: "success",
      confirmButtonColor: "#3085d6",
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (error) {
    
    Swal.fire({
      title: "Error!",
      text: `Error in deleting "${productName}".`,
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
};

  const handleSave = async (values: any) => {
    try {
      console.log("Saving product:", values);

      // Prepare product data for API
      const productToSave = {
        ...values,
        price: `${values.price} EGP`,
      };

      if (editingProduct) {
        const res = await axios.put(
          `http://localhost:5005/products/${editingProduct.id}`,
          productToSave
        );

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? res.data : p))
        );
        setEditingProduct(null);
        toast.success(`${editingProduct.name} updated successfully!`);
      } else if (newProduct) {
        const res = await axios.post(
          "http://localhost:5005/products",
          productToSave
        );

        setProducts((prev) => [...prev, res.data]);
        setNewProduct(null);
        toast.success(`${res.data.name} added successfully!`);
      }

      // Reset form
      formik.resetForm();

      setTimeout(() => {
        getproducts();
      }, 500);
    } catch (error: any) {
      console.error("Error saving product:", error);
      const productName = editingProduct?.name || newProduct?.name || "Product";

      if (error.response?.status === 400) {
        toast.error(
          `Validation error: ${error.response.data?.message || "Invalid data"}`
        );
      } else if (error.response?.status === 409) {
        toast.error(`Product with this name already exists`);
      } else {
        toast.error(`Failed to save ${productName}`);
      }
    }
  };

  // Filter with category and status
  const productsPerPage = 10;
  const sanitizedSearch = searchTerm.trim().replace(/[^a-zA-Z0-9 ]/g, "");

  const filterProducts = products
    .filter((p) => categoryFilter === "All" || p.category === categoryFilter)
    .filter(
      (p) =>
        statusFilter === "All" ||
        (statusFilter === "Active" && p.stock >= 10) ||
        (statusFilter === "Lowstock" && p.stock > 0 && p.stock < 10) ||
        (statusFilter === "Outofstock" && p.stock === 0)
    )
    .filter(
      (p) =>
        sanitizedSearch === "" ||
        p.name.toLowerCase().includes(sanitizedSearch.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(sanitizedSearch.toLowerCase()))
    );

  // pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filterProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filterProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!editingProduct && !newProduct) {
      formik.resetForm();
    }
  }, [editingProduct, newProduct]);

  // Helper function for character count
  const getCharacterCount = (field: string): number => {
    return (
      (formik.values[field as keyof typeof formik.values] as string)?.length ||
      0
    );
  };

  // Helper function for max length
  const getMaxLength = (field: string): number => {
    const maxLengths: { [key: string]: number } = {
      name: 100,
      description: 1000,
      scientificName: 100,
      nativeRegion: 100,
      careTips: 500,
      review: 200,
      lifeCycle: 50,
      genus: 50,
      type: 50,
      climate: 50,
      soilType: 50,
      wateringNeeds: 50,
      sunlight: 50,
      humidity: 50,
      growthRate: 50,
      propagation: 50,
      toxicity: 50,
      floweringSeason: 50,
      height: 50,
      containerType: 50,
      rate: 10,
      discount: 10,
      oldprice: 20,
    };
    return maxLengths[field] || 100;
  };

  return (
    <>
      <div className="container mt-3">
        <div className="d-flex justify-content-between flex-wrap">
          <h1
            className="mb-4"
            style={{
              color: "var(--color-green-darker)",
              fontFamily: "var(--font-family-serif)",
            }}
          >
            Products Management {loading && "(Loading...)"}
          </h1>
          <button
            className="btn h-25 mt-2 text-light"
            style={{
              background: "var(--color-green-darker)",
              fontFamily: "var(--font-family-serif)",
            }}
            onClick={() => {
              const numericIds = products
                .map((p) => Number(p.id))
                .filter((id) => !isNaN(id));
              const lastId =
                numericIds.length > 0 ? Math.max(...numericIds) : 0;

              setNewProduct({
                id: lastId + 1,
                name: "",
                image: "",
                category: "Indoor",
                price: "0 EGP",
                stock: 0,
                bestseller: false,
                oldprice: "",
                rate: "4.5",
                description: "",
                review: "",
                discount: "0%",
                isNew: false,
                scientificName: "",
                nativeRegion: "",
                lifeCycle: "",
                genus: "",
                type: "",
                climate: "",
                soilType: "",
                wateringNeeds: "",
                sunlight: "",
                humidity: "",
                growthRate: "",
                propagation: "",
                toxicity: "",
                careTips: "",
                floweringSeason: "",
                height: "",
                containerType: "",
              });
              setEditingProduct(null);
            }}
          >
            + Add New Product
          </button>
        </div>

        {/* Info */}
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            background: "#f8f9fa",
            borderRadius: "5px",
          }}
        >
          <small>
            Total Products: {products.length} | Filtered:{" "}
            {filterProducts.length} | Showing: {currentProducts.length} |
            {editingProduct &&
              ` Editing: ${editingProduct.name} (ID: ${editingProduct.id})`}
            {newProduct && ` Adding New Product`}
          </small>
        </div>

        <div
          className="d-flex mb-3 gap-2"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="bonsai_miniature">Bonsai & Miniature Plants</option>
            <option value="Flowering">Flowering Plants</option>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Lowstock">Low Stock</option>
            <option value="Outofstock">Out of Stock</option>
          </select>

          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table
            className="table table-bordered align-middle"
            style={{ width: "100%", fontFamily: "var(--font-family-serif)" }}
          >
            <thead className="table-light">
              <tr
                className="text-center"
                style={{
                  background: "var(--color-green-darker)",
                  color: "white",
                }}
              >
                <th
                  scope="col"
                  style={{
                    width: "10px",
                    background: "var(--color-green-darker)",
                    color: "white",
                  }}
                >
                  Id
                </th>
                <th
                  scope="col"
                  style={{
                    width: "80px",
                    background: "var(--color-green-darker)",
                    color: "white",
                  }}
                >
                  Image
                </th>
                <th
                  scope="col"
                  style={{
                    background: "var(--color-green-darker)",
                    color: "white",
                  }}
                >
                  Name
                </th>
                <th
                  scope="col"
                  style={{
                    width: "90px",
                    background: "var(--color-green-darker)",
                    color: "white",
                  }}
                >
                  Category
                </th>
                <th
                  scope="col"
                  style={{
                    background: "var(--color-green-darker)",
                    color: "white",
                  }}
                >
                  Price
                </th>
                <th
                  scope="col"
                  style={{
                    width: "50px",
                    background: "var(--color-green-darker)",
                    color: "white",
                  }}
                >
                  Stock
                </th>
                <th
                  scope="col"
                  style={{
                    width: "100px",
                    background: "var(--color-green-darker)",
                    color: "white",
                  }}
                >
                  Status
                </th>
                <th
                  scope="col"
                  style={{
                    width: "150px",
                    background: "var(--color-green-darker)",
                    color: "white",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 text-center">
                    <td className="border">{p.id}</td>
                    <td className="border px-5 py-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-cover mx-auto rounded"
                        style={{ width: "70px", height: "70px" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/70x70?text=No+Image";
                        }}
                      />
                    </td>
                    <td className="border px-4 py-2">{p.name}</td>
                    <td className="border px-4 py-2">{p.category}</td>
                    <td className="border px-4 py-2">{p.price}</td>
                    <td className="border px-4 py-2">{p.stock}</td>
                    <td className="border px-4 py-2">
                      {p.stock === 0 ? (
                        <span className="px-2 py-1 rounded text-sm border border-1 border-danger text-light bg-danger">
                          Soldout
                        </span>
                      ) : p.stock < 10 ? (
                        <span className="px-2 py-1 rounded text-sm border-1 border-warning text-dark bg-warning">
                          Limited
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-sm border-1 border-success text-light bg-success">
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      <FaRegEdit size={20}
                        style={{
                          color: "var(--color-green-darkest)",
                          width: "55px",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          console.log("Editing product:", p);
                          setEditingProduct(p);
                          setNewProduct(null);
                        }}
                      />
                      
                      <RiDeleteBinLine size={25}
                      style={{ cursor: "pointer"}}
                        className="text-danger"
                        onClick={() => {
                          {
                            handleDelete(p.id, p.name);
                          }
                        }}
                      />
                        
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    {loading
                      ? "Loading products..."
                      : "No products found matching your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "30px",
              gap: "10px",
            }}
          >
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                style={{
                  padding: "7px 15px",
                  borderRadius: "50px",
                  border:
                    currentPage === index + 1
                      ? "1px solid var(--color-green-darker)"
                      : "1px solid gray",
                  background:
                    currentPage === index + 1
                      ? "var(--color-green-darker)"
                      : "#fff",
                  color: currentPage === index + 1 ? "#fff" : "#000",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Edit/Add Product Modal */}
        {(editingProduct || newProduct) && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              fontFamily: "var(--font-family-serif)",
            }}
          >
            <div
              className="modal-content"
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                width: "95%",
                maxWidth: "800px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
              }}
            >
              <div
                className="modal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  borderBottom: "1px solid #dee2e6",
                  paddingBottom: "10px",
                }}
              >
                <h5 style={{ margin: 0, color: "var(--color-green-darker)" }}>
                  {editingProduct
                    ? `Edit Product (ID: ${editingProduct.id})`
                    : "Add New Product"}
                </h5>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct(null);
                    formik.resetForm();
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#999",
                  }}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className="modal-body">
                  {/* Basic Information Section */}
                  <div className="row">
                    <div className="col-md-6">
                      {/* Name */}
                      <div className="mb-3">
                        <label className="form-label">Product Name *</label>
                        <input
                          type="text"
                          className={`form-control ${
                            formik.touched.name && formik.errors.name
                              ? "is-invalid"
                              : ""
                          }`}
                          name="name"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter product name"
                          maxLength={100}
                        />
                        {formik.touched.name && formik.errors.name && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.name}
                          </div>
                        )}
                        <div className="form-text">
                          {getCharacterCount("name")}/100 characters
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      {/* Category */}
                      <div className="mb-3">
                        <label className="form-label">Category *</label>
                        <select
                          className={`form-select ${
                            formik.touched.category && formik.errors.category
                              ? "is-invalid"
                              : ""
                          }`}
                          name="category"
                          value={formik.values.category}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="Indoor">Indoor</option>
                          <option value="Outdoor">Outdoor</option>
                          <option value="bonsai_miniature">
                            Bonsai & Miniature Plants
                          </option>
                          <option value="Flowering">Flowering Plants</option>
                        </select>
                        {formik.touched.category && formik.errors.category && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className={`form-control ${
                        formik.touched.description && formik.errors.description
                          ? "is-invalid"
                          : ""
                      }`}
                      rows={3}
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter product description"
                      maxLength={1000}
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.description}
                        </div>
                      )}
                    <div className="form-text">
                      {getCharacterCount("description")}/1000 characters
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="mb-3">
                    <label className="form-label">Product Image *</label>

                    {/* Option 1: Upload from device */}
                    <div className="mb-2">
                      <label className="form-label small text-muted">
                        Upload from device:
                      </label>
                      <input
                        type="file"
                        className={`form-control ${
                          formik.touched.image && formik.errors.image
                            ? "is-invalid"
                            : ""
                        }`}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (!file.type.startsWith("image/")) {
                            formik.setFieldError(
                              "image",
                              "Please select a valid image file (JPEG, PNG, GIF, etc.)"
                            );
                            return;
                          }

                          if (file.size > 5 * 1024 * 1024) {
                            formik.setFieldError(
                              "image",
                              "Image size should be less than 5MB"
                            );
                            return;
                          }

                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64Image = event.target?.result as string;
                            formik.setFieldValue("image", base64Image);
                            formik.setFieldTouched("image", true);
                            toast.success("Image uploaded successfully!");
                          };
                          reader.onerror = () => {
                            formik.setFieldError(
                              "image",
                              "Failed to upload image"
                            );
                          };
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />
                      <div className="form-text">
                        Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                      </div>
                    </div>

                    {/* Option 2: Enter URL */}
                    <div className="mb-2">
                      <label className="form-label small text-muted">
                        Or enter image URL:
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${
                            formik.touched.image && formik.errors.image
                              ? "is-invalid"
                              : ""
                          }`}
                          name="image"
                          value={formik.values.image}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => formik.setFieldValue("image", "")}
                        >
                          Clear
                        </button>
                      </div>
                      {formik.touched.image && formik.errors.image && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.image}
                        </div>
                      )}
                      <div className="form-text">Enter a direct image URL</div>
                    </div>

                    {/* Image Preview */}
                    {formik.values.image && !formik.errors.image && (
                      <div className="mt-3">
                        <label className="form-label small text-muted">
                          Image Preview:
                        </label>
                        <div className="d-flex flex-column align-items-start">
                          <img
                            src={formik.values.image}
                            alt="Preview"
                            style={{
                              width: "200px",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "2px solid #dee2e6",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/200x200?text=Invalid+Image";
                              formik.setFieldError(
                                "image",
                                "Failed to load image. Please check the URL or upload a new image."
                              );
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger mt-2"
                            onClick={() => formik.setFieldValue("image", "")}
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Section */}
                  <div className="row">
                    <div className="col-md-4">
                      {/* Price */}
                      <div className="mb-3">
                        <label className="form-label">Price (EGP) *</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className={`form-control ${
                              formik.touched.price && formik.errors.price
                                ? "is-invalid"
                                : ""
                            }`}
                            name="price"
                            value={formik.values.price}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            min="0"
                            step="0.01"
                            max="100000"
                          />
                          <span className="input-group-text">EGP</span>
                        </div>
                        {formik.touched.price && formik.errors.price && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.price}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4">
                      {/* Old Price */}
                      <div className="mb-3">
                        <label className="form-label">Old Price (EGP)</label>
                        <input
                          type="text"
                          className={`form-control ${
                            formik.touched.oldprice && formik.errors.oldprice
                              ? "is-invalid"
                              : ""
                          }`}
                          name="oldprice"
                          value={formik.values.oldprice}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="140 EGP"
                          maxLength={20}
                        />
                        {formik.touched.oldprice && formik.errors.oldprice && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.oldprice}
                          </div>
                        )}
                        <div className="form-text">
                          {getCharacterCount("oldprice")}/20 characters
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      {/* Discount */}
                      <div className="mb-3">
                        <label className="form-label">Discount</label>
                        <input
                          type="text"
                          className={`form-control ${
                            formik.touched.discount && formik.errors.discount
                              ? "is-invalid"
                              : ""
                          }`}
                          name="discount"
                          value={formik.values.discount}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="15%"
                          maxLength={10}
                        />
                        {formik.touched.discount && formik.errors.discount && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.discount}
                          </div>
                        )}
                        <div className="form-text">
                          {getCharacterCount("discount")}/10 characters
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock & Status Section */}
                  <div className="row">
                    <div className="col-md-4">
                      {/* Stock */}
                      <div className="mb-3">
                        <label className="form-label">Stock *</label>
                        <input
                          type="number"
                          className={`form-control ${
                            formik.touched.stock && formik.errors.stock
                              ? "is-invalid"
                              : ""
                          }`}
                          name="stock"
                          value={formik.values.stock}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          min="0"
                          max="10000"
                        />
                        {formik.touched.stock && formik.errors.stock && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.stock}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Rating</label>
                        <input
                          type="text"
                          className={`form-control ${
                            formik.touched.rate && formik.errors.rate
                              ? "is-invalid"
                              : ""
                          }`}
                          name="rate"
                          value={formik.values.rate}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="⭐⭐⭐⭐⭐"
                          maxLength={10}
                        />
                        {formik.touched.rate && formik.errors.rate && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.rate}
                          </div>
                        )}
                        <div className="form-text">
                          {getCharacterCount("rate")}/10 characters
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Review</label>
                        <input
                          type="text"
                          className={`form-control ${
                            formik.touched.review && formik.errors.review
                              ? "is-invalid"
                              : ""
                          }`}
                          name="review"
                          value={formik.values.review}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Perfect decorative piece..."
                          maxLength={200}
                        />
                        {formik.touched.review && formik.errors.review && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.review}
                          </div>
                        )}
                        <div className="form-text">
                          {getCharacterCount("review")}/200 characters
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="bestseller"
                          checked={formik.values.bestseller}
                          onChange={formik.handleChange}
                        />
                        <label className="form-check-label">Bestseller</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="isNew"
                          checked={formik.values.isNew}
                          onChange={formik.handleChange}
                        />
                        <label className="form-check-label">New Arrival</label>
                      </div>
                    </div>
                  </div>

                  {/* Plant Details Section */}
                  <div className="border-top pt-3 mt-3">
                    <h6
                      className="mb-3"
                      style={{ color: "var(--color-green-darker)" }}
                    >
                      Plant Details
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Scientific Name</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.scientificName &&
                              formik.errors.scientificName
                                ? "is-invalid"
                                : ""
                            }`}
                            name="scientificName"
                            value={formik.values.scientificName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Mixed Succulent spp."
                            maxLength={100}
                          />
                          {formik.touched.scientificName &&
                            formik.errors.scientificName && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.scientificName}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("scientificName")}/100 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Native Region</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.nativeRegion &&
                              formik.errors.nativeRegion
                                ? "is-invalid"
                                : ""
                            }`}
                            name="nativeRegion"
                            value={formik.values.nativeRegion}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Worldwide (desert regions)"
                            maxLength={100}
                          />
                          {formik.touched.nativeRegion &&
                            formik.errors.nativeRegion && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.nativeRegion}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("nativeRegion")}/100 characters
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Life Cycle</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.lifeCycle &&
                              formik.errors.lifeCycle
                                ? "is-invalid"
                                : ""
                            }`}
                            name="lifeCycle"
                            value={formik.values.lifeCycle}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Perennial"
                            maxLength={50}
                          />
                          {formik.touched.lifeCycle &&
                            formik.errors.lifeCycle && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.lifeCycle}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("lifeCycle")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Genus</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.genus && formik.errors.genus
                                ? "is-invalid"
                                : ""
                            }`}
                            name="genus"
                            value={formik.values.genus}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Various"
                            maxLength={50}
                          />
                          {formik.touched.genus && formik.errors.genus && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.genus}
                            </div>
                          )}
                          <div className="form-text">
                            {getCharacterCount("genus")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Type</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.type && formik.errors.type
                                ? "is-invalid"
                                : ""
                            }`}
                            name="type"
                            value={formik.values.type}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Succulent collection"
                            maxLength={50}
                          />
                          {formik.touched.type && formik.errors.type && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.type}
                            </div>
                          )}
                          <div className="form-text">
                            {getCharacterCount("type")}/50 characters
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Care & Environment Section */}
                  <div className="border-top pt-3 mt-3">
                    <h6
                      className="mb-3"
                      style={{ color: "var(--color-green-darker)" }}
                    >
                      Care & Environment
                    </h6>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Climate</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.climate && formik.errors.climate
                                ? "is-invalid"
                                : ""
                            }`}
                            name="climate"
                            value={formik.values.climate}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Arid to semi-arid"
                            maxLength={50}
                          />
                          {formik.touched.climate && formik.errors.climate && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.climate}
                            </div>
                          )}
                          <div className="form-text">
                            {getCharacterCount("climate")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Soil Type</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.soilType && formik.errors.soilType
                                ? "is-invalid"
                                : ""
                            }`}
                            name="soilType"
                            value={formik.values.soilType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Well-draining cactus soil"
                            maxLength={50}
                          />
                          {formik.touched.soilType &&
                            formik.errors.soilType && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.soilType}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("soilType")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Watering Needs</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.wateringNeeds &&
                              formik.errors.wateringNeeds
                                ? "is-invalid"
                                : ""
                            }`}
                            name="wateringNeeds"
                            value={formik.values.wateringNeeds}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Low"
                            maxLength={50}
                          />
                          {formik.touched.wateringNeeds &&
                            formik.errors.wateringNeeds && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.wateringNeeds}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("wateringNeeds")}/50 characters
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Sunlight</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.sunlight && formik.errors.sunlight
                                ? "is-invalid"
                                : ""
                            }`}
                            name="sunlight"
                            value={formik.values.sunlight}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Bright indirect to full sun"
                            maxLength={50}
                          />
                          {formik.touched.sunlight &&
                            formik.errors.sunlight && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.sunlight}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("sunlight")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Humidity</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.humidity && formik.errors.humidity
                                ? "is-invalid"
                                : ""
                            }`}
                            name="humidity"
                            value={formik.values.humidity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Low"
                            maxLength={50}
                          />
                          {formik.touched.humidity &&
                            formik.errors.humidity && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.humidity}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("humidity")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Growth Rate</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.growthRate &&
                              formik.errors.growthRate
                                ? "is-invalid"
                                : ""
                            }`}
                            name="growthRate"
                            value={formik.values.growthRate}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Slow"
                            maxLength={50}
                          />
                          {formik.touched.growthRate &&
                            formik.errors.growthRate && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.growthRate}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("growthRate")}/50 characters
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Propagation</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.propagation &&
                              formik.errors.propagation
                                ? "is-invalid"
                                : ""
                            }`}
                            name="propagation"
                            value={formik.values.propagation}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Offsets or leaf cuttings"
                            maxLength={50}
                          />
                          {formik.touched.propagation &&
                            formik.errors.propagation && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.propagation}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("propagation")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Toxicity</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.toxicity && formik.errors.toxicity
                                ? "is-invalid"
                                : ""
                            }`}
                            name="toxicity"
                            value={formik.values.toxicity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Mostly non-toxic"
                            maxLength={50}
                          />
                          {formik.touched.toxicity &&
                            formik.errors.toxicity && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.toxicity}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("toxicity")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Flowering Season</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.floweringSeason &&
                              formik.errors.floweringSeason
                                ? "is-invalid"
                                : ""
                            }`}
                            name="floweringSeason"
                            value={formik.values.floweringSeason}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Varies by species"
                            maxLength={50}
                          />
                          {formik.touched.floweringSeason &&
                            formik.errors.floweringSeason && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.floweringSeason}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("floweringSeason")}/50 characters
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Height</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.height && formik.errors.height
                                ? "is-invalid"
                                : ""
                            }`}
                            name="height"
                            value={formik.values.height}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="0.1 - 0.3 m"
                            maxLength={50}
                          />
                          {formik.touched.height && formik.errors.height && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.height}
                            </div>
                          )}
                          <div className="form-text">
                            {getCharacterCount("height")}/50 characters
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Container Type</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formik.touched.containerType &&
                              formik.errors.containerType
                                ? "is-invalid"
                                : ""
                            }`}
                            name="containerType"
                            value={formik.values.containerType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Pot"
                            maxLength={50}
                          />
                          {formik.touched.containerType &&
                            formik.errors.containerType && (
                              <div className="invalid-feedback d-block">
                                {formik.errors.containerType}
                              </div>
                            )}
                          <div className="form-text">
                            {getCharacterCount("containerType")}/50 characters
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Care Tips */}
                    <div className="mb-3">
                      <label className="form-label">Care Tips</label>
                      <textarea
                        className={`form-control ${
                          formik.touched.careTips && formik.errors.careTips
                            ? "is-invalid"
                            : ""
                        }`}
                        rows={2}
                        name="careTips"
                        value={formik.values.careTips}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Avoid overwatering; rotate for even growth."
                        maxLength={500}
                      />
                      {formik.touched.careTips && formik.errors.careTips && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.careTips}
                        </div>
                      )}
                      <div className="form-text">
                        {getCharacterCount("careTips")}/500 characters
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="modal-footer"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "20px",
                    borderTop: "1px solid #dee2e6",
                    paddingTop: "15px",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingProduct(null);
                      setNewProduct(null);
                      formik.resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!formik.isValid || formik.isSubmitting}
                    style={{
                      background: formik.isValid
                        ? "var(--color-green-darker)"
                        : "#6c757d",
                      border: "none",
                    }}
                  >
                    {formik.isSubmitting
                      ? "Saving..."
                      : editingProduct
                      ? "Update Product"
                      : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
