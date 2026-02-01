import { db } from "./db";
import { camps, campServices, companies, pastEvents, awardees, announcements } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check if data already exists
  const existingCamps = await db.select().from(camps).limit(1);
  if (existingCamps.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Seed Camps
  const campData = [
    {
      name: "Standard Camp",
      description: "Basic camping with shared facilities. Bring your own tent or rent one.",
      capacity: 200,
      pricePerNight: "150.00",
      amenities: ["Shared ablutions", "Communal fire pit", "Security patrol"],
      isActive: true,
    },
    {
      name: "Premium Camp",
      description: "Enhanced camping experience with better facilities and closer to event venues.",
      capacity: 100,
      pricePerNight: "350.00",
      amenities: ["Private ablutions", "Power points", "Shaded areas", "Security patrol"],
      isActive: true,
    },
    {
      name: "VIP Camp",
      description: "Luxury camping with premium amenities and exclusive access.",
      capacity: 50,
      pricePerNight: "750.00",
      amenities: ["En-suite facilities", "Air conditioning", "Private power", "Concierge service", "Premium bedding included"],
      isActive: true,
    },
  ];

  await db.insert(camps).values(campData);
  console.log("Camps seeded");

  // Seed Camp Services
  const serviceData = [
    {
      name: "Tent Rental",
      description: "2-person weatherproof tent with groundsheet",
      price: "200.00",
      capacity: 150,
      isActive: true,
    },
    {
      name: "Bedding Package",
      description: "Mattress, sleeping bag, pillow, and blanket",
      price: "150.00",
      capacity: 200,
      isActive: true,
    },
    {
      name: "Meal Package (3 Days)",
      description: "Traditional meals - breakfast, lunch, and dinner for all 3 days",
      price: "450.00",
      capacity: 500,
      isActive: true,
    },
    {
      name: "Power Access",
      description: "Dedicated power point for charging devices",
      price: "100.00",
      capacity: 100,
      isActive: true,
    },
    {
      name: "Security Locker",
      description: "Secure storage locker for valuables",
      price: "75.00",
      capacity: 80,
      isActive: true,
    },
    {
      name: "Shuttle Service",
      description: "Airport/bus station pickup and return transport",
      price: "250.00",
      capacity: 60,
      isActive: true,
    },
  ];

  await db.insert(campServices).values(serviceData);
  console.log("Camp services seeded");

  // Seed Primary Sponsor (Kingdom Blue)
  const companyData = [
    {
      name: "Kingdom Blue",
      description: "Our proud primary sponsor, supporting the preservation and celebration of African cultural heritage.",
      contactEmail: "partnerships@kingdomblue.co.za",
      contactPhone: "+27 11 123 4567",
      website: "https://kingdomblue.co.za",
      role: "sponsor" as const,
      sponsorshipTier: "Platinum",
      applicationStatus: "approved" as const,
      isPrimarySponsor: true,
    },
    {
      name: "Zulu Heritage Foundation",
      description: "Dedicated to preserving and promoting Zulu culture and traditions across generations.",
      contactEmail: "info@zuluheritage.org",
      contactPhone: "+27 33 456 7890",
      role: "sponsor" as const,
      sponsorshipTier: "Gold",
      applicationStatus: "approved" as const,
      isPrimarySponsor: false,
    },
    {
      name: "Ubuntu Crafts Collective",
      description: "Showcasing the finest traditional and contemporary African crafts and artwork.",
      contactEmail: "hello@ubuntucrafts.co.za",
      role: "exhibitor" as const,
      exhibitionCategory: "cultural_crafts" as const,
      applicationStatus: "approved" as const,
      isPrimarySponsor: false,
    },
    {
      name: "Imbali Fashion House",
      description: "Modern African fashion inspired by traditional designs and sustainable practices.",
      contactEmail: "contact@imbalifashion.com",
      role: "exhibitor" as const,
      exhibitionCategory: "fashion" as const,
      applicationStatus: "approved" as const,
      isPrimarySponsor: false,
    },
  ];

  await db.insert(companies).values(companyData);
  console.log("Companies seeded");

  // Seed Past Events
  const pastEventData = [
    {
      year: 2024,
      edition: "10th Edition",
      title: "Imiklomelo Ka Dakamela 2024",
      summary: "A landmark celebration marking a decade of honoring achievement and preserving cultural heritage. Over 4,000 attendees gathered to witness the conferment of awards by Chief Dakamela.",
      eventDate: new Date("2024-12-14"),
      location: "Dakamela Royal Grounds, KwaZulu-Natal",
    },
    {
      year: 2023,
      edition: "9th Edition",
      title: "Imiklomelo Ka Dakamela 2023",
      summary: "A celebration of resilience and community spirit, bringing together families and dignitaries from across Southern Africa for three days of cultural celebration.",
      eventDate: new Date("2023-12-09"),
      location: "Dakamela Royal Grounds, KwaZulu-Natal",
    },
    {
      year: 2022,
      edition: "8th Edition",
      title: "Imiklomelo Ka Dakamela 2022",
      summary: "The return to in-person gatherings after the pandemic, celebrated with renewed energy and commitment to cultural preservation.",
      eventDate: new Date("2022-12-10"),
      location: "Dakamela Royal Grounds, KwaZulu-Natal",
    },
  ];

  const insertedEvents = await db.insert(pastEvents).values(pastEventData).returning();
  console.log("Past events seeded");

  // Seed Awardees for 2024 event
  const awardeeData = [
    {
      pastEventId: insertedEvents[0].id,
      name: "Dr. Nomvula Mkhize",
      title: "Community Health Pioneer",
      awardName: "Excellence in Community Service",
      awardDescription: "For outstanding dedication to improving healthcare access in rural communities over 25 years.",
    },
    {
      pastEventId: insertedEvents[0].id,
      name: "Sibusiso Ndlovu",
      title: "Cultural Arts Advocate",
      awardName: "Cultural Preservation Award",
      awardDescription: "For lifelong commitment to preserving traditional music and dance forms for future generations.",
    },
    {
      pastEventId: insertedEvents[0].id,
      name: "Thandi Zulu",
      title: "Education Innovator",
      awardName: "Youth Development Award",
      awardDescription: "For establishing scholarship programs that have enabled over 500 students to access higher education.",
    },
    {
      pastEventId: insertedEvents[1].id,
      name: "Chief Mandla Buthelezi",
      title: "Traditional Leadership",
      awardName: "Heritage Leadership Award",
      awardDescription: "For exemplary traditional leadership and community development initiatives.",
    },
    {
      pastEventId: insertedEvents[1].id,
      name: "Zanele Dlamini",
      title: "Agricultural Entrepreneur",
      awardName: "Economic Empowerment Award",
      awardDescription: "For pioneering sustainable farming practices and creating employment in rural areas.",
    },
  ];

  await db.insert(awardees).values(awardeeData);
  console.log("Awardees seeded");

  // Seed Announcements
  const announcementData = [
    {
      title: "Early Bird Registration Now Open",
      content: "Register before October 31st to receive a 15% discount on accommodation packages.",
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  await db.insert(announcements).values(announcementData);
  console.log("Announcements seeded");

  console.log("Database seeding complete!");
}
