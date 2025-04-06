import { PrismaClient, User, Product } from '@prisma/client';
// Define types for the database models
type Contact = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: Date;
}

type Order = {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: Date;
}

// Define types that match our Prisma models for insertion/updates
export type InsertUser = Omit<User, 'id' | 'createdAt'>;
export type InsertProduct = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock?: boolean;
  quantity?: number;
};
export type InsertContact = Omit<Contact, 'id' | 'created_at'>;
export type InsertOrder = {
  user_id: number;
  status?: string;
  total_amount: number;
};
export type InsertOrderItem = {
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
};

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Contact methods
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

// Memory Storage implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  userCurrentId: number;
  contactCurrentId: number;
  productCurrentId: number;
  orderCurrentId: number;
  orderItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
    this.productCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "adminpassword", // In a real app, this would be hashed
      email: "admin@kira.com",
      role: "admin",
      firstName: "Admin" as string | null,
      lastName: "User" as string | null
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    
    // Ensure required fields have values
    const userWithDefaults = {
      ...insertUser,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      role: insertUser.role ?? "customer" as const,
    };
    
    const user: User = { ...userWithDefaults, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      ...userData 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Contact methods
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactCurrentId++;
    const createdAt = new Date();
    const contact: Contact = { ...insertContact, id, createdAt };
    this.contacts.set(id, contact);
    return contact;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    // Ensure required fields have values
    const productWithDefaults = {
      ...insertProduct,
      inStock: insertProduct.inStock ?? true,
      quantity: insertProduct.quantity ?? 0
    };
    
    const product: Product = { ...productWithDefaults, id, createdAt, updatedAt };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = { 
      ...product, 
      ...productUpdate, 
      updatedAt: new Date() 
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    // Ensure required fields have values
    const orderWithDefaults = {
      ...insertOrder,
      status: insertOrder.status ?? "pending" as const
    };
    
    const order: Order = { ...orderWithDefaults, id, createdAt, updatedAt };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      status: status as any,
      updatedAt: new Date()
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const createdAt = new Date();
    const orderItem: OrderItem = { ...insertOrderItem, id, createdAt };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
}

/**
 * PostgreSQL implementation of the storage interface using Prisma
 */
export class DbStorage implements IStorage {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    console.log('Prisma database connection initialized');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { username }
      });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: user as any
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: userData as any
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Contact methods
  async createContact(contact: InsertContact): Promise<Contact> {
    try {
      const result = await this.prisma.$queryRaw`
        INSERT INTO contacts (name, email, message)
        VALUES (${contact.name}, ${contact.email}, ${contact.message})
        RETURNING *
      `;
      return result[0] as Contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany();
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id }
      });
      return product || undefined;
    } catch (error) {
      console.error('Error getting product:', error);
      return undefined;
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          inStock: product.inStock !== undefined ? product.inStock : true,
          quantity: product.quantity !== undefined ? product.quantity : 0
        }
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: product as any
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    try {
      const results = await this.prisma.$queryRaw`SELECT * FROM orders`;
      return results as Order[];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const results = await this.prisma.$queryRaw`SELECT * FROM orders WHERE id = ${id}`;
      return results[0] as Order | undefined;
    } catch (error) {
      console.error('Error getting order:', error);
      return undefined;
    }
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      const results = await this.prisma.$queryRaw`SELECT * FROM orders WHERE user_id = ${userId}`;
      return results as Order[];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const result = await this.prisma.$queryRaw`
        INSERT INTO orders (user_id, status, total_amount)
        VALUES (${order.user_id}, ${order.status || 'pending'}, ${order.total_amount})
        RETURNING *
      `;
      return result[0] as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      const result = await this.prisma.$queryRaw`
        UPDATE orders SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      return undefined;
    }
  }

  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      const results = await this.prisma.$queryRaw`SELECT * FROM order_items WHERE order_id = ${orderId}`;
      return results as OrderItem[];
    } catch (error) {
      console.error('Error getting order items:', error);
      return [];
    }
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    try {
      const result = await this.prisma.$queryRaw`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${orderItem.order_id}, ${orderItem.product_id}, ${orderItem.quantity}, ${orderItem.price})
        RETURNING *
      `;
      return result[0] as OrderItem;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }
}

// Use the PostgreSQL implementation for production
export const storage = new DbStorage();
