import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { setupVite, serveStatic, log } from "./vite";
import { seedAdmin } from "./auth";
import { Router } from 'express';
import { createServer, type Server } from "http";

// Initialize session store
const MemoryStoreSession = MemoryStore(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "kira-beauty-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // Clear expired sessions every 24h
    }),
  })
);

// Add session types to express request
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

const router = Router();

async function registerRoutes(app: express.Express): Promise<Server> {
  app.use('/api', router);
  const httpServer = createServer(app);
  return httpServer;
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Configure Vite in development mode
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Catch all routes and forward to Vite/React
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
    } else {
      if (app.get("env") === "development") {
        setupVite(app, server).then(() => next());
      } else {
        serveStatic(app);
        next();
      }
    }
  });

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  seedAdmin().catch(console.error);
})();


// Placeholder files - these would need to be implemented in a real application
// ./auth.ts
export const seedAdmin = async () => {
    console.log("Seeding admin user...");
    // Add your database seeding logic here
};

// ./routes.ts has been moved to a separate file

// ./vite.ts
export const setupVite = async (app: any, server: any) => {
    // Add your vite setup logic here
    return;
};

export const serveStatic = (app: any) => {
    // Add your static serving logic here
    return;
};

export const log = (message: string) => {
    console.log(message);
};