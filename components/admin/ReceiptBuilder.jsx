"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Printer, Share2, Search, X, History } from "lucide-react";
import { getProducts, supabase } from "@/lib/supabase";

function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function emptyLine() {
  return {
    id: crypto.randomUUID(),
    description: "",
    qty: 1,
    price: 0,
  };
}

function describeRlsError(error) {
  const code = String(error?.code || "");
  const status = error?.status || error?.statusCode;

  if (status === 403 || code === "42501") {
    return "Supabase RLS is blocking access to receipts. Add the receipts policies to your database."
  }

  return error?.message || "Could not load receipt data."
}

function buildReceiptSubtitle() {
  return "Professional electrical, solar, and water-heating solutions.";
}

export default function ReceiptBuilder() {
  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [business, setBusiness] = useState({
    name: "TruePower Solutions",
    address: "Maridadi Plaza, Shop C10",
    phone: "+254 701 039256",
    website: "https://www.truepower.co.ke/",
    logo: "/logo.png",
  });

  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptDate, setReceiptDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [notes, setNotes] = useState(
    "Payment after installation\nPochi la Biashara: 0701 039256\n2 years warranty",
  );
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const printRef = useRef();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
    loadSettings();
    loadHistory();
    suggestNextReceiptNumber();
  }, []);

  async function loadSettings() {
    try {
      const { data } = await supabase.from("settings").select("key, value");
      if (!data) return;
      const map = {};
      data.forEach((r) => (map[r.key] = r.value));
      setBusiness((b) => ({
        ...b,
        name: map.business_name || b.name,
        address: map.business_address || b.address,
        phone: map.whatsapp_number
          ? `+${String(map.whatsapp_number).replace(/^\+/, "")}`
          : map.wa_number
            ? `+${String(map.wa_number).replace(/^\+/, "")}`
            : b.phone,
        website: map.business_website || b.website,
      }));
    } catch (err) {
      setLoadError(describeRlsError(err));
    }
  }

  async function loadHistory() {
    try {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      setHistory(data || []);
    } catch (e) {
      setHistory([]);
      setLoadError(describeRlsError(e));
    }
  }

  async function suggestNextReceiptNumber() {
    try {
      const { data, error } = await supabase
        .from("receipts")
        .select("receipt_number")
        .order("receipt_number", { ascending: false })
        .limit(1);
      if (error) throw error;
      const last = data?.[0]?.receipt_number;
      setReceiptNumber(last ? String(last + 1) : "1006");
    } catch (err) {
      setLoadError(describeRlsError(err));
      setReceiptNumber("1006");
    }
  }

  const filteredProducts = useMemo(() => {
    if (!productQuery.trim()) return products.slice(0, 30);
    const q = productQuery.toLowerCase();
    return products.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 30);
  }, [productQuery, products]);

  function addLine() {
    setLines((ls) => [...ls, emptyLine()]);
  }

  function removeLine(id) {
    setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.id !== id) : ls));
  }

  function updateLine(id, patch) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addProductLine(product) {
    setLines((ls) => {
      const last = ls[ls.length - 1];
      const newLine = {
        id: crypto.randomUUID(),
        description: product.name,
        qty: 1,
        price: Number(product.price) || 0,
      };
      if (!last.description.trim() && ls.length === 1) {
        return [newLine];
      }
      return [...ls, newLine];
    });
    setShowProductPicker(false);
    setProductQuery("");
  }

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.price) || 0), 0),
    [lines],
  );
  const total = subtotal;

  function handlePrint() {
    window.print();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        receipt_number: Number(receiptNumber) || undefined,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        items: lines.map((l) => ({
          description: l.description,
          qty: Number(l.qty) || 0,
          price: Number(l.price) || 0,
        })),
        subtotal,
        total,
        notes,
      };
      const { data, error } = await supabase
        .from("receipts")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      setSavedId(data.id);
      loadHistory();
    } catch (e) {
      alert(e.message || "Could not save receipt");
    } finally {
      setSaving(false);
    }
  }

  function buildWhatsAppText() {
    const lines_ = [];
    lines_.push(`*${business.name}*`);
    lines_.push(`Receipt #${receiptNumber}`);
    lines_.push(`Date: ${receiptDate}`);
    if (customerName) lines_.push(`Customer: ${customerName}`);
    lines_.push("");
    lines.forEach((l) => {
      if (!l.description) return;
      const lineTotal = (Number(l.qty) || 0) * (Number(l.price) || 0);
      lines_.push(`${l.description} x${l.qty} - KSh ${formatMoney(lineTotal)}`);
    });
    lines_.push("");
    lines_.push(`*TOTAL: KSh ${formatMoney(total)}*`);
    if (notes) {
      lines_.push("");
      lines_.push(notes);
    }
    return lines_.join("\n");
  }

  async function handleShareWhatsApp() {
    const text = buildWhatsAppText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `Receipt #${receiptNumber}`, text });
        return;
      } catch {
      }
    }
    const phone = customerPhone.replace(/[^0-9]/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  function loadFromHistory(r) {
    setReceiptNumber(String(r.receipt_number));
    setReceiptDate(r.created_at?.slice(0, 10) || receiptDate);
    setCustomerName(r.customer_name || "");
    setCustomerPhone(r.customer_phone || "");
    setLines(
      (r.items || []).map((it) => ({
        id: crypto.randomUUID(),
        description: it.description,
        qty: it.qty,
        price: it.price,
      })),
    );
    setNotes(r.notes || "");
    setSavedId(r.id);
    setShowHistory(false);
  }

  const receiptNotes = notes?.trim()
    ? notes.trim()
    : "Payment after installation";

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-8 px-4 py-8 lg:px-10 xl:px-12">
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl">Receipt Builder</h2>
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="btn-ghost text-sm inline-flex items-center gap-2"
          >
            <History size={16} /> History
          </button>
        </div>

        {loadError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
            <div className="mt-1 text-xs text-amber-700/80">
              This tool needs the `receipts` table and read/write access in
              Supabase.
            </div>
          </div>
        )}

        {showHistory && (
          <div className="card-muted p-4 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sub text-sm">No receipts saved yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {history.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => loadFromHistory(r)}
                    className="w-full text-left py-2 flex items-center justify-between hover:bg-white/60 px-2 rounded-lg"
                  >
                    <span className="text-sm font-medium">
                      #{r.receipt_number} {r.customer_name ? `– ${r.customer_name}` : ""}
                    </span>
                    <span className="text-sm text-sub">
                      KSh {formatMoney(r.total)} · {r.created_at?.slice(0, 10)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="card p-5 grid grid-cols-2 gap-4">
          <div>
            <label className="label">Receipt #</label>
            <input
              className="input"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Customer Name (optional)</label>
            <input
              className="input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="label">Customer Phone</label>
            <input
              className="input"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0712345678"
            />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="label mb-0">Items</label>
            <div className="relative">
              <button
                onClick={() => setShowProductPicker((s) => !s)}
                className="btn-outline text-sm py-2 px-4 inline-flex items-center gap-2"
              >
                <Search size={14} /> Add from Products
              </button>
              {showProductPicker && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-2xl shadow-pop z-20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      autoFocus
                      className="input"
                      placeholder="Search products..."
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                    />
                    <button onClick={() => setShowProductPicker(false)} className="btn-ghost p-1">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-border">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProductLine(p)}
                        className="w-full text-left py-2 px-1 hover:bg-muted rounded-lg flex items-center justify-between gap-2"
                      >
                        <span className="text-sm truncate">{p.name}</span>
                        <span className="text-sm font-semibold text-brand-500 whitespace-nowrap">
                          KSh {formatMoney(p.price)}
                        </span>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="text-sub text-sm py-2">No products found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {lines.map((l) => (
              <div key={l.id} className="grid grid-cols-[1fr_70px_110px_36px] gap-2 items-center">
                <input
                  className="input"
                  placeholder="Description (e.g. Labour, Delivery, Product name)"
                  value={l.description}
                  onChange={(e) => updateLine(l.id, { description: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  className="input text-center"
                  placeholder="Qty"
                  value={l.qty}
                  onChange={(e) => updateLine(l.id, { qty: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  className="input text-right"
                  placeholder="Price"
                  value={l.price}
                  onChange={(e) => updateLine(l.id, { price: e.target.value })}
                />
                <button
                  onClick={() => removeLine(l.id)}
                  className="btn-ghost text-red-500 p-2 justify-self-center"
                  title="Remove line"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={addLine} className="btn-ghost text-sm mt-3 inline-flex items-center gap-2">
            <Plus size={14} /> Add line
          </button>
        </div>

        <div className="card p-5">
          <label className="label">Terms & Notes</label>
          <textarea
            className="input h-24 resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handlePrint} className="btn-primary">
            <Printer size={16} /> Print / Save PDF
          </button>
          <button onClick={handleShareWhatsApp} className="btn-outline">
            <Share2 size={16} /> Share via WhatsApp
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-ghost">
            {saving ? "Saving..." : savedId ? "Update record" : "Save receipt record"}
          </button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div
          ref={printRef}
          id="receipt-print-area"
          className="receipt-sheet bg-white border border-border rounded-2xl shadow-card p-8 sm:p-10 print:border-0 print:shadow-none print:rounded-none print:p-0"
        >
          <div className="flex items-start justify-between gap-6 pb-6 border-b-2 border-ink print:pb-4">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-brand-50 p-2 shadow-sm print:bg-white print:p-0 print:shadow-none">
                <Image
                  src={business.logo}
                  alt=""
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                  width={80}
                  height={80}
                />
              </div>
              <div className="pt-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-brand-500 font-semibold mb-1">
                  Official Receipt
                </p>
                <p className="font-display font-bold text-2xl leading-tight">
                  {business.name}
                </p>
                <p className="text-sub text-sm mt-1 max-w-xs">
                  {business.address}
                </p>
                <p className="text-sub text-sm">{business.phone}</p>
                {business.website && (
                  <p className="text-sub text-sm break-all">{business.website}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 pt-1">
              <h1 className="font-display font-bold text-3xl tracking-tight uppercase mb-2">
                Receipt
              </h1>
              <p className="text-sm leading-6">
                <span className="text-sub">No. </span>
                <span className="font-semibold">{receiptNumber}</span>
              </p>
              <p className="text-sm leading-6">
                <span className="text-sub">Date </span>
                <span className="font-semibold">{receiptDate}</span>
              </p>
              <p className="text-xs text-sub mt-2 max-w-[11rem]">
                {buildReceiptSubtitle()}
              </p>
            </div>
          </div>

          {(customerName || customerPhone) && (
            <div className="py-4 border-b border-border">
              <p className="label mb-2">Billed To</p>
              <div className="grid gap-1">
                {customerName && <p className="font-semibold text-base">{customerName}</p>}
                {customerPhone && <p className="text-sub text-sm">{customerPhone}</p>}
              </div>
            </div>
          )}

          <table className="w-full mt-4 text-sm receipt-table">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 font-display font-semibold text-sub uppercase text-xs tracking-wider">
                  Description
                </th>
                <th className="py-2 font-display font-semibold text-sub uppercase text-xs tracking-wider text-center w-16">
                  Qty
                </th>
                <th className="py-2 font-display font-semibold text-sub uppercase text-xs tracking-wider text-right w-28">
                  Price
                </th>
                <th className="py-2 font-display font-semibold text-sub uppercase text-xs tracking-wider text-right w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lines
                .filter((l) => l.description.trim())
                .map((l) => (
                  <tr key={l.id} className="border-b border-border/60">
                    <td className="py-2">{l.description}</td>
                    <td className="py-2 text-center">{l.qty}</td>
                    <td className="py-2 text-right">{formatMoney(l.price)}</td>
                    <td className="py-2 text-right font-medium">
                      {formatMoney((Number(l.qty) || 0) * (Number(l.price) || 0))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <div className="w-56 space-y-1">
              <div className="flex justify-between text-sm border-t-2 border-ink pt-2 mt-1">
                <span className="font-display font-bold">Total</span>
                <span className="font-display font-bold">KSh {formatMoney(total)}</span>
              </div>
            </div>
          </div>

          {receiptNotes && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="label mb-2">Terms & Conditions</p>
              <p className="text-sub text-sm whitespace-pre-line leading-6">
                {receiptNotes}
              </p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-border text-center">
            <p className="font-display font-semibold text-sm text-ink">
              Thank you for shopping with us.
            </p>
            <p className="text-faint text-xs mt-1">
              We appreciate your support and look forward to serving you again.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }

          body * {
            visibility: hidden;
          }
          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible;
          }
          .receipt-sheet {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            max-width: none;
            zoom: 0.86;
            overflow: hidden;
          }

          .receipt-table th,
          .receipt-table td {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
          }

          .receipt-sheet .label,
          .receipt-sheet .text-sub,
          .receipt-sheet .text-faint {
            color: #475569 !important;
          }

          .receipt-sheet,
          .receipt-sheet * {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
