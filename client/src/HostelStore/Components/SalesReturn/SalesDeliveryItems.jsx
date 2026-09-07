import React, { useState, useMemo } from "react";
import { FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import { VIEW } from "../../../icons";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary";
import { getCommonParams } from "../../../Utils/helper";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";

const SalesDeliveryItems = ({
  items, // This is actually saledBox
  enrichedItems,
  setItems,
  setSalesReturnBox,
  readOnly,
  taxTemplateId,
  id,
  isSupplierOutside,
  discountType,
  discountValue,
  conversionType,
  isCustomerExport,
  setCustomerId,
}) => {
  const updateSaledBox = setSalesReturnBox || setItems;
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);

  // Since saledBox is padded with empty boxes, we want to only display filled ones
  const filledBoxes = useMemo(() => {
    return (items || [])
      .map((box, index) => ({ ...box, originalIndex: index }))
      .filter((box) => box.boxId);
  }, [items]);

  // Ensure activeBoxIndex is valid
  let actualActiveIndex = activeBoxIndex;
  let currentBox = items[actualActiveIndex];

  if (!currentBox || !currentBox.boxId) {
    actualActiveIndex = filledBoxes[0]?.originalIndex ?? 0;
    currentBox = items[actualActiveIndex];
  }

  const activeBoxItems = currentBox?.salesReturnBoxItems || [];

  // If no boxes are scanned, show a placeholder
  if (filledBoxes.length === 0) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-gray-400 text-lg font-medium mb-2">
          No Boxes Scanned
        </div>
        <div className="text-gray-400 text-[12px]">
          Use the Box QR Code Scan field to add boxes.
        </div>
      </div>
    );
  }

  const handleWholesalePriceChange = (value, itemIndex) => {
    if (!updateSaledBox) return;
    const newItems = [...items];
    const newBox = { ...newItems[actualActiveIndex] };
    const newsalesReturnBoxItems = [...newBox.salesReturnBoxItems];

    const qty = Number(newsalesReturnBoxItems[itemIndex].qty || 1);
    const price = Number(value || 0);

    newsalesReturnBoxItems[itemIndex] = {
      ...newsalesReturnBoxItems[itemIndex],
      wholeSalePrice: value,
      price: value,
      amount: value ? (qty * price).toFixed(2) : "",
    };

    newBox.salesReturnBoxItems = newsalesReturnBoxItems;
    newItems[actualActiveIndex] = newBox;
    updateSaledBox(newItems);
  };

  const handleItemInputChange = (value, itemIndex, field) => {
    if (!updateSaledBox) return;
    const newItems = [...items];
    const newBox = { ...newItems[actualActiveIndex] };
    const newsalesReturnBoxItems = [...newBox.salesReturnBoxItems];

    newsalesReturnBoxItems[itemIndex] = {
      ...newsalesReturnBoxItems[itemIndex],
      [field]: value,
    };

    newBox.salesReturnBoxItems = newsalesReturnBoxItems;
    newItems[actualActiveIndex] = newBox;
    updateSaledBox(newItems);
  };

  const handleRemoveBox = (indexToRemove) => {
    Swal.fire({
      title: "Remove Box?",
      text: "Are you sure you want to remove this box from the delivery?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        if (!updateSaledBox) return;
        const newItems = [...items];
        // Reset the box at that index to empty
        newItems[indexToRemove] = {
          boxId: "",
          salesReturnBoxItems: Array.from({ length: 5 }, () => ({
            styleId: "",
          })),
        };
        updateSaledBox(newItems);
        // Automatically set active to the first available box
        const remainingBoxes = newItems
          .map((b, i) => ({ ...b, originalIndex: i }))
          .filter((b) => b.boxId);
        if (remainingBoxes.length > 0) {
          setActiveBoxIndex(remainingBoxes[0].originalIndex);
        } else if (setCustomerId) {
          setCustomerId("");
        }
      }
    });
  };

  const handleRemoveItem = (itemIndex) => {
    if (!updateSaledBox) return;
    const newItems = [...items];
    const newBox = { ...newItems[actualActiveIndex] };
    const newsalesReturnBoxItems = [...newBox.salesReturnBoxItems];

    newsalesReturnBoxItems.splice(itemIndex, 1);

    if (newsalesReturnBoxItems.length === 0) {
      newItems[actualActiveIndex] = {
        boxId: "",
        salesReturnBoxItems: Array.from({ length: 5 }, () => ({ styleId: "" })),
      };
    } else {
      newBox.salesReturnBoxItems = newsalesReturnBoxItems;
      newItems[actualActiveIndex] = newBox;
    }

    updateSaledBox(newItems);

    const remainingBoxes = newItems.filter((b) => b.boxId);
    if (remainingBoxes.length === 0 && setCustomerId) {
      setCustomerId("");
    }
  };

  const handleBoxDiscountChange = (field, value) => {
    if (!updateSaledBox) return;
    const newItems = [...items];
    const newBox = { ...newItems[actualActiveIndex] };

    if (field === "type") {
      newBox.boxDiscountType = value;
    } else {
      newBox.boxDiscountValue = value;
    }

    newItems[actualActiveIndex] = newBox;
    updateSaledBox(newItems);
  };

  return (
    <>
      <div className="w-full min-h-[400px] h-[50vh] flex bg-white border border-gray-200">
        {/* Left Pane - Box List */}
        <div className="w-64 border-r border-gray-200 flex flex-col bg-slate-50">
          <div className="bg-gray-200 text-gray-800 text-[12px] font-bold p-2 text-center border-b border-gray-300">
            Scanned Boxes ({filledBoxes.length})
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filledBoxes.map((box) => (
              <div
                key={box.originalIndex}
                onClick={() => setActiveBoxIndex(box.originalIndex)}
                className={`p-3 rounded border cursor-pointer flex justify-between items-center transition-colors ${
                  actualActiveIndex === box.originalIndex
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-[12px]">{box.boxCode}</span>
                  <span className="text-[10px] text-gray-500">
                    {box.salesReturnBoxItems.length} items
                  </span>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBox(box.originalIndex);
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remove Box"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane - Items List */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="bg-gray-100 p-2 border-b border-gray-200 flex justify-between items-center">
            <span className="text-[13px] font-bold text-gray-700">
              Items in {currentBox?.boxCode || "Selected Box"}{" "}
              {currentBox?.salesDeliveryDocId
                ? `|| Sales Delivery No - (${currentBox.salesDeliveryDocId})`
                : ""}
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full table-fixed">
              <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10 text-[11px]">
                <tr>
                  <th className="w-10 px-1 py-2 text-center font-medium border border-gray-300">
                    S.No
                  </th>
                  <th className="w-32 px-1 py-2 text-center font-medium border border-gray-300">
                    Description of Goods
                  </th>
                  <th className="w-20 px-1 py-2 text-center font-medium border border-gray-300">
                    Style No
                  </th>
                  <th className="w-16 px-1 py-2 text-center font-medium border border-gray-300">
                    HSN Code
                  </th>
                  <th className="w-32 px-1 py-2 text-center font-medium border border-gray-300">
                    Printing Design
                  </th>
                  <th className="w-20 px-1 py-2 text-center font-medium border border-gray-300">
                    Size
                  </th>
                  <th className="w-20 px-1 py-2 text-center font-medium border border-gray-300">
                    Color
                  </th>
                  <th className="w-12 px-1 py-2 text-center font-medium border border-gray-300">
                    UOM
                  </th>
                  <th className="w-36 px-1 py-2 text-center font-medium border border-gray-300">
                    QR Code
                  </th>
                  <th className="w-16 px-1 py-2 text-center font-medium border border-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeBoxItems.map((item, index) => (
                  <tr
                    key={index}
                    className={`h-7 text-[11px] ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    } hover:bg-indigo-50/30`}
                  >
                    <td className="text-center border border-gray-300">
                      {index + 1}
                    </td>
                    <td
                      className="px-2 text-left border border-gray-300 truncate"
                      title={item.modelName}
                    >
                      {item.modelName || "-"}
                    </td>
                    <td
                      className="px-2 text-left border border-gray-300 truncate"
                      title={item.styleNo}
                    >
                      {item.styleNo || "-"}
                    </td>
                    <td
                      className="px-2 text-left border border-gray-300 truncate"
                      title={item.hsnCode}
                    >
                      {item.hsnCode || "-"}
                    </td>
                    <td
                      className="px-2 text-left border border-gray-300 truncate"
                      title={item.printDesignName}
                    >
                      {item.printDesignName || "-"}
                    </td>
                    <td
                      className="px-2 text-left border border-gray-300 truncate"
                      title={item.sizeName}
                    >
                      {item.sizeName || "-"}
                    </td>
                    <td
                      className="px-2 text-left border border-gray-300 truncate"
                      title={item.colorName}
                    >
                      {item.colorName || "-"}
                    </td>
                    <td className="px-2 text-left border border-gray-300">
                      {item.uomName || "-"}
                    </td>
                    <td className="px-2 text-left border border-gray-300">
                      {item.qrCode || ""}
                    </td>
                    <td className="border border-gray-300 text-center">
                      {!readOnly && (
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-600 p-1"
                          onClick={() => handleRemoveItem(index)}
                          title="Remove Item"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {activeBoxItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center text-gray-500 py-4 text-[12px]"
                    >
                      No items in this box.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-100 font-bold text-gray-800 text-[11px] sticky bottom-0 z-10 border-t border-gray-300">
                <tr className="h-7 bg-indigo-50 border-b border-gray-300">
                  <td colSpan={10} className="border border-gray-300"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesDeliveryItems;
