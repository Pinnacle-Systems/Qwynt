import { useEffect, useRef, useState } from "react";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import PoItemsSelection from "./PoItemsSelection";
import { useLazyGetStyleItemMasterByIdQuery } from "../../../redux/services/StyleItemMasterService";
import { getUniqueArrayBySize } from "../../../Utils/helper";
import { ColorMaster, Size, StyleItemMaster } from "..";
import { VIEW } from "../../../icons";
import { toast } from "react-toastify";
import TaxDetailsFullTemplate from "./TaxDetailsFullTemplate";
import { ItemVariant } from "../../../Basic/components";
import { TransactionGrid } from "../../../Basic/components/Reuseable";
const InwardItems = ({
  id,
  inwardItems,
  setInwardItems,
  readOnly,
  params,
  styleItemList,
  uomList,
  hsnList,
  taxTemplateId,
  inwardType,
  supplierId,
  branchId,
  sizeList,
  colorList,
  setTempItems,
  tempItems,
  searchDocId,
  setSearchDocId,
  setSearchDocDate,
  searchDocDate,
  vehicleRef,
  fromPoId,
  receiptType,
  gsmList,
  isSupplierOutside,
  itemVariantList,
  setScannedQrCodes,
}) => {
  const EMPTY_ROW = {
    itemVariantId: "",
    styleId: "",
    hsnId: "",
    uomId: "",
    inwardQty: "",
    poQty: "",
    poId: "",
    alreadyInwardQty: "",
    alreadyReturnQty: "",
    alreadyCancelQty: "",
    balQty: "",
    itemGroupId: "",
    sizeId: "",
    colorId: "",
    printingDesignId: "",
    gsmId: "",
  };
  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [fillGrid, setFillGrid] = useState(false);
  const [qrCodeModalData, setQrCodeModalData] = useState(null);
  const [qrCodeContextMenu, setQrCodeContextMenu] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const actionRefs = useRef([]);

  const skipFocusRef = useRef(false);

  const addRow = () => {
    const newRow = {
      itemVariantId: "",
      styleId: "",

      hsnId: "",
      uomId: "",
      inwardQty: "",
      poQty: "",
      poId: "",
      itemGroupId: "",
      sizeId: "",
      colorId: "",
      printingDesignId: "",
      gsmId: "",
    };
    setInwardItems([...inwardItems, newRow]);
  };
  const [triggerGetStyleItem, { data: styleData }] =
    useLazyGetStyleItemMasterByIdQuery();
  const handleInputChange = async (value, index, field) => {
    // clone first
    const newRows = structuredClone(inwardItems);
    if (field === "itemVariantId") {
      // 1️⃣ update immediately
      newRows[index].itemVariantId = value;
      setInwardItems([...newRows]); // 🔥 maintain UI instantly

      // try {
      //   // 2️⃣ fetch style data
      //   const response = await triggerGetStyleItem(value).unwrap();

      //   // 3️⃣ update fabricId
      //   newRows[index].hsnId = response?.data?.hsnId;
      //   newRows[index].itemGroupId = response?.data?.itemGroupId;
      //   newRows[index].sizeId = response?.data?.sizeId;
      //   newRows[index].colorId = response?.data?.colorId;
      //   newRows[index].uomId = response?.data?.uomId;
      //   // 4️⃣ update again after API fetch
      //   setInwardItems([...newRows]);
      // } catch (e) {
      //   console.error("Style fetch failed", e);
      // }

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
            // Optionally fill other fields from the details if they exist
            if (match.uomId) row.uomId = match.uomId;
            if (match.hsnId) row.hsnId = match.hsnId;
            if (match.gsmId) row.gsmId = match.gsmId;
          }
        }
      }
    }

    setInwardItems([...newRows]);
  };
  const deleteRow = (id) => {
    setInwardItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setInwardItems(Array.from({ length: 20 }, () => ({ ...EMPTY_ROW })));
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

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleQrCodeRightClick = (event, qrIndex, qrCodeString) => {
    event.preventDefault();
    setQrCodeContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      index: qrIndex,
      qrCodeString: qrCodeString,
    });
  };

  const handleCloseQrCodeContextMenu = () => {
    setQrCodeContextMenu(null);
  };

  const deleteSelectedRows = () => {
    setInwardItems((rows) =>
      rows.filter((r) => !(r.selected && (r.stockQty ?? 0) === 0)),
    );
    setContextMenu(null);
  };
  const showFillButton = inwardType !== "DIRECT_INWARD" && !id && !fromPoId;

  useEffect(() => {
    // If edit mode (id exists)
    if (id && inwardItems?.length > 0) {
      const requiredRows = 20;
      const missingRows = requiredRows - inwardItems.length;

      if (missingRows > 0) {
        setInwardItems([
          ...inwardItems,
          ...Array.from({ length: missingRows }, () => ({ ...EMPTY_ROW })),
        ]);
      }
    }

    // If create mode (no id)
    if (!id && (!inwardItems || inwardItems.length === 0)) {
      setInwardItems(Array.from({ length: 20 }, () => ({ ...EMPTY_ROW })));
    }
  }, [id, inwardItems]);

  const focusActionCell = useEffect(() => {
    return () => {
      clearTimeout(window.focusTimeout);
    };
  }, []);

  const handleRemoveQrCode = (qrIndexToRemove, qrCodeString) => {
    if (!qrCodeModalData) return;
    const { rowIndex, qrCodes } = qrCodeModalData;

    // 1. Remove from local modal state
    const updatedQrCodes = qrCodes.filter((_, idx) => idx !== qrIndexToRemove);
    setQrCodeModalData({ rowIndex, qrCodes: updatedQrCodes });

    // 2. Remove from parent form's scannedQrCodes
    if (setScannedQrCodes) {
      setScannedQrCodes((prev) => prev.filter((code) => code !== qrCodeString));
    }

    // 3. Update inwardItems row (reduce qty and update qrCodes array)
    setInwardItems((prevItems) => {
      const newItems = [...prevItems];
      const row = { ...newItems[rowIndex] };
      row.qrCodes = updatedQrCodes;
      row.inwardQty = Math.max(0, (Number(row.inwardQty) || 0) - 1);
      newItems[rowIndex] = row;
      return newItems;
    });
  };

  const handleRemoveAllQrCodes = () => {
    if (!qrCodeModalData) return;
    const { rowIndex, qrCodes } = qrCodeModalData;

    // 1. Remove all from parent form's scannedQrCodes
    if (setScannedQrCodes) {
      const qrStringsToRemove = qrCodes.map((q) => q?.qrCode || q);
      setScannedQrCodes((prev) =>
        prev.filter((code) => !qrStringsToRemove.includes(code)),
      );
    }

    // 2. Clear local modal state
    setQrCodeModalData({ rowIndex, qrCodes: [] });

    // 3. Update inwardItems row (reduce qty by total amount and clear array)
    setInwardItems((prevItems) => {
      const newItems = [...prevItems];
      const row = { ...newItems[rowIndex] };
      const totalRemoved = row.qrCodes?.length || 0;
      row.qrCodes = [];
      row.inwardQty = Math.max(0, (Number(row.inwardQty) || 0) - totalRemoved);
      newItems[rowIndex] = row;
      return newItems;
    });
  };

  const columns = [
    {
      key: "sno",
      label: "S.No",
      className: "w-12 px-2 py-2 text-center font-medium text-[11px]",
    },
    ...(inwardType !== "DIRECT_INWARD"
      ? [
          {
            key: "poNo",
            label: "PO No",
            className: "w-28 px-2 py-2 text-center font-medium text-[11px]",
          },
        ]
      : []),
    {
      key: "desc",
      label: (
        <>
          Description of Goods<span className="text-red-500">*</span>
        </>
      ),
      className: "w-80 px-2 py-2 text-center font-medium text-[11px]",
    },
    {
      key: "styleId",
      label: "Style No",
      className: "w-24 px-2 py-2 text-center font-medium text-[11px]",
    },
    {
      key: "hsn",
      label: "HSN",
      className: "w-28 px-2 py-2 text-center font-medium text-[11px]",
    },
    {
      key: "print",
      label: "Printing Design",
      className: "w-44 px-2 py-2 text-center font-medium text-[11px]",
    },
    {
      key: "size",
      label: "Size",
      className: "w-32 px-2 py-2 text-center font-medium text-[11px]",
    },
    {
      key: "color",
      label: "Color",
      className: "w-44 px-2 py-2 text-center font-medium text-[11px]",
    },
    {
      key: "uom",
      label: "UOM",
      className: "w-20 px-2 py-2 text-center font-medium text-[11px]",
    },
    ...(inwardType !== "DIRECT_INWARD"
      ? [
          {
            key: "poQty",
            label: "PO Qty",
            className: "w-20 px-2 py-2 text-center font-medium text-[11px]",
          },
        ]
      : []),
    ...(inwardType !== "DIRECT_INWARD"
      ? [
          {
            key: "alreadyInwardQty",
            label: "Already Inward Qty",
            className: "w-32 px-2 py-2 text-center font-medium text-[11px]",
          },
        ]
      : []),
    ...(inwardType !== "DIRECT_INWARD"
      ? [
          {
            key: "balQty",
            label: "Balance Qty",
            className: "w-24 px-2 py-2 text-center font-medium text-[11px]",
          },
        ]
      : []),
    {
      key: "inwardQty",
      label: (
        <>
          Inward Qty<span className="text-red-500">*</span>
        </>
      ),
      className: "w-24 px-2 py-2 text-center font-medium text-[11px]",
    },
    {
      key: "qrCodes",
      label: "QR Codes",
      className: "w-20 px-2 py-2 text-center font-medium text-[11px]",
    },
  ];

  const qrColumns = [
    {
      key: "sno",
      label: "S.No",
      className: "w-16 px-2 py-2 text-center font-medium text-[11px]",
    },
    {
      key: "qrCode",
      label: "QR Code",
      className: "px-2 py-2 text-left font-medium text-[11px]",
    },
  ];

  return (
    <>
      <Modal
        isOpen={!!qrCodeModalData}
        onClose={() => setQrCodeModalData(null)}
        widthClass="w-[60%] h-[60%]"
      >
        <div className="p-4 bg-white rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-700">
              Scanned QR Codes
            </h2>
          </div>
          <div className="max-h-60 overflow-y-auto border rounded-md">
            {qrCodeModalData &&
            qrCodeModalData.qrCodes &&
            qrCodeModalData.qrCodes.length > 0 ? (
              <TransactionGrid
                title=""
                columns={qrColumns}
                rows={qrCodeModalData.qrCodes}
                getRowClassName={(_, index) =>
                  `${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 cursor-pointer h-6`
                }
                onRowContextMenu={(e, item, index) => {
                  if (!readOnly) {
                    const row = inwardItems[qrCodeModalData.rowIndex];
                    if (!id || !row?.id) {
                      handleQrCodeRightClick(e, index, item?.qrCode);
                    }
                  }
                }}
                renderRow={(row, index) => (
                  <>
                    <td className="border border-gray-300 text-[11px] text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 text-[11px] font-mono text-left px-2">
                      {row?.qrCode}
                    </td>
                  </>
                )}
                footer={null}
              />
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">
                No QR codes scanned.
              </p>
            )}
            {qrCodeContextMenu && (
              <div
                style={{
                  position: "fixed",
                  top: `${qrCodeContextMenu.mouseY - 20}px`,
                  left: `${qrCodeContextMenu.mouseX + 20}px`,
                  boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                  padding: "8px",
                  borderRadius: "4px",
                  zIndex: 1100,
                }}
                className="bg-gray-100"
                onMouseLeave={handleCloseQrCodeContextMenu}
              >
                <div className="flex flex-col gap-1">
                  <button
                    className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                    onClick={() => {
                      handleRemoveQrCode(
                        qrCodeContextMenu.index,
                        qrCodeContextMenu.qrCodeString,
                      );
                      handleCloseQrCodeContextMenu();
                    }}
                  >
                    Delete
                  </button>
                  <button
                    className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                    onClick={() => {
                      handleRemoveAllQrCodes();
                      handleCloseQrCodeContextMenu();
                    }}
                  >
                    Delete All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
          inwardItems={inwardItems}
          handleInputChange={handleInputChange}
          id={id}
          onCloseFocus={focusActionCell}
          isSupplierOutside={isSupplierOutside}
        />
      </Modal>
      <Modal
        isOpen={fillGrid}
        onClose={() => {
          setFillGrid(false);

          setTimeout(() => {
            const firstInput = document.querySelector("#inwardQty-input-0");
            if (firstInput) {
              firstInput.focus();
              firstInput.select(); // optional UX 🔥
            }
          }, 100); // small delay important
        }}
        widthClass={"w-[98%] h-[90%]"}
      >
        <PoItemsSelection
          supplierId={supplierId}
          inwardItems={inwardItems}
          setInwardItems={setInwardItems}
          branchId={branchId}
          inwardType={inwardType}
          setTempItems={setTempItems}
          tempItems={tempItems}
          searchDocId={searchDocId}
          setSearchDocId={setSearchDocId}
          setSearchDocDate={setSearchDocDate}
          searchDocDate={searchDocDate}
          onClose={() => setFillGrid(false)}
        />
      </Modal>
      <div className="h-full">
        {/* <div className="flex justify-between items-center my-2 shrink-0">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
          {showFillButton && (
            <button
              className={`font-bold bord text-sm bg-blue-500 rounded-md text-white px-2`}
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
              Fill Po Items
            </button>
          )}
          {fromPoId && !id && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              Auto-filled from PO
            </span>
          )}
        </div> */}
        <TransactionGrid
          title=""
          columns={columns}
          rows={inwardItems || []}
          getRowClassName={(_, index) =>
            `${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 cursor-pointer h-6`
          }
          onRowContextMenu={(e, item, index) => {
            if (!readOnly && (!id || !item?.id)) {
              handleRightClick(e, index, "");
            }
          }}
          renderRow={(row, index) => (
            <>
              <td
                data-grid-row={index}
                data-grid-col={0}
                className="border border-gray-300 text-[11px]  text-center"
              >
                {index + 1}
              </td>
              {inwardType !== "DIRECT_INWARD" && (
                <td className="border border-gray-300 text-[11px] text-left px-1">
                  {row.Po?.docId}
                </td>
              )}
              <td className="grid-editable-cell border-blue-gray-200 text-[11px] border border-gray-300 text-left">
                <FxSelectWithAdd
                  inputId={`itemVariantId-input-${index}`}
                  value={row.itemVariantId}
                  onChange={(val) =>
                    handleInputChange(val, index, "itemVariantId")
                  }
                  options={(itemVariantList?.data || [])
                    .filter((item) => (id ? true : item.active))
                    .map((item) => ({
                      label: item.styleMaster?.modelName?.name,
                      value: item.id,
                    }))}
                  readOnly={readOnly || inwardType !== "DIRECT_INWARD"}
                  placeholder=""
                  onBlur={() =>
                    handleInputChange(row.itemVariantId, index, "itemVariantId")
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "itemVariantId");
                    }
                  }}
                  addNew={true}
                  childComponent={ItemVariant}
                  addNewModalWidth="w-[74%] h-[77%]"
                  nextRef={vehicleRef}
                />
              </td>
              <td className="border border-gray-300 px-2 text-[11px]  text-center">
                <span className="block truncate text-[11px]  text-left pl-1">
                  {(() => {
                    const variant = itemVariantList?.data?.find(
                      (v) => v.id === row.itemVariantId,
                    );
                    return variant?.styleMaster?.styleNo || "";
                  })()}
                </span>
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
                    handleInputChange(val, index, "printingDesignId")
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
                  readOnly={readOnly || inwardType !== "DIRECT_INWARD"}
                  placeholder=""
                  onBlur={() =>
                    handleInputChange(
                      row.printingDesignId,
                      index,
                      "printingDesignId",
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "printingDesignId");
                    }
                  }}
                />
              </td>
              <td className="grid-editable-cell border-blue-gray-200 border border-gray-300 text-[11px] ">
                <FxSelectWithAdd
                  value={row.sizeId}
                  onChange={(val) => handleInputChange(val, index, "sizeId")}
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
                  readOnly={readOnly || inwardType !== "DIRECT_INWARD"}
                  placeholder=""
                  onBlur={() => handleInputChange(row.sizeId, index, "sizeId")}
                  onKeyDown={(e) => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "sizeId");
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
                  onChange={(val) => handleInputChange(val, index, "colorId")}
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
                  readOnly={readOnly || inwardType !== "DIRECT_INWARD"}
                  placeholder=""
                  onBlur={() =>
                    handleInputChange(row.colorId, index, "colorId")
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "colorId");
                    }
                  }}
                  // addNew={true}
                  // childComponent={ColorMaster}
                  addNewModalWidth="w-[30%] h-[45%]"
                />
              </td>

              <td className="grid-editable-cell border-blue-gray-200 border border-gray-300 text-[11px] ">
                <FxSelect
                  value={row.uomId}
                  onChange={(val) => handleInputChange(val, index, "uomId")}
                  options={(uomList?.data || [])
                    .filter((item) => (id ? true : item.active))
                    .map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                  readOnly={readOnly || inwardType !== "DIRECT_INWARD"}
                  placeholder=""
                  onBlur={() => handleInputChange(row.uomId, index, "uomId")}
                  onKeyDown={(e) => {
                    if (e.key === "Delete") {
                      handleInputChange("", index, "uomId");
                    }
                  }}
                />
              </td>
              {inwardType !== "DIRECT_INWARD" && (
                <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-right">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("", index, "poQty");
                      }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded px-1 w-full table-data-input"
                    onFocus={(e) => e.target.select()}
                    value={row?.poQty ? Number(row.poQty).toFixed(2) : ""}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "poQty")
                    }
                    onBlur={(e) => {
                      handleInputChange(e.target.value, index, "poQty");
                    }}
                    disabled={
                      readOnly ||
                      (row.stockQty ?? 0) > 0 ||
                      inwardType !== "DIRECT_INWARD"
                    }
                  />
                </td>
              )}
              {/* {inwardType !== "DIRECT_INWARD" && (
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "alreadyCancelQty");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={
                          row?.alreadyCancelQty
                            ? Number(row.alreadyCancelQty).toFixed(2)
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "alreadyCancelQty",
                          )
                        }
                        onBlur={(e) => {
                          handleInputChange(
                            e.target.value,
                            index,
                            "alreadyCancelQty",
                          );
                        }}
                        disabled={
                          readOnly ||
                          (row.stockQty ?? 0) > 0 ||
                          inwardType !== "DIRECT_INWARD"
                        }
                      />
                    </td>
                  )} */}
              {inwardType !== "DIRECT_INWARD" && (
                <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-right">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("", index, "alreadyInwardQty");
                      }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded px-1 w-full table-data-input"
                    onFocus={(e) => e.target.select()}
                    value={
                      row?.alreadyInwardQty
                        ? Number(row.alreadyInwardQty).toFixed(2)
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        index,
                        "alreadyInwardQty",
                      )
                    }
                    onBlur={(e) => {
                      handleInputChange(
                        e.target.value,
                        index,
                        "alreadyInwardQty",
                      );
                    }}
                    disabled={
                      readOnly ||
                      (row.stockQty ?? 0) > 0 ||
                      inwardType !== "DIRECT_INWARD"
                    }
                  />
                </td>
              )}
              {/* {inwardType !== "DIRECT_INWARD" && (
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "alreadyReturnQty");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={
                          row?.alreadyReturnQty
                            ? Number(row.alreadyReturnQty).toFixed(2)
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "alreadyReturnQty",
                          )
                        }
                        onBlur={(e) => {
                          handleInputChange(
                            e.target.value,
                            index,
                            "alreadyReturnQty",
                          );
                        }}
                        disabled={
                          readOnly ||
                          (row.stockQty ?? 0) > 0 ||
                          inwardType !== "DIRECT_INWARD"
                        }
                      />
                    </td>
                  )} */}
              {inwardType !== "DIRECT_INWARD" && (
                <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-right">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("", index, "balQty");
                      }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded px-1 w-full table-data-input"
                    onFocus={(e) => e.target.select()}
                    value={row?.balQty ? Number(row.balQty).toFixed(2) : ""}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "balQty")
                    }
                    onBlur={(e) => {
                      handleInputChange(e.target.value, index, "balQty");
                    }}
                    disabled={
                      readOnly ||
                      (row.stockQty ?? 0) > 0 ||
                      inwardType !== "DIRECT_INWARD"
                    }
                  />
                </td>
              )}
              <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-right">
                <input
                  id={`inwardQty-input-${index}`}
                  onKeyDown={(e) => {
                    if (e.code === "Minus" || e.code === "NumpadSubtract")
                      e.preventDefault();

                    if (e.key === "Delete") {
                      handleInputChange("", index, "inwardQty");
                    }
                    if (
                      inwardType !== "DIRECT_INWARD" ||
                      receiptType !== "AGAINST_INVOICE"
                    ) {
                    }
                    if (e.key === "Tab" && e.target.value === "") {
                      e.preventDefault(); // ← this was missing
                      vehicleRef.current?.focus();
                    }
                  }}
                  min={"0"}
                  type="number"
                  className="text-right rounded px-1 w-full table-data-input"
                  onFocus={(e) => {
                    e.target.select();
                    setFocusedField(`${index}-inwardQty`);
                  }}
                  value={
                    focusedField === `${index}-inwardQty`
                      ? (row?.inwardQty ?? "")
                      : row?.inwardQty
                        ? Number(row.inwardQty).toFixed(2)
                        : ""
                  }
                  onChange={(e) =>
                    handleInputChange(e.target.value, index, "inwardQty")
                  }
                  onBlur={(e) => {
                    const maxQty = row.balQty;
                    const minQty = row.alreadyReturnQty;

                    if (inwardType !== "Direct Inward") {
                      if (parseFloat(maxQty) < parseFloat(e.target.value)) {
                        e.target.value = "";
                        handleInputChange("", index, "inwardQty");
                        skipFocusRef.current = true; // 🚩 Swal will open, block focus
                        Swal.fire({
                          icon: "warning",
                          title: "Invalid Qty",
                          text: `Inward Qty cannot be More than Balance Qty! - ${maxQty}`,
                          confirmButtonText: "OK",
                          didClose: () => {
                            const currentInput = document.querySelector(
                              `#inwardQty-input-${index}`,
                            );
                            currentInput?.focus();
                          },
                        });
                        return;
                      }
                      if (parseFloat(e.target.value) < parseFloat(minQty)) {
                        e.target.value = "";
                        handleInputChange("", index, "inwardQty");
                        skipFocusRef.current = true;
                        Swal.fire({
                          icon: "warning",
                          title: "Invalid Qty",
                          text: `Inward Qty cannot be Less than Already Return Qty! - ${minQty}`,
                          confirmButtonText: "OK",
                          didClose: () => {
                            const currentInput = document.querySelector(
                              `#inwardQty-input-${index}`,
                            );
                            currentInput?.focus();
                          },
                        });
                        return;
                      }
                    }

                    // if (e.target.value == 0) {
                    //   skipFocusRef.current = true; // 🚩 Swal will open, block focus
                    //   Swal.fire({
                    //     icon: "warning",
                    //     title: "Invalid Qty",
                    //     text: `Minimum Qty is 1`,
                    //     confirmButtonText: "OK",
                    //   });
                    //   e.target.value = "";
                    //   return;
                    // }

                    const val = e.target.value;
                    handleInputChange(
                      val ? Number(val).toFixed(2) : "",
                      index,
                      "inwardQty",
                    );
                    setFocusedField(null);
                  }}
                  disabled={
                    readOnly ||
                    (row.stockQty ?? 0) > 0 ||
                    inwardType !== "DIRECT_INWARD"
                  }
                />
              </td>

              <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-center">
                {row.qrCodes && row.qrCodes.length > 0 && (
                  <button
                    type="button"
                    title="View Scanned QR Codes"
                    className="text-blue-500 hover:text-blue-700 flex items-center justify-center w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setQrCodeModalData({
                        rowIndex: index,
                        qrCodes: row.qrCodes,
                      });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>({row.qrCodes.length})</span>
                  </button>
                )}
              </td>
              {/* {(inwardType === "DIRECT_INWARD" ||
                    receiptType === "AGAINST_INVOICE") && (
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
                        type={
                          focusedField === `${index}-price` ? "number" : "text"
                        }
                        className="text-right rounded px-1 w-full table-data-input"
                        onFocus={(e) => {
                          e.target.select();
                          setFocusedField(`${index}-price`);
                        }}
                        value={
                          focusedField === `${index}-price`
                            ? (row?.price ?? "")
                            : row?.price
                              ? new Intl.NumberFormat("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(row.price)
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
                          (row.stockQty ?? 0) > 0 ||
                          inwardType !== "DIRECT_INWARD"
                        }
                      />
                    </td>
                  )}
                  {receiptType === "AGAINST_INVOICE" && (
                    <td className=" border border-gray-300 text-[11px]">
                      <input
                        type="text"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded px-1 w-full"
                        value={
                          !row.inwardQty || !row.price
                            ? "0.00"
                            : new Intl.NumberFormat("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                parseFloat(row.inwardQty) *
                                  parseFloat(row.price),
                              )
                        }
                        disabled={true}
                      />
                    </td>
                  )}

                  {receiptType === "AGAINST_INVOICE" && (
                    <td className="  border border-gray-300 text-[11px] text-right ">
                      <button
                        disabled={!row?.itemVariantId}
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
                  )}

                  <td className="w-2 border border-gray-300">
                    <input
                      ref={(el) => (actionRefs.current[index] = el)}
                      className="w-full table-data-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!receiptType) {
                            Swal.fire({
                              title: "Please select Receipt Basis",
                              icon: "warning",
                              confirmButtonText: "OK",
                            });
                            return;
                          }
                          if (inwardType === "DIRECT_INWARD") {
                            if (index === inwardItems.length - 1) {
                              addRow();
                            }
                          } else if (
                            receiptType === "AGAINST_INVOICE" ||
                            receiptType === "WITHOUT_INVOICE"
                          ) {
                            if (index === inwardItems.length - 1) {
                              addRow();
                            }
                            const next = document.querySelector(
                              `#inwardQty-input-${index + 1}`,
                            );
                            if (next) next.focus();
                          } else {
                            addRow();
                          }
                        }
                      }}
                      disabled={readOnly}
                    />
                  </td> */}
            </>
          )}
          footer={
            <tr className="bg-gray-50 h-6 font-medium text-gray-800 text-[11px]">
              <td
                className="text-right px-4 border border-gray-300 font-medium "
                colSpan={inwardType !== "DIRECT_INWARD" ? 9 : 8}
              >
                Total
              </td>
              {inwardType !== "DIRECT_INWARD" && (
                <>
                  <td className="text-right border border-gray-300 px-1 font-medium ">
                    {inwardItems
                      ?.reduce((sum, row) => sum + (Number(row.poQty) || 0), 0)
                      .toFixed(2)}
                  </td>
                  {/* <td className="text-right border border-gray-300 px-1 font-medium  ">
                    {inwardItems
                      ?.reduce(
                        (sum, row) => sum + (Number(row.alreadyCancelQty) || 0),
                        0,
                      )
                      .toFixed(2)}
                  </td> */}
                  <td className="text-right border border-gray-300 px-1 font-medium ">
                    {inwardItems
                      ?.reduce(
                        (sum, row) => sum + (Number(row.alreadyInwardQty) || 0),
                        0,
                      )
                      .toFixed(2)}
                  </td>
                  {/* <td className="text-right border border-gray-300 px-1 font-medium ">
                    {inwardItems
                      ?.reduce(
                        (sum, row) => sum + (Number(row.alreadyReturnQty) || 0),
                        0,
                      )
                      .toFixed(2)}
                  </td> */}
                  <td className="text-right border border-gray-300 px-1 font-medium ">
                    {inwardItems
                      ?.reduce((sum, row) => sum + (Number(row.balQty) || 0), 0)
                      .toFixed(2)}
                  </td>
                </>
              )}
              <td className="text-right border border-gray-300 px-1 font-medium ">
                {inwardItems
                  ?.reduce((sum, row) => sum + (Number(row.inwardQty) || 0), 0)
                  .toFixed(2)}
              </td>
              {/* {(inwardType === "DIRECT_INWARD" ||
                receiptType === "AGAINST_INVOICE") && (
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {new Intl.NumberFormat("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    inwardItems?.reduce(
                      (sum, row) => sum + (Number(row.price) || 0),
                      0,
                    ) || 0,
                  )}
                </td>
              )}
              {receiptType === "AGAINST_INVOICE" && (
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {new Intl.NumberFormat("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    inwardItems?.reduce((sum, row) => {
                      const qty = parseFloat(row.inwardQty) || 0;
                      const price = parseFloat(row.price) || 0;
                      return sum + qty * price;
                    }, 0) || 0,
                  )}
                </td>
              )}

              {receiptType === "AGAINST_INVOICE" && (
                <td
                  className="text-right border border-gray-300"
                  colSpan={1}
                ></td>
              )}

              <td className="border border-gray-300"></td> */}
            </tr>
          }
        />
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
        )}
      </div>
    </>
  );
};

export default InwardItems;
