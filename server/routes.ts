import type { Express, Request as ExpressRequest, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { SessionData } from "express-session";
import { Router } from 'express';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Extend Request to include session and user (for JWT)
interface Request extends ExpressRequest {
  session: SessionData & {
    userId?: number;
    destroy: (callback: (err?: any) => void) => void;
  };
  user?: {
    userId: number;
    role: string;
  }; // Add user property for JWT authentication
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
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT verification function
function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

// Authentication middleware (JWT-based)
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const decoded = verifyToken(token) as { userId: number; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    const err = error as Error;
    res.status(401).json({ error: 'Unauthorized', message: err.message });
  }
};

// Admin middleware
const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Auth routes
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const userData = loginUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user with default role (customer)
    const newUser = await storage.createUser({
      username: userData.username,
      password: hashedPassword,
      email: `${userData.username}@example.com`, // Using username as email for simplicity
      role: "customer",
      firstName: null,
      lastName: null
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const userData = loginUserSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByUsername(userData.username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(userData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    const { password, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Product routes
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await storage.getProduct(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/products', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const productData = insertProductSchema.parse(req.body);
    const newProduct = await storage.createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid product data', details: error.errors });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

router.put('/products/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = insertProductSchema.partial().parse(req.body);
    
    const updatedProduct = await storage.updateProduct(productId, productData);
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid product data', details: error.errors });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

router.delete('/products/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const deleted = await storage.deleteProduct(productId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Order routes
router.get('/orders', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await storage.getOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user has access (admin or order owner)
    if (req.user?.role !== 'admin' && order.user_id !== req.user?.userId) {
      return res.status(403).json({ error: 'You do not have permission to access this order' });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.get('/my-orders', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const orders = await storage.getUserOrders(req.user.userId);
    
    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        return { ...order, items };
      })
    );
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

router.post('/orders', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Map the data to match our storage interface
    const orderData = {
      user_id: req.user.userId,
      status: req.body.status || "pending",
      total_amount: req.body.totalAmount
    };
    
    // Create order
    const newOrder = await storage.createOrder(orderData);
    
    // Process order items if provided
    if (req.body.items && Array.isArray(req.body.items)) {
      await Promise.all(
        req.body.items.map(async (item: any) => {
          const orderItemData = {
            order_id: newOrder.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
          };
          
          return storage.createOrderItem(orderItemData);
        })
      );
    }
    
    res.status(201).json(newOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid order data', details: error.errors });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

router.patch('/orders/:id/status', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
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

// User profile routes
router.get('/user/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await storage.getUser(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.put('/user/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate request body (partial update)
    const userData = insertUserSchema.partial().omit({ password: true }).parse(req.body);
    
    // Update user
    const updatedUser = await storage.updateUser(req.user.userId, userData);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid user data', details: error.errors });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

router.put('/user/password', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate request body
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
      newPassword: z.string().min(6, "New password must be at least 6 characters"),
    }).parse(req.body);
    
    // Get current user
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await storage.updateUser(req.user.userId, { password: hashedPassword });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});


export async function registerRoutes(app: Express): Promise<Server> {
  app.use(router); // Use the new router
  const httpServer = createServer(app);
  return httpServer;
}