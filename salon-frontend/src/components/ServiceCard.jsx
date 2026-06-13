import React from 'react';

const ServiceCard = ({ service }) => {
  return (
    <div className="bg-[#1c1c1c] rounded-lg p-5 mb-4 border border-[#2a2a2a] hover:border-[#d32f2f] transition-all flex justify-between items-center">
      
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-white">
          {service.nameEn} <span className="text-sm text-gray-400 ml-2">({service.nameAr})</span>
        </h3>
        <p className="text-[#a3a3a3] text-sm mt-1">{service.description}</p>
        <span className="text-[#a3a3a3] text-xs mt-3 flex items-center">
          ⏱️ {service.durationMinutes} mins
        </span>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-xl font-bold text-white">
          {service.price} EGP
        </span>
        {service.originalPrice && (
          <span className="text-sm text-gray-500 line-through">
            {service.originalPrice} EGP
          </span>
        )}
        <button className="mt-3 bg-transparent border border-[#d32f2f] text-[#d32f2f] px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#d32f2f] hover:text-white transition-colors">
          Select
        </button>
      </div>

    </div>
  );
};

export default ServiceCard;