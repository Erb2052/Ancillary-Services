import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2, Circle, ShoppingCart, ArrowRight, ArrowLeft,
  Loader2, Shield, FlaskConical, MapPin, Settings,
  ScanLine, Timer, Leaf, TestTube, Activity, Zap,
  HeartPulse, BrainCircuit, ShieldCheck, type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  ScanLine, FlaskConical, Timer, Leaf, TestTube,
  Activity, Zap, HeartPulse, BrainCircuit, ShieldCheck,
};
function ProductIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[name] ?? FlaskConical;
  return <Icon className={className} style={style} />;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FOUNTAIN_LIFE_LOGO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663295938284/VZcpay2J5y3Rr3CApR9sWp/fountain_life_logo_ebaeae49.webp";

const STEPS = [
  { id: 1, label: "Location",    sub: "Choose your clinic"  },
  { id: 2, label: "Select Tests", sub: "Choose your items"  },
  { id: 3, label: "Review Cart",  sub: "Confirm & checkout" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}

// ─── Product Card ─────────────────────────────────────────────────────────────
type Product = {
  id: number; name: string; description: string | null;
  details: string | null; price: number; category: string | null;
  lucideIcon: string | null; stripePriceId: string;
  isActive: boolean; createdAt: Date; updatedAt: Date;
};

function ProductCard({ product, selected, onToggle }: { product: Product; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
        selected
          ? "border-teal-500 bg-teal-50/60 shadow-sm"
          : "border-border bg-white hover:border-teal-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Selection indicator */}
        <div className="shrink-0 mt-0.5">
          {selected
            ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#0d9488" }} />
            : <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/40" />}
        </div>
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#f0fdfa" }}>
          <ProductIcon name={product.lucideIcon ?? "FlaskConical"} className="w-5 h-5" style={{ color: "#0d9488" }} />
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug">{product.name}</h3>
            <span className="font-bold text-sm sm:text-base shrink-0" style={{ color: "oklch(0.25 0.08 240)" }}>{formatPrice(product.price)}</span>
          </div>
          {product.category && (
            <Badge variant="secondary" className="text-xs mb-2 font-medium" style={{ backgroundColor: "#f0fdfa", color: "#0f766e", border: "1px solid #99f6e4" }}>
              {product.category}
            </Badge>
          )}
          {product.description && <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-1">{product.description}</p>}
          {product.details && <p className="text-xs text-muted-foreground/80 leading-relaxed hidden sm:block">{product.details}</p>}
        </div>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const [step, setStep] = useState(1);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────
  const locationsQ = trpc.locations.listActive.useQuery();
  const productsQ = trpc.locations.getProducts.useQuery(
    { locationId: selectedLocationId! },
    { enabled: !!selectedLocationId }
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
      else { toast.error("Could not get checkout URL."); setIsRedirecting(false); }
    },
    onError: (err) => {
      toast.error(err.message || "Checkout failed. Please try again.");
      setIsRedirecting(false);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleProduct = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCheckout = () => {
    setIsRedirecting(true);
    checkoutMutation.mutate({
      productIds: Array.from(selectedIds),
      origin: window.location.origin,
    });
  };

  const selectedProducts = (productsQ.data ?? []).filter((p) => selectedIds.has(p.id));
  const cartTotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const progress = Math.round((step / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #06b6d4, #14b8a6, #10b981)" }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <img src={FOUNTAIN_LIFE_LOGO} alt="Fountain Life" className="h-8 sm:h-10 w-auto object-contain" />
          <div className="flex items-center gap-3">
            {/* Admin button — only visible to admin users */}
            {isAdmin && (
              <a
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{ borderColor: "#0d9488", color: "#0d9488", backgroundColor: "#f0fdfa" }}
              >
                <Settings className="w-3.5 h-3.5" />
                Admin Panel
              </a>
            )}
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground">Step {step} of {STEPS.length}</p>
              <p className="text-xs font-bold" style={{ color: "#0d9488" }}>{progress}% Complete</p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-border">
          <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(to right, #06b6d4, #14b8a6)" }} />
        </div>
        {/* Step indicators */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-px bg-border -z-0" />
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1 z-10">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  s.id < step ? "border-teal-500 bg-teal-500 text-white"
                  : s.id === step ? "border-teal-500 bg-white text-teal-600"
                  : "border-border bg-white text-muted-foreground"
                }`}>
                  {s.id < step ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <div className="text-center hidden sm:block">
                  <p className={`text-xs font-semibold ${s.id === step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                  <p className="text-xs text-muted-foreground/70">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">

        {/* ── STEP 1: Location Selector ─────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 sm:p-10">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4" style={{ color: "#0d9488" }} />
                <h2 className="font-semibold text-foreground text-sm sm:text-base">Select Your Clinic Location</h2>
              </div>

              {locationsQ.isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "#14b8a6" }} /></div>
              ) : (locationsQ.data ?? []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  No locations available yet. Please check back soon.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(locationsQ.data ?? []).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => { setSelectedLocationId(loc.id); setSelectedLocationName(loc.name); setSelectedIds(new Set()); }}
                      className={`text-left rounded-xl border-2 p-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                        selectedLocationId === loc.id
                          ? "border-teal-500 bg-teal-50/60 shadow-sm"
                          : "border-border bg-white hover:border-teal-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#f0fdfa" }}>
                          <MapPin className="w-5 h-5" style={{ color: "#0d9488" }} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{loc.name}</p>
                          {(loc.city || loc.state) && (
                            <p className="text-xs text-muted-foreground mt-0.5">{[loc.city, loc.state].filter(Boolean).join(", ")}</p>
                          )}
                        </div>
                        {selectedLocationId === loc.id && (
                          <CheckCircle2 className="w-5 h-5 ml-auto shrink-0" style={{ color: "#0d9488" }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full py-3 font-semibold text-base"
              style={{ backgroundColor: "oklch(0.25 0.08 240)" }}
              disabled={!selectedLocationId}
              onClick={() => setStep(2)}
            >
              Browse Add-On Tests <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* ── STEP 2: Product Selection ──────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Select Your Add-On Tests
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Choose one or more tests to add to your <strong>{selectedLocationName}</strong> program.
              </p>
            </div>

            {/* Sticky cart summary bar */}
            {selectedIds.size > 0 && (
              <div className="sticky top-[88px] z-10 mb-4">
                <div className="bg-white border border-teal-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 shrink-0" style={{ color: "#0d9488" }} />
                    <span className="text-sm font-medium text-foreground">
                      {selectedIds.size} test{selectedIds.size !== 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm" style={{ color: "oklch(0.25 0.08 240)" }}>{formatPrice(cartTotal)}</span>
                    <Button size="sm" onClick={() => setStep(3)} style={{ backgroundColor: "oklch(0.25 0.08 240)" }} className="text-xs">
                      Review Cart <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {productsQ.isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#14b8a6" }} /></div>
            ) : (productsQ.data ?? []).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm border border-dashed border-border rounded-xl bg-white">
                No tests are currently available at this location. Please check back soon.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(productsQ.data ?? []).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selected={selectedIds.has(product.id)}
                    onToggle={() => toggleProduct(product.id)}
                  />
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 sm:flex-none sm:px-6">
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-1 font-semibold"
                style={{ backgroundColor: "oklch(0.25 0.08 240)" }}
                disabled={selectedIds.size === 0}
                onClick={() => setStep(3)}
              >
                Review Cart ({selectedIds.size}) <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Cart Review ────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Review Your Cart
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Confirm your selections for <strong>{selectedLocationName}</strong>, then proceed to secure checkout.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-4">
              <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" style={{ color: "#14b8a6" }} />
                <h2 className="font-semibold text-sm text-foreground">Selected Tests — {selectedLocationName}</h2>
                <Badge variant="secondary" className="ml-auto text-xs">{selectedProducts.length} item{selectedProducts.length !== 1 ? "s" : ""}</Badge>
              </div>

              <div className="divide-y divide-border">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 sm:gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#f0fdfa" }}>
                      <ProductIcon name={product.lucideIcon ?? "FlaskConical"} className="w-5 h-5" style={{ color: "#0d9488" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{product.name}</p>
                      {product.category && <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm sm:text-base" style={{ color: "oklch(0.25 0.08 240)" }}>{formatPrice(product.price)}</p>
                    </div>
                    <button onClick={() => toggleProduct(product.id)} className="text-muted-foreground/50 hover:text-red-400 transition-colors ml-1 shrink-0" title="Remove">
                      <Circle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="font-semibold text-sm sm:text-base text-foreground">Estimated Total</span>
                <span className="text-xl font-bold" style={{ color: "oklch(0.25 0.08 240)" }}>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 mb-5 flex items-start gap-2.5">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#14b8a6" }} />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Payment is processed securely by <strong className="text-foreground">Stripe</strong>. Your financial information is never stored on our servers. All transactions are HIPAA-compliant and encrypted.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 sm:flex-none sm:px-6">
                <ArrowLeft className="mr-2 w-4 h-4" /> Edit Selection
              </Button>
              <Button
                className="flex-1 py-3 font-semibold text-base"
                style={{ backgroundColor: "oklch(0.25 0.08 240)" }}
                disabled={isRedirecting || selectedIds.size === 0}
                onClick={handleCheckout}
              >
                {isRedirecting ? (
                  <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Redirecting to Stripe…</>
                ) : (
                  <>Proceed to Secure Checkout <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <img src={FOUNTAIN_LIFE_LOGO} alt="Fountain Life" className="h-6 w-auto object-contain opacity-70" />
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Payments processed by <span className="font-medium text-foreground">Stripe</span> · HIPAA compliant
            {isAdmin ? (
              <> · <a href="/admin" className="font-medium hover:underline" style={{ color: "#0d9488" }}>Admin Panel</a></>
            ) : (
              <> · <a href={getLoginUrl()} className="hover:underline opacity-50">Staff Login</a></>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
