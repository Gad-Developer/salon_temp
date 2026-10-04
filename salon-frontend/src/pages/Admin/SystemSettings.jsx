import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../utils/LanguageContext';
import { useAdminAuth } from '../../context/AdminContext';
import { Shield, Users, UserPlus, Mail, Key, Trash2, Edit2, Loader2, Check, X } from 'lucide-react';
import axios from 'axios';

const SystemSettings = () => {
  const { lang } = useLanguage();
  const { token, admin: currentAdmin } = useAdminAuth();
  
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Normal Admin' });
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/auth/admins`);
      setAdmins(res.data.data.admins);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/auth/create`, formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Normal Admin' });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/auth/admins/${editData._id}`, 
        { role: editData.role, isActive: editData.isActive }
      );
      setIsEditModalOpen(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المشرف؟' : 'Are you sure you want to delete this admin?')) return;
    
    try {
      await axios.delete(`/api/auth/admins/${id}`);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin');
      alert(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  const openEditModal = (admin) => {
    setEditData({ ...admin });
    setIsEditModalOpen(true);
  };

  if (currentAdmin?.role !== 'Super Admin') {
    return (
      <div className="flex items-center justify-center h-64 text-[#a3a3a3]">
        <Shield size={48} className="mb-4 mx-auto text-[#d32f2f] opacity-50" />
        <p className="text-center font-bold">
          {lang === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة' : 'You do not have permission to view this page.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-wider">
            <Shield className="text-[#d32f2f]" size={28} />
            {lang === 'ar' ? 'إدارة النظام' : 'System Settings'}
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            {lang === 'ar' ? 'إدارة المشرفين والصلاحيات' : 'Manage administrators and access controls'}
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#d32f2f] text-white rounded-md font-bold text-sm hover:bg-[#b72828] transition-colors shadow-[0_0_15px_rgba(211,47,47,0.3)]"
        >
          <UserPlus size={16} />
          {lang === 'ar' ? 'إضافة مشرف' : 'Add Admin'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#d32f2f]/10 border border-[#d32f2f]/30 rounded-lg text-[#d32f2f] text-sm font-bold">
          {error}
        </div>
      )}

      {/* Admins List */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-[#d32f2f]" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#0a0a0a]">
                  <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-wider">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-wider">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-wider">{lang === 'ar' ? 'الصلاحية' : 'Role'}</th>
                  <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-wider">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-4 text-xs font-black text-[#a3a3a3] uppercase tracking-wider text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#d32f2f] font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-white text-sm">{admin.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#a3a3a3]">{admin.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                        admin.role === 'Super Admin' 
                          ? 'bg-[#d32f2f]/20 text-[#d32f2f] border border-[#d32f2f]/30' 
                          : 'bg-[#2a2a2a] text-[#a3a3a3]'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold ${admin.isActive ? 'text-green-500' : 'text-[#a3a3a3]'}`}>
                        {admin.isActive ? <Check size={14} /> : <X size={14} />}
                        {admin.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 text-[#a3a3a3] hover:text-white hover:bg-[#2a2a2a] rounded transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        {currentAdmin._id !== admin._id && (
                          <button 
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className="p-1.5 text-[#a3a3a3] hover:text-[#d32f2f] hover:bg-[#d32f2f]/10 rounded transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-[#2a2a2a] flex justify-between items-center bg-[#0a0a0a]">
              <h3 className="text-lg font-black text-white">{lang === 'ar' ? 'إضافة مشرف جديد' : 'Add New Admin'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#a3a3a3] hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddAdmin} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-1.5">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
                <div className="relative">
                  <Users className="absolute top-1/2 -translate-y-1/2 left-3 text-[#555]" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm rounded-md pl-10 pr-4 py-2.5 focus:border-[#d32f2f] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-1.5">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 left-3 text-[#555]" size={16} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm rounded-md pl-10 pr-4 py-2.5 focus:border-[#d32f2f] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-1.5">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <Key className="absolute top-1/2 -translate-y-1/2 left-3 text-[#555]" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm rounded-md pl-10 pr-4 py-2.5 focus:border-[#d32f2f] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-1.5">{lang === 'ar' ? 'الصلاحية' : 'Role'}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm rounded-md px-4 py-2.5 focus:border-[#d32f2f] focus:outline-none transition-colors appearance-none"
                >
                  <option value="Normal Admin">Normal Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[#a3a3a3] hover:text-white transition-colors">
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 bg-[#d32f2f] text-white rounded-md text-sm font-bold hover:bg-[#b72828] transition-colors">
                  {lang === 'ar' ? 'إنشاء' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-[#2a2a2a] flex justify-between items-center bg-[#0a0a0a]">
              <h3 className="text-lg font-black text-white">{lang === 'ar' ? 'تعديل الصلاحيات' : 'Edit Admin Roles'}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#a3a3a3] hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditAdmin} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-1.5">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
                <input type="text" value={editData.name} disabled className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#555] text-sm rounded-md px-4 py-2.5 opacity-50 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-1.5">{lang === 'ar' ? 'الصلاحية' : 'Role'}</label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({...editData, role: e.target.value})}
                  disabled={editData._id === currentAdmin._id} // cannot change own role easily
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm rounded-md px-4 py-2.5 focus:border-[#d32f2f] focus:outline-none transition-colors appearance-none disabled:opacity-50"
                >
                  <option value="Normal Admin">Normal Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-4 p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-md">
                <input 
                  type="checkbox" 
                  id="isActiveToggle"
                  checked={editData.isActive} 
                  onChange={(e) => setEditData({...editData, isActive: e.target.checked})}
                  disabled={editData._id === currentAdmin._id}
                  className="w-4 h-4 accent-[#d32f2f] bg-[#0a0a0a] border-[#2a2a2a]"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-bold text-white cursor-pointer select-none">
                  {lang === 'ar' ? 'الحساب نشط' : 'Account is Active'}
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[#a3a3a3] hover:text-white transition-colors">
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 bg-[#d32f2f] text-white rounded-md text-sm font-bold hover:bg-[#b72828] transition-colors">
                  {lang === 'ar' ? 'حفظ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
