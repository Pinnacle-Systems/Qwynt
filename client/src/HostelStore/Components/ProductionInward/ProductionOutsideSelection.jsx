import {
  findFromList,
  getDateFromDateTimeToDisplay,
} from "../../../Utils/helper";

const EMPTY_ROW = {
  processId: "",
  outwardDetailId: "",
  receivedQty: "",
  wastageQty: "",
  acceptedQty: "",
  jobCardId: "",
  productionOutwardId: "",
};

// ─── Selection helpers ─────────────────────────────────────────────────────────

function buildInwardRow(outwardDtl) {
  return {
    ...EMPTY_ROW,
    outwardDetailId: outwardDtl.id,
    productionOutwardId: outwardDtl.productionOutwardId,
    jobCardId: outwardDtl?.ProductionOutward?.JobCard?.id ?? "",
    processes: outwardDtl.processes ?? "",
    sentQty: outwardDtl?.sentQty ?? "",
    alreadyReceivedQty: outwardDtl?.alreadyReceivedQty ?? "",
    pendingQty: outwardDtl?.pendingQty ?? "",
    acceptedQty: outwardDtl?.sentQty ?? "",
    // carry display info so the grid can show process name without refetch
    _processName: outwardDtl.Process?.name ?? "",
    _sentQty: outwardDtl.sentQty ?? "",
  };
}

function isSelected(inwardDetails, outwardDtlId) {
  return inwardDetails.some(
    (r) => parseInt(r.outwardDetailId) === parseInt(outwardDtlId),
  );
}

function addRow(setInwardDetails, outwardDtl) {
  setInwardDetails((prev) => {
    const already = prev.some(
      (r) => parseInt(r.outwardDetailId) === parseInt(outwardDtl.id),
    );
    if (already) return prev;

    const rows = structuredClone(prev);
    const newRow = buildInwardRow(outwardDtl);
    const emptyIdx = rows.findIndex((r) => !r.outwardDetailId && !r.processId);

    if (emptyIdx !== -1) {
      rows[emptyIdx] = newRow;
    } else {
      rows.push(newRow);
    }
    return rows;
  });
}

function removeRow(setInwardDetails, outwardDtlId) {
  setInwardDetails((prev) => {
    const updated = prev.filter(
      (r) => parseInt(r.outwardDetailId) !== parseInt(outwardDtlId),
    );
    // keep at least 5 empty rows
    while (updated.length < 5) updated.push({ ...EMPTY_ROW });
    return updated;
  });
}

function toggleRow(inwardDetails, setInwardDetails, outwardDtl) {
  if (isSelected(inwardDetails, outwardDtl.id)) {
    removeRow(setInwardDetails, outwardDtl.id);
  } else {
    addRow(setInwardDetails, outwardDtl);
  }
}

function isGroupAllSelected(inwardDetails, groupRows) {
  return (
    groupRows.length > 0 &&
    groupRows.every((r) => isSelected(inwardDetails, r.id))
  );
}

function toggleGroup(inwardDetails, setInwardDetails, groupRows, select) {
  groupRows.forEach((row) => {
    if (select) {
      addRow(setInwardDetails, row);
    } else {
      removeRow(setInwardDetails, row.id);
    }
  });
}

function isAllSelected(inwardDetails, tempItems) {
  return (
    tempItems.length > 0 &&
    tempItems.every((r) => isSelected(inwardDetails, r.id))
  );
}

function toggleAll(inwardDetails, setInwardDetails, tempItems, select) {
  tempItems.forEach((row) => {
    if (select) {
      addRow(setInwardDetails, row);
    } else {
      removeRow(setInwardDetails, row.id);
    }
  });
}

// ─── Group tempItems by productionOutwardId ────────────────────────────────────

