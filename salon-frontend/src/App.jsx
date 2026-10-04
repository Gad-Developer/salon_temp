import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './utils/LanguageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import GlobalLoader from './components/GlobalLoader';

// Eagerly loaded layout and context
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AdminProvider } from './context/AdminContext';

// Lazy loaded Public Components
const Home = lazy(() => import('./pages/Main/Home/Home'));
const Booking = lazy(() => import('./pages/Main/Booking/Booking'));
const ProductsShop = lazy(() => import('./pages/Main/ProductsShop'));
const SubmitReview = lazy(() => import('./pages/Main/SubmitReview'));

// Lazy loaded Admin Components
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const StaffPortal = lazy(() => import('./pages/Admin/StaffPortal')); 
const CategoriesServices = lazy(() => import('./pages/Admin/CategoriesServices'));
const VIPPackages = lazy(() => import('./pages/Admin/VIPPackages'));
const Products = lazy(() => import('./pages/Admin/Products'));
const Branches = lazy(() => import('./pages/Admin/Branches'));
const Professionals = lazy(() => import('./pages/Admin/Professionals'));
const Appointments = lazy(() => import('./pages/Admin/Appointments'));
const ProductOrders = lazy(() => import('./pages/Admin/ProductOrders'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const SystemSettings = lazy(() => import('./pages/Admin/SystemSettings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      <Suspense fallback={<GlobalLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          
          {/* Independent route for customers to leave reviews */}
          <Route path="/submit-review" element={<SubmitReview />} />
          
          <Route path="/products" element={<ProductsShop />} />
        </Route>

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={
          <Suspense fallback={<GlobalLoader />}>
            <AdminLogin />
          </Suspense>
        } />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={
          <Suspense fallback={<GlobalLoader />}>
            <AdminLayout />
          </Suspense>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="orders" element={<ProductOrders />} />
          <Route path="services" element={<CategoriesServices />} />
          <Route path="packages" element={<VIPPackages />} />
          <Route path="products" element={<Products />} />
          <Route path="professionals" element={<Professionals />} />
          <Route path="branches" element={<Branches />} />
          
          {/* Unified Reviews Management Page */}
          <Route path="reviews" element={<StaffPortal />} />
          
          <Route path="settings" element={<SystemSettings />} />
        </Route>

      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AdminProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </AdminProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;