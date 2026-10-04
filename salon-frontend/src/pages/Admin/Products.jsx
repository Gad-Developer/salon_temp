import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { useAdminAuth } from '../../context/AdminContext';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Loader2, Store, PackageSearch } from 'lucide-react';
import defaultProductImg from '../../assets/temp-service.svg';

const Products = () => {
  const { lang } = useLanguage();
  const { admin } = useAdminAuth();
  
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState(null);

  const [form, setForm] = useState({
    nameEn: '', nameAr: '',
    brand: '', price: '',
    taglineEn: '', taglineAr: '',
    image: '',
    isActive: true,
    inventory: [] // Array of { branchId, stock }
  });

  const isFormValid = 
    form.nameEn.trim() !== '' && 
    form.nameAr.trim() !== '' && 
    form.brand.trim() !== '' && 
    form.image.trim() !== '' && 
    String(form.price).trim() !== '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both products and branches simultaneously
      const [prodRes, branchRes] = await Promise.all([
        axios.get('/api/products?all=true').catch(() => ({ data: [] })),
        axios.get('/api/branches?all=true').catch(() => ({ data: [] }))
      ]);
      setProducts(prodRes.data);
      setBranches(branchRes.data);
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, image: res.data.url });
    } catch (error) {
      alert(lang === 'ar' ? 'فشل رفع الصورة.' : 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (prod = null) => {
    if (prod) {
      setEditingProdId(prod._id);
      setForm({
        nameEn: prod.nameEn || '', nameAr: prod.nameAr || '',
        brand: prod.brand || '', price: prod.price || '',
        taglineEn: prod.taglineEn || '', taglineAr: prod.taglineAr || '',
        image: prod.image || '',
        isActive: prod.isActive !== false,
        inventory: prod.inventory || []
      });
    } else {
      setEditingProdId(null);
      setForm({
        nameEn: '', nameAr: '', brand: '', price: '',
        taglineEn: '', taglineAr: '', image: '', isActive: true,
        inventory: []
      });
    }
    setIsModalOpen(true);
  };

  const handleInventoryChange = (branchId, value) => {
    const newInventory = [...form.inventory];
    const existingIndex = newInventory.findIndex(item => item.branchId === branchId);
    
    if (existingIndex >= 0) {
      newInventory[existingIndex].stock = Number(value);
    } else {
      newInventory.push({ branchId, stock: Number(value) });
    }
    
    setForm({ ...form, inventory: newInventory });
  };

  const saveProduct = async () => {
    if (!isFormValid) {
      alert(lang === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية.' : 'Please fill all mandatory fields.');
      return;
    }

    const isConfirmed = window.confirm(lang === 'ar' ? 'هل أنت متأكد من حفظ هذه التعديلات؟' : 'Are you sure you want to save these changes?');
    if (!isConfirmed) return;

    setIsSaving(true);

    try {
      if (editingProdId) {
        await axios.put(`/api/products/${editingProdId}`, form);
      } else {
        await axios.post('/api/products', form);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchData();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  // Calculate total dynamic stock for display
  const calculateTotalStock = (inventoryArray) => {
    if (!inventoryArray || inventoryArray.length === 0) return 0;
    return inventoryArray.reduce((total, item) => total + (item.stock || 0), 0);
  };

  return (
    <>
      <div className="text-white animate-fade-in-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">
              {lang === 'ar' ? 'المنتجات' : 'Products'}
            </h1>
            <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
          </div>
          {admin?.role === 'Super Admin' && (
            <button 
              onClick={() => openModal()}
              className="bg-[#d32f2f] hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Plus size={16} /> {lang === 'ar' ? 'إضافة منتج' : 'Add Product'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#a3a3a3] animate-pulse">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555]">
            {lang === 'ar' ? 'لا توجد منتجات حالياً.' : 'No products found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((prod) => {
              const totalStock = calculateTotalStock(prod.inventory);
              const isOutOfStock = totalStock === 0;

              return (
                <div key={prod._id} className={`bg-[#141414] border ${prod.isActive ? 'border-[#2a2a2a]' : 'border-red-900/50 opacity-75'} rounded-xl overflow-hidden flex flex-row group hover:border-[#555] transition-colors relative h-40`}>
                  
                  <div className="w-40 h-full bg-[#0a0a0a] relative shrink-0 border-r border-[#2a2a2a]">
                    {!prod.isActive && (
                      <div className="absolute top-0 left-0 w-full bg-red-500/90 text-white text-[9px] font-black py-1 text-center uppercase tracking-widest z-10">Inactive</div>
                    )}
                    {prod.image && prod.image.trim() !== '' ? (
                      <img 
                        src={prod.image} 
                        alt={prod.nameEn} 
                        className="w-full h-full object-cover p-2" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultProductImg;
                        }}
                      />
                    ) : (
                      <img src={defaultProductImg} alt="Default" className="w-full h-full object-cover p-2" />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow justify-between min-w-0">
                    <div className="relative">
                      <span className="block text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider mb-1 truncate pr-8">{prod.brand}</span>
                      <h3 className="font-black text-base text-white leading-tight truncate pr-8">
                        {lang === 'ar' ? prod.nameAr : prod.nameEn}
                      </h3>
                      
                      {admin?.role === 'Super Admin' && (
                        <div className="absolute top-0 right-0 flex flex-col gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" dir="ltr">
                          <button onClick={() => openModal(prod)} className="p-1.5 bg-[#1a1a1a] text-blue-400 hover:text-blue-300 rounded border border-[#333]"><Edit2 size={14}/></button>
                          <button onClick={() => deleteProduct(prod._id)} className="p-1.5 bg-[#1a1a1a] text-red-500 hover:text-red-400 rounded border border-[#333]"><Trash2 size={14}/></button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <PackageSearch size={14} className={isOutOfStock ? "text-red-500" : "text-green-500"} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isOutOfStock ? "text-red-500" : "text-green-500"}`}>
                        {totalStock} In Stock
                      </span>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                      <span className="text-lg font-black text-[#d32f2f]">{prod.price} EGP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in-up relative">
            
            {isSaving && (
              <div className="absolute inset-0 bg-[#141414]/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-2xl">
                <Loader2 className="animate-spin text-[#d32f2f] mb-3" size={32} />
                <span className="text-sm font-bold uppercase tracking-widest text-white">Applying Changes...</span>
              </div>
            )}

            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#141414] z-10 pb-4 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black uppercase tracking-wider">{editingProdId ? 'Edit Product' : 'New Product'}</h3>
                <label className="flex items-center gap-2 text-xs font-bold text-[#a3a3a3] cursor-pointer bg-[#0a0a0a] px-3 py-1.5 rounded border border-[#333]">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="accent-[#d32f2f]" disabled={isSaving} />
                  Active Product
                </label>
              </div>
              <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" dir="ltr">
              
              {/* Left/Middle Column (Basic Info) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Product Identity</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Brand <span className="text-red-500">*</span></label>
                      <input type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} placeholder="e.g. L'Oréal" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Price (EGP) <span className="text-red-500">*</span></label>
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Name (English) <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase mb-1 text-right">Name (Arabic) <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm text-right" dir="rtl" disabled={isSaving} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Marketing & Media</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Tagline (English)</label>
                      <input type="text" value={form.taglineEn} onChange={e => setForm({...form, taglineEn: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} placeholder="Short promotional sentence" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1 text-right">Tagline (Arabic)</label>
                      <input type="text" value={form.taglineAr} onChange={e => setForm({...form, taglineAr: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm text-right" dir="rtl" disabled={isSaving} />
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#a3a3a3] uppercase mb-3"><ImageIcon size={14}/> Main Product Image <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3 bg-[#141414] p-2 rounded-lg border border-[#333]">
                      <div className="h-12 w-12 shrink-0 rounded bg-[#222] overflow-hidden flex items-center justify-center border border-[#333]">
                        {isUploading ? (
                          <Loader2 size={16} className="text-[#d32f2f] animate-spin" />
                        ) : form.image ? (
                          <img src={form.image} alt="Preview" className="h-full w-full object-cover p-1" />
                        ) : (
                          <ImageIcon size={16} className="text-[#555]"/>
                        )}
                      </div>
                      
                      <input 
                        type="file" 
                        id="productImageUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden" 
                        disabled={isSaving || isUploading}
                      />
                      
                      <label 
                        htmlFor="productImageUpload"
                        className={`flex-1 flex items-center justify-center gap-2 border border-dashed border-[#333] rounded px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
                          ${isUploading || isSaving ? 'bg-[#0a0a0a] text-[#555] cursor-not-allowed' : 'bg-[#0a0a0a] text-blue-400 hover:text-blue-300 hover:border-blue-400/50'}
                        `}
                      >
                        {isUploading ? 'Uploading to Cloudinary...' : form.image ? 'Change Image' : 'Select File'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Inventory Engine) */}
              <div className="space-y-4 bg-[#0a0a0a] p-5 border border-[#2a2a2a] rounded-xl h-fit">
                <div className="flex justify-between items-end border-b border-[#333] pb-2 mb-4">
                  <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest">Inventory Control</h4>
                  <div className="text-right">
                    <span className="block text-[9px] text-[#555] font-bold uppercase tracking-widest">Total Stock</span>
                    <span className="text-lg font-black text-white leading-none">{calculateTotalStock(form.inventory)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {branches.length === 0 ? (
                    <p className="text-xs text-[#555] text-center py-4">No branches available to assign stock.</p>
                  ) : (
                    branches.map(branch => {
                      // Find existing stock value or default to 0
                      const stockObj = form.inventory.find(i => i.branchId === branch._id);
                      const currentStock = stockObj ? stockObj.stock : 0;

                      return (
                        <div key={branch._id} className="flex items-center justify-between bg-[#141414] p-3 rounded-lg border border-[#333]">
                          <div className="truncate pr-4">
                            <span className="block text-xs font-bold text-white truncate">{lang === 'ar' ? branch.nameAr : branch.nameEn}</span>
                            {!branch.isActive && <span className="text-[9px] text-red-500 uppercase tracking-widest font-black">Inactive Branch</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="0"
                              value={currentStock} 
                              onChange={(e) => handleInventoryChange(branch._id, e.target.value)}
                              className="w-20 bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-white outline-none focus:border-[#d32f2f] text-sm text-center font-bold"
                              disabled={isSaving}
                            />
                            <span className="text-[10px] text-[#555] font-bold uppercase">Units</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>

            <div className="mt-8 pt-4 border-t border-[#2a2a2a] flex justify-end gap-3" dir="ltr">
              <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-[#a3a3a3] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50">Cancel</button>
              <button 
                disabled={isSaving || !isFormValid} 
                onClick={saveProduct} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                  ${!isFormValid ? 'bg-[#2a2a2a] text-[#555] cursor-not-allowed' : 'bg-[#d32f2f] text-white hover:bg-red-700 disabled:opacity-50'}
                `}
              >
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16}/> Save Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;