function groupByOutward(tempItems) {
  const map = new Map();
  for (const item of tempItems) {
    const outwardId = item.ProductionOutward?.id;
    if (!map.has(outwardId)) {
      map.set(outwardId, {
        outward: item.ProductionOutward,
        rows: [],
      });
    }
    map.get(outwardId).rows.push(item);
  }
  return Array.from(map.values());
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ProductionOutwardSelection = ({
  inwardDetails = [],
  setInwardDetails,
  tempItems = [],
  onClose,
  searchDocId,
  setSearchDocId,
  searchDocDate,
  setSearchDocDate,
  searchJobCard,
  setSearchJobCard,
  processList = [],
}) => {
  const groups = groupByOutward(tempItems);
  const allSelected = isAllSelected(inwardDetails, tempItems);

  return (
    <div className="h-full flex flex-col bg-[#f1f1f0]">
      {/* ── Header ── */}
      <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
          Production Outward Items
        </h2>
        <button
          type="button"
          onClick={() => {
            onClose();
            setTimeout(() => {
              const first = document.querySelector("#receivedQty-input-0");
              first?.focus();
              first?.select();
            }, 100);
          }}
          className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600
                               border border-green-600 flex items-center gap-1 text-xs"
        >
          Done
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-3 overflow-auto">
        <div className="bg-white p-3 rounded-md border border-gray-200">
          <div className="relative w-full max-h-[480px] overflow-y-auto">
            <table className="w-full text-xs border border-gray-200">
              <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                <tr>
                  {/* Select-all checkbox */}
                  <th className="px-1 py-1 w-8 border border-gray-300 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-medium mb-0.5">
                        All
                      </span>
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={allSelected}
                        onChange={(e) =>
                          toggleAll(
                            inwardDetails,
                            setInwardDetails,
                            tempItems,
                            e.target.checked,
                          )
                        }
                      />
                    </div>
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-center text-xs w-10">
                    S No
                  </th>

                  {/* Outward No with search */}
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs w-24">
                    <div>Process Issue No</div>
                    <input
                      type="text"
                      className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchDocId}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setSearchDocId(e.target.value)}
                    />
                  </th>

                  {/* Outward Date with search */}
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs w-24">
                    <div>Process Issue Date</div>
                    <input
                      type="text"
                      className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchDocDate}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setSearchDocDate(e.target.value)}
                    />
                  </th>

                  {/* Job Card with search */}
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs w-24">
                    <div>Job Card</div>
                    <input
                      type="text"
                      className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchJobCard}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setSearchJobCard(e.target.value)}
                    />
                  </th>

                  <th className="px-1 py-1 border border-gray-300 text-center text-xs w-40">
                    Process
                  </th>
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs w-20">
                    Sent Qty
                  </th>
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs w-20">
                    Already Received Qty
                  </th>
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs w-20">
                    Wastage Qty
                  </th>
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs w-20">
                    Pending Qty
                  </th>
                </tr>
              </thead>

              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 text-center text-gray-400 text-sm"
                    >
                      No Issue records found
                    </td>
                  </tr>
                ) : (
                  groups.map(({ outward, rows }, groupIdx) => {
                    const groupAllSelected = isGroupAllSelected(
                      inwardDetails,
                      rows,
                    );
                    return (
                      <>
                        {/* ── Detail rows (one per OutwardDtl / process) ── */}
                        {rows.map((row, rowIdx) => {
                          const selected = isSelected(inwardDetails, row.id);
                          const globalIdx =
                            groups
                              .slice(0, groupIdx)
                              .reduce((acc, g) => acc + g.rows.length, 0) +
                            rowIdx;

                          return (
                            <tr
                              key={`dtl-${row.id}`}
                              className={`cursor-pointer border-b border-gray-200 transition-colors text-[11px] ${
                                selected
                                  ? "bg-blue-50 hover:bg-blue-100"
                                  : rowIdx % 2 === 0
                                    ? "bg-white hover:bg-gray-50"
                                    : "bg-gray-50 hover:bg-gray-100"
                              }`}
                              onClick={() =>
                                toggleRow(inwardDetails, setInwardDetails, row)
                              }
                            >
                              {/* Row checkbox */}
                              <td
                                className="text-center border border-gray-300 py-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  className="cursor-pointer"
                                  checked={selected}
                                  onChange={() =>
                                    toggleRow(
                                      inwardDetails,
                                      setInwardDetails,
                                      row,
                                    )
                                  }
                                />
                              </td>
                              <td className="text-center border border-gray-300 px-1">
                                {globalIdx + 1}
                              </td>
                              {/* Outward / Date / JobCard repeated per row for easy scanning */}
                              <td className="border border-gray-300 px-2 py-1 text-center">
                                {outward?.docId}
                              </td>
                              <td className="border border-gray-300 px-2 py-1 text-left">
                                {getDateFromDateTimeToDisplay(outward?.docDate)}
                              </td>
                              <td className="border border-gray-300 px-2 py-1 text-center">
                                {outward?.JobCard?.docId}
                              </td>
                              <td className="border border-gray-300 px-2 py-1">
                                {/* {row.Process?.name ?? "—"} */}
                                {row.processes
                                  ?.map((id) =>
                                    findFromList(id, processList?.data, "name"),
                                  )
                                  .filter(Boolean)
                                  .join(" + ")}
                              </td>
                              <td className="border border-gray-300 px-2 py-1 text-right">
                                {row.sentQty != null
                                  ? parseFloat(row.sentQty).toFixed(2)
                                  : "—"}
                              </td>
                              <td className="border border-gray-300 px-2 py-1 text-right">
                                {row.alreadyReceivedQty != null
                                  ? parseFloat(row.alreadyReceivedQty).toFixed(
                                      2,
                                    )
                                  : "—"}
                              </td>
                              <td className="border border-gray-300 px-2 py-1 text-right">
                                {row.wastageQty != null
                                  ? parseFloat(row.wastageQty).toFixed(2)
                                  : "—"}
                              </td>
                              <td className="border border-gray-300 px-2 py-1 text-right">
                                {row.pendingQty != null
                                  ? parseFloat(row.pendingQty).toFixed(2)
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionOutwardSelection;
