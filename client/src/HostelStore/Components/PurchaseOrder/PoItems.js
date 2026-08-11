import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import { useLazyGetStyleItemMasterByIdQuery } from "../../../redux/services/StyleItemMasterService";
import { getUniqueArrayBySize } from "../../../Utils/helper";
import { ColorMaster, Gsm, Size, StyleItemMaster } from "..";
import {
  LookupField,
  TransactionGrid,
} from "../../../Basic/components/Reuseable";
import {
  focusFirstEditableFieldInRow,
  focusNextGridField,
} from "../../../Basic/components/Reuseable/gridNavigation";
import { VIEW } from "../../../icons";
import { findFromList } from "../../../Utils/helper";
import {
  createPurchaseOrderRow,
  createPurchaseOrderRows,
  DEFAULT_PURCHASE_ORDER_ROWS,
  resolveStyleItemPatch,
} from "./purchaseOrder.module";
import { ItemVariant } from "../../../Basic/components";

const formatINR = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined || amount === "")
    return "";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const PO_GRID_COLUMNS = [
  {
    key: "serial",
    label: "S.No",
    className: "w-12 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "itemVariantId",
    label: (
      <>
        Description of Goods<span className="text-red-500">*</span>
      </>
    ),
    className: "w-72 px-2 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "hsnId",
    label: (
      <>
        HSN<span className="text-red-500">*</span>
      </>
    ),
    className: "w-20 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "printingDesignId",
    label: "Printing Design",
    className: "w-36 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "sizeId",
    label: "Size",
    className: "w-32 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "colorId",
    label: "Color",
    className: "w-36 px-4 py-2 text-center font-medium text-[11px]",
  },

  {
    key: "uomId",
    label: (
      <>
        UOM<span className="text-red-500">*</span>
      </>
    ),
    className: "w-20 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "qty",
    label: (
      <>
        Quantity<span className="text-red-500">*</span>
      </>
    ),
    className: "w-20 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "price",
    label: (
      <>
        Price<span className="text-red-500">*</span>
      </>
    ),
    className: "w-20 px-1 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "gross",
    label: "Gross Amount",
    className: "w-20 px-1 py-2 text-center font-medium text-[11px]",
  },

  {
    key: "tax",
    label: "Tax",
    className: "w-8 px-1 py-2 text-center font-medium text-[11px]",
  },
  // {
  //   key: "netAmount",
  //   label: "Net Amount",
  //   className: "w-20 px-1 py-2 text-center font-medium text-[11px]",
  // },
  {
    key: "mrpPrice",
    label: "MRP Price",
    className: "w-20 px-1 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "print",
    label: "Print",
    className: "w-10 px-1 py-2 text-center font-medium text-[11px]",
  },
];

