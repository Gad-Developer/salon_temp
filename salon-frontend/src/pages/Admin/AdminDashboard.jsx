import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { Link } from 'react-router-dom';
import { ShieldAlert, CalendarDays, Package, Phone, User, Clock, CheckCircle2, XCircle, Trash2, Edit2, Save, X, MapPin } from 'lucide-react';

const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '112233';

  const [activeTab, setActiveTab] = useState('appointments'); 
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for inline editing
  const [editingApptId, setEditingApptId] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', time: '' });
  const [orderEditForm, setOrderEditForm] = useState({ date: '', time: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setAuthError('Invalid Admin PIN.');
      setPin('');
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [apptsRes, ordersRes] = await Promise.all([
        axios.get('/api/appointments').catch(() => ({ data: [] })),
        axios.get('/api/orders').catch(() => ({ data: [] }))
      ]);
      setAppointments(apptsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (type, id, newStatus) => {
    try {
      await axios.patch(`/api/${type}/${id}/status`, { status: newStatus });
      if (type === 'appointments') {
        setAppointments(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
      } else {
        setOrders(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
      }
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (type, id) => {
    const isConfirmed = window.confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this?');
    if (!isConfirmed) return;

    try {
      await axios.delete(`/api/${type}/${id}`);
      if (type === 'appointments') {
        setAppointments(prev => prev.filter(item => item._id !== id));
      } else {
        setOrders(prev => prev.filter(item => item._id !== id));
      }
    } catch (error) {
      alert(lang === 'ar' ? 'فشل الحذف.' : 'Failed to delete.');
    }
  };

  const startEditingAppt = (appt) => {
    setEditingApptId(appt._id);
    setEditForm({ date: appt.date, time: appt.time });
  };

  const startEditingOrder = (order) => {
    setEditingOrderId(order._id);
    setOrderEditForm({ date: order.date, time: order.time });
  };

  const saveApptEdit = async (id) => {
    try {
      await axios.patch(`/api/appointments/${id}`, editForm);
      setAppointments(prev => prev.map(item => item._id === id ? { ...item, ...editForm } : item));
      setEditingApptId(null);
    } catch (error) {
      alert(lang === 'ar' ? 'فشل التحديث.' : 'Failed to update.');
    }
  };

  const saveOrderEdit = async (id) => {
    try {
      await axios.patch(`/api/orders/${id}`, orderEditForm);
      setOrders(prev => prev.map(item => item._id === id ? { ...item, ...orderEditForm } : item));
      setEditingOrderId(null);
    } catch (error) {
      alert(lang === 'ar' ? 'فشل التحديث.' : 'Failed to update.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'Confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  // Helper to calculate dynamic summary stats based on current tab
  const getStats = (dataArray) => {
    return {
      pending: dataArray.filter(i => i.status === 'Pending').length,
      confirmed: dataArray.filter(i => i.status === 'Confirmed').length,
      completed: dataArray.filter(i => i.status === 'Completed').length,
      cancelled: dataArray.filter(i => i.status === 'Cancelled').length,
    };
  };

  const activeStats = activeTab === 'appointments' ? getStats(appointments) : getStats(orders);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 font-sans text-white">
        <div className="max-w-md w-full bg-[#141414] p-8 rounded-2xl border border-[#2a2a2a] shadow-2xl relative">
          <div className="text-center mb-8">
            <ShieldAlert size={40} className="mx-auto text-[#d32f2f] mb-4" />
            <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Admin <span className="text-[#d32f2f]">Access</span></h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {authError && <div className="bg-[#d32f2f]/10 border border-[#d32f2f]/50 text-[#d32f2f] p-3 rounded-lg text-sm text-center">{authError}</div>}
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter Admin PIN" className="w-full bg-[#0a0a0a] border border-[#333] text-white px-4 py-3.5 rounded-lg focus:outline-none focus:border-[#d32f2f] text-center tracking-[0.5em] font-mono text-lg" required />
            <button className="w-full bg-[#d32f2f] text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-all">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-6 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest mb-2">{t('admin_dashboard')}</h1>
            <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
          </div>
          <div className="flex bg-[#141414] p-1.5 rounded-lg border border-[#2a2a2a] w-full md:w-auto">
            <button onClick={() => setActiveTab('appointments')} className={`flex-1 md:w-40 py-2.5 flex items-center justify-center gap-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${activeTab === 'appointments' ? 'bg-[#d32f2f] text-white shadow-lg' : 'text-[#a3a3a3] hover:text-white'}`}><CalendarDays size={16} /> {t('tab_appointments')}</button>
            <button onClick={() => setActiveTab('orders')} className={`flex-1 md:w-40 py-2.5 flex items-center justify-center gap-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-[#d32f2f] text-white shadow-lg' : 'text-[#a3a3a3] hover:text-white'}`}><Package size={16} /> {t('tab_orders')}</button>
          </div>
        </div>

        {/* Dynamic Summary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141414] border border-yellow-500/30 rounded-lg p-4 text-center">
             <span className="block text-2xl font-black text-yellow-500">{activeStats.pending}</span>
             <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider font-bold">Pending</span>
          </div>
          <div className="bg-[#141414] border border-blue-500/30 rounded-lg p-4 text-center">
             <span className="block text-2xl font-black text-blue-500">{activeStats.confirmed}</span>
             <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider font-bold">Confirmed</span>
          </div>
          <div className="bg-[#141414] border border-green-500/30 rounded-lg p-4 text-center">
             <span className="block text-2xl font-black text-green-500">{activeStats.completed}</span>
             <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider font-bold">Completed</span>
          </div>
          <div className="bg-[#141414] border border-red-500/30 rounded-lg p-4 text-center">
             <span className="block text-2xl font-black text-red-500">{activeStats.cancelled}</span>
             <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider font-bold">Cancelled</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#a3a3a3] animate-pulse">Loading data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            
            {/* APPOINTMENTS VIEW */}
            {activeTab === 'appointments' && (
              appointments.length > 0 ? appointments.map((appt) => {
                const groupedServices = (appt.services || []).reduce((acc, curr) => {
                  const key = curr.categoryTitleEn || 'Standard Services';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(curr);
                  return acc;
                }, {});

                // STRICT BUTTON LOGIC
                const isConfirmedDisabled = appt.status === 'Confirmed' || appt.status === 'Completed' || appt.status === 'Cancelled';
                const isCompletedDisabled = appt.status === 'Completed' || appt.status === 'Cancelled';
                const isCancelledDisabled = appt.status === 'Cancelled';

                return (
                  <div key={appt._id} className="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4 border-b border-[#2a2a2a] pb-4">
                      <div>
                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(appt.status || 'Pending')}`}>
                          {t(`status_${(appt.status || 'Pending').toLowerCase()}`)}
                        </span>
                        
                        {editingApptId === appt._id ? (
                          <div className="flex gap-2 mt-3" dir="ltr">
                            <input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-sm text-white outline-none focus:border-[#d32f2f]" />
                            <input type="time" value={editForm.time} onChange={(e) => setEditForm({...editForm, time: e.target.value})} className="bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-sm text-white outline-none focus:border-[#d32f2f]" />
                            <button onClick={() => saveApptEdit(appt._id)} className="text-green-500 p-1"><Save size={16}/></button>
                            <button onClick={() => setEditingApptId(null)} className="text-[#a3a3a3] p-1"><X size={16}/></button>
                          </div>
                        ) : (
                          <h3 className="text-xl font-bold text-white mt-3">{appt.date} <span className="text-[#d32f2f]">{appt.time}</span></h3>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="block text-xl font-black text-[#d32f2f]">{appt.totalPrice} <span className="text-xs">EGP</span></span>
                        
                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" dir="ltr">
                          {editingApptId !== appt._id && (
                            <button onClick={() => startEditingAppt(appt)} className="p-1.5 bg-[#1a1a1a] text-blue-400 hover:text-blue-300 rounded border border-[#333] transition-colors"><Edit2 size={14}/></button>
                          )}
                          <button onClick={() => handleDelete('appointments', appt._id)} className="p-1.5 bg-[#1a1a1a] text-red-500 hover:text-red-400 rounded border border-[#333] transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-[#d4d4d4]"><User size={16} className="text-[#a3a3a3]" /><span className="font-bold">{appt.clientName}</span></div>
                      <div className="flex items-center gap-3 text-sm text-[#d4d4d4]" dir="ltr"><Phone size={16} className="text-[#a3a3a3]" /><span>{appt.clientPhone}</span></div>
                      <div className="flex items-center gap-3 text-sm text-[#d4d4d4]"><Clock size={16} className="text-[#a3a3a3]" />
                        <span>{lang === 'ar' ? 'الحلاق:' : 'Professional:'} <span className="font-bold text-white">
                          {appt.professionalId ? (lang === 'ar' ? appt.professionalId.nameAr : appt.professionalId.nameEn) : (lang === 'ar' ? 'أي متاح' : 'Any')}
                        </span></span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#d4d4d4]"><MapPin size={16} className="text-[#a3a3a3]" />
                        <span>{lang === 'ar' ? 'الفرع:' : 'Branch:'} <span className="font-bold text-[#d32f2f]">
                          {appt.branchId ? (lang === 'ar' ? appt.branchId.nameAr : appt.branchId.nameEn) : '---'}
                        </span></span>
                      </div>
                    </div>

                    <div className="mb-6 bg-[#0c0a0a] border border-[#222] rounded-lg p-4">
                      <h4 className="text-[10px] font-black text-[#555] uppercase tracking-wider mb-3">{lang === 'ar' ? 'الخدمات المحجوزة:' : 'Booked Services:'}</h4>
                      
                      {appt.isPackage && appt.packageId ? (
                        <div className="text-start">
                          <span className="text-[10px] font-bold text-[#d32f2f] uppercase tracking-widest block mb-1">{lang === 'ar' ? 'باقة مميزة' : 'VIP PACKAGE'}</span>
                          <p className="text-sm font-bold text-white">{lang === 'ar' ? appt.packageId.nameAr : appt.packageId.nameEn}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(groupedServices).map(([category, list]) => (
                            <div key={category} className="border-b border-[#2a2a2a]/30 pb-2 last:border-0 last:pb-0 text-start">
                              <span className="text-[10px] font-bold text-[#d32f2f] uppercase tracking-wider block mb-1">{category}</span>
                              <ul className="space-y-1 list-disc list-inside text-xs text-[#c4c4c4]">
                                {list.map((s, i) => <li key={i} className="font-medium">{lang === 'ar' ? s.nameAr : s.nameEn}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto pt-4 border-t border-[#2a2a2a]">
                      <button 
                        disabled={isConfirmedDisabled} 
                        onClick={() => handleUpdateStatus('appointments', appt._id, 'Confirmed')} 
                        className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all flex justify-center items-center gap-1.5 ${isConfirmedDisabled ? 'bg-[#1a1a1a] text-[#555] border border-[#333] cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-blue-500/20 text-blue-500 border border-[#333] hover:border-blue-500'}`}
                      >
                        <CheckCircle2 size={14}/> {t('mark_confirmed')}
                      </button>
                      <button 
                        disabled={isCompletedDisabled} 
                        onClick={() => handleUpdateStatus('appointments', appt._id, 'Completed')} 
                        className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all flex justify-center items-center gap-1.5 ${isCompletedDisabled ? 'bg-[#1a1a1a] text-[#555] border border-[#333] cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-green-500/20 text-green-500 border border-[#333] hover:border-green-500'}`}
                      >
                        <CheckCircle2 size={14}/> {t('mark_completed')}
                      </button>
                      <button 
                        disabled={isCancelledDisabled} 
                        onClick={() => handleUpdateStatus('appointments', appt._id, 'Cancelled')} 
                        className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all flex justify-center items-center gap-1.5 ${isCancelledDisabled ? 'bg-[#1a1a1a] text-[#555] border border-[#333] cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-red-500/20 text-red-500 border border-[#333] hover:border-red-500'}`}
                      >
                        <XCircle size={14}/> {t('mark_cancelled')}
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555]">{t('no_data')}</div>
              )
            )}

            {/* ORDERS VIEW */}
            {activeTab === 'orders' && (
              orders.length > 0 ? orders.map((order) => {
                
                // STRICT BUTTON LOGIC
                const isConfirmedDisabled = order.status === 'Confirmed' || order.status === 'Completed' || order.status === 'Cancelled';
                const isCompletedDisabled = order.status === 'Completed' || order.status === 'Cancelled';
                const isCancelledDisabled = order.status === 'Cancelled';

                return (
                  <div key={order._id} className="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4 border-b border-[#2a2a2a] pb-4">
                      <div>
                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(order.status || 'Pending')}`}>
                          {t(`status_${(order.status || 'Pending').toLowerCase()}`)}
                        </span>
                        
                        {/* NEW: Added inline edit capabilities to Order Dates/Times */}
                        {editingOrderId === order._id ? (
                          <div className="flex gap-2 mt-3" dir="ltr">
                            <input type="date" value={orderEditForm.date} onChange={(e) => setOrderEditForm({...orderEditForm, date: e.target.value})} className="bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-sm text-white outline-none focus:border-[#d32f2f]" />
                            <input type="time" value={orderEditForm.time} onChange={(e) => setOrderEditForm({...orderEditForm, time: e.target.value})} className="bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-sm text-white outline-none focus:border-[#d32f2f]" />
                            <button onClick={() => saveOrderEdit(order._id)} className="text-green-500 p-1"><Save size={16}/></button>
                            <button onClick={() => setEditingOrderId(null)} className="text-[#a3a3a3] p-1"><X size={16}/></button>
                          </div>
                        ) : (
                          <h3 className="text-xl font-bold text-white mt-3">{order.date} <span className="text-[#d32f2f]">{order.time}</span></h3>
                        )}
                        <span className="block text-xs text-[#a3a3a3] mt-2">Ordered: {new Date(order.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="block text-xl font-black text-[#d32f2f]">{order.totalPrice} <span className="text-xs">EGP</span></span>
                        
                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" dir="ltr">
                          {/* NEW: Edit button for orders */}
                          {editingOrderId !== order._id && (
                            <button onClick={() => startEditingOrder(order)} className="p-1.5 bg-[#1a1a1a] text-blue-400 hover:text-blue-300 rounded border border-[#333] transition-colors"><Edit2 size={14}/></button>
                          )}
                          <button onClick={() => handleDelete('orders', order._id)} className="p-1.5 bg-[#1a1a1a] text-red-500 hover:text-red-400 rounded border border-[#333] transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4 border-b border-[#2a2a2a] pb-4">
                      <div className="flex items-center gap-3 text-sm text-[#d4d4d4]"><User size={16} className="text-[#a3a3a3]" /><span className="font-bold">{order.clientName}</span></div>
                      <div className="flex items-center gap-3 text-sm text-[#d4d4d4]" dir="ltr"><Phone size={16} className="text-[#a3a3a3]" /><span>{order.clientPhone}</span></div>
                      
                      <div className="flex items-center gap-3 text-sm text-[#d4d4d4]"><MapPin size={16} className="text-[#a3a3a3]" />
                        <span>{lang === 'ar' ? 'فرع الاستلام:' : 'Pickup Branch:'} <span className="font-bold text-[#d32f2f]">
                          {order.branchId ? (lang === 'ar' ? order.branchId.nameAr : order.branchId.nameEn) : '---'}
                        </span></span>
                      </div>
                    </div>

                    <div className="mb-6 bg-[#0c0a0a] border border-[#222] rounded-lg p-4">
                      <h4 className="text-[10px] font-black text-[#555] uppercase tracking-wider mb-3">Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-[#d4d4d4] truncate pr-4">
                              {item.quantity}x {item.productId ? (lang === 'ar' ? item.productId.nameAr : item.productId.nameEn) : 'Product'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto pt-4 border-t border-[#2a2a2a]">
                      <button 
                        disabled={isConfirmedDisabled} 
                        onClick={() => handleUpdateStatus('orders', order._id, 'Confirmed')} 
                        className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all flex justify-center items-center gap-1.5 ${isConfirmedDisabled ? 'bg-[#1a1a1a] text-[#555] border border-[#333] cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-blue-500/20 text-blue-500 border border-[#333] hover:border-blue-500'}`}
                      >
                        <CheckCircle2 size={14}/> {t('mark_confirmed')}
                      </button>
                      <button 
                        disabled={isCompletedDisabled} 
                        onClick={() => handleUpdateStatus('orders', order._id, 'Completed')} 
                        className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all flex justify-center items-center gap-1.5 ${isCompletedDisabled ? 'bg-[#1a1a1a] text-[#555] border border-[#333] cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-green-500/20 text-green-500 border border-[#333] hover:border-green-500'}`}
                      >
                        <CheckCircle2 size={14}/> {t('mark_completed')}
                      </button>
                      <button 
                        disabled={isCancelledDisabled} 
                        onClick={() => handleUpdateStatus('orders', order._id, 'Cancelled')} 
                        className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all flex justify-center items-center gap-1.5 ${isCancelledDisabled ? 'bg-[#1a1a1a] text-[#555] border border-[#333] cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-red-500/20 text-red-500 border border-[#333] hover:border-red-500'}`}
                      >
                        <XCircle size={14}/> {t('mark_cancelled')}
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555]">{t('no_data')}</div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;