import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// Key helpers
// ─────────────────────────────────────────────────────────────
const makeKey = (type, id, sub = "") => `${type}:${id}${sub ? `:${sub}` : ""}`;

const parseKey = (key) => {
  const [type, id, sub] = key.split(":");
  return { type, id: Number(id), sub: sub || "" };
};

// ─────────────────────────────────────────────────────────────
// Build desired keys from current form selections
// ─────────────────────────────────────────────────────────────
const buildDesiredKeys = (
  boardItems = [],
  boardList,
  otherBoardId = "",
  selectedPrinting,
  printingList,
  selectedProcesses,
  defaultList,
  laminations,
  laminationList,
  varnishes,
  varnishList,
  selectedFinishing,
  labelPrintingList,
  finishingList,
  selectedLabelPrinting,
) => {
  const keys = [];

  boardList.forEach((p) => {
    if (boardItems.includes(p.id)) {
      keys.push(makeKey("boardQuality", p.id));
    }
  });

  if (otherBoardId) {
    keys.push(makeKey("board", otherBoardId));
  }

  printingList.forEach((p) => {
    if (selectedPrinting.includes(p.id)) keys.push(makeKey("printing", p.id));
  });

  defaultList.forEach((p) => {
    if (selectedProcesses.includes(p.id)) keys.push(makeKey("process", p.id));
  });

  laminationList.forEach((p) => {
    const e = laminations.find((l) => l.processId === p.id);
    if (!e) return;
    const sub = e.isFrontAndBack ? "frontback" : e.isFront ? "front" : "";
    keys.push(makeKey("lamination", p.id, sub));
  });

  varnishList.forEach((p) => {
    const e = varnishes.find((v) => v.processId === p.id);
    if (!e) return;
    const sub = e.isFrontAndBack ? "frontback" : e.isFront ? "front" : "";
    keys.push(makeKey("varnish", p.id, sub));
  });

  labelPrintingList.forEach((p) => {
    if (selectedLabelPrinting.includes(p.id))
      keys.push(makeKey("labelPrinting", p.id));
  });

  finishingList.forEach((p) => {
    if (selectedFinishing.includes(p.id)) keys.push(makeKey("finishing", p.id));
  });

  return keys;
};

// ─────────────────────────────────────────────────────────────
// Resolve display label
// ─────────────────────────────────────────────────────────────
const resolveLabel = (
  key,
  defaultList,
  laminationList,
  varnishList,
  boardList = [],
  printingList = [],
  labelPrintingList = [],
  finishingList = [],
) => {
  const { type, id, sub } = parseKey(key);
  const find = (list) => list.find((p) => p.id === id)?.name || `#${id}`;

  let name = "";
  if (type === "boardQuality") name = find(boardList);
  else if (type === "board") name = find(boardList);
  else if (type === "printing") name = find(printingList);
  else if (type === "process") name = find(defaultList);
  else if (type === "lamination") name = find(laminationList);
  else if (type === "varnish") name = find(varnishList);
  else if (type === "labelPrinting") name = find(labelPrintingList);
  else if (type === "finishing") name = find(finishingList);
  if (sub === "front") return `${name} (Front)`;
  if (sub === "frontback") return `${name} (F & B)`;
  return name;
};

// ─────────────────────────────────────────────────────────────
// Derive a key-string → status map from DB processRoute array
// singleData.data.processRoute has { type, processId, status, isFront, isFrontAndBack }
// ─────────────────────────────────────────────────────────────
export const buildStatusMap = (dbProcessRoute = []) => {
  const map = {};
  dbProcessRoute.forEach((r) => {
    const sub = r.isFront ? "front" : r.isFrontAndBack ? "frontback" : "";
    const key = makeKey(r.type, r.processId, sub);
    map[key] = r.status; // "COMPLETED" | "PENDING" | "NOT_STARTED"
  });
  return map;
};

/**
 * Returns a Set of { type, processId } pairs whose status === "COMPLETED".
 * Used by JobCardForm to disable fields for completed route steps.
 */
export const buildCompletedSet = (dbProcessRoute = []) => {
  const set = new Set();
  dbProcessRoute.forEach((r) => {
    if (r.status === "COMPLETED") {
      // Store as "type:processId" so callers can check membership
      set.add(`${r.type}:${r.processId}`);
    }
  });
  return set;
};

