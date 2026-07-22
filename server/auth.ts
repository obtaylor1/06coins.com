import bcrypt from "bcryptjs";
import MySQLStoreFactory from "express-mysql-session";
import session from "express-session";
import { rateLimit } from "express-rate-limit";
import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { storage } from "./storage.js";
import { db } from "../db/index.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData { adminUserId?: string }
}

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
});

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  app.set("trust proxy", 1);
  const MySQLStore = MySQLStoreFactory(session);
  const databaseUrl = new URL(process.env.DATABASE_URL!);
  app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new MySQLStore({
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 3306),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      database: databaseUrl.pathname.slice(1),
      createDatabaseTable: true,
      schema: { tableName: "sessions", columnNames: { session_id: "sid", expires: "expire", data: "sess" } },
      expiration: 7 * 24 * 60 * 60 * 1000,
    }),
    name: "06coins.admin",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // "auto" keeps the cookie HTTPS-only behind the production proxy while
      // still allowing local testing at http://localhost.
      secure: "auto",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });

  app.get("/api/auth/status", async (_req, res) => {
    res.json({ setupRequired: !(await storage.hasAdmin()) });
  });

  app.post("/api/auth/setup", authLimiter, async (req, res) => {
    if (await storage.hasAdmin()) return res.status(409).json({ message: "Administrator setup is already complete" });
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and a password of at least 12 characters" });
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await storage.createAdmin({ ...parsed.data, passwordHash });
    req.session.adminUserId = user.id;
    res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin });
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    const parsed = credentialsSchema.pick({ email: true, password: true }).safeParse(req.body);
    if (!parsed.success) return res.status(401).json({ message: "Email or password is incorrect" });
    const user = await storage.getUserByEmail(parsed.data.email);
    if (!user?.passwordHash || user.isAdmin !== 1 || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    req.session.adminUserId = user.id;
    res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin });
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.session.destroy((error) => error ? next(error) : res.status(204).end());
  });

  app.patch("/api/auth/password", authLimiter, async (req, res) => {
    if (!req.session.adminUserId) return res.status(401).json({ message: "Unauthorized" });
    const parsed = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(12).max(128) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "The new password must contain at least 12 characters" });
    const user = await storage.getUser(req.session.adminUserId);
    if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));
    res.json({ updated: true });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.adminUserId) return res.status(401).json({ message: "Unauthorized" });
  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.session.adminUserId ? await storage.getUser(req.session.adminUserId) : undefined;
  if (!user || user.isAdmin !== 1) return res.status(403).json({ message: "Administrator access required" });
  res.locals.adminUser = user;
  next();
};
