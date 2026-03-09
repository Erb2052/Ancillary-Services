import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

const FOUNTAIN_LIFE_LOGO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663295938284/VZcpay2J5y3Rr3CApR9sWp/fountain_life_logo_ebaeae49.webp";

export default function Success() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #06b6d4, #14b8a6, #10b981)" }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <img src={FOUNTAIN_LIFE_LOGO} alt="Fountain Life" className="h-8 sm:h-10 w-auto object-contain" />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-xl border border-border shadow-sm p-8 sm:p-12 text-center">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#f0fdfa" }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: "#0d9488" }} />
              </div>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Payment Confirmed!
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
              Your health add-on tests have been successfully ordered. You will
              receive a confirmation email shortly with next steps and kit
              delivery information.
            </p>

            {/* What's next */}
            <div className="text-left border border-border rounded-lg overflow-hidden mb-8">
              <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
                <FlaskConical className="w-4 h-4" style={{ color: "#14b8a6" }} />
                <h2 className="font-semibold text-sm text-foreground">What Happens Next</h2>
              </div>
              <div className="p-5">
                <ol className="space-y-3">
                  {[
                    "Check your email for your order confirmation and receipt.",
                    "Your test kit(s) will be shipped within 2–3 business days.",
                    "Complete sample collection using the included instructions.",
                    "Return your sample using the prepaid shipping label.",
                    "Receive personalized results and health insights within 7–14 days.",
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: "#f0fdfa", color: "#0f766e" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Link href="/">
              <Button
                className="w-full sm:w-auto px-8 font-semibold"
                style={{ backgroundColor: "oklch(0.25 0.08 240)" }}
              >
                Return to Health Add-Ons
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="max-w-3xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <img src={FOUNTAIN_LIFE_LOGO} alt="Fountain Life" className="h-6 w-auto object-contain opacity-70" />
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Payments processed by <span className="font-medium text-foreground">Stripe</span> · HIPAA compliant
          </p>
        </div>
      </footer>
    </div>
  );
}
