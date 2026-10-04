import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { 
  ShoppingBag, Clock, User, Phone, MapPin, 
  CheckCircle, XCircle, AlertCircle, History, Loader2,
  PackageSearch, Edit2, Plus, Trash, Search
} from 'lucide-react';

const ProductOrders = () => {
  const { lang } = useLanguage();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'status' | 'audit'
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Action Forms
  const [actionNote, setActionNote] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Edit Items State
  const [allProducts, setAllProducts] = useState([]);
  const [editItemsList, setEditItemsList] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resOrders, resProducts] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/products?all=true')
      ]);
      setOrders(resOrders.data);
      setAllProducts(resProducts.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

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
      await axios.patch(`/api/orders/${selectedOrder._id}/status`, {
        status: targetStatus,
        note: actionNote
      });
      closeModal();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditItemsSubmit = async () => {
    if (!actionNote.trim()) return alert(lang === 'ar' ? 'السبب/الملاحظة مطلوب' : 'A mandatory note is required.');
    
    setIsProcessing(true);
    try {
      await axios.patch(`/api/orders/${selectedOrder._id}/items`, {
        items: editItemsList.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          isDeleted: item.isDeleted
        })),
        note: actionNote
      });
      closeModal();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update items.");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedOrder(null);
    setActionNote('');
    setTargetStatus('');
    setEditItemsList([]);
    setProductSearch('');
  };

  return (
    <div className="text-white animate-fade-in-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">
            {lang === 'ar' ? 'طلبات المنتجات' : 'Product Orders'}
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
          Loading Orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555] uppercase tracking-widest text-sm font-bold">
          {lang === 'ar' ? 'لا توجد طلبات.' : 'No Orders Found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
              
              {/* Card Header */}
              <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a] flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="text-center">
                    <span className="block text-[#d32f2f] font-black text-xl leading-none">{order.date ? order.date.split('-')[2] : '--'}</span>
                    <span className="block text-[#a3a3a3] text-[9px] uppercase tracking-widest font-bold">
                      {order.date ? new Date(order.date).toLocaleString('en-US', { month: 'short' }) : '---'}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[#333]"></div>
                  <div>
                    <span className="flex items-center gap-1.5 text-white font-bold text-sm">
                      <Clock size={14} className="text-[#a3a3a3]" /> {order.time || '--:--'}
                    </span>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow">
                {/* Client Info */}
                <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-[#2a2a2a] text-sm">
                  <div>
                    <span className="block text-[10px] text-[#555] uppercase font-bold mb-1 tracking-wider">Client</span>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <User size={14} className="text-[#a3a3a3]" /> {order.clientName}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#555] uppercase font-bold mb-1 tracking-wider">Contact</span>
                    <div className="flex items-center gap-2 text-white font-mono">
                      <Phone size={14} className="text-[#a3a3a3]" /> {order.clientPhone}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] text-[#555] uppercase font-bold mb-1 tracking-wider">Pickup Location</span>
                    <div className="flex items-center gap-2 text-white">
                      <MapPin size={14} className="text-[#d32f2f]" /> 
                      {lang === 'ar' ? order.branchId?.nameAr : order.branchId?.nameEn}
                    </div>
                  </div>
                </div>

                {/* Items Ordered */}
                <div className="mb-2">
                  <span className="block text-[10px] text-[#555] uppercase font-bold mb-3 tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={12}/> Items Ordered
                  </span>
                  <div className="flex flex-col gap-2">
                    {order.items.map((item, idx) => {
                      const inventory = item.productId?.inventory || [];
                      const totalStock = inventory.reduce((sum, inv) => sum + (inv.stock || 0), 0);
                      
                      // Handle cases where branchId might be populated or just an ID string
                      const orderBranchId = order.branchId?._id || order.branchId;
                      const branchStockObj = inventory.find(inv => {
                        const invBranchId = inv.branchId?._id || inv.branchId;
                        return invBranchId?.toString() === orderBranchId?.toString();
                      });
                      
                      const branchStock = branchStockObj ? branchStockObj.stock : 0;
                      const isLowStock = branchStock < item.quantity;
                      
                      return (
                        <div key={idx} className={`flex flex-col bg-[#0a0a0a] border border-[#333] px-3 py-2 rounded-lg text-xs font-bold ${item.isDeleted ? 'opacity-40' : ''}`}>
                          <div className="flex justify-between items-center">
                            <div className={`flex items-center gap-2 ${item.isDeleted ? 'line-through' : ''}`}>
                              <PackageSearch size={14} className="text-[#a3a3a3]" />
                              <span className="truncate pr-2">
                                {lang === 'ar' ? item.productId?.nameAr : item.productId?.nameEn} 
                                <span className="text-[#555] ml-1">({item.productId?.brand})</span>
                              </span>
                              {item.isDeleted && <span className="text-[9px] bg-red-500/20 text-red-500 px-1 rounded ml-1">DELETED</span>}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[#a3a3a3] ${item.isDeleted ? 'line-through' : ''}`}>x{item.quantity}</span>
                              <span className={`w-12 text-right ${item.isDeleted ? 'text-[#555] line-through' : 'text-[#d32f2f]'}`}>
                                {item.productId?.price * item.quantity} EGP
                              </span>
                            </div>
                          </div>
                          
                          {!item.isDeleted && (
                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#222]">
                              <span className="text-[9px] uppercase tracking-widest text-[#555]">
                                {lang === 'ar' ? 'المخزون (الفرع / الكلي)' : 'Stock (Branch / Total)'}
                              </span>
                              <span className={`text-[10px] font-mono tracking-wider ${isLowStock ? 'text-red-500' : 'text-green-500'}`}>
                                {branchStock} / {totalStock}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-[#0a0a0a] border-t border-[#2a2a2a] flex justify-between items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#555] uppercase font-bold tracking-widest mb-0.5">Total Amount</span>
                  <span className="text-xl font-black text-[#d32f2f] leading-none">{order.totalPrice} EGP</span>
                </div>
                
                <div className="flex gap-2 flex-grow justify-end" dir="ltr">
                  <button 
                    onClick={() => { setSelectedOrder(order); setActiveModal('audit'); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]"
                  >
                    <History size={14} /> Audit Log
                  </button>

                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                    <button 
                      onClick={() => { 
                        setSelectedOrder(order);
                        setEditItemsList(order.items.map(i => ({
                          productId: i.productId?._id,
                          productName: lang === 'ar' ? i.productId?.nameAr : i.productId?.nameEn,
                          price: i.productId?.price,
                          quantity: i.quantity,
                          isDeleted: i.isDeleted || false
                        })));
                        setActiveModal('editItems'); 
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]"
                    >
                      <Edit2 size={14} /> Edit Items
                    </button>
                  )}
                  
                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                    <select 
                      value="" // Always blank, acts as action trigger
                      onChange={(e) => {
                        if(!e.target.value) return;
                        setSelectedOrder(order);
                        setTargetStatus(e.target.value);
                        setActiveModal('status');
                      }}
                      className="bg-[#d32f2f] text-white px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer hover:bg-red-700 appearance-none text-center"
                      style={{ WebkitAppearance: 'none' }}
                    >
                      <option value="">CHANGE STATUS</option>
                      {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => {
                        let isDisabled = order.status === s;
                        if (order.status === 'Pending' && s === 'Completed') isDisabled = true;
                        if (order.status === 'Confirmed' && s === 'Pending') isDisabled = true;
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
      {activeModal === 'status' && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-black uppercase tracking-wider mb-4">Update Status</h3>
            <div className="mb-6">
              <span className="block text-sm text-[#a3a3a3] mb-2">
                Changing status from <strong className="text-white">{selectedOrder.status}</strong> to <strong className={getStatusStyle(targetStatus).split(' ')[1]}>{targetStatus}</strong>
              </span>
              <label className="block text-[10px] font-bold text-red-500 uppercase mb-2 mt-4 flex items-center gap-1">
                <AlertCircle size={12} /> Mandatory Context Note
              </label>
              <textarea 
                value={actionNote} 
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="e.g. Client picked up items / Cancelled due to out of stock..."
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

      {/* --- EDIT ITEMS MODAL --- */}
      {activeModal === 'editItems' && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black uppercase tracking-wider">Edit Order Items</h3>
              <button onClick={closeModal} className="text-[#a3a3a3] hover:text-white"><XCircle size={20}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-2">Current Items</h4>
                <div className="space-y-2 mb-4">
                  {editItemsList.map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center bg-[#0a0a0a] border border-[#333] p-2 rounded ${item.isDeleted ? 'opacity-40' : ''}`}>
                      <div className="flex-1">
                        <span className={`block text-sm font-bold truncate text-white ${item.isDeleted ? 'line-through' : ''}`}>
                          {item.productName}
                        </span>
                        {item.isDeleted ? (
                          <span className="text-xs text-[#a3a3a3] line-through">
                            {item.price} EGP x {item.quantity}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#a3a3a3]">{item.price} EGP x</span>
                            <button 
                              onClick={() => setEditItemsList(editItemsList.map((x, i) => i === idx ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}
                              className="w-5 h-5 flex items-center justify-center bg-[#1a1a1a] border border-[#333] rounded text-white hover:bg-[#333]"
                            >-</button>
                            <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => setEditItemsList(editItemsList.map((x, i) => i === idx ? { ...x, quantity: x.quantity + 1 } : x))}
                              className="w-5 h-5 flex items-center justify-center bg-[#1a1a1a] border border-[#333] rounded text-white hover:bg-[#333]"
                            >+</button>
                          </div>
                        )}
                      </div>
                      
                      {item.isDeleted ? (
                        <button 
                          onClick={() => setEditItemsList(editItemsList.map((x, i) => i === idx ? { ...x, isDeleted: false } : x))}
                          className="p-1 text-green-500 hover:bg-green-500/20 rounded ml-2 text-[10px] font-bold"
                        >
                          RESTORE
                        </button>
                      ) : (
                        <button 
                          onClick={() => setEditItemsList(editItemsList.map((x, i) => i === idx ? { ...x, isDeleted: true } : x))}
                          className="p-1 text-red-500 hover:bg-red-500/20 rounded ml-2"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {editItemsList.length === 0 && <div className="text-xs text-[#555]">No items in this order.</div>}
                </div>

                <div className="pt-2 border-t border-[#333]">
                  <span className="text-xs font-bold text-[#a3a3a3] uppercase">New Total:</span>
                  <span className="block text-xl font-black text-[#d32f2f]">
                    {editItemsList.filter(i => !i.isDeleted).reduce((sum, item) => sum + (item.price * item.quantity), 0)} EGP
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-2">Add New Item</h4>
                <div className="relative mb-4">
                  <Search className="absolute top-2.5 left-2 text-[#555]" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333] text-white text-sm rounded pl-8 pr-2 py-2 focus:outline-none focus:border-[#d32f2f]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                  {allProducts
                    .filter(p => (p.nameEn + ' ' + p.nameAr).toLowerCase().includes(productSearch.toLowerCase()))
                    .slice(0, 5)
                    .map(product => (
                      <div key={product._id} className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded border border-[#333]">
                        <div className="truncate flex-1">
                          <span className="block text-xs font-bold text-white truncate">{lang === 'ar' ? product.nameAr : product.nameEn}</span>
                          <span className="text-[10px] text-[#a3a3a3]">{product.price} EGP</span>
                        </div>
                        <button 
                          onClick={() => {
                            const existing = editItemsList.find(i => i.productId === product._id);
                            if (existing) {
                              setEditItemsList(editItemsList.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + 1, isDeleted: false } : i));
                            } else {
                              setEditItemsList([...editItemsList, {
                                productId: product._id,
                                productName: lang === 'ar' ? product.nameAr : product.nameEn,
                                price: product.price,
                                quantity: 1,
                                isDeleted: false
                              }]);
                            }
                          }}
                          className="ml-2 p-1 bg-[#d32f2f] hover:bg-red-700 text-white rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#333] pt-4">
              <label className="block text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center gap-1">
                <AlertCircle size={12} /> Mandatory Context Note (Audit Log)
              </label>
              <textarea 
                value={actionNote} 
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="e.g. Swapped shampoo for conditioner, removed out of stock gel..."
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#d32f2f] resize-none h-16 text-sm mb-4"
              ></textarea>
              
              <div className="flex justify-end gap-3" dir="ltr">
                <button onClick={closeModal} className="px-5 py-2.5 rounded-lg text-xs font-bold text-[#a3a3a3] hover:bg-[#222]">Cancel</button>
                <button onClick={handleEditItemsSubmit} disabled={isProcessing || !actionNote.trim()} className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#d32f2f] hover:bg-red-700 disabled:opacity-50">
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- AUDIT LOG MODAL --- */}
      {activeModal === 'audit' && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto custom-scrollbar relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-[#a3a3a3] hover:text-white"><XCircle size={20}/></button>
            
            <div className="flex items-center gap-3 mb-6">
              <History size={24} className="text-blue-400" />
              <h3 className="text-xl font-black uppercase tracking-wider">Operation History</h3>
            </div>

            {(!selectedOrder.auditLog || selectedOrder.auditLog.length === 0) ? (
              <p className="text-center text-[#555] py-8 text-sm">No operations recorded yet.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#2a2a2a]">
                {selectedOrder.auditLog.slice().reverse().map((log, idx) => (
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

export default ProductOrders;
