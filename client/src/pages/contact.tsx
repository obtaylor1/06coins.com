import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { StickyHeader } from "@/components/sticky-header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Building2, Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, ApiError } from "@/lib/queryClient";
import separatorBarImg from "@assets/0_0_640_N_1763339269798.png";

interface FormData {
  name: string;
  email: string;
  phone: string;
  chapter: string;
  subject: string;
  message: string;
  inquiryType: string;
  honeypot: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    chapter: "",
    subject: "",
    message: "",
    inquiryType: "",
    honeypot: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<{ title: string; message: string } | null>(null);
  const formStartTime = useRef<number>(Date.now());

  useEffect(() => {
    document.documentElement.classList.add("dark");
    formStartTime.current = Date.now();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous submit error
    setSubmitError(null);
    setSubmitSuccess(false);
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Please correct the errors",
        description: "Some fields are missing or invalid. Please check and try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate time elapsed for spam protection
      const timeElapsed = Date.now() - formStartTime.current;
      
      await apiRequest("POST", "/api/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        chapter: formData.chapter,
        subject: formData.subject,
        message: formData.message,
        inquiryType: formData.inquiryType,
        honeypot: formData.honeypot,
        timestamp: formStartTime.current,
        timeElapsed: timeElapsed,
      });

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        chapter: "",
        subject: "",
        message: "",
        inquiryType: "",
        honeypot: "",
      });
      setErrors({});
      
      toast({
        title: "Message sent successfully!",
        description: "We've received your message and will respond as soon as possible.",
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Contact form error:", error);
      
      // Extract structured error data from ApiError
      let errorTitle = "Failed to send message";
      let errorDescription = "There was an error sending your message. Please try again or email us directly.";
      
      if (error instanceof ApiError) {
        // Structured ApiError with status and data
        const { status, data } = error;
        
        // Extract message from data (handle strings, objects, and arrays)
        if (typeof data === 'string') {
          errorDescription = data;
        } else if (data?.message) {
          errorDescription = data.message;
        } else if (data && typeof data === 'object') {
          // Handle structured validation errors or other objects
          if (Array.isArray(data)) {
            errorDescription = data.join(', ');
          } else {
            // Try to extract meaningful error information
            errorDescription = JSON.stringify(data);
          }
        }
        
        // Set contextual title based on status code
        if (status === 429) {
          errorTitle = "Please slow down";
        } else if (status === 400) {
          errorTitle = "Validation error";
        } else if (status >= 500) {
          errorTitle = "Server error";
        }
      } else if (error?.message) {
        // Fallback to error message for non-ApiError errors
        errorDescription = error.message;
      }
      
      // Show error in both toast and inline alert for accessibility
      setSubmitError({ title: errorTitle, message: errorDescription });
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
      });
      
      // Scroll to top to show error alert
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050505] to-[#111111] text-foreground">
      <StickyHeader onCtaClick={() => window.location.href = '/shop-coins'} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Back to Home Link */}
        <Button
          variant="ghost"
          className="mb-8 text-primary"
          asChild
          data-testid="button-back-home"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <Badge 
            variant="outline" 
            className="mb-4 text-primary border-primary/30 bg-primary/5 px-4 py-1"
            data-testid="badge-contact"
          >
            Get In Touch
          </Badge>
          <h1 
            className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-primary"
            data-testid="heading-contact"
          >
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Questions about the 120-Year Commemorative Coins or bulk orders? We're here to help.
          </p>
        </div>

        {/* Decorative Separator */}
        <div className="flex justify-center mb-12">
          <img 
            src={separatorBarImg} 
            alt="Decorative separator with Egyptian-inspired design" 
            className="h-4 w-auto opacity-60"
            loading="lazy"
          />
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <Alert className="mb-8 border-primary/30 bg-primary/5" data-testid="alert-success">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <AlertDescription className="text-foreground ml-2">
              <strong>Thank you!</strong> We've received your message about the commemorative coins and will respond as soon as possible.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Error Alert */}
        {submitError && (
          <Alert variant="destructive" className="mb-8" data-testid="alert-submit-error">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <strong>{submitError.title}:</strong> {submitError.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Validation Error Alert */}
        {Object.keys(errors).length > 0 && !submitError && (
          <Alert variant="destructive" className="mb-8" data-testid="alert-validation-error">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              Please correct the highlighted fields below.
            </AlertDescription>
          </Alert>
        )}

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Contact Information */}
          <div className="space-y-8">
            <Card className="p-8 bg-card border-primary/20" data-testid="card-contact-info">
              <h2 className="font-playfair text-2xl font-bold text-primary mb-6">
                Contact Information
              </h2>
              
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Whether you have questions about the exclusive 120th Anniversary Commemorative Coin, 
                the Seven Jewels Collector's Set, shipping details, or bulk chapter orders, our team 
                is ready to assist you personally. We're proud to support the Alpha Phi Alpha fraternity 
                community.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">General inquiries & support:</p>
                    <a 
                      href="mailto:support@06coins.com" 
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                      data-testid="link-email-support"
                    >
                      support@06coins.com
                    </a>
                    <p className="text-muted-foreground mt-2">Orders & shipping:</p>
                    <a 
                      href="mailto:orders@06coins.com" 
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                      data-testid="link-email-orders"
                    >
                      orders@06coins.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Bulk & Chapter Orders</h3>
                    <p className="text-muted-foreground">
                      For special pricing on bulk orders for chapters and organizations, 
                      please use the form or contact us directly.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Info Card */}
            <Card className="p-6 bg-primary/5 border-primary/30" data-testid="card-response-time">
              <h3 className="font-semibold text-foreground mb-2">Response Time</h3>
              <p className="text-sm text-muted-foreground">
                We typically respond to all inquiries within 24-48 hours during business days. 
                For urgent matters regarding existing orders, please include your order number.
              </p>
            </Card>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <Card className="p-8 bg-card border-primary/20" data-testid="card-contact-form">
              <h2 className="font-playfair text-2xl font-bold text-primary mb-6">
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <Label htmlFor="name" className="text-foreground mb-2">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`bg-background border-primary/20 focus:border-primary ${errors.name ? 'border-destructive' : ''}`}
                    placeholder="John Doe"
                    data-testid="input-name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1" data-testid="error-name">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-foreground mb-2">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`bg-background border-primary/20 focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1" data-testid="error-email">{errors.email}</p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <Label htmlFor="phone" className="text-foreground mb-2">
                    Phone Number <span className="text-muted-foreground text-sm">(Optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>

                {/* Chapter / Organization (Optional) */}
                <div>
                  <Label htmlFor="chapter" className="text-foreground mb-2">
                    Chapter / Organization <span className="text-muted-foreground text-sm">(Optional)</span>
                  </Label>
                  <Input
                    id="chapter"
                    type="text"
                    value={formData.chapter}
                    onChange={(e) => handleChange("chapter", e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                    placeholder="Alpha Phi Alpha - Beta Chapter"
                    data-testid="input-chapter"
                  />
                </div>

                {/* Type of Inquiry (Optional) */}
                <div>
                  <Label htmlFor="inquiryType" className="text-foreground mb-2">
                    Type of Inquiry <span className="text-muted-foreground text-sm">(Optional)</span>
                  </Label>
                  <Select value={formData.inquiryType} onValueChange={(value) => handleChange("inquiryType", value)}>
                    <SelectTrigger className="bg-background border-primary/20 focus:border-primary" data-testid="select-inquiry-type">
                      <SelectValue placeholder="Select type of inquiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="order-status">Order Status</SelectItem>
                      <SelectItem value="bulk-order">Bulk/Chapter Order</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject" className="text-foreground mb-2">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className={`bg-background border-primary/20 focus:border-primary ${errors.subject ? 'border-destructive' : ''}`}
                    placeholder="Question about the 120th Anniversary Coin"
                    data-testid="input-subject"
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive mt-1" data-testid="error-subject">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="text-foreground mb-2">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className={`bg-background border-primary/20 focus:border-primary min-h-[150px] ${errors.message ? 'border-destructive' : ''}`}
                    placeholder="Tell us how we can help you..."
                    data-testid="input-message"
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-1" data-testid="error-message">{errors.message}</p>
                  )}
                </div>

                {/* Honeypot (Hidden) */}
                <input
                  type="text"
                  name="company"
                  value={formData.honeypot}
                  onChange={(e) => setFormData(prev => ({ ...prev, honeypot: e.target.value }))}
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
