import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './utils/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Main/Home';
import Booking from './pages/Main/Booking'; // <-- New Import
import ProductsShop from './pages/Main/ProductsShop';
import SubmitReview from './pages/Main/SubmitReview';
import StaffPortal from './pages/Admin/StaffPortal';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/review" element={<SubmitReview />} />
          <Route path="/products" element={<ProductsShop />} /> 
          <Route path="/staff-portal" element={<StaffPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;