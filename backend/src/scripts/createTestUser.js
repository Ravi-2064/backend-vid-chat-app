import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const testUser = {
      email: 'test@example.com',
      password: 'Test123!',
      fullName: 'Test User',
      nativeLanguage: 'english',
      learningLanguage: 'spanish',
      profilePic: 'https://avatar.iran.liara.run/public/1.png',
      bio: 'Test user for development',
      location: 'Test Location'
    };

    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Hash the password before creating the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);
    testUser.password = hashedPassword;

    const user = await User.create(testUser);
    console.log('Test user created successfully:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser(); 