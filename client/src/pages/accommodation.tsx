import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Tent, Bed, Utensils, Zap, Lock, Car, Users, Star, 
  ArrowRight, CheckCircle2, Info
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Camp, CampService } from "@shared/schema";

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
    tent: Tent,
    bedding: Bed,
    meals: Utensils,
    power: Zap,
    locker: Lock,
    transport: Car,
  };

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 dark:from-amber-950 dark:via-orange-900 dark:to-yellow-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-500/20 text-amber-100 border-amber-400/30">
            <Tent className="w-3 h-3 mr-1" />
            Camping & Accommodation
          </Badge>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Stay at the Royal Grounds
          </h1>
          
          <p className="text-lg text-amber-100/90 mb-8 max-w-2xl mx-auto">
            Experience traditional hospitality with modern comforts. Choose from our range 
            of camping options and add services to customize your stay.
          </p>

          <div className="flex items-center justify-center gap-2 text-amber-100">
            <Info className="w-5 h-5 text-amber-400" />
            <span className="text-sm">A deposit is required to secure your reservation</span>
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
              shared facilities and event venues.
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
                    <CardTitle className="font-serif flex items-center justify-between">
                      {camp.name}
                      <span className="text-primary font-bold">
                        R{parseFloat(camp.pricePerNight).toFixed(0)}/night
                      </span>
                    </CardTitle>
                    <CardDescription>{camp.description}</CardDescription>
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
                          {camp.amenities.map((amenity, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              {amenity}
                            </li>
                          ))}
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
              Enhance your stay with optional services. These can be added during the 
              booking process.
            </p>
          </div>

          {servicesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {services.filter(s => s.isActive).map((service) => {
                const IconComponent = serviceIcons[service.name.toLowerCase()] || Star;
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
                              R{parseFloat(service.price).toFixed(0)}
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
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        {service.capacity && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Limited availability: {service.capacity} remaining
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
                      Deposit Required
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      A 30% deposit is required to secure your reservation. 
                      The remaining balance is due upon arrival.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Reservation Window
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Deposits must be paid within 48 hours of registration. 
                      Unpaid reservations will automatically expire.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Capacity Limited
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Each camp type has limited capacity. Early booking is 
                      recommended to secure your preferred option.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Confirmation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You will receive a confirmation email with your booking 
                      details and payment instructions.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Link href="/register">
                    <Button size="lg" className="gap-2" data-testid="button-start-booking">
                      Start Your Booking
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
