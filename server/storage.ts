import { 
  type User, type InsertUser, 
  type Contact, type InsertContact,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem
} from "@shared/schema";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

// Import necessary modules for PostgreSQL implementation
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
// Import schema tables for database operations
import { 
  users, products, orders, orderItems, contacts 
} from '@shared/schema';

/**
 * PostgreSQL implementation of the storage interface
 */
export class DbStorage implements IStorage {
  private db: any;

  constructor() {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const results = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return results[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const results = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      return results[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const results = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
      return results[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const results = await this.db.insert(users).values(user).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Contact methods
  async createContact(contact: InsertContact): Promise<Contact> {
    try {
      const results = await this.db.insert(contacts).values(contact).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    try {
      return await this.db.select().from(products);
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const results = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
      return results[0];
    } catch (error) {
      console.error('Error getting product:', error);
      return undefined;
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      const results = await this.db.insert(products).values(product).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      // Create update object with correct typing for updatedAt
      const updateData = { ...product } as any;
      updateData.updatedAt = new Date();
      
      const results = await this.db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const results = await this.db
        .delete(products)
        .where(eq(products.id, id))
        .returning({ id: products.id });
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    try {
      return await this.db.select().from(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const results = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
      return results[0];
    } catch (error) {
      console.error('Error getting order:', error);
      return undefined;
    }
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      return await this.db.select().from(orders).where(eq(orders.userId, userId));
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const results = await this.db.insert(orders).values(order).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      // Create update object with correct typing
      const updateData = { 
        status: status as any, 
        updatedAt: new Date() 
      };
      
      const results = await this.db
        .update(orders)
        .set(updateData)
        .where(eq(orders.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating order status:', error);
      return undefined;
    }
  }

  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      return await this.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));
    } catch (error) {
      console.error('Error getting order items:', error);
      return [];
    }
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    try {
      const results = await this.db.insert(orderItems).values(orderItem).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }
}

// Use the PostgreSQL implementation for production
export const storage = new DbStorage();
