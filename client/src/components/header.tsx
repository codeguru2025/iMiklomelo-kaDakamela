import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun, Calendar, Users, Tent, Award, Building2, Home } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useState } from "react";
import logoImage from "@assets/DK_LOGO_1769944557082.png";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/event", label: "Event 2026", icon: Calendar },
  { href: "/accommodation", label: "Accommodation", icon: Tent },
  { href: "/past-events", label: "Heritage Archive", icon: Award },
  { href: "/sponsors", label: "Sponsors", icon: Building2 },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
          <img src={logoImage} alt="Chief Dakamela Logo" className="h-10 w-auto" />
          <div className="hidden sm:flex flex-col">
            <span className="font-serif text-lg font-bold leading-tight">Imiklomelo Ka Dakamela</span>
            <span className="text-xs text-muted-foreground">Chief Dakamela Achievers Awards</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/register">
            <Button className="hidden sm:flex" data-testid="button-register">
              Register Now
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <img src={logoImage} alt="Chief Dakamela Logo" className="h-12 w-auto" />
                  <div className="flex flex-col">
                    <span className="font-serif font-bold">Imiklomelo</span>
                    <span className="text-xs text-muted-foreground">Ka Dakamela</span>
                  </div>
                </div>

                {navLinks.map((link) => {
                  const isActive = location === link.href;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3"
                        data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}

                <div className="border-t pt-4 mt-4">
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full" data-testid="mobile-button-register">
                      Register Now
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
