import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Award, Tent, ArrowRight, Star, Crown, Sparkles, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Announcement, Company, PastEvent } from "@shared/schema";
import logoImage from "@assets/DK_LOGO_1769944557082.png";
import kingdomBlueLogo from "@assets/kbf_logo_1770113825582.png";
import eventImage1 from "@assets/IMG_0740_1770114288425.jpg";
import eventImage2 from "@assets/IMG_0739_1770114288425.jpg";
import eventImage3 from "@assets/IMG_0738_1770114288426.jpg";
import eventImage4 from "@assets/IMG_0732_1770114288426.jpg";

const heroImages = [eventImage1, eventImage2, eventImage3, eventImage4];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const { data: sponsors } = useQuery<Company[]>({
    queryKey: ["/api/sponsors"],
  });

  const { data: pastEvents } = useQuery<PastEvent[]>({
    queryKey: ["/api/past-events"],
  });

  const featuredSponsors = sponsors?.filter(s => s.applicationStatus === "approved").slice(0, 4) || [];
  const recentEvents = pastEvents?.slice(0, 3) || [];
  const latestAnnouncement = announcements?.find(a => a.isPublished);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt={`Event highlight ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, index) => {
            const isActive = index === currentImageIndex;
            return (
              <button
                key={`dot-${index}`}
                onClick={() => setCurrentImageIndex(index)}
                className={isActive 
                  ? "h-2 w-6 rounded-full transition-all bg-amber-400"
                  : "h-2 w-2 rounded-full transition-all bg-white/50"
                }
                aria-label={`Go to slide ${index + 1}`}
                data-testid={`carousel-dot-${index}`}
              />
            );
          })}
        </div>
        
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-6 bg-amber-500/20 text-amber-100 border-amber-400/30" data-testid="badge-event-date">
                <Calendar className="w-3 h-3 mr-1" />
                April 3-6, 2026
              </Badge>
              
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                Imiklomelo Ka<br />
                <span className="text-amber-400">Dakamela</span>
              </h1>
              
              <p className="text-lg md:text-xl text-amber-100/90 mb-8 max-w-xl mx-auto lg:mx-0">
                The Official Chief Dakamela Achievers Awards & Cultural Gathering. 
                Where tradition meets excellence, and heritage is celebrated.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2 bg-amber-500 hover:bg-amber-600 text-amber-950" data-testid="hero-button-register">
                    Register Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/event">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-amber-400/50 text-white hover:bg-white/10" data-testid="hero-button-learn-more">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-10">
                <div className="flex items-center gap-2 text-amber-100">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <span className="text-sm">Nkayi District, Zimbabwe</span>
                </div>
                <div className="flex items-center gap-2 text-amber-100">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="text-sm">5000+ Attendees</span>
                </div>
                <div className="flex items-center gap-2 text-amber-100">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-sm">Cultural Excellence</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl scale-110" />
                <img 
                  src={logoImage} 
                  alt="Chief Dakamela Logo" 
                  className="relative w-64 md:w-80 lg:w-96 drop-shadow-2xl"
                  data-testid="hero-logo"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Main Sponsor Section */}
      <section className="py-8 bg-card/50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Main Sponsor</span>
            <div className="bg-white rounded-xl px-8 py-4 shadow-sm">
              <img 
                src={kingdomBlueLogo} 
                alt="KingdomBlue - Main Sponsor" 
                className="h-12 md:h-16 w-auto object-contain"
                data-testid="img-main-sponsor"
              />
            </div>
          </div>
        </div>
      </section>

      {latestAnnouncement && (
        <section className="py-4 bg-primary/10 border-y">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary" className="shrink-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Announcement
              </Badge>
              <p className="text-muted-foreground truncate" data-testid="text-announcement">
                {latestAnnouncement.title}: {latestAnnouncement.content}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Crown className="w-3 h-3 mr-1" />
              Event Highlights
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              What Awaits You
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience a celebration of cultural heritage, achievement recognition, and community gathering 
              at Dakamela Hall, Nkayi District, Zimbabwe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-elevate" data-testid="card-feature-awards">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Achievers Awards</CardTitle>
                <CardDescription>
                  Witness the Chief honor outstanding individuals who have made remarkable contributions to our community and heritage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate" data-testid="card-feature-cultural">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-serif">Cultural Exhibitions</CardTitle>
                <CardDescription>
                  Explore art, fashion, food, and traditional crafts from talented exhibitors showcasing African heritage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate" data-testid="card-feature-camping">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Tent className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Camping & Accommodation</CardTitle>
                <CardDescription>
                  Stay on the Royal Grounds with premium camping options, meal services, and modern amenities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Link href="/event">
              <Button variant="outline" className="gap-2" data-testid="button-view-event-details">
                View Full Event Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Award className="w-3 h-3 mr-1" />
              Ceremony Highlights
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Moments of Excellence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Witness the Chief conferring awards upon deserving achievers in our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
              <img 
                src={eventImage1} 
                alt="Chief Dakamela conferring award" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold text-sm">Award Ceremony</p>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
              <img 
                src={eventImage2} 
                alt="Cultural celebration moment" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold text-sm">Cultural Celebration</p>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
              <img 
                src={eventImage3} 
                alt="Certificate presentation" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold text-sm">Certificate Presentation</p>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
              <img 
                src={eventImage4} 
                alt="Traditional gathering" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold text-sm">Traditional Gathering</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/past-events">
              <Button variant="outline" className="gap-2" data-testid="button-view-more-photos">
                View Heritage Archive
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {recentEvents.length > 0 && (
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Heritage Archive</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Past Celebrations
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore the rich history of Imiklomelo Ka Dakamela and the achievers who have been honored.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover-elevate" data-testid={`card-past-event-${event.id}`}>
                  <div className="aspect-video bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center">
                    <span className="font-serif text-4xl font-bold text-white">{event.year}</span>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{event.summary}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/past-events">
                <Button variant="outline" className="gap-2" data-testid="button-view-heritage-archive">
                  View Heritage Archive
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {featuredSponsors.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Our Partners</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Proud Sponsors
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We thank our sponsors for their commitment to preserving and celebrating our cultural heritage.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredSponsors.map((sponsor) => (
                <Card 
                  key={sponsor.id} 
                  className={`p-6 flex flex-col items-center justify-center text-center ${sponsor.isPrimarySponsor ? 'border-primary border-2' : ''}`}
                  data-testid={`card-sponsor-${sponsor.id}`}
                >
                  {sponsor.isPrimarySponsor && (
                    <Badge className="mb-2 bg-primary text-primary-foreground">Main Sponsor</Badge>
                  )}
                  <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center mb-3 p-2">
                    {sponsor.logoUrl ? (
                      <img 
                        src={sponsor.logoUrl} 
                        alt={sponsor.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="font-semibold">{sponsor.name}</h4>
                  {sponsor.sponsorshipTier && (
                    <p className="text-xs text-muted-foreground mt-1">{sponsor.sponsorshipTier} Tier</p>
                  )}
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/sponsors">
                <Button variant="outline" className="gap-2" data-testid="button-view-all-sponsors">
                  View All Sponsors & Exhibitors
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 dark:from-amber-950 dark:via-orange-900 dark:to-yellow-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
            Join Us at Imiklomelo Ka Dakamela 2026
          </h2>
          <p className="text-amber-100/90 max-w-2xl mx-auto mb-8">
            Be part of this historic celebration of culture, achievement, and community. 
            Register now to secure your accommodation and services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-amber-500 hover:bg-amber-600 text-amber-950" data-testid="cta-button-register">
                Register as Attendee
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/accommodation">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-amber-400/50 text-white hover:bg-white/10" data-testid="cta-button-book-camping">
                Book Camping
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
