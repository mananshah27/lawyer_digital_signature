import type { VercelRequest, VercelResponse } from "@vercel/node";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all origins in production
app.use(cors({
  origin: true,
  credentials: true,
}));

// Increase body parser limits for large file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Initialize routes (without starting a server)
let routesInitialized = false;
let initPromise: Promise<void> | null = null;

async function initRoutes() {
  if (!routesInitialized && !initPromise) {
    initPromise = (async () => {
      // Pass false to skip HTTP server creation in serverless mode
      await registerRoutes(app, false);
      routesInitialized = true;
    })();
  }
  if (initPromise) {
    await initPromise;
  }
}

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("API Error:", err);
  res.status(status).json({ message });
});

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initRoutes();
  
  // Convert Vercel request/response to Express compatible format
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        console.error("Express error:", err);
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}
