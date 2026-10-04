import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { useAdminAuth } from '../../context/AdminContext';
import { 
  DollarSign, BarChart3, TrendingUp, CalendarDays, Package, 
  Clock, Activity, MapPin, Store
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  const { admin } = useAdminAuth();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (admin) {
      fetchDashboard();
    }
  }, [admin]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#a3a3a3]">
        <Activity size={32} className="animate-spin mb-4 text-[#d32f2f]" />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-center py-20 text-red-500">{error || 'No data found'}</div>;
  }

  // Helper to format currency
  const formatCurrency = (val) => new Intl.NumberFormat('en-EG').format(val || 0);

  return (
    <div className="text-white font-sans animate-fade-in-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="mb-8 border-b border-[#2a2a2a] pb-6">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">
          {lang === 'ar' ? 'لوحة القيادة' : 'Dashboard'}
        </h1>
        <p className="text-[#a3a3a3] text-sm">
          {lang === 'ar' ? 'مرحباً بعودتك،' : 'Welcome back,'} <span className="font-bold text-white">{admin?.name}</span> ({admin?.role})
        </p>
      </div>

      {admin?.role === 'Super Admin' ? (
        // ------------------------------------------------------------------
        // SUPER ADMIN VIEW
        // ------------------------------------------------------------------
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-xl flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-[#1a1a1a] transition-transform group-hover:scale-110">
                <DollarSign size={100} />
              </div>
              <span className="text-[10px] text-[#555] font-bold uppercase tracking-widest mb-2 z-10">Total Revenue</span>
              <span className="text-4xl font-black text-green-500 z-10">{formatCurrency(data.totalRevenue)} <span className="text-sm">EGP</span></span>
            </div>

            <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-xl flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-[#1a1a1a] transition-transform group-hover:scale-110">
                <CalendarDays size={100} />
              </div>
              <span className="text-[10px] text-[#555] font-bold uppercase tracking-widest mb-2 z-10">All-Time Appointments</span>
              <span className="text-4xl font-black text-white z-10">{formatCurrency(data.totalAppointments)}</span>
            </div>

            <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-xl flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-[#1a1a1a] transition-transform group-hover:scale-110">
                <Package size={100} />
              </div>
              <span className="text-[10px] text-[#555] font-bold uppercase tracking-widest mb-2 z-10">All-Time Product Orders</span>
              <span className="text-4xl font-black text-white z-10">{formatCurrency(data.totalOrdersCount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Branch */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center gap-3">
                <BarChart3 className="text-[#d32f2f]" size={20} />
                <h3 className="font-black uppercase tracking-wider">Revenue by Branch</h3>
              </div>
              <div className="p-4 flex-grow">
                {data.revenueByBranch?.length === 0 ? (
                  <p className="text-[#555] text-sm py-4 text-center">No branches found.</p>
                ) : (
                  <div className="space-y-4">
                    {data.revenueByBranch.sort((a, b) => b.revenue - a.revenue).map((b, i) => (
                      <div key={b.branchId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-[#d32f2f] text-white' : 'bg-[#333] text-[#a3a3a3]'}`}>{i + 1}</span>
                          <span className="font-bold text-sm">{lang === 'ar' ? b.nameAr : b.nameEn}</span>
                        </div>
                        <span className="font-black text-green-500">{formatCurrency(b.revenue)} EGP</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center gap-3">
                <Activity className="text-blue-500" size={20} />
                <h3 className="font-black uppercase tracking-wider">Recent Activity Feed</h3>
              </div>
              <div className="p-0 overflow-y-auto max-h-[300px] custom-scrollbar">
                {data.activityFeed?.length === 0 ? (
                  <p className="text-[#555] text-sm py-8 text-center">No recent activity.</p>
                ) : (
                  <div className="divide-y divide-[#2a2a2a]">
                    {data.activityFeed.map((item, idx) => (
                      <div key={idx} className="p-4 hover:bg-[#1a1a1a] transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-blue-400">{item.adminName}</span>
                          <span className="text-[10px] text-[#555] font-mono">{new Date(item.updatedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-white mb-2">{item.lastAction}</p>
                        <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-[#a3a3a3]">
                          <span className="flex items-center gap-1">
                            {item.type === 'Appointment' ? <CalendarDays size={12}/> : <Package size={12}/>}
                            {item.type}
                          </span>
                          <span>&bull;</span>
                          <span className="text-[#d32f2f]">{item.status}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1"><Store size={12}/> {lang === 'ar' ? item.branchNameAr : item.branchNameEn}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ------------------------------------------------------------------
        // NORMAL ADMIN VIEW
        // ------------------------------------------------------------------
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-[#a3a3a3] mb-4">Today's Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-[#555] font-bold uppercase tracking-widest mb-1">Appointments Today</span>
                <span className="text-3xl font-black text-white">{data.todayAppointmentsCount}</span>
              </div>
              <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center text-[#d32f2f]">
                <CalendarDays size={24} />
              </div>
            </div>
            
            <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-[#555] font-bold uppercase tracking-widest mb-1">Product Orders Today</span>
                <span className="text-3xl font-black text-white">{data.todayOrdersCount}</span>
              </div>
              <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center text-blue-500">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Appointments */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-yellow-500/10 border-b border-[#2a2a2a] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock className="text-yellow-500" size={20} />
                  <h3 className="font-black uppercase tracking-wider text-yellow-500">Action Required: Appointments</h3>
                </div>
                <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded">{data.pendingAppointments?.length} Pending</span>
              </div>
              <div className="p-0 overflow-y-auto max-h-[400px] custom-scrollbar">
                {data.pendingAppointments?.length === 0 ? (
                  <p className="text-[#555] text-sm py-8 text-center">No pending appointments today! 🎉</p>
                ) : (
                  <div className="divide-y divide-[#2a2a2a]">
                    {data.pendingAppointments.map(appt => (
                      <div key={appt._id} className="p-4 hover:bg-[#1a1a1a] transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white text-sm mb-1">{appt.clientName}</p>
                          <p className="text-xs text-[#a3a3a3]">{appt.date} <span className="text-[#d32f2f]">{appt.time}</span></p>
                          <p className="text-[10px] text-[#555] uppercase font-bold mt-1">{lang === 'ar' ? appt.branchId?.nameAr : appt.branchId?.nameEn}</p>
                        </div>
                        <Link to="/admin/appointments" className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#d32f2f] text-white rounded text-xs font-bold uppercase transition-colors">
                          Manage
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-yellow-500/10 border-b border-[#2a2a2a] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock className="text-yellow-500" size={20} />
                  <h3 className="font-black uppercase tracking-wider text-yellow-500">Action Required: Orders</h3>
                </div>
                <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded">{data.pendingOrders?.length} Pending</span>
              </div>
              <div className="p-0 overflow-y-auto max-h-[400px] custom-scrollbar">
                {data.pendingOrders?.length === 0 ? (
                  <p className="text-[#555] text-sm py-8 text-center">No pending orders today! 🎉</p>
                ) : (
                  <div className="divide-y divide-[#2a2a2a]">
                    {data.pendingOrders.map(order => (
                      <div key={order._id} className="p-4 hover:bg-[#1a1a1a] transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white text-sm mb-1">{order.clientName}</p>
                          <p className="text-xs text-[#a3a3a3]">{order.date || 'No Date'} <span className="text-blue-500">{order.time || ''}</span></p>
                          <p className="text-[10px] text-[#555] uppercase font-bold mt-1">{lang === 'ar' ? order.branchId?.nameAr : order.branchId?.nameEn}</p>
                        </div>
                        <Link to="/admin/orders" className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-blue-600 text-white rounded text-xs font-bold uppercase transition-colors">
                          Manage
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;