const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const categoryRoutes = require('./routes/categoryRoutes');
const professionalRoutes = require('./routes/professionalRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const packageRoutes = require('./routes/packageRoutes');
const branchRoutes = require('./routes/branchRoutes');
const reviewRoutes = require('./routes/reviewsRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  credentials: true
}));

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

// Local Development Listener (Skipped on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export Express App for Vercel Serverless Functions
module.exports = app;