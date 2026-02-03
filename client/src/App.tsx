import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import Home from "@/pages/home";
import Event from "@/pages/event";
import Accommodation from "@/pages/accommodation";
import PastEvents from "@/pages/past-events";
import Sponsors from "@/pages/sponsors";
import Register from "@/pages/register";
import Apply from "@/pages/apply";
import Admin from "@/pages/admin";
import TicketPage from "@/pages/ticket";
import ScanTickets from "@/pages/scan-tickets";
import PaymentStatusPage from "@/pages/payment-status";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
      <Route component={NotFound} />
    </Switch>
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
              <Router />
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
