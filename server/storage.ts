import { 
  users, attendees, camps, campServices, reservations, payments,
  companies, pastEvents, awardees, mediaAssets, announcements, auditLogs,
  type User, type InsertUser, type Attendee, type InsertAttendee,
  type Camp, type InsertCamp, type CampService, type InsertCampService,
  type Reservation, type InsertReservation, type Payment, type InsertPayment,
  type Company, type InsertCompany, type PastEvent, type InsertPastEvent,
  type Awardee, type InsertAwardee, type MediaAsset, type InsertMediaAsset,
  type Announcement, type InsertAnnouncement
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

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
}

export const storage = new DatabaseStorage();
