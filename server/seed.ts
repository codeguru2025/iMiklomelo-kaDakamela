import { db } from "./db";
import { camps, campServices, reservations, tickets, payments, companies, pastEvents, awardees, announcements } from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check whether camps need to be re-seeded (new package structure introduced)
  const existingCamps = await db.select().from(camps);
  const alreadyHasNewPackages = existingCamps.some(c => c.name === "General Camping");

  if (alreadyHasNewPackages) {
    // DB is fully up-to-date — nothing to do
    console.log("Database already seeded, skipping...");
    return;
  }

  if (existingCamps.length > 0) {
    // Old package structure detected — clear in FK-safe order then re-seed
    console.log("Updating camp packages to new structure...");
    await db.delete(tickets);
    await db.delete(payments);
    await db.delete(reservations);
    await db.delete(campServices);
    await db.delete(camps);
  }

  const campData = [
    {
      name: "General Camping",
      description: "Bring your own tent and enjoy authentic African camping at the Dakamela Royal Grounds. Access to shared facilities, communal fire pits, and the vibrant social areas.",
      capacity: 300,
      pricePerDay: "5.00",
      priceFullCamp: "5.00",
      currency: "USD",
      amenities: ["Bring your own tent", "Ground level lights", "Security patrol", "Access to Isibaya SikaDakamela (Camp Centre)", "Communal fire pit", "Water tap access"],
      imageUrl: "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/Camping%20village%20experience.jpeg",
      isActive: true,
    },
    {
      name: "Standard Camping",
      description: "Shared tent experience — tent provided, bring your own bedding. A comfortable base at the Dakamela Royal Grounds with access to all communal facilities.",
      capacity: 200,
      pricePerDay: "10.00",
      priceFullCamp: "10.00",
      currency: "USD",
      amenities: ["Shared tent provided", "Bring your own bedding", "Ground level lights", "Security patrol", "Access to Isibaya SikaDakamela (Camp Centre)", "Communal fire pit"],
      imageUrl: "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/Camping%20village%20experience.jpeg",
      isActive: true,
    },
    {
      name: "VIP Camping",
      description: "Premium VIP camping with your own dedicated tent and 2 meal tickets included. Enjoy priority access to all camp facilities and social areas.",
      capacity: 100,
      pricePerDay: "50.00",
      priceFullCamp: "50.00",
      currency: "USD",
      amenities: ["Dedicated tent included", "2x Meal tickets included", "Connected power points", "Priority Camp Centre access", "Security patrol", "Exclusive social areas"],
      imageUrl: "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/Camping%20village%20experience.jpeg",
      isActive: true,
    },
    {
      name: "VIP Full Package",
      description: "The ultimate all-inclusive 3-day experience. Dedicated tent, 6 meal tickets, and a Bush Dinner included — everything you need for an unforgettable cultural celebration.",
      capacity: 50,
      pricePerDay: "67.00",
      priceFullCamp: "200.00",
      currency: "USD",
      amenities: ["3 days full access", "Dedicated tent included", "6x Meal tickets included", "1x Bush Dinner Experience", "All facilities access", "Concierge service", "Priority bar service"],
      imageUrl: "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/Camping%20village%20experience.jpeg",
      isActive: true,
    },
  ];

  await db.insert(camps).values(campData);
  console.log("Camps seeded");

  const serviceData = [
    {
      name: "Traditional Food Tasting",
      description: "Sample a selection of traditional African foods and flavours",
      price: "10.00",
      currency: "USD",
      capacity: 300,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Guided Cultural Tour / Village Walk",
      description: "Guided walk through the village and cultural sites with storytelling",
      price: "5.00",
      currency: "USD",
      capacity: 200,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Traditional Beer Tasting",
      description: "Taste authentic traditional African beers and learn about their cultural significance",
      price: "5.00",
      currency: "USD",
      capacity: 200,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Basket Weaving Workshop",
      description: "Hands-on traditional basket weaving workshop with a local artisan",
      price: "15.00",
      currency: "USD",
      capacity: 50,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Quad Biking (Shangani River Bank)",
      description: "Exciting quad bike ride along the scenic Shangani River Bank",
      price: "40.00",
      currency: "USD",
      capacity: 30,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Donkey Cart Tour Rides",
      description: "Traditional donkey cart tour around the grounds and surrounding area",
      price: "5.00",
      currency: "USD",
      capacity: 100,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Bush Spa (Massages & Facials)",
      description: "Relaxing bush spa experience with traditional African massages and facials",
      price: "20.00",
      currency: "USD",
      capacity: 50,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Bush Dinner Experience (4 PAX)",
      description: "Exclusive outdoor bush dinner for up to 4 people with traditional cuisine, candlelit tables, and a cultural ambiance",
      price: "50.00",
      currency: "USD",
      capacity: 40,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Bush Dinner Experience (10 PAX)",
      description: "Exclusive outdoor bush dinner for up to 10 people — perfect for group celebrations with full table setup and cultural atmosphere",
      price: "450.00",
      currency: "USD",
      capacity: 10,
      isDateBound: true,
      isActive: true,
    },
  ];

  await db.insert(campServices).values(serviceData);
  console.log("Camp services seeded");

  const companyData = [
    {
      name: "Kingdom Blue",
      description: "Our proud primary sponsor, supporting the preservation and celebration of African cultural heritage.",
      contactEmail: "partnerships@kingdomblue.co.za",
      contactPhone: "+27 11 123 4567",
      website: "https://kingdomblue.co.za",
      logoUrl: "/sponsors/kbf_logo.png",
      role: "sponsor" as const,
      sponsorshipTier: "Platinum",
      applicationStatus: "approved" as const,
      isPrimarySponsor: true,
    },
    {
      name: "Chibikhulu",
      description: "Supporting African excellence and cultural preservation through strategic partnerships.",
      contactEmail: "info@chibikhulu.co.za",
      contactPhone: "+27 11 555 7890",
      logoUrl: "/sponsors/ck_logo.jpeg",
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

  const pastEventData = [
    {
      year: 2025,
      edition: "11th Edition",
      title: "iMiklomelo kaDakamela Cultural Festival 2025",
      summary: "The upcoming celebration continues the proud tradition of honoring achievers and preserving cultural heritage in the heart of KwaZulu-Natal.",
      eventDate: new Date("2025-12-12"),
      location: "Dakamela Royal Grounds, KwaZulu-Natal",
    },
    {
      year: 2024,
      edition: "10th Edition",
      title: "iMiklomelo kaDakamela Cultural Festival 2024",
      summary: "A landmark celebration marking a decade of honoring achievement and preserving cultural heritage. Over 4,000 attendees gathered to witness the conferment of awards by Chief Dakamela.",
      eventDate: new Date("2024-12-14"),
      location: "Dakamela Royal Grounds, KwaZulu-Natal",
    },
    {
      year: 2023,
      edition: "9th Edition",
      title: "iMiklomelo kaDakamela Cultural Festival 2023",
      summary: "A celebration of resilience and community spirit, bringing together families and dignitaries from across Southern Africa for three days of cultural celebration.",
      eventDate: new Date("2023-12-09"),
      location: "Dakamela Royal Grounds, KwaZulu-Natal",
    },
    {
      year: 2022,
      edition: "8th Edition",
      title: "iMiklomelo kaDakamela Cultural Festival 2022",
      summary: "The return to in-person gatherings after the pandemic, celebrated with renewed energy and commitment to cultural preservation.",
      eventDate: new Date("2022-12-10"),
      location: "Dakamela Royal Grounds, KwaZulu-Natal",
    },
  ];

  const insertedEvents = await db.insert(pastEvents).values(pastEventData).returning();
  console.log("Past events seeded");

  // Use named references instead of brittle hardcoded indices
  const event2024 = insertedEvents.find(e => e.year === 2024);
  const event2023 = insertedEvents.find(e => e.year === 2023);

  if (!event2024 || !event2023) {
    console.error("Expected past events not found after insert — skipping awardees");
    return;
  }

  const awardeeData = [
    {
      pastEventId: event2024.id,
      name: "Dr. Nomvula Mkhize",
      title: "Community Health Pioneer",
      awardName: "Excellence in Community Service",
      awardDescription: "For outstanding dedication to improving healthcare access in rural communities over 25 years.",
    },
    {
      pastEventId: event2024.id,
      name: "Sibusiso Ndlovu",
      title: "Cultural Arts Advocate",
      awardName: "Cultural Preservation Award",
      awardDescription: "For lifelong commitment to preserving traditional music and dance forms for future generations.",
    },
    {
      pastEventId: event2024.id,
      name: "Thandi Zulu",
      title: "Education Innovator",
      awardName: "Youth Development Award",
      awardDescription: "For establishing scholarship programs that have enabled over 500 students to access higher education.",
    },
    {
      pastEventId: event2023.id,
      name: "Chief Mandla Buthelezi",
      title: "Traditional Leadership",
      awardName: "Heritage Leadership Award",
      awardDescription: "For exemplary traditional leadership and community development initiatives.",
    },
    {
      pastEventId: event2023.id,
      name: "Zanele Dlamini",
      title: "Agricultural Entrepreneur",
      awardName: "Economic Empowerment Award",
      awardDescription: "For pioneering sustainable farming practices and creating employment in rural areas.",
    },
  ];

  await db.insert(awardees).values(awardeeData);
  console.log("Awardees seeded");

  const announcementData = [
    {
      title: "Early Bird Registration Now Open",
      content: "Register before October 31st to receive a 15% discount on accommodation packages. All attendees must register - even if not camping.",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "2026 Event Dates Confirmed",
      content: "Mark your calendars! The 12th Edition of iMiklomelo kaDakamela Cultural Festival will take place December 11-13, 2026 at the Dakamela Royal Grounds.",
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  await db.insert(announcements).values(announcementData);
  console.log("Announcements seeded");

  console.log("Database seeding complete!");
}
