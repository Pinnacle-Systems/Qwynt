// components/Reuseable/TransactionLayout.jsx
import { useRef, useState, useEffect, useCallback } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

// ── Hook: exported so forms can use it standalone if needed ──────────────
export function useAdaptiveLayout(headerRef, footerRef, containerRef, gap = 8) {
  const [itemsHeight, setItemsHeight] = useState(120);
  const [containerHeight, setContainerHeight] = useState(null);

  const recalculateContainerHeight = useCallback(() => {
    const top = containerRef.current?.getBoundingClientRect?.().top ?? 0;
    const viewportHeight = window.innerHeight;
    const availableHeight = Math.max(viewportHeight - top - gap, 320);
    setContainerHeight(availableHeight);
  }, [containerRef, gap]);

  const recalculate = useCallback(() => {
    const headerH = headerRef.current?.offsetHeight ?? 0;
    const footerH = footerRef.current?.offsetHeight ?? 0;
    const containerH =
      containerRef.current?.offsetHeight ??
      containerHeight ??
      window.innerHeight;
    const remaining = containerH - headerH - footerH - gap;
    setItemsHeight(Math.max(remaining, 120));
  }, [headerRef, footerRef, containerRef, gap, containerHeight]);

  useEffect(() => {
    const t = setTimeout(() => {
      recalculateContainerHeight();
      recalculate();
    }, 200);
    const handleResize = () => {
      recalculateContainerHeight();
      recalculate();
    };
    window.addEventListener("resize", handleResize);
    const ro = new ResizeObserver(() => {
      recalculateContainerHeight();
      recalculate();
    });
    if (containerRef.current) ro.observe(containerRef.current);
    if (headerRef.current) ro.observe(headerRef.current);
    if (footerRef.current) ro.observe(footerRef.current);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
  }, [
    recalculate,
    recalculateContainerHeight,
    headerRef,
    footerRef,
    containerRef,
  ]);

  return { itemsHeight, containerHeight };
}

