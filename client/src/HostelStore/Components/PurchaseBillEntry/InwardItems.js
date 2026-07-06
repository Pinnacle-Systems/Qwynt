import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import PoItemsSelection from "./PoItemsSelection";
import { useLazyGetStyleItemMasterByIdQuery } from "../../../redux/services/StyleItemMasterService";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import { VIEW } from "../../../icons";
import { toast } from "react-toastify";
import TaxDetailsFullTemplate from "./TaxDetailsFullTemplate";
import { useGetPurchaseInwardEntryForBillByIdQuery } from "../../../redux/uniformService/PurchaseInwardEntry";

const InwardItems = ({
  id,
  inwardItems,
  tempItems,
  setTempItems,
  setInwardItems,
  readOnly,
  taxTemplateId,
  billType,
  supplierId,
  branchId,
  dcNo,
  invNo,
  searchDocId,
  setSearchDocId,
  searchPIDate,
  setSearchPIDate,
  searchInvNo,
  setSearchInvNo,
  searchDcNo,
  setSearchDcNo,
  fromInwardId,
  isSupplierOutside,
}) => {
  const EMPTY_ROW = {
    purchaseBillEntryId: "",
    docId: "",
    docdate: "",
    invNo: "",
    dcNo: "",
    styleItemId: "",
    hsnId: "",
    uomId: "",
    inwardQty: "",
    poQty: "",
    poId: "",
    price: "",
    discountType: "",
    discountValue: "",
    taxPercent: "",
    itemGroupId: "",
    sizeId: "",
    colorId: "",
    gsmId: "",
  };
  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [fillGrid, setFillGrid] = useState(false);
  const actionRefs = useRef([]);

  const addRow = () => {
    const newRow = {
      purchaseBillEntryId: "",
      docId: "",
      docdate: "",
      invNo: "",
      dcNo: "",
      styleItemId: "",
      hsnId: "",
      uomId: "",
      inwardQty: "",
      poQty: "",
      poId: "",
      gsmId: "",
    };
    setInwardItems([...inwardItems, newRow]);
  };
  const [triggerGetStyleItem, { data: styleData }] =
    useLazyGetStyleItemMasterByIdQuery();
  const handleInputChange = async (value, index, field) => {
    // clone first
    const newRows = structuredClone(inwardItems);
    if (field === "styleItemId") {
      // 1️⃣ update immediately
      newRows[index].styleItemId = value;
      setInwardItems([...newRows]); // 🔥 maintain UI instantly

      try {
        // 2️⃣ fetch style data
        const response = await triggerGetStyleItem(value).unwrap();

        // 3️⃣ update fabricId
        newRows[index].hsnId = response?.data?.hsnId;
        // 4️⃣ update again after API fetch
        setInwardItems([...newRows]);
      } catch (e) {
        console.error("Style fetch failed", e);
      }

      return; // stop here
    }
    // normal fields
    newRows[index][field] = value;
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

  const {
    data: purchaseInwarddata,
    isFetching: isSingleInwardFetching,
    isLoading: isSingleInwardLoading,
  } = useGetPurchaseInwardEntryForBillByIdQuery(
    {
      params: {
        branchId,
        supplierId,
        pagination: true,
        dataPerPage: "100",
        pageNumber: 1,
        billType,
      },
    },
    { skip: !supplierId || !fromInwardId },
  );

  useEffect(() => {
    if (!fromInwardId || !purchaseInwarddata?.data) return;

    // Filter only items belonging to this specific PO
    const filtered = purchaseInwarddata.data.filter(
      (item) => parseInt(item.purchaseInwardId) === parseInt(fromInwardId),
    );

    if (filtered.length === 0) return;

    const mapped = filtered.map((item) => ({
      ...item,
      taxPercent: item?.Hsn?.tax || 0,
    }));

    // Pad to minimum 4 rows
    const padded = [
      ...mapped,
      ...Array.from({ length: Math.max(0, 4 - mapped.length) }, () => ({
        ...EMPTY_ROW,
      })),
    ];

    setInwardItems(padded);
  }, [fromInwardId, purchaseInwarddata]);

  const showFillButton = !id && !fromInwardId;

  const focusActionCell = (index) => {
    setTimeout(() => {
      actionRefs.current[index]?.focus();
    }, 200); // wait for modal close render
  };

  return (
    <>
      <Modal
        isOpen={Number.isInteger(currentSelectedIndex)}
        onClose={() => {
          const index = currentSelectedIndex;
          setCurrentSelectedIndex("");
          focusActionCell(index); // 🔥 restore focus
        }}
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
        onClose={() => setFillGrid(false)}
        widthClass={"w-[95%] h-[80%]"}
      >
        <PoItemsSelection
          setFillGrid={setFillGrid}
          supplierId={supplierId}
          inwardItems={inwardItems}
          setInwardItems={setInwardItems}
          branchId={branchId}
          billType={billType}
          dcNo={dcNo}
          tempItems={tempItems}
          setTempItems={setTempItems}
          invNo={invNo}
          onClose={() => setFillGrid(false)}
          searchDocId={searchDocId}
          searchPIDate={searchPIDate}
          searchInvNo={searchInvNo}
          searchDcNo={searchDcNo}
          setSearchDocId={setSearchDocId}
          setSearchPIDate={setSearchPIDate}
          setSearchInvNo={setSearchInvNo}
          setSearchDcNo={setSearchDcNo}
        />
      </Modal>
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm min-h-[260px] overflow-auto  w-full">
        <div className="flex items-center justify-between my-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
          {showFillButton && (
            <button
              className={`font-bold  bord text-sm bg-blue-500 rounded-md text-white px-2
              `}
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
              // disabled={id}
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
          className={`w-full min-h-[210px] max-h-[210px] overflow-y-auto  my-2`}
        >
          <table className=" w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr className="text-[12px]">
                <th className={`w-8 px-4 py-2 text-center font-medium `}>
                  S.No
                </th>
                <th className={`w-24 px-4 py-2 text-center font-medium `}>
                  PI No
                </th>
                <th className={`w-20 px-4 py-2 text-center font-medium `}>
                  PI Date
                </th>
                {/* <th className={`w-20 px-4 py-2 text-center font-medium `}>
                  Inv No
                </th> */}
                <th className={`w-20 px-4 py-2 text-center font-medium `}>
                  Dc No
                </th>
                <th className={`w-64 px-2 py-2 text-center font-medium `}>
                  Description of Goods
                </th>
                <th className={`w-20 px-4 py-2 text-center font-medium `}>
                  Size
                </th>
                <th className={`w-36 px-4 py-2 text-center font-medium `}>
                  Color
                </th>
                <th className={`w-20 px-4 py-2 text-center font-medium `}>
                  GSM
                </th>
                <th className={`w-20 px-4 py-2 text-center font-medium `}>
                  UOM
                </th>
                <th className={`w-24 px-4 py-2 text-center font-medium `}>
                  Inward Qty
                </th>
                <th className={`w-24 px-4 py-2 text-center font-medium `}>
                  Price
                </th>
                <th className={`w-28 px-1 py-2 text-center font-medium `}>
                  Gross Amount
                </th>
                <th className={`w-20 px-1 py-2 text-center font-medium `}>
                  Tax Details
                </th>
                <th className={`w-20 px-1 py-2 text-center font-medium `}>
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
                  <td className="w-12 border border-gray-300 text-[11px] pl-1  text-left p-0.5">
                    {row?.PurchaseInward?.docId}
                  </td>
                  <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                    {row?.PurchaseInward?.docDate
                      ? getDateFromDateTimeToDisplay(
                          row?.PurchaseInward?.docDate,
                        )
                      : ""}
                  </td>
                  {/* <td className="w-12 border border-gray-300 text-[11px]  pr-1 p-0.5">
                    {row?.PurchaseInward?.invNo}
                  </td> */}
                  <td className="w-12 border border-gray-300 text-[11px]  pr-1 p-0.5">
                    {row?.PurchaseInward?.dcNo}
                  </td>
                  <td className=" text-[11px] border pl-1 border-gray-300 text-left">
                    {row?.StyleItem?.name}
                  </td>
                  <td className=" border pl-1 border-gray-300 text-[11px] ">
                    {row.Size?.name}
                  </td>
                  <td className=" border  pl-1 border-gray-300 text-[11px] ">
                    {row.Color?.name}
                  </td>
                  <td className=" border pl-1  border-gray-300 text-[11px] ">
                    {row.Gsm?.name}
                  </td>
                  <td className=" border pl-1  border-gray-300 text-[11px] ">
                    {row.Uom?.name}
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right pr-1">
                    {row?.inwardQty ? Number(row.inwardQty).toFixed(2) : ""}
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300  text-right pr-1">
                    {row?.price ? Number(row.price).toFixed(2) : ""}
                  </td>
                  <td className=" border border-gray-300 text-[11px]">
                    <input
                      type="number"
                      onFocus={(e) => e.target.select()}
                      className="text-right rounded px-1 w-full"
                      value={
                        !row.inwardQty || !row.price
                          ? 0.0
                          : (
                              parseFloat(row.inwardQty) * parseFloat(row.price)
                            ).toFixed(2)
                      }
                      disabled={true}
                    />
                  </td>
                  <td className=" py-0.5 border border-gray-300 text-[11px] text-right">
                    <button
                      disabled={!row?.StyleItem?.name}
                      className="text-center rounded py-1 w-full"
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
                  <td className="w-2 border border-gray-300 bg-transparent">
                    <input
                      ref={(el) => (actionRefs.current[index] = el)}
                      className="w-full bg-transparent table-data-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (index === inwardItems.length - 1) {
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
                  className="text-right px-4 border border-gray-300 font-medium   "
                  colSpan={9}
                >
                  Total
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {inwardItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row?.inwardQty) || 0),
                      0,
                    )
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {inwardItems
                    ?.reduce((sum, row) => sum + (Number(row?.price) || 0), 0)
                    .toFixed(2)}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium ">
                  {inwardItems
                    ?.reduce((sum, row) => {
                      const qty = parseFloat(row.inwardQty) || 0;
                      const price = parseFloat(row.price) || 0;
                      return sum + qty * price;
                    }, 0)
                    .toFixed(2)}
                </td>
                <td
                  className="text-right border border-gray-300"
                  colSpan={2}
                ></td>
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
