import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAttendeeSchema, insertCompanySchema, insertReservationSchema,
  insertAnnouncementSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Attendees
  app.get("/api/attendees", async (req, res) => {
    try {
      const attendees = await storage.getAttendees();
      res.json(attendees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendees" });
    }
  });

  app.post("/api/attendees", async (req, res) => {
    try {
      const data = insertAttendeeSchema.parse(req.body);
      const attendee = await storage.createAttendee(data);
      res.status(201).json(attendee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create attendee" });
      }
    }
  });

  // Camps
  app.get("/api/camps", async (req, res) => {
    try {
      const camps = await storage.getCamps();
      res.json(camps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch camps" });
    }
  });

  // Camp Services
  app.get("/api/camp-services", async (req, res) => {
    try {
      const services = await storage.getCampServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch camp services" });
    }
  });

  // Reservations
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await storage.getReservations();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const data = insertReservationSchema.parse(req.body);
      const reservation = await storage.createReservation(data);
      res.status(201).json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create reservation" });
      }
    }
  });

  app.patch("/api/reservations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const reservation = await storage.updateReservation(id, req.body);
      if (!reservation) {
        res.status(404).json({ error: "Reservation not found" });
        return;
      }
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reservation" });
    }
  });

  // Companies (sponsors & exhibitors)
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.get("/api/sponsors", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      const sponsors = companies.filter(c => 
        (c.role === "sponsor" || c.role === "both") && 
        c.applicationStatus === "approved"
      );
      // Ensure primary sponsor is first
      sponsors.sort((a, b) => {
        if (a.isPrimarySponsor) return -1;
        if (b.isPrimarySponsor) return 1;
        return 0;
      });
      res.json(sponsors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sponsors" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const data = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(data);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create company" });
      }
    }
  });

  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.updateCompany(id, req.body);
      if (!company) {
        res.status(404).json({ error: "Company not found" });
        return;
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  // Past Events
  app.get("/api/past-events", async (req, res) => {
    try {
      const events = await storage.getPastEvents();
      // Fetch awardees for each event
      const eventsWithAwardees = await Promise.all(
        events.map(async (event) => {
          const awardees = await storage.getAwardeesByEvent(event.id);
          return { ...event, awardees };
        })
      );
      res.json(eventsWithAwardees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch past events" });
    }
  });

  app.get("/api/past-events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getPastEvent(id);
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      const awardees = await storage.getAwardeesByEvent(id);
      res.json({ ...event, awardees });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getPublishedAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", async (req, res) => {
    try {
      const data = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement({
        ...data,
        publishedAt: data.isPublished ? new Date() : null,
      });
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create announcement" });
      }
    }
  });

  return httpServer;
}
