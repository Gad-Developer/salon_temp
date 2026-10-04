import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { Plus, Edit2, Trash2, X, Save, Loader2, User, MapPin } from 'lucide-react';

const Professionals = () => {
  const { lang } = useLanguage();
  
  const [professionals, setProfessionals] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfId, setEditingProfId] = useState(null);

  const [form, setForm] = useState({
    nameEn: '', nameAr: '',
    roleEn: '', roleAr: '',
    avatar: '',
    isActive: true,
    assignedBranches: []
  });

  const isFormValid = 
    form.nameEn.trim() !== '' && 
    form.nameAr.trim() !== '' && 
    form.roleEn.trim() !== '' && 
    form.roleAr.trim() !== '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both professionals and branches simultaneously
      const [profRes, branchRes] = await Promise.all([
        axios.get('/api/professionals?all=true').catch(() => ({ data: [] })),
        axios.get('/api/branches?all=true').catch(() => ({ data: [] }))
      ]);
      setProfessionals(profRes.data);
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
      setForm({ ...form, avatar: res.data.url });
    } catch (error) {
      alert(lang === 'ar' ? 'فشل رفع الصورة.' : 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (prof = null) => {
    if (prof) {
      setEditingProfId(prof._id);
      setForm({
        nameEn: prof.nameEn || '', nameAr: prof.nameAr || '',
        roleEn: prof.roleEn || '', roleAr: prof.roleAr || '',
        avatar: prof.avatar || '',
        isActive: prof.isActive !== false,
        assignedBranches: prof.assignedBranches || []
      });
    } else {
      setEditingProfId(null);
      setForm({
        nameEn: '', nameAr: '', roleEn: '', roleAr: '',
        avatar: '', isActive: true, assignedBranches: []
      });
    }
    setIsModalOpen(true);
  };

  const handleBranchToggle = (branchId) => {
    const isSelected = form.assignedBranches.includes(branchId);
    if (isSelected) {
      setForm({ ...form, assignedBranches: form.assignedBranches.filter(id => id !== branchId) });
    } else {
      setForm({ ...form, assignedBranches: [...form.assignedBranches, branchId] });
    }
  };

  const saveProfessional = async () => {
    if (!isFormValid) {
      alert(lang === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية.' : 'Please fill all mandatory fields.');
      return;
    }

    const isConfirmed = window.confirm(lang === 'ar' ? 'هل أنت متأكد من حفظ هذه التعديلات؟' : 'Are you sure you want to save these changes?');
    if (!isConfirmed) return;

    setIsSaving(true);

    try {
      if (editingProfId) {
        await axios.put(`/api/professionals/${editingProfId}`, form);
      } else {
        await axios.post('/api/professionals', form);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save professional");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProfessional = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الموظف؟' : 'Delete this professional?')) return;
    try {
      await axios.delete(`/api/professionals/${id}`);
      fetchData();
    } catch (error) {
      alert("Failed to delete professional");
    }
  };

  return (
    <>
      <div className="text-white animate-fade-in-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">
              {lang === 'ar' ? 'فريق العمل' : 'Professionals'}
            </h1>
            <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-[#d32f2f] hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <Plus size={16} /> {lang === 'ar' ? 'إضافة موظف' : 'Add Professional'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#a3a3a3] animate-pulse">Loading staff...</div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555]">
            {lang === 'ar' ? 'لا يوجد فريق عمل حالياً.' : 'No professionals found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {professionals.map((prof) => (
              <div key={prof._id} className={`bg-[#141414] border ${prof.isActive ? 'border-[#2a2a2a]' : 'border-red-900/50 opacity-75'} rounded-xl overflow-hidden flex flex-col group hover:border-[#555] transition-colors relative`}>
                
                <div className="h-64 bg-[#0a0a0a] relative overflow-hidden border-b border-[#2a2a2a] flex items-center justify-center">
                  {!prof.isActive && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest z-10">Inactive</div>
                  )}
                  {prof.avatar ? (
                    <img src={prof.avatar} alt={prof.nameEn} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <User size={48} className="text-[#333]" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity z-20" dir="ltr">
                    <button onClick={() => openModal(prof)} className="p-2 bg-[#141414]/90 backdrop-blur text-blue-400 hover:text-blue-300 rounded border border-[#333]"><Edit2 size={14}/></button>
                    <button onClick={() => deleteProfessional(prof._id)} className="p-2 bg-[#141414]/90 backdrop-blur text-red-500 hover:text-red-400 rounded border border-[#333]"><Trash2 size={14}/></button>
                  </div>
                </div>

                <div className="p-4 text-center">
                  <h3 className="font-black text-lg text-white tracking-wide uppercase mb-1">
                    {lang === 'ar' ? prof.nameAr : prof.nameEn}
                  </h3>
                  <p className="text-xs font-bold text-[#d32f2f] uppercase tracking-widest mb-3">
                    {lang === 'ar' ? prof.roleAr : prof.roleEn}
                  </p>
                  
                  {/* Branch Badges */}
                  <div className="flex flex-wrap justify-center gap-1.5 pt-3 border-t border-[#222]">
                    {prof.assignedBranches && prof.assignedBranches.length > 0 ? (
                      prof.assignedBranches.map(branchId => {
                        const branchData = branches.find(b => b._id === branchId);
                        if (!branchData) return null;
                        return (
                          <span key={branchId} className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] text-[#a3a3a3] text-[9px] px-2 py-1 rounded-full uppercase tracking-wider">
                            <MapPin size={10} className="text-[#d32f2f]" />
                            {lang === 'ar' ? branchData.nameAr : branchData.nameEn}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-[#555] italic">No Branches Assigned</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                <h3 className="text-xl font-black uppercase tracking-wider">{editingProfId ? 'Edit Professional' : 'New Professional'}</h3>
                <label className="flex items-center gap-2 text-xs font-bold text-[#a3a3a3] cursor-pointer bg-[#0a0a0a] px-3 py-1.5 rounded border border-[#333]">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="accent-[#d32f2f]" disabled={isSaving} />
                  Active Profile
                </label>
              </div>
              <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" dir="ltr">
              
              {/* Left/Middle Column (Basic Info) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Identity</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Name (English) <span className="text-red-500">*</span></label>
                      <input type="text" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1 text-right">Name (Arabic) <span className="text-red-500">*</span></label>
                      <input type="text" value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm text-right" dir="rtl" disabled={isSaving} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Role Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1">Role (English) <span className="text-red-500">*</span></label>
                      <input type="text" value={form.roleEn} onChange={e => setForm({...form, roleEn: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm" disabled={isSaving} placeholder="e.g. Master Barber" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#555] uppercase mb-1 text-right">Role (Arabic) <span className="text-red-500">*</span></label>
                      <input type="text" value={form.roleAr} onChange={e => setForm({...form, roleAr: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#d32f2f] text-sm text-right" dir="rtl" disabled={isSaving} placeholder="مثال: حلاق رئيسي" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Branch Assignments</h4>
                  
                  <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
                    {branches.length === 0 ? (
                      <p className="text-xs text-[#555] text-center">No branches available.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {branches.map(branch => (
                          <label key={branch._id} className="flex items-center gap-3 bg-[#141414] p-3 rounded-lg border border-[#333] cursor-pointer hover:border-[#555] transition-colors">
                            <input 
                              type="checkbox" 
                              checked={form.assignedBranches.includes(branch._id)}
                              onChange={() => handleBranchToggle(branch._id)}
                              className="accent-[#d32f2f] w-4 h-4"
                              disabled={isSaving}
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">{lang === 'ar' ? branch.nameAr : branch.nameEn}</span>
                              {!branch.isActive && <span className="text-[9px] text-red-500 uppercase tracking-widest">Inactive</span>}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (Avatar) */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest border-b border-[#333] pb-2">Profile Picture</h4>
                  
                  <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4 flex flex-col items-center gap-4">
                    <div className="h-40 w-40 shrink-0 rounded-full bg-[#141414] overflow-hidden flex items-center justify-center border-2 border-[#333] shadow-inner">
                      {isUploading ? (
                        <Loader2 size={32} className="text-[#d32f2f] animate-spin" />
                      ) : form.avatar ? (
                        <img src={form.avatar} alt="Avatar Preview" className="h-full w-full object-cover" />
                      ) : (
                        <User size={48} className="text-[#555]"/>
                      )}
                    </div>
                    
                    <div className="w-full">
                      <input 
                        type="file" 
                        id="avatarUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden" 
                        disabled={isSaving || isUploading}
                      />
                      <label 
                        htmlFor="avatarUpload"
                        className={`w-full flex items-center justify-center gap-2 border border-dashed border-[#333] rounded px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
                          ${isUploading || isSaving ? 'bg-[#141414] text-[#555] cursor-not-allowed' : 'bg-[#141414] text-blue-400 hover:text-blue-300 hover:border-blue-400/50'}
                        `}
                      >
                        {isUploading ? 'Uploading...' : form.avatar ? 'Change Picture' : 'Select Picture'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-4 border-t border-[#2a2a2a] flex justify-end gap-3" dir="ltr">
              <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-[#a3a3a3] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50">Cancel</button>
              <button 
                disabled={isSaving || !isFormValid} 
                onClick={saveProfessional} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                  ${!isFormValid ? 'bg-[#2a2a2a] text-[#555] cursor-not-allowed' : 'bg-[#d32f2f] text-white hover:bg-red-700 disabled:opacity-50'}
                `}
              >
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16}/> Save Profile</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Professionals;