import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, MapPin, Clock, Users, Award, Tent, Utensils, Music, 
  Camera, Shield, Car, ArrowRight, CheckCircle2, Crown
} from "lucide-react";
import logoImage from "@assets/DK_LOGO_1769944557082.png";

const schedule = [
  { 
    day: "Day 1 - Friday", 
    date: "April 3, 2026",
    events: [
      { time: "14:00", title: "Gates Open", description: "Registration and check-in begins" },
      { time: "16:00", title: "Welcome Ceremony", description: "Traditional welcome and cultural performances" },
      { time: "19:00", title: "Community Dinner", description: "Traditional feast and networking" },
    ]
  },
  { 
    day: "Day 2 - Saturday", 
    date: "April 4, 2026",
    events: [
      { time: "08:00", title: "Morning Rituals", description: "Traditional cultural ceremonies" },
      { time: "10:00", title: "Exhibition Opens", description: "Art, crafts, fashion, and food stalls" },
      { time: "14:00", title: "Chief's Address", description: "Keynote speech by Chief Dakamela" },
      { time: "16:00", title: "Achievers Awards Ceremony", description: "Official conferment of awards" },
      { time: "20:00", title: "Gala Dinner", description: "Celebration dinner with entertainment" },
    ]
  },
  { 
    day: "Day 3 - Sunday", 
    date: "April 5, 2026",
    events: [
      { time: "08:00", title: "Cultural Ceremonies", description: "Traditional rituals and celebrations" },
      { time: "10:00", title: "Community Activities", description: "Sports, games, and family events" },
      { time: "14:00", title: "Cultural Performances", description: "Traditional music and dance" },
      { time: "19:00", title: "Evening Entertainment", description: "Music and celebration" },
    ]
  },
  { 
    day: "Day 4 - Monday", 
    date: "April 6, 2026",
    events: [
      { time: "08:00", title: "Thanksgiving Ceremony", description: "Community prayers and gratitude" },
      { time: "10:00", title: "Final Cultural Performances", description: "Traditional music and dance" },
      { time: "13:00", title: "Closing Ceremony", description: "Farewell and departure" },
    ]
  },
];

const amenities = [
  { icon: Tent, label: "Premium Camping", description: "Various camp types with optional tents and bedding" },
  { icon: Utensils, label: "Meal Services", description: "Breakfast, lunch, and dinner packages" },
  { icon: Shield, label: "Security", description: "24/7 security with optional lockers" },
  { icon: Car, label: "Parking", description: "Secure on-site parking facilities" },
  { icon: Music, label: "Entertainment", description: "Traditional music and cultural performances" },
  { icon: Camera, label: "Photography", description: "Professional event photography" },
];

export default function Event() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 dark:from-amber-950 dark:via-orange-900 dark:to-yellow-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-500/20 text-amber-100 border-amber-400/30">
            <Calendar className="w-3 h-3 mr-1" />
            April 3-6, 2026
          </Badge>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Event 2026
          </h1>
          
          <p className="text-lg text-amber-100/90 mb-8 max-w-2xl mx-auto">
            Join thousands of attendees from across the world for four days of cultural celebration, 
            achievement recognition, and community bonding.
          </p>

          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2 text-amber-100">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Dakamela Hall, Nkayi District, Zimbabwe</span>
            </div>
            <div className="flex items-center gap-2 text-amber-100">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Expected: 5,000+ Attendees</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">About the Event</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              A Celebration of Heritage
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Imiklomelo Ka Dakamela is the official Chief Dakamela Achievers Awards & Cultural Gathering, 
                a prestigious annual event that brings together communities to celebrate achievement, preserve 
                tradition, and honor those who have made exceptional contributions.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                This is not merely an event—it is a sacred gathering where tradition meets modernity, 
                where the Chief personally confers awards upon deserving individuals, and where our 
                cultural heritage is celebrated and preserved for future generations.
              </p>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <Crown className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Awards by Tradition</h4>
                  <p className="text-sm text-muted-foreground">
                    All awards are privately decided and conferred by the Chief. 
                    There are no public nominations or voting—this preserves the sacred 
                    authority of the tradition.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-2xl blur-2xl" />
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 p-8 flex items-center justify-center">
                <img src={logoImage} alt="Chief Dakamela Logo" className="w-full max-w-xs drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Clock className="w-3 h-3 mr-1" />
              Event Schedule
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Four Days of Celebration
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schedule.map((day, index) => (
              <Card key={index} className="overflow-hidden" data-testid={`card-schedule-day-${index + 1}`}>
                <CardHeader className="bg-primary/5">
                  <CardTitle className="font-serif text-xl">{day.day}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {day.date}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {event.time}
                          </Badge>
                          <div>
                            <h4 className="font-semibold text-sm">{event.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Facilities</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Amenities & Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive services to ensure your comfort and convenience during the event.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {amenities.map((amenity, index) => (
              <Card key={index} className="text-center hover-elevate" data-testid={`card-amenity-${index}`}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <amenity.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-base">{amenity.label}</CardTitle>
                  <CardDescription className="text-sm">{amenity.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Attendance Types</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Choose Your Experience
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover-elevate" data-testid="card-attendance-standard">
              <CardHeader className="text-center">
                <CardTitle className="font-serif">Standard</CardTitle>
                <CardDescription>General admission to all public events and ceremonies</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Access to all ceremonies", "Exhibition entry", "Community meals", "Camping options"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-primary border-2" data-testid="card-attendance-vip">
              <CardHeader className="text-center">
                <Badge className="mb-2 mx-auto">Popular</Badge>
                <CardTitle className="font-serif">VIP</CardTitle>
                <CardDescription>Enhanced experience with premium seating and services</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Premium seating", "VIP lounge access", "Gala dinner included", "Priority parking", "Exclusive meet & greet"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-attendance-delegation">
              <CardHeader className="text-center">
                <CardTitle className="font-serif">Delegation</CardTitle>
                <CardDescription>For cultural guests and official delegations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Reserved seating", "Cultural escort", "Private briefings", "Accommodation priority", "Translation services"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 dark:from-amber-950 dark:via-orange-900 dark:to-yellow-800 relative">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-amber-100/90 max-w-xl mx-auto mb-8">
            Register now to secure your place at Imiklomelo Ka Dakamela 2026. 
            Accommodation spaces are limited.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-amber-500 hover:bg-amber-600 text-amber-950">
                Register Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/accommodation">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-amber-400/50 text-white hover:bg-white/10">
                View Accommodation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
