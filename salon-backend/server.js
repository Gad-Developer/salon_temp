const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const categoryRoutes = require('./routes/categoryRoutes');
const professionalRoutes = require('./routes/professionalRoutes'); // <-- Add this
const appointmentRoutes = require('./routes/appointmentRoutes'); // <-- Add this
const packageRoutes = require('./routes/packageRoutes');
const branchRoutes = require('./routes/branchRoutes');
const reviewRoutes = require('./routes/reviewsRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ DB Connection Error:', err));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});