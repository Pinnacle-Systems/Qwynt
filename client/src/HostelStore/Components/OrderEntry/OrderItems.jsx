import React, { useState, useEffect } from 'react'
import { FxSelectWithAdd } from '../../../Inputs';
import { ItemGroup, Size, StyleItemMaster } from '..';
import { findFromList } from '../../../Utils/helper';
import { Plus } from 'lucide-react';

export const DEFAULT_ROW_COUNT = 10;

export const EMPTY_SIZE_ROW = () => ({ sizeId: null, qty: "" });

export const makeEmptyRow = () => ({
    styleItemId: "",
    uomId: "",
    hsnId: "",
    orderQty: "",
    itemGroupId: "",
    type: "",
    sizeBreakup: [EMPTY_SIZE_ROW()],   // 1 size row by default
    trackingType: "None",
});

// Call this in parent wherever you build orderItems before setOrderItems
export const padRows = (items = [], total = DEFAULT_ROW_COUNT) => {
    const result = items.map(row => ({
        ...row,
        sizeBreakup: Array.isArray(row.sizeBreakup) && row.sizeBreakup.length > 0
            ? row.sizeBreakup
            : [EMPTY_SIZE_ROW()],
    }));
    while (result.length < total) result.push(makeEmptyRow());
    return result;
};

