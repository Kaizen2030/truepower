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

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getHistoryRangeBounds(range) {
  const start = new Date();
  const end = new Date();

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  } else if (range === "yesterday") {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  } else if (range === "week") {
    const dayIndex = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayIndex);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  } else if (range === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  } else if (range === "last12months") {
    start.setMonth(start.getMonth() - 12);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  } else if (range === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  } else {
    return null;
  }

  return { start, end };
}

function getMonthRangeBounds(year, monthIndex) {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

function getYearRangeBounds(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

function isWithinHistoryRange(row, bounds) {
  if (!bounds) return true;

  const createdAt = new Date(row?.created_at);
  if (Number.isNaN(createdAt.getTime())) return false;

  if (bounds.start && createdAt < bounds.start) return false;
  if (bounds.end && createdAt >= bounds.end) return false;
  return true;
}

const RECYCLE_BIN_STORAGE_KEY = "truepower.receipt.recycle-bin";

function readDeletedReceiptIds() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECYCLE_BIN_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeDeletedReceiptIds(ids) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(RECYCLE_BIN_STORAGE_KEY, JSON.stringify(ids));
  } catch {
  }
}

export default function ReceiptBuilder() {
  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [business, setBusiness] = useState({
    name: "TruePower Solutions",
    address: "",
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
  const [deletedReceiptIds, setDeletedReceiptIds] = useState([]);
  const [recycleBinNotice, setRecycleBinNotice] = useState(null);
  const [activePanel, setActivePanel] = useState("builder");
  const [historyQuery, setHistoryQuery] = useState("");
  const [binQuery, setBinQuery] = useState("");
  const [historyRange, setHistoryRange] = useState("month");
  const [historyMonth, setHistoryMonth] = useState(() => new Date().getMonth());
  const [historyYear, setHistoryYear] = useState(() => new Date().getFullYear());
  const [historyPage, setHistoryPage] = useState(0);
  const [binPage, setBinPage] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const printRef = useRef();

  useEffect(() => {
    setDeletedReceiptIds(readDeletedReceiptIds());
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
    loadSettings();
    loadHistory();
  }, []);

  useEffect(() => {
    writeDeletedReceiptIds(deletedReceiptIds);
  }, [deletedReceiptIds]);

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
      const latestDate = new Date(rows[0]?.created_at);
      if (!Number.isNaN(latestDate.getTime())) {
        setHistoryMonth(latestDate.getMonth());
        setHistoryYear(latestDate.getFullYear());
      }
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

  const activeHistory = useMemo(
    () => history.filter((row) => !deletedReceiptIds.includes(String(row.id))),
    [history, deletedReceiptIds],
  );

  const recycleBinHistory = useMemo(
    () => history.filter((row) => deletedReceiptIds.includes(String(row.id))),
    [history, deletedReceiptIds],
  );

  const availableHistoryYears = useMemo(() => {
    const years = history
      .map((row) => {
        const date = new Date(row?.created_at);
        return Number.isNaN(date.getTime()) ? null : date.getFullYear();
      })
      .filter((year) => Number.isFinite(year));

    const currentYear = new Date().getFullYear();
    const oldestYear = years.length ? Math.min(...years) : currentYear;
    const latestYear = Math.max(currentYear, ...years, currentYear);

    return Array.from({ length: latestYear - oldestYear + 1 }, (_, index) => latestYear - index);
  }, [history]);

  const selectedMonthStats = useMemo(() => {
    const bounds = getMonthRangeBounds(historyYear, historyMonth);
    const rows = activeHistory.filter((row) => isWithinHistoryRange(row, bounds));
    const totalSales = rows.reduce((sum, row) => sum + (Number(row?.total) || 0), 0);

    return {
      count: rows.length,
      totalSales,
      averageSale: rows.length ? totalSales / rows.length : 0,
    };
  }, [activeHistory, historyMonth, historyYear]);

  const selectedYearStats = useMemo(() => {
    const bounds = getYearRangeBounds(historyYear);
    const rows = activeHistory.filter((row) => isWithinHistoryRange(row, bounds));
    const totalSales = rows.reduce((sum, row) => sum + (Number(row?.total) || 0), 0);

    return {
      count: rows.length,
      totalSales,
      averageSale: rows.length ? totalSales / rows.length : 0,
    };
  }, [activeHistory, historyYear]);

  const rangeFilteredHistory = useMemo(() => {
    const bounds =
      historyRange === "month"
        ? getMonthRangeBounds(historyYear, historyMonth)
        : historyRange === "year"
          ? getYearRangeBounds(historyYear)
          : getHistoryRangeBounds(historyRange);
    return activeHistory.filter((row) => isWithinHistoryRange(row, bounds));
  }, [activeHistory, historyRange, historyMonth, historyYear]);

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
  const selectedMonthLabel = `${MONTH_LABELS[historyMonth]} ${historyYear}`;

  const filteredBinHistory = useMemo(() => {
    const q = binQuery.trim().toLowerCase();
    if (!q) return recycleBinHistory;

    return recycleBinHistory.filter((row) => {
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
  }, [recycleBinHistory, binQuery]);

  const binPageCount = Math.max(1, Math.ceil(filteredBinHistory.length / historyPageSize));
  const visibleBinHistory = filteredBinHistory.slice(binPage * historyPageSize, (binPage + 1) * historyPageSize);

  useEffect(() => {
    setHistoryPage(0);
    setSelectedReceipt((current) => {
      if (!current) return current;
      return filteredHistory.some((row) => String(row.id) === String(current.id))
        ? current
        : filteredHistory[0] || null;
    });
  }, [historyQuery, historyRange, historyMonth, historyYear, filteredHistory]);

  useEffect(() => {
    setBinPage(0);
  }, [binQuery, recycleBinHistory]);

  function shiftHistoryMonth(step) {
    const nextDate = new Date(historyYear, historyMonth + step, 1);
    setHistoryMonth(nextDate.getMonth());
    setHistoryYear(nextDate.getFullYear());
    setHistoryPage(0);
  }

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

  function restoreReceipt(receiptId) {
    const nextDeletedIds = deletedReceiptIds.filter((id) => String(id) !== String(receiptId));
    setDeletedReceiptIds(nextDeletedIds);
    writeDeletedReceiptIds(nextDeletedIds);
    setRecycleBinNotice(null);
  }

  async function deleteReceipt(receiptId) {
    const receiptToDelete = history.find((entry) => String(entry.id) === String(receiptId));
    if (!receiptToDelete) return;

    if (!window.confirm("Move this receipt to the recycle bin? You can undo it later.")) {
      return;
    }

    try {
      setSaving(true);
      const nextDeletedIds = Array.from(new Set([...deletedReceiptIds, String(receiptId)]));
      setDeletedReceiptIds(nextDeletedIds);
      writeDeletedReceiptIds(nextDeletedIds);
      setRecycleBinNotice(receiptToDelete);

      if (String(selectedReceipt?.id) === String(receiptId)) {
        setSelectedReceipt(null);
      }

      if (String(savedId) === String(receiptId)) {
        setSavedId(null);
        setReceiptNumber(getNextReceiptNumber(activeHistory.filter((row) => String(row.id) !== String(receiptId))));
        setCustomerName("");
        setCustomerPhone("");
        setLines([emptyLine()]);
        setNotes("Payment after installation\nPochi la Biashara: 0701 039256\n2 years warranty");
      }

      setIsReceiptModalOpen(false);
    } catch (error) {
      alert(error.message || "Could not move receipt to the recycle bin");
    } finally {
      setSaving(false);
    }
  }

  function renderReceiptDetails(
    receipt,
    { showActions = false, showOpenDetails = true } = {},
  ) {
    if (!receipt) {
      return (
        <div className="rounded-[28px] border border-dashed border-brand-200 bg-gradient-to-br from-slate-50 to-white p-6 text-sm text-sub">
          Pick a sale on the left to see the full receipt breakdown here. The selected receipt will open with customer,
          totals, notes, and item lines.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {showActions && (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              className="w-full rounded-full border border-border bg-white px-3 py-2 text-xs sm:w-auto sm:text-sm font-semibold text-sub shadow-sm transition hover:border-brand-300 hover:text-brand-600"
              onClick={() => startEditingReceipt(receipt)}
            >
              Edit in builder
            </button>
            <button
              type="button"
              className="w-full rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:w-auto sm:text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
              onClick={() => deleteReceipt(receipt.id)}
            >
              <Trash2 size={14} className="inline mr-1" /> Move to recycle bin
            </button>
            {showOpenDetails && (
              <button
                type="button"
                className="w-full rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs sm:w-auto sm:text-sm font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100"
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
        <div className="overflow-hidden rounded-[28px] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-sky-50 p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.24em] text-brand-600 font-semibold">Selected sale</div>
          <div className="mt-1 text-2xl font-display font-bold text-ink">Receipt #{receipt.receipt_number}</div>
          <div className="mt-1 text-sm text-sub">{formatReceiptDate(receipt.created_at)}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-brand-100 bg-white p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Customer</div>
            <div className="mt-1 font-semibold text-ink">{receipt.customer_name || "N/A"}</div>
            <div className="text-xs text-sub">{receipt.customer_phone || "No phone"}</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-700">Subtotal</div>
            <div className="mt-1 font-semibold text-emerald-950">KSh {formatMoney(receipt.subtotal ?? receipt.total)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Total</div>
            <div className="mt-1 font-semibold text-slate-950">KSh {formatMoney(receipt.total)}</div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-sub">Notes</div>
          <p className="mt-2 rounded-2xl border border-border bg-white p-4 text-sm leading-6 whitespace-pre-line shadow-sm">
            {receipt.notes || "None"}
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-sub">Items</div>
          <div className="mt-2 grid gap-2">
            {(receipt.items || []).map((item, index) => (
              <div
                key={`${receipt.id}-item-${index}`}
                className="rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-ink">{item.description || item.product_name || "Item"}</div>
                  <div className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                    KSh {formatMoney(item.price)}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-sub">
                  <span className="rounded-full border border-border px-2 py-1">Qty: {item.qty || 0}</span>
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

        {recycleBinNotice && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">Receipt #{recycleBinNotice.receipt_number || ""} moved to the recycle bin.</div>
                <div className="mt-1 text-xs text-amber-700">You can undo this action right here.</div>
              </div>
              <button
                type="button"
                className="rounded-full border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                onClick={() => restoreReceipt(recycleBinNotice.id)}
              >
                Undo
              </button>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[260px]">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Receipts</div>
                <div className="mt-1 text-lg font-semibold text-ink">{activeHistory.length}</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Results</div>
                <div className="mt-1 text-lg font-semibold text-ink">{totalMatches}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              {
                label: "Selected period",
                value: selectedMonthLabel,
                note: "Exact calendar month",
                accent: "from-brand-500 to-sky-500",
              },
              {
                label: "Receipts in month",
                value: selectedMonthStats?.count ?? 0,
                note: `${selectedYearStats?.count ?? 0} receipts this year`,
                accent: "from-slate-700 to-slate-900",
              },
              {
                label: "Sales total",
                value: `KSh ${formatMoney(selectedMonthStats?.totalSales ?? 0)}`,
                note: "Month revenue",
                accent: "from-emerald-500 to-teal-500",
              },
              {
                label: "Average sale",
                value: `KSh ${formatMoney(selectedMonthStats?.averageSale ?? 0)}`,
                note: "Per receipt average",
                accent: "from-amber-500 to-orange-500",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="overflow-hidden rounded-3xl border border-white/70 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-4"
              >
                <div className={`h-1.5 w-14 rounded-full bg-gradient-to-r ${card.accent}`} />
                <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-sub">{card.label}</div>
                <div className="mt-2 text-base font-semibold text-ink sm:text-xl">{card.value}</div>
                <div className="mt-1 text-xs text-sub">{card.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-border bg-white/80 p-2 shadow-sm">
            {[
              { key: "all", label: "All receipts" },
              { key: "today", label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "week", label: "This week" },
              { key: "month", label: "Monthly archive" },
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
          {historyRange === "month" && (
            <div className="mt-4 rounded-[28px] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-sky-50 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-500">
                    Month archive
                  </div>
                  <h3 className="mt-2 text-2xl font-display font-bold text-ink">{selectedMonthLabel}</h3>
                  <p className="mt-1 max-w-xl text-sm text-sub">
                    Browse receipts by month like a timeline. Pick a year, switch the month, or move through the archive
                    one snapshot at a time.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => shiftHistoryMonth(-1)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-sub shadow-sm transition hover:border-brand-300 hover:text-brand-600"
                  >
                    Back one month
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftHistoryMonth(1)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-sub shadow-sm transition hover:border-brand-300 hover:text-brand-600"
                  >
                    Forward one month
                  </button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-border bg-white p-3 shadow-sm sm:p-4">
                  <label className="label text-[11px] sm:text-xs">Year</label>
                  <select
                    className="input bg-white"
                    value={historyYear}
                    onChange={(e) => {
                      setHistoryYear(Number(e.target.value));
                      setHistoryPage(0);
                    }}
                  >
                    {availableHistoryYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] text-sub sm:text-xs">Choose the year you want to revisit.</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-3 shadow-sm sm:p-4">
                  <label className="label text-[11px] sm:text-xs">Month</label>
                  <select
                    className="input bg-white"
                    value={historyMonth}
                    onChange={(e) => {
                      setHistoryMonth(Number(e.target.value));
                      setHistoryPage(0);
                    }}
                  >
                    {MONTH_LABELS.map((label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] text-sub sm:text-xs">Open the monthly snapshot for {selectedMonthLabel}.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {loadError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border bg-white p-4 sm:p-5">
            {totalMatches === 0 ? (
              <div className="rounded-[28px] border border-dashed border-brand-200 bg-gradient-to-br from-brand-50 via-white to-sky-50 p-6 text-sm text-brand-800">
                No sales found for that search.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleHistory.map((r) => {
                  const isActive = String(selectedReceipt?.id || "") === String(r.id);
                  return (
                    <article
                      key={r.id}
                      className={`group relative overflow-hidden rounded-3xl border p-4 text-left shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition ${
                        isActive
                          ? "border-brand-400 bg-gradient-to-br from-brand-50 via-white to-sky-50 ring-2 ring-brand-100"
                          : "border-border bg-white hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
                      }`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 ${
                          isActive
                            ? "bg-gradient-to-r from-brand-500 via-sky-400 to-cyan-400"
                            : "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200"
                        }`}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-ink">#{r.receipt_number}</div>
                            {isActive && (
                              <span className="rounded-full bg-brand-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="mt-1 truncate text-xs text-sub">{r.customer_name || "Customer"}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-base font-semibold text-brand-700">KSh {formatMoney(r.total)}</div>
                          <div className="mt-1 text-xs text-sub">{r.customer_phone || "No phone"}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-faint">
                        <span className="rounded-full bg-brand-50 px-2 py-1">{formatReceiptDate(r.created_at)}</span>
                        <span className="truncate">{summarizeItems(r.items)}</span>
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <button
                          type="button"
                          className="w-full rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-sub transition hover:border-brand-300 hover:text-brand-600 sm:w-auto"
                          onClick={() => {
                            setSelectedReceipt(r);
                            setIsReceiptModalOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 sm:w-auto"
                          onClick={() => startEditingReceipt(r)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 sm:w-auto"
                          onClick={() => deleteReceipt(r.id)}
                        >
                          <Trash2 size={14} className="inline mr-1" /> Move to bin
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

  function renderBinPanel() {
    const totalMatches = filteredBinHistory.length;
    const showingStart = totalMatches === 0 ? 0 : binPage * historyPageSize + 1;
    const showingEnd = Math.min((binPage + 1) * historyPageSize, totalMatches);
    const selectedBinReceipt =
      selectedReceipt && filteredBinHistory.some((row) => String(row.id) === String(selectedReceipt.id))
        ? selectedReceipt
        : visibleBinHistory[0] || filteredBinHistory[0] || null;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Recycle Bin</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">Deleted receipts</h2>
            <p className="text-sub text-sm">Restore deleted receipts or keep them in the recycle bin.</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => setActivePanel("builder")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 sm:w-auto sm:text-sm"
            >
              <X size={16} /> Back to Builder
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePanel("history");
                setHistoryPage(0);
                setSelectedReceipt(filteredHistory[0] || null);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:border-blue-700 sm:w-auto sm:text-sm"
            >
              <History size={16} /> View Sales History
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Search deleted receipts</label>
              <input
                className="input bg-white"
                value={binQuery}
                onChange={(e) => {
                  setBinQuery(e.target.value);
                  setBinPage(0);
                  setSelectedReceipt(null);
                }}
                placeholder="Search receipt number, customer, phone or item..."
              />
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Deleted receipts</div>
              <div className="mt-1 text-lg font-semibold text-ink">{totalMatches}</div>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-sub">Page</div>
              <div className="mt-1 text-lg font-semibold text-ink">{binPage + 1} / {binPageCount}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border bg-white p-4 sm:p-5">
            {totalMatches === 0 ? (
              <div className="rounded-[28px] border border-dashed border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 text-sm text-amber-800">
                No deleted receipts in the recycle bin.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleBinHistory.map((r) => {
                  const isActive = String(selectedReceipt?.id || "") === String(r.id);
                  return (
                    <article
                      key={r.id}
                      className={`group relative overflow-hidden rounded-3xl border p-4 text-left shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition ${
                        isActive
                          ? "border-amber-400 bg-gradient-to-br from-amber-50 via-white to-orange-50 ring-2 ring-amber-100"
                          : "border-border bg-white hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
                      }`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 ${
                          isActive
                            ? "bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400"
                            : "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200"
                        }`}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-ink">#{r.receipt_number}</div>
                            {isActive && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                                Deleted
                              </span>
                            )}
                          </div>
                          <div className="mt-1 truncate text-xs text-sub">{r.customer_name || "Customer"}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-base font-semibold text-amber-700">KSh {formatMoney(r.total)}</div>
                          <div className="mt-1 text-xs text-sub">{r.customer_phone || "No phone"}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-faint">
                        <span className="rounded-full bg-amber-50 px-2 py-1">{formatReceiptDate(r.created_at)}</span>
                        <span className="truncate">{summarizeItems(r.items)}</span>
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <button
                          type="button"
                          className="w-full rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-sub transition hover:border-amber-300 hover:text-amber-700 sm:w-auto"
                          onClick={() => {
                            setSelectedReceipt(r);
                            setIsReceiptModalOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 sm:w-auto"
                          onClick={() => startEditingReceipt(r)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 sm:w-auto"
                          onClick={() => restoreReceipt(r.id)}
                        >
                          Undo
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {binPageCount > 1 && (
              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-sub">
                  Showing {showingStart}-{showingEnd} of {totalMatches} deleted receipts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-ghost px-3 py-2 text-sm disabled:opacity-50"
                    disabled={binPage === 0}
                    onClick={() => {
                      setBinPage((page) => Math.max(0, page - 1));
                      setSelectedReceipt(visibleBinHistory[0] || filteredBinHistory[0] || null);
                    }}
                  >
                    Prev
                  </button>
                  <span className="text-xs font-semibold text-sub">
                    Page {binPage + 1} of {binPageCount}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost px-3 py-2 text-sm disabled:opacity-50"
                    disabled={binPage + 1 >= binPageCount}
                    onClick={() => {
                      setBinPage((page) => Math.min(binPageCount - 1, page + 1));
                      const nextStart = Math.min((binPage + 1) * historyPageSize, Math.max(0, filteredBinHistory.length - 1));
                      setSelectedReceipt(filteredBinHistory[nextStart] || filteredBinHistory[0] || null);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-white p-4 sm:p-5">
            {renderReceiptDetails(selectedBinReceipt, { showActions: true })}
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl">Receipt Builder</h2>
                <p className="mt-1 text-xs text-sub sm:text-sm">
                  Build the receipt on the left and preview it on the right.
                </p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActivePanel("history");
                    setSelectedReceipt(filteredHistory[0] || null);
                    setHistoryPage(0);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-xs sm:w-auto sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:border-blue-700"
                >
                  <History size={16} /> Sales History
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePanel("bin");
                    setBinPage(0);
                    setSelectedReceipt(null);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-500 bg-amber-50 px-4 py-2 text-xs sm:w-auto sm:text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100 hover:border-amber-600"
                >
                  <Trash2 size={16} /> Recycle Bin
                </button>
              </div>
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
                <div>
                  <label className="label mb-0">Items</label>
                  <p className="mt-1 text-xs text-sub">
                    Each line becomes one row on the receipt preview.
                  </p>
                </div>
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
                          <button
                            onClick={() => setShowProductPicker(false)}
                            className="inline-flex items-center justify-center rounded-full border border-border bg-white p-2 text-sub shadow-sm transition hover:border-brand-300 hover:text-brand-600"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="max-h-[min(65vh,34rem)] overflow-y-auto divide-y divide-border p-3">
                          {filteredProducts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => addProductLine(p)}
                              className="flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-muted"
                            >
                              <span className="min-w-0 flex-1 whitespace-normal break-words text-sm leading-snug">
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
                    className="rounded-2xl border border-border bg-white p-3 shadow-sm grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_70px_110px_36px] gap-2 sm:items-center"
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
                      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 p-2 text-red-500 justify-self-end transition hover:border-red-300 hover:bg-red-100 sm:justify-self-center"
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
              className="receipt-sheet bg-white border border-border rounded-2xl shadow-card p-4 sm:p-6 print:border-0 print:shadow-none print:rounded-none print:p-0 max-w-full overflow-hidden min-w-0"
            >
              <div className="receipt-header">
                <div className="receipt-logo-wrap">
                  <Image
                    src={business.logo}
                    alt="TruePower logo"
                    className="receipt-logo"
                    width={70}
                    height={70}
                  />
                </div>
                <div className="receipt-company-name">{business.name}</div>
                <div className="receipt-company-contact">{business.phone}</div>
                <div className="receipt-company-contact">{business.website.replace(/^https?:\/\//i, "")}</div>
              </div>

              <p className="receipt-subtitle">{buildReceiptSubtitle()}</p>
              <div className="receipt-divider" />

              <div className="receipt-meta-block">
                <div className="receipt-meta-row">
                  <span>No.</span>
                  <span>{receiptNumber}</span>
                </div>
                <div className="receipt-meta-row">
                  <span>Date</span>
                  <span>{receiptDate}</span>
                </div>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-table-head">
                <span>Description</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Amount</span>
              </div>

              <div className="receipt-lines">
                {lines.filter((l) => l.description.trim()).length ? (
                  lines
                    .filter((l) => l.description.trim())
                    .map((l) => {
                      const amount = (Number(l.qty) || 0) * (Number(l.price) || 0);
                      return (
                        <div key={l.id} className="receipt-row">
                          <div className="receipt-item-description">
                            <span>{l.description}</span>
                            <small>
                              {Number(l.qty) || 0} x {formatMoney(Number(l.price) || 0)}
                            </small>
                          </div>
                          <div className="receipt-item-qty">{Number(l.qty) || 0}</div>
                          <div className="receipt-item-price">KSh {formatMoney(Number(l.price) || 0)}</div>
                          <div className="receipt-item-total">KSh {formatMoney(amount)}</div>
                        </div>
                      );
                    })
                ) : (
                  <div className="receipt-empty-state">No line items added yet.</div>
                )}
              </div>

              <div className="receipt-total-row">
                <span>Total</span>
                <strong>KSh {formatMoney(total)}</strong>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-terms-block">
                <p className="receipt-section-label">TERMS & CONDITIONS</p>
                <p className="receipt-terms-text">{receiptNotes}</p>
              </div>

              <div className="receipt-footer-box">
                <p className="receipt-footer-message">Thank you for shopping with us.</p>
                <p className="receipt-footer-support">
                  Need help with delivery, installation, or after-sales support? Call or WhatsApp us on{" "}
                  <span>{business.phone}</span>.
                </p>
                <p className="receipt-footer-link">{business.website}</p>
              </div>
            </div>
          </div>
        </>
      ) : activePanel === "history" ? (
        <div className="col-span-full min-w-0">
          {renderHistoryPanel()}
        </div>
      ) : (
        <div className="col-span-full min-w-0">
          {renderBinPanel()}
        </div>
      )}

      {renderReceiptModal(selectedReceipt)}

      <style jsx global>{`
        .receipt-sheet {
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          max-width: 420px;
          margin: 0 auto;
          font-family: "Segoe UI", sans-serif;
        }

        .receipt-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.15rem;
          margin-bottom: 0.25rem;
        }

        .receipt-logo-wrap {
          width: 72px;
          height: 72px;
          border-radius: 9999px;
          background: #dbeef7;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid rgba(29, 78, 216, 0.12);
          margin-bottom: 0.4rem;
        }

        .receipt-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .receipt-company-name {
          font-weight: 800;
          font-size: 1.15rem;
          line-height: 1.2;
        }

        .receipt-company-contact {
          font-size: 0.62rem;
          color: #64748b;
          line-height: 1.4;
          word-break: break-word;
        }

        .receipt-meta-block {
          text-align: center;
          margin: 0.4rem 0;
        }

        .receipt-heading-title {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: #0f172a;
          margin-bottom: 0.35rem;
        }

        .receipt-meta-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.68rem;
          color: #334155;
          line-height: 1.5;
        }

        .receipt-subtitle {
          margin: 0.75rem 0 0.5rem;
          font-size: 0.68rem;
          color: #475569;
          text-align: center;
          line-height: 1.5;
        }

        .receipt-divider {
          border-top: 1px dashed rgba(15, 23, 42, 0.35);
          margin: 0.4rem 0 0.75rem;
        }

        .receipt-table-head,
        .receipt-row {
          display: grid;
          grid-template-columns: minmax(0, 2fr) 0.5fr 0.7fr 0.8fr;
          align-items: start;
          column-gap: 0.5rem;
        }

        .receipt-table-head {
          border-bottom: 1px solid rgba(15, 23, 42, 0.18);
          padding-bottom: 0.38rem;
          margin-bottom: 0.35rem;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #475569;
        }

        .receipt-table-head span:nth-child(2),
        .receipt-table-head span:nth-child(3),
        .receipt-table-head span:nth-child(4) {
          text-align: right;
        }

        .receipt-lines {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .receipt-row {
          align-items: flex-start;
          font-size: 0.78rem;
          color: #0f172a;
          padding-bottom: 0.2rem;
        }

        .receipt-item-description {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }

        .receipt-item-description span {
          line-height: 1.35;
          word-break: break-word;
        }

        .receipt-item-description small {
          color: #64748b;
          font-size: 0.58rem;
        }

        .receipt-item-qty,
        .receipt-item-price,
        .receipt-item-total {
          text-align: right;
          white-space: nowrap;
        }

        .receipt-item-price,
        .receipt-item-total {
          font-weight: 600;
        }

        .receipt-empty-state {
          border: 1px dashed rgba(15, 23, 42, 0.25);
          border-radius: 0.75rem;
          padding: 0.75rem;
          color: #64748b;
          font-size: 0.72rem;
          text-align: center;
        }

        .receipt-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.85rem;
          padding-top: 0.35rem;
          border-top: 1px solid rgba(15, 23, 42, 0.18);
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .receipt-total-row strong {
          font-size: 0.95rem;
        }

        .receipt-terms-block {
          margin-top: 0.8rem;
        }

        .receipt-section-label {
          margin: 0 0 0.35rem;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #475569;
        }

        .receipt-terms-text {
          margin: 0;
          font-size: 0.72rem;
          color: #334155;
          line-height: 1.5;
          white-space: pre-line;
        }

        .receipt-footer-box {
          margin-top: 0.9rem;
          padding-top: 0.7rem;
          border-top: 1px dashed rgba(15, 23, 42, 0.3);
          text-align: center;
        }

        .receipt-footer-message {
          margin: 0;
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }

        .receipt-footer-support {
          margin: 0.5rem 0 0;
          font-size: 0.64rem;
          color: #475569;
          line-height: 1.5;
        }

        .receipt-footer-support span {
          font-weight: 700;
          color: #0f172a;
        }

        .receipt-footer-link {
          margin: 0.25rem 0 0;
          font-size: 0.6rem;
          color: #64748b;
          word-break: break-word;
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
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
            left: 2mm;
            width: 76mm;
            max-width: 76mm;
            padding: 3mm 3mm 3mm 4mm !important;
            overflow: visible;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            border: none;
            box-shadow: none;
          }

          .receipt-company-name {
            font-size: 0.75rem;
          }

          .receipt-company-contact,
          .receipt-subtitle,
          .receipt-table-head,
          .receipt-terms-text,
          .receipt-footer-support,
          .receipt-footer-link {
            font-size: 0.5rem !important;
          }

          .receipt-heading-title {
            font-size: 0.9rem;
          }

          .receipt-table-head,
          .receipt-row,
          .receipt-total-row,
          .receipt-footer-box {
            transform: none;
          }

          .receipt-table-head,
          .receipt-row {
            grid-template-columns: minmax(0, 1fr) 0.28fr 0.68fr 0.75fr;
            column-gap: 0.2rem;
          }

          .receipt-row {
            font-size: 0.58rem;
            line-height: 1.15;
            padding-bottom: 0.08rem;
          }

          .receipt-item-description {
            display: block;
            min-width: 0;
          }

          .receipt-item-description span {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .receipt-item-description small {
            display: none;
          }

          .receipt-item-price,
          .receipt-item-total {
            font-size: 0.5rem;
            letter-spacing: -0.01em;
          }

          .receipt-lines {
            gap: 0.22rem;
          }

          .receipt-terms-block {
            text-align: center;
          }

          .receipt-divider {
            margin: 0.28rem 0 0.5rem;
          }

          .receipt-total-row {
            margin-top: 0.5rem;
            padding-top: 0.25rem;
            font-size: 0.72rem;
          }

          .receipt-total-row strong {
            font-size: 0.76rem;
          }
        }
      `}</style>
    </div>
  );
}