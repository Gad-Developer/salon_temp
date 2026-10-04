import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../../utils/LanguageContext';

// Import all the newly extracted components
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import PackagesSection from './components/PackagesSection';
import ProfessionalsSection from './components/ProfessionalsSection';
import ReviewsSection from './components/ReviewsSection';
import BranchesSection from './components/BranchesSection';
import ProductsSection from '../../../components/ProductsSection'; // Global component
import PageTransition from '../../../components/PageTransition';

const Home = () => {
  const { lang } = useLanguage();
  
  // 1. Global Data State
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch all required data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, profRes, pkgRes, branchRes, revRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/professionals'),
          axios.get('/api/packages'),
          axios.get('/api/branches'),
          axios.get('/api/reviews').catch(() => ({ data: [] }))
        ]);
        
        setCategories(catRes.data);
        setProfessionals(profRes.data);
        setPackages(pkgRes.data);
        setBranches(branchRes.data);
        setReviews(revRes.data || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. Global Scroll Handler (Passed to HeroSection for its CTA buttons)
  const handleScroll = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageTransition className="bg-[#0a0a0a] min-h-screen font-sans overflow-x-hidden text-white">
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. Hero Section */}
      <HeroSection handleScroll={handleScroll} />

      {/* 2. Services & Kids Services Section */}
      <ServicesSection categories={categories} isLoading={isLoading} />

      {/* 3. Packages Section */}
      <PackagesSection packages={packages} isLoading={isLoading} />

      {/* 4. Products Section (Standalone component handling its own fetch) */}
      <ProductsSection />

      {/* 5. Professionals Section */}
      <ProfessionalsSection professionals={professionals} isLoading={isLoading} />

      {/* 6. Reviews Section */}
      <ReviewsSection reviews={reviews} isLoading={isLoading} />

      {/* 7. Branches Section */}
      <BranchesSection branches={branches} isLoading={isLoading} />
      
      </div>
    </PageTransition>
  );
};

export default Home;