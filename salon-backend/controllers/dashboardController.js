const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const Branch = require('../models/Branch');

// GET /api/dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const admin = req.admin; // Populated by protect middleware
    
    // ---------------------------------------------------------
    // SUPER ADMIN VIEW
    // ---------------------------------------------------------
    if (admin.role === 'Super Admin') {
      // 1. Total Revenue (Completed Appointments + Completed Orders)
      const completedAppts = await Appointment.find({ status: 'Completed' });
      const completedOrders = await Order.find({ status: 'Completed' });
      
      const apptRevenue = completedAppts.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
      const orderRevenue = completedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const totalRevenue = apptRevenue + orderRevenue;

      // 2. Total Volume
      const totalAppointments = await Appointment.countDocuments();
      const totalOrdersCount = await Order.countDocuments();

      // 3. Revenue by Branch
      const branches = await Branch.find();
      const revenueByBranch = branches.map(branch => {
        const bId = branch._id.toString();
        const bAppts = completedAppts.filter(a => a.branchId && a.branchId.toString() === bId);
        const bOrders = completedOrders.filter(o => o.branchId && o.branchId.toString() === bId);
        
        const bRevenue = bAppts.reduce((sum, a) => sum + (a.totalPrice || 0), 0) + 
                         bOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        
        return {
          branchId: bId,
          nameEn: branch.nameEn,
          nameAr: branch.nameAr,
          revenue: bRevenue
        };
      });

      // 4. Recent Activity (Last 10 combined updated items)
      const recentAppts = await Appointment.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('branchId', 'nameEn nameAr');
        
      const recentOrders = await Order.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('branchId', 'nameEn nameAr');

      const allRecent = [...recentAppts, ...recentOrders]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10);

      // Map to a unified feed format
      const activityFeed = allRecent.map(item => {
        const isAppt = !!item.clientName && !!item.services;
        const lastAudit = item.auditLog && item.auditLog.length > 0 
          ? item.auditLog[item.auditLog.length - 1] 
          : null;
          
        return {
          id: item._id,
          type: isAppt ? 'Appointment' : 'Order',
          status: item.status,
          updatedAt: item.updatedAt,
          branchNameEn: item.branchId?.nameEn,
          branchNameAr: item.branchId?.nameAr,
          clientName: item.clientName,
          lastAction: lastAudit ? lastAudit.action : 'Created',
          adminName: lastAudit ? lastAudit.adminName : 'System'
        };
      });

      return res.status(200).json({
        role: admin.role,
        data: {
          totalRevenue,
          totalAppointments,
          totalOrdersCount,
          revenueByBranch,
          activityFeed
        }
      });
    }

    // ---------------------------------------------------------
    // NORMAL ADMIN VIEW
    // ---------------------------------------------------------
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    // 1. Today's Overview
    const todayAppointmentsCount = await Appointment.countDocuments({ date: todayString });
    const todayOrdersCount = await Order.countDocuments({ date: todayString });

    // 2. Action Required (Pending items)
    const pendingAppointments = await Appointment.find({ status: 'Pending' })
      .populate('branchId', 'nameEn nameAr')
      .sort({ date: 1, time: 1 })
      .limit(20);
      
    const pendingOrders = await Order.find({ status: 'Pending' })
      .populate('branchId', 'nameEn nameAr')
      .sort({ date: 1, time: 1 })
      .limit(20);

    return res.status(200).json({
      role: admin.role,
      data: {
        todayAppointmentsCount,
        todayOrdersCount,
        pendingAppointments,
        pendingOrders
      }
    });

  } catch (error) {
    console.error("Dashboard Aggregation Error:", error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
};
