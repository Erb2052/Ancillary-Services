import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Success() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container py-3 sm:py-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">H</span>
          </div>
          <span
            className="font-semibold text-foreground text-sm sm:text-base"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Health Add-Ons
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
            </div>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Payment Confirmed!
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
            Your health add-on tests have been successfully ordered. You will
            receive a confirmation email shortly with next steps and kit
            delivery information.
          </p>

          {/* What's next */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 text-left mb-8">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              What Happens Next
            </h2>
            <ol className="space-y-3">
              {[
                "Check your email for your order confirmation and receipt.",
                "Your test kit(s) will be shipped to your address within 2–3 business days.",
                "Complete the sample collection following the included instructions.",
                "Return your sample using the prepaid shipping label.",
                "Receive your personalized results and health insights within 7–14 days.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <Link href="/">
            <Button className="w-full sm:w-auto px-8 py-5 font-semibold text-base">
              Return to Health Add-Ons
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="container py-5 text-center text-xs text-muted-foreground">
          Payments processed securely by{" "}
          <span className="font-medium text-foreground">Stripe</span>. All
          health data handled in compliance with HIPAA.
        </div>
      </footer>
    </div>
  );
}
