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
  Shield,
  Sparkles,
  FlaskConical,
} from "lucide-react";
import type { HealthProduct } from "../../../shared/products";

// ─── Constants ────────────────────────────────────────────────────────────────
const FOUNTAIN_LIFE_LOGO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663295938284/VZcpay2J5y3Rr3CApR9sWp/fountain_life_logo_ebaeae49.webp";

const STEPS = [
  { id: 1, label: "Overview", sub: "Your add-on journey" },
  { id: 2, label: "Select Tests", sub: "Choose your items" },
  { id: 3, label: "Review Cart", sub: "Confirm & checkout" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

// ─── Fountain Life Progress Header ───────────────────────────────────────────
function FountainLifeHeader({ step }: { step: number }) {
  const pct = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="bg-white border-b border-border">
      {/* Progress bar */}
      <div className="h-1.5 bg-muted w-full">
        <div
          className="h-full rounded-r-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(to right, #06b6d4, #14b8a6, #10b981)",
          }}
        />
      </div>

      {/* Logo + step info */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <img
          src={FOUNTAIN_LIFE_LOGO}
          alt="Fountain Life"
          className="h-8 sm:h-10 w-auto object-contain"
        />
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-medium">
            Step {step} of {STEPS.length}
          </p>
          <p
            className="text-xs font-semibold"
            style={{ color: "#14b8a6" }}
          >
            {Math.round((step / STEPS.length) * 100)}% Complete
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-5">
        <div className="flex items-start justify-between relative">
          {/* Connector line */}
          <div className="absolute top-5 sm:top-6 left-0 right-0 h-0.5 bg-border z-0" />
          <div
            className="absolute top-5 sm:top-6 left-0 h-0.5 z-0 transition-all duration-700"
            style={{
              width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
              background:
                "linear-gradient(to right, #06b6d4, #14b8a6, #10b981)",
            }}
          />

          {STEPS.map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1.5 z-10 flex-1"
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-500 ${
                    isDone
                      ? "bg-white"
                      : isActive
                      ? "bg-white"
                      : "bg-white/80"
                  }`}
                  style={{
                    borderColor: isDone || isActive ? "#14b8a6" : "#e2e8f0",
                    color: isDone || isActive ? "#14b8a6" : "#94a3b8",
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    s.id
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      isActive
                        ? "text-foreground"
                        : isDone
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {s.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Overview ─────────────────────────────────────────────────────────
function StepIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-border shadow-sm p-8 sm:p-12 text-center">
        {/* Logo */}
        <img
          src={FOUNTAIN_LIFE_LOGO}
          alt="Fountain Life"
          className="h-12 sm:h-14 w-auto object-contain mx-auto mb-6"
        />

        <h1
          className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Health Add-On Services
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          Extend your Fountain Life program with advanced diagnostic tests
          designed to give you deeper insight into your biology.
        </p>

        {/* Value props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
          {[
            {
              icon: <FlaskConical className="w-5 h-5" style={{ color: "#14b8a6" }} />,
              title: "Clinically Validated",
              desc: "Peer-reviewed science, lab-certified results.",
            },
            {
              icon: <Shield className="w-5 h-5" style={{ color: "#14b8a6" }} />,
              title: "HIPAA Compliant",
              desc: "Your data is encrypted and protected.",
            },
            {
              icon: <Sparkles className="w-5 h-5" style={{ color: "#14b8a6" }} />,
              title: "Actionable Insights",
              desc: "Personalized recommendations from your results.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50 border border-border"
            >
              {item.icon}
              <p className="font-semibold text-sm text-foreground">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto px-10 font-semibold"
          style={{ backgroundColor: "oklch(0.25 0.08 240)" }}
        >
          Browse Add-On Tests
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
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
      className={`w-full text-left rounded-lg border-2 p-4 sm:p-5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        selected
          ? "border-teal-500 bg-teal-50/60 shadow-sm"
          : "border-border bg-white hover:border-teal-300 hover:shadow-sm"
      }`}
      style={selected ? { "--tw-ring-color": "#14b8a6" } as React.CSSProperties : {}}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Checkbox */}
        <div className="mt-0.5 shrink-0">
          {selected ? (
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />
          ) : (
            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/40" />
          )}
        </div>

        {/* Icon */}
        <div className="text-2xl shrink-0 leading-none mt-0.5">
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
              className="text-xs shrink-0 border-0"
              style={{ backgroundColor: "#f0fdfa", color: "#0f766e" }}
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
          <div
            className="mt-3 font-semibold text-sm sm:text-base"
            style={{ color: "oklch(0.25 0.08 240)" }}
          >
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
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h2
          className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Select Your Add-On Tests
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Choose one or more tests to add to your Fountain Life program.
        </p>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-24 sm:mb-28">
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50 px-4 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground text-sm">
                {selected.size} test{selected.size !== 1 ? "s" : ""} selected
              </span>
            </div>
            {selected.size > 0 && (
              <>
                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <span className="text-muted-foreground text-sm">
                  Subtotal:{" "}
                  <span className="font-semibold text-foreground">
                    {formatPrice(totalCents)}
                  </span>
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 sm:flex-none text-sm"
            >
              <ArrowLeft className="mr-1.5 w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={selected.size === 0}
              className="flex-1 sm:flex-none font-semibold text-sm"
              style={{ backgroundColor: "oklch(0.25 0.08 240)" }}
            >
              Review Cart
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
          </div>
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
      toast.error("Checkout setup required", {
        description: err.message,
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

      {/* Cart card */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-5 shadow-sm">
        <div className="px-5 py-3.5 bg-muted/40 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">
            Selected Tests
          </h3>
          <span className="text-xs text-muted-foreground">
            {selectedProducts.length} item{selectedProducts.length !== 1 ? "s" : ""}
          </span>
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
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              <span
                className="font-semibold text-sm sm:text-base shrink-0"
                style={{ color: "oklch(0.25 0.08 240)" }}
              >
                {formatPrice(product.price)}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-muted/30 border-t border-border flex justify-between items-center">
          <span className="font-semibold text-foreground text-sm">Total</span>
          <span
            className="text-xl font-bold"
            style={{ color: "oklch(0.25 0.08 240)" }}
          >
            {formatPrice(totalCents)}
          </span>
        </div>
      </div>

      {/* HIPAA note */}
      <div
        className="flex items-start gap-3 rounded-lg p-4 mb-6 border"
        style={{
          backgroundColor: "#f0fdfa",
          borderColor: "#99f6e4",
        }}
      >
        <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#0d9488" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "#0f766e" }}>
            Secure & HIPAA-Compliant Checkout
          </p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#115e59" }}>
            Payment is processed by Stripe. Your card details are never stored
            on our servers. All health data is handled in accordance with HIPAA.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={createCheckout.isPending}
          className="flex-1 sm:flex-none"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Edit Selection
        </Button>
        <Button
          onClick={handleCheckout}
          disabled={createCheckout.isPending}
          className="flex-1 font-semibold py-5 text-sm sm:text-base shadow-sm"
          style={{ backgroundColor: "oklch(0.25 0.08 240)" }}
        >
          {createCheckout.isPending ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Preparing Checkout…
            </>
          ) : (
            <>
              Proceed to Secure Checkout
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <FountainLifeHeader step={step} />

      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            <p className="text-muted-foreground text-sm">Loading tests…</p>
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

      <footer className="border-t border-border bg-white mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <img
            src={FOUNTAIN_LIFE_LOGO}
            alt="Fountain Life"
            className="h-6 w-auto object-contain opacity-70"
          />
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Payments processed by{" "}
            <span className="font-medium text-foreground">Stripe</span> ·
            HIPAA compliant · All data encrypted
          </p>
        </div>
      </footer>
    </div>
  );
}
