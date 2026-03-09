import { Link } from "wouter";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const FOUNTAIN_LIFE_LOGO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663295938284/VZcpay2J5y3Rr3CApR9sWp/fountain_life_logo_ebaeae49.webp";

export default function Cancel() {
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
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl border border-border shadow-sm p-8 sm:p-12 text-center">
            {/* Cancel icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-orange-400" />
              </div>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Checkout Cancelled
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
              No worries — your payment was not processed. Your cart selections
              are saved and you can return to complete your order at any time.
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8 text-sm text-muted-foreground leading-relaxed">
              If you experienced any issues during checkout, please contact your
              Fountain Life care team for assistance.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto px-6">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Tests
                </Button>
              </Link>
              <Link href="/">
                <Button
                  className="w-full sm:w-auto px-6 font-semibold"
                  style={{ backgroundColor: "oklch(0.25 0.08 240)" }}
                >
                  <ShoppingCart className="mr-2 w-4 h-4" />
                  Try Again
                </Button>
              </Link>
            </div>
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
