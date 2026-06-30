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

function parseReceiptNumber(value) {
  const parsed = Number.parseInt(String(value ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatReceiptDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getNextReceiptNumber(rows, fallback = 1007) {
  const highest = (rows || []).reduce((max, row) => {
    const number = parseReceiptNumber(row?.receipt_number);
    return number != null && number > max ? number : max;
  }, fallback - 1);

  return String(Math.max(fallback, highest + 1));
}

function summarizeItems(items) {
  const descriptions = (Array.isArray(items) ? items : [])
    .map((item) => String(item?.description || item?.product_name || item?.name || "").trim())
    .filter(Boolean);

  if (!descriptions.length) return "No item details";
  if (descriptions.length === 1) return descriptions[0];

  const [first, second] = descriptions;
  const remaining = descriptions.length - 2;
  return remaining > 0 ? `${first}, ${second} +${remaining} more` : `${first}, ${second}`;
}

function getHistoryRangeStart(range) {
  const start = new Date();

  if (range === "week") {
    const dayIndex = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayIndex);
  } else if (range === "month") {
    start.setDate(1);
  } else if (range === "year") {
    start.setMonth(0, 1);
  } else {
    return null;
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

function isWithinHistoryRange(row, start) {
  if (!start) return true;

  const createdAt = new Date(row?.created_at);
  if (Number.isNaN(createdAt.getTime())) return false;

  return createdAt >= start;
}

export default function ReceiptBuilder() {
  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [business, setBusiness] = useState({
    name: "TruePower Solutions",
    address: "Maridadi Plaza",
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
  const [activePanel, setActivePanel] = useState("builder");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyRange, setHistoryRange] = useState("all");
  const [historyPage, setHistoryPage] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const printRef = useRef();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
    loadSettings();
    loadHistory();
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
        .select("id, receipt_number, customer_name, customer_phone, subtotal, total, created_at, items, notes")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      const rows = data || [];
      setHistory(rows);
      setReceiptNumber(getNextReceiptNumber(rows));
    } catch (e) {
      setHistory([]);
      setLoadError(describeRlsError(e));
      setReceiptNumber("1007");
    }
  }

  const filteredProducts = useMemo(() => {
    if (!productQuery.trim()) return products.slice(0, 30);
    const q = productQuery.toLowerCase();
    return products.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 30);
  }, [productQuery, products]);

  const historyPeriodStats = useMemo(() => {
    const windows = [
      { key: "week", label: "This week" },
      { key: "month", label: "This month" },
      { key: "year", label: "This year" },
      { key: "all", label: "All time" },
    ];

    return windows.map((window) => {
      const start = getHistoryRangeStart(window.key);
      const rows = history.filter((row) => isWithinHistoryRange(row, start));
      const totalSales = rows.reduce((sum, row) => sum + (Number(row?.total) || 0), 0);

      return {
        ...window,
        count: rows.length,
        totalSales,
      };
    });
  }, [history]);

  const rangeFilteredHistory = useMemo(() => {
    const start = getHistoryRangeStart(historyRange);
    return history.filter((row) => isWithinHistoryRange(row, start));
  }, [history, historyRange]);

  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return rangeFilteredHistory;

    return rangeFilteredHistory.filter((row) => {
      const fields = [
        row?.receipt_number,
        row?.customer_name,
        row?.customer_phone,
        row?.total,
        row?.created_at,
        ...(Array.isArray(row?.items) ? row.items.map((item) => item?.description || item?.product_name || item?.name || "") : []),
      ]
        .map((value) => String(value || "").toLowerCase().trim())
        .filter(Boolean);

      return fields.some((value) => value.includes(q));
    });
  }, [rangeFilteredHistory, historyQuery]);

  const historyPageSize = 12;
  const historyPageCount = Math.max(1, Math.ceil(filteredHistory.length / historyPageSize));
  const visibleHistory = filteredHistory.slice(historyPage * historyPageSize, (historyPage + 1) * historyPageSize);

  useEffect(() => {
    setHistoryPage(0);
    setSelectedReceipt((current) => {
      if (!current) return current;
      return filteredHistory.some((row) => String(row.id) === String(current.id))
        ? current
        : filteredHistory[0] || null;
    });
  }, [historyQuery, historyRange, filteredHistory]);

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

  async function waitForPrintAssets(doc) {
    const images = Array.from(doc.images || []);
    const fontPromise =
      doc.fonts && typeof doc.fonts.ready?.then === "function"
        ? doc.fonts.ready.catch(() => {})
        : Promise.resolve();

    const imagePromise = new Promise((resolve) => {
      if (images.length === 0) {
        resolve();
        return;
      }

      let remaining = images.length;
      const settle = () => {
        remaining -= 1;
        if (remaining <= 0) resolve();
      };

      images.forEach((img) => {
        if (img.complete) {
          settle();
          return;
        }

        img.addEventListener("load", settle, { once: true });
        img.addEventListener("error", settle, { once: true });
      });
    });

    await Promise.all([fontPromise, imagePromise]);
    await new Promise((resolve) => window.setTimeout(resolve, 200));
  }

  async function saveReceipt({ openHistory = false, openModal = false } = {}) {
    setSaving(true);
    try {
      const wasEditing = Boolean(savedId);
      const nextReceiptNumber = getNextReceiptNumber(history);
      const parsedReceiptNumber = parseReceiptNumber(receiptNumber);
      const receiptNumberForSave =
        wasEditing
          ? parsedReceiptNumber || Number(nextReceiptNumber)
          : parsedReceiptNumber && parsedReceiptNumber >= Number(nextReceiptNumber)
            ? parsedReceiptNumber
            : Number(nextReceiptNumber);

      const payload = {
        receipt_number: receiptNumberForSave,
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
      let response;
      if (savedId) {
        const updateResult = await supabase
          .from("receipts")
          .update(payload)
          .eq("id", savedId)
          .select()
          .single();
        response = updateResult;
      } else {
        const insertResult = await supabase
          .from("receipts")
          .insert(payload)
          .select()
          .single();
        response = insertResult;
      }
      if (response.error) throw response.error;
      const data = response.data;
      setSavedId(data.id);
      setSelectedReceipt(data);
      if (openModal) {
        setIsReceiptModalOpen(true);
      }
      await loadHistory();
      if (wasEditing) {
        setReceiptNumber(String(data.receipt_number || receiptNumberForSave));
      }
      if (openHistory) {
        setActivePanel("history");
        setHistoryPage(0);
      }
      return data;
    } finally {
      setSaving(false);
    }
  }

  async function handlePrint() {
    if (!savedId) {
      try {
        await saveReceipt();
      } catch (error) {
        alert(error.message || "Could not save receipt before printing");
        return;
      }
    }

    const source = printRef.current;
    if (!source) return;

    const originalTitle = document.title;
    const receiptTitle = `TruePower Kenya Receipt${receiptNumber ? ` #${receiptNumber}` : ""}`;
    document.title = receiptTitle;

    const frame = document.createElement("iframe");
    frame.setAttribute("title", receiptTitle);
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    document.body.appendChild(frame);
    let cleanedUp = false;

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      window.removeEventListener("afterprint", cleanup);
      window.setTimeout(() => frame.remove(), 250);
    };

    window.addEventListener("afterprint", cleanup, { once: true });

    const doc = frame.contentDocument;
    if (!doc) {
      cleanup();
      window.print();
      return;
    }

    doc.open();
    doc.write(`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${receiptTitle}</title>
          ${styles}
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          ${source.outerHTML}
        </body>
      </html>`);
    doc.close();
    doc.title = receiptTitle;

    try {
      await waitForPrintAssets(doc);
    } catch {
      // If the receipt assets fail to settle, still try to print the document.
    }

    const printWindow = frame.contentWindow;
    if (!printWindow) {
      cleanup();
      window.print();
      return;
    }

    printWindow.document.title = receiptTitle;
    const titleElement = printWindow.document.querySelector("title");
    if (titleElement) {
      titleElement.textContent = receiptTitle;
    }

    if (printWindow.document.body) {
      printWindow.document.body.style.backgroundColor = "#ffffff";
    }

    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (error) {
        console.error("Print failed, falling back to top-level print:", error);
        window.print();
      }
    }, 100);

    window.setTimeout(cleanup, 10000);

    const restoreTitle = () => {
      if (document.title === receiptTitle) {
        document.title = originalTitle;
      }
    };

    window.addEventListener("afterprint", restoreTitle, { once: true });
  }

  function startEditingReceipt(receipt) {
    if (!receipt) return;

    const nextLines =
      Array.isArray(receipt.items) && receipt.items.length
        ? receipt.items.map((item) => ({
            id: crypto.randomUUID(),
            description: item?.description || item?.product_name || item?.name || "",
            qty: item?.qty ?? 1,
            price: item?.price ?? 0,
          }))
        : [emptyLine()];

    setSavedId(receipt.id);
    setReceiptNumber(String(receipt.receipt_number || ""));
    setReceiptDate(
      receipt.created_at
        ? new Date(receipt.created_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    );
    setCustomerName(receipt.customer_name || "");
    setCustomerPhone(receipt.customer_phone || "");
    setLines(nextLines);
    setNotes(receipt.notes || "");
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(false);
    setShowProductPicker(false);
    setActivePanel("builder");
  }

  async function handleSave() {
    try {
      await saveReceipt({ openHistory: true, openModal: true });
    } catch (error) {
      alert(error.message || "Could not save receipt");
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

  function renderReceiptDetails(
    receipt,
    { showActions = false, showOpenDetails = true } = {},
  ) {
    if (!receipt) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-slate-50 p-6 text-sm text-sub">
          Pick a sale on the left to see the full receipt breakdown here.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {showActions && (
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-ghost px-3 py-2 text-xs sm:text-sm"
              onClick={() => startEditingReceipt(receipt)}
            >
              Edit in builder
            </button>
            {showOpenDetails && (
              <button
                type="button"
                className="btn-outline px-3 py-2 text-xs sm:text-sm"
                onClick={() => {
                  setSelectedReceipt(receipt);
                  setIsReceiptModalOpen(true);
                }}
              >
                Open details
              </button>
            )}
          </div>
        )}
        <div className="rounded-3xl border border-brand-100 bg-brand-50/60 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-brand-600 font-semibold">Selected sale</div>
          <div className="mt-1 text-lg font-semibold">Receipt #{receipt.receipt_number}</div>
          <div className="mt-1 text-sm text-sub">{formatReceiptDate(receipt.created_at)}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Customer</div>
            <div className="mt-1 font-semibold">{receipt.customer_name || "N/A"}</div>
            <div className="text-xs text-sub">{receipt.customer_phone || "No phone"}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Subtotal</div>
            <div className="mt-1 font-semibold">KSh {formatMoney(receipt.subtotal ?? receipt.total)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Total</div>
            <div className="mt-1 font-semibold">KSh {formatMoney(receipt.total)}</div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-sub">Notes</div>
          <p className="mt-2 rounded-2xl border border-border bg-white p-3 text-sm whitespace-pre-line">
            {receipt.notes || "None"}
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-sub">Items</div>
          <div className="mt-2 grid gap-2">
            {(receipt.items || []).map((item, index) => (
              <div key={`${receipt.id}-item-${index}`} className="rounded-2xl border border-border bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{item.description || item.product_name || "Item"}</div>
                  <div className="text-sm text-sub">KSh {formatMoney(item.price)}</div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-xs text-sub">
                  <span>Qty: {item.qty || 0}</span>
                  <span>Line total: KSh {formatMoney((Number(item.qty) || 0) * (Number(item.price) || 0))}</span>
                </div>
              </div>
            ))}
            {!(receipt.items || []).length && (
              <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-3 text-sm text-sub">
                No item details saved.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderReceiptModal(receipt) {
    if (!receipt || !isReceiptModalOpen) {
      return null;
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 px-4 py-8"
        onClick={() => setIsReceiptModalOpen(false)}
      >
        <div
          className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-brand-500 font-semibold">Receipt details</p>
              <h3 className="mt-1 text-2xl font-bold">Receipt #{receipt.receipt_number}</h3>
              <p className="text-sm text-sub">{formatReceiptDate(receipt.created_at)}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(false)}
              className="btn-ghost p-2 text-sub"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-5">
            {renderReceiptDetails(receipt, { showActions: true, showOpenDetails: false })}
          </div>
        </div>
      </div>
    );
  }

  function renderHistoryPanel() {
    const totalMatches = filteredHistory.length;
    const showingStart = totalMatches === 0 ? 0 : historyPage * historyPageSize + 1;
    const showingEnd = Math.min((historyPage + 1) * historyPageSize, totalMatches);
    const selectedHistoryReceipt =
      selectedReceipt && filteredHistory.some((row) => String(row.id) === String(selectedReceipt.id))
        ? selectedReceipt
        : visibleHistory[0] || filteredHistory[0] || null;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Sales History</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">Sales and receipts</h2>
            <p className="text-sub text-sm">Browse receipts without covering the builder screen.</p>
          </div>
          <button
            type="button"
            onClick={() => setActivePanel("builder")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
          >
            <X size={16} />
            Back to Builder
          </button>
        </div>

        <div className="rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-sky-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <label className="label">Search sales</label>
              <input
                className="input bg-white"
                value={historyQuery}
                onChange={(e) => {
                  setHistoryQuery(e.target.value);
                  setHistoryPage(0);
                  setSelectedReceipt(null);
                }}
                placeholder="Search by receipt number, customer, phone, product..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:min-w-[260px]">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Receipts</div>
                <div className="mt-1 text-lg font-semibold text-ink">{history.length}</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Results</div>
                <div className="mt-1 text-lg font-semibold text-ink">{totalMatches}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {historyPeriodStats.map((stat) => (
              <div key={stat.key} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-[0.18em] text-sub">{stat.label}</div>
                <div className="mt-1 text-lg font-semibold text-ink">{stat.count}</div>
                <div className="mt-1 text-xs text-sub">KSh {formatMoney(stat.totalSales)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: "all", label: "All receipts" },
              { key: "week", label: "This week" },
              { key: "month", label: "This month" },
              { key: "year", label: "This year" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setHistoryRange(option.key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  historyRange === option.key
                    ? "bg-brand-500 text-white shadow-sm"
                    : "border border-border bg-white text-sub hover:border-brand-300 hover:text-brand-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border bg-white p-4 sm:p-5">
            {totalMatches === 0 ? (
              <p className="text-sub text-sm">No sales found for that search.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleHistory.map((r) => {
                  const isActive = String(selectedReceipt?.id || "") === String(r.id);
                  return (
                    <article
                      key={r.id}
                      className={`rounded-3xl border p-4 text-left shadow-sm transition ${
                        isActive
                          ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                          : "border-border bg-white hover:border-brand-300 hover:bg-brand-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">#{r.receipt_number}</div>
                          <div className="text-xs text-sub mt-1">{r.customer_name || "Customer"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-brand-700">KSh {formatMoney(r.total)}</div>
                          <div className="text-xs text-sub mt-1">{r.customer_phone || "No phone"}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-faint">
                        <span>{formatReceiptDate(r.created_at)}</span>
                        <span className="truncate">{summarizeItems(r.items)}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-ghost px-3 py-2 text-xs"
                          onClick={() => {
                            setSelectedReceipt(r);
                            setIsReceiptModalOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn-outline px-3 py-2 text-xs"
                          onClick={() => startEditingReceipt(r)}
                        >
                          Edit
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {historyPageCount > 1 && (
              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-sub">
                  Showing {showingStart}-{showingEnd} of {totalMatches} sales
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-ghost px-3 py-2 text-sm disabled:opacity-50"
                    disabled={historyPage === 0}
                    onClick={() => {
                      setHistoryPage((page) => Math.max(0, page - 1));
                      setSelectedReceipt(visibleHistory[0] || filteredHistory[0] || null);
                    }}
                  >
                    Prev
                  </button>
                  <span className="text-xs font-semibold text-sub">
                    Page {historyPage + 1} of {historyPageCount}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost px-3 py-2 text-sm disabled:opacity-50"
                    disabled={historyPage + 1 >= historyPageCount}
                    onClick={() => {
                      setHistoryPage((page) => Math.min(historyPageCount - 1, page + 1));
                      const nextStart = Math.min((historyPage + 1) * historyPageSize, Math.max(0, filteredHistory.length - 1));
                      setSelectedReceipt(filteredHistory[nextStart] || filteredHistory[0] || null);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-white p-4 sm:p-5">
            {renderReceiptDetails(selectedHistoryReceipt, { showActions: true })}
          </div>
        </div>
      </div>
    );
  }

  const receiptNotes = notes?.trim()
    ? notes.trim()
    : "Payment after installation";

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6 sm:gap-8 px-3 py-4 sm:px-4 sm:py-8 lg:px-10 xl:px-12 overflow-x-hidden">
      {activePanel === "builder" ? (
        <>
          <div className="space-y-6 print:hidden min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display font-bold text-lg sm:text-xl">Receipt Builder</h2>
              <button
                type="button"
                onClick={() => {
                  setActivePanel("history");
                  setSelectedReceipt(filteredHistory[0] || null);
                  setHistoryPage(0);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:border-blue-700"
              >
                <History size={16} /> Sales History
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

            <div className="card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="label">Receipt #</label>
                <input
                  className="input py-2.5 sm:py-3"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input py-2.5 sm:py-3"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Customer Name (optional)</label>
                <input
                  className="input py-2.5 sm:py-3"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="label">Customer Phone</label>
                <input
                  className="input py-2.5 sm:py-3"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0712345678"
                />
              </div>
            </div>

            <div className="card p-4 sm:p-5 overflow-hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <label className="label mb-0">Items</label>
                <div className="relative w-full sm:w-auto min-w-0">
                  <button
                    onClick={() => setShowProductPicker((s) => !s)}
                    className="btn-outline text-sm py-2 px-4 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Search size={14} /> Add from Products
                  </button>
                  {showProductPicker && (
                    <div
                      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 sm:p-6"
                      onClick={() => setShowProductPicker(false)}
                    >
                      <div
                        className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-white shadow-pop"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center">
                          <input
                            autoFocus
                            className="input flex-1 py-2"
                            placeholder="Search products..."
                            value={productQuery}
                            onChange={(e) => setProductQuery(e.target.value)}
                          />
                          <button onClick={() => setShowProductPicker(false)} className="btn-ghost p-2">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="max-h-[min(65vh,34rem)] overflow-y-auto divide-y divide-border p-3">
                          {filteredProducts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => addProductLine(p)}
                              className="w-full text-left py-3 px-3 hover:bg-muted rounded-2xl flex items-start justify-between gap-3"
                            >
                              <span className="text-sm min-w-0 flex-1 whitespace-normal break-words leading-snug">
                                {p.name}
                              </span>
                              <span className="text-sm font-semibold text-brand-500 whitespace-nowrap shrink-0">
                                KSh {formatMoney(p.price)}
                              </span>
                            </button>
                          ))}
                          {filteredProducts.length === 0 && (
                            <p className="text-sub text-sm py-4 text-center">No products found.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 min-w-0">
                {lines.map((l) => (
                  <div
                    key={l.id}
                    className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_70px_110px_36px] gap-2 sm:items-center"
                  >
                    <input
                      className="input py-2.5 sm:py-3"
                      placeholder="Description (e.g. Labour, Delivery, Product name)"
                      value={l.description}
                      onChange={(e) => updateLine(l.id, { description: e.target.value })}
                    />
                    <input
                      type="number"
                      min="0"
                      className="input py-2.5 sm:py-3 text-center"
                      placeholder="Qty"
                      value={l.qty}
                      onChange={(e) => updateLine(l.id, { qty: e.target.value })}
                    />
                    <input
                      type="number"
                      min="0"
                      className="input py-2.5 sm:py-3 text-right"
                      placeholder="Price"
                      value={l.price}
                      onChange={(e) => updateLine(l.id, { price: e.target.value })}
                    />
                    <button
                      onClick={() => removeLine(l.id)}
                      className="btn-ghost text-red-500 p-2 justify-self-end sm:justify-self-center"
                      title="Remove line"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addLine}
                className="btn-ghost text-sm mt-3 inline-flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus size={14} /> Add line
              </button>
            </div>

            <div className="card p-4 sm:p-5">
              <label className="label">Terms & Notes</label>
              <textarea
                className="input h-24 resize-none py-2.5 sm:py-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handlePrint} className="btn-primary justify-center">
                <Printer size={16} /> Print / Save PDF
              </button>
              <button onClick={handleShareWhatsApp} className="btn-outline justify-center">
                <Share2 size={16} /> Share via WhatsApp
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-ghost justify-center">
                {saving ? "Saving..." : savedId ? "Update record" : "Save receipt record"}
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start min-w-0">
            <div
              ref={printRef}
              id="receipt-print-area"
              className="receipt-sheet bg-white border border-border rounded-2xl shadow-card p-4 sm:p-8 sm:pt-8 print:border-0 print:shadow-none print:rounded-none print:p-0 max-w-full overflow-hidden min-w-0"
            >
              <div className="flex items-start justify-between gap-4 pb-4 sm:pb-5 border-b-2 border-ink print:pb-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-1.5 h-24 rounded-full bg-brand-500/15 print:bg-brand-500" />
                  <div className="rounded-3xl bg-brand-50 p-2.5 sm:p-4 shadow-sm print:bg-white print:p-0 print:shadow-none">
                    <Image
                      src={business.logo}
                      alt="TruePower Solutions logo"
                      className="h-20 w-20 sm:h-36 sm:w-36 object-contain"
                      width={144}
                      height={144}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0 pt-1">
                  <h1 className="font-display font-bold text-xl sm:text-3xl tracking-tight uppercase mb-2">
                    Receipt
                  </h1>
                  <div className="space-y-1 text-right">
                    <p className="text-sm leading-6">
                      <span className="text-sub">No. </span>
                      <span className="font-semibold">{receiptNumber}</span>
                    </p>
                    <p className="text-sm leading-6">
                      <span className="text-sub">Date </span>
                      <span className="font-semibold">{receiptDate}</span>
                    </p>
                  </div>
                  <p className="text-[11px] sm:text-xs text-sub mt-2 max-w-[9rem] sm:max-w-[11rem] ml-auto">
                    {buildReceiptSubtitle()}
                  </p>
                </div>
              </div>

              {(customerName || customerPhone) && (
                <div className="py-3 border-b border-border">
                  <p className="label mb-2">Billed To</p>
                  <div className="grid gap-1">
                    {customerName && <p className="font-semibold text-base">{customerName}</p>}
                    {customerPhone && <p className="text-sub text-sm">{customerPhone}</p>}
                  </div>
                </div>
              )}

              <table className="w-full mt-4 text-xs sm:text-sm receipt-table">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 font-display font-semibold text-sub uppercase text-[10px] sm:text-xs tracking-wider">
                      Description
                    </th>
                    <th className="py-2 font-display font-semibold text-sub uppercase text-[10px] sm:text-xs tracking-wider text-center w-12 sm:w-16">
                      Qty
                    </th>
                    <th className="py-2 font-display font-semibold text-sub uppercase text-[10px] sm:text-xs tracking-wider text-right w-20 sm:w-28">
                      Price
                    </th>
                    <th className="py-2 font-display font-semibold text-sub uppercase text-[10px] sm:text-xs tracking-wider text-right w-20 sm:w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines
                    .filter((l) => l.description.trim())
                    .map((l) => (
                      <tr key={l.id} className="border-b border-border/60">
                        <td className="py-2 pr-1">{l.description}</td>
                        <td className="py-2 text-center">{l.qty}</td>
                        <td className="py-2 text-right whitespace-nowrap">{formatMoney(l.price)}</td>
                        <td className="py-2 text-right font-medium whitespace-nowrap">
                          {formatMoney((Number(l.qty) || 0) * (Number(l.price) || 0))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-4">
                <div className="w-44 sm:w-56 space-y-1">
                  <div className="flex justify-between text-sm border-t-2 border-ink pt-2 mt-1">
                    <span className="font-display font-bold">Total</span>
                    <span className="font-display font-bold">KSh {formatMoney(total)}</span>
                  </div>
                </div>
              </div>

              {receiptNotes && (
                <div className="receipt-notes mt-6 pt-4 border-t border-border print:mt-3 print:pt-3">
                  <p className="label mb-2">Terms & Conditions</p>
                  <p className="text-sub text-sm whitespace-pre-line leading-6 print:text-[11px] print:leading-4">
                    {receiptNotes}
                  </p>
                </div>
              )}

              <div className="receipt-footer mt-7 pt-4 border-t-2 border-ink/10 text-center print:mt-3 print:pt-3">
                <p className="font-display font-semibold text-sm text-ink print:text-[13px]">
                  Thank you for shopping with us.
                </p>
                <p className="text-faint text-xs mt-1 leading-5 break-words print:text-[11px] print:leading-4">
                  Need help with delivery, installation, or after-sales support? Call or WhatsApp us on{" "}
                  <span className="font-semibold text-ink sm:whitespace-nowrap">{business.phone}</span>.
                </p>
                <p className="text-faint text-[11px] mt-1 print:text-[10px] print:mt-0.5">
                  <span className="break-all">{business.website}</span>
                  <span className="mx-2">|</span>
                  Maridadi Plaza
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="col-span-full min-w-0">
          {renderHistoryPanel()}
        </div>
      )}

      {renderReceiptModal(selectedReceipt)}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm;
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
            zoom: 0.74;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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

          .receipt-sheet {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .receipt-notes,
          .receipt-footer {
            margin-top: 0.75rem !important;
            padding-top: 0.75rem !important;
          }

          .receipt-footer p {
            line-height: 1.25 !important;
          }
        }
      `}</style>
    </div>
  );
}
