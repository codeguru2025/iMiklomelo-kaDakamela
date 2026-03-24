import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAttendeeSchema, insertCompanySchema, insertReservationSchema,
  insertAnnouncementSchema, insertPastEventSchema, updatePastEventSchema, 
  insertLiveStreamAccessSchema, insertVideoFeedPostSchema, insertRecordingSchema,
  type Payment
} from "@shared/schema";
import { z } from "zod";
import { initializePayment, checkPaymentStatus, isPaymentComplete, verifyPaynowHash } from "./paynow";
import { randomUUID } from "crypto";
import { setupAuth, registerAuthRoutes, isAdmin } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { sendRegistrationEmail, sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "./email";
import { getPresignedReadUrl, isSpacesConfigured } from "./spaces";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth (MUST be before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);

  // Public asset proxy (handles private Spaces/CDN)
  app.get("/api/assets/:file", async (req, res) => {
    try {
      const file = req.params.file;
      if (!file || file.includes("..") || file.includes("/")) {
        res.status(400).json({ error: "Invalid file" });
        return;
      }

      if (!isSpacesConfigured()) {
        res.status(500).json({
          error: "Spaces not configured",
          required: ["DO_SPACES_KEY", "DO_SPACES_SECRET", "DO_SPACES_BUCKET"],
        });
        return;
      }

      // Files are stored under "attached assets/" in the Spaces bucket
      const objectKey = `attached assets/${file}`;
      const url = await getPresignedReadUrl(objectKey, 60 * 10);
      res.redirect(url);
    } catch (error) {
      console.error("Asset proxy error:", error);
      res.status(500).json({ error: "Failed to load asset" });
    }
  });
  
  // Attendees
  app.get("/api/attendees", async (req, res) => {
    try {
      const attendees = await storage.getAttendees();
      res.json(attendees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendees" });
    }
  });

  app.get("/api/attendees/:id", async (req, res) => {
    try {
      const attendee = await storage.getAttendee(req.params.id);
      if (!attendee) {
        res.status(404).json({ error: "Attendee not found" });
        return;
      }
      res.json(attendee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendee" });
    }
  });

  app.post("/api/attendees", async (req, res) => {
    try {
      const data = insertAttendeeSchema.parse(req.body);
      const attendee = await storage.createAttendee(data);
      
      let ticketCode: string | undefined;
      
      // Auto-generate ticket for non-camping attendees
      if (!data.needsAccommodation) {
        ticketCode = `DK-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
        const qrData = JSON.stringify({ code: ticketCode, v: 1 });
        
        await storage.createTicket({
          ticketCode,
          attendeeId: attendee.id,
          reservationId: null,
          attendanceType: attendee.attendanceType,
          qrData,
          campDetails: null,
          selectedServices: null,
          status: "valid",
        });
      }
      
      // Send registration confirmation email (async, don't block response)
      sendRegistrationEmail({
        fullName: attendee.fullName,
        email: attendee.email,
        attendanceType: attendee.attendanceType,
        needsAccommodation: attendee.needsAccommodation,
        ticketCode,
      }).catch(err => console.error("Email send failed:", err));
      
      res.status(201).json(attendee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        console.error("Attendee creation error:", error);
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
      
      // Send booking confirmation email (async)
      const attendee = await storage.getAttendee(reservation.attendeeId);
      const camp = await storage.getCamp(reservation.campId);
      
      if (attendee && camp) {
        sendBookingConfirmationEmail({
          fullName: attendee.fullName,
          email: attendee.email,
          campName: camp.name,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          totalAmount: reservation.totalAmount,
          depositAmount: reservation.depositAmount,
        }).catch(err => console.error("Booking email send failed:", err));
      }
      
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

  // Create past event (admin)
  app.post("/api/past-events", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const data = insertPastEventSchema.parse(req.body);
      const event = await storage.createPastEvent(data);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
        return;
      }
      console.error("Failed to create past event:", error);
      res.status(500).json({ error: "Failed to create past event" });
    }
  });

  // Update past event (admin)
  app.patch("/api/past-events/:id", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const data = updatePastEventSchema.parse(req.body);
      const event = await storage.updatePastEvent(req.params.id, data);
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
        return;
      }
      console.error("Failed to update past event:", error);
      res.status(500).json({ error: "Failed to update past event" });
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
        additionalInfo: `iMiklomelo kaDakamela Cultural Festival - ${paymentType || "deposit"}`,
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
      const callbackData = req.body;
      const { reference, status } = callbackData;
      
      if (!verifyPaynowHash(callbackData)) {
        console.warn("Invalid Paynow callback hash for reference:", reference);
        res.status(200).send("OK");
        return;
      }
      
      if (reference) {
        const payment = await storage.getPaymentByReference(reference);
        
        if (payment && isPaymentComplete(status)) {
          await storage.updatePayment(payment.id, {
            status: "paid",
            paidAt: new Date(),
          });
          
          let campName: string | undefined;
          if (payment.reservationId) {
            await storage.updateReservation(payment.reservationId, {
              depositStatus: "paid",
            });
            
            // Get camp name for email
            const reservation = await storage.getReservation(payment.reservationId);
            if (reservation) {
              const camp = await storage.getCamp(reservation.campId);
              campName = camp?.name;
            }
          }
          
          // Send payment confirmation email
          if (payment.attendeeId) {
            const attendee = await storage.getAttendee(payment.attendeeId);
            if (attendee) {
              sendPaymentConfirmationEmail({
                fullName: attendee.fullName,
                email: attendee.email,
                amount: payment.amount,
                reference: reference,
                campName,
              }).catch(err => console.error("Payment email send failed:", err));
            }
          }
          
          console.log("Payment confirmed for reference:", reference);
        }
      }
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("Payment callback error:", error);
      res.status(200).send("OK");
    }
  });

  const isAdminRequest = (req: any): boolean => isAdmin(req);

  // Analytics (Admin)
  app.get("/api/admin/analytics", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
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
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
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

  // Tickets - Generate ticket for attendee
  app.post("/api/tickets", async (req, res) => {
    try {
      const { attendeeId, reservationId } = req.body;
      
      const attendee = await storage.getAttendee(attendeeId);
      if (!attendee) {
        res.status(404).json({ error: "Attendee not found" });
        return;
      }

      // Check if ticket already exists
      const existingTicket = await storage.getTicketByAttendee(attendeeId);
      if (existingTicket) {
        res.json(existingTicket);
        return;
      }

      // Generate unique ticket code
      const ticketCode = `DK-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
      
      // QR data contains ticket code only (not personal data)
      const qrData = JSON.stringify({ code: ticketCode, v: 1 });

      let campDetails = null;
      let selectedServices = null;
      if (reservationId) {
        const reservation = await storage.getReservation(reservationId);
        if (reservation) {
          const camp = await storage.getCamp(reservation.campId);
          campDetails = camp ? camp.name : null;
          selectedServices = reservation.selectedServices;
        }
      }

      const ticket = await storage.createTicket({
        ticketCode,
        attendeeId,
        reservationId: reservationId || null,
        attendanceType: attendee.attendanceType,
        qrData,
        campDetails,
        selectedServices,
        status: "valid",
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error("Ticket creation error:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  // Get ticket by code (for QR scanning) - admin only
  app.get("/api/tickets/scan/:code", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized - admin access required" });
      return;
    }
    try {
      const ticket = await storage.getTicketByCode(req.params.code);
      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      const attendee = await storage.getAttendee(ticket.attendeeId);
      
      // Return limited data needed for scanning
      res.json({
        ticket: {
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          status: ticket.status,
          attendanceType: ticket.attendanceType,
        },
        attendee: attendee ? {
          fullName: attendee.fullName,
          attendanceType: attendee.attendanceType,
        } : null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to scan ticket" });
    }
  });

  // Lookup ticket with full details for scanner (admin only)
  app.get("/api/tickets/lookup/:code", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized - admin access required" });
      return;
    }
    try {
      const ticket = await storage.getTicketByCode(req.params.code);
      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      const attendee = await storage.getAttendee(ticket.attendeeId);
      if (!attendee) {
        res.status(404).json({ error: "Attendee not found" });
        return;
      }

      let reservation = null;
      if (ticket.reservationId) {
        reservation = await storage.getReservation(ticket.reservationId);
      }

      res.json({
        ticket: {
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          status: ticket.status,
          attendanceType: ticket.attendanceType,
          campDetails: ticket.campDetails,
          selectedServices: ticket.selectedServices,
          usedAt: ticket.scannedAt,
        },
        attendee: {
          id: attendee.id,
          fullName: attendee.fullName,
          email: attendee.email,
          phone: attendee.phone,
          attendanceType: attendee.attendanceType,
          needsAccommodation: attendee.needsAccommodation,
        },
        reservation: reservation ? {
          id: reservation.id,
          campId: reservation.campId,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          depositStatus: reservation.depositStatus,
        } : null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup ticket" });
    }
  });

  // Mark ticket as used (admin only)
  app.post("/api/tickets/:id/mark-used", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized - admin access required" });
      return;
    }
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      if (ticket.status !== "valid") {
        res.status(400).json({ error: `Ticket is already ${ticket.status}` });
        return;
      }

      const updated = await storage.updateTicket(req.params.id, {
        status: "used",
        scannedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark ticket as used" });
    }
  });

  // Get recent scans for admin
  app.get("/api/admin/tickets/recent-scans", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const tickets = await storage.getRecentScannedTickets(10);
      const results = await Promise.all(tickets.map(async (ticket) => {
        const attendee = await storage.getAttendee(ticket.attendeeId);
        return {
          ticket: {
            id: ticket.id,
            ticketCode: ticket.ticketCode,
            status: ticket.status,
            usedAt: ticket.scannedAt,
          },
          attendee: attendee ? {
            id: attendee.id,
            fullName: attendee.fullName,
            email: attendee.email,
          } : null,
        };
      }));
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent scans" });
    }
  });

  // Payment status lookup for attendees (limited PII exposure, uses email match only)
  app.get("/api/payment-status", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ error: "Search query required" });
        return;
      }

      // Only match by email for security (not phone) - email is harder to guess
      const normalizedQuery = query.toLowerCase().trim();
      if (!normalizedQuery.includes("@")) {
        res.status(400).json({ error: "Please enter a valid email address" });
        return;
      }

      const attendee = await storage.getAttendeeByEmailOrPhone(normalizedQuery);
      if (!attendee) {
        // Generic message to prevent enumeration
        res.status(404).json({ error: "No booking found. Please check your email address." });
        return;
      }

      const ticket = await storage.getTicketByAttendee(attendee.id);
      const reservation = attendee.needsAccommodation 
        ? await storage.getReservationByAttendee(attendee.id) 
        : null;
      
      let campName = "";
      if (reservation) {
        const camp = await storage.getCamp(reservation.campId);
        campName = camp?.name || "Unknown Camp";
      }

      const payments = await storage.getPaymentsByAttendee(attendee.id);

      // Return limited PII - only what's necessary for user to verify their booking
      res.json({
        attendee: {
          id: attendee.id,
          fullName: attendee.fullName,
          email: attendee.email,
          phone: attendee.phone ? attendee.phone.slice(0, 4) + "****" + attendee.phone.slice(-2) : null,
          attendanceType: attendee.attendanceType,
          needsAccommodation: attendee.needsAccommodation,
          registeredAt: attendee.createdAt,
        },
        ticket: ticket ? {
          ticketCode: ticket.ticketCode,
          status: ticket.status,
        } : null,
        reservation: reservation ? {
          id: reservation.id,
          campId: reservation.campId,
          campName,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          totalAmount: reservation.totalAmount,
          depositAmount: reservation.depositAmount,
          depositStatus: reservation.depositStatus,
          depositDeadline: reservation.expiresAt,
          selectedServices: reservation.selectedServices,
        } : null,
        payments: payments.map((p: Payment) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          paymentMethod: p.paymentMethod || "unknown",
          createdAt: p.createdAt,
          completedAt: p.paidAt,
        })),
      });
    } catch (error) {
      console.error("Payment status lookup error:", error);
      res.status(500).json({ error: "Failed to lookup payment status" });
    }
  });

  // Get ticket for attendee
  app.get("/api/tickets/attendee/:attendeeId", async (req, res) => {
    try {
      const ticket = await storage.getTicketByAttendee(req.params.attendeeId);
      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  // Mark ticket as used (for access control)
  app.post("/api/tickets/:id/scan", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      if (ticket.status !== "valid") {
        res.status(400).json({ error: `Ticket is ${ticket.status}` });
        return;
      }

      const updated = await storage.updateTicket(req.params.id, {
        status: "used",
        scannedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to scan ticket" });
    }
  });

  // ========== LIVE STREAMING ROUTES ==========

  // Get stream settings (public)
  app.get("/api/stream/settings", async (req, res) => {
    try {
      const settings = await storage.getStreamSettings();
      if (!settings) {
        res.json({
          streamPrice: "15.00",
          currency: "USD",
          isLive: false,
          streamTitle: "iMiklomelo kaDakamela Cultural Festival 2026 - Live",
          allowVideoFeed: false,
        });
        return;
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream settings" });
    }
  });

  // Update stream settings (admin only)
  app.put("/api/stream/settings", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const settings = await storage.upsertStreamSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stream settings" });
    }
  });

  // Verify stream access code
  app.post("/api/stream/verify-access", async (req, res) => {
    try {
      const { accessCode } = req.body;
      if (!accessCode) {
        res.status(400).json({ error: "Access code required" });
        return;
      }
      const access = await storage.getStreamAccessByCode(accessCode);
      if (!access || access.status !== "active") {
        res.status(401).json({ error: "Invalid or expired access code" });
        return;
      }
      res.json({ email: access.email, fullName: access.fullName });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify access" });
    }
  });

  // Purchase stream access
  app.post("/api/stream/purchase", async (req, res) => {
    try {
      const { fullName, email, phone } = req.body;
      if (!fullName || !email) {
        res.status(400).json({ error: "Name and email required" });
        return;
      }
      
      const settings = await storage.getStreamSettings();
      const price = settings?.streamPrice || "15.00";
      
      const accessCode = randomUUID().substring(0, 8).toUpperCase();
      
      const streamAccess = await storage.createStreamAccess({
        fullName,
        email,
        phone,
        accessCode,
        status: "pending",
      });

      const payment = await initializePayment({
        amount: parseFloat(price),
        email,
        reference: `STREAM-${streamAccess.id}`,
        returnUrl: `${process.env.APP_URL || ''}/live-stream?code=${accessCode}`,
      });

      if (payment.status !== "Ok" || !payment.browserUrl) {
        res.status(500).json({ error: payment.error || "Payment initialization failed" });
        return;
      }

      res.json({ 
        redirectUrl: payment.browserUrl,
        accessCode,
        pollUrl: payment.pollUrl,
      });
    } catch (error) {
      console.error("Stream purchase error:", error);
      res.status(500).json({ error: "Failed to process purchase" });
    }
  });

  // Get all stream access records (admin)
  app.get("/api/stream/access", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const accessList = await storage.getAllStreamAccess();
      res.json(accessList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch access list" });
    }
  });

  // ========== RECORDINGS ROUTES ==========

  app.get("/api/recordings", async (req, res) => {
    try {
      const recordings = await storage.getRecordings();
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recordings" });
    }
  });

  app.post("/api/recordings", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const recording = await storage.createRecording(req.body);
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: "Failed to create recording" });
    }
  });

  app.delete("/api/recordings/:id", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      await storage.deleteRecording(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recording" });
    }
  });

  // ========== VIDEO FEED ROUTES ==========

  // Get approved video posts (public)
  app.get("/api/video-feed", async (req, res) => {
    try {
      const posts = await storage.getApprovedVideoPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video feed" });
    }
  });

  // Get all video posts (admin)
  app.get("/api/video-feed/all", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const posts = await storage.getAllVideoPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video posts" });
    }
  });

  // Submit a video post
  app.post("/api/video-feed", async (req, res) => {
    try {
      const settings = await storage.getStreamSettings();
      if (!settings?.allowVideoFeed) {
        res.status(403).json({ error: "Video feed is not active at this time" });
        return;
      }
      
      const post = await storage.createVideoPost(req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit video" });
    }
  });

  // Approve/reject video post (admin)
  app.put("/api/video-feed/:id/status", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const { status } = req.body;
      const updated = await storage.updateVideoPostStatus(req.params.id, status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update video status" });
    }
  });

  // Like a video post
  app.post("/api/video-feed/:id/like", async (req, res) => {
    try {
      const updated = await storage.likeVideoPost(req.params.id);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to like video" });
    }
  });

  // ========== ADMIN STREAMING ROUTES ==========

  // Get stream settings (admin)
  app.get("/api/admin/stream-settings", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const settings = await storage.getStreamSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream settings" });
    }
  });

  // Update stream settings (admin)
  const updateStreamSettingsSchema = z.object({
    streamUrl: z.string().optional(),
    streamTitle: z.string().optional(),
    isLive: z.boolean().optional(),
    streamPrice: z.string().optional(),
    allowVideoFeed: z.boolean().optional(),
  });
  
  app.put("/api/admin/stream-settings", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const parsed = updateStreamSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid stream settings data" });
        return;
      }
      const settings = await storage.upsertStreamSettings(parsed.data);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stream settings" });
    }
  });

  // Get all video posts (admin)
  app.get("/api/admin/video-posts", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const posts = await storage.getAllVideoPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video posts" });
    }
  });

  // Moderate video post (admin)
  const moderatePostSchema = z.object({
    status: z.enum(["approved", "rejected"]),
  });
  
  app.put("/api/admin/video-posts/:id/moderate", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const parsed = moderatePostSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'" });
        return;
      }
      const updated = await storage.updateVideoPostStatus(req.params.id, parsed.data.status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to moderate video post" });
    }
  });

  // Add recording (admin)
  app.post("/api/admin/recordings", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const parsed = insertRecordingSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid recording data" });
        return;
      }
      const recording = await storage.createRecording(parsed.data);
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: "Failed to create recording" });
    }
  });

  // Delete recording (admin)
  app.delete("/api/admin/recordings/:id", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      await storage.deleteRecording(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recording" });
    }
  });

  // Get stream stats (admin)
  app.get("/api/admin/stream-stats", async (req, res) => {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const accessList = await storage.getAllStreamAccess();
      const settings = await storage.getStreamSettings();
      const totalSubscribers = accessList.filter(a => a.status === "active").length;
      const pricePerAccess = parseFloat(settings?.streamPrice ?? "15.00");
      const totalRevenue = totalSubscribers * pricePerAccess;
      res.json({ totalSubscribers, totalRevenue });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream stats" });
    }
  });

  return httpServer;
}
