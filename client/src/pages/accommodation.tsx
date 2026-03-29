import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tent,
  Utensils,
  Car,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Info,
  Beer,
  TableIcon,
  Music,
  Zap,
  Bike,
  Leaf,
  MapPin,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Booking configuration (scoped to this page only) ────────────────────────
const accommodationBookingUrl = "https://forms.gle/CkK13yv4J2AJhZRo6";

const openBookingForm = () =>
  window.open(accommodationBookingUrl, "_blank", "noopener,noreferrer");

// ─── DO Spaces image URLs ─────────────────────────────────────────────────────
const IMAGES = {
  campingVillage:
    "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/Camping%20village%20experience.jpeg",
  campingPackages:
    "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/Caping%20packages.jpeg",
  bushDinner:
    "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/Bush%20Dinner%20Experience.jpeg",
} as const;

// ─── Structured content data ──────────────────────────────────────────────────
interface CampPackage {
  id: string;
  name: string;
  price: string;
  priceLabel: string;
  description: string;
  amenities: string[];
  capacity: number;
  isPopular: boolean;
}

const campingPackages: CampPackage[] = [
  {
    id: "general",
    name: "General Camping",
    price: "$5",
    priceLabel: "per person",
    description: "Bring your own tent",
    amenities: [
      "Bring your own tent",
      "Ground level lights",
      "Security patrol",
      "Access to Camp Centre",
      "Communal fire pit",
      "Water tap access",
    ],
    capacity: 300,
    isPopular: false,
  },
  {
    id: "standard",
    name: "Standard Camping",
    price: "$10",
    priceLabel: "per day per person",
    description: "Shared tent, bring your own bedding",
    amenities: [
      "Shared tent provided",
      "Bring your own bedding",
      "Ground level lights",
      "Security patrol",
      "Access to Camp Centre",
      "Communal fire pit",
    ],
    capacity: 200,
    isPopular: false,
  },
  {
    id: "vip",
    name: "VIP Camping",
    price: "$50",
    priceLabel: "per day per person",
    description: "Tent + meal tickets (×2)",
    amenities: [
      "Dedicated tent included",
      "2× Meal tickets included",
      "Connected power points",
      "Priority Camp Centre access",
      "Security patrol",
      "Exclusive social areas",
    ],
    capacity: 100,
    isPopular: false,
  },
  {
    id: "vip-full",
    name: "VIP Camping Full Package",
    price: "$200",
    priceLabel: "per person · 3 days",
    description: "3 Days + Tent · Meal Tickets (×6) · Bush Dinner (×1)",
    amenities: [
      "3 days full access",
      "Dedicated tent included",
      "6× Meal tickets included",
      "1× Bush Dinner Experience",
      "All facilities access",
      "Concierge service",
      "Priority bar service",
    ],
    capacity: 50,
    isPopular: true,
  },
];

interface AddOn {
  id: string;
  name: string;
  price: string;
  icon: LucideIcon;
}

const culturalAddOns: AddOn[] = [
  { id: "food-tasting",   name: "Traditional Food Tasting",          price: "$10",      icon: Utensils  },
  { id: "cultural-tour",  name: "Guided Cultural Tour / Village Walk", price: "$5",      icon: MapPin    },
  { id: "beer-tasting",   name: "Traditional Beer Tasting",           price: "$5",       icon: Beer      },
  { id: "craft-workshop", name: "Craft & Heritage Workshops",         price: "$10",      icon: Leaf      },
  { id: "quad-biking",    name: "Quad Biking (Shangani River Bank)",  price: "from $10", icon: Bike      },
  { id: "donkey-cart",    name: "Donkey Cart Tour Rides",             price: "$5",       icon: Car       },
  { id: "bush-spa",       name: "Bush Spa (Massages & Facials)",      price: "from $20", icon: Sparkles  },
];

