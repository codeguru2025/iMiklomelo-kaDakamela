import { Link } from "wouter";
import { assets } from "@/assets/cdn";
const logoImage = assets.logo;
const chibikhululogo = assets.chibikhululogo;
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Chief Dakamela Logo" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold">iMiklomelo kaDakamela</span>
                <span className="text-xs text-muted-foreground">Cultural Festival</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Preserving tradition, celebrating culture. The official platform for the iMiklomelo kaDakamela Cultural Festival.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-home">
                Home
              </Link>
              <Link href="/event" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-event">
                Event 2026
              </Link>
              <Link href="/accommodation" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-accommodation">
                Accommodation
              </Link>
              <Link href="/past-events" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-past-events">
                Heritage Archive
              </Link>
              <Link href="/sponsors" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-sponsors">
                Sponsors
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col space-y-3">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Dakamela Hall, Chief Dakamela, Nkayi District, Zimbabwe</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+263774788370" className="hover:text-foreground transition-colors">+263 77 478 8370</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@imiklomelokadakamela.com" className="hover:text-foreground transition-colors">info@imiklomelokadakamela.com</a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61575132930031"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-md bg-muted flex items-center justify-center hover-elevate"
                aria-label="Facebook"
                data-testid="social-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/imiklomelofestival?igsh=MXNiNHozbWdpNTE3eg=="
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-md bg-muted flex items-center justify-center hover-elevate"
                aria-label="Instagram"
                data-testid="social-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/mbusidakamela?s=21"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-md bg-muted flex items-center justify-center hover-elevate"
                aria-label="X (Twitter)"
                data-testid="social-twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Stay updated with announcements and cultural news.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} iMiklomelo kaDakamela Cultural Festival. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            This platform preserves the authority of Chief Dakamela tradition.
          </p>
        </div>

        <div className="border-t mt-6 pt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <a href="https://www.chibikhulu.com" target="_blank" rel="noopener noreferrer">
              <img src={chibikhululogo} alt="Chibikhulu" className="h-10 w-10 rounded-full object-cover hover:opacity-80 transition-opacity" />
            </a>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Created by <span className="font-semibold text-foreground">Chibikhulu</span>
              </p>
              <a href="tel:+263773665350" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                +263 77 366 5350
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
