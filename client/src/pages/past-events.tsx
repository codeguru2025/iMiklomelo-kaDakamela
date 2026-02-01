import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Award, Calendar, MapPin, Users, Image, Video, Building2, 
  ChevronRight, Crown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { PastEvent, Awardee, Company } from "@shared/schema";

interface PastEventWithDetails extends PastEvent {
  awardees?: Awardee[];
  sponsors?: Company[];
}

export default function PastEvents() {
  const [selectedEvent, setSelectedEvent] = useState<PastEventWithDetails | null>(null);

  const { data: pastEvents, isLoading } = useQuery<PastEventWithDetails[]>({
    queryKey: ["/api/past-events"],
  });

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 dark:from-amber-950 dark:via-orange-900 dark:to-yellow-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-500/20 text-amber-100 border-amber-400/30">
            <Award className="w-3 h-3 mr-1" />
            Heritage Archive
          </Badge>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Past Celebrations
          </h1>
          
          <p className="text-lg text-amber-100/90 mb-8 max-w-2xl mx-auto">
            Explore the rich history of Imiklomelo Ka Dakamela. Discover past awardees, 
            memorable moments, and the legacy of cultural excellence.
          </p>

          <div className="flex items-center justify-center gap-2 text-amber-100">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-sm">All awards are conferred by the Chief</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i}>
                  <Skeleton className="aspect-video" />
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : pastEvents && pastEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <Dialog key={event.id}>
                  <DialogTrigger asChild>
                    <Card 
                      className="cursor-pointer overflow-hidden hover-elevate"
                      onClick={() => setSelectedEvent(event)}
                      data-testid={`card-past-event-${event.id}`}
                    >
                      <div className="aspect-video bg-gradient-to-br from-amber-600 to-orange-700 relative flex items-center justify-center">
                        {event.imageUrl ? (
                          <img 
                            src={event.imageUrl} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-serif text-5xl font-bold text-white/90">{event.year}</span>
                        )}
                        <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0">
                          {event.edition || `Edition ${event.year}`}
                        </Badge>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center justify-between">
                          {event.title}
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{event.summary}</CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {event.eventDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.eventDate).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>

                  <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl">{event.title}</DialogTitle>
                      <DialogDescription>
                        {event.edition || `Edition ${event.year}`} • {event.location}
                      </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh]">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="awardees">Awardees</TabsTrigger>
                          <TabsTrigger value="gallery">Gallery</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-4">
                          {event.imageUrl && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <img 
                                src={event.imageUrl} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Event Summary</h4>
                              <p className="text-muted-foreground">{event.summary}</p>
                            </div>

                            {event.eventDate && (
                              <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span>
                                  {new Date(event.eventDate).toLocaleDateString('en-ZA', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}

                            {event.videoUrl && (
                              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                <iframe 
                                  src={event.videoUrl}
                                  className="w-full h-full"
                                  allowFullScreen
                                  title={`${event.title} video`}
                                />
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="awardees" className="mt-4">
                          {event.awardees && event.awardees.length > 0 ? (
                            <div className="grid gap-4">
                              {event.awardees.map((awardee) => (
                                <Card key={awardee.id} data-testid={`card-awardee-${awardee.id}`}>
                                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                                      {awardee.imageUrl ? (
                                        <img 
                                          src={awardee.imageUrl} 
                                          alt={awardee.name}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        <Award className="w-8 h-8 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <CardTitle className="text-lg">{awardee.name}</CardTitle>
                                      {awardee.title && (
                                        <p className="text-sm text-muted-foreground">{awardee.title}</p>
                                      )}
                                      <Badge variant="secondary" className="mt-2">
                                        {awardee.awardName}
                                      </Badge>
                                      {awardee.awardDescription && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                          {awardee.awardDescription}
                                        </p>
                                      )}
                                    </div>
                                  </CardHeader>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Award className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                              <p className="text-muted-foreground">Awardee details will be added soon.</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="gallery" className="mt-4">
                          <div className="text-center py-8">
                            <Image className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">Photo gallery will be added soon.</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Award className="w-20 h-20 mx-auto text-muted-foreground/30 mb-6" />
              <h3 className="font-serif text-2xl font-bold mb-3">Archive Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                The heritage archive is being prepared. Check back soon to explore 
                the history of Imiklomelo Ka Dakamela and our distinguished awardees.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Crown className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              About the Awards
            </h2>
            <p className="text-muted-foreground mb-6">
              The Chief Dakamela Achievers Awards are not determined by public nomination or voting. 
              In keeping with sacred tradition, all awards are privately decided and personally 
              conferred by the Chief. This platform documents and celebrates past recipients 
              while honoring the authority of our cultural traditions.
            </p>
            <Badge variant="outline" className="text-sm">
              <Award className="w-3 h-3 mr-1" />
              Awards by Tradition, Not Popular Vote
            </Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
