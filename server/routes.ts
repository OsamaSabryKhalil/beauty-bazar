import type { Express, Request as ExpressRequest, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { SessionData } from "express-session";

// Extend Request to include session
interface Request extends ExpressRequest {
  session: SessionData & {
    userId?: number;
    destroy: (callback: (err?: any) => void) => void;
  };
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

// Authentication middleware
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Admin authorization middleware
const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = await storage.getUser(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // === Auth Routes ===
  
  // Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Check if email is already taken
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      
      // In a real app, we would hash the password here
      // const hashedPassword = await bcrypt.hash(userData.password, 10);
      // userData.password = hashedPassword;
      
      const newUser = await storage.createUser(userData);
      
      // Set user session
      req.session!.userId = newUser.id;
      
      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
      }
    }
  });
  
  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // In a real app, we would verify the password hash here
      // const passwordMatch = await bcrypt.compare(loginData.password, user.password);
      const passwordMatch = loginData.password === user.password;
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Set user session
      req.session!.userId = user.id;
      
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid login data', errors: error.errors });
      } else {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Login failed. Please try again.' });
      }
    }
  });
  
  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session!.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user
  app.get('/api/auth/me', authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId as number;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ message: 'Failed to fetch user information' });
    }
  });
  
  // === Product Routes ===
  
  // Get all products
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.status(200).json({ products });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });
  
  // Get single product
  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.status(200).json({ product });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });
  
  // Create product (admin only)
  app.post('/api/products', authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      
      res.status(201).json({
        message: 'Product created successfully',
        product: newProduct
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid product data', errors: error.errors });
      } else {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Failed to create product' });
      }
    }
  });
  
  // Update product (admin only)
  app.put('/api/products/:id', authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.status(200).json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid product data', errors: error.errors });
      } else {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Failed to update product' });
      }
    }
  });
  
  // Delete product (admin only)
  app.delete('/api/products/:id', authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(productId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });
  
  // === Order Routes ===
  
  // Get all orders (admin only)
  app.get('/api/orders', authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      res.status(200).json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });
  
  // Get user orders
  app.get('/api/my-orders', authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId as number;
      const orders = await storage.getUserOrders(userId);
      
      // For each order, get its order items
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return {
            ...order,
            items
          };
        })
      );
      
      res.status(200).json({ orders: ordersWithItems });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });
  
  // Create order
  app.post('/api/orders', authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId as number;
      
      // Parse order data but we'll set userId from the session
      const orderData = insertOrderSchema.omit({ userId: true }).parse(req.body);
      
      // Create the order with the authenticated user's ID
      const newOrder = await storage.createOrder({
        ...orderData,
        userId
      });
      
      // Parse and create order items if provided
      const orderItems = req.body.orderItems || [];
      if (Array.isArray(orderItems) && orderItems.length > 0) {
        for (const item of orderItems) {
          const orderItemData = insertOrderItemSchema.omit({ orderId: true }).parse(item);
          await storage.createOrderItem({
            ...orderItemData,
            orderId: newOrder.id
          });
        }
      }
      
      res.status(201).json({
        message: 'Order created successfully',
        order: newOrder
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid order data', errors: error.errors });
      } else {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create order' });
      }
    }
  });
  
  // Update order status (admin only)
  app.patch('/api/orders/:id/status', authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.status(200).json({
        message: 'Order status updated successfully',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });
  
  // === Contact Form Route ===
  
  // Contact form submission
  app.post('/api/contact', async (req: Request, res: Response) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
