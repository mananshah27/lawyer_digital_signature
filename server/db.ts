import dotenv from "dotenv";
dotenv.config({ path: ".env" }); 

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";

// Configure WebSocket for different environments
// In Vercel Edge/Serverless, we might not need ws package
if (typeof globalThis.WebSocket === 'undefined') {
  // Node.js environment - use ws package
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
} else {
  // Browser/Edge environment - use native WebSocket
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

// Only log in development to avoid cluttering serverless logs
if (process.env.NODE_ENV !== 'production') {
  console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "✓" : "✗");
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
