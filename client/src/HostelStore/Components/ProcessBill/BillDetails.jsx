import React, { useRef, useState } from "react";
import { findFromList } from "../../../Utils/helper";
import Modal from "../../../UiComponents/Modal";
import ProcessReceiptSelection from "./ProcessReceiptSelection";
import Swal from "sweetalert2";
import { VIEW } from "../../../icons";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import { toast } from "react-toastify";

export const DEFAULT_ROW_COUNT = 6;

export const makeEmptyRow = () => ({
    billedQty: "",
    price: "",
    discountType: "",
    discountValue: "",
    taxPercent: "",
    jobCardId: "",
    productionInwardId: "",
    processes: [],
    acceptedQty: "",
});

const BillDetails = ({
    billDetails,
    setBillDetails,
    readOnly,
    processList,
    id,
    childRecord,
    setTempItems,
    tempItems,
    searchDocId,
    setSearchDocId,
    setSearchDocDate,
    searchDocDate,
    searchJobCard,
    setSearchJobCard,
    supplierId,
    jobCardList,
    productionInwardList,
    taxTemplateId,
    isSupplierOutside,
    enrichedItems
}) => {
    const [contextMenu, setContextMenu] = useState(null);
    const [fillGrid, setFillGrid] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
    const actionRefs = useRef([]);

    const deleteMainRow = (index) =>
        setBillDetails((prev) => prev.filter((_, i) => i !== index));

    const handleDeleteAllRows = () =>
        setBillDetails(Array.from({ length: DEFAULT_ROW_COUNT }, makeEmptyRow));

    const handleInputChange = (value, index, field) => {
        setBillDetails((prev) => {
            const rows = [...prev];
            let row = { ...rows[index], [field]: value };

            // Auto-calculate acceptedQty = receivedQty - wastageQty
            if (field === "billedQty") {
                const accepted = field === "acceptedQty" ? Number(value) || 0 : Number(row.acceptedQty) || 0;
                const billed = field === "billedQty" ? Number(value) || 0 : Number(row.billedQty) || 0;
                if (billed > accepted) {
                    Swal.fire({
                        icon: "warning",
                        title: "Invalid Billed Qty",
                        text: "Billed Qty cannot exceed Accepted Qty",
                        confirmButtonColor: "#3085d6",
                    });

                    row.billedQty = "";
                    row.acceptedQty = accepted;
                }
            }

            rows[index] = row;
            return rows;
        });
    };

    const handleRightClick = (e, rowIndex) => {
        if (!billDetails[rowIndex]?.jobCardId) return;
        e.preventDefault();
        setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, rowId: rowIndex });
    };

    let sNo = 0;

    const focusActionCell = (index) => {
        const nextIndex = index + 1;
        setTimeout(() => {
            actionRefs.current[nextIndex]?.focus();
        }, 200); // wait for modal close render
    };

    return (
        <>
            <Modal
                isOpen={fillGrid}
                onClose={() => {
                    setFillGrid(false);

                    setTimeout(() => {
                        const firstInput = document.querySelector("#billedQty-input-0");
                        if (firstInput) {
                            firstInput.focus();
                            firstInput.select(); // optional UX 🔥
                        }
                    }, 100); // small delay important
                }}
                widthClass={"w-[75%] h-[85%]"}
            >
                <ProcessReceiptSelection
                    billDetails={billDetails}
                    setBillDetails={setBillDetails}
                    setTempItems={setTempItems}
                    tempItems={tempItems}
                    searchDocId={searchDocId}
                    setSearchDocId={setSearchDocId}
                    setSearchDocDate={setSearchDocDate}
                    searchDocDate={searchDocDate}
                    onClose={() => {
                        setFillGrid(false)
                        setTimeout(() => {
                            const firstInput = document.querySelector("#billedQty-input-0");
                            if (firstInput) {
                                firstInput.focus();
                                firstInput.select(); // optional UX 🔥
                            }
                        }, 100);
                    }}
                    searchJobCard={searchJobCard}
                    setSearchJobCard={setSearchJobCard}
                    processList={processList}
                />
            </Modal>
            <Modal
                isOpen={Number.isInteger(currentSelectedIndex)}
                onClose={() => setCurrentSelectedIndex("")}
            >
                <TaxDetailsFullTemplate
                    readOnly={readOnly}
                    taxTypeId={taxTemplateId}
                    currentIndex={currentSelectedIndex}
                    setCurrentSelectedIndex={setCurrentSelectedIndex}
                    poItems={enrichedItems?.items || billDetails}
                    handleInputChange={handleInputChange}
                    id={id}
                    isSupplierOutside={isSupplierOutside}
                    onCloseFocus={focusActionCell}
                />
            </Modal>
            <div className="bg-white p-1 h-full">

                <div className="flex items-center justify-between">
                    <h2 className="font-medium text-sm text-slate-700">List Of Items</h2>
                    <button
                        className={`font-bold bord ml-10 text-sm bg-blue-500 rounded-md text-white px-2`}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setFillGrid(true);
                            }
                        }}
                        onClick={() => {
                            if (!supplierId) {
                                Swal.fire({
                                    icon: "warning",
                                    title: ` Choose Supplier`,
                                    showConfirmButton: false,
                                    timer: 2000,
                                });
                            } else {
                                setFillGrid(true);
                            }
                        }}
                        type="button"
                    >
                        Fill Items
                    </button>
                </div>
                <div className="w-full min-h-[260px] max-h-[260px]  overflow-y-auto  py-1">
                    <table className="table-fixed bg-white border-collapse">
                        <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 text-[12px]">
                            <tr>
                                <th className="w-10 px-2 py-2 text-center font-medium border border-gray-300">
                                    S.No
                                </th>
                                <th className="w-36 px-2 py-2 text-center font-medium border border-gray-300">
                                    Process Receipt No
                                </th>
                                <th className="w-36 px-2 py-2 text-center font-medium border border-gray-300">
                                    Job Card No
                                </th>
                                <th className="w-44 px-2 py-2 text-center font-medium border border-gray-300">
                                    Process <span className="text-red-500">*</span>
                                </th>
                                <th className="w-28 px-2 py-2 text-center font-medium border border-gray-300">
                                    Accepted Qty <span className="text-red-500">*</span>
                                </th>
                                <th className="w-28 px-2 py-2 text-center font-medium border border-gray-300">
                                    Billed Qty
                                </th>

                                <th className={`w-20 px-4 py-2 text-center font-medium border border-gray-300`}>
                                    Price<span className="text-red-500">*</span>
                                </th>

                                <th className={`w-20 px-1 py-2 text-center font-medium border border-gray-300`}>
                                    Gross
                                </th>

                                <th className={`w-16 px-1 py-2 text-center font-medium border border-gray-300`}>
                                    Tax
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {(billDetails || []).map((row, index) => {
                                const isEmpty = !row.jobCardId;
                                if (!isEmpty) sNo++;

                                const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";
                                const isDisabled = readOnly || childRecord?.current > 0 || isEmpty;

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

                                        {/* Production Inward No. */}
                                        <td className="border border-gray-300 text-[11px] px-1 font-medium text-gray-800">
                                            {findFromList(row.productionInwardId, productionInwardList?.data, "docId") || ""}
                                        </td>

                                        {/* JobCard No. */}
                                        <td className="border border-gray-300 text-[11px] px-1 font-medium text-gray-800">
                                            {findFromList(row.jobCardId, jobCardList?.data, "docId") || ""}
                                        </td>

                                        {/* Process */}
                                        <td className="border border-gray-300 text-[11px] px-1 font-medium text-gray-800">
                                            {/* {findFromList(row.processId, processList?.data, "name") || ""} */}
                                            {
                                                row.processes
                                                    ?.map((id) => findFromList(id, processList?.data, "name"))
                                                    .filter(Boolean)
                                                    .join(" + ")
                                            }
                                        </td>

                                        {/* Accepted Qty */}
                                        <td className="border border-gray-300 text-[11px]">
                                            <input
                                                type="number"
                                                min="0"
                                                className={`w-full text-right px-1 text-[11px] outline-none ${isDisabled
                                                    ? " text-gray-400 cursor-not-allowed"
                                                    : "bg-transparent focus:bg-white"
                                                    }`}
                                                value={row.acceptedQty}
                                                onChange={(e) => handleInputChange(e.target.value, index, "acceptedQty")}
                                                onBlur={(e) =>
                                                    handleInputChange(
                                                        e.target.value ? Number(e.target.value) : "",
                                                        index,
                                                        "acceptedQty"
                                                    )
                                                }
                                                onFocus={(e) => e.target.select()}
                                                // disabled={isDisabled}
                                                disabled={true}
                                                placeholder={isEmpty ? "" : "0"}
                                            />
                                        </td>
                                        <td className="border border-gray-300 text-[11px]">
                                            <input
                                                id={`billedQty-input-${index}`}
                                                ref={(el) => (actionRefs.current[index] = el)}
                                                type="number"
                                                min="0"
                                                className={`w-full text-right px-1 text-[11px] outline-none ${isDisabled
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-transparent focus:bg-white"
                                                    }`}
                                                value={row.billedQty}
                                                onChange={(e) => handleInputChange(e.target.value, index, "billedQty")}
                                                onBlur={(e) =>
                                                    handleInputChange(
                                                        e.target.value ? Number(e.target.value) : "",
                                                        index,
                                                        "billedQty"
                                                    )
                                                }
                                                onFocus={(e) => e.target.select()}
                                                disabled={isDisabled}
                                                placeholder={isEmpty ? "" : "0"}
                                            />
                                        </td>


                                        <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-right">
                                            <input
                                                onKeyDown={(e) => {
                                                    if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                        e.preventDefault();
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "price");
                                                    }
                                                }}
                                                min={"0"}
                                                type="number"
                                                className="text-right rounded px-1 w-full table-data-input"
                                                onFocus={(e) => {
                                                    e.target.select();
                                                    setFocusedField(`${index}-price`);
                                                }}
                                                value={
                                                    focusedField === `${index}-price`
                                                        ? (row?.price ?? "")
                                                        : row?.price
                                                            ? Number(row.price).toFixed(2)
                                                            : ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "price")
                                                }
                                                onBlur={(e) => {
                                                    const val = e.target.value;
                                                    handleInputChange(
                                                        val ? Number(val).toFixed(2) : "",
                                                        index,
                                                        "price",
                                                    );
                                                    setFocusedField(null);
                                                }}
                                                disabled={
                                                    readOnly ||
                                                    (row.stockQty ?? 0) > 0
                                                }
                                            />
                                        </td>

                                        <td className=" border border-gray-300 text-[11px]">
                                            <input
                                                type="number"
                                                onFocus={(e) => e.target.select()}
                                                className="text-right rounded px-1 w-full"
                                                value={
                                                    !row.billedQty || !row.price
                                                        ? 0.0
                                                        : (
                                                            parseFloat(row.billedQty) *
                                                            parseFloat(row.price)
                                                        ).toFixed(2)
                                                }
                                                disabled={true}
                                            />
                                        </td>

                                        <td className="  border border-gray-300 text-[11px] text-right ">
                                            <button
                                                disabled={!row?.jobCardId}
                                                className="text-center rounded w-full table-data-input"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setCurrentSelectedIndex(index);
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (!taxTemplateId)
                                                        return toast.info("Please select Tax Type", {
                                                            position: "top-center",
                                                        });
                                                    setCurrentSelectedIndex(index);
                                                }}
                                            >
                                                {VIEW}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                        <tfoot>
                            <tr className="bg-gray-100 h-7 font-medium text-gray-800 text-[12px]">
                                <td className="text-right px-2 border border-gray-300" colSpan={4}>Total</td>
                                <td className="text-right border border-gray-300 px-1">
                                    {billDetails?.reduce((s, r) => s + (Number(r.acceptedQty) || 0), 0) || ""}
                                </td>
                                <td className="text-right border border-gray-300 px-1">
                                    {billDetails?.reduce((s, r) => s + (Number(r.billedQty) || 0), 0) || ""}
                                </td>

                                <td className="text-right border border-gray-300 px-1 font-medium ">
                                    {billDetails
                                        ?.reduce((sum, row) => sum + (Number(row.price) || 0), 0)
                                        .toFixed(2)}
                                </td>

                                <td className="text-right border border-gray-300 px-1 font-medium ">
                                    {billDetails
                                        ?.reduce((sum, row) => {
                                            const qty = parseFloat(row.billedQty) || 0;
                                            const price = parseFloat(row.price) || 0;
                                            return sum + qty * price;
                                        }, 0)
                                        .toFixed(2)}
                                </td>

                                <td
                                    className="text-right border border-gray-300"
                                    colSpan={1}
                                ></td>

                            </tr>
                        </tfoot>
                    </table>
                </div>
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

export default BillDetails;