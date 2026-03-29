import { 
  attendees, camps, campServices, reservations, payments,
  companies, pastEvents, awardees, mediaAssets, announcements, auditLogs, tickets,
  liveStreamAccess, videoFeedPosts, streamSettings, recordings,
  type Attendee, type InsertAttendee,
  type Camp, type InsertCamp, type CampService, type InsertCampService,
  type Reservation, type InsertReservation, type Payment, type InsertPayment,
  type Company, type InsertCompany, type PastEvent, type InsertPastEvent,
  type Awardee, type InsertAwardee, type MediaAsset, type InsertMediaAsset,
  type Announcement, type InsertAnnouncement, type Ticket, type InsertTicket,
  type LiveStreamAccess, type InsertLiveStreamAccess, type VideoFeedPost, type InsertVideoFeedPost,
  type StreamSettings, type InsertStreamSettings, type Recording, type InsertRecording
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, sql } from "drizzle-orm";

export interface IStorage {
  // Attendees
  getAttendees(): Promise<Attendee[]>;
  getAttendee(id: string): Promise<Attendee | undefined>;
  createAttendee(attendee: InsertAttendee): Promise<Attendee>;

  // Camps
  getCamps(): Promise<Camp[]>;
  getCamp(id: string): Promise<Camp | undefined>;
  createCamp(camp: InsertCamp): Promise<Camp>;

  // Camp Services
  getCampServices(): Promise<CampService[]>;
  getCampService(id: string): Promise<CampService | undefined>;
  createCampService(service: InsertCampService): Promise<CampService>;

