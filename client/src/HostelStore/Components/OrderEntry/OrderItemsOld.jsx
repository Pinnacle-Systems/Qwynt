import React, { useState, useEffect } from 'react'
import FxSelect, { FxSelectWithAdd } from '../../../Inputs';
import { Gsm, Size, StyleItemMaster, UomMaster } from '..';
import { FiEye } from 'react-icons/fi';
import { useLazyGetSizeTemplateByIdQuery } from '../../../redux/services/SizeTemplateMaster';
import Modal from '../../../UiComponents/Modal';
import { findFromList } from '../../../Utils/helper';

const OrderItems = ({ orderItems, setOrderItems, readOnly, styleItemList, sizeList, uomList, id, requirementRef, itemGroupList, sizeTemplateList, hsnList, childRecord }) => {
    const EMPTY_ROW = {
        styleItemId: "",
        uomId: "",
        hsnId: "",
        orderQty: "",
        itemGroupId: "",
        type: "",
        sizeBreakup: [],
        trackingType: "None",

    };
    const [triggerGetTemplateById] = useLazyGetSizeTemplateByIdQuery();

    const [contextMenu, setContextMenu] = useState(null);
    const [focusedField, setFocusedField] = useState(null);
    const [sizeModalOpen, setSizeModalOpen] = useState(false);
    const [activeRowIndex, setActiveRowIndex] = useState(null);

    const addRow = () => {
        setOrderItems([...orderItems, EMPTY_ROW]);
    };

    const deleteRow = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };
    const handleInputChange = (value, index, field) => {
        const newRows = [...orderItems];
        let updatedRow = { ...newRows[index], [field]: value };
        // Auto-fill Item Group, UOM, GSM, and HSN when item is chosen
        if (field === "styleItemId" && value) {
            const selectedItem = styleItemList?.data?.find(
                (item) => item.id === value,
            );
            if (selectedItem) {
                updatedRow = {
                    ...updatedRow,
                    itemGroupId: selectedItem.itemGroupId || "",
                    uomId: selectedItem.uomId || "",
                    hsnId: selectedItem.hsnId || "",
                    sizeTemplateId: selectedItem.sizeTemplateId || "",
                    sizeBreakup: id ? [...(updatedRow.sizeBreakup || [])] : [],
                    orderQty: id ? updatedRow.orderQty : "",
                };
            }
        }

        // Auto-calculate qty for Barcode tracking
        if (
            (field === "barcodeFrom" || field === "barcodeTo") &&
            updatedRow.trackingType === "Barcode"
        ) {
            const from = parseInt(updatedRow.barcodeFrom) || 0;
            const to = parseInt(updatedRow.barcodeTo) || 0;
            if (to >= from && from > 0) {
                updatedRow.orderQty = to - from + 1;
            } else {
                updatedRow.orderQty = 0;
            }
        }

        newRows[index] = updatedRow;
        setOrderItems(newRows);
    };

    const handleRightClick = (event, rowIndex, type) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };
    const deleteSelectedRows = () => {
        setOrderItems((rows) => rows.filter((r) => !r.selected));
        setContextMenu(null);
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleOpenSizeModal = async (index) => {
        setActiveRowIndex(index);
        setSizeModalOpen(true);

        const currentRow = orderItems[index];
        const hasEmptyBreakup =
            !currentRow.sizeBreakup || currentRow.sizeBreakup.length === 0;

        let targetTemplateId = currentRow.sizeTemplateId;

        if (!targetTemplateId) {
            const selectedItem = styleItemList?.data?.find(
                (item) => item.id === currentRow.styleItemId,
            );
            targetTemplateId = selectedItem?.sizeTemplateId;
        }

        if (targetTemplateId && hasEmptyBreakup) {
            try {
                const response =
                    await triggerGetTemplateById(targetTemplateId).unwrap();
                const template = response?.data;
                if (template && template.SizeTemplateList) {
                    const initialBreakup = template.SizeTemplateList.map((t) => ({
                        sizeId: t.sizeId,
                        qty: "",
                        barcodeFrom: "",
                        barcodeTo: "",
                    }));

                    setOrderItems((prev) => {
                        const newRows = [...prev];
                        if (newRows[index]) {
                            newRows[index] = {
                                ...newRows[index],
                                sizeTemplateId: targetTemplateId,
                                sizeBreakup: initialBreakup,
                            };
                        }
                        return newRows;
                    });
                }
            } catch (e) {
                console.error("Failed to fetch size template details", e);
            }
        } else if (currentRow.trackingType === "Barcode") {
            // For Barcode tracking, ensure at least 4 rows and they reflect the current order quantity distribution
            setOrderItems((prev) => {
                const newRows = [...prev];

                if (newRows[index]) {
                    let currentBreakup = [...(newRows[index].sizeBreakup || [])];

                    const minRows = 4;
                    if (currentBreakup.length < minRows) {
                        const padding = Array.from(
                            { length: minRows - currentBreakup.length },
                            () => ({
                                sizeId: null,
                                qty: "",
                                barcodeFrom: "",
                                barcodeTo: "",
                            }),
                        );
                        currentBreakup = [...currentBreakup, ...padding];
                    }

                    // ✅ IMPORTANT: clone row before updating
                    const updatedRow = {
                        ...newRows[index],
                        sizeBreakup: currentBreakup,
                    };

                    newRows[index] = updatedRow;
                }

                return newRows;
            });
        }
    };


    useEffect(() => {
        if (id && orderItems?.length > 0) {
            const requiredRows = 14;
            const missingRows = requiredRows - orderItems.length;

            if (missingRows > 0) {
                setOrderItems([
                    ...orderItems,
                    ...Array.from({ length: missingRows }, () => ({ ...EMPTY_ROW })),
                ]);
            }
        }

        if (!id && (!orderItems || orderItems.length === 0)) {
            setOrderItems(Array.from({ length: 14 }, () => ({ ...EMPTY_ROW })));
        }
    }, [id, orderItems]);

    const handleSizeBreakupChange = (sizeIndex, field, value) => {
        const newRows = [...orderItems];
        const currentRow = { ...newRows[activeRowIndex] };
        const newBreakup = [...(currentRow.sizeBreakup || [])];
        newBreakup[sizeIndex] = { ...newBreakup[sizeIndex], [field]: value };

        currentRow.sizeBreakup = newBreakup;

        if (field === "qty") {
            const totalQty = newBreakup.reduce(
                (sum, item) => sum + (Number(item.qty) || 0),
                0,
            );
            currentRow.orderQty = totalQty;
        }

        // Sync barcode ranges back to main row for simple Barcode tracking
        if (currentRow.trackingType === "Barcode") {
            if (field === "barcodeFrom") currentRow.barcodeFrom = value;
            if (field === "barcodeTo") currentRow.barcodeTo = value;
        }

        newRows[activeRowIndex] = currentRow;
        setOrderItems(newRows);
    };

    const deleteModalRow = (index) => {
        setOrderItems((prev) => {
            const newRows = [...prev];
            const currentRow = { ...newRows[activeRowIndex] };
            let newBreakup = currentRow.sizeBreakup.filter((_, i) => i !== index);

            // Keep min 4 rows for Barcode type
            if (currentRow.trackingType === "Barcode" && newBreakup.length < 4) {
                newBreakup.push({
                    sizeId: null,
                    qty: "",
                    barcodeFrom: "",
                    barcodeTo: "",
                });
            }

            currentRow.sizeBreakup = newBreakup;
            currentRow.orderQty = newBreakup.reduce(
                (sum, item) => sum + (Number(item.qty) || 0),
                0,
            );
            newRows[activeRowIndex] = currentRow;
            return newRows;
        });
    };

    const deleteModalAllRows = () => {
        setOrderItems((prev) => {
            const newRows = [...prev];
            const currentRow = { ...newRows[activeRowIndex] };

            if (currentRow.trackingType === "Barcode") {
                currentRow.sizeBreakup = Array.from({ length: 4 }, () => ({
                    sizeId: null,
                    qty: "",
                    barcodeFrom: "",
                    barcodeTo: "",
                }));
            } else {
                currentRow.sizeBreakup = [];
            }

            currentRow.orderQty = 0;
            newRows[activeRowIndex] = currentRow;
            return newRows;
        });
    };

    const addModalRow = () => {
        setOrderItems((prev) => {
            const newRows = [...prev];
            const currentRow = { ...newRows[activeRowIndex] };
            currentRow.sizeBreakup = [
                ...(currentRow.sizeBreakup || []),
                { sizeId: null, qty: "", barcodeFrom: "", barcodeTo: "" },
            ];
            newRows[activeRowIndex] = currentRow;
            return newRows;
        });
    };

    const handleDeleteAllRows = () => {
        setOrderItems(Array.from({ length: 14 }, () => ({ ...EMPTY_ROW })));
    };

    const handleCloseAndFocusNextRow = () => {
        setSizeModalOpen(false);
        if (!id) {

            setTimeout(() => {
                const nextRowInput = document.querySelector(
                    `#styleItemId-input-${activeRowIndex + 1}`
                );

                if (nextRowInput) {
                    nextRowInput.focus();
                }
            }, 100);
        }
    };

    return (
        <>
            <div className="w-full h-full overflow-y-auto bg-white">
                <table className="table-fixed min-h-full bg-white ">
                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 text-[12px]">
                        <tr>
                            <th className={`w-12 px-4 py-2 text-center font-medium `}>
                                S.No
                            </th>
                            <th className={`w-96 px-2 py-2 text-center font-medium `}>
                                Description of Goods<span className="text-red-500">*</span>
                            </th>
                            <th className={`w-40 px-4 py-2 text-center font-medium `}>
                                Item Group
                            </th>
                            <th className={`w-24 px-4 py-2 text-center font-medium `}>
                                HSN
                            </th>
                            <th className={`w-40 px-4 py-2 text-center font-medium `}>
                                Type
                            </th>
                            <th className="w-16 px-1 py-2 text-center font-medium">
                                Size
                            </th>

                            <th className={`w-24 px-4 py-2 text-center font-medium `}>
                                UOM
                            </th>
                            <th className={`w-24 px-4 py-2 text-center font-medium  `}>
                                Qty<span className="text-red-500">*</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(orderItems ? orderItems : [])?.map((row, index) => (
                            <tr
                                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 cursor-pointer h-6`}
                                key={index}
                                onContextMenu={(e) => {
                                    if (!readOnly) {
                                        handleRightClick(e, index, "");
                                    }
                                }}
                            >
                                <td className="w-12 border border-gray-300 text-[11px]  text-center ">
                                    {index + 1}
                                </td>
                                <td className=" text-[11px] border border-gray-300 text-left">
                                    <FxSelectWithAdd
                                        inputId={`styleItemId-input-${index}`}
                                        value={row.styleItemId}
                                        onChange={(val) =>
                                            handleInputChange(val, index, "styleItemId")
                                        }
                                        options={(styleItemList?.data || [])
                                            .filter((item) => (id ? true : item.active))
                                            .map((item) => ({
                                                label: item.name,
                                                value: item.id,
                                            }))}
                                        readOnly={readOnly || childRecord?.current > 0}
                                        placeholder=""
                                        onBlur={() =>
                                            handleInputChange(row.styleItemId, index, "styleItemId")
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Delete") {
                                                handleInputChange("", index, "styleItemId");
                                            }
                                        }}
                                        addNew={true}
                                        childComponent={StyleItemMaster}
                                        addNewModalWidth="w-[50%] h-[57%]"
                                        nextRef={requirementRef}
                                    />
                                </td>
                                <td className="border border-gray-300 text-[11px]">
                                    <span className='px-1'>
                                        {findFromList(row.itemGroupId, itemGroupList?.data, "name") || ""}
                                    </span>
                                </td>
                                <td className="border border-gray-300 text-[11px]">
                                    <span className='px-1'>
                                        {findFromList(row.hsnId, hsnList?.data, "name") || ""}
                                    </span>
                                </td>
                                <td className="border border-gray-300">
                                    <FxSelect
                                        value={row.trackingType || "None"}
                                        onChange={(val) =>
                                            handleInputChange(val, index, "trackingType")
                                        }
                                        options={[
                                            { label: "None", value: "None" },
                                            { label: "Barcode", value: "Barcode" },
                                            { label: "Size Template", value: "SizeTemplate" },
                                            {
                                                label: "Size Template + Barcode",
                                                value: "SizeTemplateBarcode",
                                            },
                                        ]}
                                        readOnly={readOnly || childRecord?.current > 0}
                                        placeholder=""
                                    />
                                </td>
                                <td className="border border-gray-300">
                                    <div className="flex items-center justify-center h-full w-full">
                                        <button
                                            id={`breakup-btn-${index}`}
                                            type="button"
                                            onClick={() => handleOpenSizeModal(index)}
                                            disabled={
                                                !row.styleItemId ||
                                                readOnly ||
                                                ["None"].includes(
                                                    row.trackingType,
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleOpenSizeModal(index);
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }
                                            }}
                                            className="p-1 w-full  text-indigo-600 table-data-input hover:text-indigo-800 disabled:text-gray-400 transition-colors"
                                            title="View Sizes"
                                        >
                                            <FiEye size={14} className="mx-auto" />
                                        </button>
                                    </div>
                                </td>

                                <td className=" border border-gray-300 text-[11px] ">
                                    <span className='px-1'>
                                        {findFromList(row.uomId, uomList?.data, "name") || ""}
                                    </span>
                                </td>

                                <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right">
                                    <input
                                        id={`orderQty-input-${index}`}
                                        onKeyDown={(e) => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                e.preventDefault();
                                            if (e.key === "Delete") {
                                                handleInputChange("", index, "orderQty");
                                            }
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const next = document.querySelector(
                                                    `#orderQty-input-${index + 1}`,
                                                );
                                                if (index === orderItems.length - 1) {
                                                    addRow();
                                                }
                                                if (next) next.focus();
                                            }
                                        }}
                                        min={"0"}
                                        type="number"
                                        className="text-right  px-1 w-full table-data-input"
                                        onFocus={(e) => {
                                            e.target.select();
                                            setFocusedField(`${index}`);
                                        }}
                                        value={
                                            focusedField === `${index}`
                                                ? (row?.orderQty ?? "")
                                                : row?.orderQty
                                                    ? Number(row.orderQty)
                                                    : ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "orderQty")
                                        }
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            handleInputChange(
                                                val ? Number(val) : "",
                                                index,
                                                "orderQty",
                                            );
                                        }}
                                        disabled={readOnly || row.trackingType !== "None" || childRecord?.current > 0}
                                    />
                                </td>
                                {/* <td className="w-2 border border-gray-300">
                                    <input
                                        className="w-full table-data-input"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const next = document.querySelector(
                                                    `#orderQty-input-${index + 1}`,
                                                );
                                                if (index === orderItems.length - 1) {
                                                    addRow();
                                                }
                                                if (next) next.focus();
                                            }
                                            if (e.key === "Tab" && e.target.value === "") {
                                                e.preventDefault();
                                                termsRef?.current?.focus();
                                            }
                                        }}
                                        disabled={readOnly}
                                    />
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 h-6 font-medium text-gray-800 text-[12px]">
                            <td
                                className="text-right px-4 border border-gray-300 font-medium  "
                                colSpan={7}
                            >
                                Total
                            </td>
                            <td className="text-right border border-gray-300 px-1 font-medium  ">
                                {orderItems
                                    ?.reduce(
                                        (sum, row) => sum + (Number(row.orderQty) || 0),
                                        0,
                                    )
                                }
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {
                contextMenu && (
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
                        onMouseLeave={handleCloseContextMenu}
                    >
                        <div className="flex flex-col gap-1">
                            <button
                                className=" text-black text-[12px] text-left rounded px-1"
                                onClick={() => {
                                    deleteRow(contextMenu.rowId);
                                    deleteSelectedRows();
                                    handleCloseContextMenu();
                                }}
                            >
                                Delete
                            </button>
                            <button
                                className=" text-black text-[12px] text-left rounded px-1"
                                onClick={() => {
                                    handleDeleteAllRows();
                                    handleCloseContextMenu();
                                }}
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                )
            }
            {sizeModalOpen && activeRowIndex !== null && (
                <Modal
                    isOpen={sizeModalOpen}
                    onClose={() => {
                        handleCloseAndFocusNextRow()
                    }}
                    widthClass="w-[750px]"
                >
                    <div className="bg-slate-100 p-3 rounded-lg">
                        {/* Header section like the reference image */}
                        <div className="bg-white p-3 rounded-lg flex justify-between items-center mb-3 shadow-sm">
                            <h3 className="text-[16px] font-bold text-slate-800">
                                {orderItems[activeRowIndex]?.trackingType === "Barcode"
                                    ? "Barcode Wise Breakup"
                                    : orderItems[activeRowIndex]?.trackingType ===
                                        "SizeTemplateBarcode"
                                        ? "Size + Barcode Wise Breakup"
                                        : "Size Wise Breakup"}
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    className="bg-white text-indigo-600 border border-indigo-600 px-4 py-0.5 rounded text-[12px] hover:bg-indigo-50 font-semibold transition-colors flex items-center gap-1 shadow-sm"
                                    onClick={() => handleCloseAndFocusNextRow()}
                                >
                                    Done
                                </button>
                            </div>
                        </div>

                        {/* Main content area */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                            {orderItems[activeRowIndex]?.trackingType !== "Barcode" && (
                                <div className="mb-3 bg-slate-50 p-2 border border-slate-200 rounded flex items-center gap-3">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Size Template
                                    </span>
                                    <span className="text-[12px] font-bold text-slate-700">
                                        {sizeTemplateList?.data?.find(
                                            (t) =>
                                                t.id === orderItems[activeRowIndex]?.sizeTemplateId,
                                        )?.name || "No Template Selected"}
                                    </span>
                                </div>
                            )}
                            <div className="h-[220px] overflow-y-auto">
                                {/* --- BARCODE TYPE TABLE --- */}
                                {orderItems[activeRowIndex]?.trackingType === "Barcode" && (
                                    <table className="w-full border-separate border-spacing-0 border-t border-l border-slate-200">
                                        <thead>
                                            <tr>
                                                <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-11">
                                                    S.No
                                                </th>
                                                <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                                                    Barcode From
                                                </th>
                                                <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                                                    Barcode To
                                                </th>
                                                <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-24">
                                                    Qty
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems[activeRowIndex]?.sizeBreakup?.map(
                                                (item, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className="hover:bg-slate-50 transition-colors"
                                                        onContextMenu={(e) =>
                                                            handleRightClick(e, idx, "MODAL")
                                                        }
                                                    >
                                                        <td className="border-b border-r border-slate-200 px-1 py-0.5 text-center text-[11px] text-slate-500 font-medium">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="border-b border-r border-slate-200 px-1">
                                                            <input
                                                                type="text"
                                                                className="w-full border-none bg-transparent px-2 text-[11px] outline-none focus:bg-white"
                                                                value={item.barcodeFrom}
                                                                onChange={(e) =>
                                                                    handleSizeBreakupChange(
                                                                        idx,
                                                                        "barcodeFrom",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                disabled={readOnly || childRecord?.current > 0}
                                                                placeholder="From"
                                                                onFocus={(e) => {
                                                                    e.target.select()
                                                                }}
                                                                autoFocus={idx == 0}
                                                            />
                                                        </td>
                                                        <td className="border-b border-r border-slate-200 px-1 py-0">
                                                            <input
                                                                type="text"
                                                                className="w-full h-7 border-none bg-transparent px-2 text-[11px] outline-none focus:bg-white"
                                                                value={item.barcodeTo}
                                                                onChange={(e) =>
                                                                    handleSizeBreakupChange(
                                                                        idx,
                                                                        "barcodeTo",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (
                                                                        e.key === "Enter" &&
                                                                        idx ===
                                                                        orderItems[activeRowIndex]?.sizeBreakup
                                                                            ?.length -
                                                                        1
                                                                    ) {
                                                                        e.preventDefault();
                                                                        addModalRow();
                                                                    }
                                                                }}
                                                                disabled={readOnly || childRecord?.current > 0}
                                                                placeholder="To"
                                                                onFocus={(e) => {
                                                                    e.target.select()
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="border-b border-r border-slate-200 px-1 py-0">
                                                            <input
                                                                type="number"
                                                                className="w-full h-7 border-none text-right pr-2 bg-transparent text-[11px] text-black outline-none focus:bg-white"
                                                                value={item.qty}
                                                                onChange={(e) =>
                                                                    handleSizeBreakupChange(
                                                                        idx,
                                                                        "qty",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                disabled={readOnly || childRecord?.current > 0}
                                                                onBlur={(e) => {
                                                                    const value = parseFloat(
                                                                        e.target.value || 0,
                                                                    );
                                                                    handleSizeBreakupChange(idx, "qty", value);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (
                                                                        e.key === "Enter" &&
                                                                        idx ===
                                                                        orderItems[activeRowIndex]?.sizeBreakup
                                                                            ?.length -
                                                                        1
                                                                    ) {
                                                                        e.preventDefault();
                                                                        addModalRow();
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                onFocus={(e) => {
                                                                    e.target.select()
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {/* --- SIZE TEMPLATE TYPE TABLE --- */}
                                {orderItems[activeRowIndex]?.trackingType ===
                                    "SizeTemplate" && (
                                        <table className="w-[450px] border-separate border-spacing-0 border-t border-l border-slate-200">
                                            <thead>
                                                <tr>
                                                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-6">
                                                        S.No
                                                    </th>
                                                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 w-40 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                                                        Size
                                                    </th>
                                                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 w-16 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                                                        Qty
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderItems[activeRowIndex]?.sizeBreakup?.map(
                                                    (item, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className="h-8 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <td className="border-b border-r border-slate-200 px-1 py-0 text-center text-[11px] text-black">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="border-b border-r border-slate-200 px-3 py-0 text-[11px] text-black">
                                                                {sizeList?.data?.find((s) => s.id === item.sizeId)
                                                                    ?.name || "All Items"}
                                                            </td>
                                                            <td className="border-b border-r border-slate-200 px-1 py-0">
                                                                <input
                                                                    type="number"
                                                                    className="w-full h-7 border-none text-right pr-2 bg-transparent text-[11px] text-black outline-none focus:bg-white"
                                                                    value={item.qty}
                                                                    onChange={(e) =>
                                                                        handleSizeBreakupChange(
                                                                            idx,
                                                                            "qty",
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    disabled={readOnly || childRecord?.current > 0}
                                                                    onBlur={(e) => {
                                                                        const value = parseFloat(
                                                                            e.target.value || 0,
                                                                        );
                                                                        handleSizeBreakupChange(idx, "qty", value);
                                                                    }}
                                                                    placeholder="0"
                                                                    onFocus={(e) => {
                                                                        e.target.select()
                                                                    }}
                                                                    autoFocus={idx == 0}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                {/* --- SIZE TEMPLATE + BARCODE TYPE TABLE --- */}
                                {orderItems[activeRowIndex]?.trackingType ===
                                    "SizeTemplateBarcode" && (
                                        <table className="w-full border-separate border-spacing-0 border-t border-l border-slate-200">
                                            <thead>
                                                <tr>
                                                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-10">
                                                        S.No
                                                    </th>
                                                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-28">
                                                        Size
                                                    </th>
                                                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-32">
                                                        From
                                                    </th>
                                                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-32">
                                                        To
                                                    </th>
                                                    <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase w-20">
                                                        Qty
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderItems[activeRowIndex]?.sizeBreakup?.map(
                                                    (item, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className="h-8 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <td className="border-b border-r border-slate-200 px-1 py-0 text-center text-[11px] text-black ">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="border-b border-r border-slate-200 px-2 py-0 text-[11px]  text-black truncate ">
                                                                {sizeList?.data?.find((s) => s.id === item.sizeId)
                                                                    ?.name || "All Items"}
                                                            </td>
                                                            <td className="border-b border-r border-slate-200 px-1 py-0">
                                                                <input
                                                                    type="text"
                                                                    className="w-full h-7 border-none bg-transparent px-1 text-[11px] outline-none focus:bg-white"
                                                                    value={item.barcodeFrom}
                                                                    onChange={(e) =>
                                                                        handleSizeBreakupChange(
                                                                            idx,
                                                                            "barcodeFrom",
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    disabled={readOnly || childRecord?.current > 0}
                                                                    placeholder="From"
                                                                    onFocus={(e) => {
                                                                        e.target.select()
                                                                    }}
                                                                    autoFocus={idx == 0}

                                                                />
                                                            </td>
                                                            <td className="border-b border-r border-slate-200 px-1 py-0">
                                                                <input
                                                                    type="text"
                                                                    className="w-full h-7 border-none bg-transparent px-1 text-[11px] outline-none focus:bg-white"
                                                                    value={item.barcodeTo}
                                                                    onChange={(e) =>
                                                                        handleSizeBreakupChange(
                                                                            idx,
                                                                            "barcodeTo",
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    disabled={readOnly || childRecord?.current > 0}
                                                                    placeholder="To"
                                                                    onFocus={(e) => {
                                                                        e.target.select()
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="border-b border-r border-slate-200 px-1 py-0">
                                                                <input
                                                                    type="number"
                                                                    className="w-full h-7 border-none text-right pr-2 bg-transparent text-[11px] text-black outline-none focus:bg-white"
                                                                    value={item.qty}
                                                                    onChange={(e) =>
                                                                        handleSizeBreakupChange(
                                                                            idx,
                                                                            "qty",
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    disabled={readOnly || childRecord?.current > 0}
                                                                    onBlur={(e) => {
                                                                        const value = parseFloat(
                                                                            e.target.value || 0,
                                                                        );
                                                                        handleSizeBreakupChange(idx, "qty", value);
                                                                    }}
                                                                    placeholder="0"
                                                                    onFocus={(e) => {
                                                                        e.target.select()
                                                                    }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                {(!orderItems[activeRowIndex]?.sizeBreakup ||
                                    orderItems[activeRowIndex].sizeBreakup.length === 0) && (
                                        <div className="text-center p-8 text-slate-400 text-sm font-medium italic">
                                            No items found for this tracking mode.
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    )
}


export default OrderItems