import React, { useState } from 'react';
import { findFromList } from '../../../Utils/helper';

export const DEFAULT_ROW_COUNT = 5;

export const makeEmptyRow = () => ({
    processId: "",
    sentQty: "",
    receivedQty: 0,
    pendingQty: "",
    sequence: "",
    allocationDetailId: "",
    supplierId: "",
    isDisabled: false,
    prevProcessId: "",   // previous process reference
    availableQty: "",
});

const statusConfig = {
    COMPLETED: {
        bg: "bg-green-100", border: "border-green-500",
        text: "text-green-700", dot: "bg-green-500", label: "Completed",
    },
    NOT_STARTED: {
        bg: "bg-gray-100", border: "border-gray-400",
        text: "text-gray-500", dot: "bg-gray-400", label: "Not Started",
    },
    IN_PROGRESS: {
        bg: "bg-blue-100", border: "border-blue-500",
        text: "text-blue-700", dot: "bg-blue-500", label: "In Progress",
    },
};

const getStatusStyle = (status) => {
    if (!status) return statusConfig.NOT_STARTED;
    return statusConfig[status?.toUpperCase()] || statusConfig.NOT_STARTED;
};

const ProcessRouteBar = ({ processRoute, processList }) => {
    if (!processRoute?.length) return null;
    const sorted = [...processRoute].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

    return (
        <div className="flex items-center gap-1 flex-wrap py-2 px-2">
            {sorted.map((route, idx) => {
                const processName = findFromList(route.processId, processList?.data, "name") || `Process ${route.processId}`;
                const style = getStatusStyle(route.status);
                return (
                    <React.Fragment key={route.id}>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${style.bg} ${style.border} ${style.text}`}
                            title={`Type: ${route.type} | Status: ${style.label}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <span>{route.sequence}. {processName}</span>
                        </div>
                        {idx < sorted.length - 1 && (
                            <span className="text-gray-400 text-[10px]">→</span>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const OutwardDetails = ({
    outwardDetails,
    setOutwardDetails,
    readOnly,
    jobCardList,
    processList,
    id,
    childRecord,
    jobCardId,
    productionAllocationList,
}) => {
    const [contextMenu, setContextMenu] = useState(null);

    const selectedJobCard = jobCardList?.data?.find(jc => jc.id === jobCardId);
    const processRoute = selectedJobCard?.processRoute || [];

    const allocation = productionAllocationList?.data?.find(a => a.jobCardId === jobCardId);
    const allocationDetails = allocation?.allocationDetails || [];
    const hasOutside = allocationDetails.some(d => d.isOutSide);
    const hasEligibleRow = outwardDetails.some(r => r.processId && !r.isDisabled);
    const showWarning = jobCardId && hasOutside && !hasEligibleRow;

    const deleteMainRow = (index) =>
        setOutwardDetails(prev => prev.filter((_, i) => i !== index));

    const handleDeleteAllRows = () =>
        setOutwardDetails(Array.from({ length: DEFAULT_ROW_COUNT }, makeEmptyRow));

    const handleInputChange = (value, index, field) => {
        setOutwardDetails(prev => {
            const rows = [...prev];
            let row = { ...rows[index], [field]: value };
            if (field === "sentQty") {
                const sent = Number(value) || 0;
                const received = Number(row.receivedQty) || 0;
                row.pendingQty = sent - received;
            }
            rows[index] = row;
            return rows;
        });
    };

    const handleRightClick = (e, rowIndex) => {
        if (!outwardDetails[rowIndex]?.processId) return;
        e.preventDefault();
        setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, rowId: rowIndex });
    };

    // Visible row count for S.No (only rows with processId)
    let sNo = 0;

    return (
        <>
            <div className="w-full h-full overflow-y-auto bg-white py-1">

                {/* Process Route Bar */}
                {processRoute.length > 0 ? (
                    <div className="mb-2 rounded-md bg-white shadow-sm border-b border-gray-200">
                        <div className="px-2 pt-1.5">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase pb-0.5 mb-1">
                                Process Route
                            </h2>
                        </div>
                        <ProcessRouteBar processRoute={processRoute} processList={processList} />
                    </div>
                ) : (
                    <div className="text-left px-2 py-2 text-gray-400 text-[11px] italic">
                        Select a Job Card to view Process Route
                    </div>
                )}

                {/* Warning */}
                {showWarning && (
                    <div className="mx-2 mb-2 px-3 py-2 bg-yellow-50 border border-yellow-300 rounded text-yellow-700 text-[11px]">
                        ⚠️ Previous process is not yet <strong>COMPLETED</strong>. Outside process cannot be sent.
                    </div>
                )}

                <table className="table-fixed bg-white border-collapse ">
                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 text-[12px]">
                        <tr>
                            <th className="w-10 px-2 py-2 text-center font-medium border border-gray-300">
                                S.No
                            </th>
                            <th className="w-10 px-2 py-2 text-center font-medium border border-gray-300">
                                Seq
                            </th>
                            <th className="w-44 px-2 py-2 text-center font-medium border border-gray-300">
                                Prev Process
                            </th>
                            <th className="w-44 px-2 py-2 text-center font-medium border border-gray-300">
                                Process <span className="text-red-500">*</span>
                            </th>
                            <th className="w-24 px-2 py-2 text-center font-medium border border-gray-300">
                                Available Qty
                            </th>
                            <th className="w-24 px-2 py-2 text-center font-medium border border-gray-300">
                                Sent Qty <span className="text-red-500">*</span>
                            </th>
                            <th className="w-24 px-2 py-2 text-center font-medium border border-gray-300">
                                Received Qty
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {(outwardDetails || []).map((row, index) => {
                            const isEmpty = !row.processId;
                            if (!isEmpty) sNo++;

                            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";
                            // Change this line in the tbody map:
                            const isSentDisabled = readOnly || childRecord?.current > 0 || isEmpty || row.isDisabled;
                            const prevProcessName = row.prevProcessId
                                ? findFromList(row.prevProcessId, processList?.data, "name") || ""
                                : "";

                            return (
                                <tr
                                    key={index}
                                    className={`${rowBg} border-b border-gray-200 h-7`}
                                    onContextMenu={(e) => {
                                        if (!readOnly && !isEmpty) handleRightClick(e, index);
                                    }}
                                >
                                    {/* S.No */}
                                    <td className="w-10 border border-gray-300 text-[11px] text-center text-gray-500">
                                        {isEmpty ? "" : sNo}
                                    </td>

                                    {/* Sequence */}
                                    <td className="border border-gray-300 text-[11px] text-center px-1">
                                        {row.sequence || ""}
                                    </td>

                                    {/* Prev Process */}
                                    <td className="border border-gray-300 text-[11px] px-1 text-gray-500">
                                        {prevProcessName ? (
                                            <div className="flex items-center gap-1">
                                                {/* <span className="inline-flex items-center px-1 py-0 rounded text-[9px] bg-green-100 text-green-700 border border-green-400 font-semibold shrink-0">
                                                    ✓
                                                </span> */}
                                                <span>{prevProcessName}</span>
                                            </div>
                                        ) : ""}
                                    </td>

                                    {/* Process */}
                                    <td className="border border-gray-300 text-[11px] px-1 font-medium">
                                        {findFromList(row.processId, processList?.data, "name") || ""}
                                    </td>

                                    {/* Available Qty */}
                                    <td className="border border-gray-300 text-[11px] text-center px-1 text-gray-600">
                                        {isEmpty ? "" : (row.availableQty || "")}
                                    </td>

                                    {/* Sent Qty */}
                                    <td className="border border-gray-300 text-[11px]">
                                        <input
                                            type="number"
                                            min="0"
                                            className={`w-full text-right px-1 text-[11px] outline-none h-7 ${isSentDisabled
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-transparent focus:bg-white"
                                                }`}
                                            value={row.sentQty}
                                            onChange={(e) => handleInputChange(e.target.value, index, "sentQty")}
                                            onBlur={(e) => handleInputChange(
                                                e.target.value ? Number(e.target.value) : "",
                                                index, "sentQty"
                                            )}
                                            onFocus={(e) => e.target.select()}
                                            disabled={isSentDisabled}
                                            placeholder={isEmpty ? "" : "0"}
                                        />
                                    </td>

                                    {/* Received Qty */}
                                    <td className="border border-gray-300 text-[11px] text-right px-1 bg-gray-50">
                                        {isEmpty ? "" : (row.receivedQty || "")}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                    <tfoot>
                        <tr className="bg-gray-100 h-7 font-medium text-gray-800 text-[12px]">
                            <td className="text-right px-2 border border-gray-300" colSpan={4}>Total</td>
                            <td className="text-right border border-gray-300 px-1">
                                {outwardDetails?.reduce((s, r) => s + (Number(r.availableQty) || 0), 0) || ""}
                            </td>
                            <td className="text-right border border-gray-300 px-1">
                                {outwardDetails?.reduce((s, r) => s + (Number(r.sentQty) || 0), 0) || ""}
                            </td>
                            <td className="text-right border border-gray-300 px-1">
                                {outwardDetails?.reduce((s, r) => s + (Number(r.receivedQty) || 0), 0) || ""}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {contextMenu && (
                <div
                    style={{
                        position: "fixed",
                        top: `${contextMenu.mouseY - 20}px`,
                        left: `${contextMenu.mouseX + 20}px`,
                        boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                        padding: "8px",
                        borderRadius: "4px",
                        zIndex: 1000,
                    }}
                    className="bg-gray-100"
                    onMouseLeave={() => setContextMenu(null)}
                >
                    <div className="flex flex-col gap-1">
                        <button
                            className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                            onClick={() => { deleteMainRow(contextMenu.rowId); setContextMenu(null); }}
                        >
                            Delete Row
                        </button>
                        <button
                            className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                            onClick={() => { handleDeleteAllRows(); setContextMenu(null); }}
                        >
                            Delete All
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default OutwardDetails;