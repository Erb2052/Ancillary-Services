import { Link } from "wouter";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Cancel() {
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
        <div className="max-w-md w-full text-center">
          {/* Cancel icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500" />
            </div>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Checkout Cancelled
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
            No worries — your payment was not processed. You can go back and
            review your selected tests whenever you're ready.
          </p>

          <div className="bg-muted/50 border border-border rounded-xl p-5 mb-8 text-sm text-muted-foreground leading-relaxed">
            Your cart selections are still saved. Click below to return and
            complete your order at any time.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto px-6 py-5">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Tests
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto px-6 py-5 font-semibold">
                <ShoppingCart className="mr-2 w-4 h-4" />
                Try Again
              </Button>
            </Link>
          </div>
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
