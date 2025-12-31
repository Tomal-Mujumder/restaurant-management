// import mongoose from 'mongoose';
// import bcryptjs from 'bcryptjs';
// import dotenv from 'dotenv';
// import User from '../models/user.model.js';

// dotenv.config();

// const createFirstAdmin = async () => {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(process.env.MONGO);
//     console.log('Connected to MongoDB');

//     // Check if admin already exists
//     const existingAdmin = await User.findOne({ isAdmin: true });
//     if (existingAdmin) {
//       console.log('Admin already exists:', existingAdmin.email);
//       process.exit(0);
//     }

//     // Create admin
//     const hashedPassword = bcryptjs.hashSync('admin123', 10); // Change this password!
    
//     const admin = new User({
//       name: 'Super Admin',
//       username: 'superadmin',
//       email: 'admin@banglarheshel.com',
//       password: hashedPassword,
//       gender: 'male',
//       dateOfBirth: new Date('1990-01-01'),
//       address: 'Head Office',
//       contactNumber: '01234567890',
//       isAdmin: true
//     });

//     await admin.save();
//     console.log('✅ Admin created successfully!');
//     console.log('Email:', admin.email);
//     console.log('Password: admin123');
//     console.log('⚠️  Please change the password after first login!');
    
//     process.exit(0);
//   } catch (error) {
//     console.error('Error creating admin:', error);
//     process.exit(1);
//   }
// };

// createFirstAdmin();

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ADDED: Logic to locate the .env file in the root directory ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); 
// -----------------------------------------------------------------

const createFirstAdmin = async () => {
  try {
    // Debug: Check if the URI is being loaded correctly
    if (!process.env.MONGO) {
      throw new Error("MONGO connection string is missing from .env file or .env is not found.");
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin
    const hashedPassword = bcryptjs.hashSync('admin123', 10); 
    
    const admin = new User({
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@banglarheshel.com',
      password: hashedPassword,
      gender: 'male',
      dateOfBirth: new Date('1990-01-01'),
      address: 'Head Office',
      contactNumber: '01234567890',
      isAdmin: true
    });

    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createFirstAdmin();