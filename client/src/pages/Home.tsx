import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FlaskConical,
  Sparkles,
  Shield,
} from "lucide-react";
import type { HealthProduct } from "../../../shared/products";

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Overview" },
  { id: 2, label: "Select Tests" },
  { id: 3, label: "Review Cart" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 sm:mb-12">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                current > step.id
                  ? "bg-emerald-500 text-white"
                  : current === step.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {current > step.id ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                current === step.id
                  ? "text-primary"
                  : current > step.id
                  ? "text-emerald-600"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-0.5 mx-2 transition-all duration-300 ${
                current > step.id ? "bg-emerald-400" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Overview / Intro ─────────────────────────────────────────────────
function StepIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {/* Hero */}
      <div
        className="rounded-2xl sm:rounded-3xl p-8 sm:p-14 mb-8 sm:mb-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.22 0.06 250) 0%, oklch(0.30 0.07 255) 50%, oklch(0.25 0.05 245) 100%)",
          color: "white",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 text-6xl">⚕️</div>
          <div className="absolute bottom-4 left-8 text-5xl">🔬</div>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-5" style={{ color: 'white' }}>
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Precision Health Add-Ons
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: 'white' }}
          >
            Personalize Your
            <br />
            <span className="text-yellow-300">Health Journey</span>
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Choose from 10 advanced diagnostic tests designed to give you
            deep insight into your biology — from cancer detection to cellular
            aging and beyond.
          </p>
        </div>
      </div>

      {/* Value props */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-10">
        {[
          {
            icon: <FlaskConical className="w-6 h-6 text-primary" />,
            title: "Clinically Validated",
            desc: "Every test is backed by peer-reviewed science and lab-certified results.",
          },
          {
            icon: <Shield className="w-6 h-6 text-primary" />,
            title: "HIPAA Compliant",
            desc: "Your health data is encrypted and protected at every step.",
          },
          {
            icon: <Sparkles className="w-6 h-6 text-primary" />,
            title: "Actionable Insights",
            desc: "Receive personalized recommendations based on your unique results.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-card border border-border rounded-xl p-5 text-left"
          >
            <div className="mb-3">{item.icon}</div>
            <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={onNext}
        className="w-full sm:w-auto px-10 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        Browse Add-On Tests
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  selected,
  onToggle,
}: {
  product: HealthProduct;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-xl border-2 p-4 sm:p-5 transition-all duration-200 card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/40"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Checkbox indicator */}
        <div className="mt-0.5 shrink-0">
          {selected ? (
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          ) : (
            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/50" />
          )}
        </div>

        {/* Icon */}
        <div className="text-2xl sm:text-3xl shrink-0 leading-none mt-0.5">
          {product.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug">
              {product.name}
            </h3>
            <Badge
              variant="secondary"
              className="text-xs shrink-0 bg-primary/10 text-primary border-0"
            >
              {product.category}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed">
            {product.description}
          </p>
          <p className="text-xs text-muted-foreground/70 leading-relaxed hidden sm:block">
            {product.details}
          </p>
          <div className="mt-3 font-semibold text-primary text-sm sm:text-base">
            {formatPrice(product.price)}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Step 2: Product Selection ────────────────────────────────────────────────
function StepSelectProducts({
  products,
  selected,
  onToggle,
  onBack,
  onNext,
}: {
  products: HealthProduct[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const totalCents = products
    .filter((p) => selected.has(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h2
          className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Select Your Add-On Tests
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Choose one or more tests to add to your health program. Select all
          that apply.
        </p>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            selected={selected.has(product.id)}
            onToggle={() => onToggle(product.id)}
          />
        ))}
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-4 bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              {selected.size} test{selected.size !== 1 ? "s" : ""} selected
            </span>
          </div>
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <span className="text-muted-foreground text-sm">
                Subtotal:{" "}
                <span className="font-semibold text-foreground">
                  {formatPrice(totalCents)}
                </span>
              </span>
            </>
          )}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 sm:flex-none"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={selected.size === 0}
            className="flex-1 sm:flex-none font-semibold"
          >
            Review Cart
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Cart Review ──────────────────────────────────────────────────────
function StepCartReview({
  products,
  selected,
  onBack,
}: {
  products: HealthProduct[];
  selected: Set<string>;
  onBack: () => void;
}) {
  const selectedProducts = products.filter((p) => selected.has(p.id));
  const totalCents = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  const createCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create checkout session.", {
        description:
          "Please ensure your Stripe credentials are configured. See shared/products.ts and server/stripe.ts.",
        duration: 8000,
      });
    },
  });

  const handleCheckout = () => {
    createCheckout.mutate({
      selectedProductIds: Array.from(selected),
      origin: window.location.origin,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h2
          className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Review Your Selection
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Confirm your add-on tests before proceeding to secure checkout.
        </p>
      </div>

      {/* Cart items */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-5">
        <div className="px-5 py-3 bg-muted/50 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">
            Selected Tests ({selectedProducts.length})
          </h3>
        </div>
        <div className="divide-y divide-border">
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 sm:gap-4 px-5 py-4"
            >
              <span className="text-xl sm:text-2xl shrink-0">{product.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm sm:text-base truncate">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.category}
                </p>
              </div>
              <span className="font-semibold text-foreground text-sm sm:text-base shrink-0">
                {formatPrice(product.price)}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-muted/30 border-t border-border flex justify-between items-center">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">
            {formatPrice(totalCents)}
          </span>
        </div>
      </div>

      {/* HIPAA / security note */}
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-emerald-800">
            Secure & HIPAA-Compliant Checkout
          </p>
          <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
            Payment is processed by Stripe. Your card details are never stored
            on our servers. All health data is encrypted and handled in
            accordance with HIPAA guidelines.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 sm:flex-none"
          disabled={createCheckout.isPending}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Edit Selection
        </Button>
        <Button
          onClick={handleCheckout}
          disabled={createCheckout.isPending}
          className="flex-1 font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
        >
          {createCheckout.isPending ? (
            <>
              <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              Preparing Checkout…
            </>
          ) : (
            <>
              Proceed to Secure Checkout
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Funnel Page ─────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: products, isLoading, error } = trpc.products.list.useQuery();

  const toggleProduct = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
          {selected.size > 0 && step < 3 && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-medium text-foreground">{selected.size}</span>
              <span className="hidden sm:inline">selected</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 sm:py-12">
        <StepIndicator current={step} />

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Loading health tests…
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto text-center py-16">
            <p className="text-destructive font-medium mb-2">
              Failed to load products
            </p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && products && (
          <>
            {step === 1 && <StepIntro onNext={() => setStep(2)} />}
            {step === 2 && (
              <StepSelectProducts
                products={products}
                selected={selected}
                onToggle={toggleProduct}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepCartReview
                products={products}
                selected={selected}
                onBack={() => setStep(2)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          <p>
            Payments processed securely by{" "}
            <span className="font-medium text-foreground">Stripe</span>. All
            health data handled in compliance with HIPAA.
          </p>
        </div>
      </footer>
    </div>
  );
}
