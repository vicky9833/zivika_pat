"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import SortSheet from "@/components/locker/SortSheet";
import { RECORD_TYPES } from "@/lib/constants";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";
const H = "var(--font-outfit, 'Outfit', sans-serif)";

// Tab definitions — "all" + every RECORD_TYPES key
const TABS = [
  { id: "all", label: "All" },
  ...Object.entries(RECORD_TYPES).map(([id, { label }]) => ({ id, label })),
];

function countByType(records) {
  const counts = { all: records.length };
  for (const r of records) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }
  return counts;
}

function applySort(records, sort) {
  const copy = [...records];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "by-type":
      return copy.sort((a, b) => (a.type || "").localeCompare(b.type || ""));
    case "by-specialty":
      return copy.sort((a, b) => (a.specialty || "").localeCompare(b.specialty || ""));
    case "newest":
    default:
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

function matchSearch(record, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [
    record.title,
    record.doctor,
    record.facility,
    record.specialty,
    record.date,
    record.summary,
    ...(record.keyFindings?.map((f) => (typeof f === "string" ? f : f.text)) || []),
  ];
  return fields.some((f) => f && f.toLowerCase().includes(q));
}

/**
 * RecordFilters
 * Renders search bar, sort button, type tabs.
 * `children` is a render-prop: (filteredRecords) => ReactNode
 */
export default function RecordFilters({ records, children }) {
  const [query, setQuery]     = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort]       = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = records;
    if (activeTab !== "all") result = result.filter((r) => r.type === activeTab);
    result = result.filter((r) => matchSearch(r, query));
    return applySort(result, sort);
  }, [records, activeTab, query, sort]);

  // Count ALL records (regardless of active tab) for tab badges
  const allCounts = useMemo(() => countByType(records), [records]);

  return (
    <>
      {/* ── Search bar ─────────────────────────────────────────── */}
      <div style={{ padding: "0 20px", marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            borderRadius: 12,
            border: "1.5px solid #DCE8E2",
            padding: "0 14px",
            transition: "border-color 0.15s",
          }}
        >
          <Search size={16} color="#8EBAA3" style={{ flexShrink: 0 }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports, doctors, or dates..."
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              outline: "none",
              fontFamily: B,
              fontSize: "0.875rem",
              color: "#0B1F18",
              background: "transparent",
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <X size={14} color="#8EBAA3" />
            </button>
          ) : (
            <button
              onClick={() => setSortOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <SlidersHorizontal size={16} color="#5A9A7E" />
            </button>
          )}
        </div>
      </div>

      {/* ── Type tabs (horizontally scrollable) ───────────────── */}
      <div
        style={{
          overflowX: "auto",
          paddingLeft: 20,
          paddingRight: 20,
          marginBottom: 14,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          display: "flex",
          gap: 8,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const count  = allCounts[tab.id] || 0;
          if (tab.id !== "all" && count === 0) return null; // hide empty type tabs
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                background: active ? "#0D6E4F" : "#F0F7F4",
                color: active ? "#fff" : "#5A7A6E",
                fontFamily: B,
                fontWeight: active ? 600 : 400,
                fontSize: "0.8125rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Filtered records (render prop) ────────────────────── */}
      {children(filtered, activeTab)}

      {/* ── Sort sheet ─────────────────────────────────────────── */}
      <SortSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        value={sort}
        onChange={setSort}
      />
    </>
  );
}
