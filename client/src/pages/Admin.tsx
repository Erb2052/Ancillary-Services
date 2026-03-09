import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MapPin, Package, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronRight, ArrowLeft, Loader2, ShieldAlert, LogIn,
  FlaskConical, ScanLine, Timer, Leaf, TestTube, Activity,
  Zap, HeartPulse, BrainCircuit, ShieldCheck, type LucideIcon,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

const FOUNTAIN_LIFE_LOGO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663295938284/VZcpay2J5y3Rr3CApR9sWp/fountain_life_logo_ebaeae49.webp";

const ICON_MAP: Record<string, LucideIcon> = {
  ScanLine, FlaskConical, Timer, Leaf, TestTube, Activity,
  Zap, HeartPulse, BrainCircuit, ShieldCheck,
};
function ProductIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? FlaskConical;
  return <Icon className="w-4 h-4" style={{ color: "#0d9488" }} />;
}

type AdminView = "locations" | "location-products";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [view, setView] = useState<AdminView>("locations");
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState("");

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // ── Location form state ───────────────────────────────────────────────────
  const [locName, setLocName] = useState("");
  const [locCity, setLocCity] = useState("");
  const [locState, setLocState] = useState("");
  const [locSlug, setLocSlug] = useState("");

  // ── Product form state ────────────────────────────────────────────────────
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodDetails, setProdDetails] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodIcon, setProdIcon] = useState("FlaskConical");
  const [prodPriceId, setProdPriceId] = useState("");

  // ── Queries ───────────────────────────────────────────────────────────────
  const utils = trpc.useUtils();
  const locationsQ = trpc.adminLocations.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const productsQ = trpc.adminProducts.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const locationProductsQ = trpc.adminLocations.getLocationProducts.useQuery(
    { locationId: selectedLocationId! },
    { enabled: !!selectedLocationId }
  );
  const assignedIdsQ = trpc.adminLocations.getAssignedProductIds.useQuery(
    { locationId: selectedLocationId! },
    { enabled: !!selectedLocationId && showAssignModal }
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createLoc = trpc.adminLocations.create.useMutation({ onSuccess: () => { utils.adminLocations.list.invalidate(); toast.success("Location created"); resetLocForm(); setShowLocationModal(false); } });
  const updateLoc = trpc.adminLocations.update.useMutation({ onSuccess: () => { utils.adminLocations.list.invalidate(); toast.success("Location updated"); resetLocForm(); setShowLocationModal(false); } });
  const deleteLoc = trpc.adminLocations.delete.useMutation({ onSuccess: () => { utils.adminLocations.list.invalidate(); toast.success("Location deleted"); } });
  const createProd = trpc.adminProducts.create.useMutation({ onSuccess: () => { utils.adminProducts.list.invalidate(); toast.success("Product created"); resetProdForm(); setShowProductModal(false); } });
  const updateProd = trpc.adminProducts.update.useMutation({ onSuccess: () => { utils.adminProducts.list.invalidate(); toast.success("Product updated"); resetProdForm(); setShowProductModal(false); } });
  const deleteProd = trpc.adminProducts.delete.useMutation({ onSuccess: () => { utils.adminProducts.list.invalidate(); toast.success("Product deleted"); } });
  const assignProd = trpc.adminLocations.assignProduct.useMutation({ onSuccess: () => { utils.adminLocations.getLocationProducts.invalidate(); utils.adminLocations.getAssignedProductIds.invalidate(); toast.success("Product assigned"); } });
  const toggleProd = trpc.adminLocations.toggleProduct.useMutation({ onSuccess: () => { utils.adminLocations.getLocationProducts.invalidate(); } });
  const removeProd = trpc.adminLocations.removeProduct.useMutation({ onSuccess: () => { utils.adminLocations.getLocationProducts.invalidate(); utils.adminLocations.getAssignedProductIds.invalidate(); toast.success("Product removed from location"); } });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetLocForm = () => { setLocName(""); setLocCity(""); setLocState(""); setLocSlug(""); setEditingLocation(null); };
  const resetProdForm = () => { setProdName(""); setProdDesc(""); setProdDetails(""); setProdPrice(""); setProdCategory(""); setProdIcon("FlaskConical"); setProdPriceId(""); setEditingProduct(null); };

  const openEditLocation = (loc: any) => {
    setEditingLocation(loc);
    setLocName(loc.name); setLocCity(loc.city ?? ""); setLocState(loc.state ?? ""); setLocSlug(loc.slug);
    setShowLocationModal(true);
  };
  const openEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProdName(prod.name); setProdDesc(prod.description ?? ""); setProdDetails(prod.details ?? "");
    setProdPrice(String(prod.price / 100)); setProdCategory(prod.category ?? "");
    setProdIcon(prod.lucideIcon ?? "FlaskConical"); setProdPriceId(prod.stripePriceId);
    setShowProductModal(true);
  };

  const handleLocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: locName, city: locCity || undefined, state: locState || undefined, slug: locSlug };
    if (editingLocation) updateLoc.mutate({ id: editingLocation.id, ...data });
    else createLoc.mutate(data);
  };
  const handleProdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: prodName, description: prodDesc || undefined, details: prodDetails || undefined, price: Math.round(parseFloat(prodPrice) * 100), category: prodCategory || undefined, lucideIcon: prodIcon, stripePriceId: prodPriceId };
    if (editingProduct) updateProd.mutate({ id: editingProduct.id, ...data });
    else createProd.mutate(data);
  };

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#14b8a6" }} />
    </div>
  );
  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="bg-white rounded-xl border border-border shadow-sm p-10 text-center max-w-sm w-full">
        <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Admin Access Required</h2>
        <p className="text-sm text-muted-foreground mb-6">Please sign in with your admin account to manage locations and products.</p>
        <a href={getLoginUrl()}><Button className="w-full" style={{ backgroundColor: "oklch(0.25 0.08 240)" }}><LogIn className="mr-2 w-4 h-4" />Sign In</Button></a>
      </div>
    </div>
  );
  if (user?.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="bg-white rounded-xl border border-border shadow-sm p-10 text-center max-w-sm w-full">
        <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-orange-400" />
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-6">Your account does not have admin privileges.</p>
        <Link href="/"><Button variant="outline" className="w-full"><ArrowLeft className="mr-2 w-4 h-4" />Back to Funnel</Button></Link>
      </div>
    </div>
  );

  const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #06b6d4, #14b8a6, #10b981)" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={FOUNTAIN_LIFE_LOGO} alt="Fountain Life" className="h-7 w-auto object-contain" />
            <span className="text-xs font-semibold text-muted-foreground border-l border-border pl-3 uppercase tracking-widest">Admin</span>
          </div>
          <Link href="/"><Button variant="outline" size="sm" className="text-xs"><ArrowLeft className="mr-1 w-3 h-3" />Patient View</Button></Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Tab nav */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { id: "locations" as AdminView, label: "Locations", icon: MapPin },
            { id: "location-products" as AdminView, label: "Products by Location", icon: Package },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${view === id ? "border-teal-500 text-teal-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── LOCATIONS VIEW ─────────────────────────────────────────────── */}
        {view === "locations" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Clinic Locations</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your Fountain Life clinic locations.</p>
              </div>
              <Button size="sm" onClick={() => { resetLocForm(); setShowLocationModal(true); }} style={{ backgroundColor: "oklch(0.25 0.08 240)" }}>
                <Plus className="mr-1.5 w-4 h-4" />Add Location
              </Button>
            </div>

            {locationsQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(locationsQ.data ?? []).map((loc) => (
                  <div key={loc.id} className="bg-white rounded-xl border border-border p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{loc.name}</p>
                        {(loc.city || loc.state) && <p className="text-xs text-muted-foreground mt-0.5">{[loc.city, loc.state].filter(Boolean).join(", ")}</p>}
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded mt-1 inline-block text-muted-foreground">/{loc.slug}</code>
                      </div>
                      <Badge variant={loc.isActive ? "default" : "secondary"} className="text-xs shrink-0" style={loc.isActive ? { backgroundColor: "#f0fdfa", color: "#0f766e", border: "1px solid #99f6e4" } : {}}>
                        {loc.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { setSelectedLocationId(loc.id); setSelectedLocationName(loc.name); setView("location-products"); }}>
                        <Package className="mr-1 w-3 h-3" />Products<ChevronRight className="ml-auto w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="px-2" onClick={() => openEditLocation(loc)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="outline" size="sm" className="px-2 text-red-500 hover:text-red-600" onClick={() => { if (confirm(`Delete "${loc.name}"?`)) deleteLoc.mutate({ id: loc.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
                {(locationsQ.data ?? []).length === 0 && (
                  <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">No locations yet. Add your first clinic location above.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LOCATION PRODUCTS VIEW ─────────────────────────────────────── */}
        {view === "location-products" && (
          <div>
            {/* Location selector */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Location:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(locationsQ.data ?? []).map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => { setSelectedLocationId(loc.id); setSelectedLocationName(loc.name); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedLocationId === loc.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-border bg-white text-muted-foreground hover:text-foreground"}`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {!selectedLocationId ? (
              <div className="text-center py-16 text-muted-foreground text-sm">Select a location above to manage its products.</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{selectedLocationName}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Toggle products on/off for this location, or assign new ones.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAssignModal(true)}>
                      <Plus className="mr-1.5 w-4 h-4" />Assign Product
                    </Button>
                    <Button size="sm" onClick={() => { resetProdForm(); setShowProductModal(true); }} style={{ backgroundColor: "oklch(0.25 0.08 240)" }}>
                      <Plus className="mr-1.5 w-4 h-4" />New Product
                    </Button>
                  </div>
                </div>

                {locationProductsQ.isLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : (
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    {(locationProductsQ.data ?? []).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">No products assigned to this location yet.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/40">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Category</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Price ID</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Visible</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(locationProductsQ.data ?? []).map((row) => (
                            <tr key={row.locationProductId} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: "#f0fdfa" }}>
                                    <ProductIcon name={row.product.lucideIcon ?? "FlaskConical"} />
                                  </div>
                                  <span className="font-medium text-foreground">{row.product.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{row.product.category ?? "—"}</td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <code className={`text-xs px-1.5 py-0.5 rounded ${row.product.stripePriceId.startsWith("price_REPLACE_") ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-muted text-muted-foreground"}`}>
                                  {row.product.stripePriceId.startsWith("price_REPLACE_") ? "⚠️ Placeholder" : row.product.stripePriceId.slice(0, 20) + "…"}
                                </code>
                              </td>
                              <td className="px-4 py-3 text-foreground font-medium">${(row.product.price / 100).toFixed(0)}</td>
                              <td className="px-4 py-3 text-center">
                                <button onClick={() => toggleProd.mutate({ locationProductId: row.locationProductId, isEnabled: !row.isEnabled })} className="transition-colors">
                                  {row.isEnabled
                                    ? <ToggleRight className="w-6 h-6 mx-auto" style={{ color: "#0d9488" }} />
                                    : <ToggleLeft className="w-6 h-6 mx-auto text-muted-foreground/40" />}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="px-2 h-7" onClick={() => openEditProduct(row.product)}><Pencil className="w-3.5 h-3.5" /></Button>
                                  <Button variant="ghost" size="sm" className="px-2 h-7 text-red-400 hover:text-red-600" onClick={() => { if (confirm("Remove from this location?")) removeProd.mutate({ locationProductId: row.locationProductId }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── LOCATION MODAL ──────────────────────────────────────────────────── */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowLocationModal(false); resetLocForm(); }}>
          <div className="bg-white rounded-xl border border-border shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{editingLocation ? "Edit Location" : "Add Location"}</h2>
            <form onSubmit={handleLocSubmit} className="space-y-4">
              <div><label className={labelCls}>Location Name *</label><input className={inputCls} value={locName} onChange={e => setLocName(e.target.value)} placeholder="e.g. Fountain Life Orlando" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>City</label><input className={inputCls} value={locCity} onChange={e => setLocCity(e.target.value)} placeholder="Orlando" /></div>
                <div><label className={labelCls}>State</label><input className={inputCls} value={locState} onChange={e => setLocState(e.target.value)} placeholder="FL" /></div>
              </div>
              <div>
                <label className={labelCls}>URL Slug *</label>
                <input className={inputCls} value={locSlug} onChange={e => setLocSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="orlando" required />
                <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, hyphens only. Used in URLs.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowLocationModal(false); resetLocForm(); }}>Cancel</Button>
                <Button type="submit" className="flex-1" style={{ backgroundColor: "oklch(0.25 0.08 240)" }} disabled={createLoc.isPending || updateLoc.isPending}>
                  {(createLoc.isPending || updateLoc.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editingLocation ? "Save Changes" : "Create Location"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PRODUCT MODAL ───────────────────────────────────────────────────── */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setShowProductModal(false); resetProdForm(); }}>
          <div className="bg-white rounded-xl border border-border shadow-xl w-full max-w-lg p-6 my-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{editingProduct ? "Edit Product" : "New Product"}</h2>
            <form onSubmit={handleProdSubmit} className="space-y-4">
              <div><label className={labelCls}>Product Name *</label><input className={inputCls} value={prodName} onChange={e => setProdName(e.target.value)} placeholder="Early Cancer Detection Test" required /></div>
              <div><label className={labelCls}>Short Description</label><input className={inputCls} value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Advanced multi-cancer early detection screening" /></div>
              <div><label className={labelCls}>Full Details</label><textarea className={inputCls + " min-h-[80px] resize-y"} value={prodDetails} onChange={e => setProdDetails(e.target.value)} placeholder="Detailed description shown on the product card..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Display Price (USD) *</label><input className={inputCls} type="number" min="0" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="999.00" required /></div>
                <div><label className={labelCls}>Category</label><input className={inputCls} value={prodCategory} onChange={e => setProdCategory(e.target.value)} placeholder="Cancer Screening" /></div>
              </div>
              <div>
                <label className={labelCls}>Icon</label>
                <select className={inputCls} value={prodIcon} onChange={e => setProdIcon(e.target.value)}>
                  {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>⚠️ Stripe Price ID *</label>
                <input className={inputCls} value={prodPriceId} onChange={e => setProdPriceId(e.target.value)} placeholder="price_1ABC123def456XYZ" required />
                <p className="text-xs text-muted-foreground mt-1">Find this in Stripe Dashboard → Products → [product] → Price ID</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowProductModal(false); resetProdForm(); }}>Cancel</Button>
                <Button type="submit" className="flex-1" style={{ backgroundColor: "oklch(0.25 0.08 240)" }} disabled={createProd.isPending || updateProd.isPending}>
                  {(createProd.isPending || updateProd.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProduct ? "Save Changes" : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ASSIGN PRODUCT MODAL ────────────────────────────────────────────── */}
      {showAssignModal && selectedLocationId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-xl border border-border shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Assign Product</h2>
            <p className="text-sm text-muted-foreground mb-4">Select a product from the master catalog to add to <strong>{selectedLocationName}</strong>.</p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(productsQ.data ?? []).map((prod) => {
                const alreadyAssigned = (assignedIdsQ.data ?? []).includes(prod.id);
                return (
                  <div key={prod.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${alreadyAssigned ? "border-border bg-muted/30 opacity-60" : "border-border hover:border-teal-300 hover:bg-teal-50/30 cursor-pointer transition-colors"}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: "#f0fdfa" }}>
                        <ProductIcon name={prod.lucideIcon ?? "FlaskConical"} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{prod.name}</p>
                        <p className="text-xs text-muted-foreground">${(prod.price / 100).toFixed(0)}</p>
                      </div>
                    </div>
                    {alreadyAssigned
                      ? <Badge variant="secondary" className="text-xs shrink-0">Assigned</Badge>
                      : <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => assignProd.mutate({ locationId: selectedLocationId, productId: prod.id })}>Add</Button>
                    }
                  </div>
                );
              })}
              {(productsQ.data ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No products in catalog yet. Create one first.</p>}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setShowAssignModal(false)}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}
