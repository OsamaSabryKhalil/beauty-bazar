import type { Express, Request as ExpressRequest, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { SessionData } from "express-session";
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createUser, login, verifyToken } from './auth'; // Import authentication functions

// Extend Request to include session and user (for JWT)
interface Request extends ExpressRequest {
  session: SessionData & {
    userId?: number;
    destroy: (callback: (err?: any) => void) => void;
  };
  user?: any; // Add user property for JWT authentication
}
import { storage } from "./storage";
import {
  contactSchema,
  insertUserSchema,
  loginUserSchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

// Authentication middleware (JWT-based)
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Admin middleware
const adminMiddleware = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};


// Auth routes
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await createUser(email, password);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Product routes
router.get('/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Order routes (adapted to use Prisma and JWT auth)
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const orders = await prisma.order.findMany();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
      const orders = await prisma.order.findMany({ where: { userId: req.user.id } });
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
          return { ...order, items };
        })
      );
      res.json({ orders: ordersWithItems });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post('/orders', authMiddleware, async (req, res) => {
    try {
      const orderData = { ...req.body, userId: req.user.id };
      const newOrder = await prisma.order.create({ data: orderData });
      if (req.body.orderItems) {
        const orderItems = await Promise.all(
          req.body.orderItems.map(async (item: any) => {
            return prisma.orderItem.create({ data: { ...item, orderId: newOrder.id } });
          })
        );
      }
      res.json(newOrder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  router.patch('/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(req.params.id) },
        data: { status },
      });
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


//Contact Route
router.post('/contact', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const contactData = contactSchema.parse(req.body);

      // Store the contact information
      const savedContact = await storage.createContact(contactData);

      res.status(201).json({
        message: 'Thank you for your message. We will get back to you soon.',
        contact: savedContact
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Invalid form data',
          errors: error.errors 
        });
      } else {
        console.error('Error saving contact:', error);
        res.status(500).json({ 
          message: 'Something went wrong. Please try again later.' 
        });
      }
    }
  });


export async function registerRoutes(app: Express): Promise<Server> {
  app.use(router); // Use the new router
  const httpServer = createServer(app);
  return httpServer;
}