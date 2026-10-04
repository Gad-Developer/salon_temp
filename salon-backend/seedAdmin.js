require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Check if Super Admin already exists
    const existingSuper = await Admin.findOne({ email: 'super@salon.com' });
    if (!existingSuper) {
      await Admin.create({
        name: 'Master Admin',
        email: 'super@salon.com',
        password: 'password123',
        role: 'Super Admin',
        isActive: true
      });
      console.log('✅ Super Admin created successfully. (Email: super@salon.com | Pass: password123)');
    } else {
      console.log('⚠️ Super Admin already exists.');
    }

    // Check if Normal Admin already exists
    const existingNormal = await Admin.findOne({ email: 'desk@salon.com' });
    if (!existingNormal) {
      await Admin.create({
        name: 'Front Desk',
        email: 'desk@salon.com',
        password: 'password123',
        role: 'Normal Admin',
        isActive: true
      });
      console.log('✅ Normal Admin created successfully. (Email: desk@salon.com | Pass: password123)');
    } else {
      console.log('⚠️ Normal Admin already exists.');
    }

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
