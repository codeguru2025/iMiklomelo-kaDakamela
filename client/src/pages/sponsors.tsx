import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Crown, Palette, Shirt, UtensilsCrossed, Handshake, 
  Wrench, ArrowRight, ExternalLink, Globe, Mail
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Company } from "@shared/schema";

const categoryIcons: Record<string, typeof Palette> = {
  art: Palette,
  fashion: Shirt,
  food: UtensilsCrossed,
  cultural_crafts: Handshake,
  services: Wrench,
};

const tierColors: Record<string, string> = {
  platinum: "bg-gradient-to-br from-gray-300 to-gray-500",
  gold: "bg-gradient-to-br from-amber-400 to-yellow-600",
  silver: "bg-gradient-to-br from-gray-200 to-gray-400",
  bronze: "bg-gradient-to-br from-amber-700 to-orange-800",
};

export default function Sponsors() {
  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const approvedCompanies = companies?.filter(c => c.applicationStatus === "approved") || [];
  const sponsors = approvedCompanies.filter(c => c.role === "sponsor" || c.role === "both");
  const exhibitors = approvedCompanies.filter(c => c.role === "exhibitor" || c.role === "both");
  
  const primarySponsor = sponsors.find(s => s.isPrimarySponsor);
  const otherSponsors = sponsors.filter(s => !s.isPrimarySponsor);

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 dark:from-amber-950 dark:via-orange-900 dark:to-yellow-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-500/20 text-amber-100 border-amber-400/30">
            <Building2 className="w-3 h-3 mr-1" />
            Partners & Exhibitors
          </Badge>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Our Sponsors & Exhibitors
          </h1>
          
          <p className="text-lg text-amber-100/90 mb-8 max-w-2xl mx-auto">
            We thank our generous sponsors and talented exhibitors who make 
            iMiklomelo kaDakamela Cultural Festival a truly memorable celebration.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="sponsors" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="sponsors" data-testid="tab-sponsors">
                <Building2 className="w-4 h-4 mr-2" />
                Sponsors
              </TabsTrigger>
              <TabsTrigger value="exhibitors" data-testid="tab-exhibitors">
                <Palette className="w-4 h-4 mr-2" />
                Exhibitors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sponsors">
              {isLoading ? (
                <div className="space-y-8">
                  <Skeleton className="h-48 w-full max-w-xl mx-auto" />
                  <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
                  </div>
                </div>
              ) : sponsors.length > 0 ? (
                <div className="space-y-12">
                  {primarySponsor && (
                    <div className="text-center">
                      <Badge className="mb-4">
                        <Crown className="w-3 h-3 mr-1" />
                        Main Sponsor
                      </Badge>
                      <Card className="max-w-xl mx-auto border-primary border-2" data-testid={`card-sponsor-${primarySponsor.id}`}>
                        <CardHeader className="text-center pb-2">
                          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
                            {primarySponsor.logoUrl ? (
                              <img 
                                src={primarySponsor.logoUrl} 
                                alt={primarySponsor.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-12 h-12 text-white" />
                            )}
                          </div>
                          <CardTitle className="font-serif text-2xl">{primarySponsor.name}</CardTitle>
                          {primarySponsor.sponsorshipTier && (
                            <Badge variant="secondary">{primarySponsor.sponsorshipTier} Sponsor</Badge>
                          )}
                        </CardHeader>
                        <CardContent className="text-center">
                          {primarySponsor.description && (
                            <p className="text-muted-foreground mb-4">{primarySponsor.description}</p>
                          )}
                          <div className="flex justify-center gap-4">
                            {primarySponsor.website && (
                              <a href={primarySponsor.website} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Globe className="w-4 h-4" />
                                  Website
                                </Button>
                              </a>
                            )}
                            {primarySponsor.contactEmail && (
                              <a href={`mailto:${primarySponsor.contactEmail}`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Mail className="w-4 h-4" />
                                  Contact
                                </Button>
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {otherSponsors.length > 0 && (
                    <div>
                      <h3 className="font-serif text-xl font-bold text-center mb-6">Supporting Sponsors</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherSponsors.map((sponsor) => (
                          <Card key={sponsor.id} className="hover-elevate" data-testid={`card-sponsor-${sponsor.id}`}>
                            <CardHeader className="text-center">
                              <div className={`w-16 h-16 mx-auto rounded-full ${tierColors[sponsor.sponsorshipTier?.toLowerCase() || 'bronze'] || 'bg-muted'} flex items-center justify-center mb-3`}>
                                {sponsor.logoUrl ? (
                                  <img 
                                    src={sponsor.logoUrl} 
                                    alt={sponsor.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <Building2 className="w-8 h-8 text-white" />
                                )}
                              </div>
                              <CardTitle className="text-lg">{sponsor.name}</CardTitle>
                              {sponsor.sponsorshipTier && (
                                <Badge variant="outline" className="mt-1">{sponsor.sponsorshipTier}</Badge>
                              )}
                            </CardHeader>
                            {sponsor.description && (
                              <CardContent className="text-center pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-2">{sponsor.description}</p>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Building2 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sponsors Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Our sponsor list is being finalized. Check back soon!
                  </p>
                  <Link href="/apply">
                    <Button className="gap-2">
                      Become a Sponsor
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="exhibitors">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40" />)}
                </div>
              ) : exhibitors.length > 0 ? (
                <div className="space-y-8">
                  <div className="flex flex-wrap justify-center gap-2">
                    {["All", "Art", "Fashion", "Food", "Cultural Crafts", "Services"].map(category => (
                      <Badge 
                        key={category} 
                        variant="outline" 
                        className="cursor-pointer hover-elevate px-4 py-1"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exhibitors.map((exhibitor) => {
                      const IconComponent = exhibitor.exhibitionCategory 
                        ? categoryIcons[exhibitor.exhibitionCategory] || Palette 
                        : Palette;
                      
                      return (
                        <Card key={exhibitor.id} className="hover-elevate" data-testid={`card-exhibitor-${exhibitor.id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <IconComponent className="w-6 h-6 text-primary" />
                              </div>
                              {exhibitor.exhibitionCategory && (
                                <Badge variant="secondary" className="capitalize text-xs">
                                  {exhibitor.exhibitionCategory.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg mt-3">{exhibitor.name}</CardTitle>
                            {exhibitor.description && (
                              <CardDescription className="line-clamp-2">
                                {exhibitor.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex gap-2">
                              {exhibitor.website && (
                                <a href={exhibitor.website} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" className="gap-1">
                                    <ExternalLink className="w-3 h-3" />
                                    Visit
                                  </Button>
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Palette className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Exhibitors Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Our exhibitor list is being finalized. Check back soon!
                  </p>
                  <Link href="/apply">
                    <Button className="gap-2">
                      Apply to Exhibit
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              Partner With Us
            </h2>
            <p className="text-muted-foreground mb-8">
              Interested in sponsoring or exhibiting at iMiklomelo kaDakamela Cultural Festival 2026? 
              Join us in celebrating African heritage and supporting cultural excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <Building2 className="w-4 h-4" />
                  Apply as Sponsor
                </Button>
              </Link>
              <Link href="/apply">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <Palette className="w-4 h-4" />
                  Apply as Exhibitor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
