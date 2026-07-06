import { useEffect, useRef, useState } from "react";
import FxSelect from "../../../Inputs";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import PurchaseItemsSelection from "./PurchaseItemsSelection";
import { useLazyGetStyleItemMasterByIdQuery } from "../../../redux/services/StyleItemMasterService";
import { useGetPoItemsQuery } from "../../../redux/uniformService/PoServices";

const CancelItems = ({
  id,
  cancelItems,
  setCancelItems,
  readOnly,
  params,
  styleItemList,
  uomList,
  hsnList,
  poType,
  supplierId,
  branchId,
  sizeList,
  colorList,
  gsmList,
  setTempItems,
  tempItems,
  searchDocId,
  setSearchDocId,
  setSearchDocDate,
  searchDocDate,
  fromPoId,
  termsRef,
}) => {
  const EMPTY_ROW = {
    poId: "",
    poDocId: "",
    styleItemId: "",
    hsnId: "",
    uomId: "",
    poQty: "",
    inwardQty: "",
    returnQty: "",
    balQty: "",
    cancelQty: "",
    itemGroupId: "",
    sizeId: "",
    colorId: "",
    alreadyInwardQty: "",
    alreadyCancelQty: "",
    alreadyReturnQty: "",
  };
  const [contextMenu, setContextMenu] = useState(null);
  const [fillGrid, setFillGrid] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const addRow = () => {
    const newRow = {
      poId: "",
      poDocId: "",
      styleItemId: "",
      hsnId: "",
      uomId: "",
      poQty: "",
      inwardQty: "",
      returnQty: "",
      balQty: "",
      cancelQty: "",
      itemGroupId: "",
      sizeId: "",
      colorId: "",
      alreadyCancelQty: "",
      alreadyInwardQty: "",
      alreadyReturnQty: "",
      gsmId: "",
    };
    setCancelItems([...cancelItems, newRow]);
  };
  const fillItemsButtonRef = useRef(null);

  // Add useEffect to focus the button when supplierId changes
  useEffect(() => {
    if (supplierId && fillItemsButtonRef.current) {
      setTimeout(() => {
        fillItemsButtonRef.current?.focus();
      }, 100);
    }
  }, [supplierId]);
  const [triggerGetStyleItem, { data: styleData }] =
    useLazyGetStyleItemMasterByIdQuery();
  const handleInputChange = async (value, index, field) => {
    // clone first
    const newRows = structuredClone(cancelItems);
    if (field === "styleItemId") {
      // 1️⃣ update immediately
      newRows[index].styleItemId = value;
      setCancelItems([...newRows]); // 🔥 maintain UI instantly

      try {
        // 2️⃣ fetch style data
        const response = await triggerGetStyleItem(value).unwrap();

        // 3️⃣ update fabricId
        newRows[index].hsnId = response?.data?.hsnId;
        // 4️⃣ update again after API fetch
        setCancelItems([...newRows]);
      } catch (e) {
        console.error("Style fetch failed", e);
      }

      return; // stop here
    }
    // normal fields
    newRows[index][field] = value;
    setCancelItems([...newRows]);
  };
  const deleteRow = (id) => {
    setCancelItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setCancelItems(Array.from({ length: 4 }, () => ({ ...EMPTY_ROW })));
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
    setCancelItems((rows) =>
      rows.filter((r) => !(r.selected && (r.stockQty ?? 0) === 0)),
    );
    setContextMenu(null);
  };

  useEffect(() => {
    // If edit mode (id exists)
    if (id && cancelItems?.length > 0) {
      const requiredRows = 4;
      const missingRows = requiredRows - cancelItems.length;

      if (missingRows > 0) {
        setCancelItems([
          ...cancelItems,
          ...Array.from({ length: missingRows }, () => ({ ...EMPTY_ROW })),
        ]);
      }
    }

    // If create mode (no id)
    if (!id && (!cancelItems || cancelItems.length === 0)) {
      setCancelItems(Array.from({ length: 4 }, () => ({ ...EMPTY_ROW })));
    }
  }, [id, cancelItems]);

  const {
    data: poItemsData,
    isLoading: isPoItemsLoading,
    isFetching: isPoItemsFetching,
  } = useGetPoItemsQuery(
    {
      params: {
        branchId,
        supplierId,
        pagination: true,
        dataPerPage: "100",
        pageNumber: 1,
        poType: poType,
      },
    },
    { skip: !supplierId || !fromPoId }, // ⬅️ only fetch when needed
  );

  useEffect(() => {
    if (!fromPoId || !poItemsData?.data) return;

    // Filter only items belonging to this specific PO
    const filtered = poItemsData.data.filter(
      (item) => parseInt(item.poId) === parseInt(fromPoId),
    );

    if (filtered.length === 0) return;

    const mapped = filtered.map((item) => ({
      styleItemId: item.styleItemId || "",
      hsnId: item.hsnId || "",
      uomId: item.uomId || "",
      itemGroupId: item.itemGroupId || "",
      sizeId: item.sizeId || "",
      colorId: item.colorId || "",
      poId: item.poId || "",
      poDocId: item.Po?.docId || "",
      poQty: item.qty || "",
      alreadyInwardQty: item.alreadyInwardQty || 0,
      alreadyCancelQty: item.alreadyCancelQty || 0,
      alreadyReturnQty: item.alreadyReturnQty || 0,
      balQty: item.balQty ?? item.qty,
      gsmId: item.gsmId || "",
      returnQty: "", // ⬅️ user fills this
    }));

    // Pad to minimum 4 rows
    const padded = [
      ...mapped,
      ...Array.from({ length: Math.max(0, 4 - mapped.length) }, () => ({
        ...EMPTY_ROW,
      })),
    ];

    setCancelItems(padded);
  }, [fromPoId, poItemsData]);

  const showFillButton = !id && !fromPoId;

  return (
    <>
      <Modal
        isOpen={fillGrid}
        onClose={() => {
          setFillGrid(false);

          setTimeout(() => {
            const firstInput = document.querySelector("#cancelQty-input-0");
            if (firstInput) {
              firstInput.focus();
              firstInput.select(); // optional UX 🔥
            }
          }, 100); // small delay important
        }}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PurchaseItemsSelection
          supplierId={supplierId}
          cancelItems={cancelItems}
          setCancelItems={setCancelItems}
          branchId={branchId}
          poType={poType}
          setTempItems={setTempItems}
          tempItems={tempItems}
          searchDocId={searchDocId}
          setSearchDocId={setSearchDocId}
          setSearchDocDate={setSearchDocDate}
          searchDocDate={searchDocDate}
          onClose={() => setFillGrid(false)}
        />
      </Modal>
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto  w-full">
        <div className="flex items-center my-2 justify-between">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
          {showFillButton && (
            <button
              className="font-bold  bord text-sm bg-blue-500 rounded-md text-white px-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setFillGrid(true);
                }
              }}
              tabIndex={0}
              ref={fillItemsButtonRef}
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
          )}
          {fromPoId && !id && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              Auto-filled from PO
            </span>
          )}
        </div>
        <div
          className={`w-full min-h-[200px] max-h-[200px] overflow-y-auto  my-2`}
        >
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th
                  className={`w-10 px-4 py-2 text-center font-medium text-[12px]`}
                >
                  S.No
                </th>
                <th
                  className={`w-28 px-4 py-2 text-center font-medium text-[12px]`}
                >
                  PO No
                </th>
                <th
                  className={`w-64 px-2 py-2 text-center font-medium text-[12px]`}
                >
                  Description of Goods
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[12px]`}
                >
                  Size
                </th>
                <th
                  className={`w-32 px-4 py-2 text-center font-medium text-[12px]`}
                >
                  Color
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[12px]`}
                >
                  GSM
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[12px] `}
                >
                  UOM
                </th>
                <th
                  className={`w-24 px-4 py-2 text-center font-medium text-[12px] `}
                >
                  PO Qty
                </th>
                <th
                  className={`w-24 px-4 py-2 text-center font-medium text-[12px] `}
                >
                  Already Cancel Qty
                </th>
                <th
                  className={`w-24 px-4 py-2   text-center font-medium text-[12px] `}
                >
                  Already Inward Qty
                </th>
                <th
                  className={`w-24 px-4 py-2 text-center font-medium text-[12px] `}
                >
                  Already Return Qty
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[12px] `}
                >
                  Balance Qty
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[12px] `}
                >
                  Cancel Qty<span className="text-red-500">*</span>
                </th>
                <th
                  className={`w-20 px-1 py-2 text-center font-medium text-[12px] `}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(cancelItems ? cancelItems : [])?.map((row, index) => (
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
                  <td className="border-blue-gray-200 text-[11px] border text-left border-gray-300">
                    <input
                      min={"0"}
                      className=" rounded px-1 w-full table-data-input"
                      onFocus={(e) => e.target.select()}
                      value={row?.poDocId}
                      disabled={true}
                    />
                  </td>
                  <td className=" text-[11px] border border-gray-300 text-left">
                    <FxSelect
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
                      readOnly={true}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.styleItemId, index, "styleItemId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "styleItemId");
                        }
                      }}
                    />
                  </td>
                  <td className=" border border-gray-300 text-[11px] ">
                    <FxSelect
                      value={row.sizeId}
                      onChange={(val) =>
                        handleInputChange(val, index, "sizeId")
                      }
                      options={(sizeList?.data || [])
                        .filter((item) => (id ? true : item.active))
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={true}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.sizeId, index, "sizeId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "sizeId");
                        }
                      }}
                    />
                  </td>
                  <td className=" border border-gray-300 text-[11px] ">
                    <FxSelect
                      value={row.colorId}
                      onChange={(val) =>
                        handleInputChange(val, index, "colorId")
                      }
                      options={(colorList?.data || [])
                        .filter((item) => (id ? true : item.active))
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={true}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.colorId, index, "colorId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "colorId");
                        }
                      }}
                    />
                  </td>
                  <td className=" border border-gray-300 text-[11px] ">
                    <FxSelect
                      value={row.gsmId}
                      onChange={(val) => handleInputChange(val, index, "gsmId")}
                      options={(gsmList?.data || [])
                        .filter((item) => item.active)
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={true}
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
                  </td>
                  <td className=" border border-gray-300 text-[11px] ">
                    <FxSelect
                      value={row.uomId}
                      onChange={(val) => handleInputChange(val, index, "uomId")}
                      options={(uomList?.data || [])
                        .filter((item) => (id ? true : item.active))
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={true}
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
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right">
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
                      className="text-right px-1 w-full table-data-input"
                      onFocus={(e) => e.target.select()}
                      value={row?.poQty ? Number(row.poQty).toFixed(2) : ""}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "poQty")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "poQty");
                      }}
                      disabled={true}
                    />
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-right">
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
                      className="text-right px-1 w-full table-data-input"
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
                      disabled={true}
                    />
                  </td>
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
                      disabled={true}
                    />
                  </td>
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
                      disabled={true}
                    />
                  </td>
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
                      disabled={true}
                    />
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-right">
                    <input
                      id={`cancelQty-input-${index}`}
                      onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract")
                          e.preventDefault();
                        if (e.key === "Delete") {
                          handleInputChange("", index, "cancelQty");
                        }
                        if (e.key === "Enter") {
                          e.preventDefault(); // prevent form submit or line break
                          e.stopPropagation();

                          const nextQtyInput = document.querySelector(
                            `#cancelQty-input-${index + 1}`,
                          );
                          if (nextQtyInput) {
                            nextQtyInput.focus();
                          }
                        }
                      }}
                      min={"0"}
                      type="number"
                      className="text-right px-1 w-full table-data-input"
                      onFocus={(e) => {
                        e.target.select();
                        setFocusedField(`${index}`);
                      }}
                      value={
                        focusedField === `${index}`
                          ? (row?.cancelQty ?? "")
                          : row?.cancelQty
                            ? Number(row.cancelQty).toFixed(2)
                            : ""
                      }
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "cancelQty")
                      }
                      onBlur={(e) => {
                        const minQty = row.balQty;

                        if (parseFloat(minQty) < parseFloat(e.target.value)) {
                          e.target.value = "";
                          handleInputChange("", index, "cancelQty");
                          Swal.fire({
                            icon: "warning",
                            title: "Invalid Qty",
                            text: `Cancel Qty cannot be More than Balance Qty! - ${minQty}`,
                            confirmButtonText: "OK",
                            didClose: () => {
                              const currentInput = document.querySelector(
                                `#cancelQty-input-${index}`,
                              );
                              currentInput?.focus();
                            },
                          });
                          return;
                        }

                        // if (e.target.value == 0) {
                        //   e.target.value = "";
                        //   Swal.fire({
                        //     icon: "warning",
                        //     title: "Invalid Qty",
                        //     text: `Minimum Qty is 1`,
                        //     confirmButtonText: "OK",
                        //   });
                        //   return;
                        // }
                        const val = e.target.value;
                        handleInputChange(
                          val ? Number(val).toFixed(2) : "",
                          index,
                          "cancelQty",
                        );
                      }}
                      disabled={readOnly || (row.stockQty ?? 0) > 0}
                    />
                  </td>

                  <td className="w-2 border border-gray-300">
                    <input
                      className="w-full table-data-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const next = document.querySelector(
                            `#cancelQty-input-${index + 1}`,
                          );
                          if (index === cancelItems.length - 1) {
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
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 h-6 font-medium text-gray-800 text-[12px]">
                <td
                  className="text-right px-4 border border-gray-300 font-medium "
                  colSpan={7}
                >
                  Total
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium">
                  {cancelItems
                    ?.reduce((sum, row) => sum + (Number(row.poQty) || 0), 0)
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium">
                  {cancelItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.alreadyCancelQty) || 0),
                      0,
                    )
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium">
                  {cancelItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.alreadyInwardQty) || 0),
                      0,
                    )
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium">
                  {cancelItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.alreadyReturnQty) || 0),
                      0,
                    )
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium">
                  {cancelItems
                    ?.reduce((sum, row) => sum + (Number(row.balQty) || 0), 0)
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium">
                  {cancelItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.cancelQty) || 0),
                      0,
                    )
                    .toFixed(2)}
                </td>
                <td className="border border-gray-300" colSpan={1}></td>
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

export default CancelItems;
