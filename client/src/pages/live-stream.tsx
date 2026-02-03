import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Video, Play, Lock, Loader2, Tv, Users, Clock, CheckCircle2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import type { StreamSettings, Recording } from "@shared/schema";

const accessCodeSchema = z.object({
  accessCode: z.string().min(6, "Please enter your access code"),
});

const purchaseSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
});

type AccessCodeForm = z.infer<typeof accessCodeSchema>;
type PurchaseForm = z.infer<typeof purchaseSchema>;

export default function LiveStream() {
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [accessEmail, setAccessEmail] = useState("");
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const { data: streamSettings, isLoading: settingsLoading } = useQuery<StreamSettings>({
    queryKey: ["/api/stream/settings"],
  });

  const { data: recordings } = useQuery<Recording[]>({
    queryKey: ["/api/recordings"],
  });

  const accessForm = useForm<AccessCodeForm>({
    resolver: zodResolver(accessCodeSchema),
    defaultValues: { accessCode: "" },
  });

  const purchaseForm = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { fullName: "", email: "", phone: "" },
  });

  const verifyAccessMutation = useMutation({
    mutationFn: async (data: AccessCodeForm) => {
      const res = await apiRequest("POST", "/api/stream/verify-access", data);
      return res.json();
    },
    onSuccess: (data) => {
      setHasAccess(true);
      setAccessEmail(data.email);
      toast({ title: "Access granted!", description: "You now have access to the live stream." });
    },
    onError: () => {
      toast({ title: "Invalid access code", description: "Please check your code and try again.", variant: "destructive" });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: PurchaseForm) => {
      const res = await apiRequest("POST", "/api/stream/purchase", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast({ title: "Processing payment", description: "Please complete the payment to get access." });
      }
    },
    onError: () => {
      toast({ title: "Payment failed", description: "Please try again later.", variant: "destructive" });
    },
  });

  const streamPrice = streamSettings?.streamPrice || "15.00";
  const isLive = streamSettings?.isLive || false;
  const freeRecordings = recordings?.filter(r => r.isFree) || [];

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Tv className="w-3 h-3 mr-1" />
            Virtual Attendance
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Watch Live from Anywhere
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Can't make it to Dakamela Hall? Experience the Chief Dakamela Achievers Awards & Cultural Gathering live, wherever you are.
          </p>
          {isLive && (
            <Badge className="mt-6 bg-red-500 text-white animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
              LIVE NOW
            </Badge>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {hasAccess && isLive ? (
              <Card className="overflow-hidden">
                <div className="aspect-video bg-black relative">
                  {streamSettings?.streamUrl ? (
                    <iframe
                      src={streamSettings.streamUrl}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Stream will begin shortly...</p>
                      </div>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-serif">{streamSettings?.streamTitle || "Live Stream"}</CardTitle>
                  <CardDescription>{streamSettings?.streamDescription}</CardDescription>
                </CardHeader>
              </Card>
            ) : hasAccess && !isLive ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-serif text-2xl font-bold mb-2">Stream Not Active</h3>
                  <p className="text-muted-foreground mb-4">
                    The live stream will begin on April 3-6, 2026. You have access and will be able to watch when it starts.
                  </p>
                  <Badge variant="outline">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Access Confirmed: {accessEmail}
                  </Badge>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-serif text-2xl font-bold mb-2">Get Access to Live Stream</h3>
                  <p className="text-muted-foreground mb-6">
                    Purchase access to watch the event live or enter your access code if you've already paid.
                  </p>
                  
                  <div className="max-w-md mx-auto space-y-6">
                    <Form {...accessForm}>
                      <form onSubmit={accessForm.handleSubmit((data) => verifyAccessMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={accessForm.control}
                          name="accessCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Already have an access code?</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your access code" {...field} data-testid="input-access-code" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={verifyAccessMutation.isPending} data-testid="button-verify-access">
                          {verifyAccessMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          Access Stream
                        </Button>
                      </form>
                    </Form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    {showPurchaseForm ? (
                      <Form {...purchaseForm}>
                        <form onSubmit={purchaseForm.handleSubmit((data) => purchaseMutation.mutate(data))} className="space-y-4 text-left">
                          <FormField
                            control={purchaseForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} data-testid="input-stream-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={purchaseForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@example.com" {...field} data-testid="input-stream-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={purchaseForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+263..." {...field} data-testid="input-stream-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full" disabled={purchaseMutation.isPending} data-testid="button-purchase-access">
                            {purchaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Pay ${streamPrice} USD for Access
                          </Button>
                        </form>
                      </Form>
                    ) : (
                      <Button onClick={() => setShowPurchaseForm(true)} variant="default" className="w-full" data-testid="button-buy-access">
                        Buy Access - ${streamPrice} USD
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  What You Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Full live coverage of all 4 days (April 3-6, 2026)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Awards ceremony & cultural performances</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Access to video feed from attendees</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Replay access for 30 days after event</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Dates:</strong> April 3-6, 2026</p>
                <p><strong>Location:</strong> Dakamela Hall, Nkayi District, Zimbabwe</p>
                <p><strong>Stream Price:</strong> ${streamPrice} USD (one-time payment)</p>
              </CardContent>
            </Card>

            {freeRecordings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Free Preview</CardTitle>
                  <CardDescription>Watch highlights from past events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {freeRecordings.slice(0, 3).map((recording) => (
                    <a
                      key={recording.id}
                      href={recording.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                      data-testid={`recording-${recording.id}`}
                    >
                      <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                        <Play className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{recording.title}</p>
                        {recording.year && (
                          <p className="text-xs text-muted-foreground">{recording.year}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
