import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, DollarSign, Calendar, Tent, User, Mail, Phone,
  CheckCircle, Clock, AlertTriangle, XCircle, CreditCard, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface PaymentStatus {
  attendee: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    attendanceType: string;
    needsAccommodation: boolean;
    registeredAt: string;
  };
  ticket?: {
    ticketCode: string;
    status: string;
  } | null;
  reservation?: {
    id: string;
    campId: string;
    campName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: string;
    depositAmount: string;
    depositStatus: string;
    depositDeadline: string;
    selectedServices: string[] | null;
  } | null;
  payments: Array<{
    id: string;
    amount: string;
    status: string;
    paymentMethod: string;
    createdAt: string;
    completedAt: string | null;
  }>;
}

export default function PaymentStatusPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<PaymentStatus | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("GET", `/api/payment-status?q=${encodeURIComponent(query)}`);
      return res.json();
    },
    onSuccess: (data: PaymentStatus) => {
      setPaymentInfo(data);
      setSearchError(null);
    },
    onError: (error: Error) => {
      setSearchError(error.message || "No booking found with that email or phone number");
      setPaymentInfo(null);
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({ title: "Please enter your email or phone number", variant: "destructive" });
      return;
    }
    searchMutation.mutate(searchQuery.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getDepositStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "expired":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getDepositStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Check Your Payment Status</h1>
            <p className="text-muted-foreground">
              Enter your email or phone number to view your booking and payment details
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Your Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email or phone number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  data-testid="input-search-booking"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={searchMutation.isPending}
                  data-testid="button-search"
                >
                  {searchMutation.isPending ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchError && (
            <Card className="border-destructive mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <XCircle className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">Booking Not Found</p>
                    <p className="text-sm">{searchError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentInfo && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Attendee Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{paymentInfo.attendee.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{paymentInfo.attendee.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Attendance Type</span>
                    <Badge variant="outline" className="capitalize">{paymentInfo.attendee.attendanceType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Registered</span>
                    <span className="text-sm">{new Date(paymentInfo.attendee.registeredAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {paymentInfo.ticket && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Your Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="font-mono text-lg font-bold">{paymentInfo.ticket.ticketCode}</p>
                      <Badge variant={paymentInfo.ticket.status === "valid" ? "default" : "secondary"} className="mt-2 capitalize">
                        {paymentInfo.ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-3">
                      <Link href={`/ticket/${paymentInfo.attendee.id}`} className="text-primary hover:underline" data-testid="link-view-ticket">
                        View Full Digital Ticket
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              )}

              {paymentInfo.reservation && (
                <Card className={paymentInfo.reservation.depositStatus === "paid" ? "border-green-500" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="flex items-center gap-2">
                        <Tent className="w-5 h-5" />
                        Accommodation Booking
                      </CardTitle>
                      {getDepositStatusBadge(paymentInfo.reservation.depositStatus)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      {getDepositStatusIcon(paymentInfo.reservation.depositStatus)}
                      <div>
                        <p className="font-medium">
                          {paymentInfo.reservation.depositStatus === "paid" 
                            ? "Your accommodation is confirmed!" 
                            : paymentInfo.reservation.depositStatus === "pending"
                            ? "Deposit payment required"
                            : "Your booking has expired"}
                        </p>
                        {paymentInfo.reservation.depositStatus === "pending" && (
                          <p className="text-sm text-muted-foreground">
                            Deadline: {new Date(paymentInfo.reservation.depositDeadline).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Camp</span>
                        <span className="font-medium">{paymentInfo.reservation.campName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> Check-in
                        </span>
                        <span>{new Date(paymentInfo.reservation.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> Check-out
                        </span>
                        <span>{new Date(paymentInfo.reservation.checkOut).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="font-bold text-lg">${parseFloat(paymentInfo.reservation.totalAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Deposit (30%)</span>
                        <span className="font-medium">${parseFloat(paymentInfo.reservation.depositAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Balance Due at Event</span>
                        <span className="font-medium">
                          ${(parseFloat(paymentInfo.reservation.totalAmount) - parseFloat(paymentInfo.reservation.depositAmount)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {paymentInfo.reservation.depositStatus === "pending" && (
                      <Button className="w-full" size="lg" data-testid="button-pay-deposit">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Pay Deposit Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {paymentInfo.payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paymentInfo.payments.map((payment) => (
                        <div 
                          key={payment.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted"
                          data-testid={`payment-${payment.id}`}
                        >
                          <div>
                            <p className="font-medium">${parseFloat(payment.amount).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.paymentMethod} • {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={payment.status === "completed" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!paymentInfo.reservation && !paymentInfo.attendee.needsAccommodation && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-1">You're All Set!</h3>
                    <p className="text-muted-foreground">
                      No accommodation booked. You're registered for the event.
                    </p>
                    {paymentInfo.ticket && (
                      <Link href={`/ticket/${paymentInfo.attendee.id}`}>
                        <Button className="mt-4" data-testid="button-view-ticket">
                          View Your Digital Ticket
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
