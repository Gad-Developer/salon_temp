Salon ✂️
Salon is a comprehensive, full-stack MERN web application designed to digitalize and streamline barbershop and salon operations. Built with React, Node.js, Express, and MongoDB, it offers a seamless bilingual experience (Arabic/English) for clients while providing robust, secure management tools for the staff and administration.

✨ Features
Dynamic Booking Engine: A localized appointment scheduling system allowing clients to browse services, select their preferred professional, and lock in dates and times.

"Reserve & Collect" E-Commerce: A fully integrated product shop and cart system where clients can browse premium hair care products and reserve them for in-store pickup.

Spam-Proof Review Portal: A highly secure client feedback system. Staff use a PIN-protected portal to generate unique, 24-hour disposable access codes, ensuring 100% verified customer reviews.

Master Admin Dashboard: A centralized, PIN-protected command center for management to oversee incoming product orders, update appointment statuses (Pending, Confirmed, Completed), and edit or delete records in real-time.

Bilingual Architecture: Native support for both English and Arabic, utilizing a custom React Context provider to dynamically swap translations and LTR/RTL layouts without page reloads.

🛠️ Tech Stack
Frontend

Framework: React (Vite)

Styling: Tailwind CSS

State Management: React Context API (Language & Cart)

Icons: Lucide React

Backend

Runtime: Node.js / Express

Database: MongoDB (Mongoose ORM)

Architecture: RESTful API (MVC Pattern)

📂 Project Architecture
Plaintext
salon/
├── salon-backend/          # Node/Express API & Database Architecture
│   ├── controllers/        # Business logic (Appointments, Orders, Reviews, Products)
│   ├── models/             # Mongoose DB Schemas
│   ├── routes/             # REST API Endpoints
│   └── server.js           # Server Initialization & Route Mounting
└── salon-frontend/         # React Client Interface
    ├── src/
    │   ├── components/     # Reusable UI elements (Navbar, Cart, Product Cards)
    │   ├── pages/          # Core views (Home, AdminDashboard, StaffPortal, SubmitReview)
    │   ├── utils/          # LanguageContext and global helpers
    │   └── data/           # Translation dictionaries
    └── App.jsx             # Component Wrapper & React Router setup


🚀 Getting Started
1. Clone the Repository
https://github.com/MahmoudMuhammed8/salon.git
cd salon

2. Backend Environment Configuration
Navigate into the backend subfolder and install dependencies:
cd salon-backend
npm install

Create a .env file in the root of salon-backend/ and add your database credentials:
PORT=5000
MONGO_URI=your_mongodb_connection_string_here

Fire up the backend development server:
npm run dev


3. Frontend Interface Setup
Open a new terminal window, navigate to the frontend subfolder, and install dependencies:
cd ../salon-frontend
npm install

Create a .env file in the root of salon-frontend/ to set your secure access PINs:
VITE_STAFF_PIN=778899
VITE_ADMIN_PIN=112233

Launch Vite's local development server:
npm run dev