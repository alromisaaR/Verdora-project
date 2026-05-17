import React, { useState, useEffect } from "react";
import { IoCallOutline, IoLocationOutline, IoSaveOutline, IoCameraOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "../../styles/global.css"
import Todashboard from "../../components/Home/Todashboard";



interface User {
  id: number;
  name: string;
  address: string;
  phone: string;
  image: string;
  email: string;
  password: string;
  role: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});


  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        address: parsedUser.address || "",
        image: parsedUser.image || "",
      });
    }
  }, []);





  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };



  const handleSave = async () => {
    if (!user) return;

    try {

      const updatedData = {
        ...formData,
        password: user.password,
        role: user.role,
      };
      const response = await fetch(`http://localhost:5005/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Error updating user");

      const updatedUser = await response.json();

      setUser(updatedUser);
      setFormData(updatedUser);

      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));

      setEditMode(false);
      toast.success("Data is saved successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
      toast.error("Error saving data");
    }
  };



  if (!user) return <p>Data is loading...</p>;

  return (
    <div className="profile-container checkout-page" style={styles.container}>
      <div style={styles.imageContainer}>
        <div style={styles.avatarContainer}>
          {formData.image ? (
            <img
              src={formData.image}
              alt="User Avatar"
              style={styles.avatarImage}
            />
          ) : (
            <div style={styles.avatarPlaceholder}></div>
          )}

          {editMode && (
            <>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <label htmlFor="imageUpload" style={styles.cameraIcon}>
                <IoCameraOutline size={22} />
              </label>
            </>
          )}
        </div>



      </div>


      <div style={styles.info}>
        <label><FaRegEdit /> Name</label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          disabled={!editMode}
          style={styles.input}
        />

        <label><IoLocationOutline /> Address</label>
        <input
          type="text"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          disabled={!editMode}
          style={styles.input}
        />

        <label><IoCallOutline /> Phone Number</label>
        <input
          type="text"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          disabled={!editMode}
          style={styles.input}
        />


        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          disabled
          style={{ ...styles.input, backgroundColor: "#f5f5f5", color: "#555" }}
        />

        {!editMode ? (
          <button onClick={() => setEditMode(true)} style={styles.button}>
            Edit Profile
          </button>
        ) : (
          <button onClick={handleSave} style={styles.saveButton}>
            <IoSaveOutline /> Save
          </button>
        )}
      </div>

        <Todashboard />
    </div>
  );
};

export default UserProfile;


const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "50px",
    background: "#F8F9FA",
    padding: "30px",
    borderRadius: "20px",
    maxWidth: "400px",
    margin: "50px auto",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",

  },
  imageContainer: { position: "relative", marginBottom: "20px" },
  avatar: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #eee",
  },
  avatarContainer: {
    position: "relative",
    width: "130px",
    height: "130px",
  },

  avatarImage: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #eee",
  },

  avatarPlaceholder: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    border: "2px dashed #ccc",
  },

  info: { width: "100%", display: "flex", flexDirection: "column", gap: "10px", color: "var(--color-green-darkest)" },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  cameraIcon: {
    position: "absolute",
    bottom: "10px",
    right: "15px",
    background: "#474343ff",
    color: "#fff",
    borderRadius: "50%",
    padding: "5px",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    transition: "0.3s",
  },

  button: {
    background: "var(--color-green-darkest)",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "10px",
  },

  saveButton: {
    background: "var(--color-green-darkest)",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "10px",
  },
};
