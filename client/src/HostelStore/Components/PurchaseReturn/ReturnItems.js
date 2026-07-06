import { useEffect, useState } from "react";
import FxSelect from "../../../Inputs";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import PurchaseInwardItemsSelection from "./PurchaseInwardItemsSelection";
import { useLazyGetStyleItemMasterByIdQuery } from "../../../redux/services/StyleItemMasterService";
import { useGetPurInwardItemsQuery } from "../../../redux/uniformService/PurchaseInwardEntry";

const ReturnItems = ({
  id,
  returnItems,
  setReturnItems,
  readOnly,
  styleItemList,
  uomList,
  returnType,
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
  fromInwardId,
  termsRef,
  gsmList,
}) => {
  const EMPTY_ROW = {
    styleItemId: "",
    hsnId: "",
    uomId: "",
    returnQty: "",
    poQty: "",
    balQty: "",
    purchaseInwardId: "",
    itemGroupId: "",
    sizeId: "",
    colorId: "",
    alreadyReturnQty: "",
    inwardQty: "",
    gsmId: "",
  };
  const [focusedField, setFocusedField] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [fillGrid, setFillGrid] = useState(false);
  const addRow = () => {
    const newRow = {
      styleItemId: "",
      hsnId: "",
      uomId: "",
      returnQty: "",
      poQty: "",
      purchaseInwardId: "",
      itemGroupId: "",
      sizeId: "",
      colorId: "",
      gsmId: "",
    };
    setReturnItems([...returnItems, newRow]);
  };
  const [triggerGetStyleItem, { data: styleData }] =
    useLazyGetStyleItemMasterByIdQuery();
  const handleInputChange = async (value, index, field) => {
    // clone first
    const newRows = structuredClone(returnItems);
    if (field === "styleItemId") {
      // 1️⃣ update immediately
      newRows[index].styleItemId = value;
      setReturnItems([...newRows]); // 🔥 maintain UI instantly

      try {
        // 2️⃣ fetch style data
        const response = await triggerGetStyleItem(value).unwrap();

        // 3️⃣ update fabricId
        newRows[index].hsnId = response?.data?.hsnId;
        // 4️⃣ update again after API fetch
        setReturnItems([...newRows]);
      } catch (e) {
        console.error("Style fetch failed", e);
      }

      return; // stop here
    }
    // normal fields
    newRows[index][field] = value;
    setReturnItems([...newRows]);
  };
  const deleteRow = (id) => {
    setReturnItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setReturnItems(Array.from({ length: 4 }, () => ({ ...EMPTY_ROW })));
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
    setReturnItems((rows) =>
      rows.filter((r) => !(r.selected && (r.stockQty ?? 0) === 0)),
    );
    setContextMenu(null);
  };

  useEffect(() => {
    // If edit mode (id exists)
    if (id && returnItems?.length > 0) {
      const requiredRows = 4;
      const missingRows = requiredRows - returnItems.length;

      if (missingRows > 0) {
        setReturnItems([
          ...returnItems,
          ...Array.from({ length: missingRows }, () => ({ ...EMPTY_ROW })),
        ]);
      }
    }

    // If create mode (no id)
    if (!id && (!returnItems || returnItems.length === 0)) {
      setReturnItems(Array.from({ length: 4 }, () => ({ ...EMPTY_ROW })));
    }
  }, [id, returnItems]);

  const {
    data: purInwardItemsData,
    isLoading: isPurInwardItemsLoading,
    isFetching: isPurInwardItemsFetching,
  } = useGetPurInwardItemsQuery(
    {
      params: {
        branchId,
        supplierId,
        pagination: true,
        dataPerPage: "100",
        pageNumber: 1,
        returnType,
      },
    },
    { skip: !supplierId || !fromInwardId },
  );

  useEffect(() => {
    if (!fromInwardId || !purInwardItemsData?.data) return;

    // Filter only items belonging to this specific PO
    const filtered = purInwardItemsData.data.filter(
      (item) => parseInt(item.purchaseInwardId) === parseInt(fromInwardId),
    );

    if (filtered.length === 0) return;

    const mapped = filtered.map((item) => ({
      ...item,
      styleItemId: item.styleItemId ?? "",
      uomId: item.uomId ?? "",
      hsnId: item.hsnId ?? "",
      poQty: item.poQty ?? "",
      balQty: item.balQty ?? "",
      purchaseInwardId: item.purchaseInwardId ?? "",
      returnQty: item.returnQty ?? "",
      sizeId: item.sizeId ?? "",
      colorId: item.colorId ?? "",
      itemGroupId: item.itemGroupId ?? "",
      gsmId: item.gsmId ?? "",
    }));

    // Pad to minimum 4 rows
    const padded = [
      ...mapped,
      ...Array.from({ length: Math.max(0, 4 - mapped.length) }, () => ({
        ...EMPTY_ROW,
      })),
    ];

    setReturnItems(padded);
  }, [fromInwardId, purInwardItemsData]);

  const showFillButton = !id && !fromInwardId;

  return (
    <>
      <Modal
        isOpen={fillGrid}
        onClose={() => {
          setFillGrid(false);

          setTimeout(() => {
            const firstInput = document.querySelector("#returnQty-input-0");
            if (firstInput) {
              firstInput.focus();
              firstInput.select(); // optional UX 🔥
            }
          }, 100); // small delay important
        }}
        widthClass={"w-[95%] h-[90%]"}
      >
        <PurchaseInwardItemsSelection
          supplierId={supplierId}
          returnItems={returnItems}
          setReturnItems={setReturnItems}
          branchId={branchId}
          returnType={returnType}
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
              onClick={() => {
                if (!supplierId) {
                  Swal.fire({
                    icon: "warning",
                    title: ` Choose Supplier`,
                    showConfirmButton: false,
                    timer: 2000,
                  });
                } else if (!returnType) {
                  Swal.fire({
                    icon: "success",
                    title: ` Choose Return Type`,
                    showConfirmButton: false,
                    timer: 2000,
                  });
                } else {
                  setFillGrid(true);
                }
              }}
            >
              Fill Inward Items
            </button>
          )}
          {fromInwardId && !id && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              Auto-filled from Inward
            </span>
          )}
        </div>
        <div
          className={`w-full min-h-[200px] max-h-[200px] overflow-y-auto  my-2`}
        >
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 text-[12px]">
              <tr>
                <th className={`w-12 px-4 py-2 text-center font-medium `}>
                  S.No
                </th>
                <th className={`w-96 px-2 py-2 text-center font-medium `}>
                  Description of Goods
                </th>
                <th className={`w-32 px-4 py-2 text-center font-medium `}>
                  Size
                </th>
                <th className={`w-32 px-4 py-2 text-center font-medium `}>
                  Color
                </th>
                <th className={`w-20 px-4 py-2 text-center font-medium `}>
                  GSM
                </th>
                <th className={`w-20 px-4 py-2 text-center font-medium `}>
                  UOM
                </th>
                {returnType !== "General Return" && (
                  <th className={`w-24 px-4 py-2 text-center font-medium  `}>
                    Order Qty
                  </th>
                )}

                <th className={`w-24 px-4 py-2 text-center font-medium  `}>
                  Inward Qty
                </th>
                <th className={`w-24 px-4 py-2 text-center font-medium  `}>
                  Already Return Qty
                </th>
                <th className={`w-24 px-4 py-2 text-center font-medium  `}>
                  Balance Qty
                </th>
                <th className={`w-24 px-4 py-2 text-center font-medium  `}>
                  Return Qty<span className="text-red-500">*</span>
                </th>
                <th className={`w-20 px-1 py-2 text-center font-medium  `}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(returnItems ? returnItems : [])?.map((row, index) => (
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
                        .filter((item) => (id ? true : item.active))
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
                  {returnType !== "General Return" && (
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
                        className="text-right rounded  px-1 w-full table-data-input"
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
                  )}

                  <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right">
                    <input
                      onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract")
                          e.preventDefault();
                        if (e.key === "Delete") {
                          handleInputChange("", index, "inwardQty");
                        }
                      }}
                      min={"0"}
                      type="number"
                      className="text-right rounded  px-1 w-full table-data-input"
                      onFocus={(e) => e.target.select()}
                      value={
                        row?.inwardQty ? Number(row.inwardQty).toFixed(2) : ""
                      }
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "inwardQty")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "inwardQty");
                      }}
                      disabled={true}
                    />
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right">
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
                      className="text-right rounded  px-1 w-full table-data-input"
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
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right">
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
                      className="text-right rounded  px-1 w-full table-data-input"
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
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right">
                    <input
                      id={`returnQty-input-${index}`}
                      onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract")
                          e.preventDefault();
                        if (e.key === "Delete") {
                          handleInputChange("", index, "returnQty");
                        }
                        if (e.key === "Enter") {
                          e.preventDefault(); // prevent form submit or line break
                          e.stopPropagation();

                          const nextQtyInput = document.querySelector(
                            `#returnQty-input-${index + 1}`,
                          );
                          if (nextQtyInput) {
                            nextQtyInput.focus();
                          }
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
                          ? (row?.returnQty ?? "")
                          : row?.returnQty
                            ? Number(row.returnQty).toFixed(2)
                            : ""
                      }
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "returnQty")
                      }
                      onBlur={(e) => {
                        const minQty = row.balQty;

                        if (parseFloat(minQty) < parseFloat(e.target.value)) {
                          e.target.value = "";
                          handleInputChange("", index, "returnQty");
                          Swal.fire({
                            icon: "warning",
                            title: "Invalid Qty",
                            text: `Return Qty cannot be More than Balance Qty! - ${minQty}`,
                            confirmButtonText: "OK",
                            didClose: () => {
                              e.target.focus();
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
                          "returnQty",
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
                            `#returnQty-input-${index + 1}`,
                          );
                          if (index === returnItems.length - 1) {
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
                  className="text-right px-4 border border-gray-300 font-medium  "
                  colSpan={6}
                >
                  Total
                </td>
                {returnType !== "General Return" && (
                  <td className="text-right border border-gray-300 px-1 font-medium ">
                    {returnItems
                      ?.reduce((sum, row) => sum + (Number(row.poQty) || 0), 0)
                      .toFixed(2)}
                  </td>
                )}
                <td className="text-right border border-gray-300 px-1 font-medium  ">
                  {returnItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.inwardQty) || 0),
                      0,
                    )
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {returnItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.alreadyReturnQty) || 0),
                      0,
                    )
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {returnItems
                    ?.reduce((sum, row) => sum + (Number(row.balQty) || 0), 0)
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {returnItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.returnQty) || 0),
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

export default ReturnItems;
