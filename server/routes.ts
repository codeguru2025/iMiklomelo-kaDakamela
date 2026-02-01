import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAttendeeSchema, insertCompanySchema, insertReservationSchema,
  insertAnnouncementSchema
} from "@shared/schema";
import { z } from "zod";
import { initializePayment, checkPaymentStatus, isPaymentComplete } from "./paynow";
import { randomUUID } from "crypto";

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

  // Payments
  app.post("/api/payments/initiate", async (req, res) => {
    try {
      const { reservationId, attendeeId, email, amount, paymentType } = req.body;
      
      if (!email || !amount) {
        res.status(400).json({ error: "Email and amount are required" });
        return;
      }

      const reference = `DK-${Date.now()}-${randomUUID().slice(0, 8)}`;
      
      const paynowResponse = await initializePayment({
        reference,
        email,
        amount: parseFloat(amount),
        additionalInfo: `Imiklomelo Ka Dakamela - ${paymentType || "deposit"}`,
      });

      if (paynowResponse.status === "Ok" && paynowResponse.browserUrl) {
        const payment = await storage.createPayment({
          reservationId: reservationId || null,
          attendeeId: attendeeId || null,
          amount: amount.toString(),
          currency: "USD",
          paynowReference: reference,
          pollUrl: paynowResponse.pollUrl || null,
          status: "pending",
          paymentType: paymentType || "deposit",
        });

        res.json({
          success: true,
          paymentId: payment.id,
          redirectUrl: paynowResponse.browserUrl,
          reference,
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: paynowResponse.error || "Payment initialization failed" 
        });
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  });

  app.get("/api/payments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        res.status(404).json({ error: "Payment not found" });
        return;
      }

      if (payment.pollUrl && payment.status === "pending") {
        const status = await checkPaymentStatus(payment.pollUrl);
        
        if (isPaymentComplete(status.status)) {
          await storage.updatePayment(id, { 
            status: "paid",
            paidAt: new Date(),
          });
          
          if (payment.reservationId) {
            await storage.updateReservation(payment.reservationId, {
              depositStatus: "paid",
            });
          }
        }
        
        res.json({ ...payment, paynowStatus: status.status });
      } else {
        res.json(payment);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });

  app.post("/api/payments/callback", async (req, res) => {
    try {
      const { reference, status } = req.body;
      
      if (reference) {
        const payment = await storage.getPaymentByReference(reference);
        
        if (payment && isPaymentComplete(status)) {
          await storage.updatePayment(payment.id, {
            status: "paid",
            paidAt: new Date(),
          });
          
          if (payment.reservationId) {
            await storage.updateReservation(payment.reservationId, {
              depositStatus: "paid",
            });
          }
        }
      }
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("Payment callback error:", error);
      res.status(200).send("OK");
    }
  });

  // Analytics (Admin)
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const attendees = await storage.getAttendees();
      const reservations = await storage.getReservations();
      const payments = await storage.getPayments();
      const camps = await storage.getCamps();

      const analytics = {
        totalAttendees: attendees.length,
        totalReservations: reservations.length,
        paidReservations: reservations.filter(r => r.depositStatus === "paid").length,
        pendingReservations: reservations.filter(r => r.depositStatus === "pending").length,
        totalRevenue: payments
          .filter(p => p.status === "paid")
          .reduce((sum, p) => sum + parseFloat(p.amount), 0),
        demographics: {
          byCountry: attendees.reduce((acc, a) => {
            acc[a.country] = (acc[a.country] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byAttendanceType: attendees.reduce((acc, a) => {
            acc[a.attendanceType] = (acc[a.attendanceType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byGender: attendees.reduce((acc, a) => {
            if (a.gender) acc[a.gender] = (acc[a.gender] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byAgeRange: attendees.reduce((acc, a) => {
            if (a.ageRange) acc[a.ageRange] = (acc[a.ageRange] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          firstTimeAttendees: attendees.filter(a => a.isFirstTime).length,
          returningAttendees: attendees.filter(a => !a.isFirstTime).length,
        },
        campOccupancy: camps.map(c => ({
          name: c.name,
          capacity: c.capacity,
          booked: reservations.filter(r => r.campId === c.id).length,
        })),
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Export attendees (Admin)
  app.get("/api/admin/export/attendees", async (req, res) => {
    try {
      const attendees = await storage.getAttendees();
      
      const csvHeaders = [
        "Full Name", "Email", "Phone", "Gender", "Age Range", "Profession",
        "Attendance Type", "Country", "City", "First Time", "Needs Accommodation",
        "Marketing Consent", "Created At"
      ].join(",");
      
      const csvRows = attendees.map(a => [
        `"${a.fullName}"`,
        `"${a.email}"`,
        `"${a.phone || ""}"`,
        `"${a.gender || ""}"`,
        `"${a.ageRange || ""}"`,
        `"${a.profession || ""}"`,
        `"${a.attendanceType}"`,
        `"${a.country}"`,
        `"${a.city}"`,
        a.isFirstTime ? "Yes" : "No",
        a.needsAccommodation ? "Yes" : "No",
        a.marketingConsent ? "Yes" : "No",
        `"${a.createdAt.toISOString()}"`,
      ].join(","));
      
      const csv = [csvHeaders, ...csvRows].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=attendees.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export attendees" });
    }
  });

  return httpServer;
}
