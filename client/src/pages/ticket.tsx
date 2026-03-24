import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket as TicketIcon, Calendar, MapPin, User, Download, QrCode, CheckCircle } from "lucide-react";
import type { Ticket, Attendee } from "@shared/schema";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import logoImage from "@assets/DK_LOGO_1769944557082.png";

export default function TicketPage() {
  const params = useParams<{ attendeeId: string }>();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const { data: ticket, isLoading: ticketLoading } = useQuery<Ticket>({
    queryKey: ["/api/tickets/attendee", params.attendeeId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/attendee/${params.attendeeId}`);
      if (!res.ok) throw new Error("Ticket not found");
      return res.json();
    },
    enabled: !!params.attendeeId,
  });

  const { data: attendee } = useQuery<Attendee>({
    queryKey: ["/api/attendees", params.attendeeId],
    queryFn: async () => {
      const res = await fetch(`/api/attendees/${params.attendeeId}`);
      if (!res.ok) throw new Error("Attendee not found");
      return res.json();
    },
    enabled: !!params.attendeeId,
  });

  useEffect(() => {
    if (ticket?.ticketCode && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, ticket.ticketCode, {
        width: 200,
        margin: 2,
        color: {
          dark: "#1c1917",
          light: "#ffffff",
        },
      });
    }
  }, [ticket?.ticketCode]);

  if (ticketLoading) {
    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 max-w-lg">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <TicketIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-serif text-2xl font-bold mb-2">Ticket Not Found</h1>
          <p className="text-muted-foreground">
            No ticket was found for this attendee. Please complete registration first.
          </p>
        </div>
      </div>
    );
  }

  const attendanceTypeLabels: Record<string, string> = {
    standard: "Standard Attendee",
    vip: "VIP Attendee",
    delegation: "Delegation Member",
  };

  const statusColors: Record<string, string> = {
    valid: "bg-green-500",
    used: "bg-blue-500",
    expired: "bg-gray-500",
    cancelled: "bg-red-500",
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4 max-w-lg">
        <Card className="overflow-hidden border-2 border-primary/20" data-testid="ticket-card">
          <div className="bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 p-6 text-center text-white">
            <img 
              src={logoImage} 
              alt="iMiklomelo kaDakamela Cultural Festival" 
              className="w-20 h-20 mx-auto mb-3 drop-shadow-lg"
            />
            <h1 className="font-serif text-2xl font-bold">iMiklomelo kaDakamela Cultural Festival</h1>
            <p className="text-amber-100 text-sm">Cultural Festival 2026</p>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Badge 
                className={`${statusColors[ticket.status]} text-white`}
                data-testid="ticket-status"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </Badge>
              <Badge variant="outline" data-testid="ticket-type">
                {attendanceTypeLabels[ticket.attendanceType] || ticket.attendanceType}
              </Badge>
            </div>

            <div className="text-center py-4">
              <canvas 
                ref={qrCanvasRef} 
                className="mx-auto rounded-lg shadow-md"
                data-testid="ticket-qr-code"
              />
              <p className="mt-2 font-mono text-sm text-muted-foreground" data-testid="ticket-code">
                {ticket.ticketCode}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Attendee</p>
                  <p className="font-semibold" data-testid="ticket-attendee-name">
                    {attendee?.fullName || "Loading..."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Event Date</p>
                  <p className="font-semibold">December 2026</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">Dakamela Hall, Nkayi District, Zimbabwe</p>
                </div>
              </div>

              {ticket.campDetails && (
                <div className="flex items-start gap-3">
                  <TicketIcon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Accommodation</p>
                    <p className="font-semibold">{ticket.campDetails}</p>
                  </div>
                </div>
              )}

              {ticket.selectedServices && ticket.selectedServices.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Selected Services</p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.selectedServices.map((service, idx) => (
                      <Badge key={idx} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button className="w-full gap-2" variant="outline" data-testid="button-download-ticket">
                <Download className="w-4 h-4" />
                Save to Device
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Present this QR code at the venue for entry
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
