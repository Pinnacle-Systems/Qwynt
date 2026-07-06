import React, { useState } from "react";
import Modal from "../../../UiComponents/Modal";

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
  const leftColumnTokens = [
    "qty",
    "quantity",
    "payment",
    "advance",
    "received",
    "minimum",
  ];

  return leftColumnTokens.some((token) => identity.includes(token))
    ? "left"
    : "right";
};

const CommonFormFooter = ({
  remarks,
  setRemarks,
  terms,
  setTerms,
  totalQty,
  subtotal,
  taxAmount,
  netAmount,
  readOnly = false,
  showTermSelect = false,
  termValue = "",
  onTermChange = () => { },
  termOptions = [],
  totalsRows,
  extraTotalsContent = null,
  extraTotalsContentColumn = "left",
  leftActions = null,
  rightActions = null,
  remarksPlaceholder = "Additional notes...",
  termsPlaceholder = "Select or type Terms & Conditions...",
  stacked = false,
  hasSummaryTitle = false,
  remarksReadOnly = null,
  termsRef = null,
}) => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const termsTextareaRef = React.useRef(null);
  const templateOptionsRefs = React.useRef([]);
  const [showTermsHint, setShowTermsHint] = useState(false);

  const resolvedTotalsRows =
    totalsRows && totalsRows.length > 0
      ? totalsRows
      : defaultTotalsRows({ totalQty, subtotal, taxAmount, netAmount });

  const leftSummaryRows = resolvedTotalsRows.filter(
    (row) => resolveSummaryColumn(row) === "left",
  );
  const rightSummaryRows = resolvedTotalsRows.filter(
    (row) => resolveSummaryColumn(row) === "right",
  );
  const hasLeftSummaryContent =
    leftSummaryRows.length > 0 ||
    (extraTotalsContent && extraTotalsContentColumn === "left");
  const hasRightSummaryContent =
    rightSummaryRows.length > 0 ||
    (extraTotalsContent && extraTotalsContentColumn === "right");

  const showTemplateControl = showTermSelect && !readOnly;

  const handleTemplateSelection = (value) => {
    const normalizedValue = value ? String(value) : "";

    if (!normalizedValue) {
      onTermChange("");
      return false;
    }

    const selectedOption = termOptions.find(
      (option) => String(option.value) === normalizedValue,
    );

    if (!selectedOption) {
      onTermChange("");
      return false;
    }

    const nextTermsText = selectedOption.templateText || "";
    const hasExistingTerms = Boolean((terms || "").trim());
    const shouldReplace =
      !hasExistingTerms ||
      (terms || "") === nextTermsText ||
      window.confirm("Replace current terms with the selected template?");

    if (!shouldReplace) {
      return false;
    }

    setTerms(nextTermsText);
    onTermChange(normalizedValue, selectedOption);
    setTimeout(() => termsTextareaRef.current?.focus(), 100);
    return true;
  };

  React.useEffect(() => {
    if (isTemplateModalOpen) {
      const initialIndex = termOptions.findIndex(
        (option) => String(option.value) === String(termValue || ""),
      );
      const indexToSet = initialIndex >= 0 ? initialIndex : 0;
      setActiveIndex(indexToSet);

      const timer = setTimeout(() => {
        if (templateOptionsRefs.current[indexToSet]) {
          templateOptionsRefs.current[indexToSet].focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTemplateModalOpen, termOptions, termValue]);

  React.useEffect(() => {
    if (isTemplateModalOpen && templateOptionsRefs.current[activeIndex]) {
      templateOptionsRefs.current[activeIndex].focus();
    }
  }, [activeIndex, isTemplateModalOpen]);

  const renderSummaryRows = (rows) =>
    rows.map((row, index) => (
      <div
        key={row.key || row.label || index}
        className={[
          "flex items-center justify-between gap-2 py-0.5 text-[12px]",
          row.emphasized ? "border-t border-slate-100 " : "",
          row.className || "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "shrink-0",
            row.emphasized ? "font-semibold text-slate-800" : "text-slate-800",
            row.labelClassName || "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {row.label}
        </span>
        {row.renderValue ? (
          <div
            className={["flex items-center", row.valueContainerClassName || ""]
              .filter(Boolean)
              .join(" ")}
          >
            {row.renderValue()}
          </div>
        ) : (
          <span
            className={[
              row.emphasized ? "font-semibold text-indigo-700" : "font-medium",
              row.valueClassName || "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {row.value}
          </span>
        )}
      </div>
    ));

  return (
    <div className="space-y-1.5">
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        widthClass="w-[420px] max-h-[70vh]"
      >
        <div className="flex max-h-[calc(70vh-3.5rem)] flex-col">
          <div className="mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">
              Apply Terms Template
            </h3>
            <p className="text-[11px] text-slate-500">
              Choose a template to fill the terms text below.
            </p>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {termOptions.length > 0 ? (
              termOptions.map((option, index) => {
                const isSelected =
                  String(option.value) === String(termValue || "");
                const isActive = index === activeIndex;

                return (
                  <button
                    ref={(el) => (templateOptionsRefs.current[index] = el)}
                    key={option.value}
                    type="button"
                    onKeyDown={(e) => {
                      if (termOptions.length === 0) return;

                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveIndex((prev) =>
                          prev < termOptions.length - 1 ? prev + 1 : 0,
                        );
                      }

                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveIndex((prev) =>
                          prev > 0 ? prev - 1 : termOptions.length - 1,
                        );
                      }

                      if (e.key === "Enter") {
                        e.preventDefault();
                        const selectedOption = termOptions[activeIndex];
                        if (handleTemplateSelection(selectedOption.value)) {
                          setIsTemplateModalOpen(false);
                        }
                      }
                    }}
                    onClick={() => {
                      if (handleTemplateSelection(option.value)) {
                        setIsTemplateModalOpen(false);
                      }
                    }}
                    className={[
                      "w-full rounded-md border px-3 py-2 text-left transition-colors outline-none",
                      isActive
                        ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200 shadow-sm"
                        : isSelected
                          ? "bg-white"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-semibold text-slate-700">
                        {option.label}
                      </div>
                      {isSelected ? (
                        <span className="text-[11px] font-bold text-indigo-600">
                          SELECTED
                        </span>
                      ) : null}
                    </div>
                    {option.templateText ? (
                      <div className="mt-1 max-h-8 overflow-hidden text-[11px] leading-4 text-slate-500">
                        {option.templateText}
                      </div>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-500">
                No templates available.
              </div>
            )}
          </div>
        </div>
      </Modal>

      <div
        className={[
          "grid grid-cols-1 gap-2",
          stacked ? "" : "md:grid-cols-12",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            "flex h-full flex-col rounded-md border border-slate-200 bg-white p-1.5 shadow-sm",
            stacked ? "" : "md:col-span-4",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex h-full flex-col gap-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="text-[12px] font-bold text-slate-700">
                Terms & Conditions
              </h2>
              {showTermsHint && (
                <div className="text-[10px] text-indigo-600 font-medium mb-1">
                  ⌨️ Use <span className="font-semibold">Ctrl + Enter</span> to move next
                </div>
              )}
              {showTemplateControl ? (
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
                  onClick={() => setIsTemplateModalOpen(true)}
                >
                  Apply template
                </button>
              ) : null}
            </div>


            <textarea
              ref={(el) => {
                termsTextareaRef.current = el;

                // ✅ attach external ref
                if (termsRef) {
                  if (typeof termsRef === "function") {
                    termsRef(el);
                  } else {
                    termsRef.current = el;
                  }
                }
              }}
              readOnly={readOnly}
              className="min-h-[2.5rem] flex-1 w-full overflow-auto focus:outline-none rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              value={terms || ""}
              onChange={(e) => setTerms(e.target.value)}
              placeholder={termsPlaceholder}
              onFocus={() => setShowTermsHint(true)}
              onBlur={() => setShowTermsHint(false)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") {
                  e.preventDefault();

                  const textarea = e.target; // ✅ correct
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;

                  const newValue =
                    (terms || "").substring(0, start) +
                    "\n" +
                    (terms || "").substring(end);

                  setTerms(newValue);

                  requestAnimationFrame(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + 1, start + 1);
                  });
                }
              }}
            />
          </div>
        </div>

        <div
          className={[
            "flex h-full flex-col rounded-md border border-slate-200 bg-white p-1.5 shadow-sm",
            stacked ? "" : "md:col-span-4",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <h2 className="mb-1 text-[12px] font-bold text-slate-700">Remarks</h2>
          <textarea
            readOnly={remarksReadOnly !== null ? remarksReadOnly : readOnly}
            value={remarks || ""}
            onChange={(e) => setRemarks(e.target.value)}
            className="min-h-[2.5rem] focus:outline-none flex-1 w-full overflow-auto rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
            placeholder={remarksPlaceholder}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();

                const textarea = e.target; // ✅ DOM element
                const value = textarea.value; // ✅ string value

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;

                const newValue =
                  value.substring(0, start) +
                  "\n" +
                  value.substring(end);

                setRemarks(newValue);

                requestAnimationFrame(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 1, start + 1);
                });
              }
            }}
          />
        </div>

        <div
          className={[
            "grid grid-cols-1 gap-2",
            stacked ? "" : "md:col-span-4",
            stacked
              ? ""
              : hasLeftSummaryContent && hasRightSummaryContent
                ? "md:grid-cols-2"
                : "md:grid-cols-1",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {hasLeftSummaryContent ? (
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              {hasSummaryTitle && <h2 className="mb-1 text-[12px] font-bold text-slate-700">{hasSummaryTitle}</h2>}
              {renderSummaryRows(leftSummaryRows)}
              {extraTotalsContent && extraTotalsContentColumn === "left" ? (
                <div className="pt-0.5">{extraTotalsContent}</div>
              ) : null}
            </div>
          ) : null}
          {hasRightSummaryContent ? (
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              {renderSummaryRows(rightSummaryRows)}
              {extraTotalsContent && extraTotalsContentColumn === "right" ? (
                <div className="pt-0.5">{extraTotalsContent}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {leftActions || rightActions ? (
        <div className="mt-0.5 flex flex-col justify-between gap-1.5 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">{leftActions}</div>
          <div className="flex flex-wrap gap-2">{rightActions}</div>
        </div>
      ) : null}
    </div>
  );
};

export default CommonFormFooter;
