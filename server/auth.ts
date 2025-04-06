
import { PrismaClient, User, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function createUser(email: string, password: string, role: Role = Role.USER) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
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
  const adminEmail = 'admin@kira.com';
  const adminPassword = 'admin123';
  
  try {
    await createUser(adminEmail, adminPassword, Role.ADMIN);
    console.log('Admin user created successfully');
  } catch (error) {
    console.log('Admin user already exists');
  }
}
