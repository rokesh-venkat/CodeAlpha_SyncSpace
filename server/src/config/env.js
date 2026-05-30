import dotenv from 'dotenv';

dotenv.config();

// Support both MONGO_URI and MONGODB_URI for flexibility
export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || ''
};