// ── Component ────────────────────────────────────────────────────────────
// Props:
//   title       string          — e.g. "Purchase Order"
//   badge       JSX             — e.g. <ModeChip id={id} readOnly={readOnly} />
//   closeIcon   JSX             — e.g. <IoArrowBackCircleSharp className="w-7 h-7" />
//   onClose     function
//   onKeyDown   function        — for Ctrl+S etc.
//   header      JSX             — the 4-col (or N-col) cards grid
//   gridItems   JSX             — the items table / PoItems / InwardItems
//   footer      JSX             — terms + remarks + totals + buttons
// ────────────────────────────────────────────────────────────────────────
export const TransactionScreen = ({
  title,
  badge,
  versionDropdown,
  closeIcon,
  onClose,
  onKeyDown,
  header,
  gridItems,
  footer,
  sidebarFooter,
  detailsLayout = "default",
  detailsLayouts = [],
  detailsContent,
  detailsSummary,
  detailsTitle = "Details",
  defaultDetailsCollapsed = false,
  sidebarDetailsSections = [],
  sidebarWidthClass = "w-[320px]",
  sidebarFooterTitle = "Summary",
  defaultSidebarSectionsCollapsed = true,
}) => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const supportedDetailsLayouts =
    detailsLayouts.length > 0 ? detailsLayouts : [detailsLayout];
  const [activeDetailsLayout, setActiveDetailsLayout] = useState(detailsLayout);
  const [detailsCollapsed, setDetailsCollapsed] = useState(
    defaultDetailsCollapsed,
  );
  const [collapsedSidebarSections, setCollapsedSidebarSections] = useState({});

  useEffect(() => {
    setActiveDetailsLayout(detailsLayout);
  }, [detailsLayout]);

  useEffect(() => {
    setDetailsCollapsed(defaultDetailsCollapsed);
  }, [defaultDetailsCollapsed]);

  const hasDetailsContent = Boolean(detailsContent ?? header);
  const effectiveDetailsContent = detailsContent ?? header;
  const showSidebarLayout =
    hasDetailsContent && activeDetailsLayout === "sidebar";
  const showCompactLayout =
    hasDetailsContent && activeDetailsLayout === "compact";
  const showDefaultHeader =
    !hasDetailsContent || activeDetailsLayout === "default";
  const hasSidebarSections = sidebarDetailsSections.length > 0;
  const summaryContent = Array.isArray(detailsSummary)
    ? detailsSummary.filter(Boolean).map((item, index) => (
      <span key={index}>
        {index > 0 ? " | " : ""}
        {item}
      </span>
    ))
    : detailsSummary;

  useEffect(() => {
    if (!hasSidebarSections) return;

    setCollapsedSidebarSections(
      sidebarDetailsSections.reduce((acc, section, index) => {
        const key = section.id || section.title || `section-${index}`;
        acc[key] = defaultSidebarSectionsCollapsed;
        return acc;
      }, {}),
    );
  }, [sidebarDetailsSections, hasSidebarSections, defaultSidebarSectionsCollapsed]);
  const { itemsHeight, containerHeight } = useAdaptiveLayout(
    headerRef,
    footerRef,
    containerRef,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeDetailsLayout, detailsCollapsed]);

  const renderDetailsLayoutSwitch = () => {
    if (supportedDetailsLayouts.length < 2) return null;

    return (
      <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
        {supportedDetailsLayouts.map((layoutOption) => {
          const label =
            layoutOption === "compact"
              ? "Compact"
              : layoutOption === "sidebar"
                ? "Sidebar"
                : "Default";
          const isActive = activeDetailsLayout === layoutOption;

          return (
            <button
              key={layoutOption}
              type="button"
              onClick={() => setActiveDetailsLayout(layoutOption)}
              className={`rounded px-2 py-1 text-[11px] font-medium transition ${isActive
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-white"
                }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  const renderCompactDetails = () => {
    if (!showCompactLayout) return null;

    return (
      <div className="pt-2">
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setDetailsCollapsed((prev) => !prev)}
            className="relative flex w-full items-center gap-3 px-3 py-2 pr-10 text-left"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {detailsTitle}
              </div>
              {detailsCollapsed && (
                <div className="truncate text-[11px] text-slate-700">
                  {summaryContent || "No summary available"}
                </div>
              )}
            </div>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {detailsCollapsed ? (
                <FiChevronDown className="h-4 w-4" />
              ) : (
                <FiChevronUp className="h-4 w-4" />
              )}
            </span>
          </button>
          {!detailsCollapsed && (
            <div className="px-2 py-2">
              {effectiveDetailsContent}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSidebarPanel = () => {
    if (!showSidebarLayout) return null;
    const effectiveSidebarFooter = sidebarFooter ?? footer;

    const renderSidebarSectionSummary = (summary) => {
      if (Array.isArray(summary)) {
        return summary.filter(Boolean).map((item, index) => (
          <span key={index}>
            {index > 0 ? " | " : ""}
            {item}
          </span>
        ));
      }

      return summary;
    };

    const renderSidebarDetails = () => {
      if (!hasSidebarSections) {
        return effectiveDetailsContent;
      }

      return (
        <div className="space-y-2">
          {sidebarDetailsSections.map((section, index) => {
            const key = section.id || section.title || `section-${index}`;
            const isCollapsed = collapsedSidebarSections[key];

            return (
              <div
                key={key}
                className="overflow-hidden rounded-md border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCollapsedSidebarSections((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                  className="relative flex w-full items-start gap-3 px-3 py-2 pr-10 text-left"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-slate-700">
                      {section.title}
                    </div>
                    {isCollapsed && section.summary && (
                      <div className="mt-0.5 text-[11px] leading-5 text-slate-500">
                        {renderSidebarSectionSummary(section.summary)}
                      </div>
                    )}
                  </div>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {isCollapsed ? (
                      <FiChevronDown className="h-4 w-4" />
                    ) : (
                      <FiChevronUp className="h-4 w-4" />
                    )}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="border-t border-slate-200 px-3 py-2">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <aside
        className={`hidden min-h-0 flex-none self-stretch overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm xl:flex xl:flex-col ${sidebarWidthClass}`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 basis-1/2 flex-col border-b border-slate-200">
            <div className="border-b border-slate-100 px-3 py-2">
              <div className="text-sm font-semibold text-slate-800">
                {detailsTitle}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {renderSidebarDetails()}
            </div>
          </div>

          <div className="flex min-h-0 basis-1/2 flex-col bg-slate-50/40">
            <div className="border-b border-slate-100 px-3 py-2">
              <div className="text-sm font-semibold text-slate-800">
                {sidebarFooterTitle}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {effectiveSidebarFooter}
            </div>
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full overflow-hidden min-h-0"
      style={{ height: containerHeight ? `${containerHeight}px` : "100%" }}
      onKeyDown={onKeyDown}
    >
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* ── HEADER: title bar + cards grid ─────────────────────── */}
          <div ref={headerRef} className="flex-none">
            {/* Title bar — identical to old UI */}
            <div className="w-full mx-auto rounded-md shadow-lg px-2 py-1">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {title}
                  {badge}
                  {versionDropdown}
                </h1>
                <div className="flex items-center gap-2">
                  {renderDetailsLayoutSwitch()}
                  <button
                    onClick={onClose}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Back to Report"
                  >
                    {closeIcon}
                  </button>
                </div>
              </div>
            </div>

            {showDefaultHeader && (
              <div className="pt-2">{effectiveDetailsContent}</div>
            )}

            {renderCompactDetails()}
          </div>

          {/* ── ITEMS: adaptive height, scrolls internally ──────────── */}
          <div
            className="flex-1 py-2 min-h-0 overflow-hidden"
            style={{ height: itemsHeight, minHeight: 0 }}
          >
            <fieldset className="h-full min-h-0 overflow-hidden">
              {gridItems}
            </fieldset>
          </div>

          {/* ── FOOTER: terms + totals + buttons ────────────────────── */}
          {!showSidebarLayout && (
            <div ref={footerRef} className="flex-none">
              {footer}
            </div>
          )}
        </div>

        {renderSidebarPanel()}
      </div>
    </div>
  );
};

const TransactionLayout = TransactionScreen;

export default TransactionLayout;
