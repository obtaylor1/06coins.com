import { Link } from "wouter";
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
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <ul className="space-y-2">
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
            © 2026 Alpha Phi Alpha Fraternity, Inc. All rights reserved.
          </p>
          <p className="text-sm text-foreground/50 mt-1">
            120th Anniversary Commemorative Coin
          </p>
        </div>
      </div>

      {/* Detailed Footer Section */}
      <div className="border-b border-primary/10 bg-background/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Alpha Phi Alpha Fraternity Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-serif font-bold text-foreground">
                Alpha Phi Alpha Fraternity, Inc.
              </h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                "First of all, Servants of All, We Shall Transcend All." This Fraternity's motto encapsulates our profound legacy as the first intercollegiate Greek-letter organization founded by African American men, our unwavering commitment to community service, and the high ideals we instill in every member. This commemorative coin honors the 120th Anniversary (1906–2026) of Alpha Phi Alpha Fraternity, Incorporated.
              </p>
              <div className="inline-flex items-center gap-2 bg-card border border-primary/20 rounded-lg px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">✓</span>
                </div>
                <span className="text-sm font-semibold text-foreground">Official APA Project</span>
              </div>
              <a 
                href="https://apa1906.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Visit the Official APA Site
                <span className="text-xs">↗</span>
              </a>
            </div>

            {/* Coin & Order Support */}
            <div className="space-y-6">
              <h4 className="text-lg font-serif font-bold text-foreground">
                Coin & Order Support
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-semibold text-foreground mb-2">Email Support</h5>
                  <p className="text-sm text-foreground/70 mb-1">
                    For order inquiries, shipping updates, and damage claims:
                  </p>
                  <a 
                    href="mailto:support@06coins.com" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    support@06coins.com
                  </a>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-foreground mb-2">Helpful Resources</h5>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link href="/faq" className="text-foreground/70 hover:text-primary transition-colors">
                        FAQ: Shipping, Returns, and Security
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="text-foreground/70 hover:text-primary transition-colors">
                        Secure Payment & Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-foreground mb-2">Secured Payment Processing</h5>
                  <div className="flex items-center gap-3">
                    <div className="bg-white px-3 py-2 rounded border border-foreground/10">
                      <span className="text-xs font-bold text-black">VISA</span>
                    </div>
                    <div className="bg-primary px-3 py-2 rounded">
                      <span className="text-xs font-bold text-black">stripe</span>
                    </div>
                    <div className="bg-white px-3 py-2 rounded border border-foreground/10">
                      <span className="text-xs font-bold text-black">SSL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