const OrderItems = ({
    orderItems,
    setOrderItems,
    readOnly,
    styleItemList,
    sizeList,
    uomList,
    id,
    requirementRef,
    itemGroupList,
    hsnList,
    childRecord,
}) => {
    const [contextMenu, setContextMenu] = useState(null);

    /* ── Pad rows whenever orderItems arrives with fewer than DEFAULT_ROW_COUNT ── */
    useEffect(() => {
        if (!Array.isArray(orderItems)) return;
        if (orderItems.length < DEFAULT_ROW_COUNT) {
            setOrderItems(padRows(orderItems));
        }
    }, [orderItems.length, id]);   // trigger on length change or id switch

    /* ── row helpers ── */
    const addMainRow = () => setOrderItems(prev => [...prev, makeEmptyRow()]);

    const deleteMainRow = (index) => {
        setOrderItems(prev => {
            const next = prev.filter((_, i) => i !== index);
            return next.length < DEFAULT_ROW_COUNT ? padRows(next) : next;
        });
    };

    const handleDeleteAllRows = () =>
        setOrderItems(Array.from({ length: DEFAULT_ROW_COUNT }, makeEmptyRow));

    const handleInputChange = (value, index, field) => {
        setOrderItems(prev => {
            const rows = [...prev];
            let row = { ...rows[index], [field]: value };
            if (field === "styleItemId" && value) {
                const found = styleItemList?.data?.find(i => i.id === value);
                if (found) {
                    row = {
                        ...row,
                        // itemGroupId: found.itemGroupId || "",
                        uomId: found.uomId || "",
                        hsnId: found.hsnId || "",
                        sizeBreakup: id ? [...(row.sizeBreakup || [])] : [EMPTY_SIZE_ROW()],
                        orderQty: row.orderQty,
                    };
                }
            }
            rows[index] = row;
            return rows;
        });
    };

    /* ── size sub-grid helpers ── */
    const handleSizeBreakupChange = (rowIndex, sizeIndex, field, value) => {
        setOrderItems(prev => {
            const rows = [...prev];
            const row = { ...rows[rowIndex] };
            const breakup = [...(row.sizeBreakup || [])];
            breakup[sizeIndex] = { ...breakup[sizeIndex], [field]: value };
            row.sizeBreakup = breakup;
            if (field === "qty") {
                row.orderQty = breakup.reduce((s, i) => s + (Number(i.qty) || 0), 0);
            }
            rows[rowIndex] = row;
            return rows;
        });
    };

    const addSizeRow = (rowIndex) => {
        setOrderItems(prev => {
            const rows = [...prev];
            const row = { ...rows[rowIndex] };
            row.sizeBreakup = [...(row.sizeBreakup || []), EMPTY_SIZE_ROW()];
            rows[rowIndex] = row;
            return rows;
        });
    };

    const deleteSizeRow = (rowIndex, sizeIndex) => {
        setOrderItems(prev => {
            const rows = [...prev];
            const row = { ...rows[rowIndex] };
            const breakup = row.sizeBreakup.filter((_, i) => i !== sizeIndex);
            row.sizeBreakup = breakup.length > 0 ? breakup : [EMPTY_SIZE_ROW()];
            row.orderQty = row.sizeBreakup.reduce((s, i) => s + (Number(i.qty) || 0), 0);
            rows[rowIndex] = row;
            return rows;
        });
    };

    const handleRightClick = (e, rowIndex) => {
        e.preventDefault();
        setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, rowId: rowIndex });
    };

    /* ── render ── */
    return (
        <>
            <div className="w-full h-full overflow-y-auto bg-white">
                <table className="table-fixed min-h-full bg-white border-collapse">
                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 text-[12px]">
                        <tr>
                            <th className="w-10 px-2 py-2 text-center font-medium border border-gray-300">S.No</th>
                            <th className="w-36 px-2 py-2 text-center font-medium border border-gray-300">Item Group</th>
                            <th className="w-72 px-2 py-2 text-center font-medium border border-gray-300">
                                Description of Goods<span className="text-red-500">*</span>
                            </th>
                            <th className="w-20 px-2 py-2 text-center font-medium border border-gray-300">HSN</th>
                            <th className="w-20 px-2 py-2 text-center font-medium border border-gray-300">UOM</th>
                            <th className="w-16 px-2 py-2 text-center font-medium border border-gray-300">
                                Qty<span className="text-red-500">*</span>
                            </th>
                            {/* Actions column — header label only, no button */}
                            <th className="w-16 px-2 py-2 text-center font-medium border border-gray-300">
                                Actions
                            </th>
                            {/* Size sub-grid */}
                            <th className="w-8  px-1 py-2 text-center font-medium border border-gray-300 bg-indigo-50 text-indigo-700">#</th>
                            <th className="w-32 px-2 py-2 text-center font-medium border border-gray-300 bg-indigo-50 text-indigo-700">Size</th>
                            <th className="w-20 px-2 py-2 text-center font-medium border border-gray-300 bg-indigo-50 text-indigo-700">Size Qty</th>
                            <th className="w-16 px-1 py-2 text-center font-medium border border-gray-300 bg-indigo-50 text-indigo-700">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {(orderItems || []).map((row, index) => {
                            const sizeRows = Array.isArray(row.sizeBreakup) && row.sizeBreakup.length > 0
                                ? row.sizeBreakup
                                : [EMPTY_SIZE_ROW()];
                            const rowSpan = sizeRows.length;
                            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";

                            return sizeRows.map((sizeRow, sizeIndex) => (
                                <tr
                                    key={`${index}-${sizeIndex}`}
                                    className={`${rowBg} border-b border-gray-200 h-7 cursor-pointer`}
                                    onContextMenu={(e) => {
                                        if (!readOnly && sizeIndex === 0) handleRightClick(e, index);
                                    }}
                                >
                                    {sizeIndex === 0 && (
                                        <>
                                            <td className="w-10 border border-gray-300 text-[11px] text-center align-top pt-1" rowSpan={rowSpan}>
                                                {index + 1}
                                            </td>
                                            <td className="border border-gray-300 text-[11px] align-top pt-1" rowSpan={rowSpan}>
                                                {/* <span className="px-1">{findFromList(row.itemGroupId, itemGroupList?.data, "name") || ""}</span> */}
                                                <FxSelectWithAdd
                                                    value={row.itemGroupId}
                                                    onChange={(val) => handleInputChange(val, index, "itemGroupId")}
                                                    options={(itemGroupList?.data || [])
                                                        .filter(i => id ? true : i.active)
                                                        .map(i => ({ label: i.name, value: i.id }))}
                                                    readOnly={readOnly || childRecord?.current > 0}
                                                    placeholder=""
                                                    onBlur={() => handleInputChange(row.itemGroupId, index, "itemGroupId")}
                                                    onKeyDown={(e) => { if (e.key === "Delete") handleInputChange("", index, "itemGroupId"); }}
                                                    addNew={true}
                                                    childComponent={ItemGroup}
                                                    addNewModalWidth="w-[38%] h-[50%]"
                                                    nextRef={requirementRef}
                                                />
                                            </td>
                                            <td className="text-[11px] border border-gray-300 text-left align-top" rowSpan={rowSpan}>
                                                <FxSelectWithAdd
                                                    value={row.styleItemId}
                                                    onChange={(val) => handleInputChange(val, index, "styleItemId")}
                                                    options={(styleItemList?.data || [])
                                                        .filter(i => id ? (i.itemGroupId === row.itemGroupId) : i.active && i.itemGroupId === row.itemGroupId)
                                                        .map(i => ({ label: i.name, value: i.id }))}
                                                    readOnly={readOnly || childRecord?.current > 0}
                                                    placeholder=""
                                                    onBlur={() => handleInputChange(row.styleItemId, index, "styleItemId")}
                                                    onKeyDown={(e) => { if (e.key === "Delete") handleInputChange("", index, "styleItemId"); }}
                                                    addNew={true}
                                                    childComponent={StyleItemMaster}
                                                    addNewModalWidth="w-[50%] h-[57%]"
                                                // nextRef={requirementRef}
                                                />
                                            </td>

                                            <td className="border border-gray-300 text-[11px] align-top pt-1" rowSpan={rowSpan}>
                                                <span className="px-1">{findFromList(row.hsnId, hsnList?.data, "name") || ""}</span>
                                            </td>
                                            <td className="border border-gray-300 text-[11px] align-top pt-1" rowSpan={rowSpan}>
                                                <span className="px-1">{findFromList(row.uomId, uomList?.data, "name") || ""}</span>
                                            </td>
                                            <td className="border border-gray-300 text-[11px] text-right align-top pt-1 pr-1 font-medium" rowSpan={rowSpan}>
                                                {row.orderQty ? Number(row.orderQty) : ""}
                                            </td>
                                            {/* Per-row: Add only (no delete in cell) */}
                                            <td className="w-12 border border-gray-300 align-top pt-1 bg-gray-50" rowSpan={rowSpan}>
                                                {!readOnly && (
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={addMainRow}
                                                            className="flex items-center justify-center p-0.5 bg-blue-50 hover:bg-blue-100 rounded"
                                                            title="Add row"
                                                            tabIndex={-1}
                                                        >
                                                            <Plus size={13} className="text-blue-700" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </>
                                    )}

                                    {/* Size sub-grid */}
                                    <td className="w-8 border border-gray-200 text-[10px] text-center bg-indigo-50/30">
                                        {sizeIndex + 1}
                                    </td>
                                    <td className="border border-gray-200 text-[11px] bg-indigo-50/20">
                                        <FxSelectWithAdd
                                            value={sizeRow.sizeId}
                                            onChange={(val) => handleSizeBreakupChange(index, sizeIndex, "sizeId", val)}
                                            options={(sizeList?.data || [])
                                                .filter(i => id ? true : i.active)
                                                .map(i => ({ label: i.name, value: i.id }))}
                                            readOnly={readOnly || childRecord?.current > 0}
                                            placeholder=""
                                            addNew={true}
                                            childComponent={Size}
                                            addNewModalWidth="w-[38%] h-[50%]"
                                        />
                                    </td>
                                    <td className="border border-gray-200 text-[11px] bg-indigo-50/20">
                                        <input
                                            id={`size-qty-${index}-${sizeIndex}`}
                                            type="number"
                                            min="0"
                                            className="w-full text-right px-1 bg-transparent text-[11px] outline-none focus:bg-white h-7"
                                            value={sizeRow.qty}
                                            onChange={(e) => handleSizeBreakupChange(index, sizeIndex, "qty", e.target.value)}
                                            onBlur={(e) => handleSizeBreakupChange(index, sizeIndex, "qty", parseFloat(e.target.value || 0))}
                                            onFocus={(e) => e.target.select()}
                                            disabled={readOnly || childRecord?.current > 0}
                                            placeholder="0"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    if (sizeIndex === sizeRows.length - 1) {
                                                        addSizeRow(index);
                                                    } else {
                                                        document.querySelector(`#size-qty-${index}-${sizeIndex + 1}`)?.focus();
                                                    }
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="border border-gray-200 text-[11px] bg-indigo-50/20">
                                        {!readOnly && (
                                            <div className="flex items-center justify-center gap-0.5 px-0.5">
                                                <button
                                                    onClick={() => addSizeRow(index)}
                                                    className="flex items-center justify-center p-0.5 bg-blue-50 hover:bg-blue-100 rounded"
                                                    title="Add size row"
                                                    tabIndex={-1}
                                                >
                                                    <Plus size={13} className="text-blue-700" />
                                                </button>
                                                <button
                                                    onClick={() => deleteSizeRow(index, sizeIndex)}
                                                    className="flex items-center justify-center p-0.5 bg-red-50 hover:bg-red-100 rounded"
                                                    title="Delete size row"
                                                    tabIndex={-1}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ));
                        })}
                    </tbody>

                    <tfoot>
                        <tr className="bg-gray-100 h-7 font-medium text-gray-800 text-[12px]">
                            <td className="text-right px-2 border border-gray-300 font-medium" colSpan={5}>Total</td>
                            <td className="text-right border border-gray-300 px-1 font-medium">
                                {orderItems?.reduce((s, r) => s + (Number(r.orderQty) || 0), 0)}
                            </td>
                            <td className="border border-gray-300 bg-gray-50" />
                            <td colSpan={2} className="border border-gray-300 bg-indigo-50/30 text-right px-2 text-[11px] text-indigo-600">
                                Total

                            </td>
                            <td colSpan={1} className="border border-gray-300 bg-indigo-50/30 text-right px-2 text-[11px] text-indigo-600">

                                {orderItems?.reduce((s, r) =>
                                    s + (r.sizeBreakup || []).reduce((ss, sz) => ss + (Number(sz.qty) || 0), 0), 0
                                )}
                            </td>
                            <td colSpan={1} className="border border-gray-300 bg-indigo-50/30 text-right px-2 text-[11px] text-indigo-600">


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

export default OrderItems;