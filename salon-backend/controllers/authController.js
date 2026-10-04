const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_for_dev', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      admin: user
    }
  });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2) Check if user exists && password is correct
    const admin = await Admin.findOne({ email }).select('+password +isActive');

    if (!admin || !(await admin.correctPassword(password, admin.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated' });
    }

    // 3) If everything ok, send token to client
    createSendToken(admin, 200, res);
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    // req.admin is set by the protect middleware
    const admin = await Admin.findById(req.admin._id);
    res.status(200).json({
      status: 'success',
      data: {
        admin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// POST /api/auth/create
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Optional: Only Super Admins can create admins (handled by middleware restrictTo)
    const newAdmin = await Admin.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      status: 'success',
      message: 'Admin created successfully',
      data: {
        admin: {
          _id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role
        }
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating admin', error: error.message });
  }
};

// GET /api/auth/admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('+isActive -password');
    res.status(200).json({
      status: 'success',
      results: admins.length,
      data: { admins }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
};

// PATCH /api/auth/admins/:id
exports.updateAdmin = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    ).select('+isActive -password');

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'No admin found with that ID' });
    }

    res.status(200).json({
      status: 'success',
      data: { admin: updatedAdmin }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating admin', error: error.message });
  }
};

// DELETE /api/auth/admins/:id
exports.deleteAdmin = async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'No admin found with that ID' });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting admin', error: error.message });
  }
};
