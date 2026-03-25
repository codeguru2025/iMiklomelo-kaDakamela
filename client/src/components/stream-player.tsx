import { useEffect, useRef, useState } from "react";
import { Video, Loader2 } from "lucide-react";
import Hls from "hls.js";

interface StreamPlayerProps {
  url: string;
  title?: string;
  autoPlay?: boolean;
}

function isEmbedUrl(url: string): boolean {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("facebook.com/plugins") ||
    url.includes("dailymotion.com")
  );
}

function isHlsUrl(url: string): boolean {
  return url.includes(".m3u8");
}

export function StreamPlayer({ url, title, autoPlay = true }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !videoRef.current) return;

    const video = videoRef.current;

    if (isHlsUrl(url)) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setError("Stream unavailable. Please try again later.");
            setIsLoading(false);
          }
        });

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari has native HLS support
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => {});
        });
        video.addEventListener("error", () => {
          setError("Stream unavailable. Please try again later.");
          setIsLoading(false);
        });
      } else {
        setError("Your browser does not support HLS streaming.");
        setIsLoading(false);
      }
    } else {
      // Regular video URL (MP4, WebM, etc.)
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
      video.addEventListener("error", () => {
        setError("Failed to load video. Please check the URL.");
        setIsLoading(false);
      });
    }
  }, [url, autoPlay]);

  // Embed URLs (YouTube, Vimeo) — use iframe
  if (isEmbedUrl(url)) {
    return (
      <div className="aspect-video bg-black relative">
        <iframe
          src={url}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title={title || "Live Stream"}
        />
      </div>
    );
  }

  // HLS or direct video — use native player
  return (
    <div className="aspect-video bg-black relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          poster=""
        />
      )}
    </div>
  );
}
