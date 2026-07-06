import React, { useState, useRef } from "react";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";
import {
  useGetStyleItemMasterQuery,
  useLazyGetStyleItemMasterByIdQuery,
} from "../../../redux/services/StyleItemMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { VIEW } from "../../../icons";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import Swal from "sweetalert2";
import { StyleItemMaster } from "..";
import { FiEye } from "react-icons/fi";

// FIX: Default empty size row shape
const EMPTY_SIZE_ROW = { sizeId: "", qty: "" };

// FIX: Number of default rows shown in the size breakup modal
const DEFAULT_SIZE_ROWS = 5;

const SalesDeliveryItems = ({
  items,
  enrichedItems,
  setItems,
  readOnly,
  taxTemplateId,
  id,
  isCumInvoice,
  termsRef,
  isSupplierOutside,
  sizeList,
  conversionType,
  isCustomerExport,
}) => {
  const styleItemRefs = useRef({});
  const { companyId } = getCommonParams();
  const { data: styleItemList } = useGetStyleItemMasterQuery({
    params: { companyId },
  });
  const { data: uomList } = useGetUomQuery({ params: { companyId } });
  const { data: hsnList } = useGetHsnMasterQuery({ params: { companyId } });

  const EMPTY_ROW = {
    styleItemId: "",
    uomId: "",
    hsnId: "",
    qty: "",
    price: "",
    amount: "",
    type: "",
    sizeBreakup: [],
    trackingType: "None",
  };

  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [triggerGetStyleItem] = useLazyGetStyleItemMasterByIdQuery();
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [pendingFocus, setPendingFocus] = useState(null);

  const addRow = () => setItems([...items, EMPTY_ROW]);

  const deleteRow = (index) => setItems(items.filter((_, i) => i !== index));

  const handleInputChange = async (value, index, field) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    const qty = parseFloat(newItems[index].qty) || 0;
    const price = parseFloat(newItems[index].price) || 0;
    const dozen = qty / 12;
    newItems[index].dozen = dozen ? dozen.toFixed(2) : "";
    if (isCumInvoice) {
      if (conversionType === "DOZEN") {
        newItems[index].amount =
          dozen && price ? (dozen * price).toFixed(2) : "";
      } else {
        newItems[index].amount = qty && price ? (qty * price).toFixed(2) : "";
      }
    } else {
      newItems[index].amount = "";
      newItems[index].price = "";
    }

    setItems(newItems);

    if (field === "styleItemId") {
      newItems[index].styleItemId = value;
      setItems([...newItems]);
      try {
        const response = await triggerGetStyleItem(value).unwrap();
        const updatedItems = items.map((item, i) =>
          i === index
            ? {
                ...item,
                styleItemId: value,
                hsnId: response?.data?.hsnId,
                uomId: response?.data?.uomId,
              }
            : item,
        );
        setItems(updatedItems);
      } catch (e) {
        console.error("Style fetch failed", e);
      }
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

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleFocusNextRow = (index) => {
    const nextIndex = index + 1;
    if (!items[nextIndex]) {
      setItems((prev) => [...prev, EMPTY_ROW]);
      setTimeout(() => {
        styleItemRefs.current[nextIndex]?.focus?.();
      }, 300);
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

  const handleDeleteAllRows = () =>
    setItems(Array.from({ length: 10 }, () => ({ ...EMPTY_ROW })));

  // FIX: Pad sizeBreakup to DEFAULT_SIZE_ROWS when opening the modal
  const handleOpenSizeModal = async (index) => {
    setActiveRowIndex(index);

    const currentRow = items[index];
    const existingBreakup = currentRow.sizeBreakup || [];

    // Pad to at least DEFAULT_SIZE_ROWS empty rows
    if (existingBreakup.length < DEFAULT_SIZE_ROWS) {
      const padding = Array.from(
        { length: DEFAULT_SIZE_ROWS - existingBreakup.length },
        () => ({ ...EMPTY_SIZE_ROW }),
      );
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        sizeBreakup: [...existingBreakup, ...padding],
      };
      setItems(newItems);
    }

    setSizeModalOpen(true);
    setPendingFocus(index);
  };

  // FIX: Use sizeIndex and sizeId consistently (was mixing processId)
  const handleSizeBreakupChange = (sizeIndex, field, value) => {
    const newRows = [...items];
    const currentRow = { ...newRows[activeRowIndex] };
    const newBreakup = [...(currentRow.sizeBreakup || [])];
    newBreakup[sizeIndex] = { ...newBreakup[sizeIndex], [field]: value };

    currentRow.sizeBreakup = newBreakup;

    if (field === "qty") {
      const totalQty = newBreakup.reduce(
        (sum, item) => sum + (Number(item.qty) || 0),
        0,
      );
      currentRow.qty = totalQty;
    }

    newRows[activeRowIndex] = currentRow;
    setItems(newRows);
  };

  const handleCloseSizeModal = () => {
    if (activeRowIndex !== null && items[activeRowIndex]) {
      const currentRow = items[activeRowIndex];

      let hasError = false;
      for (let i = 0; i < (currentRow.sizeBreakup?.length || 0); i++) {
        const item = currentRow.sizeBreakup[i];
        // FIX: validate sizeId (not processId/barcodeFrom/barcodeTo)
        const hasSizeId = item.sizeId && String(item.sizeId).trim() !== "";
        const hasQty =
          item.qty !== undefined &&
          item.qty !== null &&
          String(item.qty).trim() !== "" &&
          Number(item.qty) !== 0;

        // If either field is partially filled, both must be present
        if ((hasSizeId && !hasQty) || (!hasSizeId && hasQty)) {
          hasError = true;
          break;
        }
      }
      if (hasError) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Both Size and Qty are required for each filled row.",
          timer: 3000,
        });
        return;
      }
    }
    setSizeModalOpen(false);
  };

  return (
    <>
      {isCumInvoice && (
        <Modal
          isOpen={Number.isInteger(currentSelectedIndex)}
          onClose={() => {
            setCurrentSelectedIndex("");
            window.setTimeout(() => {
              handleFocusNextRow(currentSelectedIndex);
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
      )}

      {/* FIX: Size breakup modal */}
      {sizeModalOpen && activeRowIndex !== null && (
        <Modal
          isOpen={sizeModalOpen}
          onClose={handleCloseSizeModal}
          widthClass="w-[520px]"
        >
          <div className="bg-slate-100 p-3 rounded-lg">
            {/* Header */}
            <div className="bg-white p-3 rounded-lg flex justify-between items-center mb-3 shadow-sm">
              <h3 className="text-[16px] font-bold text-slate-800">
                Size Wise Breakup
              </h3>
              <div className="flex gap-2">
                <button
                  className="bg-white text-indigo-600 border border-indigo-600 px-4 py-0.5 rounded text-[12px] hover:bg-indigo-50 font-semibold transition-colors flex items-center gap-1 shadow-sm"
                  onClick={handleCloseSizeModal}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              {/*
                ROOT CAUSE FIX — dropdown hidden behind modal backdrop:
                  1. The scroll container uses overflow-y:auto but must NOT clip
                     the dropdown that opens downward out of its bounds.
                     Solution: keep overflow-y:auto on the scroll div, but give
                     the <td> position:relative and the FxSelectWithAdd
                     menuPortalTarget={null} + menuPosition="absolute" so the
                     menu renders inline in the DOM (not portalled to body).
                     The modal itself has a high enough z-index that inline
                     menus inside it naturally sit on top.
                  2. Remove overflow:hidden from the table wrapper — it was
                     clipping the open menu.
              */}
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <table
                  className="w-full border-separate border-spacing-0 border-t border-l border-slate-200"
                  style={{ tableLayout: "fixed" }}
                >
                  <colgroup>
                    <col style={{ width: 36 }} />
                    <col style={{ width: 100 }} />
                    <col style={{ width: 40 }} />
                    <col style={{ width: 32 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                        S.No
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                        Size
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1 text-center text-[11px] font-bold text-black uppercase">
                        Qty
                      </th>
                      <th className="sticky top-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-1 py-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {items[activeRowIndex]?.sizeBreakup?.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 transition-colors"
                        style={{ height: 32 }}
                      >
                        {/* S.No */}
                        <td className="border-b border-r border-slate-200 px-1 py-0 text-center text-[11px] text-black">
                          {idx + 1}
                        </td>

                        {/*
                          KEY FIX: position:relative on the cell + menuPortalTarget={null}
                          on FxSelectWithAdd makes the react-select menu render inline
                          instead of into document.body, so it never goes behind the
                          modal backdrop.
                        */}
                        <td
                          className="border-b border-r border-slate-200 px-0 py-0 text-[11px] text-black"
                          style={{ position: "relative", overflow: "visible" }}
                        >
                          <FxSelectWithAdd
                            value={item.sizeId}
                            onChange={(val) =>
                              handleSizeBreakupChange(idx, "sizeId", val)
                            }
                            options={(sizeList?.data || sizeList || [])
                              .filter((i) => (id ? true : i.active))
                              .map((i) => ({
                                label: i.name,
                                value: i.id,
                              }))}
                            readOnly={readOnly}
                            placeholder=""
                            onKeyDown={(e) => {
                              if (e.key === "Delete")
                                handleSizeBreakupChange(idx, "sizeId", "");
                            }}
                            addNew={false}
                            menuPortalTarget={null}
                            menuPosition="absolute"
                          />
                        </td>

                        {/* Qty */}
                        <td className="border-b border-r border-slate-200 px-1 py-0">
                          <input
                            type="number"
                            className="w-full h-7 border-none text-right pr-2 bg-transparent text-[11px] text-black outline-none focus:bg-white"
                            value={
                              item.qty !== undefined &&
                              item.qty !== null &&
                              item.qty !== ""
                                ? Number(item.qty)
                                : ""
                            }
                            onChange={(e) =>
                              handleSizeBreakupChange(
                                idx,
                                "qty",
                                e.target.value,
                              )
                            }
                            disabled={readOnly}
                            placeholder="0"
                          />
                        </td>

                        {/* Actions: + add below, trash delete — matches reference pattern */}
                        {!readOnly && (
                          <td className="border-b border-r border-slate-200 px-1 py-0 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              {/* Add row below this one */}
                              <button
                                type="button"
                                tabIndex={-1}
                                title="Add row below"
                                onClick={() => {
                                  const newRows = [...items];
                                  const currentRow = {
                                    ...newRows[activeRowIndex],
                                  };
                                  const newBreakup = [
                                    ...(currentRow.sizeBreakup || []),
                                  ];
                                  newBreakup.splice(idx + 1, 0, {
                                    ...EMPTY_SIZE_ROW,
                                  });
                                  currentRow.sizeBreakup = newBreakup;
                                  newRows[activeRowIndex] = currentRow;
                                  setItems(newRows);
                                }}
                                className="p-0.5 bg-blue-50 hover:bg-blue-100 rounded"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-blue-700"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              {/* Delete this row */}
                              <button
                                type="button"
                                tabIndex={-1}
                                title="Delete row"
                                onClick={() => {
                                  const newRows = [...items];
                                  const currentRow = {
                                    ...newRows[activeRowIndex],
                                  };
                                  const newBreakup = [
                                    ...(currentRow.sizeBreakup || []),
                                  ];
                                  newBreakup.splice(idx, 1);
                                  currentRow.sizeBreakup =
                                    newBreakup.length > 0
                                      ? newBreakup
                                      : [{ ...EMPTY_SIZE_ROW }];
                                  currentRow.qty = newBreakup.reduce(
                                    (sum, r) => sum + (Number(r.qty) || 0),
                                    0,
                                  );
                                  newRows[activeRowIndex] = currentRow;
                                  setItems(newRows);
                                }}
                                className="p-0.5 bg-red-50 hover:bg-red-100 rounded"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-red-700"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <div className="w-full h-full overflow-y-auto bg-white">
        <table className="table-fixed min-h-full bg-white">
          <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 text-[12px]">
            <tr>
              <th className="w-10 px-1 py-2 text-center font-medium border border-gray-300">
                S.No
              </th>
              <th className="w-80 px-2 py-2 text-center font-medium border border-gray-300">
                Description of Goods<span className="text-red-500">*</span>
              </th>
              <th className="w-40 px-1 py-2 text-center font-medium border border-gray-300">
                HSN
              </th>
              <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                UOM
              </th>
              <th className="w-28 px-1 py-2 text-center font-medium border border-gray-300">
                Type
              </th>
              <th className="w-16 px-1 py-1 text-center font-medium border border-gray-300 text-[11px]">
                Size Breakup
              </th>
              <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                Qty<span className="text-red-500">*</span>
              </th>

              {isCumInvoice && (
                <>
                  {conversionType === "DOZEN" && (
                    <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                      Dozen
                    </th>
                  )}
                  <th className="w-32 px-1 py-2 text-center font-medium border border-gray-300">
                    Price<span className="text-red-500">*</span>
                  </th>
                  <th className="w-32 px-1 py-2 text-center font-medium border border-gray-300">
                    Amount
                  </th>
                  {!isCustomerExport && (
                    <th className="w-12 px-1 py-2 text-center font-medium border border-gray-300">
                      Tax
                    </th>
                  )}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items?.map((item, index) => (
              <tr
                key={index}
                className={`h-6 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                onContextMenu={(e) => {
                  if (!readOnly) handleRightClick(e, index);
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
                    readOnly={readOnly}
                    placeholder=""
                    addNew={true}
                    childComponent={StyleItemMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                    ref={(el) => (styleItemRefs.current[index] = el)}
                    nextRef={termsRef}
                  />
                </td>
                <td className="border border-gray-300 text-[11px] px-2">
                  <span>
                    {findFromList(item.hsnId, hsnList?.data, "name") || ""}
                  </span>
                </td>
                <td className="border border-gray-300 text-[11px] px-2">
                  <span>
                    {findFromList(item.uomId, uomList?.data, "name") || ""}
                  </span>
                </td>
                <td className="border border-gray-300 grid-editable-cell">
                  <select
                    id={`trackingType-input-${index}`}
                    value={item.trackingType || "None"}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "trackingType")
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Tab") {
                        if (!item.styleItemId) {
                          e.preventDefault();
                          const reqEl = document.getElementById(
                            "customerRequirements",
                          );
                          if (reqEl) {
                            reqEl.focus();
                            reqEl.select?.();
                          }
                        } else if (e.key === "Enter") {
                          e.preventDefault();
                          if (item.trackingType === "None") {
                            const qtyEl = document.getElementById(
                              `orderQty-input-${index}`,
                            );
                            if (qtyEl) qtyEl.focus();
                          } else {
                            const breakupEl = document.getElementById(
                              `breakup-btn-${index}`,
                            );
                            if (breakupEl) breakupEl.focus();
                          }
                        }
                      }
                    }}
                    disabled={readOnly}
                    className="pl-2 h-full text-[11px] cursor-pointer outline-none w-full bg-transparent rounded-sm transition-all"
                  >
                    <option value="None">None</option>
                    <option value="Size Template">Size Wise</option>
                  </select>
                </td>

                {/* FIX: enable button only when trackingType is "Size Template" AND styleItemId is set */}
                <td className="border border-gray-300 text-center items-center">
                  <button
                    id={`breakup-btn-${index}`}
                    type="button"
                    onClick={() => handleOpenSizeModal(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !readOnly) {
                        e.preventDefault();
                        handleOpenSizeModal(index);
                      }
                    }}
                    disabled={
                      !item.styleItemId || item.trackingType !== "Size Template"
                    }
                    className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 transition-colors"
                    title={
                      item.trackingType !== "Size Template"
                        ? "Set Type to 'Size Wise' to enable"
                        : "View Sizes"
                    }
                  >
                    <FiEye size={18} />
                  </button>
                </td>

                <td className="text-[11px] border border-gray-300 text-right">
                  <input
                    type="number"
                    className="text-right px-1 w-full table-data-input"
                    onFocus={(e) => {
                      e.target.select();
                      setFocusedField(`qty_${index}`);
                    }}
                    value={
                      focusedField === `qty_${index}`
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
                        val ? Number(val).toFixed(3) : "",
                        index,
                        "qty",
                      );
                      setFocusedField(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete")
                        handleInputChange("", index, "qty");
                    }}
                    // FIX: qty input is read-only when trackingType is Size Wise
                    // (qty is derived from size breakup totals)
                    disabled={readOnly || item.trackingType === "Size Template"}
                  />
                </td>
                {isCumInvoice && (
                  <>
                    {conversionType === "DOZEN" && (
                      <td className="text-[11px] border px-2 border-gray-300 text-right">
                        {item.dozen}
                      </td>
                    )}

                    <td className="text-[11px] border border-gray-300 text-right">
                      <input
                        type="number"
                        step="0.01"
                        className="text-right px-3 w-full table-data-input"
                        value={
                          focusedField === `price_${index}`
                            ? (item.price ?? "")
                            : item.price
                              ? Number(item.price).toFixed(2)
                              : ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value === "" ? "" : e.target.value,
                            index,
                            "price",
                          )
                        }
                        readOnly={readOnly}
                        onFocus={(e) => {
                          e.target.select();
                          setFocusedField(`price_${index}`);
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
                          if (e.key === "Delete")
                            handleInputChange("", index, "price");
                          if (e.key === "Enter" && index === items.length - 1)
                            addRow();
                        }}
                      />
                    </td>
                    <td className="text-[11px] text-right px-1 border border-gray-300 bg-gray-50 bg-transparent gap-x-2">
                      {item.styleItemId
                        ? parseFloat(item.amount || 0).toFixed(2)
                        : ""}
                    </td>
                    {!isCustomerExport && (
                      <td className="border border-gray-300 text-center text-[11px]">
                        <button
                          disabled={!item.styleItemId}
                          className="text-indigo-600 w-full hover:text-indigo-800 disabled:text-gray-300 table-data-input"
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
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 h-7 font-bold text-gray-800 text-[12px]">
              <td
                className="text-right px-2 border border-gray-300"
                colSpan={6}
              >
                Total
              </td>
              <td className="text-right px-1 border border-gray-300">
                {items
                  ?.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0)
                  .toFixed(3)}
              </td>
              {isCumInvoice && (
                <>
                  <td className="text-right px-1 border border-gray-300"></td>
                  {conversionType === "DOZEN" && (
                    <td className="text-right px-1 border border-gray-300">
                      {items
                        ?.reduce(
                          (sum, i) => sum + (parseFloat(i.dozen) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </td>
                  )}
                  <td className="text-right px-1 border border-gray-300 text-black">
                    {items
                      ?.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
                      .toFixed(2)}
                  </td>
                  {!isCustomerExport && (
                    <td className="border border-gray-300"></td>
                  )}
                </>
              )}
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
          onMouseLeave={handleCloseContextMenu}
        >
          <div className="flex flex-col gap-1">
            <button
              className="text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                deleteRow(contextMenu.rowId);
                deleteSelectedRows();
                handleCloseContextMenu();
              }}
            >
              Delete
            </button>
            <button
              className="text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                handleDeleteAllRows();
                handleCloseContextMenu();
              }}
            >
              Delete All
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesDeliveryItems;