const PoItems = ({
  id,
  poItems,
  enrichedPoItems,
  setPoItems,
  readOnly,
  styleItemList,
  uomList,
  taxTemplateId,
  isNewVersion,
  quoteVersion,
  itemGroupList,
  sizeList,
  colorList,
  termsRef,
  gsmList,
  isSupplierOutside,
  itemVariantList,
  searchPoType,
  onPrintQrCode,
  canInward = false,
}) => {
  const gridWrapperRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const effectiveQuoteVersion =
    quoteVersion ||
    // ✅ If quoteVersion is empty, derive from the items themselves (use max version)
    Math.max(
      ...poItems
        .map((i) => parseInt(i.quoteVersion))
        .filter((v) => !isNaN(v) && v > 0),
      0,
    ) ||
    "";
  const isVisibleRow = (row) => {
    if (!id) return true;
    if (isNewVersion) return row.quoteVersion === "New";

    // ✅ Use effectiveQuoteVersion instead of quoteVersion
    if (!effectiveQuoteVersion) return row.quoteVersion !== "New";

    return parseInt(row.quoteVersion) === parseInt(effectiveQuoteVersion);
  };

  const visibleRows = poItems
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => isVisibleRow(row));

  const syncRowPatch = (index, patch) => {
    setPoItems((prevRows) => {
      const newRows = structuredClone(prevRows);
      newRows[index] = { ...newRows[index], ...patch };
      return newRows;
    });
  };

  const handleInputChange = async (value, index, field) => {
    // clone first
    const newRows = structuredClone(poItems);
    if (field === "itemVariantId") {
      // 1️⃣ update immediately
      newRows[index].itemVariantId = value;

      // Auto-fill HSN and UOM based on the variant selection
      const variant = itemVariantList?.data?.find((v) => v.id === value);
      if (variant) {
        if (variant.hsnId) {
          newRows[index].hsnId = variant.hsnId;
          if (variant.Hsn && variant.Hsn.tax !== undefined) {
            newRows[index].taxPercent = variant.Hsn.tax;
          }
        }
        if (variant.uomId) newRows[index].uomId = variant.uomId;
      }

      setPoItems([...newRows]); // 🔥 maintain UI instantly
      return; // stop here
    }
    // normal fields
    newRows[index][field] = value;

    // Auto-fill price when all four variant details are selected
    if (
      ["itemVariantId", "printingDesignId", "sizeId", "colorId"].includes(field)
    ) {
      const row = newRows[index];
      if (
        row.itemVariantId &&
        row.printingDesignId &&
        row.sizeId &&
        row.colorId
      ) {
        const variant = itemVariantList?.data?.find(
          (v) => v.id === row.itemVariantId,
        );
        if (variant) {
          const details = variant.ItemVariantMasterDetails || [];
          const match = details.find(
            (d) =>
              d.printingDesignId === row.printingDesignId &&
              d.sizeId === row.sizeId &&
              d.colorId === row.colorId,
          );
          if (match && match.price) {
            row.price = match.price;
            row.mrpPrice = match.mrpPrice;
          }
        }
      }
    }

    setPoItems([...newRows]);
  };

  const addRow = () => {
    setPoItems((prev) => [
      ...prev,
      createPurchaseOrderRow(
        id
          ? isNewVersion
            ? "New"
            : effectiveQuoteVersion // ✅
          : effectiveQuoteVersion,
      ),
    ]);
  };

  const deleteRow = (rowIndex) => {
    setPoItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((_, index) => index !== parseInt(rowIndex));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setPoItems(
      createPurchaseOrderRows(
        DEFAULT_PURCHASE_ORDER_ROWS,
        id ? (isNewVersion ? "New" : quoteVersion) : quoteVersion,
      ),
    );
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

  const deleteSelectedRows = () => {
    setPoItems((rows) =>
      rows.filter((row) => !(row.selected && (row.stockQty ?? 0) === 0)),
    );
    setContextMenu(null);
  };

  useEffect(() => {
    setPoItems((prev) => {
      const requiredRows = DEFAULT_PURCHASE_ORDER_ROWS;

      if (!id) {
        if (prev.length >= requiredRows) return prev;
        return [
          ...prev,
          ...createPurchaseOrderRows(
            requiredRows - prev.length,
            effectiveQuoteVersion,
          ),
        ];
      }

      const localVisibleRows = prev.filter((row) => isVisibleRow(row));
      const missing = requiredRows - localVisibleRows.length;
      if (missing <= 0) return prev;

      return [
        ...prev,
        ...createPurchaseOrderRows(
          missing,
          isNewVersion ? "New" : effectiveQuoteVersion, // ✅
        ),
      ];
    });
  }, [id, isNewVersion, effectiveQuoteVersion, setPoItems]);

  useEffect(() => {
    if (!isNewVersion) return;

    setPoItems((prev) => [
      ...prev.filter((item) => item.quoteVersion !== "New"),
      ...prev
        .filter(
          (item) => parseInt(item.quoteVersion) === parseInt(quoteVersion),
        )
        .map((item) => ({ ...item, quoteVersion: "New" })),
    ]);
  }, [isNewVersion, quoteVersion, setPoItems]);

  const focusNextRowFromTaxModal = (originalRowIndex) => {
    const visibleRowIndex = visibleRows.findIndex(
      (item) => item.originalIndex === originalRowIndex,
    );

    const focusVisibleRow = (targetVisibleRowIndex) => {
      const tableBody = gridWrapperRef.current?.querySelector("tbody");
      const targetRow =
        tableBody?.querySelectorAll("tr")?.[targetVisibleRowIndex];

      if (targetRow) {
        focusFirstEditableFieldInRow(targetRow);
      }
    };

    if (visibleRowIndex >= 0 && visibleRowIndex < visibleRows.length - 1) {
      window.setTimeout(() => {
        focusVisibleRow(visibleRowIndex + 1);
      }, 80);
      return;
    }

    addRow();

    window.setTimeout(() => {
      focusVisibleRow(visibleRows.length);
    }, 120);
  };

  const handleGridEnterNavigation = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    event.stopPropagation();

    focusNextGridField({
      currentElement: event.target,
      onReachGridEnd: addRow,
    });
  };

  const footer = (
    <tr className="bg-gray-50 h-6 font-medium text-gray-800 text-[12px]">
      <td
        className="text-right px-4 border border-gray-300 font-medium"
        colSpan={7}
      >
        Total
      </td>
      <td className="text-right border border-gray-300 px-1 font-medium">
        {visibleRows
          .reduce((sum, item) => sum + (Number(item.row.qty) || 0), 0)
          .toFixed(2)}
      </td>
      <td className="text-right border border-gray-300 px-1 font-medium">
        {formatINR(
          visibleRows.reduce(
            (sum, item) => sum + (Number(item.row.price) || 0),
            0,
          ),
        )}
      </td>
      <td className="text-right border border-gray-300 px-1 font-medium">
        {formatINR(
          visibleRows.reduce((sum, item) => {
            const qty = parseFloat(item.row.qty) || 0;
            const price = parseFloat(item.row.price) || 0;
            return sum + qty * price;
          }, 0),
        )}
      </td>

      <td colSpan={3} className="border border-gray-300"></td>
      {/* <td className="text-right border border-gray-300 px-1 font-medium">
        {formatINR(
          visibleRows.reduce((sum, item) => {
            const netAmount =
              enrichedPoItems?.[item.originalIndex]?.totals?.net || 0;
            return sum + netAmount;
          }, 0),
        )}
      </td> */}
    </tr>
  );

  return (
    <>
      <Modal
        isOpen={Number.isInteger(currentSelectedIndex)}
        onClose={() => {
          setCurrentSelectedIndex("");
        }}
      >
        <TaxDetailsFullTemplate
          readOnly={readOnly}
          taxTypeId={taxTemplateId}
          currentIndex={currentSelectedIndex}
          setCurrentSelectedIndex={setCurrentSelectedIndex}
          poItems={enrichedPoItems || poItems}
          handleInputChange={handleInputChange}
          id={id}
          isNewVersion={isNewVersion}
          onCloseFocus={focusNextRowFromTaxModal}
          isSupplierOutside={isSupplierOutside}
        />
      </Modal>

      <div ref={gridWrapperRef} className="h-full">
        <TransactionGrid
          title=""
          columns={PO_GRID_COLUMNS}
          rows={visibleRows}
          footer={footer}
          getRowKey={(item) =>
            `${item.row.quoteVersion || "draft"}-${item.originalIndex}`
          }
          getRowClassName={(_, index) =>
            `${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 cursor-pointer h-6`
          }
          onRowContextMenu={(e, item) => {
            if (!readOnly) {
              handleRightClick(e, item.originalIndex);
            }
          }}
          renderRow={(item, index) => {
            const row = item.row;
            const rowIndex = item.originalIndex;

            return (
              <>
                <td
                  data-grid-row={index}
                  data-grid-col={0}
                  className="w-12 border border-gray-300 text-[11px] text-center"
                >
                  {index + 1}
                </td>
                <td className="grid-editable-cell border-blue-gray-200 text-[11px] border border-gray-300 text-left">
                  <FxSelectWithAdd
                    inputId={`itemVariantId-input-${index}`}
                    value={row.itemVariantId}
                    onChange={(val) =>
                      handleInputChange(val, rowIndex, "itemVariantId")
                    }
                    options={(itemVariantList?.data || [])
                      .filter((item) => (id ? true : item.active))
                      .map((item) => ({
                        label:
                          item.styleMaster?.modelName?.name ||
                          `Variant ${item.id}`,
                        value: item.id,
                      }))}
                    readOnly={readOnly}
                    placeholder=""
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        handleInputChange("", rowIndex, "itemVariantId");
                      }
                    }}
                    addNew={true}
                    childComponent={ItemVariant}
                    addNewModalWidth="w-[74%] h-[77%]"
                    // nextRef={vehicleRef}
                  />
                </td>
                <td className="border border-gray-300 px-2 text-[11px]  text-center">
                  <span className="block truncate text-[11px]  text-right pr-2">
                    {(() => {
                      const variant = itemVariantList?.data?.find(
                        (v) => v.id === row.itemVariantId,
                      );
                      return variant?.Hsn?.name || "";
                    })()}
                  </span>
                </td>
                <td className="grid-editable-cell border-blue-gray-200 border border-gray-300 text-[11px] text-left">
                  <FxSelect
                    value={row.printingDesignId}
                    onChange={(val) =>
                      handleInputChange(val, rowIndex, "printingDesignId")
                    }
                    options={(() => {
                      const variant = itemVariantList?.data?.find(
                        (v) => v.id === row.itemVariantId,
                      );
                      const details = variant?.ItemVariantMasterDetails || [];
                      const uniqueDesigns = [];
                      const map = new Map();
                      for (const item of details) {
                        if (
                          item.printingDesign &&
                          !map.has(item.printingDesign.id)
                        ) {
                          map.set(item.printingDesign.id, true);
                          uniqueDesigns.push({
                            label: item.printingDesign.name,
                            value: item.printingDesign.id,
                          });
                        }
                      }
                      return uniqueDesigns;
                    })()}
                    readOnly={readOnly}
                    placeholder=""
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        handleInputChange("", rowIndex, "printingDesignId");
                      }
                    }}
                  />
                </td>
                <td className="grid-editable-cell border-blue-gray-200 border border-gray-300 text-[11px] ">
                  <FxSelectWithAdd
                    value={row.sizeId}
                    onChange={(val) =>
                      handleInputChange(val, rowIndex, "sizeId")
                    }
                    options={(() => {
                      const variant = itemVariantList?.data?.find(
                        (v) => v.id === row.itemVariantId,
                      );
                      const details = variant?.ItemVariantMasterDetails || [];
                      const uniqueSizes = [];
                      const map = new Map();
                      for (const item of details) {
                        if (
                          item.printingDesignId === row.printingDesignId &&
                          item.size &&
                          !map.has(item.size.id)
                        ) {
                          // Filter active status based on 'id' prop of InwardItems
                          if (!id && item.size.active === false) continue;

                          map.set(item.size.id, true);
                          uniqueSizes.push({
                            label: item.size.name,
                            value: item.size.id,
                          });
                        }
                      }
                      return uniqueSizes;
                    })()}
                    readOnly={readOnly}
                    placeholder=""
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        handleInputChange("", rowIndex, "sizeId");
                      }
                    }}
                    // addNew={true}
                    // childComponent={Size}
                    addNewModalWidth="w-[30%] h-[45%]"
                  />
                </td>
                <td className="grid-editable-cell border-blue-gray-200 border border-gray-300 text-[11px] ">
                  <FxSelectWithAdd
                    value={row.colorId}
                    onChange={(val) =>
                      handleInputChange(val, rowIndex, "colorId")
                    }
                    options={(() => {
                      const variant = itemVariantList?.data?.find(
                        (v) => v.id === row.itemVariantId,
                      );
                      const details = variant?.ItemVariantMasterDetails || [];
                      const uniqueColors = [];
                      const map = new Map();
                      for (const item of details) {
                        if (
                          item.printingDesignId === row.printingDesignId &&
                          item.sizeId === row.sizeId &&
                          item.color &&
                          !map.has(item.color.id)
                        ) {
                          // Filter active status based on 'id' prop of InwardItems
                          if (!id && item.color.active === false) continue;

                          map.set(item.color.id, true);
                          uniqueColors.push({
                            label: item.color.name,
                            value: item.color.id,
                          });
                        }
                      }
                      return uniqueColors;
                    })()}
                    readOnly={readOnly}
                    placeholder=""
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        handleInputChange("", rowIndex, "colorId");
                      }
                    }}
                    // addNew={true}
                    // childComponent={ColorMaster}
                    addNewModalWidth="w-[30%] h-[45%]"
                  />
                </td>

                <td className="grid-editable-cell border-blue-gray-200 border border-gray-300 px-2 text-[11px] text-slate-700">
                  <FxSelectWithAdd
                    inputId={`uomId-input-${index}`}
                    value={row.uomId}
                    onChange={(val) =>
                      handleInputChange(val, rowIndex, "uomId")
                    }
                    options={(uomList?.data || [])
                      .filter((item) => (id ? true : item.active))
                      .map((item) => ({
                        label: item?.name,
                        value: item?.id,
                      }))}
                    readOnly={
                      readOnly ||
                      !!itemVariantList?.data?.find(
                        (v) => v.id === row.itemVariantId,
                      )?.uomId
                    }
                    placeholder=""
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        handleInputChange("", rowIndex, "uomId");
                      }
                    }}
                    addNew={true}
                    childComponent={ItemVariant}
                    addNewModalWidth="w-[74%] h-[77%]"
                    // nextRef={vehicleRef}
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={4}
                  data-grid-editable="true"
                  className="grid-editable-cell border-blue-gray-200 text-[11px] border border-gray-300 text-right"
                >
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-transparent px-1 text-right table-data-input disabled:bg-transparent"
                    onFocus={(event) => {
                      event.target.select();
                      setFocusedField(`${index}-qty`);
                    }}
                    value={
                      focusedField === `${index}-qty`
                        ? (row?.qty ?? "")
                        : row?.qty
                          ? Number(row.qty).toFixed(2)
                          : ""
                    }
                    onChange={(event) =>
                      handleInputChange(event.target.value, rowIndex, "qty")
                    }
                    onBlur={(event) => {
                      const value = event.target.value;
                      handleInputChange(
                        value ? Number(value).toFixed(2) : "",
                        rowIndex,
                        "qty",
                      );
                      setFocusedField(null);
                    }}
                    onKeyDown={handleGridEnterNavigation}
                    disabled={readOnly || (row.stockQty ?? 0) > 0}
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={5}
                  data-grid-editable="true"
                  className="grid-editable-cell border-blue-gray-200 text-[11px] border border-gray-300 text-right"
                >
                  <input
                    type={focusedField === `${index}-price` ? "number" : "text"}
                    min="0"
                    className="w-full bg-transparent px-1 text-right table-data-input disabled:bg-transparent"
                    onFocus={(event) => {
                      event.target.select();
                      setFocusedField(`${index}-price`);
                    }}
                    value={
                      focusedField === `${index}-price`
                        ? (row?.price ?? "")
                        : row?.price
                          ? formatINR(Number(row.price))
                          : ""
                    }
                    onChange={(event) =>
                      handleInputChange(event.target.value, rowIndex, "price")
                    }
                    onBlur={(event) => {
                      const value = event.target.value;
                      handleInputChange(
                        value ? Number(value).toFixed(2) : "",
                        rowIndex,
                        "price",
                      );
                      setFocusedField(null);
                    }}
                    onKeyDown={handleGridEnterNavigation}
                    disabled={readOnly}
                  />
                </td>
                <td className="border border-gray-300 text-[11px]">
                  <input
                    type="text"
                    onFocus={(event) => event.target.select()}
                    className="w-full rounded bg-transparent px-1 text-right disabled:bg-transparent"
                    value={
                      !row.qty || !row.price
                        ? "0.00"
                        : formatINR(parseFloat(row.qty) * parseFloat(row.price))
                    }
                    disabled={true}
                  />
                </td>

                <td
                  data-grid-row={index}
                  data-grid-col={6}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px]"
                >
                  <button
                    disabled={!row?.itemVariantId}
                    className="text-center rounded w-full table-data-input"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.stopPropagation();

                        if (!taxTemplateId) {
                          toast.info("Please select Tax Type", {
                            position: "top-center",
                          });
                          return;
                        }

                        setCurrentSelectedIndex(rowIndex);
                      }
                    }}
                    onClick={() => {
                      if (!taxTemplateId) {
                        return toast.info("Please select Tax Type", {
                          position: "top-center",
                        });
                      }
                      setCurrentSelectedIndex(rowIndex);
                    }}
                  >
                    {VIEW}
                  </button>
                </td>
                {/* <td className="border border-gray-300 text-[11px]">
                  <input
                    type="text"
                    onFocus={(event) => event.target.select()}
                    className="w-full rounded bg-transparent px-1 text-right disabled:bg-transparent"
                    value={
                      enrichedPoItems?.[rowIndex]?.totals?.net
                        ? formatINR(enrichedPoItems[rowIndex].totals.net)
                        : "0.00"
                    }
                    disabled={true}
                  />
                </td> */}
                <td
                  data-grid-row={index}
                  data-grid-col={5}
                  data-grid-editable="true"
                  className="grid-editable-cell border-blue-gray-200 text-[11px] border border-gray-300 text-right"
                >
                  <input
                    type={
                      focusedField === `${index}-mrpPrice` ? "number" : "text"
                    }
                    min="0"
                    className="w-full bg-transparent px-1 text-right table-data-input disabled:bg-transparent"
                    onFocus={(event) => {
                      event.target.select();
                      setFocusedField(`${index}-mrpPrice`);
                    }}
                    value={
                      focusedField === `${index}-mrpPrice`
                        ? (row?.mrpPrice ?? "")
                        : row?.mrpPrice
                          ? formatINR(Number(row.mrpPrice))
                          : ""
                    }
                    onChange={(event) =>
                      handleInputChange(
                        event.target.value,
                        rowIndex,
                        "mrpPrice",
                      )
                    }
                    onBlur={(event) => {
                      const value = event.target.value;
                      handleInputChange(
                        value ? Number(value).toFixed(2) : "",
                        rowIndex,
                        "mrpPrice",
                      );
                      setFocusedField(null);
                    }}
                    onKeyDown={handleGridEnterNavigation}
                    disabled={readOnly}
                  />
                </td>
                <td className="border border-gray-300 text-[16px] text-center">
                  {row?.id && id && onPrintQrCode && (
                    <button
                      type="button"
                      className={
                        canInward
                          ? "cursor-pointer text-blue-600 hover:text-blue-800"
                          : "text-gray-400 cursor-not-allowed"
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (canInward) {
                          onPrintQrCode(row.id);
                        }
                      }}
                      title={
                        canInward
                          ? "Print QR Code"
                          : "QR Printing unavailable until PO is sent to supplier"
                      }
                      disabled={!canInward}
                    >
                      🖨️
                    </button>
                  )}
                </td>
              </>
            );
          }}
        />
      </div>

      {contextMenu ? (
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
      ) : null}
    </>
  );
};

export default PoItems;
