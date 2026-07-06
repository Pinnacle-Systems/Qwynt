import React, { useState } from "react";
import Modal from "../../../UiComponents/Modal";

/* ---------------- DEFAULT TOTALS ---------------- */
const defaultTotalsRows = ({ totalQty, subtotal, taxAmount, netAmount }) => [
    {
        key: "totalQty",
        label: "Total Quantity",
        value: totalQty || 0,
        summaryColumn: "left",
    },
    {
        key: "subtotal",
        label: "Gross Amount",
        value: `Rs.${(subtotal || 0).toFixed(2)}`,
        summaryColumn: "right",
    },
    {
        key: "taxAmount",
        label: "GST Amount",
        value: `Rs.${(taxAmount || 0).toFixed(2)}`,
        summaryColumn: "right",
    },
    {
        key: "netAmount",
        label: "Net Amount",
        value: `Rs.${(netAmount || 0).toFixed(2)}`,
        emphasized: true,
        summaryColumn: "right",
    },
];

const resolveSummaryColumn = (row = {}) => {
    if (row.summaryColumn === "left" || row.summaryColumn === "right") {
        return row.summaryColumn;
    }
    const identity = String(row.key || row.label || "").toLowerCase();
    return ["qty", "quantity"].some((t) => identity.includes(t))
        ? "left"
        : "right";
};

/* ---------------- COMPONENT ---------------- */
const ReusableFormFooter = ({
    sections = [], // 🔥 MAIN CHANGE
    totalQty,
    subtotal,
    taxAmount,
    netAmount,
    readOnly = false,
    totalsRows,
    extraTotalsContent = null,
    extraTotalsContentColumn = "left",
    leftActions = null,
    rightActions = null,
    stacked = false,
    hasSummaryTitle = false,
}) => {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [activeSectionIndex, setActiveSectionIndex] = useState(null);

    const textareaRefs = React.useRef([]);

    /* ---------------- TOTALS ---------------- */
    const resolvedTotalsRows =
        totalsRows?.length > 0
            ? totalsRows
            : defaultTotalsRows({ totalQty, subtotal, taxAmount, netAmount });

    const leftSummaryRows = resolvedTotalsRows.filter(
        (row) => resolveSummaryColumn(row) === "left"
    );
    const rightSummaryRows = resolvedTotalsRows.filter(
        (row) => resolveSummaryColumn(row) === "right"
    );

    const hasLeftSummaryContent =
        leftSummaryRows.length > 0 ||
        (extraTotalsContent && extraTotalsContentColumn === "left");

    const hasRightSummaryContent =
        rightSummaryRows.length > 0 ||
        (extraTotalsContent && extraTotalsContentColumn === "right");

    /* ---------------- TEMPLATE ---------------- */
    const handleTemplateSelection = (value) => {
        const section = sections[activeSectionIndex];
        if (!section) return;

        const selected = section.options?.find(
            (o) => String(o.value) === String(value)
        );

        if (!selected) return;

        const nextText = selected.templateText || "";

        const shouldReplace =
            !section.value ||
            section.value === nextText ||
            window.confirm("Replace current text?");

        if (!shouldReplace) return;

        section.onChange(nextText);
        section.onTemplateChange?.(value, selected);

        setTimeout(() => {
            textareaRefs.current[activeSectionIndex]?.focus();
        }, 100);

        setIsTemplateModalOpen(false);
    };

    /* ---------------- RENDER ---------------- */
    return (
        <div className="space-y-1.5">
            {/* TEMPLATE MODAL */}
            <Modal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                widthClass="w-[420px] max-h-[70vh]"
            >
                <div className="flex max-h-[calc(70vh-3.5rem)] flex-col">
                    <div className="mb-3 border-b border-slate-100 pb-2">
                        <h3 className="text-sm font-bold text-slate-800">
                            Apply Template
                        </h3>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                        {sections[activeSectionIndex]?.options?.length > 0 ? (
                            sections[activeSectionIndex].options.map((opt, index) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleTemplateSelection(opt.value)}
                                    className="w-full rounded-md border px-3 py-2 text-left hover:bg-slate-50"
                                >
                                    <div className="text-[12px] font-semibold text-slate-700">
                                        {opt.label}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        {opt.templateText}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center text-[11px] text-slate-500">
                                No templates available.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* MAIN GRID (UNCHANGED UI) */}
            <div
                className={[
                    "grid grid-cols-1 gap-2",
                    stacked ? "" : "md:grid-cols-12",
                ].join(" ")}
            >
                {/* 🔥 DYNAMIC SECTIONS (UI SAME) */}
                {sections.map((sec, index) => (
                    <div
                        key={index}
                        className={[
                            "flex h-full flex-col rounded-md border border-slate-200 bg-white p-1.5 shadow-sm",
                            stacked ? "" : "md:col-span-4",
                        ].join(" ")}
                    >
                        <div className="flex h-full flex-col gap-1">
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <h2 className="text-[12px] font-bold text-slate-700">
                                    {sec.title}
                                </h2>

                                {sec.hasTemplate && !readOnly && (
                                    <button
                                        type="button"
                                        className="text-[11px] text-blue-600 underline"
                                        onClick={() => {
                                            setActiveSectionIndex(index);
                                            setIsTemplateModalOpen(true);
                                        }}
                                    >
                                        Apply template
                                    </button>
                                )}
                            </div>

                            <textarea
                                ref={(el) => {
                                    textareaRefs.current[index] = el;

                                    // ✅ attach external ref if provided
                                    if (sec.ref) {
                                        if (typeof sec.ref === "function") {
                                            sec.ref(el);
                                        } else {
                                            sec.ref.current = el;
                                        }
                                    }
                                }}
                                readOnly={readOnly || sec.readOnly}
                                value={sec.value || ""}
                                onChange={(e) => sec.onChange(e.target.value)}
                                onKeyDown={(e) => {
                                    // ✅ Ctrl + Enter → move to next section
                                    if (e.ctrlKey && e.key === "Enter") {
                                        e.preventDefault();

                                        const nextIndex = index + 1;

                                        if (textareaRefs.current[nextIndex]) {
                                            textareaRefs.current[nextIndex].focus();
                                        }
                                    }
                                }}
                                placeholder={sec.placeholder}
                                className="min-h-[2.5rem] flex-1 w-full overflow-auto focus:outline-none rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                            />
                        </div>
                    </div>
                ))}

                {/* SUMMARY (UNCHANGED) */}
                <div
                    className={[
                        "grid grid-cols-1 gap-2",
                        stacked ? "" : "md:col-span-4",
                        stacked
                            ? ""
                            : hasLeftSummaryContent && hasRightSummaryContent
                                ? "md:grid-cols-2"
                                : "md:grid-cols-1",
                    ].join(" ")}
                >
                    {hasLeftSummaryContent && (
                        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
                            {hasSummaryTitle && (
                                <h2 className="mb-1 text-[12px] font-bold text-slate-700">
                                    {hasSummaryTitle}
                                </h2>
                            )}
                            {leftSummaryRows.map((row) => (
                                <div key={row.key} className="flex justify-between text-[12px]">
                                    <span>{row.label}</span>
                                    <span>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasRightSummaryContent && (
                        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
                            {rightSummaryRows.map((row) => (
                                <div key={row.key} className="flex justify-between text-[12px]">
                                    <span>{row.label}</span>
                                    <span>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReusableFormFooter;