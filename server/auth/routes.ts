import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated, isAdmin, isSuperuser } from "./auth";

export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", async (req: any, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // List all users (superuser only)
  app.get("/api/admin/users", async (req: any, res) => {
    if (!isSuperuser(req)) {
      return res.status(403).json({ message: "Forbidden — superuser only" });
    }
    try {
      const users = await authStorage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user role (superuser only)
  app.put("/api/admin/users/:id/role", async (req: any, res) => {
    if (!isSuperuser(req)) {
      return res.status(403).json({ message: "Forbidden — superuser only" });
    }
    try {
      const { role } = req.body;
      if (!["public", "admin"].includes(role)) {
        return res.status(400).json({ message: "Role must be 'public' or 'admin'" });
      }
      const user = await authStorage.updateUserRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
}
