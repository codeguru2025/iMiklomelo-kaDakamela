import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun, Calendar, Tent, Award, Building2, Home, LogIn, LogOut, User, Tv, Video } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useState } from "react";
import logoImage from "@assets/DK_LOGO_1769944557082.png";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/event", label: "Event 2026", icon: Calendar },
  { href: "/accommodation", label: "Accommodation", icon: Tent },
  { href: "/live-stream", label: "Watch Live", icon: Tv },
  { href: "/past-events", label: "Heritage Archive", icon: Award },
  { href: "/sponsors", label: "Sponsors", icon: Building2 },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
          <img src={logoImage} alt="Chief Dakamela Logo" className="h-10 w-auto" />
          <div className="hidden sm:flex flex-col">
            <span className="font-serif text-lg font-bold leading-tight">iMiklomelo kaDakamela</span>
            <span className="text-xs text-muted-foreground">Cultural Festival</span>
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

          {!isLoading && (
            isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                      <AvatarFallback>{user.firstName ? getInitials(user.firstName + (user.lastName ? " " + user.lastName : "")) : "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a href="/api/login">
                <Button variant="outline" size="sm" className="gap-2" data-testid="button-login">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Button>
              </a>
            )
          )}

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
                    <span className="font-serif font-bold">iMiklomelo</span>
                    <span className="text-xs text-muted-foreground">kaDakamela</span>
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

                <div className="border-t pt-4 mt-4 space-y-3">
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full" data-testid="mobile-button-register">
                      Register Now
                    </Button>
                  </Link>

                  {!isLoading && (
                    isAuthenticated && user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-muted">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                            <AvatarFallback>{user.firstName ? getInitials(user.firstName + (user.lastName ? " " + user.lastName : "")) : "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full gap-2" 
                          onClick={() => { setOpen(false); logout(); }}
                          data-testid="mobile-button-logout"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <a href="/api/login" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full gap-2" data-testid="mobile-button-login">
                          <LogIn className="h-4 w-4" />
                          Sign in
                        </Button>
                      </a>
                    )
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
