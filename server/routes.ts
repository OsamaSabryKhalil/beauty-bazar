import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission route
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
