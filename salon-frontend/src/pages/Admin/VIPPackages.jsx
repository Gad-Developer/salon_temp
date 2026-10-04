import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { useAdminAuth } from '../../context/AdminContext';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Loader2, Package as PackageIcon, CheckCircle2 } from 'lucide-react';

const VIPPackages = () => {
  const { lang } = useLanguage();
  const { admin } = useAdminAuth();
  
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);

  const [uploadingRef, setUploadingRef] = useState(null); // Tracks "groupIndex-urlIndex"

  const [form, setForm] = useState({
    nameEn: '', nameAr: '',
    price: '', oldPrice: '', durationMinutes: '',
    itemsEn: [''], itemsAr: [''],
    images: [['']], 
    isActive: true
  });

  // Calculate if the mandatory fields are filled
  const isFormValid = 
    form.nameEn.trim() !== '' && 
    form.nameAr.trim() !== '' && 
    String(form.price).trim() !== '' && 
    String(form.durationMinutes).trim() !== '';

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleImageUpload = async (e, groupIndex, urlIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingRef(`${groupIndex}-${urlIndex}`);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newImages = [...form.images];
      newImages[groupIndex][urlIndex] = res.data.url;
      setForm({ ...form, images: newImages });
    } catch (error) {
      alert(lang === 'ar' ? 'فشل رفع الصورة.' : 'Failed to upload image.');
    } finally {
      setUploadingRef(null);
    }
  };

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/packages').catch(() => ({ data: [] }));
      setPackages(res.data);
    } catch (error) {
      console.error("Failed to fetch packages");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPkgId(pkg._id);
      setForm({
        nameEn: pkg.nameEn || '', nameAr: pkg.nameAr || '',
        price: pkg.price || '', oldPrice: pkg.oldPrice || '', durationMinutes: pkg.durationMinutes || '',
        itemsEn: Array.isArray(pkg.itemsEn) && pkg.itemsEn.length ? pkg.itemsEn : [''],
        itemsAr: Array.isArray(pkg.itemsAr) && pkg.itemsAr.length ? pkg.itemsAr : [''],
        images: Array.isArray(pkg.images) && pkg.images.length ? pkg.images : [['']],
        isActive: pkg.isActive !== false
      });
    } else {
      setEditingPkgId(null);
      setForm({
        nameEn: '', nameAr: '', price: '', oldPrice: '', durationMinutes: '',
        itemsEn: [''], itemsAr: [''], images: [['']], isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const savePackage = async () => {
    // Extra safety block in case the button bypass is attempted
    if (!isFormValid) {
      alert(lang === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية.' : 'Please fill all mandatory fields.');
      return;
    }

    const isConfirmed = window.confirm(lang === 'ar' ? 'هل أنت متأكد من حفظ هذه التعديلات؟' : 'Are you sure you want to save these changes?');
    if (!isConfirmed) return;

    setIsSaving(true);
    
    // Clean up empty strings and empty arrays before sending
    const payload = { 
      ...form, 
      itemsEn: form.itemsEn.filter(i => i.trim() !== ''),
      itemsAr: form.itemsAr.filter(i => i.trim() !== ''),
      images: form.images
        .map(group => group.filter(url => url.trim() !== ''))
        .filter(group => group.length > 0)
    };

    try {
      if (editingPkgId) {
        await axios.put(`/api/packages/${editingPkgId}`, payload);
      } else {
        await axios.post('/api/packages', payload);
      }
      setIsModalOpen(false);
      await fetchPackages();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save package");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePackage = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الباقة؟' : 'Delete this VIP package?')) return;
    try {
      await axios.delete(`/api/packages/${id}`);
      fetchPackages();
    } catch (error) {
      alert("Failed to delete package");
    }
  };

  // --- Dynamic Form Handlers: Items ---
  const handleItemChange = (langKey, index, value) => {
    const newItems = [...form[langKey]];
    newItems[index] = value;
    setForm({ ...form, [langKey]: newItems });
  };
  const addItem = (langKey) => setForm({ ...form, [langKey]: [...form[langKey], ''] });
  const removeItem = (langKey, index) => {
    const newItems = form[langKey].filter((_, i) => i !== index);
    setForm({ ...form, [langKey]: newItems.length ? newItems : [''] });
  };

  // --- Dynamic Form Handlers: 2D Images ---
  const handleImageUrlChange = (groupIndex, urlIndex, value) => {
    const newImages = [...form.images];
    newImages[groupIndex][urlIndex] = value;
    setForm({ ...form, images: newImages });
  };
  const addImageGroup = () => setForm({ ...form, images: [...form.images, ['']] });
  const removeImageGroup = (groupIndex) => {
    const newImages = form.images.filter((_, i) => i !== groupIndex);
    setForm({ ...form, images: newImages.length ? newImages : [['']] });
  };
  const addUrlToGroup = (groupIndex) => {
    const newImages = [...form.images];
    newImages[groupIndex].push('');
    setForm({ ...form, images: newImages });
  };
  const removeUrlFromGroup = (groupIndex, urlIndex) => {
    const newImages = [...form.images];
    newImages[groupIndex] = newImages[groupIndex].filter((_, i) => i !== urlIndex);
    if(newImages[groupIndex].length === 0) newImages[groupIndex] = ['']; 
    setForm({ ...form, images: newImages });
  };

  return (
    <>
      <div className="text-white animate-fade-in-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">
              {lang === 'ar' ? 'باقات VIP' : 'VIP Packages'}
            </h1>
            <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
          </div>
          {admin?.role === 'Super Admin' && (
            <button 
              onClick={() => openModal()}
              className="bg-[#d32f2f] hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Plus size={16} /> {lang === 'ar' ? 'إضافة باقة' : 'Add Package'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#a3a3a3] animate-pulse">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555]">
            {lang === 'ar' ? 'لا توجد باقات حالياً.' : 'No packages found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const coverImage = pkg.images?.[0]?.[0];
              const itemsList = lang === 'ar' ? pkg.itemsAr : pkg.itemsEn;

              return (
                <div key={pkg._id} className={`bg-[#141414] border ${pkg.isActive ? 'border-[#2a2a2a]' : 'border-red-900/50 opacity-75'} rounded-xl overflow-hidden flex flex-col group hover:border-[#555] transition-colors relative`}>
                  
                  <div className="h-48 bg-[#0a0a0a] relative overflow-hidden border-b border-[#2a2a2a]">
                    {!pkg.isActive && (
                      <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest">Inactive</span>
                      </div>
                    )}
                    {coverImage ? (
                      <img src={coverImage} alt="Package cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#333]">
                        <PackageIcon size={48} />
                      </div>
                    )}
                    {admin?.role === 'Super Admin' && (
                      <div className="absolute top-3 right-3 flex gap-2 z-20 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" dir="ltr">
                        <button onClick={() => openModal(pkg)} className="p-2 bg-[#141414]/90 backdrop-blur text-blue-400 hover:text-blue-300 rounded border border-[#333]"><Edit2 size={16}/></button>
                        <button onClick={() => deletePackage(pkg._id)} className="p-2 bg-[#141414]/90 backdrop-blur text-red-500 hover:text-red-400 rounded border border-[#333]"><Trash2 size={16}/></button>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-black text-xl text-white mb-3 tracking-wide uppercase">
                      {lang === 'ar' ? pkg.nameAr : pkg.nameEn}
                    </h3>
                    
                    <ul className="space-y-1.5 mb-6 flex-grow">
                      {itemsList?.slice(0, 4).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#a3a3a3]">
                          <CheckCircle2 size={14} className="text-[#d32f2f] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {itemsList?.length > 4 && (
                        <li className="text-xs text-[#555] italic ml-5">+{itemsList.length - 4} more items...</li>
                      )}
                    </ul>
                    
                    <div className="flex justify-between items-end pt-4 border-t border-[#2a2a2a]">
                      <div>
                        <span className="block text-xs text-[#555] font-bold uppercase">{pkg.durationMinutes} {lang === 'ar' ? 'دقيقة' : 'Mins'}</span>
                        <div className="flex items-center gap-2 mt-1">
                           {pkg.oldPrice && <span className="text-xs text-[#555] line-through">{pkg.oldPrice}</span>}
                           <span className="text-xl font-black text-[#d32f2f]">{pkg.price} EGP</span>
                        </div>
                      </div>
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
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in-up relative">
            
            {isSaving && (
              <div className="absolute inset-0 bg-[#141414]/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-2xl">
                <Loader2 className="animate-spin text-[#d32f2f] mb-3" size={32} />
                <span className="text-sm font-bold uppercase tracking-widest text-white">Applying Changes...</span>
              </div>
            )}

            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#141414] z-10 pb-4 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black uppercase tracking-wider">{editingPkgId ? 'Edit Package' : 'New Package'}</h3>
                <label className="flex items-center gap-2 text-xs font-bold text-[#a3a3a3] cursor-pointer bg-[#0a0a0a] px-3 py-1.5 rounded border border-[#333]">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="accent-[#d32f2f]" disabled={isSaving} />
                  Active Package
                </label>
              </div>
              <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left" dir="ltr">
              {/* Left Column */}
              <div className="space-y-6">
                
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Basic Info</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Name (English) <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase mb-1 text-right">Name (Arabic) <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm text-right" dir="rtl" disabled={isSaving} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Mins <span className="text-red-500">*</span></label>
                      <input type="number" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Price (EGP) <span className="text-red-500">*</span></label>
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Old Price</label>
                      <input type="number" value={form.oldPrice} onChange={e => setForm({...form, oldPrice: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#a3a3a3] uppercase"><ImageIcon size={14}/> 2D Image Gallery (Srcset Groups)</label>
                    <button disabled={isSaving} onClick={addImageGroup} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12}/> Add Group</button>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {form.images.map((group, gIdx) => (
                      <div key={gIdx} className="bg-[#141414] p-3 rounded-lg border border-[#333]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider">Image Group {gIdx + 1}</span>
                          <div className="flex gap-2">
                            <button disabled={isSaving} onClick={() => addUrlToGroup(gIdx)} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center"><Plus size={10}/> Add Res</button>
                            <button disabled={isSaving} onClick={() => removeImageGroup(gIdx)} className="text-[10px] text-red-500 hover:text-red-400 font-bold"><Trash2 size={12}/></button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {group.map((url, uIdx) => (
                            <div key={uIdx} className="flex gap-2 items-center">
                              {uIdx === 0 && (
                                <div className="h-10 w-10 shrink-0 rounded bg-[#222] overflow-hidden flex items-center justify-center border border-[#333]">
                                  {uploadingRef === `${gIdx}-${uIdx}` ? (
                                    <Loader2 size={14} className="text-[#d32f2f] animate-spin" />
                                  ) : url ? (
                                    <img src={url} alt="preview" className="h-full w-full object-cover" />
                                  ) : (
                                    <ImageIcon size={12} className="text-[#555]"/>
                                  )}
                                </div>
                              )}
                              
                              <input 
                                type="file" 
                                id={`pkgImage-${gIdx}-${uIdx}`}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, gIdx, uIdx)}
                                className="hidden" 
                                disabled={isSaving || uploadingRef !== null}
                              />
                              <label 
                                htmlFor={`pkgImage-${gIdx}-${uIdx}`}
                                className={`flex-1 flex items-center justify-center gap-2 border border-dashed border-[#333] rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer
                                  ${uploadingRef === `${gIdx}-${uIdx}` || isSaving ? 'bg-[#0a0a0a] text-[#555] cursor-not-allowed' : 'bg-[#0a0a0a] text-blue-400 hover:text-blue-300 hover:border-blue-400/50'}
                                `}
                              >
                                {uploadingRef === `${gIdx}-${uIdx}` ? 'Uploading...' : url ? 'Change Image' : 'Select File'}
                              </label>

                              <button disabled={isSaving} onClick={() => removeUrlFromGroup(gIdx, uIdx)} className="p-1.5 text-[#555] hover:text-red-500"><X size={14}/></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Package Contents (Items)</h4>
                
                <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold text-[#a3a3a3] uppercase">Items (English)</label>
                    <button disabled={isSaving} onClick={() => addItem('itemsEn')} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={10}/> Add Item</button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                    {form.itemsEn.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" value={item} onChange={(e) => handleItemChange('itemsEn', idx, e.target.value)} className="flex-1 bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#d32f2f]" placeholder="e.g. Premium Haircut" disabled={isSaving} />
                        <button disabled={isSaving} onClick={() => removeItem('itemsEn', idx)} className="p-1.5 text-[#555] hover:text-red-500"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold text-[#a3a3a3] uppercase text-right w-full">Items (Arabic)</label>
                    <button disabled={isSaving} onClick={() => addItem('itemsAr')} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0"><Plus size={10}/> Add Item</button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                    {form.itemsAr.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" value={item} onChange={(e) => handleItemChange('itemsAr', idx, e.target.value)} className="flex-1 bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#d32f2f] text-right" dir="rtl" placeholder="مثال: قص شعر" disabled={isSaving} />
                        <button disabled={isSaving} onClick={() => removeItem('itemsAr', idx)} className="p-1.5 text-[#555] hover:text-red-500"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#2a2a2a] flex justify-end gap-3" dir="ltr">
              <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-[#a3a3a3] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50">Cancel</button>
              <button 
                disabled={isSaving || !isFormValid} 
                onClick={savePackage} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                  ${!isFormValid ? 'bg-[#2a2a2a] text-[#555] cursor-not-allowed' : 'bg-[#d32f2f] text-white hover:bg-red-700 disabled:opacity-50'}
                `}
              >
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16}/> Save Package</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VIPPackages;