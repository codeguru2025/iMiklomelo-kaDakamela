import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ScanLine, CheckCircle, XCircle, Search, User, Calendar, 
  Tent, Clock, AlertTriangle, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface TicketInfo {
  ticket: {
    id: string;
    ticketCode: string;
    status: string;
    attendanceType: string;
    campDetails: string | null;
    selectedServices: string[] | null;
    usedAt: string | null;
  };
  attendee: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    attendanceType: string;
    needsAccommodation: boolean;
  };
  reservation?: {
    id: string;
    campId: string;
    checkIn: string;
    checkOut: string;
    depositStatus: string;
  } | null;
}

export default function ScanTickets() {
  const { toast } = useToast();
  const [ticketCode, setTicketCode] = useState("");
  const [scannedTicket, setScannedTicket] = useState<TicketInfo | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const { data: recentScans, isLoading: recentLoading } = useQuery<TicketInfo[]>({
    queryKey: ["/api/admin/tickets/recent-scans"],
  });

  const lookupMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("GET", `/api/tickets/lookup/${encodeURIComponent(code)}`);
      return res.json();
    },
    onSuccess: (data: TicketInfo) => {
      setScannedTicket(data);
      setScanError(null);
    },
    onError: (error: Error) => {
      setScanError(error.message || "Ticket not found");
      setScannedTicket(null);
    },
  });

  const markUsedMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await apiRequest("POST", `/api/tickets/${ticketId}/mark-used`);
      return res.json() as Promise<{ scannedAt: string | null; status: string }>;
    },
    onSuccess: (updatedTicket) => {
      toast({
        title: "Check-in Successful",
        description: "Ticket has been marked as used."
      });
      if (scannedTicket) {
        setScannedTicket({
          ...scannedTicket,
          ticket: {
            ...scannedTicket.ticket,
            status: "used",
            usedAt: updatedTicket.scannedAt, // authoritative server timestamp
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets/recent-scans"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Check-in Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleScan = () => {
    if (!ticketCode.trim()) {
      toast({ title: "Enter ticket code", variant: "destructive" });
      return;
    }
    lookupMutation.mutate(ticketCode.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge variant="default" className="bg-green-600">Valid</Badge>;
      case "used":
        return <Badge variant="secondary">Already Used</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <ScanLine className="w-8 h-8 text-primary" />
              Ticket Scanner
            </h1>
            <p className="text-muted-foreground mt-1">Scan QR codes or enter ticket codes to check in attendees</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Ticket Lookup
                </CardTitle>
                <CardDescription>
                  Enter the ticket code from the QR code or manually type it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter ticket code (e.g., DK-ABC123-XYZ)"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    className="font-mono"
                    data-testid="input-ticket-code"
                  />
                  <Button 
                    onClick={handleScan} 
                    disabled={lookupMutation.isPending}
                    data-testid="button-scan"
                  >
                    {lookupMutation.isPending ? "Scanning..." : "Scan"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {scanError && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <XCircle className="h-8 w-8" />
                    <div>
                      <p className="font-semibold">Ticket Not Found</p>
                      <p className="text-sm">{scanError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {scannedTicket && (
              <Card className={scannedTicket.ticket.status === "valid" ? "border-green-500" : "border-muted"}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      {scannedTicket.ticket.status === "valid" ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      )}
                      Ticket Found
                    </CardTitle>
                    {getStatusBadge(scannedTicket.ticket.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg font-mono text-center text-lg">
                    {scannedTicket.ticket.ticketCode}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{scannedTicket.attendee.fullName}</p>
                        <p className="text-sm text-muted-foreground">{scannedTicket.attendee.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {scannedTicket.attendee.attendanceType}
                      </Badge>
                      {scannedTicket.attendee.needsAccommodation && (
                        <Badge variant="secondary" className="gap-1">
                          <Tent className="h-3 w-3" />
                          Camping
                        </Badge>
                      )}
                    </div>

                    {scannedTicket.reservation && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Reservation Details</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(scannedTicket.reservation.checkIn).toLocaleDateString()} - 
                              {new Date(scannedTicket.reservation.checkOut).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Deposit:</span>
                            <Badge 
                              variant={scannedTicket.reservation.depositStatus === "paid" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {scannedTicket.reservation.depositStatus}
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}

                    {scannedTicket.ticket.usedAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Used at: {new Date(scannedTicket.ticket.usedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {scannedTicket.ticket.status === "valid" && (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => markUsedMutation.mutate(scannedTicket.ticket.id)}
                      disabled={markUsedMutation.isPending}
                      data-testid="button-check-in"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {markUsedMutation.isPending ? "Processing..." : "Check In Attendee"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Check-ins
                </CardTitle>
                <CardDescription>
                  Last 10 tickets scanned
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : recentScans && recentScans.length > 0 ? (
                  <div className="space-y-3">
                    {recentScans.map((scan) => (
                      <div 
                        key={scan.ticket.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                        data-testid={`recent-scan-${scan.ticket.id}`}
                      >
                        <div>
                          <p className="font-medium text-sm">{scan.attendee.fullName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {scan.ticket.ticketCode}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(scan.ticket.status)}
                          {scan.ticket.usedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(scan.ticket.usedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No recent scans
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
