// ─────────────────────────────────────────────────────────────────────────────
//  ColumnFilterMenu.jsx
//  The dropdown that opens when you click the ⇅ icon on a column header.
//  Shows: Sort A→Z / Z→A, Clear filter, search box, checkbox list, OK/Cancel.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";

export default function ColumnFilterMenu({
  colKey,
  allValues,       // string[]  — unique values from allData for this column
  activeFilter,    // Set | undefined — currently applied filter
  onApply,         // (colKey, Set | null) => void
  onSort,          // (colKey, 1 | -1) => void
  onClose,
}) {
  const [search,  setSearch]  = useState("");
  const [checked, setChecked] = useState(() => new Set(activeFilter || allValues));
  const menuRef = useRef(null);

  // close on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const visible = allValues.filter((v) => v.toLowerCase().includes(search.toLowerCase()));
  const allChecked = visible.every((v) => checked.has(v));

  function toggleAll(check) {
    const next = new Set(checked);
    visible.forEach((v) => (check ? next.add(v) : next.delete(v)));
    setChecked(next);
  }

  function toggleOne(v, check) {
    const next = new Set(checked);
    check ? next.add(v) : next.delete(v);
    setChecked(next);
  }

  function handleApply() {
    const isAll = allValues.every((v) => checked.has(v));
    onApply(colKey, isAll ? null : new Set(checked));
  }

  function handleClear() {
    onApply(colKey, null);
    onClose();
  }

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[220px] py-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sort */}
      <button
        className="flex items-center gap-2 w-full px-3.5 py-2 text-xs hover:bg-gray-50 text-gray-700"
        onClick={() => { onSort(colKey, 1); onClose(); }}
      >
        <SortAscIcon /> Sort A to Z
      </button>
      <button
        className="flex items-center gap-2 w-full px-3.5 py-2 text-xs hover:bg-gray-50 text-gray-700"
        onClick={() => { onSort(colKey, -1); onClose(); }}
      >
        <SortDescIcon /> Sort Z to A
      </button>

      <div className="my-1 border-t border-gray-100" />

      {/* Clear */}
      <button
        className="flex items-center gap-2 w-full px-3.5 py-2 text-xs hover:bg-gray-50 text-gray-700"
        onClick={handleClear}
      >
        <ClearFilterIcon /> Clear filter
      </button>

      <div className="my-1 border-t border-gray-100" />

      {/* Search */}
      <div className="px-2.5 py-1.5">
        <input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full h-7 px-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>

      {/* Checkbox list */}
      <div className="max-h-40 overflow-y-auto px-1">
        {/* Select all */}
        <label className="flex items-center gap-2 px-2.5 py-1 text-xs cursor-pointer hover:bg-gray-50 rounded">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
            className="accent-indigo-600 w-3.5 h-3.5"
          />
          <span className="text-gray-700 font-medium">Select all</span>
        </label>

        {visible.map((v) => (
          <label key={v} className="flex items-center gap-2 px-2.5 py-1 text-xs cursor-pointer hover:bg-gray-50 rounded">
            <input
              type="checkbox"
              checked={checked.has(v)}
              onChange={(e) => toggleOne(v, e.target.checked)}
              className="accent-indigo-600 w-3.5 h-3.5"
            />
            <span className="text-gray-600">{v || "(blank)"}</span>
          </label>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 px-3 pt-2 pb-1 border-t border-gray-100 mt-1">
        <button
          onClick={onClose}
          className="h-7 px-3 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
        >
          CANCEL
        </button>
        <button
          onClick={handleApply}
          className="h-7 px-4 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          OK
        </button>
      </div>
    </div>
  );
}

// ── tiny inline SVG icons ────────────────────────────────────────────────────
function SortAscIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2 3h10M2 7h7M2 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function SortDescIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2 3h4M2 7h7M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function ClearFilterIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2 4h10l-4 5v3l-2-1V9L2 4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M11 2L3 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
