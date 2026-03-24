import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Re-export auth models (users table, User type, etc.)
export * from "./models/auth";

export const ticketStatusEnum = pgEnum("ticket_status", ["valid", "used", "expired", "cancelled"]);
export const streamAccessStatusEnum = pgEnum("stream_access_status", ["pending", "active", "expired"]);
export const videoPostStatusEnum = pgEnum("video_post_status", ["pending", "approved", "rejected"]);

export const attendanceTypeEnum = pgEnum("attendance_type", ["standard", "vip", "delegation"]);
export const depositStatusEnum = pgEnum("deposit_status", ["pending", "paid", "expired", "refunded"]);
export const companyRoleEnum = pgEnum("company_role", ["exhibitor", "sponsor", "both"]);
export const exhibitionCategoryEnum = pgEnum("exhibition_category", ["art", "fashion", "food", "cultural_crafts", "services"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other", "prefer_not_to_say"]);
export const ageRangeEnum = pgEnum("age_range", ["under_18", "18_24", "25_34", "35_44", "45_54", "55_64", "65_plus"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "processing", "paid", "failed", "cancelled"]);

export const attendees = pgTable("attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  gender: genderEnum("gender").notNull(),
  ageRange: ageRangeEnum("age_range").notNull(),
  profession: text("profession"),
  attendanceType: attendanceTypeEnum("attendance_type").default("standard").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  isFirstTime: boolean("is_first_time").default(true).notNull(),
  needsAccommodation: boolean("needs_accommodation").default(false).notNull(),
  arrivalDate: timestamp("arrival_date"),
  departureDate: timestamp("departure_date"),
  marketingConsent: boolean("marketing_consent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const camps = pgTable("camps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  capacity: integer("capacity").notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull().default("25.00"),
  priceFullCamp: decimal("price_full_camp", { precision: 10, scale: 2 }).notNull().default("60.00"),
  currency: text("currency").notNull().default("USD"),
  amenities: text("amenities").array(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const campServices = pgTable("camp_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  capacity: integer("capacity"),
  isDateBound: boolean("is_date_bound").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attendeeId: varchar("attendee_id").references(() => attendees.id).notNull(),
  campId: varchar("camp_id").references(() => camps.id).notNull(),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  depositStatus: depositStatusEnum("deposit_status").default("pending").notNull(),
  selectedServices: text("selected_services").array(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reservationId: varchar("reservation_id").references(() => reservations.id),
  attendeeId: varchar("attendee_id").references(() => attendees.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentMethod: text("payment_method"),
  paynowReference: text("paynow_reference"),
  pollUrl: text("poll_url"),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paymentType: text("payment_type").notNull().default("deposit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  website: text("website"),
  logoUrl: text("logo_url"),
  role: companyRoleEnum("role").notNull(),
  exhibitionCategory: exhibitionCategoryEnum("exhibition_category"),
  sponsorshipTier: text("sponsorship_tier"),
  applicationStatus: applicationStatusEnum("application_status").default("pending").notNull(),
  isPrimarySponsor: boolean("is_primary_sponsor").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pastEvents = pgTable("past_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  edition: text("edition"),
  title: text("title").notNull(),
  summary: text("summary"),
  eventDate: timestamp("event_date"),
  location: text("location"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const awardees = pgTable("awardees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pastEventId: varchar("past_event_id").references(() => pastEvents.id).notNull(),
  name: text("name").notNull(),
  title: text("title"),
  awardName: text("award_name").notNull(),
  awardDescription: text("award_description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pastEventId: varchar("past_event_id").references(() => pastEvents.id),
  type: text("type").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketCode: text("ticket_code").notNull().unique(),
  attendeeId: varchar("attendee_id").references(() => attendees.id).notNull(),
  reservationId: varchar("reservation_id").references(() => reservations.id),
  attendanceType: attendanceTypeEnum("attendance_type").notNull(),
  status: ticketStatusEnum("status").default("valid").notNull(),
  qrData: text("qr_data").notNull(),
  campDetails: text("camp_details"),
  selectedServices: text("selected_services").array(),
  eventDates: text("event_dates"),
  scannedAt: timestamp("scanned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Live Stream Access - for paid virtual attendance
export const liveStreamAccess = pgTable("live_stream_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  paymentId: varchar("payment_id").references(() => payments.id),
  accessCode: text("access_code").notNull().unique(),
  status: streamAccessStatusEnum("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Video Feed Posts - user-generated short videos during the event
export const videoFeedPosts = pgTable("video_feed_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  duration: integer("duration"),
  status: videoPostStatusEnum("status").default("pending").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stream Settings - admin configuration for live stream
export const streamSettings = pgTable("stream_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  streamUrl: text("stream_url"),
  streamTitle: text("stream_title").default("iMiklomelo kaDakamela Cultural Festival 2026 - Live"),
  streamDescription: text("stream_description"),
  isLive: boolean("is_live").default(false).notNull(),
  streamPrice: decimal("stream_price", { precision: 10, scale: 2 }).default("15.00").notNull(),
  currency: text("currency").default("USD").notNull(),
  eventStartDate: timestamp("event_start_date"),
  eventEndDate: timestamp("event_end_date"),
  allowVideoFeed: boolean("allow_video_feed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recordings - past event recordings for paid access
export const recordings = pgTable("recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"),
  year: integer("year"),
  isFree: boolean("is_free").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertAttendeeSchema = createInsertSchema(attendees).omit({ id: true, createdAt: true });
export const insertCampSchema = createInsertSchema(camps).omit({ id: true });
export const insertCampServiceSchema = createInsertSchema(campServices).omit({ id: true });
export const insertReservationSchema = createInsertSchema(reservations).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertPastEventSchema = createInsertSchema(pastEvents).omit({ id: true, createdAt: true });
export const updatePastEventSchema = z.object({
  year: z.number().int().optional(),
  edition: z.string().optional(),
  title: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
}).strict();
export const insertAwardeeSchema = createInsertSchema(awardees).omit({ id: true, createdAt: true });
export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true });
export const insertLiveStreamAccessSchema = createInsertSchema(liveStreamAccess).omit({ id: true, createdAt: true });
export const insertVideoFeedPostSchema = createInsertSchema(videoFeedPosts).omit({ id: true, createdAt: true });
export const insertStreamSettingsSchema = createInsertSchema(streamSettings).omit({ id: true, updatedAt: true });
export const insertRecordingSchema = createInsertSchema(recordings).omit({ id: true, createdAt: true });

// Types
export type InsertAttendee = z.infer<typeof insertAttendeeSchema>;
export type Attendee = typeof attendees.$inferSelect;
export type InsertCamp = z.infer<typeof insertCampSchema>;
export type Camp = typeof camps.$inferSelect;
export type InsertCampService = z.infer<typeof insertCampServiceSchema>;
export type CampService = typeof campServices.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertPastEvent = z.infer<typeof insertPastEventSchema>;
export type PastEvent = typeof pastEvents.$inferSelect;
export type InsertAwardee = z.infer<typeof insertAwardeeSchema>;
export type Awardee = typeof awardees.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertLiveStreamAccess = z.infer<typeof insertLiveStreamAccessSchema>;
export type LiveStreamAccess = typeof liveStreamAccess.$inferSelect;
export type InsertVideoFeedPost = z.infer<typeof insertVideoFeedPostSchema>;
export type VideoFeedPost = typeof videoFeedPosts.$inferSelect;
export type InsertStreamSettings = z.infer<typeof insertStreamSettingsSchema>;
export type StreamSettings = typeof streamSettings.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Recording = typeof recordings.$inferSelect;
