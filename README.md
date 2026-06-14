<img width="1900" height="776" alt="Screenshot 2025-10-25 181340" src="https://github.com/user-attachments/assets/2cae926d-b8ce-4931-a913-459b6395c89c" /># React-project
# 🌿 Verdora – Smart Plant E-Commerce Platform

Verdora is a modern, eco-inspired e-commerce web app for plant lovers.  
It helps users explore, choose, and buy plants that fit their lifestyle — using an interactive **Plant Finder Quiz**, personalized recommendations, and a smooth shopping experience.

🚀 My Core Frontend & Dashboard Contributions:

• UI Enhancement: Upgraded and refactored the UI across the entire platform using Bootstrap to ensure clean layouts, responsive design, and a consistent look and feel.

• User Registration: Built the complete Register page (UI and Logic), implementing client-side validation and managing user authentication states.

• Dynamic Product Grid: Developed a single product listing page that dynamically filters and displays plants across 4 different categories based on backend data.

• Promotional Badges: Added visual badges ("Sale", "New", "Bestseller") to the product cards determined by real-time database values.

• Admin Dashboard (Product page): Created the products management hub from scratch, using dynamic modals to handle Add, Edit, and Delete operations for plant items.

• Form Validation: Handled complex forms using Formik and Yup to validate detailed plant data (like scientific names, toxicity, and image strings) before submission.

• Backend Integration & Database: Integrated Supabase for user authentication and managing full CRUD operations, ensuring database synchronization and clean state updates.

• Live Filters & Pagination: Programmed real-time search, stock status filtering, and dynamic pagination for a smoother browsing experience.

## ✨ Features
- ⚙️ **Typescrpit** - All code written by Typescript
- 🪴 **Product Listing & Details** – Browse and view all available plants with images and info.  
- 🔍 **Smart Search & Filters** – Filter by category, size, and maintenance level.  
- 🎯 **Plant Finder Quiz** – Helps users find the perfect plant match based on lifestyle.  
- 🛍️ **Shopping Cart** – Add, edit, and remove items easily.  
- 🧑‍💻 **Admin Dashboard** – Manage products, categories, Reports, orders, and users.  
- 📱 **Responsive Design** – Works on mobile, tablet, and desktop.  
- ⚙️ **Pagination** – Clean navigation through large product lists.  
- 🔐 **Authentication** – Login, signup, and session management.

---

## 🧠 Tech Stack

| Category | Technologies |
|-----------|---------------|
| **Frontend** | React, TypeScript, Redux Toolkit, React Query, Bootstrap |
| **Backend / API** | Supabase (PostgreSQL) |
| **Routing** | React Router |
| **State Management** | Redux Toolkit |
| **Version Control** | Git + GitHub |

---

## ⚙️ Installation & Setup

Clone the project and install dependencies:

```bash
git clone https://github.com/alromisaaR/Verdora-project.git
cd verdora
npm install
```

Run the development server:

```bash
npm run dev
```

Environment Variables Config
Create a .env file in the root directory and add your Supabase credentials:5


VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
---

## 🧩 Folder Structure

```
verdora/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── hooks/
│   ├── styles/
│   └── App.tsx
│
├── package.json
└── README.md
```

---

## 👩‍💻 Our Team

| Name | Role |
|------|------|
| **Toka Elqersh** | Team Leader - Frontend Developer|
| **Alromisaa Reda** | Frontend Designer |
| **Omnia Fathy** | Frontend Developer |
| **Ahmed  Hazem** | Frontend Developer |


---

## 💡 Future Improvements

- Implement AI-based plant recommendations  
- Add user profile & order history  
- Introduce wishlist feature  

---

## 🪴 License

This project is open-source and available under the [MIT License](./LICENSE).

---

**Verdora – Greener choices, smarter living.**
