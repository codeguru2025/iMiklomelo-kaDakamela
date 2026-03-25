import { db } from "./db";
import { camps, campServices, companies, pastEvents, awardees, announcements } from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database...");

  const existingCamps = await db.select().from(camps).limit(1);
  if (existingCamps.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const campData = [
    {
      name: "Standard Camping",
      description: "Experience authentic African camping in the Premium Cultural Camping Sanctuary. Located in the Inkundla Yomlilo (Sleeping Circle) with access to shared facilities and the vibrant social areas.",
      capacity: 200,
      pricePerDay: "25.00",
      priceFullCamp: "60.00",
      currency: "USD",
      amenities: ["Ground level lights", "Security patrol", "Access to Isibaya SikaDakamela (Camp Centre)", "Communal fire pit", "Water tap access"],
      isActive: true,
    },
    {
      name: "Premium Camping",
      description: "Enhanced camping in the Outer Court area with better facilities, power access, and closer proximity to the Isigcawu Sabantu (Public & Social Area).",
      capacity: 100,
      pricePerDay: "35.00",
      priceFullCamp: "85.00",
      currency: "USD",
      amenities: ["Connected power points", "Ground level lights", "Shaded areas", "Pool tables access", "Security patrol", "Camp Centre access"],
      isActive: true,
    },
    {
      name: "VIP Camping",
      description: "Luxury camping experience with premium amenities, private power, and exclusive access to all facilities including the Camp Centre bar and social lounge.",
      capacity: 50,
      pricePerDay: "50.00",
      priceFullCamp: "120.00",
      currency: "USD",
      amenities: ["Private power station", "Premium tent included", "Exclusive Camp Centre access", "Priority bar service", "Concierge service", "All meals included"],
      isActive: true,
    },
  ];

  await db.insert(camps).values(campData);
  console.log("Camps seeded");

  const serviceData = [
    {
      name: "Breakfast",
      description: "Traditional African breakfast with pap, eggs, and grilled meats",
      price: "8.00",
      currency: "USD",
      capacity: 500,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Lunch",
      description: "Hearty midday meal with braai meats and traditional sides",
      price: "12.00",
      currency: "USD",
      capacity: 500,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Supper",
      description: "Evening feast with traditional stews, rice, and vegetables",
      price: "15.00",
      currency: "USD",
      capacity: 500,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Bathing Water",
      description: "Hot water for bathing delivered to your tent area",
      price: "5.00",
      currency: "USD",
      capacity: 200,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Massage Spa",
      description: "Traditional African massage and relaxation treatment",
      price: "25.00",
      currency: "USD",
      capacity: 50,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "Ice Bath",
      description: "Refreshing ice bath for recovery and wellness",
      price: "10.00",
      currency: "USD",
      capacity: 30,
      isDateBound: true,
      isActive: true,
    },
    {
      name: "WiFi Access",
      description: "High-speed internet access throughout the camp",
      price: "5.00",
      currency: "USD",
      capacity: 300,
      isDateBound: false,
      isActive: true,
    },
    {
      name: "Power Bank Rental",
      description: "Portable power bank for charging your devices",
      price: "3.00",
      currency: "USD",
      capacity: 100,
      isDateBound: false,
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
      website: "https://www.kingdombluefuneral.co.zw",
      logoUrl: "/api/assets/kbf_logo_1770113825582.png",
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
      logoUrl: "/api/assets/CK_Logo_1770117291903.jpeg",
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

  const pastEventsData = [
    {
      year: 2025,
      edition: "11th Edition",
      title: "iMiklomelo kaDakamela Cultural Festival 2025",
      summary: "The upcoming celebration continues the proud tradition of honoring achievers and preserving cultural heritage in the heart of Nkayi.",
      eventDate: new Date("2025-12-12"),
      location: "Dakamela Royal Grounds, Nkayi",
    },
    {
      year: 2024,
      edition: "10th Edition",
      title: "iMiklomelo kaDakamela Cultural Festival 2024",
      summary: "A landmark celebration marking a decade of honoring achievement and preserving cultural heritage. Over 4,000 attendees gathered to witness the conferment of awards by Chief Dakamela.",
      eventDate: new Date("2024-12-14"),
      location: "Dakamela Royal Grounds, Nkayi",
    },
    {
      year: 2023,
      edition: "9th Edition",
      title: "iMiklomelo kaDakamela Cultural Festival 2023",
      summary: "A celebration of resilience and community spirit, bringing together families and dignitaries from across Southern Africa for three days of cultural celebration.",
      eventDate: new Date("2023-12-09"),
      location: "Dakamela Royal Grounds, Nkayi",
    },
    {
      year: 2022,
      edition: "8th Edition",
      title: "iMiklomelo kaDakamela Cultural Festival 2022",
      summary: "The return to in-person gatherings after the pandemic, celebrated with renewed energy and commitment to cultural preservation.",
      eventDate: new Date("2022-12-10"),
      location: "Dakamela Royal Grounds, Nkayi",
    },
  ];

  const insertedEvents = await db.insert(pastEvents).values(pastEventsData).returning();
  console.log("Past events seeded");

  const awardeeData = [
    {
      pastEventId: insertedEvents[1].id,
      name: "Dr. Nomvula Mkhize",
      title: "Community Health Pioneer",
      awardName: "Excellence in Community Service",
      awardDescription: "For outstanding dedication to improving healthcare access in rural communities over 25 years.",
    },
    {
      pastEventId: insertedEvents[1].id,
      name: "Sibusiso Ndlovu",
      title: "Cultural Arts Advocate",
      awardName: "Cultural Preservation Award",
      awardDescription: "For lifelong commitment to preserving traditional music and dance forms for future generations.",
    },
    {
      pastEventId: insertedEvents[1].id,
      name: "Thandi Zulu",
      title: "Education Innovator",
      awardName: "Youth Development Award",
      awardDescription: "For establishing scholarship programs that have enabled over 500 students to access higher education.",
    },
    {
      pastEventId: insertedEvents[2].id,
      name: "Chief Mandla Buthelezi",
      title: "Traditional Leadership",
      awardName: "Heritage Leadership Award",
      awardDescription: "For exemplary traditional leadership and community development initiatives.",
    },
    {
      pastEventId: insertedEvents[2].id,
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
