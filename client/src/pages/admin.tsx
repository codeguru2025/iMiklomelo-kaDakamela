import { useState, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Users, Tent, Building2, Award, Bell, Settings, Shield, 
  CheckCircle, XCircle, Clock, Plus, RefreshCw, Eye,
  BarChart3, Download, DollarSign, TrendingUp, UserCheck,
  Globe, MapPin, Calendar, ScanLine, Upload, X, Tv, Video,
  LogIn, Crown, UserCog, Loader2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { Attendee, Reservation, Company, Announcement, PastEvent, StreamSettings, VideoFeedPost, Recording } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { Image as ImageIcon } from "lucide-react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";

interface Analytics {
  totalAttendees: number;
  totalReservations: number;
  paidReservations: number;
  pendingReservations: number;
  totalRevenue: number;
  demographics: {
    byCountry: Record<string, number>;
    byAttendanceType: Record<string, number>;
    byGender: Record<string, number>;
    byAgeRange: Record<string, number>;
    firstTimeAttendees: number;
    returningAttendees: number;
  };
  campOccupancy: Array<{
    name: string;
    capacity: number;
    booked: number;
  }>;
}

const CHART_COLORS = ["#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#6366f1", "#14b8a6"];

const genderLabels: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

const ageRangeLabels: Record<string, string> = {
  under_18: "Under 18",
  "18_24": "18-24",
  "25_34": "25-34",
  "35_44": "35-44",
  "45_54": "45-54",
  "55_64": "55-64",
  "65_plus": "65+",
};

function ImageUpdateDialog({ event, onUpdate, isPending }: { 
  event: PastEvent; 
  onUpdate: (id: string, imageUrl: string) => void;
  isPending: boolean;
}) {
  const [imageUrl, setImageUrl] = useState(event.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to get upload URL");
      
      const { uploadURL, publicUrl } = await response.json();
      setUploadProgress(30);
      
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      
      setUploadProgress(100);
      setImageUrl(publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <ImageIcon className="w-4 h-4" />
          {event.imageUrl ? "Update Image" : "Add Image"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Event Image</DialogTitle>
          <DialogDescription>
            Upload an image from your device for {event.title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              data-testid={`input-file-upload-${event.id}`}
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isUploading ? `Uploading... ${uploadProgress}%` : "Click to upload an image"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images are served via CDN for fast loading
            </p>
          </div>
          
          {imageUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-40 object-cover" 
              />
              <div className="p-2 bg-muted/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate flex-1">{imageUrl}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setImageUrl("")}
                  data-testid={`button-clear-image-${event.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={() => onUpdate(event.id, imageUrl)}
            disabled={isPending || isUploading || !imageUrl}
            data-testid={`button-save-image-${event.id}`}
          >
            {isPending ? "Saving..." : "Save Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StreamingManagement() {
  const { toast } = useToast();
  const [streamSettings, setStreamSettings] = useState({
    streamUrl: "",
    streamTitle: "iMiklomelo kaDakamela Cultural Festival 2026 - Live Stream",
    streamDescription: "",
    isLive: false,
    streamPrice: "15.00",
    allowVideoFeed: false,
  });
  const isFreeStream = parseFloat(streamSettings.streamPrice) === 0;
  const [newRecording, setNewRecording] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: 0,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<StreamSettings>({
    queryKey: ["/api/admin/stream-settings"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: videoPosts, isLoading: postsLoading } = useQuery<VideoFeedPost[]>({
    queryKey: ["/api/admin/video-posts"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: recordings, isLoading: recordingsLoading } = useQuery<Recording[]>({
    queryKey: ["/api/recordings"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: streamStats } = useQuery<{ totalSubscribers: number; totalRevenue: number }>({
    queryKey: ["/api/admin/stream-stats"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<StreamSettings>) => {
      return apiRequest("PUT", "/api/admin/stream-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stream-settings"] });
      toast({ title: "Settings updated", description: "Stream settings have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    },
  });

  const moderatePostMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      return apiRequest("PUT", `/api/admin/video-posts/${id}/moderate`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/video-posts"] });
      toast({ title: "Post moderated", description: "Video post status updated." });
    },
  });

  const addRecordingMutation = useMutation({
    mutationFn: async (data: typeof newRecording) => {
      return apiRequest("POST", "/api/admin/recordings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
      setNewRecording({ title: "", description: "", videoUrl: "", thumbnailUrl: "", duration: 0 });
      toast({ title: "Recording added", description: "New recording added to the library." });
    },
  });

  const deleteRecordingMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/recordings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
      toast({ title: "Recording deleted", description: "Recording removed from library." });
    },
  });

  // Sync settings from server
  if (settings && !settingsLoading && streamSettings.streamUrl === "" && settings.streamUrl) {
    setStreamSettings({
      streamUrl: settings.streamUrl || "",
      streamTitle: settings.streamTitle || "iMiklomelo kaDakamela Cultural Festival 2026 - Live Stream",
      streamDescription: settings.streamDescription || "",
      isLive: settings.isLive || false,
      streamPrice: settings.streamPrice || "15.00",
      allowVideoFeed: settings.allowVideoFeed || false,
    });
  }

  const pendingPosts = videoPosts?.filter(p => p.status === "pending") || [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Stream Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streamStats?.totalSubscribers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Stream Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${streamStats?.totalRevenue?.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Video className="w-4 h-4 text-orange-500" />
              Pending Video Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPosts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stream Settings</CardTitle>
            <CardDescription>Configure your live stream settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Stream Title</Label>
              <Input
                value={streamSettings.streamTitle}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, streamTitle: e.target.value }))}
                placeholder="Enter stream title"
                data-testid="input-stream-title"
              />
            </div>
            <div>
              <Label>Stream URL (HLS/DASH)</Label>
              <Input
                value={streamSettings.streamUrl}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, streamUrl: e.target.value }))}
                placeholder="https://stream.example.com/live.m3u8"
                data-testid="input-stream-url"
              />
            </div>
            <div>
              <Label>Stream Description</Label>
              <Input
                value={streamSettings.streamDescription}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, streamDescription: e.target.value }))}
                placeholder="Brief description of the stream"
                data-testid="input-stream-description"
              />
            </div>
            <div>
              <Label>Access Type</Label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    checked={isFreeStream}
                    onChange={() => setStreamSettings(prev => ({ ...prev, streamPrice: "0.00" }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-medium">Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    checked={!isFreeStream}
                    onChange={() => setStreamSettings(prev => ({ ...prev, streamPrice: "15.00" }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-medium">Paid</span>
                </label>
              </div>
              {!isFreeStream && (
                <div className="mt-2">
                  <Label>Stream Price (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={streamSettings.streamPrice}
                    onChange={(e) => setStreamSettings(prev => ({ ...prev, streamPrice: e.target.value }))}
                    placeholder="15.00"
                    data-testid="input-stream-price"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={streamSettings.isLive}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, isLive: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                  data-testid="checkbox-is-live"
                />
                <span className="text-sm font-medium">Stream is Live</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={streamSettings.allowVideoFeed}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, allowVideoFeed: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                  data-testid="checkbox-allow-video-feed"
                />
                <span className="text-sm font-medium">Allow Video Feed Posts</span>
              </label>
            </div>
            {streamSettings.isLive && streamSettings.streamUrl && (
              <div className="p-3 bg-muted rounded-md">
                <Label className="text-xs text-muted-foreground">Shareable Stream Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    readOnly
                    value={`${window.location.origin}/live-stream`}
                    className="text-sm bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/live-stream`);
                      toast({ title: "Link copied!", description: "Share this link with your audience." });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFreeStream ? "Anyone with this link can watch for free" : `Viewers will be prompted to pay $${streamSettings.streamPrice} USD`}
                </p>
              </div>
            )}
            <Button
              onClick={() => updateSettingsMutation.mutate(streamSettings)}
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-stream-settings"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Recording</CardTitle>
            <CardDescription>Add a past recording to the library</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newRecording.title}
                onChange={(e) => setNewRecording(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Recording title"
                data-testid="input-recording-title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newRecording.description}
                onChange={(e) => setNewRecording(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                rows={2}
                data-testid="input-recording-description"
              />
            </div>
            <div>
              <Label>Video URL</Label>
              <Input
                value={newRecording.videoUrl}
                onChange={(e) => setNewRecording(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://..."
                data-testid="input-recording-video-url"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thumbnail URL</Label>
                <Input
                  value={newRecording.thumbnailUrl}
                  onChange={(e) => setNewRecording(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  placeholder="https://..."
                  data-testid="input-recording-thumbnail"
                />
              </div>
              <div>
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={newRecording.duration}
                  onChange={(e) => setNewRecording(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="3600"
                  data-testid="input-recording-duration"
                />
              </div>
            </div>
            <Button
              onClick={() => addRecordingMutation.mutate(newRecording)}
              disabled={addRecordingMutation.isPending || !newRecording.title || !newRecording.videoUrl}
              data-testid="button-add-recording"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addRecordingMutation.isPending ? "Adding..." : "Add Recording"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {pendingPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Pending Video Posts ({pendingPosts.length})
            </CardTitle>
            <CardDescription>Review and moderate user-submitted videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-4 border rounded-md">
                  <div className="flex-1">
                    <p className="font-medium">{post.caption || "No caption"}</p>
                    <p className="text-sm text-muted-foreground">
                      By: {post.authorName} • {new Date(post.createdAt!).toLocaleString()}
                    </p>
                    <a
                      href={post.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Video
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moderatePostMutation.mutate({ id: post.id, status: "approved" })}
                      disabled={moderatePostMutation.isPending}
                      data-testid={`button-approve-post-${post.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moderatePostMutation.mutate({ id: post.id, status: "rejected" })}
                      disabled={moderatePostMutation.isPending}
                      data-testid={`button-reject-post-${post.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-1 text-red-500" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recordings Library</CardTitle>
          <CardDescription>Manage past recordings</CardDescription>
        </CardHeader>
        <CardContent>
          {recordingsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : recordings && recordings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordings.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.title}</TableCell>
                    <TableCell>{Math.floor((rec.duration ?? 0) / 60)}:{((rec.duration ?? 0) % 60).toString().padStart(2, "0")}</TableCell>
                    <TableCell>{new Date(rec.createdAt!).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRecordingMutation.mutate(rec.id)}
                        disabled={deleteRecordingMutation.isPending}
                        data-testid={`button-delete-recording-${rec.id}`}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recordings yet. Add your first recording above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const { user, isLoading: authLoading, isAuthenticated, isAdmin: userIsAdmin, isSuperuser } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-2 text-primary" />
            <CardTitle className="font-serif text-2xl">Admin Access</CardTitle>
            <CardDescription>Sign in with Google to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href="/api/login">
              <Button size="lg" className="gap-2 w-full">
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 mx-auto mb-2 text-destructive" />
            <CardTitle className="font-serif text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You are signed in as <strong>{user?.email}</strong> but you do not have admin privileges.
              Contact the superuser to request access.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href="/api/logout">
              <Button variant="outline" className="gap-2">
                <LogIn className="w-5 h-5" />
                Sign out
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard isSuperuser={isSuperuser} currentUser={user} />;
}

function AdminDashboard({ isSuperuser, currentUser }: { isSuperuser: boolean; currentUser: User | null | undefined }) {
  const { toast } = useToast();
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [newPastEvent, setNewPastEvent] = useState({ 
    year: new Date().getFullYear(), 
    title: "", 
    summary: "", 
    edition: "",
    imageUrl: "" 
  });

  const { data: attendees, isLoading: attendeesLoading } = useQuery<Attendee[]>({
    queryKey: ["/api/attendees"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: reservations, isLoading: reservationsLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: pastEvents, isLoading: pastEventsLoading } = useQuery<PastEvent[]>({
    queryKey: ["/api/past-events"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
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

  const createPastEvent = useMutation({
    mutationFn: async (data: typeof newPastEvent) => {
      return apiRequest("POST", "/api/past-events", data);
    },
    onSuccess: () => {
      toast({ title: "Past event created" });
      queryClient.invalidateQueries({ queryKey: ["/api/past-events"] });
      setNewPastEvent({ year: new Date().getFullYear(), title: "", summary: "", edition: "", imageUrl: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create past event", description: error.message, variant: "destructive" });
    },
  });

  const updatePastEventImage = useMutation({
    mutationFn: async ({ id, imageUrl }: { id: string; imageUrl: string }) => {
      return apiRequest("PATCH", `/api/past-events/${id}`, { imageUrl });
    },
    onSuccess: () => {
      toast({ title: "Image updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/past-events"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update image", description: error.message, variant: "destructive" });
    },
  });

  const handleExportCSV = () => {
    window.open("/api/admin/export/attendees", "_blank");
    toast({ title: "Download started", description: "Your CSV file is being generated." });
  };

  const pendingCompanies = companies?.filter(c => c.applicationStatus === "pending") || [];
  const pendingReservations = reservations?.filter(r => r.depositStatus === "pending") || [];

  const stats = [
    { label: "Total Attendees", value: analytics?.totalAttendees || attendees?.length || 0, icon: Users, color: "text-blue-500" },
    { label: "Total Revenue", value: `$${(analytics?.totalRevenue || 0).toFixed(0)}`, icon: DollarSign, color: "text-green-500" },
    { label: "Paid Bookings", value: analytics?.paidReservations || reservations?.filter(r => r.depositStatus === "paid").length || 0, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Pending Deposits", value: analytics?.pendingReservations || pendingReservations.length, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage event operations and applications</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {currentUser?.email}
              {isSuperuser && <Badge variant="secondary" className="ml-2"><Crown className="w-3 h-3 mr-1" />Superuser</Badge>}
            </span>
            <Button variant="outline" size="sm" onClick={handleExportCSV} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              queryClient.invalidateQueries();
              toast({ title: "Data refreshed" });
            }} data-testid="button-refresh">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <a href="/api/logout">
              <Button variant="outline" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} data-testid={`stat-card-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className={`grid w-full ${isSuperuser ? 'grid-cols-9' : 'grid-cols-8'} max-w-5xl`}>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="attendees" data-testid="tab-attendees">
              <Users className="w-4 h-4 mr-2" />
              Attendees
            </TabsTrigger>
            <TabsTrigger value="reservations" data-testid="tab-reservations">
              <Tent className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="companies" data-testid="tab-companies">
              <Building2 className="w-4 h-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="streaming" data-testid="tab-streaming">
              <Tv className="w-4 h-4 mr-2" />
              Streaming
            </TabsTrigger>
            <TabsTrigger value="heritage" data-testid="tab-heritage">
              <Award className="w-4 h-4 mr-2" />
              Heritage
            </TabsTrigger>
            <TabsTrigger value="announcements" data-testid="tab-announcements">
              <Bell className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            {isSuperuser && (
              <TabsTrigger value="users" data-testid="tab-users">
                <UserCog className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : analytics?.demographics?.byGender && Object.keys(analytics.demographics.byGender).length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={Object.entries(analytics.demographics.byGender).map(([name, value]) => ({
                            name: genderLabels[name] || name,
                            value
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {Object.keys(analytics.demographics.byGender).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm">No gender data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    By Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : analytics?.demographics?.byCountry ? (
                    <div className="space-y-2">
                      {Object.entries(analytics.demographics.byCountry)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([country, count]) => (
                          <div key={country} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {country}
                            </span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No location data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Age Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : analytics?.demographics?.byAgeRange && Object.keys(analytics.demographics.byAgeRange).length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={Object.entries(analytics.demographics.byAgeRange)
                          .sort((a, b) => {
                            const order = ["under_18", "18_24", "25_34", "35_44", "45_54", "55_64", "65_plus"];
                            return order.indexOf(a[0]) - order.indexOf(b[0]);
                          })
                          .map(([age, count]) => ({
                            name: ageRangeLabels[age] || age,
                            count
                          }))}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm">No age data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Attendance Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : analytics?.demographics?.byAttendanceType ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.demographics.byAttendanceType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">{type}</Badge>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No attendance data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tent className="w-5 h-5 text-primary" />
                    Camp Occupancy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : analytics?.campOccupancy && analytics.campOccupancy.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.campOccupancy.map((camp) => {
                        const percentage = camp.capacity > 0 ? (camp.booked / camp.capacity) * 100 : 0;
                        return (
                          <div key={camp.name} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{camp.name}</span>
                              <span className="text-muted-foreground">
                                {camp.booked} / {camp.capacity} booked
                              </span>
                            </div>
                            <Progress value={percentage} className="h-3" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No camp data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendees">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Registered Attendees</CardTitle>
                  <CardDescription>View and manage event attendees</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {attendeesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : attendees && attendees.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>First Time</TableHead>
                          <TableHead>Camping</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendees.map(attendee => (
                          <TableRow key={attendee.id} data-testid={`row-attendee-${attendee.id}`}>
                            <TableCell className="font-medium">{attendee.fullName}</TableCell>
                            <TableCell className="text-sm">{attendee.email}</TableCell>
                            <TableCell>
                              <span className="text-sm">{attendee.gender ? genderLabels[attendee.gender] : "-"}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{attendee.ageRange ? ageRangeLabels[attendee.ageRange] : "-"}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{attendee.attendanceType}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{attendee.city}, {attendee.country}</TableCell>
                            <TableCell>
                              {attendee.isFirstTime ? (
                                <Badge variant="secondary">New</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">Returning</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {attendee.needsAccommodation ? (
                                <Badge>Yes</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">No</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                          <TableCell>${parseFloat(reservation.totalAmount).toFixed(2)}</TableCell>
                          <TableCell>${parseFloat(reservation.depositAmount).toFixed(2)}</TableCell>
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

          <TabsContent value="streaming">
            <StreamingManagement />
          </TabsContent>

          <TabsContent value="heritage">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Heritage Archive</CardTitle>
                  <CardDescription>Manage past events and add images to the gallery</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-new-past-event">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Past Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Past Event</DialogTitle>
                      <DialogDescription>
                        Add a past event to the Heritage Archive.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Year</Label>
                          <Input 
                            type="number"
                            value={newPastEvent.year}
                            onChange={(e) => setNewPastEvent(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                            placeholder="2025"
                            data-testid="input-event-year"
                          />
                        </div>
                        <div>
                          <Label>Edition</Label>
                          <Input 
                            value={newPastEvent.edition}
                            onChange={(e) => setNewPastEvent(prev => ({ ...prev, edition: e.target.value }))}
                            placeholder="e.g. 5th Edition"
                            data-testid="input-event-edition"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input 
                          value={newPastEvent.title}
                          onChange={(e) => setNewPastEvent(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Event title"
                          data-testid="input-event-title"
                        />
                      </div>
                      <div>
                        <Label>Summary</Label>
                        <Input 
                          value={newPastEvent.summary}
                          onChange={(e) => setNewPastEvent(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Short summary"
                          data-testid="input-event-summary"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Image URL
                        </Label>
                        <Input 
                          value={newPastEvent.imageUrl}
                          onChange={(e) => setNewPastEvent(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                          data-testid="input-event-image"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Paste a link to an image (external URL or uploaded to a hosting service)
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => createPastEvent.mutate(newPastEvent)}
                        disabled={createPastEvent.isPending || !newPastEvent.title || !newPastEvent.year}
                        data-testid="button-create-event"
                      >
                        {createPastEvent.isPending ? "Creating..." : "Create Event"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {pastEventsLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
                  </div>
                ) : pastEvents && pastEvents.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden" data-testid={`card-heritage-${event.id}`}>
                        <div className="aspect-video bg-gradient-to-br from-amber-600 to-orange-700 relative">
                          {event.imageUrl ? (
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-serif text-4xl font-bold text-white/90">{event.year}</span>
                            </div>
                          )}
                          <Badge className="absolute top-2 right-2 bg-black/50">{event.year}</Badge>
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{event.title}</CardTitle>
                          <CardDescription className="text-xs line-clamp-2">{event.summary}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <ImageUpdateDialog 
                            event={event}
                            onUpdate={(id, imageUrl) => updatePastEventImage.mutate({ id, imageUrl })}
                            isPending={updatePastEventImage.isPending}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No past events yet. Add your first event to build the heritage archive.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
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
                          <div className="flex items-center justify-between gap-4">
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
                <CardDescription>Configure event parameters and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Deposit Percentage</Label>
                      <Input value="30%" disabled />
                      <p className="text-xs text-muted-foreground">30% deposit required to secure bookings</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Window</Label>
                      <Input value="48 hours" disabled />
                      <p className="text-xs text-muted-foreground">Time allowed to complete payment</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Input value="USD ($)" disabled />
                      <p className="text-xs text-muted-foreground">All prices in US Dollars</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Gateway</Label>
                      <Input value="Paynow (Live)" disabled />
                      <p className="text-xs text-muted-foreground">Mobile money and card payments</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">
                      Camp types, services, and pricing are configured in the database. 
                      Contact the development team for changes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperuser && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function UserManagement() {
  const { toast } = useToast();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return apiRequest("PUT", `/api/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      toast({ title: "User role updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    },
  });

  const roleLabel = (role: string) => {
    switch (role) {
      case "superuser": return "Superuser";
      case "admin": return "Admin";
      default: return "Public";
    }
  };

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case "superuser": return "default" as const;
      case "admin": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage admin access. Only users who have signed in via Google appear here.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !users?.length ? (
          <p className="text-muted-foreground text-sm">No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {u.profileImageUrl && (
                        <img src={u.profileImageUrl} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      {u.firstName} {u.lastName}
                    </div>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(u.role)}>
                      {u.role === "superuser" && <Crown className="w-3 h-3 mr-1" />}
                      {roleLabel(u.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    {u.role === "superuser" ? (
                      <span className="text-xs text-muted-foreground">Protected</span>
                    ) : u.role === "admin" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoleMutation.mutate({ id: u.id, role: "public" })}
                        disabled={updateRoleMutation.isPending}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Revoke Admin
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateRoleMutation.mutate({ id: u.id, role: "admin" })}
                        disabled={updateRoleMutation.isPending}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Make Admin
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
