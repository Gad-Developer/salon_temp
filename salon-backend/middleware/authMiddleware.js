const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not logged in! Please log in to get access.' });
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_dev');

    // 3) Check if admin still exists
    const currentAdmin = await Admin.findById(decoded.id).select('+isActive');
    if (!currentAdmin) {
      return res.status(401).json({ message: 'The user belonging to this token does no longer exist.' });
    }

    if (!currentAdmin.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated.' });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.admin = currentAdmin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token or authorization error' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['Super Admin', 'Normal Admin']
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};
