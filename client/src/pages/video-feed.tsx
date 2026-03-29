import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Video, Play, Heart, Upload, Loader2, Clock, Users, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VideoFeedPost, StreamSettings } from "@shared/schema";

export default function VideoFeed() {
  const { toast } = useToast();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: posts, isLoading } = useQuery<VideoFeedPost[]>({
    queryKey: ["/api/video-feed"],
  });

  const { data: streamSettings } = useQuery<StreamSettings>({
    queryKey: ["/api/stream/settings"],
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/video-feed/${id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-feed"] });
    },
  });

  const handleVideoSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({ title: "Please select a video file", variant: "destructive" });
      return;
    }
    
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (video.duration > 60) {
        toast({ 
          title: "Video too long", 
          description: "Please select a video under 1 minute",
          variant: "destructive" 
        });
        return;
      }
      setVideoFile(file);
    };
    video.src = URL.createObjectURL(file);
  };

  const handleUpload = async () => {
    if (!videoFile || !authorName) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      const urlResponse = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: videoFile.name,
          size: videoFile.size,
          contentType: videoFile.type,
        }),
      });

      if (!urlResponse.ok) throw new Error("Failed to get upload URL");

      const { uploadURL, publicUrl } = await urlResponse.json();

      await fetch(uploadURL, {
        method: "PUT",
        body: videoFile,
        headers: { "Content-Type": videoFile.type },
      });

      await apiRequest("POST", "/api/video-feed", {
        authorName,
        videoUrl: publicUrl,
        caption,
      });

      toast({ title: "Video submitted!", description: "Your video will appear after approval." });
      setShowUploadForm(false);
      setVideoFile(null);
      setAuthorName("");
      setCaption("");
      queryClient.invalidateQueries({ queryKey: ["/api/video-feed"] });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const isFeedActive = streamSettings?.allowVideoFeed;

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Video className="w-3 h-3 mr-1" />
            Community Feed
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Event Video Feed
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Share your experience! Post short videos (up to 1 minute) from the event and see what others are sharing.
          </p>
          {isFeedActive && (
            <Badge className="mt-6 bg-green-500 text-white">
              Feed Active - Share Your Videos!
            </Badge>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {isFeedActive && (
          <div className="mb-8">
            {showUploadForm ? (
              <Card className="max-w-lg mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Share a Video
                    <Button variant="ghost" size="icon" onClick={() => setShowUploadForm(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>Upload a short video (max 1 minute) from the event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name</label>
                    <Input 
                      value={authorName} 
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Enter your name"
                      data-testid="input-video-author"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Video</label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate"
                      onClick={() => videoInputRef.current?.click()}
                      data-testid="upload-video-area"
                    >
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoSelect(file);
                        }}
                        data-testid="input-video-file"
                      />
                      {videoFile ? (
                        <div className="text-sm">
                          <Video className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <p className="font-medium">{videoFile.name}</p>
                          <p className="text-muted-foreground">Click to change</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to select video</p>
                          <p className="text-xs text-muted-foreground mt-1">Max 1 minute</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Caption (optional)</label>
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="What's happening in this video?"
                      className="resize-none"
                      data-testid="input-video-caption"
                    />
                  </div>

                  <Button 
                    onClick={handleUpload} 
                    className="w-full" 
                    disabled={isUploading || !videoFile || !authorName}
                    data-testid="button-upload-video"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Video
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center">
                <Button onClick={() => setShowUploadForm(true)} size="lg" data-testid="button-share-video">
                  <Video className="w-4 h-4 mr-2" />
                  Share Your Video
                </Button>
              </div>
            )}
          </div>
        )}

        {!isFeedActive && (
          <Card className="max-w-lg mx-auto mb-8">
            <CardContent className="py-8 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg mb-2">Video Feed Not Active</h3>
              <p className="text-muted-foreground">
                The video feed will be available during the event days (April 3-6, 2026). 
                Come back then to share and watch event videos!
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden" data-testid={`video-post-${post.id}`}>
                <div className="aspect-video bg-black relative group">
                  <video
                    src={post.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{post.authorName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeMutation.mutate(post.id)}
                      className="gap-1"
                      data-testid={`button-like-${post.id}`}
                    >
                      <Heart className={`w-4 h-4 ${post.likes > 0 ? "fill-red-500 text-red-500" : ""}`} />
                      {post.likes}
                    </Button>
                  </div>
                  {post.caption && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.caption}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Videos Yet</h3>
            <p className="text-muted-foreground">
              {isFeedActive 
                ? "Be the first to share a video from the event!"
                : "Videos will appear here during the event."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