const bushDinnerOptions = [
  { label: "Per Person",      price: "$50",  note: "Individual booking"  },
  { label: "Table — 5 PAX",  price: "$200", note: "Private table for 5"  },
  { label: "Table — 10 PAX", price: "$450", note: "Private table for 10" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Accommodation() {
  return (
    <div className="min-h-screen">

      {/* ── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative py-28 md:py-40 bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url('${IMAGES.campingVillage}')` }}
        onClick={openBookingForm}
        role="button"
        aria-label="Open booking form"
      >
        {/* layered overlay: dark base + amber tint for warmth */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="container relative mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-500/20 text-amber-100 border-amber-400/30">
            <Tent className="w-3 h-3 mr-1" />
            Premium Cultural Camping Sanctuary
          </Badge>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Camping Village Experience
          </h1>

          <p className="text-lg md:text-xl text-amber-100/90 mb-2 font-medium tracking-wide">
            3 – 6 April 2026 &nbsp;|&nbsp; KoDakamela, Nkayi
          </p>

          <p className="text-base text-amber-100/75 mb-10 max-w-2xl mx-auto">
            Packages from just $5 per person — General, Standard, VIP, and all-inclusive Full Package options.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href={accommodationBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="lg"
                className="gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-6 text-base"
                data-testid="hero-cta-button"
              >
                Register Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-amber-100/80">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="text-sm">30% deposit secures your spot</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span className="text-sm">All prices in USD</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAMP CENTRE INFO ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Beer className="w-3 h-3 mr-1" />
              Camp Centre
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Isibaya SikaDakamela
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              At the heart of our camp lies the Isibaya SikaDakamela — a beautiful
              thatched house serving as the social hub of the gathering.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Beer,      label: "Bar Service",       sub: "Refreshments & drinks"  },
                      { icon: TableIcon, label: "Pool Tables",       sub: "Entertainment area"     },
                      { icon: Music,     label: "Social Lounge",     sub: "Meet fellow guests"     },
                      { icon: Zap,       label: "Charging Station",  sub: "Select power points"    },
                    ].map(({ icon: Icon, label, sub }) => (
                      <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Icon className="w-6 h-6 text-primary shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground">{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-semibold">Camp Features:</h4>
                <ul className="space-y-2">
                  {[
                    "Inkundla Yomlilo — Sleeping Circle with premium tents",
                    "Isigcawu Sabantu — Public & Social gathering areas",
                    "Ground level lighting throughout the camp",
                    "Connected power points at select locations",
                    "24-hour security patrol",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src={IMAGES.campingVillage}
                alt="Camping Village at Dakamela Royal Grounds"
                className="w-full object-cover aspect-video"
                loading="lazy"
              />
              <Badge className="absolute top-4 left-4 bg-background/90">
                Camp Village
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: CAMPING PACKAGES ──────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">

          {/* Section intro with feature image */}
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto mb-14">
            <div>
              <Badge variant="outline" className="mb-4">Camping Packages</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Choose Your Accommodation
              </h2>
              <p className="text-muted-foreground mb-6">
                From budget-friendly to all-inclusive — pick the package that suits you.
                All camps include access to the Isibaya SikaDakamela and all event venues.
              </p>
              <a
                href={accommodationBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  Register via Form
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
            <div
              className="relative rounded-lg overflow-hidden shadow-xl cursor-pointer group"
              onClick={openBookingForm}
              role="button"
              aria-label="Open booking form"
            >
              <img
                src={IMAGES.campingPackages}
                alt="Camping packages overview"
                className="w-full object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-4">
                <Badge className="bg-background/90 text-foreground gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Register via Form
                </Badge>
              </div>
            </div>
          </div>

          {/* Package cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campingPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${
                  pkg.isPopular ? "border-primary border-2" : ""
                }`}
                onClick={openBookingForm}
                data-testid={`card-camp-${pkg.id}`}
              >
                {pkg.isPopular && (
                  <Badge className="absolute top-3 right-3 z-10">Most Popular</Badge>
                )}

                <div className="aspect-video overflow-hidden bg-gradient-to-br from-amber-600 to-orange-700 relative">
                  <img
                    src={IMAGES.campingVillage}
                    alt={pkg.name}
                    className="w-full h-full object-cover opacity-80"
                    loading="lazy"
                  />
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-lg">{pkg.name}</CardTitle>
                  <div className="mt-1">
                    <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                    <span className="text-xs text-muted-foreground ml-1">{pkg.priceLabel}</span>
                  </div>
                  <CardDescription className="mt-1 text-sm">{pkg.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pb-4">
                  <ul className="space-y-1">
                    {pkg.amenities.slice(0, 4).map((amenity) => (
                      <li key={amenity} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        {amenity}
                      </li>
                    ))}
                    {pkg.amenities.length > 4 && (
                      <li className="text-xs text-primary font-medium">
                        +{pkg.amenities.length - 4} more included
                      </li>
                    )}
                  </ul>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{pkg.capacity} spaces available</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <a
                    href={accommodationBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      className="w-full gap-2"
                      variant={pkg.isPopular ? "default" : "outline"}
                      data-testid={`button-book-camp-${pkg.id}`}
                    >
                      Register via Form
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: BUSH DINNER EXPERIENCE ───────────────────────────────── */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Star className="w-3 h-3 mr-1" />
              Paid Cultural Lifestyle Experience
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Bush Dinner Experience
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              An exclusive candlelit outdoor bush dinner against the natural African landscape —
              the perfect way to celebrate in style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            {/* Image — clickable */}
            <div
              className="relative rounded-xl overflow-hidden shadow-2xl cursor-pointer group"
              onClick={openBookingForm}
              role="button"
              aria-label="Reserve bush dinner via form"
            >
              <img
                src={IMAGES.bushDinner}
                alt="Bush Dinner Experience"
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300" />
              <Badge className="absolute top-4 left-4 bg-background/90 gap-1">
                <Star className="w-3 h-3" />
                Exclusive Experience
              </Badge>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-center">
                  <p className="text-white text-sm font-medium flex items-center justify-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Reserve via Form
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing + CTA */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {bushDinnerOptions.map((opt) => (
                  <Card
                    key={opt.label}
                    className="overflow-hidden border-amber-200 dark:border-amber-800 text-center"
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-1">
                      <p className="text-2xl font-bold text-primary">{opt.price}</p>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  An intimate dinner set in the heart of the bush — curated menus, traditional flavours,
                  and an atmosphere unlike anything else at the festival.
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Candlelit outdoor setting",
                    "Traditional cuisine & beverages",
                    "Dedicated serving staff",
                    "Complements VIP Full Package",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={accommodationBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="w-full gap-2" data-testid="button-book-bush-dinner">
                  Reserve via Form
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: CULTURAL ADD-ONS ─────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Cultural Add-Ons</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Experiences &amp; Activities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enrich your stay with authentic cultural experiences. Book via the registration form —
              each activity has limited capacity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {culturalAddOns.map((addon) => {
              const Icon = addon.icon;
              return (
                <Card
                  key={addon.id}
                  className="hover-elevate cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
                  onClick={openBookingForm}
                  data-testid={`card-addon-${addon.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm leading-snug">{addon.name}</CardTitle>
                        <p className="text-sm font-bold text-primary mt-0.5">{addon.price}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0 pb-4">
                    <a
                      href={accommodationBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                        Add via Form
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: BOOKING INFORMATION ──────────────────────────────────── */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6">
              <CardHeader className="text-center">
                <CardTitle className="font-serif text-2xl">Booking Information</CardTitle>
                <CardDescription>
                  Important details about reservations and deposits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    {
                      title: "30% Deposit Required",
                      body: "A 30% deposit is required to secure your reservation. Payment via Paynow (mobile money or card).",
                    },
                    {
                      title: "48-Hour Payment Window",
                      body: "Deposits must be paid within 48 hours. Unpaid reservations will automatically expire.",
                    },
                    {
                      title: "USD Pricing",
                      body: "All prices are in US Dollars. Payment is processed at current exchange rates.",
                    },
                    {
                      title: "Limited Capacity",
                      body: "Each package has limited capacity. Early booking is strongly recommended.",
                    },
                  ].map(({ title, body }) => (
                    <div key={title} className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        {title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{body}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="text-center">
                  <a
                    href={accommodationBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="gap-2"
                      data-testid="button-start-booking"
                    >
                      Register &amp; Book Now
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
