import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

// Eagerly load the homepage (first paint)
import Home from "@/pages/home";

// Lazy-load all other pages for bundle splitting
const Event = lazy(() => import("@/pages/event"));
const Accommodation = lazy(() => import("@/pages/accommodation"));
const PastEvents = lazy(() => import("@/pages/past-events"));
const Sponsors = lazy(() => import("@/pages/sponsors"));
const Register = lazy(() => import("@/pages/register"));
const Apply = lazy(() => import("@/pages/apply"));
const Admin = lazy(() => import("@/pages/admin"));
const TicketPage = lazy(() => import("@/pages/ticket"));
const ScanTickets = lazy(() => import("@/pages/scan-tickets"));
const PaymentStatusPage = lazy(() => import("@/pages/payment-status"));
const LiveStream = lazy(() => import("@/pages/live-stream"));
const VideoFeed = lazy(() => import("@/pages/video-feed"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/event" component={Event} />
        <Route path="/accommodation" component={Accommodation} />
        <Route path="/past-events" component={PastEvents} />
        <Route path="/sponsors" component={Sponsors} />
        <Route path="/register" component={Register} />
        <Route path="/apply" component={Apply} />
        <Route path="/admin" component={Admin} />
        <Route path="/ticket/:attendeeId" component={TicketPage} />
        <Route path="/scan-tickets" component={ScanTickets} />
        <Route path="/payment-status" component={PaymentStatusPage} />
        <Route path="/live-stream" component={LiveStream} />
        <Route path="/video-feed" component={VideoFeed} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
