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
  setSaledBox,
  readOnly,
  taxTemplateId,
  id,
  isSupplierOutside,
  discountType,
  discountValue,
  conversionType,
  isCustomerExport,
}) => {
  console.log(items, "scannedboxes");
  const updateSaledBox = setSaledBox || setItems;
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);

  const { companyId } = getCommonParams();
  const { data: hsnList } = useGetHsnMasterQuery({ params: { companyId } });

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

  const activeBoxItems = currentBox?.saledItems || [];

  const activeBoxEnriched = useMemo(() => {
    if (!enrichedItems || !enrichedItems.items) return { items: [] };

    const boxItems = enrichedItems.items.filter(
      (item) => item.originalBoxIndex === actualActiveIndex
    );

    return { items: boxItems };
  }, [enrichedItems, actualActiveIndex]);

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
    const newSaledItems = [...newBox.saledItems];

    const qty = Number(newSaledItems[itemIndex].qty || 1);
    const price = Number(value || 0);

    newSaledItems[itemIndex] = {
      ...newSaledItems[itemIndex],
      wholeSalePrice: value,
      price: value,
      amount: value ? (qty * price).toFixed(2) : "",
    };

    newBox.saledItems = newSaledItems;
    newItems[actualActiveIndex] = newBox;
    updateSaledBox(newItems);
  };

  const handleItemInputChange = (value, itemIndex, field) => {
    if (!updateSaledBox) return;
    const newItems = [...items];
    const newBox = { ...newItems[actualActiveIndex] };
    const newSaledItems = [...newBox.saledItems];

    newSaledItems[itemIndex] = {
      ...newSaledItems[itemIndex],
      [field]: value,
    };

    newBox.saledItems = newSaledItems;
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
          saledItems: Array.from({ length: 5 }, () => ({ styleId: "" })),
        };
        updateSaledBox(newItems);
        // Automatically set active to the first available box
        const remainingBoxes = newItems
          .map((b, i) => ({ ...b, originalIndex: i }))
          .filter((b) => b.boxId);
        if (remainingBoxes.length > 0) {
          setActiveBoxIndex(remainingBoxes[0].originalIndex);
        }
      }
    });
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
      <Modal
        isOpen={Number.isInteger(currentSelectedIndex)}
        onClose={() => setCurrentSelectedIndex(null)}
      >
        <TaxDetailsFullTemplate
          readOnly={readOnly}
          taxTypeId={taxTemplateId}
          currentIndex={currentSelectedIndex}
          setCurrentSelectedIndex={setCurrentSelectedIndex}
          poItems={activeBoxEnriched?.items || activeBoxItems}
          handleInputChange={handleItemInputChange}
          id={id}
          isNewVersion={false}
          isSupplierOutside={isSupplierOutside}
        />
      </Modal>

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
                className={`p-3 rounded border cursor-pointer flex justify-between items-center transition-colors ${actualActiveIndex === box.originalIndex
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-[12px]">{box.boxCode}</span>
                  <span className="text-[10px] text-gray-500">
                    {box.saledItems.length} items
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
              Items in {currentBox?.docId || "Selected Box"}
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
                    Print Design
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
                  <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                    Wholesale Price
                  </th>
                  {!isCustomerExport && (
                    <th className="w-12 px-1 py-2 text-center font-medium border border-gray-300">
                      Tax
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeBoxItems.map((item, index) => (
                  <tr
                    key={index}
                    className={`h-7 text-[11px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
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
                    <td className="border border-gray-300">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full h-full text-right px-2 py-1 outline-none bg-transparent focus:bg-white text-indigo-700 font-medium"
                        value={
                          item.wholeSalePrice !== undefined &&
                            item.wholeSalePrice !== null
                            ? item.wholeSalePrice
                            : ""
                        }
                        onChange={(e) =>
                          handleWholesalePriceChange(e.target.value, index)
                        }
                        disabled={readOnly}
                        placeholder="0.00"
                      />
                    </td>
                    {!isCustomerExport && (
                      <td className="border border-gray-300 text-center">
                        <button
                          type="button"
                          disabled={
                            !item.styleId && !item.modelName && !item.styleNo
                          }
                          className="text-indigo-600 w-full hover:text-indigo-800 disabled:text-gray-300 flex items-center justify-center p-1 cursor-pointer"
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
                  </tr>
                ))}
                {activeBoxItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={isCustomerExport ? 10 : 11}
                      className="text-center text-gray-500 py-4 text-[12px]"
                    >
                      No items in this box.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-100 font-bold text-gray-800 text-[11px] sticky bottom-0 z-10 border-t border-gray-300">
                <tr className="h-7 bg-indigo-50 border-b border-gray-300">
                  <td colSpan={4} className="border border-gray-300"></td>
                  <td className="text-right px-2 border border-gray-300 text-indigo-800 font-bold">
                    Box Discount
                  </td>
                  <td className="border border-gray-300 p-0">
                    <select
                      className="w-full h-full outline-none bg-transparent px-1 text-right text-indigo-700 font-bold cursor-pointer"
                      value={currentBox?.boxDiscountType || ""}
                      onChange={(e) => handleBoxDiscountChange("type", e.target.value)}
                      disabled={readOnly}
                    >
                      <option value="">Select</option>
                      <option value="Percentage">Percentage</option>
                      <option value="Flat">Flat</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="w-full h-full outline-none bg-transparent px-2 text-right text-indigo-700 font-bold placeholder-indigo-300"
                      value={currentBox?.boxDiscountValue || ""}
                      onChange={(e) => handleBoxDiscountChange("value", e.target.value)}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border border-gray-300"></td>
                  <td className="text-right px-2 border border-gray-300 font-bold">
                    Total Wholesale Price
                  </td>
                  <td className="text-right px-2 border border-gray-300 text-indigo-700 font-bold">
                    {activeBoxItems
                      .reduce(
                        (sum, item) =>
                          sum + (parseFloat(item.wholeSalePrice) || 0),
                        0,
                      )
                      .toFixed(2)}
                  </td>
                  {!isCustomerExport && (
                    <td className="border border-gray-300 bg-gray-200"></td>
                  )}
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
