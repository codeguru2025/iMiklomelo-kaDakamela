import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Tent, Bed, Utensils, Zap, Lock, Car, Users, Star, 
  ArrowRight, CheckCircle2, Info, Coffee, Droplets, Sparkles,
  Wifi, Battery, Beer, TableIcon, Music
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Camp, CampService } from "@shared/schema";
import { assets } from "@/assets/cdn";
const campPlanImage = assets.campPlan;

export default function Accommodation() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const { data: camps, isLoading: campsLoading } = useQuery<Camp[]>({
    queryKey: ["/api/camps"],
  });

  const { data: services, isLoading: servicesLoading } = useQuery<CampService[]>({
    queryKey: ["/api/camp-services"],
  });

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const serviceIcons: Record<string, typeof Tent> = {
    breakfast: Coffee,
    lunch: Utensils,
    supper: Utensils,
    "bathing water": Droplets,
    "massage spa": Sparkles,
    "ice bath": Droplets,
    "wifi access": Wifi,
    "power bank rental": Battery,
    tent: Tent,
    bedding: Bed,
    meals: Utensils,
    power: Zap,
    locker: Lock,
    transport: Car,
  };

  const getServiceIcon = (serviceName: string) => {
    const lowerName = serviceName.toLowerCase();
    for (const [key, Icon] of Object.entries(serviceIcons)) {
      if (lowerName.includes(key)) return Icon;
    }
    return Star;
  };

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 dark:from-amber-950 dark:via-orange-900 dark:to-yellow-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-500/20 text-amber-100 border-amber-400/30">
            <Tent className="w-3 h-3 mr-1" />
            Premium Cultural Camping Sanctuary
          </Badge>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Stay at the Royal Grounds
          </h1>
          
          <p className="text-lg text-amber-100/90 mb-8 max-w-2xl mx-auto">
            Experience traditional hospitality in our Premium Cultural Camping Sanctuary. 
            Prices from just $25/day or $60 for the full camp duration.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-amber-100">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-400" />
              <span className="text-sm">30% deposit required to secure your spot</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              <span className="text-sm">All prices in USD</span>
            </div>
          </div>
        </div>
      </section>

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
              At the heart of our camp lies the Isibaya SikaDakamela - a beautiful 
              thatched house serving as the social heart of the gathering.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Beer className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">Bar Service</p>
                        <p className="text-xs text-muted-foreground">Refreshments & drinks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <TableIcon className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">Pool Tables</p>
                        <p className="text-xs text-muted-foreground">Entertainment area</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Music className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">Social Lounge</p>
                        <p className="text-xs text-muted-foreground">Meet fellow guests</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Zap className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">Charging Station</p>
                        <p className="text-xs text-muted-foreground">Power bank rental</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-semibold">Camp Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Inkundla Yomlilo - Sleeping Circle with premium tents</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Isigcawu Sabantu - Public & Social gathering areas</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Ground level lighting throughout the camp</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Connected power points at select locations</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>24-hour security patrol</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <img 
                src={campPlanImage} 
                alt="Premium Cultural Camping Sanctuary Layout" 
                className="w-full rounded-lg shadow-xl border"
                data-testid="img-camp-plan"
              />
              <Badge className="absolute top-4 left-4 bg-background/90">
                Camp Layout
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Camp Types</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Choose Your Accommodation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select a camp type that suits your needs. All camps include access to 
              the Isibaya SikaDakamela (Camp Centre) and event venues.
            </p>
          </div>

          {campsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : camps && camps.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {camps.filter(c => c.isActive).map((camp, index) => (
                <Card 
                  key={camp.id} 
                  className={`relative overflow-hidden ${index === 1 ? 'border-primary border-2' : ''}`}
                  data-testid={`card-camp-${camp.id}`}
                >
                  {index === 1 && (
                    <Badge className="absolute top-4 right-4">Popular</Badge>
                  )}
                  
                  <div className="aspect-video bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center">
                    <Tent className="w-16 h-16 text-white/80" />
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="font-serif">{camp.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" data-testid={`price-per-day-${camp.id}`}>
                        ${parseFloat(camp.pricePerDay)}/day
                      </Badge>
                      <Badge variant="outline" data-testid={`price-full-${camp.id}`}>
                        ${parseFloat(camp.priceFullCamp)} full camp
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">{camp.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {camp.capacity} spaces available</span>
                    </div>
                    
                    {camp.amenities && camp.amenities.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Included:</h4>
                        <ul className="space-y-1">
                          {camp.amenities.slice(0, 4).map((amenity, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              {amenity}
                            </li>
                          ))}
                          {camp.amenities.length > 4 && (
                            <li className="text-sm text-primary">
                              +{camp.amenities.length - 4} more amenities
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Link href="/register" className="w-full">
                      <Button className="w-full gap-2" data-testid={`button-book-camp-${camp.id}`}>
                        Book This Camp
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tent className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Camps Coming Soon</h3>
              <p className="text-muted-foreground">
                Accommodation options will be announced shortly. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Optional Services</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Add-On Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enhance your stay with optional services. Each service has limited capacity 
              and can be added during registration.
            </p>
          </div>

          {servicesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {services.filter(s => s.isActive).map((service) => {
                const IconComponent = getServiceIcon(service.name);
                const isSelected = selectedServices.includes(service.id);
                
                return (
                  <Card 
                    key={service.id} 
                    className={`cursor-pointer transition-all ${isSelected ? 'border-primary border-2 bg-primary/5' : 'hover-elevate'}`}
                    onClick={() => toggleService(service.id)}
                    data-testid={`card-service-${service.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{service.name}</CardTitle>
                            <p className="text-sm font-semibold text-primary">
                              ${parseFloat(service.price)}
                            </p>
                          </div>
                        </div>
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggleService(service.id)}
                          data-testid={`checkbox-service-${service.id}`}
                        />
                      </div>
                    </CardHeader>
                    {service.description && (
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                        {service.capacity && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Limited: {service.capacity} available
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Services Coming Soon</h3>
              <p className="text-muted-foreground">
                Optional services will be announced shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-background">
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
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      30% Deposit Required
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      A 30% deposit is required to secure your reservation. 
                      Payment via Paynow (mobile money or card).
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      48-Hour Payment Window
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Deposits must be paid within 48 hours. 
                      Unpaid reservations will automatically expire.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      USD Pricing
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      All prices are in US Dollars. Payment is processed 
                      at current exchange rates.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Limited Capacity
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Each camp type has limited capacity. Early booking is 
                      recommended to secure your preferred option.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Link href="/register">
                    <Button size="lg" className="gap-2" data-testid="button-start-booking">
                      Register & Book Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
