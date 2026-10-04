import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { useAdminAuth } from '../../context/AdminContext';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import defaultServiceImg from '../../assets/temp-service.svg';

const CategoriesServices = () => {
  const { t, lang } = useLanguage();
  const { admin } = useAdminAuth();
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});

  // Modal States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isServModalOpen, setIsServModalOpen] = useState(false);
  
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingServId, setEditingServId] = useState(null);
  const [activeCatIdForService, setActiveCatIdForService] = useState(null);

  const [uploadingIndex, setUploadingIndex] = useState(null);

  // Form States
  const [catForm, setCatForm] = useState({ titleEn: '', titleAr: '' });
  const [servForm, setServForm] = useState({
    nameEn: '', nameAr: '',
    descriptionEn: '', descriptionAr: '',
    price: '', originalPrice: '',
    durationMinutes: '',
    images: ['']
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingIndex(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newImages = [...servForm.images];
      newImages[index] = res.data.url;
      setServForm({ ...servForm, images: newImages });
    } catch (error) {
      alert(lang === 'ar' ? 'فشل رفع الصورة.' : 'Failed to upload image.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/categories').catch(() => ({ data: [] }));
      setCategories(res.data);
      
      const initialExpanded = {};
      res.data.forEach(cat => initialExpanded[cat._id] = true);
      setExpandedCats(initialExpanded);
    } catch (error) {
      console.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCat = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- CATEGORY HANDLERS ---
  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCatId(cat._id);
      setCatForm({ titleEn: cat.titleEn, titleAr: cat.titleAr });
    } else {
      setEditingCatId(null);
      setCatForm({ titleEn: '', titleAr: '' });
    }
    setIsCatModalOpen(true);
  };

  const saveCategory = async () => {
    // Native confirmation before proceeding
    const isConfirmed = window.confirm(lang === 'ar' ? 'هل أنت متأكد من حفظ هذه التعديلات؟' : 'Are you sure you want to save these changes?');
    if (!isConfirmed) return;

    setIsSaving(true);
    try {
      if (editingCatId) {
        await axios.put(`/api/categories/${editingCatId}`, catForm);
      } else {
        await axios.post('/api/categories', catForm);
      }
      setIsCatModalOpen(false);
      await fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا القسم بالكامل؟' : 'Delete this entire category and all its services?')) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete category");
    }
  };

  // --- SERVICE HANDLERS ---
  const openServModal = (catId, serv = null) => {
    setActiveCatIdForService(catId);
    if (serv) {
      setEditingServId(serv._id || serv.nameEn);
      setServForm({
        nameEn: serv.nameEn || '', nameAr: serv.nameAr || '',
        descriptionEn: serv.descriptionEn || '', descriptionAr: serv.descriptionAr || '',
        price: serv.price || '', originalPrice: serv.originalPrice || '',
        durationMinutes: serv.durationMinutes || '',
        images: Array.isArray(serv.images) ? serv.images : (serv.image ? [serv.image] : [''])
      });
    } else {
      setEditingServId(null);
      setServForm({
        nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '',
        price: '', originalPrice: '', durationMinutes: '', images: ['']
      });
    }
    setIsServModalOpen(true);
  };

  const saveService = async () => {
    // Native confirmation before proceeding
    const isConfirmed = window.confirm(lang === 'ar' ? 'هل أنت متأكد من حفظ هذه التعديلات؟' : 'Are you sure you want to save these changes?');
    if (!isConfirmed) return;

    setIsSaving(true);
    const cleanedImages = servForm.images.filter(img => img.trim() !== '');
    const payload = { ...servForm, images: cleanedImages };

    try {
      if (editingServId) {
        await axios.put(`/api/categories/${activeCatIdForService}/services/${editingServId}`, payload);
      } else {
        await axios.post(`/api/categories/${activeCatIdForService}/services`, payload);
      }
      setIsServModalOpen(false);
      await fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteService = async (catId, servId) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Delete this service?')) return;
    try {
      await axios.delete(`/api/categories/${catId}/services/${servId}`);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete service");
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...servForm.images];
    newImages[index] = value;
    setServForm({ ...servForm, images: newImages });
  };

  const addImageInput = () => {
    setServForm({ ...servForm, images: [...servForm.images, ''] });
  };

  const removeImageInput = (index) => {
    const newImages = servForm.images.filter((_, i) => i !== index);
    setServForm({ ...servForm, images: newImages.length ? newImages : [''] });
  };

  return (
    <>
      <div className="text-white animate-fade-in-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">
              {lang === 'ar' ? 'القائمة والخدمات' : 'Menu & Services'}
            </h1>
            <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
          </div>
          {admin?.role === 'Super Admin' && (
            <button 
              onClick={() => openCatModal()}
              className="bg-[#d32f2f] hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Plus size={16} /> {lang === 'ar' ? 'إضافة قسم جديد' : 'Add Category'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#a3a3a3] animate-pulse">Loading menu data...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555]">
            {lang === 'ar' ? 'لا توجد أقسام حالياً.' : 'No categories found.'}
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
                <div className="bg-[#1a1a1a] p-4 flex items-center justify-between border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleCat(cat._id)} className="text-[#a3a3a3] hover:text-white transition-colors">
                      {expandedCats[cat._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <h2 className="text-lg font-black uppercase tracking-wider">
                      {lang === 'ar' ? cat.titleAr : cat.titleEn}
                    </h2>
                  </div>
                  {admin?.role === 'Super Admin' && (
                    <div className="flex items-center gap-2" dir="ltr">
                      <button onClick={() => openCatModal(cat)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => deleteCategory(cat._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={16}/></button>
                      <button onClick={() => openServModal(cat._id)} className="ml-2 bg-[#2a2a2a] hover:bg-[#333] text-white p-1.5 rounded transition-colors flex items-center gap-1 text-xs px-3 font-bold uppercase">
                        <Plus size={14}/> {lang === 'ar' ? 'خدمة' : 'Service'}
                      </button>
                    </div>
                  )}
                </div>

                {expandedCats[cat._id] && (
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(!cat.services || cat.services.length === 0) ? (
                      <div className="col-span-full text-center py-8 text-[#555] text-sm font-bold uppercase tracking-wider">
                        {lang === 'ar' ? 'لا توجد خدمات في هذا القسم' : 'No services in this category'}
                      </div>
                    ) : (
                      cat.services.map((serv) => (
                        <div key={serv._id} className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4 flex flex-col group hover:border-[#555] transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-white text-base leading-tight">
                              {lang === 'ar' ? serv.nameAr : serv.nameEn}
                            </h3>
                            {admin?.role === 'Super Admin' && (
                              <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" dir="ltr">
                                <button onClick={() => openServModal(cat._id, serv)} className="p-1 text-blue-400 hover:text-blue-300"><Edit2 size={14}/></button>
                                <button onClick={() => deleteService(cat._id, serv._id)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs text-[#a3a3a3] line-clamp-2 mb-4 flex-grow">
                            {lang === 'ar' ? serv.descriptionAr : serv.descriptionEn}
                          </p>
                          
                          <div className="flex justify-between items-end pt-3 border-t border-[#222]">
                            <div>
                              <span className="block text-xs text-[#555] font-bold uppercase">{serv.durationMinutes} {lang === 'ar' ? 'دقيقة' : 'Mins'}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {serv.originalPrice && (
                                  <span className="text-xs text-[#555] line-through">{serv.originalPrice}</span>
                                )}
                                <span className="text-sm font-black text-[#d32f2f]">{serv.price} EGP</span>
                              </div>
                            </div>
                            <div className="flex -space-x-2 overflow-hidden" dir="ltr">
                              {Array.isArray(serv.images) && serv.images.filter(img => img && img.trim() !== '').length > 0 ? (
                                serv.images.filter(img => img && img.trim() !== '').slice(0, 3).map((img, idx) => (
                                  <img key={idx} src={img} alt="Service" className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0a0a0a] object-cover bg-[#222]" onError={(e) => { e.currentTarget.src = defaultServiceImg; }} />
                                ))
                              ) : (
                                <img src={defaultServiceImg} alt="Service" className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0a0a0a] object-cover bg-[#222]" />
                              )}
                              {Array.isArray(serv.images) && serv.images.filter(img => img && img.trim() !== '').length > 3 && (
                                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-[#0a0a0a] bg-[#222] text-[10px] font-bold text-white">
                                  +{serv.images.filter(img => img && img.trim() !== '').length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isCatModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-wider">{editingCatId ? 'Edit Category' : 'New Category'}</h3>
              <button disabled={isSaving} onClick={() => setIsCatModalOpen(false)} className="text-[#a3a3a3] hover:text-white"><X size={20}/></button>
            </div>
            <div className="space-y-4 relative">
              
              {isSaving && (
                <div className="absolute inset-0 bg-[#141414]/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-lg">
                  <Loader2 className="animate-spin text-[#d32f2f] mb-2" size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">Saving...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#555] uppercase mb-2">Title (English)</label>
                <input type="text" value={catForm.titleEn} onChange={e => setCatForm({...catForm, titleEn: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#d32f2f]" dir="ltr" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#555] uppercase mb-2">Title (Arabic)</label>
                <input type="text" value={catForm.titleAr} onChange={e => setCatForm({...catForm, titleAr: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#d32f2f]" dir="rtl" disabled={isSaving} />
              </div>
              <button disabled={isSaving} onClick={saveCategory} className="w-full bg-[#d32f2f] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-700 mt-4 disabled:opacity-50 transition-all">
                {isSaving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isServModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in-up relative">
            
            {isSaving && (
              <div className="absolute inset-0 bg-[#141414]/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-2xl">
                <Loader2 className="animate-spin text-[#d32f2f] mb-3" size={32} />
                <span className="text-sm font-bold uppercase tracking-widest text-white">Applying Changes...</span>
              </div>
            )}

            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#141414] z-10 pb-4 border-b border-[#2a2a2a]">
              <h3 className="text-xl font-black uppercase tracking-wider">{editingServId ? 'Edit Service' : 'New Service'}</h3>
              <button disabled={isSaving} onClick={() => setIsServModalOpen(false)} className="text-[#a3a3a3] hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left" dir="ltr">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Basic Info</h4>
                <div>
                  <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Name (English)</label>
                  <input type="text" value={servForm.nameEn} onChange={e => setServForm({...servForm, nameEn: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#555] uppercase mb-1 text-right">Name (Arabic)</label>
                  <input type="text" value={servForm.nameAr} onChange={e => setServForm({...servForm, nameAr: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm text-right" dir="rtl" disabled={isSaving} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Description (English)</label>
                  <textarea value={servForm.descriptionEn} onChange={e => setServForm({...servForm, descriptionEn: e.target.value})} rows="2" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm resize-none" disabled={isSaving}></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#555] uppercase mb-1 text-right">Description (Arabic)</label>
                  <textarea value={servForm.descriptionAr} onChange={e => setServForm({...servForm, descriptionAr: e.target.value})} rows="2" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm resize-none text-right" dir="rtl" disabled={isSaving}></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Details & Media</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Duration (Mins)</label>
                    <input type="number" value={servForm.durationMinutes} onChange={e => setServForm({...servForm, durationMinutes: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Price (EGP)</label>
                    <input type="number" value={servForm.price} onChange={e => setServForm({...servForm, price: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Original Price (Optional, for discounts)</label>
                    <input type="number" value={servForm.originalPrice} onChange={e => setServForm({...servForm, originalPrice: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-3">
                  <div className="flex justify-between items-center mb-3">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#a3a3a3] uppercase"><ImageIcon size={14}/> Image Gallery</label>
                    <button disabled={isSaving} onClick={addImageInput} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12}/> Add Image</button>
                  </div>
                  <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                    {servForm.images.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#141414] p-2 rounded-lg border border-[#333]">
                        <div className="h-10 w-10 shrink-0 rounded bg-[#222] overflow-hidden flex items-center justify-center border border-[#333]">
                          {uploadingIndex === idx ? (
                            <Loader2 size={14} className="text-[#d32f2f] animate-spin" />
                          ) : img ? (
                            <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon size={14} className="text-[#555]"/>
                          )}
                        </div>
                        
                        <input 
                          type="file" 
                          id={`serviceImage-${idx}`}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, idx)}
                          className="hidden" 
                          disabled={isSaving || uploadingIndex !== null}
                        />
                        <label 
                          htmlFor={`serviceImage-${idx}`}
                          className={`flex-1 flex items-center justify-center gap-2 border border-dashed border-[#333] rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
                            ${uploadingIndex === idx || isSaving ? 'bg-[#0a0a0a] text-[#555] cursor-not-allowed' : 'bg-[#0a0a0a] text-blue-400 hover:text-blue-300 hover:border-blue-400/50'}
                          `}
                        >
                          {uploadingIndex === idx ? 'Uploading...' : img ? 'Change Image' : 'Select File'}
                        </label>

                        <button disabled={isSaving} onClick={() => removeImageInput(idx)} className="p-2 text-[#555] hover:text-red-500 bg-[#0a0a0a] border border-[#333] rounded transition-colors disabled:opacity-50">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#2a2a2a] flex justify-end gap-3" dir="ltr">
              <button disabled={isSaving} onClick={() => setIsServModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-[#a3a3a3] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50">Cancel</button>
              <button disabled={isSaving} onClick={saveService} className="flex items-center gap-2 bg-[#d32f2f] text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50">
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16}/> Save Service</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesServices;