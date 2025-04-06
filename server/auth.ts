
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function createUser(email: string, password: string, role: string = "customer", username: string = "") {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // If username is not provided, use email as username
  const finalUsername = username || email.split('@')[0];
  
  return prisma.user.create({
    data: {
      email,
      username: finalUsername,
      password: hashedPassword,
      role,
    },
  });
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid password');
  
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
  return { token, user: { ...user, password: undefined } };
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export async function seedAdmin() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  
  try {
    await createUser(adminEmail, adminPassword, "admin", "admin");
    console.log('Admin user created successfully');
  } catch (error) {
    console.log('Admin user already exists');
  }
}