// ─────────────────────────────────────────────────────────────
// ProcessRoutePanel
// ─────────────────────────────────────────────────────────────
export const ProcessRoutePanel = ({
  boardItems = [],
  boardList = [],
  otherBoardId = "",
  selectedPrinting = [],
  printingList = [],
  selectedProcesses = [],
  defaultList = [],
  laminations = [],
  laminationList = [],
  varnishes = [],
  varnishList = [],
  processRoute = [],
  selectedFinishing = [],
  selectedLabelPrinting = [],
  labelPrintingList = [],
  finishingList = [],
  setProcessRoute,
  readOnly = false,
  isAmendment,
  setIsAmendment,
  // NEW: pass singleData?.data?.processRoute (the raw DB array) so we can
  // look up live statuses without changing the string-key structure.
  dbProcessRoute = [],
}) => {
  // Build a key → status lookup from the DB route
  const statusMap = buildStatusMap(dbProcessRoute);

  const anyCompleted = dbProcessRoute.some((r) => r.status === "COMPLETED");

  // ── Auto-sync: mirror form state into route ──────────────────
  useEffect(() => {
    const desired = buildDesiredKeys(
      boardItems,
      boardList,
      otherBoardId,
      selectedPrinting,
      printingList,
      selectedProcesses,
      defaultList,
      laminations,
      laminationList,
      varnishes,
      varnishList,
      selectedFinishing,
      labelPrintingList,
      finishingList,
      selectedLabelPrinting,
    );
    setProcessRoute((prev) => {
      const kept = prev.filter((k) => desired.includes(k));
      const added = desired.filter((k) => !prev.includes(k));
      return [...kept, ...added];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProcesses,
    laminations,
    varnishes,
    otherBoardId,
    boardItems,
    selectedPrinting,
    selectedFinishing,
    selectedLabelPrinting,
  ]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          Process Route
        </h3>

        <div className="flex items-center gap-3">
          {/* ── Task 2: Amendment checkbox shown when any step is completed ── */}
          {anyCompleted && (
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!isAmendment}
                onChange={() => !readOnly && setIsAmendment((prev) => !prev)}
                disabled={readOnly}
                className="w-[13px] h-[13px] min-w-[13px] rounded border border-slate-400 accent-amber-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                IS Amendment
              </span>
            </label>
          )}

          {/* <span className="text-[9px] text-slate-400">
                        {processRoute.length > 0
                            ? `${processRoute.length} step${processRoute.length > 1 ? "s" : ""}`
                            : "No steps"}
                    </span> */}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="p-2 h-12">
        {processRoute.length === 0 ? (
          <p className="text-[10px] text-slate-400 italic py-0.5">
            Select printing, processes, laminations or varnishes to build the
            route.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-center min-w-max py-0.5 gap-0">
              {processRoute.map((key, idx) => {
                const label = resolveLabel(
                  key,
                  defaultList,
                  laminationList,
                  varnishList,
                  boardList,
                  printingList,
                  labelPrintingList,
                  finishingList,
                );
                const isLast = idx === processRoute.length - 1;

                // ── Task 1: look up status for this step ──
                const stepStatus = statusMap[key];
                const isCompleted = stepStatus === "COMPLETED";

                return (
                  <div key={key} className="flex items-center">
                    {/* ── Node ───────────────────────────────── */}
                    <div
                      className={`relative group flex items-center gap-1.5 h-6 pl-2 pr-4 rounded transition-colors
                                                ${
                                                  isCompleted
                                                    ? "border border-green-500 bg-green-50"
                                                    : "border border-slate-400 bg-white hover:border-slate-500"
                                                }`}
                    >
                      {/* Seq number */}
                      <span
                        className={`text-[10px] font-semibold leading-none w-3 text-center shrink-0
                                                    ${isCompleted ? "text-green-700" : "text-slate-700"}`}
                      >
                        {idx + 1}
                      </span>

                      {/* Divider */}
                      <span
                        className={`w-px h-3 shrink-0 ${isCompleted ? "bg-green-200" : "bg-slate-200"}`}
                      />

                      {/* Process name */}
                      <span
                        className={`text-[10px] font-medium whitespace-nowrap leading-none
                                                    ${isCompleted ? "text-green-700" : "text-slate-700"}`}
                      >
                        {label}
                      </span>

                      {/* Completed tick badge */}
                      {isCompleted && (
                        <span
                          className="text-[9px] text-green-600 font-bold leading-none ml-0.5"
                          title="Completed"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Connector */}
                    {!isLast && (
                      <span className="mx-1 text-slate-700 text-[12px] shrink-0 select-none leading-none font-medium">
                        +
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DB serializer
// ─────────────────────────────────────────────────────────────
export const routeKeysToDb = (processRoute) =>
  processRoute.map((key, idx) => {
    const { type, id, sub } = parseKey(key);
    return {
      type,
      processId: id,
      sequence: idx + 1,
      isFront: sub === "front",
      isFrontAndBack: sub === "frontback",
    };
  });
