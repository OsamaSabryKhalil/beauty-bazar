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
    // Create a registration schema
    const registrationSchema = z.object({
      username: z.string().min(3, "Username must be at least 3 characters"),
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    });
    
    // Validate request body
    const userData = registrationSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user with default role (customer)
    const newUser = await storage.createUser({
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      role: "customer",
      firstName: userData.firstName || null,
      lastName: userData.lastName || null
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
      total_amount: req.body.total_amount || req.body.totalAmount || 0
    };
    
    // Create order
    const newOrder = await storage.createOrder(orderData);
    
    // Process order items if provided
    if (req.body.items && Array.isArray(req.body.items)) {
      await Promise.all(
        req.body.items.map(async (item: any) => {
          const orderItemData = {
            order_id: newOrder.id,
            product_id: item.product_id || item.productId, // Support both formats
            quantity: item.quantity,
            price: item.price
          };
          
          console.log('Creating order item:', orderItemData);
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

// Admin Dashboard API
router.get('/api/admin/dashboard', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    // Fetch all needed data for the dashboard
    const [users, orders, products] = await Promise.all([
      storage.getAllUsers(),
      storage.getOrders(),
      storage.getProducts()
    ]);

    // Calculate total revenue from orders
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    
    // Calculate new users in the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = users.filter(user => new Date(user.createdAt) > thirtyDaysAgo).length;
    
    // Get recent orders (latest 5)
    const recentOrders = await Promise.all(
      orders.slice(0, 5).map(async (order) => {
        const user = await storage.getUser(order.user_id);
        return {
          id: order.id,
          customer: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown',
          date: new Date(order.created_at).toISOString().split('T')[0],
          status: order.status,


// Admin Users Route
router.get('/api/admin/users', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    // Return users without passwords
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


          total: order.total_amount
        };
      })
    );
    
    // Create product sales data
    // In a real system, this would come from order_items, but for now we'll create estimates
    const orderItems = await Promise.all(
      orders.map(order => storage.getOrderItems(order.id))
    ).then(items => items.flat());
    
    // Group order items by product and calculate sales and revenue
    const productSalesMap = new Map();
    
    for (const item of orderItems) {
      const product = await storage.getProduct(item.product_id);
      if (product) {
        const productId = item.product_id;
        if (!productSalesMap.has(productId)) {
          productSalesMap.set(productId, {
            id: productId,
            name: product.name,
            sales: 0,
            revenue: 0
          });
        }
        
        const productData = productSalesMap.get(productId);
        productData.sales += item.quantity;
        productData.revenue += item.quantity * item.price;
      }
    }
    
    // Convert to array and sort by sales
    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    
    // Create category sales data
    const categoryMap = new Map();
    
    for (const product of products) {
      const category = product.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, 0);
      }
      
      // For each product, look up its sales in orderItems
      const productSales = orderItems
        .filter(item => item.product_id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      categoryMap.set(category, categoryMap.get(category) + productSales);
    }
    
    // Format category data for the pie chart
    const totalSales = Array.from(categoryMap.values()).reduce((sum, value) => sum + value, 0) || 1; // Avoid division by zero
    const salesByCategory = Array.from(categoryMap.entries())
      .map(([name, sales]) => ({
        name,
        value: Math.round((sales as number / totalSales) * 100)
      }));
    
    // Generate monthly revenue data
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group orders by month
    const monthlyRevenueMap = new Map();
    
    for (const month of months) {
      monthlyRevenueMap.set(month, 0);
    }
    
    for (const order of orders) {
      const orderDate = new Date(order.created_at);
      if (orderDate.getFullYear() === currentYear) {
        const month = months[orderDate.getMonth()];
        monthlyRevenueMap.set(month, (monthlyRevenueMap.get(month) || 0) + order.total_amount);
      }
    }
    
    const revenueByMonth = Array.from(monthlyRevenueMap.entries())
      .map(([name, revenue]) => ({ name, revenue }));
    
    // Generate user growth data - for simplicity, we'll distribute evenly through the year
    const userGrowth = months.map((name, index) => ({
      name,
      users: Math.ceil(users.length * ((index + 1) / 12))
    }));
    
    // Calculate growth percentages (just estimates for now)
    const revenueGrowth = orders.length > 0 ? 12.5 : 0;
    const orderGrowth = orders.length > 0 ? 8.3 : 0;

    // Return the dashboard data
    res.json({
      totalUsers: users.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalRevenue,
      recentOrders,
      topSellingProducts,
      salesByCategory,
      revenueByMonth,
      userGrowth,
      newUsers,
      revenueGrowth,
      orderGrowth
    });
  } catch (error) {
    const err = error as Error;
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard data', message: err.message });
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(router); // Use the new router
  const httpServer = createServer(app);
  return httpServer;
}