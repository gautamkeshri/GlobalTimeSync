import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTimezoneSchema, insertTeamSchema } from "@shared/schema";
import { setupWebSocket } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { firebaseUid, email, displayName, photoURL } = req.body;
      
      // Verify Firebase token (simplified for demo)
      const user = await storage.createOrUpdateUser({
        firebaseUid,
        email,
        displayName,
        photoURL,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Guest user endpoint for when Firebase is not configured
  app.post("/api/auth/guest", async (req, res) => {
    try {
      const guestId = `guest_${Date.now()}`;
      const user = await storage.createOrUpdateUser({
        firebaseUid: guestId,
        email: "guest@example.com",
        displayName: "Guest User",
        photoURL: null,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ error: "Guest login failed" });
    }
  });

  // Timezone routes
  app.get("/api/timezones", async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const timezones = await storage.getUserTimezones(parseInt(userId));
      res.json(timezones);
    } catch (error) {
      console.error("Get timezones error:", error);
      res.status(500).json({ error: "Failed to fetch timezones" });
    }
  });

  app.post("/api/timezones", async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validatedData = insertTimezoneSchema.parse({
        ...req.body,
        userId: parseInt(userId),
      });
      
      const timezone = await storage.createTimezone(validatedData);
      res.json(timezone);
    } catch (error) {
      console.error("Create timezone error:", error);
      res.status(500).json({ error: "Failed to create timezone" });
    }
  });

  app.delete("/api/timezones/:id", async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteTimezone(id, parseInt(userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete timezone error:", error);
      res.status(500).json({ error: "Failed to delete timezone" });
    }
  });

  app.patch("/api/timezones/:id/primary", async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      await storage.setPrimaryTimezone(id, parseInt(userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Set primary timezone error:", error);
      res.status(500).json({ error: "Failed to set primary timezone" });
    }
  });

  // Team routes
  app.post("/api/teams", async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const shareId = Math.random().toString(36).substring(2, 15);
      const validatedData = insertTeamSchema.parse({
        ...req.body,
        ownerId: parseInt(userId),
        shareId,
      });
      
      const team = await storage.createTeam(validatedData);
      res.json(team);
    } catch (error) {
      console.error("Create team error:", error);
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.get("/api/teams/shared/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;
      const team = await storage.getTeamByShareId(shareId);
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      console.error("Get shared team error:", error);
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  const httpServer = createServer(app);
  // WebSocket setup temporarily disabled to avoid port conflicts
  // setupWebSocket(httpServer);

  return httpServer;
}
