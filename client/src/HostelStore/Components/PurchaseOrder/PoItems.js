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

const PO_GRID_COLUMNS = [
  {
    key: "serial",
    label: "S.No",
    className: "w-12 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "styleItemId",
    label: (
      <>
        Description of Goods<span className="text-red-500">*</span>
      </>
    ),
    className: "w-80 px-2 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "sizeId",
    label: "Size",
    className: "w-20 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "colorId",
    label: "Color",
    className: "w-32 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "gsmId",
    label: "GSM",
    className: "w-20 px-4 py-2 text-center font-medium text-[11px]",
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
    className: "w-24 px-4 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "price",
    label: (
      <>
        Price<span className="text-red-500">*</span>
      </>
    ),
    className: "w-24 px-1 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "gross",
    label: "Gross",
    className: "w-28 px-1 py-2 text-center font-medium text-[11px]",
  },
  {
    key: "tax",
    label: "Tax",
    className: "w-20 px-1 py-2 text-center font-medium text-[11px]",
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
}) => {
  const gridWrapperRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [triggerGetStyleItem] = useLazyGetStyleItemMasterByIdQuery();
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

  const handleInputChange = (value, index, field) => {
    syncRowPatch(index, { [field]: value });
  };

  const handleStyleItemChange = (value, index) => {
    syncRowPatch(index, { styleItemId: value });
  };

  const handleStyleItemResolved = (patch, index) => {
    syncRowPatch(index, patch);
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
        colSpan={6}
      >
        Total
      </td>
      <td className="text-right border border-gray-300 px-1 font-medium">
        {visibleRows
          .reduce((sum, item) => sum + (Number(item.row.qty) || 0), 0)
          .toFixed(2)}
      </td>
      <td className="text-right border border-gray-300 px-1 font-medium">
        {visibleRows
          .reduce((sum, item) => sum + (Number(item.row.price) || 0), 0)
          .toFixed(2)}
      </td>
      <td className="text-right border border-gray-300 px-1 font-medium">
        {visibleRows
          .reduce((sum, item) => {
            const qty = parseFloat(item.row.qty) || 0;
            const price = parseFloat(item.row.price) || 0;
            return sum + qty * price;
          }, 0)
          .toFixed(2)}
      </td>
      <td className="border border-gray-300"></td>
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
          renderRow={(item, index) => {
            const row = item.row;
            const rowIndex = item.originalIndex;

            return (
              <>
                <td
                  data-grid-row={index}
                  data-grid-col={0}
                  className="w-12 border border-gray-300 text-[11px] text-center"
                  onContextMenu={(event) => {
                    if (!readOnly) {
                      handleRightClick(event, rowIndex);
                    }
                  }}
                >
                  {index + 1}
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={0}
                  data-grid-editable="true"
                  className="grid-editable-cell text-[11px] border border-gray-300 text-left"
                >
                  <LookupField
                    component={FxSelectWithAdd}
                    inputId={`styleItemId-input-${index}`}
                    value={row.styleItemId}
                    onChange={(value) => handleStyleItemChange(value, rowIndex)}
                    resolver={(styleItemId) =>
                      resolveStyleItemPatch({
                        styleItemId,
                        getStyleItem: triggerGetStyleItem,
                      })
                    }
                    onResolved={(patch) =>
                      handleStyleItemResolved(patch, rowIndex)
                    }
                    onError={() => {
                      toast.error("Style fetch failed", {
                        position: "top-center",
                      });
                    }}
                    options={(styleItemList?.data || [])
                      .filter((item) => (id ? true : item.active))
                      .map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                    // readOnly={id ? !isNewVersion : readOnly}
                    readOnly={readOnly}
                    placeholder=""
                    onBlur={() =>
                      handleInputChange(
                        row.styleItemId,
                        rowIndex,
                        "styleItemId",
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Delete") {
                        handleInputChange("", rowIndex, "styleItemId");
                      }
                    }}
                    addNew={true}
                    childComponent={StyleItemMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                    nextRef={termsRef}
                    advanceOnEnter
                    advanceOnSelect
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={1}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px]"
                >
                  <FxSelectWithAdd
                    value={row.sizeId}
                    onChange={(value) =>
                      handleInputChange(value, rowIndex, "sizeId")
                    }
                    options={getUniqueArrayBySize(
                      styleItemList?.data,
                      sizeList?.data,
                      "sizeId",
                      row.styleItemId,
                    )
                      .filter((item) => (id ? true : item.active))
                      .map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                    readOnly={readOnly}
                    placeholder=""
                    onBlur={() =>
                      handleInputChange(row.sizeId, rowIndex, "sizeId")
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Delete") {
                        handleInputChange("", rowIndex, "sizeId");
                      }
                    }}
                    addNew={true}
                    childComponent={Size}
                    addNewModalWidth="w-[30%] h-[45%]"
                    advanceOnEnter
                    advanceOnSelect
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={2}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px]"
                >
                  <FxSelectWithAdd
                    value={row.colorId}
                    onChange={(value) =>
                      handleInputChange(value, rowIndex, "colorId")
                    }
                    options={(colorList?.data || [])
                      .filter((item) => (id ? true : item.active))
                      .map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                    readOnly={readOnly}
                    placeholder=""
                    onBlur={() =>
                      handleInputChange(row.colorId, rowIndex, "colorId")
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Delete") {
                        handleInputChange("", rowIndex, "colorId");
                      }
                    }}
                    addNew={true}
                    childComponent={ColorMaster}
                    addNewModalWidth="w-[30%] h-[45%]"
                    advanceOnEnter
                    advanceOnSelect
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={3}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px]"
                >
                  <FxSelectWithAdd
                    value={row.gsmId}
                    onChange={(value) =>
                      handleInputChange(value, rowIndex, "gsmId")
                    }
                    options={(gsmList?.data || [])
                      .filter((item) => item.active)
                      .map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                    readOnly={readOnly}
                    placeholder=""
                    onBlur={() =>
                      handleInputChange(row.gsmId, rowIndex, "gsmId")
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Delete") {
                        handleInputChange("", rowIndex, "gsmId");
                      }
                    }}
                    advanceOnEnter
                    advanceOnSelect
                    addNew={true}
                    childComponent={Gsm}
                    addNewModalWidth="w-[30%] h-[45%]"
                  />
                </td>
                <td className="border border-gray-300 px-2 text-[11px] text-slate-700">
                  <span className="block truncate">
                    {findFromList(row.uomId, uomList?.data, "name") || ""}
                  </span>
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
                    type="number"
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
                          ? Number(row.price).toFixed(2)
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
                    type="number"
                    onFocus={(event) => event.target.select()}
                    className="w-full rounded bg-transparent px-1 text-right disabled:bg-transparent"
                    value={
                      !row.qty || !row.price
                        ? 0.0
                        : (parseFloat(row.qty) * parseFloat(row.price)).toFixed(
                            2,
                          )
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
                    disabled={!row?.styleItemId}
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
