import { useEffect } from "react";
import { Link } from "wouter";
import { StickyHeader } from "@/components/sticky-header";
import { Footer } from "@/components/footer";
import { SEO } from "@/components/seo";
import { getAbsoluteUrl } from "@/../../shared/seo-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Award, Users, BookOpen, Heart, ShoppingCart } from "lucide-react";

export default function About() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Alpha Phi Alpha 120th Anniversary: A Legacy of Leadership and Service",
    "description": "Discover the rich history of Alpha Phi Alpha Fraternity, the first intercollegiate Greek-letter organization founded by African American men, as we celebrate 120 years of brotherhood and excellence.",
    "author": {
      "@type": "Organization",
      "name": "Alpha Phi Alpha Fraternity, Incorporated"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Alpha Phi Alpha Fraternity, Incorporated"
    },
    "datePublished": "2026-01-01",
    "url": getAbsoluteUrl("/about")
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Alpha Phi Alpha Fraternity, Incorporated",
    "foundingDate": "1906-12-04",
    "foundingLocation": {
      "@type": "Place",
      "name": "Cornell University",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Ithaca",
        "addressRegion": "NY"
      }
    },
    "description": "First intercollegiate Greek-letter organization founded by African American men",
    "url": "https://apa1906.net"
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="About Alpha Phi Alpha 120th Anniversary - Heritage & History"
        description="Discover the rich 120-year history of Alpha Phi Alpha Fraternity, the first intercollegiate Greek-letter organization founded by African American men. Learn about the Seven Jewels and our legacy of leadership."
        canonical={getAbsoluteUrl("/about")}
        keywords="Alpha Phi Alpha history, Seven Jewels, 1906 Cornell University, African American fraternity, Greek-letter organization history, APA founders"
        structuredData={[articleSchema, organizationSchema]}
      />
      <StickyHeader onCtaClick={() => window.location.href = '/shop-coins'} />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-primary/20 text-primary border border-primary/40 px-6 py-2 text-sm font-serif">
            Est. December 4, 1906
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            120 Years of <span className="text-primary">Excellence</span>,<br />
            Leadership, and Service
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Celebrating the legacy of Alpha Phi Alpha Fraternity, Incorporated - the first intercollegiate Greek-letter organization established by African American men.
          </p>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg prose-invert max-w-none space-y-8">
          <Card className="p-8 md:p-12 bg-card/50 border border-primary/20">
            <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              The Beginning of a Legacy
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-4 text-lg">
              <p>
                On December 4, 1906, at Cornell University in Ithaca, New York, seven visionary men came together to form what would become the first intercollegiate Greek-letter fraternity established for African American men. These founding members, known as the <strong>Seven Jewels</strong>, created an organization that would transform higher education and African American leadership for generations to come.
              </p>
              <p>
                The Seven Jewels - Henry Arthur Callis, Charles Henry Chapman, Eugene Kinckle Jones, George Biddle Kelley, Nathaniel Allison Murray, Robert Harold Ogle, and Vertner Woodson Tandy - faced significant social and academic challenges at Cornell. In response, they created Alpha Phi Alpha as a study and support group that would champion academic excellence, brotherhood, and service to all mankind.
              </p>
              <p>
                From its inception, Alpha Phi Alpha was built on a foundation of high academic and moral standards. The fraternity's founders envisioned an organization that would serve as a beacon of hope and a pathway to success for African American students in predominantly white institutions.
              </p>
            </div>
          </Card>

          <Card className="p-8 md:p-12 bg-card/50 border border-primary/20">
            <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center gap-3">
              <Award className="w-8 h-8 text-primary" />
              A Century of Impact
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-4 text-lg">
              <p>
                Over 120 years, Alpha Phi Alpha has grown into a powerhouse of leadership, producing U.S. Congressmen, Senators, civil rights leaders, educators, physicians, attorneys, and business executives. Notable members include Dr. Martin Luther King Jr., Justice Thurgood Marshall, Duke Ellington, Paul Robeson, and countless others who have shaped American history.
              </p>
              <p>
                The fraternity's motto - <em className="text-primary">"First of All, Servants of All, We Shall Transcend All"</em> - embodies the organization's commitment to being pioneers in service to humanity. This principle has guided Alpha men in creating programs that address social issues, promote education, and uplift communities worldwide.
              </p>
              <p>
                From the historic <strong>Go-to-High School, Go-to-College</strong> campaign to <strong>A Voteless People is a Hopeless People</strong>, Alpha Phi Alpha has consistently led initiatives that advance civil rights, education, and social justice. The fraternity's commitment to scholarship has resulted in millions of dollars in scholarships awarded to deserving students.
              </p>
            </div>
          </Card>

          <Card className="p-8 md:p-12 bg-card/50 border border-primary/20">
            <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              The Seven Jewels: Founders of Excellence
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-4 text-lg">
              <p>
                Each of the Seven Jewels brought unique strengths and vision to Alpha Phi Alpha:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-300">
                <li><strong>Henry Arthur Callis</strong> - A physician and the fraternity's first Vice President, known as the "Dreamer"</li>
                <li><strong>Charles Henry Chapman</strong> - The first Treasurer, whose organizational skills laid the financial foundation</li>
                <li><strong>Eugene Kinckle Jones</strong> - Social worker and executive director of the National Urban League</li>
                <li><strong>George Biddle Kelley</strong> - The only Jewel to graduate from Cornell, an engineer who worked on the New York State Barge Canal</li>
                <li><strong>Nathaniel Allison Murray</strong> - A businessman whose practical wisdom guided early decisions</li>
                <li><strong>Robert Harold Ogle</strong> - Whose dedication to the fraternity's growth was unwavering</li>
                <li><strong>Vertner Woodson Tandy</strong> - The first registered African American architect in New York State, designer of Villa Lewaro</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 md:p-12 bg-card/50 border border-primary/20">
            <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              Commemorating 120 Years
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-4 text-lg">
              <p>
                The <strong>Alpha Phi Alpha 120th Anniversary Commemorative Coin Collection</strong> celebrates this remarkable milestone with museum-quality craftsmanship. Each coin in the collection serves as a tangible reminder of the fraternity's enduring legacy and the Seven Jewels' vision.
              </p>
              <p>
                The centerpiece <strong>4-inch commemorative coin</strong> is limited to only 1906 units - one for each year of the fraternity's history - making it an exclusive collector's item. The <strong>Seven Jewels Collector's Set</strong> honors each founding member with individual 3-inch coins featuring their likenesses and contributions.
              </p>
              <p>
                Whether you're an Alpha man, a supporter of African American history, or a collector of significant memorabilia, these coins represent more than currency - they embody a legacy of excellence, a commitment to service, and a promise to future generations.
              </p>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
            <h3 className="text-3xl font-serif font-bold text-white mb-4">
              Own a Piece of History
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Explore our exclusive 120th Anniversary Commemorative Coin Collection and honor the legacy of Alpha Phi Alpha.
            </p>
            <Link href="/shop-coins">
              <Button
                size="lg"
                className="bg-primary text-black font-bold hover:bg-primary/90 px-12 py-6 text-xl"
                data-testid="button-shop-collection"
              >
                <ShoppingCart className="w-6 h-6 mr-3" />
                Shop the Collection
              </Button>
            </Link>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
