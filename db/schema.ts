import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// A protection request submitted by a customer. Status starts at
// "pending_review" and is moved forward by SafeMY staff (see app/admin),
// not automatically — nothing here implies an agency has accepted the job.
export const protectionRequests = sqliteTable("protection_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  serviceType: text("service_type").notNull(),
  location: text("location").notNull(),
  startDate: text("start_date").notNull(),
  startTime: text("start_time").notNull(),
  durationHours: integer("duration_hours").notNull(),
  professionalsCount: integer("professionals_count").notNull(),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("pending_review"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pilotSignups = sqliteTable("pilot_signups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  interest: text("interest").notNull(),
  area: text("area").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// An application from a security agency wanting to join as a verified
// partner. Nothing is "verified" until SafeMY staff manually confirm the
// KDN licence and registration details against the actual regulator record.
export const providerApplications = sqliteTable("provider_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agencyName: text("agency_name").notNull(),
  registrationNumber: text("registration_number").notNull(),
  kdnLicenceNumber: text("kdn_licence_number").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  servicesOffered: text("services_offered").notNull(),
  coverageAreas: text("coverage_areas").notNull(),
  headcount: text("headcount").notNull().default(""),
  status: text("status").notNull().default("pending_review"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const businessEnquiries = sqliteTable("business_enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull().default(""),
  teamSize: text("team_size").notNull().default(""),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
