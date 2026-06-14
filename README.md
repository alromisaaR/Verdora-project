<img width="1900" height="776" alt="Screenshot 2025-10-25 181340" src="https://github.com/user-attachments/assets/2cae926d-b8ce-4931-a913-459b6395c89c" /># React-project
# 🌿 Verdora – Smart Plant E-Commerce Platform

Verdora is a modern, eco-inspired e-commerce web app for plant lovers.  
It helps users explore, choose, and buy plants that fit their lifestyle — using an interactive **Plant Finder Quiz**, personalized recommendations, and a smooth shopping experience.

🚀 My Core Frontend & Dashboard Contributions:

• Comprehensive UI Refactoring: Spearheaded the visual overhaul and global UI enhancements across the entire platform. Standardized layouts, optimized styling, and enforced strict design consistency to deliver a polished, responsive, and seamless user experience.

• Secure User Authentication (Register): Engineered the complete User Registration flow from scratch (UI & Logic). Formulated clean input validation and handled asynchronous state updates to ensure a seamless onboarding experience.

• Unified Product Feed & Categorization: Engineered a scalable, multi-category single product listing page. Built dynamic layout adaptations that programmatically filter and render custom UI states across 4 distinct plant categories.

• Commercial Visual Badges: Developed and integrated promotional badge states ("Sale", "New", "Bestseller") into the product grid logic to enhance click-through rates based on real-time backend values.

• Full CRUD Admin Dashboard: Built the administrative Products Management hub from scratch, featuring dynamic Modals for creating and editing plant items.

• Enterprise Form Validation: Formulated complex data-integrity rules using Formik and Yup inside the dashboard, managing dozens of advanced plant attributes (e.g., scientific name, toxicity, propagation, humidity, and custom base64 image strings).

• Hybrid Data Fetching & Syncing: Orchestrated data retrieval operations integrating both Supabase Client Queries for reading data and Axios REST API calls for executing full CRUD operations, coupled with precise cache/state resetting.

• Live Filter, Search, and Pagination: Programmed advanced UI control systems, integrating sanitized real-time text search, active/low stock status filtering, and dynamic smooth-scroll pagination.

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