  // Reservations
  getReservations(): Promise<Reservation[]>;
  getReservation(id: string): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: string, data: Partial<Reservation>): Promise<Reservation | undefined>;

  // Payments
  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByReference(reference: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined>;

  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, data: Partial<Company>): Promise<Company | undefined>;

  // Past Events
  getPastEvents(): Promise<PastEvent[]>;
  getPastEvent(id: string): Promise<PastEvent | undefined>;
  createPastEvent(event: InsertPastEvent): Promise<PastEvent>;
  updatePastEvent(id: string, data: { year?: number; edition?: string; title?: string; summary?: string; imageUrl?: string | null }): Promise<PastEvent | undefined>;

  // Awardees
  getAwardees(): Promise<Awardee[]>;
  getAwardeesByEvent(pastEventId: string): Promise<Awardee[]>;
  createAwardee(awardee: InsertAwardee): Promise<Awardee>;

  // Media Assets
  getMediaAssets(): Promise<MediaAsset[]>;
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getPublishedAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;

  // Tickets
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  getTicketByCode(ticketCode: string): Promise<Ticket | undefined>;
  getTicketByAttendee(attendeeId: string): Promise<Ticket | undefined>;
  getRecentScannedTickets(limit: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket | undefined>;

  // Additional lookup methods
  getAttendeeByEmailOrPhone(query: string): Promise<Attendee | undefined>;
  getReservationByAttendee(attendeeId: string): Promise<Reservation | undefined>;
  getPaymentsByAttendee(attendeeId: string): Promise<Payment[]>;

  // Stream Settings
  getStreamSettings(): Promise<StreamSettings | undefined>;
  upsertStreamSettings(data: Partial<InsertStreamSettings>): Promise<StreamSettings>;

  // Stream Access
  createStreamAccess(data: InsertLiveStreamAccess): Promise<LiveStreamAccess>;
  getStreamAccessByCode(accessCode: string): Promise<LiveStreamAccess | undefined>;
  updateStreamAccess(id: string, data: Partial<LiveStreamAccess>): Promise<LiveStreamAccess | undefined>;
  getAllStreamAccess(): Promise<LiveStreamAccess[]>;

  // Recordings
  getRecordings(): Promise<Recording[]>;
  createRecording(data: InsertRecording): Promise<Recording>;
  deleteRecording(id: string): Promise<void>;

  // Video Feed
  getApprovedVideoPosts(): Promise<VideoFeedPost[]>;
  getAllVideoPosts(): Promise<VideoFeedPost[]>;
  createVideoPost(data: InsertVideoFeedPost): Promise<VideoFeedPost>;
  updateVideoPostStatus(id: string, status: string): Promise<VideoFeedPost | undefined>;
  likeVideoPost(id: string): Promise<VideoFeedPost | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Attendees
  async getAttendees(): Promise<Attendee[]> {
    return db.select().from(attendees).orderBy(desc(attendees.createdAt));
  }

  async getAttendee(id: string): Promise<Attendee | undefined> {
    const [attendee] = await db.select().from(attendees).where(eq(attendees.id, id));
    return attendee;
  }

  async createAttendee(attendee: InsertAttendee): Promise<Attendee> {
    const [created] = await db.insert(attendees).values(attendee).returning();
    return created;
  }

  // Camps
  async getCamps(): Promise<Camp[]> {
    return db.select().from(camps);
  }

  async getCamp(id: string): Promise<Camp | undefined> {
    const [camp] = await db.select().from(camps).where(eq(camps.id, id));
    return camp;
  }

  async createCamp(camp: InsertCamp): Promise<Camp> {
    const [created] = await db.insert(camps).values(camp).returning();
    return created;
  }

  // Camp Services
  async getCampServices(): Promise<CampService[]> {
    return db.select().from(campServices);
  }

  async getCampService(id: string): Promise<CampService | undefined> {
    const [service] = await db.select().from(campServices).where(eq(campServices.id, id));
    return service;
  }

  async createCampService(service: InsertCampService): Promise<CampService> {
    const [created] = await db.insert(campServices).values(service).returning();
    return created;
  }

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    return db.select().from(reservations).orderBy(desc(reservations.createdAt));
  }

  async getReservation(id: string): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation;
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [created] = await db.insert(reservations).values(reservation).returning();
    return created;
  }

  async updateReservation(id: string, data: Partial<Reservation>): Promise<Reservation | undefined> {
    const [updated] = await db.update(reservations).set(data).where(eq(reservations.id, id)).returning();
    return updated;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentByReference(reference: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.paynowReference, reference));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
    const [updated] = await db.update(payments).set(data).where(eq(payments.id, id)).returning();
    return updated;
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company | undefined> {
    const [updated] = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
    return updated;
  }

  // Past Events
  async getPastEvents(): Promise<PastEvent[]> {
    return db.select().from(pastEvents).orderBy(desc(pastEvents.year));
  }

  async getPastEvent(id: string): Promise<PastEvent | undefined> {
    const [event] = await db.select().from(pastEvents).where(eq(pastEvents.id, id));
    return event;
  }

  async createPastEvent(event: InsertPastEvent): Promise<PastEvent> {
    const [created] = await db.insert(pastEvents).values(event).returning();
    return created;
  }

  async updatePastEvent(id: string, data: { year?: number; edition?: string; title?: string; summary?: string; imageUrl?: string | null }): Promise<PastEvent | undefined> {
    const [updated] = await db.update(pastEvents).set(data).where(eq(pastEvents.id, id)).returning();
    return updated;
  }

  // Awardees
  async getAwardees(): Promise<Awardee[]> {
    return db.select().from(awardees).orderBy(desc(awardees.createdAt));
  }

  async getAwardeesByEvent(pastEventId: string): Promise<Awardee[]> {
    return db.select().from(awardees).where(eq(awardees.pastEventId, pastEventId));
  }

  async createAwardee(awardee: InsertAwardee): Promise<Awardee> {
    const [created] = await db.insert(awardees).values(awardee).returning();
    return created;
  }

  // Media Assets
  async getMediaAssets(): Promise<MediaAsset[]> {
    return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
  }

  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    const [created] = await db.insert(mediaAssets).values(asset).returning();
    return created;
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getPublishedAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).where(eq(announcements.isPublished, true)).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  // Tickets
  async getTickets(): Promise<Ticket[]> {
    return db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getTicketByCode(ticketCode: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketCode, ticketCode));
    return ticket;
  }

  async getTicketByAttendee(attendeeId: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.attendeeId, attendeeId));
    return ticket;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [created] = await db.insert(tickets).values(ticket).returning();
    return created;
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket | undefined> {
    const [updated] = await db.update(tickets).set(data).where(eq(tickets.id, id)).returning();
    return updated;
  }

  async getRecentScannedTickets(limit: number): Promise<Ticket[]> {
    return await db.select().from(tickets)
      .where(eq(tickets.status, "used"))
      .orderBy(desc(tickets.scannedAt))
      .limit(limit);
  }

  async getAttendeeByEmailOrPhone(query: string): Promise<Attendee | undefined> {
    const normalizedQuery = query.toLowerCase().trim();
    const [attendee] = await db.select().from(attendees)
      .where(
        or(
          eq(attendees.email, normalizedQuery),
          eq(attendees.phone, query.trim())
        )
      );
    return attendee;
  }

  async getReservationByAttendee(attendeeId: string): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations)
      .where(eq(reservations.attendeeId, attendeeId));
    return reservation;
  }

  async getPaymentsByAttendee(attendeeId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.attendeeId, attendeeId))
      .orderBy(desc(payments.createdAt));
  }

  // Stream Settings
  async getStreamSettings(): Promise<StreamSettings | undefined> {
    const [settings] = await db.select().from(streamSettings).limit(1);
    return settings;
  }

  async upsertStreamSettings(data: Partial<InsertStreamSettings>): Promise<StreamSettings> {
    const existing = await this.getStreamSettings();
    if (existing) {
      const [updated] = await db.update(streamSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(streamSettings.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(streamSettings).values(data as InsertStreamSettings).returning();
    return created;
  }

  // Stream Access
  async createStreamAccess(data: InsertLiveStreamAccess): Promise<LiveStreamAccess> {
    const [created] = await db.insert(liveStreamAccess).values(data).returning();
    return created;
  }

  async getStreamAccessByCode(accessCode: string): Promise<LiveStreamAccess | undefined> {
    const [access] = await db.select().from(liveStreamAccess)
      .where(eq(liveStreamAccess.accessCode, accessCode));
    return access;
  }

  async updateStreamAccess(id: string, data: Partial<LiveStreamAccess>): Promise<LiveStreamAccess | undefined> {
    const [updated] = await db.update(liveStreamAccess)
      .set(data)
      .where(eq(liveStreamAccess.id, id))
      .returning();
    return updated;
  }

  async getAllStreamAccess(): Promise<LiveStreamAccess[]> {
    return await db.select().from(liveStreamAccess).orderBy(desc(liveStreamAccess.createdAt));
  }

  // Recordings
  async getRecordings(): Promise<Recording[]> {
    return await db.select().from(recordings).orderBy(desc(recordings.createdAt));
  }

  async createRecording(data: InsertRecording): Promise<Recording> {
    const [created] = await db.insert(recordings).values(data).returning();
    return created;
  }

  async deleteRecording(id: string): Promise<void> {
    await db.delete(recordings).where(eq(recordings.id, id));
  }

  // Video Feed
  async getApprovedVideoPosts(): Promise<VideoFeedPost[]> {
    return await db.select().from(videoFeedPosts)
      .where(eq(videoFeedPosts.status, "approved"))
      .orderBy(desc(videoFeedPosts.createdAt));
  }

  async getAllVideoPosts(): Promise<VideoFeedPost[]> {
    return await db.select().from(videoFeedPosts).orderBy(desc(videoFeedPosts.createdAt));
  }

  async createVideoPost(data: InsertVideoFeedPost): Promise<VideoFeedPost> {
    const [created] = await db.insert(videoFeedPosts).values(data).returning();
    return created;
  }

  async updateVideoPostStatus(id: string, status: string): Promise<VideoFeedPost | undefined> {
    const [updated] = await db.update(videoFeedPosts)
      .set({ status: status as "pending" | "approved" | "rejected" })
      .where(eq(videoFeedPosts.id, id))
      .returning();
    return updated;
  }

  async likeVideoPost(id: string): Promise<VideoFeedPost | undefined> {
    // Atomic increment — avoids race condition from read-then-write pattern
    const [updated] = await db.update(videoFeedPosts)
      .set({ likes: sql`${videoFeedPosts.likes} + 1` })
      .where(eq(videoFeedPosts.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
