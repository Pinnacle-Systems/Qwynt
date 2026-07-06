import React, { useState, useEffect, useRef } from "react";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";
import { useGetStyleItemMasterQuery, useLazyGetStyleItemMasterByIdQuery } from "../../../redux/services/StyleItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { VIEW } from "../../../icons";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import Swal from "sweetalert2";
import { Gsm, HsnMaster, Size, StyleItemMaster, UomMaster } from "..";

const ProformaInvoiceItems = ({
    items,
    enrichedItems,
    setItems,
    readOnly,
    taxTemplateId,
    id,
    isCurrencySymbol,
    isCustomerExport,
    termsRef,
    conversionType,
    isSupplierOutside,
}) => {
    const styleItemRefs = useRef({});
    const { companyId } = getCommonParams();
    const { data: styleItemList } = useGetStyleItemMasterQuery({
        params: { companyId },
    });
    const { data: sizeList } = useGetSizeMasterQuery({ params: { companyId } });
    const { data: gsmList } = useGetGsmMasterQuery({ params: { companyId } });
    const { data: uomList } = useGetUomQuery({ params: { companyId } });
    const { data: hsnList } = useGetHsnMasterQuery({ params: { companyId } });

    const EMPTY_ROW = {
        styleItemId: "",
        sizeId: "",
        uomId: "",
        gsmId: "",
        hsnId: "",
        qty: "",
        price: "",
        amount: "", // Used for "Gross"
        dozen: "",
    };

    const [contextMenu, setContextMenu] = useState(null);
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    const [triggerGetStyleItem, { data: styleData }] =
        useLazyGetStyleItemMasterByIdQuery();

    const addRow = () => {
        setItems([...items, EMPTY_ROW]);
    };

    const deleteRow = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleInputChange = async (value, index, field) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };

        // Calculate gross (amount)
        const qty = parseFloat(newItems[index].qty) || 0;
        const price = parseFloat(newItems[index].price) || 0;
        const dozen = qty / 12
        newItems[index].dozen = dozen ? dozen.toFixed(2) : "";
        // ✅ Switch gross calculation based on conversionType
        if (conversionType === "DOZEN") {
            newItems[index].amount = dozen && price ? (dozen * price).toFixed(2) : "";
        } else {
            // PCS: qty * price
            newItems[index].amount = qty && price ? (qty * price).toFixed(2) : "";
        }

        setItems(newItems);
        if (field === "styleItemId") {
            // 1️⃣ update immediately
            newItems[index].styleItemId = value;
            setItems([...newItems]); // 🔥 maintain UI instantly

            try {
                // 2️⃣ fetch style data
                const response = await triggerGetStyleItem(value).unwrap();

                const updatedItems = items.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            styleItemId: value,
                            hsnId: response?.data?.hsnId,
                            uomId: response?.data?.uomId,
                        }
                        : item
                );

                setItems(updatedItems);
            } catch (e) {
                console.error("Style fetch failed", e);
            }

            return; // stop here
        }
    };

    const handleRightClick = (event, rowIndex) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleFocusNextRow = (index) => {
        const nextIndex = index + 1;

        if (!items[nextIndex]) {
            setItems((prev) => [...prev, EMPTY_ROW]);

            setTimeout(() => {
                styleItemRefs.current[nextIndex]?.focus?.();
            }, 300); // wait for new row to mount
        } else {
            setTimeout(() => {
                styleItemRefs.current[nextIndex]?.focus?.();
            }, 50);
        }
    };

    const deleteSelectedRows = () => {
        setItems((rows) => rows.filter((r) => !r.selected));
        setContextMenu(null);
    };

    const handleDeleteAllRows = () => {
        setItems(
            Array.from({ length: 10 }, () => ({ ...EMPTY_ROW })),
        );
    };

    // The padding to 14 elements is now handled synchronously in the parent (ProformaInvoiceForm)
    // to avoid a layout shift ("shake") when new data is loaded.

    return (
        <>
            <Modal
                isOpen={Number.isInteger(currentSelectedIndex)}
                onClose={() => {
                    setCurrentSelectedIndex("");   // closes modal
                    window.setTimeout(() => {
                        onCloseFocus?.(currentSelectedIndex);     // triggers handleFocusNextRow
                    }, 0);
                }}
            >
                <TaxDetailsFullTemplate
                    readOnly={readOnly}
                    taxTypeId={taxTemplateId}
                    currentIndex={currentSelectedIndex}
                    setCurrentSelectedIndex={setCurrentSelectedIndex}
                    poItems={enrichedItems?.items || items}
                    handleInputChange={handleInputChange}
                    id={id}
                    isNewVersion={false}
                    onCloseFocus={handleFocusNextRow}
                    isSupplierOutside={isSupplierOutside}
                />
            </Modal>

            <div className="w-full h-full overflow-y-auto bg-white">
                <table className=" table-fixed min-h-full bg-white">
                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 text-[12px]">
                        <tr>
                            <th className="w-10 px-1 py-2 text-center font-medium border border-gray-300">
                                S.No
                            </th>
                            <th className="w-80 px-2 py-2 text-center font-medium border border-gray-300">
                                Description of Goods<span className="text-red-500">*</span>
                            </th>
                            {/* <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                                Size
                            </th>

                            <th className="w-20 px-1 py-2 text-center font-medium border border-gray-300">
                                GSM
                            </th> */}
                            <th className="w-40 px-1 py-2 text-center font-medium border border-gray-300">
                                HSN
                            </th>
                            <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                                UOM
                            </th>
                            <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                                Qty<span className="text-red-500">*</span>
                            </th>
                            <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                                Dozen
                            </th>
                            <th className="w-32 px-1 py-2 text-center font-medium border border-gray-300">
                                Price {isCurrencySymbol && `(${isCurrencySymbol})`}<span className="text-red-500">*</span>
                            </th>
                            <th className="w-32 px-1 py-2 text-center font-medium border border-gray-300">
                                Gross
                            </th>
                            {
                                !isCustomerExport && (
                                    <th className="w-12 px-1 py-2 text-center font-medium border border-gray-300">
                                        Tax
                                    </th>
                                )
                            }
                            {/* <th className="w-10 px-1 py-2 text-center font-medium border border-gray-300">
              </th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {items?.map((item, index) => (
                            <tr
                                key={index}
                                className={`h-6 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                    }`}
                                onContextMenu={(e) => {
                                    if (!readOnly) {
                                        handleRightClick(e, index, "");
                                    }
                                }}
                            >
                                <td className="text-[11px] text-center border border-gray-300">
                                    {index + 1}
                                </td>
                                <td className="border border-gray-300">
                                    <FxSelectWithAdd
                                        value={item.styleItemId}
                                        onChange={(val) =>
                                            handleInputChange(val, index, "styleItemId")
                                        }
                                        options={
                                            styleItemList?.data
                                                ?.filter((p) => p.active)
                                                .map((p) => ({ label: p.name, value: p.id })) || []
                                        }
                                        readOnly={readOnly} // Read-only from Order Entry
                                        placeholder=""
                                        addNew={true}
                                        childComponent={StyleItemMaster}
                                        addNewModalWidth="w-[50%] h-[57%]"
                                        ref={(el) => (styleItemRefs.current[index] = el)}
                                        nextRef={termsRef}
                                    />
                                </td>
                                <td className="border border-gray-300 text-[11px] px-2">
                                    {/* <FxSelectWithAdd
                                        value={item.hsnId}
                                        onChange={(val) => handleInputChange(val, index, "hsnId")}
                                        options={
                                            hsnList?.data
                                                ?.filter((p) => p.active)
                                                .map((p) => ({ label: p.name, value: p.id })) || []
                                        }
                                        readOnly={true} // Read-only from Order Entry
                                        disabled={true}
                                        placeholder=""
                                        addNew={true}
                                        childComponent={HsnMaster}
                                        addNewModalWidth="w-[30%] h-[45%]"
                                    /> */}
                                    <span className="">
                                        {findFromList(item.hsnId, hsnList?.data, "name") || ""}
                                    </span>
                                </td>
                                <td className="border border-gray-300 text-[11px] px-2">
                                    {/* <FxSelectWithAdd
                                        value={item.uomId}
                                        onChange={(val) => handleInputChange(val, index, "uomId")}
                                        options={
                                            uomList?.data
                                                ?.filter((p) => p.active)
                                                .map((p) => ({ label: p.name, value: p.id })) || []
                                        }
                                        readOnly={true} // Read-only from Order Entry
                                        disabled={true}
                                        placeholder=""
                                        addNew={true}
                                        childComponent={UomMaster}
                                        addNewModalWidth="w-[30%] h-[45%]"
                                    /> */}
                                    <span>
                                        {findFromList(item.uomId, uomList?.data, "name") || ""}
                                    </span>
                                </td>
                                {/* <td className="border border-gray-300 outline-none p-0">
                                    <input
                                        type="number"
                                        className="w-full text-[11px] table-data-input text-right px-1 h-full outline-none "
                                        value={item.qty?.toFixed(3)}
                                      
                                        handleInputChange(e.target.value, index, "qty")
                                        }
                                        readOnly={readOnly}
                                        disabled={readOnly}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </td> */}
                                <td className="text-[11px] border border-gray-300  text-right">
                                    <input
                                        onKeyDown={(e) => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                e.preventDefault();
                                            if (e.key === "Delete") {
                                                handleInputChange("", index, "qty");
                                            }
                                        }}
                                        // min={"0"}
                                        type="number"
                                        className="text-right  px-1 w-full table-data-input"
                                        onFocus={(e) => {
                                            e.target.select();
                                            setFocusedField(`${index}`);
                                        }}
                                        value={
                                            focusedField === `${index}`
                                                ? (item?.qty ?? "")
                                                : item?.qty
                                                    ? Number(item.qty).toFixed(3)
                                                    : ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "qty")
                                        }
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            handleInputChange(
                                                val ? Number(val).toFixed(2) : "",
                                                index,
                                                "qty",
                                            );
                                        }}
                                        disabled={readOnly}
                                    />
                                </td>
                                <td className="text-[11px] border border-gray-300  text-right">
                                    <input
                                        onKeyDown={(e) => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                e.preventDefault();
                                            if (e.key === "Delete") {
                                                handleInputChange("", index, "dozen");
                                            }
                                        }}
                                        // min={"0"}
                                        type="number"
                                        className="text-right  px-1 w-full table-data-input"
                                        onFocus={(e) => {
                                            e.target.select();
                                            setFocusedField(`${index}`);
                                        }}
                                        value={
                                            focusedField === `${index}`
                                                ? (item?.dozen ?? "")
                                                : item?.dozen
                                                    ? Number(item.dozen).toFixed(2)
                                                    : ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "dozen")
                                        }
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            handleInputChange(
                                                val ? Number(val).toFixed(2) : "",
                                                index,
                                                "dozen",
                                            );
                                        }}
                                        disabled={true}
                                    />
                                </td>
                                <td className="text-[11px] border border-gray-300  text-right">
                                    <div className="relative w-full">
                                        {/* {isCurrencySymbol && item.styleItemId && (
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none">
                                                {isCurrencySymbol}
                                            </span>
                                        )} */}
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="text-right  px-3 w-full table-data-input"
                                            value={
                                                focusedField === `${index}`
                                                    ? item.price ?? ""
                                                    : item.price
                                                        ? Number(item.price).toFixed(2)
                                                        : ""
                                            }
                                            onChange={(e) => {
                                                const val = e.target.value;

                                                handleInputChange(
                                                    val === "" ? "" : val, // allow empty while typing
                                                    index,
                                                    "price",
                                                );
                                            }}
                                            readOnly={readOnly}
                                            onFocus={(e) => {
                                                e.target.select();
                                                setFocusedField(`${index}`);
                                            }}
                                            onBlur={(e) => {
                                                const num = parseFloat(e.target.value);
                                                handleInputChange(
                                                    num ? Number(num).toFixed(2) : "",
                                                    index,
                                                    "price",
                                                );
                                                setFocusedField(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                    e.preventDefault();
                                                if (e.key === "Delete") {
                                                    handleInputChange("", index, "price"); ``
                                                }
                                                if (e.key === "Enter") {
                                                    if (index === items.length - 1) {
                                                        addRow();
                                                    }
                                                }
                                            }}
                                        />

                                    </div>
                                </td>
                                <td className="text-[11px] text-right  px-1 border border-gray-300 bg-gray-50 bg-transparent gap-x-2">
                                    <span className="pr-1">{isCurrencySymbol && item.styleItemId ? ` ${isCurrencySymbol}` : ""}</span>
                                    {item.styleItemId ? (parseFloat(item.amount || 0).toFixed(2)) : ""}
                                </td>
                                {
                                    !isCustomerExport && (
                                        <td className="border border-gray-300 text-center text-[11px]">
                                            <button
                                                disabled={!item.styleItemId}
                                                className=" text-indigo-600 w-full hover:text-indigo-800 disabled:text-gray-300 table-data-input"
                                                onClick={() => {
                                                    if (!taxTemplateId) {
                                                        return Swal.fire({
                                                            title: "Information",
                                                            text: "Please select Tax Type",
                                                            icon: "info",
                                                            confirmButtonColor: "#3085d6",
                                                        });
                                                    }
                                                    setCurrentSelectedIndex(index);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (!taxTemplateId) {
                                                            return Swal.fire({
                                                                title: "Information",
                                                                text: "Please select Tax Type",
                                                                icon: "info",
                                                                confirmButtonColor: "#3085d6",
                                                            });
                                                        }
                                                        setCurrentSelectedIndex(index);
                                                    }
                                                }}
                                            >
                                                {VIEW}
                                            </button>
                                        </td>
                                    )
                                }
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 h-7 font-bold text-gray-800 text-[12px]">
                            <td
                                className="text-right px-2 border border-gray-300"
                                colSpan={4}
                            >
                                Total
                            </td>
                            <td className="text-right px-1 border border-gray-300">
                                {items
                                    ?.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0)
                                    .toFixed(3)}
                            </td>
                            <td className="text-right px-1  border border-gray-300">
                                {
                                    items?.reduce((sum, i) => sum + (parseFloat(i.dozen) || 0), 0)
                                        .toFixed(2)
                                }
                            </td>
                            <td className="text-right px-1  border border-gray-300">
                                {/* {isCurrencySymbol ? ` ${isCurrencySymbol}` : ""}
                                {
                                    items?.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0)
                                        .toFixed(2)
                                } */}
                            </td>
                            <td className="text-right px-1 border border-gray-300  text-black">
                                {isCurrencySymbol ? ` ${isCurrencySymbol}` : ""}
                                {items
                                    ?.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
                                    .toFixed(2)}
                            </td>
                            {
                                !isCustomerExport && (
                                    <td className="border border-gray-300"></td>
                                )
                            }
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
        </>
    );
};

export default ProformaInvoiceItems;