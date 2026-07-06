import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";

const PurchaseItemsSelection = ({
  cancelItems = [],
  setCancelItems,
  onClose,
  setTempItems,
  tempItems,
  searchDocId,
  setSearchDocId,
  setSearchDocDate,
  searchDocDate,
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
    alreadyCancelQty: "",
  };

  function addItem(item) {
    setCancelItems((prev) => {
      let newItems = structuredClone(prev);
      const alreadyExists = newItems.some(
        (v) => parseInt(v.id) === parseInt(item.id),
      );
      if (alreadyExists) return prev;
      const newRow = {
        ...item,
        styleItemId: item.styleItemId ?? "",
        uomId: item.uomId ?? "",
        hsnId: item.hsnId ?? "",
        poQty: item.poQty ?? "",
        inwardQty: item.inwardQty ?? "",
        returnQty: item.returnQty ?? "",
        balQty: item.balQty ?? "",
        poId: item.poId ?? "",
        poDocId: item?.Po?.docId ?? "",
        sizeId: item.sizeId ?? "",
        colorId: item.colorId ?? "",
        itemGroupId: item.itemGroupId ?? "",
        alreadyCancelQty: item?.alreadyCancelQty ?? "",
      };

      // find first empty row and fill it
      const emptyIndex = newItems.findIndex(
        (v) => !v.styleItemId || v.styleItemId === null,
      );

      if (emptyIndex !== -1) {
        newItems[emptyIndex] = newRow;
      } else {
        newItems.push(newRow);
      }

      return newItems;
    });
  }

  function removeItem(id) {
    setCancelItems((prev) => {
      let updated = prev.filter((item) => String(item.id) !== String(id));

      // ensure minimum 3 rows
      while (updated.length < 3) {
        updated.push({ ...EMPTY_ROW });
      }

      return updated;
    });
  }

  function handleSelectAllChange(value, cancelItems) {
    if (value) {
      cancelItems?.forEach((item) => addItem(item));
    } else {
      cancelItems?.forEach((item) => removeItem(item.id));
    }
  }

  function getSelectAll(cancelItems) {
    return cancelItems?.every((item) => isItemAddedd(item.id));
  }

  function handleChangee(id, obj) {
    if (isItemAddedd(id)) {
      removeItem(id);
    } else {
      addItem(obj);
    }
  }

  function isItemAddedd(id) {
    return (
      (cancelItems || [])?.findIndex(
        (item) => parseInt(item?.id) === parseInt(id),
      ) !== -1
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#f1f1f0]">
      {/* HEADER */}
      <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
          Purchase Order Items
        </h2>
        <button
          type="button"
          onClick={() => {
            onClose();

            setTimeout(() => {
              const firstInput = document.querySelector("#cancelQty-input-0");
              firstInput?.focus();
              firstInput?.select();
            }, 100);
          }}
          className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                     border border-green-600 flex items-center gap-1 text-xs"
        >
          Done
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-3">
        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <div className="relative w-full max-h-[420px] overflow-y-auto py-1">
              <table className="w-full border-collapse table-fixed">
                <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                  <tr>
                    {/* SELECT ALL */}
                    <th className="px-2 py-1 w-10 border border-gray-300">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-medium mb-[2px]">
                          Select
                        </span>
                        <input
                          type="checkbox"
                          className="cursor-pointer"
                          onChange={(e) =>
                            handleSelectAllChange(
                              e.target.checked,
                              tempItems ? tempItems : [],
                            )
                          }
                          checked={getSelectAll(tempItems ? tempItems : [])}
                        />
                      </div>
                    </th>

                    <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                      S No
                    </th>

                    {/* PO No with search */}
                    <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-24">
                      <label>PO No</label>
                      <input
                        type="text"
                        className="text-black h-6 focus:outline-none border border-gray-400 rounded-lg w-full mt-0.5"
                        placeholder="Search"
                        value={searchDocId}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setSearchDocId(e.target.value)}
                      />
                    </th>

                    {/* PO Date with search */}
                    <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-20">
                      <label>PO Date</label>
                      <input
                        type="text"
                        className="text-black h-6 focus:outline-none border border-gray-400 rounded-lg w-full mt-0.5"
                        placeholder="Search"
                        value={searchDocDate}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setSearchDocDate(e.target.value)}
                      />
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-52">
                      Description of Goods
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-20">
                      Size
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-28">
                      Color
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-16">
                      GSM
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-16">
                      UOM
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-20 ">
                      PO Qty
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-20">
                      Already Cancel Qty
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-24 ">
                      Already Inward Qty
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-24 ">
                      Already Return Qty
                    </th>
                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-20 ">
                      Bal Qty
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tempItems?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        No data found
                      </td>
                    </tr>
                  ) : (
                    tempItems.map((item, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } border-b cursor-pointer hover:bg-gray-50`}
                        onClick={() => handleChangee(item?.id, item)}
                      >
                        <td className="text-center py-2 border border-gray-300">
                          <input
                            type="checkbox"
                            className="cursor-pointer"
                            checked={isItemAddedd(item.id)}
                            readOnly
                          />
                        </td>

                        <td className="text-center border border-gray-300 text-[11px]">
                          {index + 1}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5">
                          {item?.Po?.docId}
                        </td>

                        <td className="border border-gray-300 px-2 py-1 text-left text-[11px]">
                          {getDateFromDateTimeToDisplay(item?.Po?.docDate)}
                        </td>

                        <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                          {item?.StyleItem?.name}
                        </td>

                        <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                          {item?.Size?.name}
                        </td>

                        <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                          {item?.Color?.name}
                        </td>
                        <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                          {item?.Gsm?.name}
                        </td>
                        <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                          {item?.Uom?.name}
                        </td>

                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                          {parseFloat(item?.poQty || 0).toFixed(2)}
                        </td>
                        <td className=" border border-gray-300 text-[11px] text-right  py-1.5 px-2">
                          {parseFloat(item?.alreadyCancelQty || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                          {parseFloat(item?.alreadyInwardQty || 0).toFixed(2)}
                        </td>

                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                          {parseFloat(item?.alreadyReturnQty || 0).toFixed(2)}
                        </td>

                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                          {parseFloat(item?.balQty || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseItemsSelection;
