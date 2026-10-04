import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { 
  Calendar, Clock, User, Phone, MapPin, 
  Scissors, Package, CheckCircle, XCircle, 
  AlertCircle, History, UserPlus, Loader2 
} from 'lucide-react';

const Appointments = () => {
  const { lang } = useLanguage();
  
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'status' | 'assign' | 'audit'
  const [selectedAppt, setSelectedAppt] = useState(null);
  
  // Action Forms
  const [actionNote, setActionNote] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const [targetProfId, setTargetProfId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [apptRes, profRes] = await Promise.all([
        axios.get('/api/appointments'),
        axios.get('/api/professionals?all=true')
      ]);
      setAppointments(apptRes.data);
      setProfessionals(profRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = filterStatus === 'All' 
    ? appointments 
    : appointments.filter(a => a.status === filterStatus);

  // Status Badges Colors
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'Confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Completed': return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'Cancelled': return 'bg-red-500/20 text-red-500 border-red-500/50';
      default: return 'bg-[#333] text-white';
    }
  };

  const handleStatusChangeSubmit = async () => {
    if (!actionNote.trim()) return alert(lang === 'ar' ? 'السبب/الملاحظة مطلوب' : 'A mandatory note is required.');
    
    setIsProcessing(true);
    try {
      await axios.patch(`/api/appointments/${selectedAppt._id}/status`, {
        status: targetStatus,
        note: actionNote
      });
      closeModal();
      fetchData();
    } catch (error) {
      alert("Failed to update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!actionNote.trim()) return alert(lang === 'ar' ? 'سبب التعيين مطلوب' : 'Assignment note is required.');
    
    setIsProcessing(true);
    try {
      await axios.patch(`/api/appointments/${selectedAppt._id}/assign`, {
        professionalId: targetProfId === 'unassigned' ? null : targetProfId,
        note: actionNote
      });
      closeModal();
      fetchData();
    } catch (error) {
      alert("Failed to assign professional.");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedAppt(null);
    setActionNote('');
    setTargetStatus('');
    setTargetProfId('');
  };

  // Filter professionals available for the specific branch of the appointment
  const getAvailableProfessionals = (branchId) => {
    return professionals.filter(p => 
      p.isActive && p.assignedBranches && p.assignedBranches.includes(branchId)
    );
  };

  return (
    <div className="text-white animate-fade-in-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">
            {lang === 'ar' ? 'الحجوزات اليومية' : 'Daily Appointments'}
          </h1>
          <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
        </div>
        
        <div className="flex gap-2 bg-[#141414] p-1.5 rounded-lg border border-[#2a2a2a] overflow-x-auto w-full md:w-auto">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterStatus === status 
                ? 'bg-[#d32f2f] text-white' 
                : 'text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-[#555] flex flex-col items-center">
          <Loader2 size={32} className="animate-spin mb-4" />
          Loading Appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555] uppercase tracking-widest text-sm font-bold">
          {lang === 'ar' ? 'لا توجد حجوزات.' : 'No Appointments Found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.map(appt => (
            <div key={appt._id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
              
              {/* Card Header */}
              <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a] flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="text-center">
                    <span className="block text-[#d32f2f] font-black text-xl leading-none">{appt.date.split('-')[2]}</span>
                    <span className="block text-[#a3a3a3] text-[9px] uppercase tracking-widest font-bold">
                      {new Date(appt.date).toLocaleString('en-US', { month: 'short' })}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[#333]"></div>
                  <div>
                    <span className="flex items-center gap-1.5 text-white font-bold text-sm">
                      <Clock size={14} className="text-[#a3a3a3]" /> {appt.time}
                    </span>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(appt.status)}`}>
                  {appt.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow">
                {/* Client Info */}
                <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-[#2a2a2a] text-sm">
                  <div>
                    <span className="block text-[10px] text-[#555] uppercase font-bold mb-1 tracking-wider">Client</span>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <User size={14} className="text-[#a3a3a3]" /> {appt.clientName}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#555] uppercase font-bold mb-1 tracking-wider">Contact</span>
                    <div className="flex items-center gap-2 text-white font-mono">
                      <Phone size={14} className="text-[#a3a3a3]" /> {appt.clientPhone}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] text-[#555] uppercase font-bold mb-1 tracking-wider">Location</span>
                    <div className="flex items-center gap-2 text-white">
                      <MapPin size={14} className="text-[#d32f2f]" /> 
                      {lang === 'ar' ? appt.branchId?.nameAr : appt.branchId?.nameEn}
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="mb-6">
                  <span className="block text-[10px] text-[#555] uppercase font-bold mb-3 tracking-wider">Services Booked</span>
                  {appt.isPackage ? (
                    <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#333] p-3 rounded-lg">
                      <Package size={20} className="text-[#d32f2f]" />
                      <span className="font-bold text-sm">{lang === 'ar' ? appt.packageId?.nameAr : appt.packageId?.nameEn} (VIP Package)</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {appt.services.map((srv, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#333] px-3 py-1.5 rounded-full text-xs font-bold">
                          <Scissors size={12} className="text-[#a3a3a3]" />
                          {lang === 'ar' ? srv.nameAr : srv.nameEn}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Professional Assignment */}
                <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#0a0a0a] border border-[#555] overflow-hidden flex items-center justify-center">
                      {appt.professionalId?.avatar ? (
                        <img src={appt.professionalId.avatar} alt="Staff" className="h-full w-full object-cover" />
                      ) : (
                        <User size={16} className="text-[#555]" />
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#555] uppercase font-bold tracking-wider mb-0.5">Assigned To</span>
                      <span className={`text-sm font-bold ${appt.professionalId ? 'text-white' : 'text-yellow-500'}`}>
                        {appt.professionalId 
                          ? (lang === 'ar' ? appt.professionalId.nameAr : appt.professionalId.nameEn)
                          : 'No Preference / Unassigned'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Super Admin / Admin Assignment Button */}
                  {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                    <button 
                      onClick={() => {
                        setSelectedAppt(appt);
                        setTargetProfId(appt.professionalId?._id || 'unassigned');
                        setActiveModal('assign');
                      }}
                      className="p-2 bg-[#222] hover:bg-[#333] text-blue-400 rounded transition-colors"
                      title="Assign Professional"
                    >
                      <UserPlus size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-[#0a0a0a] border-t border-[#2a2a2a] flex justify-between items-center gap-4">
                <span className="text-xl font-black text-[#d32f2f]">{appt.totalPrice} EGP</span>
                
                <div className="flex gap-2 flex-grow justify-end" dir="ltr">
                  <button 
                    onClick={() => { setSelectedAppt(appt); setActiveModal('audit'); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]"
                  >
                    <History size={14} /> Audit Log
                  </button>
                  {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                    <select 
                      value="" // Always blank, acts as action trigger
                      onChange={(e) => {
                        if(!e.target.value) return;
                        setSelectedAppt(appt);
                        setTargetStatus(e.target.value);
                        setActiveModal('status');
                      }}
                      className="bg-[#d32f2f] text-white px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer hover:bg-red-700 appearance-none text-center"
                      style={{ WebkitAppearance: 'none' }}
                    >
                      <option value="">CHANGE STATUS</option>
                      {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => {
                        let isDisabled = appt.status === s;
                        if (appt.status === 'Pending' && s === 'Completed') isDisabled = true;
                        if (appt.status === 'Confirmed' && s === 'Pending') isDisabled = true;
                        return (
                          <option key={s} value={s} disabled={isDisabled}>{s}</option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- STATUS CHANGE MODAL --- */}
      {activeModal === 'status' && selectedAppt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-black uppercase tracking-wider mb-4">Update Status</h3>
            <div className="mb-6">
              <span className="block text-sm text-[#a3a3a3] mb-2">
                Changing status from <strong className="text-white">{selectedAppt.status}</strong> to <strong className={getStatusStyle(targetStatus).split(' ')[1]}>{targetStatus}</strong>
              </span>
              <label className="block text-[10px] font-bold text-red-500 uppercase mb-2 mt-4 flex items-center gap-1">
                <AlertCircle size={12} /> Mandatory Context Note
              </label>
              <textarea 
                value={actionNote} 
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="e.g. Client called to confirm / Client no-show..."
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#d32f2f] resize-none h-24 text-sm"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3" dir="ltr">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-lg text-xs font-bold text-[#a3a3a3] hover:bg-[#222]">Cancel</button>
              <button onClick={handleStatusChangeSubmit} disabled={isProcessing || !actionNote.trim()} className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#d32f2f] hover:bg-red-700 disabled:opacity-50">
                {isProcessing ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ASSIGN PROFESSIONAL MODAL --- */}
      {activeModal === 'assign' && selectedAppt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-black uppercase tracking-wider mb-4">Assign Professional</h3>
            <p className="text-xs text-[#a3a3a3] mb-4">Showing active staff assigned to: <strong className="text-white">{lang === 'ar' ? selectedAppt.branchId?.nameAr : selectedAppt.branchId?.nameEn}</strong></p>
            
            <div className="space-y-4 mb-6">
              <select 
                value={targetProfId}
                onChange={(e) => setTargetProfId(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#d32f2f] text-sm"
              >
                <option value="unassigned">-- Unassigned / No Preference --</option>
                {getAvailableProfessionals(selectedAppt.branchId?._id).map(p => (
                  <option key={p._id} value={p._id}>{lang === 'ar' ? p.nameAr : p.nameEn} ({lang === 'ar' ? p.roleAr : p.roleEn})</option>
                ))}
              </select>

              <div>
                <label className="block text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Assignment Note Required
                </label>
                <textarea 
                  value={actionNote} 
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Initial assignment / Ahmed sick, reassigned to Karim..."
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#d32f2f] resize-none h-20 text-sm"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3" dir="ltr">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-lg text-xs font-bold text-[#a3a3a3] hover:bg-[#222]">Cancel</button>
              <button onClick={handleAssignSubmit} disabled={isProcessing || !actionNote.trim()} className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#d32f2f] hover:bg-red-700 disabled:opacity-50">
                {isProcessing ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AUDIT LOG MODAL --- */}
      {activeModal === 'audit' && selectedAppt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto custom-scrollbar relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-[#a3a3a3] hover:text-white"><XCircle size={20}/></button>
            
            <div className="flex items-center gap-3 mb-6">
              <History size={24} className="text-blue-400" />
              <h3 className="text-xl font-black uppercase tracking-wider">Operation History</h3>
            </div>

            {(!selectedAppt.auditLog || selectedAppt.auditLog.length === 0) ? (
              <p className="text-center text-[#555] py-8 text-sm">No operations recorded yet.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#2a2a2a]">
                {selectedAppt.auditLog.slice().reverse().map((log, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#141414] bg-[#333] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <User size={14} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0a0a0a] p-4 rounded border border-[#333]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{log.adminName}</span>
                        <time className="text-[9px] font-mono text-[#a3a3a3]">{new Date(log.timestamp).toLocaleString()}</time>
                      </div>
                      <div className="text-xs font-bold text-blue-400 mb-2">{log.action}</div>
                      <p className="text-xs text-[#a3a3a3] italic">"{log.note}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;