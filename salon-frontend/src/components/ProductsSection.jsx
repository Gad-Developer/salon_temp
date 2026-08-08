import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useLanguage } from '../utils/LanguageContext';
import { Link } from 'react-router-dom';
import axios from 'axios'; 

const ProductsSection = () => {
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - Will connect to API in Phase 2
    axios.get('/api/products')
        .then(res => {
            setProducts(res.data);
            setIsLoading(false);
        })
        .catch(err => {
            console.error("Error fetching products:", err);
            setIsLoading(false);
        });
  }, []);

  return (
    <section className="py-16 px-0 bg-[#0a0a0a] border-t border-[#1f1f1f]" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header matching main styles */}
        <div className="flex justify-between items-end mb-8 lg:mb-10">
            <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest mb-2 lg:mb-3">
                {t('products_title')}
                </h2>
                <div className="w-12 sm:w-16 h-1 bg-[#d32f2f] rounded-full"></div>
            </div>
            <Link to="/products" className="text-xs text-[#a3a3a3] hover:text-white uppercase font-bold tracking-wider transition-colors border-b border-transparent hover:border-[#d32f2f] pb-1">
                {t('view_all_products')} →
            </Link>
        </div>

        {/* Horizontal Scroll Container */}
        {isLoading ? (
          <div className="text-[#a3a3a3] text-center text-sm animate-pulse">Loading...</div>
        ) : products.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 lg:gap-6 pb-8 scrollbar-hide custom-scrollbar">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} lang={lang} t={t} />
            ))}
          </div>
        ) : (
          <div className="w-full text-center text-[#555] text-sm py-10 border border-dashed border-[#333] rounded-xl mt-6">
            {t('no_products')}
          </div>
        )}

      </div>
    </section>
  );
};

export default ProductsSection;