import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import coinBackImg from "@assets/apa coin back_1762505793054.png";

export function Footer() {
  return (
    <footer className="bg-background border-t border-primary/20">
      {/* Top Footer Section */}
      <div className="border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={coinBackImg} 
                  alt="Alpha Phi Alpha 120th Anniversary Coin" 
                  className="w-12 h-12 object-contain"
                />
                <h3 className="text-xl font-serif font-bold text-foreground">
                  Alpha Phi Alpha
                </h3>
              </div>
              <p className="text-sm text-foreground/60 italic">
                "First of All, Servants of All, We Shall Transcend All"
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed">
                This Fraternity's motto encapsulates our profound legacy as the first intercollegiate Greek-letter organization founded by African American men, our unwavering commitment to community service, and the high ideals we instill in every member. This commemorative coin honors the 120th Anniversary (1906–2026) of Alpha Phi Alpha Fraternity, Incorporated.
              </p>
              <a 
                href="https://apa1906.net" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10"
                  data-testid="button-visit-apa-site"
                >
                  Visit the Official APA Site
                  <span className="ml-2 text-xs">↗</span>
                </Button>
              </a>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/about"
                    className="text-foreground/70 hover:text-primary transition-colors text-sm"
                    data-testid="link-about-120-anniversary"
                  >
                    About the 120th Anniversary
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/shop-coins"
                    className="text-foreground/70 hover:text-primary transition-colors text-sm"
                    data-testid="link-shop-coins"
                  >
                    Shop Commemorative Coins
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://apa1906.net" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-primary transition-colors text-sm"
                    data-testid="link-official-website"
                  >
                    Official Website
                  </a>
                </li>
                <li>
                  <Link href="/shipping" className="text-foreground/70 hover:text-primary transition-colors text-sm">
                    Shipping Information
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-foreground/70 hover:text-primary transition-colors text-sm">
                    Returns Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact</h4>
              <div className="space-y-2 text-sm">
                <p className="text-foreground/70">For inquiries about your order:</p>
                <a 
                  href="mailto:orders@06coins.com" 
                  className="text-primary hover:text-primary/80 transition-colors"
                  data-testid="link-contact-email"
                >
                  orders@06coins.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 text-center">
          <p className="text-sm text-foreground/60">
            © 2026 06coins.com. All rights reserved.
          </p>
          <p className="text-sm text-foreground/50 mt-1">
            120th Anniversary Exclusive Commemorative Coin
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-background/80">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-foreground/50">
            <p>
              Alpha Phi Alpha Fraternity, Inc. • Founded December 4, 1906 • Cornell University
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Use
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/shipping" className="hover:text-primary transition-colors">
                Shipping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
