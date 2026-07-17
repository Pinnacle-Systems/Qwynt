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
}) => {
  const EMPTY_ROW = {
    itemVariantId: "",
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
  const [focusedField, setFocusedField] = useState(null);
  const actionRefs = useRef([]);

  const skipFocusRef = useRef(false);

  const addRow = () => {
    const newRow = {
      itemVariantId: "",
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
    setInwardItems(Array.from({ length: 4 }, () => ({ ...EMPTY_ROW })));
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

  const deleteSelectedRows = () => {
    setInwardItems((rows) =>
      rows.filter((r) => !(r.selected && (r.stockQty ?? 0) === 0)),
    );
    setContextMenu(null);
  };

  useEffect(() => {
    // If edit mode (id exists)
    if (id && inwardItems?.length > 0) {
      const requiredRows = 4;
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
      setInwardItems(Array.from({ length: 4 }, () => ({ ...EMPTY_ROW })));
    }
  }, [id, inwardItems]);

  const focusActionCell = (index) => {
    setTimeout(() => {
      actionRefs.current[index]?.focus();
    }, 200); // wait for modal close render
  };

  return (
    <>
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
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm min-h-[270px] overflow-auto  w-full">
        <div className="flex items-center my-2 justify-between">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div
          className={`w-full min-h-[205px] max-h-[205px] overflow-y-auto  my-2`}
        >
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr className="text-[12px]">
                <th className={`w-12 px-4 py-2 text-center font-medium `}>
                  S.No
                </th>

                <th className={`w-56 px-2 py-2 text-center font-medium`}>
                  Description of Goods<span className="text-red-500">*</span>
                </th>
                <th className={`w-20 px-4 py-2 text-center font-medium`}>
                  Printing Design
                </th>
                <th className={`w-20 px-4 py-2 text-center font-medium`}>
                  Size
                </th>
                <th className={`w-32 px-4 py-2 text-center font-medium`}>
                  Color
                </th>
                {/* <th className={`w-16 px-4 py-2 text-center font-medium`}>
                  GSM
                </th>
                <th className={`w-16 px-4 py-2 text-center font-medium`}>
                  UOM
                </th> */}

                <th className={`w-16 px-4 py-2 text-center font-medium `}>
                  Inward Qty<span className="text-red-500">*</span>
                </th>
                {(inwardType === "Direct Inward" ||
                  receiptType === "AGAINST_INVOICE") && (
                  <th className={`w-16 px-4 py-2 text-center font-medium `}>
                    Price<span className="text-red-500">*</span>
                  </th>
                )}
                {receiptType === "AGAINST_INVOICE" && (
                  <th className={`w-16 px-1 py-2 text-center font-medium `}>
                    Gross amt
                  </th>
                )}
                {receiptType === "AGAINST_INVOICE" && (
                  <th className={`w-16 px-1 py-2 text-center font-medium `}>
                    Net amt
                  </th>
                )}
                {receiptType === "AGAINST_INVOICE" && (
                  <th className={`w-10 px-1 py-2 text-center font-medium `}>
                    Tax
                  </th>
                )}
                <th className={`w-12 px-1 py-2 text-center font-medium `}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(inwardItems ? inwardItems : [])?.map((row, index) => (
                <tr
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 cursor-pointer h-6`}
                  key={index}
                  onContextMenu={(e) => {
                    if (!readOnly) {
                      handleRightClick(e, index, "");
                    }
                  }}
                >
                  <td className="w-12 border border-gray-300 text-[11px]  text-center">
                    {index + 1}
                  </td>
                  {inwardType !== "Direct Inward" && (
                    <td className="w-16 border border-gray-300 text-[11px] text-left px-1">
                      {row.Po?.docId}
                    </td>
                  )}
                  <td className=" text-[11px] border border-gray-300 text-left">
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
                      readOnly={readOnly || inwardType !== "Direct Inward"}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(
                          row.itemVariantId,
                          index,
                          "itemVariantId",
                        )
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
                  <td className=" border border-gray-300 text-[11px] text-left">
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
                      readOnly={readOnly || inwardType !== "Direct Inward"}
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
                  <td className=" border border-gray-300 text-[11px] ">
                    <FxSelectWithAdd
                      value={row.sizeId}
                      onChange={(val) =>
                        handleInputChange(val, index, "sizeId")
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
                      readOnly={readOnly || inwardType !== "Direct Inward"}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.sizeId, index, "sizeId")
                      }
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
                  <td className=" border border-gray-300 text-[11px] ">
                    <FxSelectWithAdd
                      value={row.colorId}
                      onChange={(val) =>
                        handleInputChange(val, index, "colorId")
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
                      readOnly={readOnly || inwardType !== "Direct Inward"}
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
                  {/* <td className=" border border-gray-300 text-[11px] ">
                    <FxSelect
                      value={row.gsmId}
                      onChange={(val) => handleInputChange(val, index, "gsmId")}
                      options={(gsmList?.data || [])
                        .filter((item) => (id ? true : item.active))
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={readOnly || inwardType !== "Direct Inward"}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.gsmId, index, "gsmId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "gsmId");
                        }
                      }}
                    />
                  </td> */}
                  {/* <td className=" border border-gray-300 text-[11px] ">
                    <FxSelect
                      value={row.uomId}
                      onChange={(val) => handleInputChange(val, index, "uomId")}
                      options={(uomList?.data || [])
                        .filter((item) => (id ? true : item.active))
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={readOnly || inwardType !== "Direct Inward"}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.uomId, index, "uomId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "uomId");
                        }
                      }}
                    />
                  </td> */}

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
                          inwardType !== "Direct Inward" ||
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
                      className="text-right px-1 w-full table-data-input"
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

                        const val = e.target.value;
                        handleInputChange(
                          val ? Number(val).toFixed(2) : "",
                          index,
                          "inwardQty",
                        );
                        setFocusedField(null);
                      }}
                      disabled={readOnly || (row.stockQty ?? 0) > 0}
                    />
                  </td>
                  {(inwardType === "Direct Inward" ||
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
                          (row.stockQty ?? 0) > 0 ||
                          inwardType !== "Direct Inward"
                        }
                      />
                    </td>
                  )}
                  {receiptType === "AGAINST_INVOICE" && (
                    <td className=" border border-gray-300 text-[11px]">
                      <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded px-1 w-full"
                        value={
                          !row.inwardQty || !row.price
                            ? 0.0
                            : (
                                parseFloat(row.inwardQty) *
                                parseFloat(row.price)
                              ).toFixed(2)
                        }
                        disabled={true}
                      />
                    </td>
                  )}
                  {receiptType === "AGAINST_INVOICE" && (
                    <td className=" border border-gray-300 text-[11px]">
                      <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded px-1 w-full"
                        value={row?.totals?.net?.toFixed(2)}
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
                          if (inwardType === "Direct Inward") {
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
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 h-6 font-medium text-gray-800 text-[12px]">
                <td
                  className="text-right px-4 border border-gray-300 font-medium "
                  colSpan={inwardType !== "Direct Inward" ? 6 : 5}
                >
                  Total
                </td>
                {inwardType !== "Direct Inward" && (
                  <>
                    <td className="text-right border border-gray-300 px-1 font-medium ">
                      {inwardItems
                        ?.reduce(
                          (sum, row) => sum + (Number(row.poQty) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </td>
                    <td className="text-right border border-gray-300 px-1 font-medium  ">
                      {inwardItems
                        ?.reduce(
                          (sum, row) =>
                            sum + (Number(row.alreadyCancelQty) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </td>
                    <td className="text-right border border-gray-300 px-1 font-medium ">
                      {inwardItems
                        ?.reduce(
                          (sum, row) =>
                            sum + (Number(row.alreadyInwardQty) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </td>
                    <td className="text-right border border-gray-300 px-1 font-medium ">
                      {inwardItems
                        ?.reduce(
                          (sum, row) =>
                            sum + (Number(row.alreadyReturnQty) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </td>
                    <td className="text-right border border-gray-300 px-1 font-medium ">
                      {inwardItems
                        ?.reduce(
                          (sum, row) => sum + (Number(row.balQty) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </td>
                  </>
                )}
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {inwardItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.inwardQty) || 0),
                      0,
                    )
                    .toFixed(2)}
                </td>
                {(inwardType === "Direct Inward" ||
                  receiptType === "AGAINST_INVOICE") && (
                  <td className="text-right border border-gray-300 px-1 font-medium ">
                    {inwardItems
                      ?.reduce((sum, row) => sum + (Number(row.price) || 0), 0)
                      .toFixed(2)}
                  </td>
                )}
                {receiptType === "AGAINST_INVOICE" && (
                  <td className="text-right border border-gray-300 px-1 font-medium ">
                    {inwardItems
                      ?.reduce((sum, row) => {
                        const qty = parseFloat(row.inwardQty) || 0;
                        const price = parseFloat(row.price) || 0;
                        return sum + qty * price;
                      }, 0)
                      .toFixed(2)}
                  </td>
                )}
                {receiptType === "AGAINST_INVOICE" && (
                  <td className="text-right border border-gray-300 px-1 font-medium ">
                    {inwardItems
                      ?.reduce((sum, row) => {
                        const net = parseFloat(row?.totals?.net) || 0;
                        return sum + net;
                      }, 0)
                      .toFixed(2)}
                  </td>
                )}
                {receiptType === "AGAINST_INVOICE" && (
                  <td
                    className="text-right border border-gray-300"
                    colSpan={1}
                  ></td>
                )}

                <td className="border border-gray-300"></td>
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
