import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Tent, Building2, Award, Bell, Settings, Shield, 
  CheckCircle, XCircle, Clock, Plus, RefreshCw, Eye
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { Attendee, Reservation, Company, PastEvent, Announcement } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

  const { data: attendees, isLoading: attendeesLoading } = useQuery<Attendee[]>({
    queryKey: ["/api/attendees"],
  });

  const { data: reservations, isLoading: reservationsLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
  });

  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const updateCompanyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/companies/${id}`, { applicationStatus: status });
    },
    onSuccess: () => {
      toast({ title: "Company status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const updateDepositStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/reservations/${id}`, { depositStatus: status });
    },
    onSuccess: () => {
      toast({ title: "Deposit status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return apiRequest("POST", "/api/announcements", { ...data, isPublished: true });
    },
    onSuccess: () => {
      toast({ title: "Announcement created" });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setNewAnnouncement({ title: "", content: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create announcement", description: error.message, variant: "destructive" });
    },
  });

  const pendingCompanies = companies?.filter(c => c.applicationStatus === "pending") || [];
  const pendingReservations = reservations?.filter(r => r.depositStatus === "pending") || [];

  const stats = [
    { label: "Total Attendees", value: attendees?.length || 0, icon: Users },
    { label: "Active Reservations", value: reservations?.filter(r => r.depositStatus === "paid").length || 0, icon: Tent },
    { label: "Pending Applications", value: pendingCompanies.length, icon: Building2 },
    { label: "Pending Deposits", value: pendingReservations.length, icon: Clock },
  ];

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage event operations and applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            queryClient.invalidateQueries();
            toast({ title: "Data refreshed" });
          }} data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} data-testid={`stat-card-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="attendees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="attendees" data-testid="tab-attendees">
              <Users className="w-4 h-4 mr-2" />
              Attendees
            </TabsTrigger>
            <TabsTrigger value="reservations" data-testid="tab-reservations">
              <Tent className="w-4 h-4 mr-2" />
              Reservations
            </TabsTrigger>
            <TabsTrigger value="companies" data-testid="tab-companies">
              <Building2 className="w-4 h-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="announcements" data-testid="tab-announcements">
              <Bell className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendees">
            <Card>
              <CardHeader>
                <CardTitle>Registered Attendees</CardTitle>
                <CardDescription>View and manage event attendees</CardDescription>
              </CardHeader>
              <CardContent>
                {attendeesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : attendees && attendees.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Arrival</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendees.map(attendee => (
                        <TableRow key={attendee.id} data-testid={`row-attendee-${attendee.id}`}>
                          <TableCell className="font-medium">{attendee.fullName}</TableCell>
                          <TableCell>{attendee.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{attendee.attendanceType}</Badge>
                          </TableCell>
                          <TableCell>{attendee.city}, {attendee.country}</TableCell>
                          <TableCell>{new Date(attendee.arrivalDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendees registered yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>Camping Reservations</CardTitle>
                <CardDescription>Manage accommodation bookings and deposits</CardDescription>
              </CardHeader>
              <CardContent>
                {reservationsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : reservations && reservations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Camp</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Deposit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map(reservation => (
                        <TableRow key={reservation.id} data-testid={`row-reservation-${reservation.id}`}>
                          <TableCell className="font-medium">{reservation.attendeeId}</TableCell>
                          <TableCell>{reservation.campId}</TableCell>
                          <TableCell>{new Date(reservation.checkIn).toLocaleDateString()}</TableCell>
                          <TableCell>R{parseFloat(reservation.totalAmount).toFixed(2)}</TableCell>
                          <TableCell>R{parseFloat(reservation.depositAmount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={reservation.depositStatus === "paid" ? "default" : reservation.depositStatus === "pending" ? "secondary" : "destructive"}
                              className="capitalize"
                            >
                              {reservation.depositStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={reservation.depositStatus}
                              onValueChange={(value) => updateDepositStatus.mutate({ id: reservation.id, status: value })}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No reservations yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Sponsor & Exhibitor Applications</CardTitle>
                <CardDescription>Review and approve company applications</CardDescription>
              </CardHeader>
              <CardContent>
                {companiesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : companies && companies.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category/Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map(company => (
                        <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                          <TableCell className="font-medium">
                            {company.name}
                            {company.isPrimarySponsor && (
                              <Badge className="ml-2" variant="default">Primary</Badge>
                            )}
                          </TableCell>
                          <TableCell>{company.contactEmail}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{company.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {company.exhibitionCategory && (
                              <span className="capitalize">{company.exhibitionCategory.replace('_', ' ')}</span>
                            )}
                            {company.sponsorshipTier && (
                              <span className="capitalize">{company.sponsorshipTier}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={company.applicationStatus === "approved" ? "default" : company.applicationStatus === "pending" ? "secondary" : "destructive"}
                              className="capitalize"
                            >
                              {company.applicationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateCompanyStatus.mutate({ id: company.id, status: "approved" })}
                                disabled={company.applicationStatus === "approved"}
                                data-testid={`button-approve-${company.id}`}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateCompanyStatus.mutate({ id: company.id, status: "rejected" })}
                                disabled={company.applicationStatus === "rejected"}
                                data-testid={`button-reject-${company.id}`}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Create and manage public announcements</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-new-announcement">
                      <Plus className="w-4 h-4 mr-2" />
                      New Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Announcement</DialogTitle>
                      <DialogDescription>
                        This announcement will be displayed on the homepage.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input 
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Announcement title"
                          data-testid="input-announcement-title"
                        />
                      </div>
                      <div>
                        <Label>Content</Label>
                        <Textarea 
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Announcement content..."
                          data-testid="input-announcement-content"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => createAnnouncement.mutate(newAnnouncement)}
                        disabled={!newAnnouncement.title || !newAnnouncement.content || createAnnouncement.isPending}
                        data-testid="button-publish-announcement"
                      >
                        Publish
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : announcements && announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map(announcement => (
                      <Card key={announcement.id} data-testid={`card-announcement-${announcement.id}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            <Badge variant={announcement.isPublished ? "default" : "secondary"}>
                              {announcement.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{announcement.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(announcement.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No announcements yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Event Settings</CardTitle>
                <CardDescription>Configure event parameters and capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Settings panel coming soon. For now, camp and service configurations 
                  are managed through the database.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
