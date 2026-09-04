import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

const SalesDeliveryItems = ({
  items, // This is actually saledBox
  setItems, // This is setSaledBox
  readOnly,
}) => {
  console.log(items, "scannedboxes");
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);

  // Since saledBox is padded with empty boxes, we want to only display filled ones
  const filledBoxes = items
    .map((box, index) => ({ ...box, originalIndex: index }))
    .filter((box) => box.boxId);

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

  // Ensure activeBoxIndex is valid
  let currentBox = items[activeBoxIndex];
  let actualActiveIndex = activeBoxIndex;

  if (!currentBox || !currentBox.boxId) {
    actualActiveIndex = filledBoxes[0]?.originalIndex;
    currentBox = items[actualActiveIndex];
  }

  const activeBoxItems = currentBox?.saledItems || [];

  const handleWholesalePriceChange = (value, itemIndex) => {
    const newItems = [...items];
    const newBox = { ...newItems[actualActiveIndex] };
    const newSaledItems = [...newBox.saledItems];

    const qty = Number(newSaledItems[itemIndex].qty || 0);
    const price = Number(value || 0);

    newSaledItems[itemIndex] = {
      ...newSaledItems[itemIndex],
      wholeSalePrice: value,
      price: value, // Update price as well to match normal logic if needed
      amount: value ? (qty * price).toFixed(2) : "",
    };

    newBox.saledItems = newSaledItems;
    newItems[actualActiveIndex] = newBox;
    setItems(newItems);
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
        const newItems = [...items];
        // Reset the box at that index to empty
        newItems[indexToRemove] = {
          boxId: "",
          saledItems: Array.from({ length: 5 }, () => ({ styleItemId: "" })),
        };
        setItems(newItems);
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

  return (
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
                <span className="font-bold text-[12px]">{box.docId}</span>
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
                  Style Name
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
                <th className="w-16 px-1 py-2 text-center font-medium border border-gray-300">
                  UOM
                </th>
                <th className="w-16 px-1 py-2 text-center font-medium border border-gray-300">
                  Qty
                </th>
                <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                  Wholesale Price
                </th>
                <th className="w-24 px-1 py-2 text-center font-medium border border-gray-300">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {activeBoxItems.map((item, index) => (
                <tr
                  key={index}
                  className={`h-7 text-[11px] ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/30`}
                >
                  <td className="text-center border border-gray-300">
                    {index + 1}
                  </td>
                  <td
                    className="px-2 border border-gray-300 truncate"
                    title={item.styleName}
                  >
                    {item.styleName || "-"}
                  </td>
                  <td
                    className="px-2 border border-gray-300 truncate"
                    title={item.printDesignName}
                  >
                    {item.printDesignName || "-"}
                  </td>
                  <td
                    className="text-center border border-gray-300 truncate"
                    title={item.sizeName}
                  >
                    {item.sizeName || "-"}
                  </td>
                  <td
                    className="text-center border border-gray-300 truncate"
                    title={item.colorName}
                  >
                    {item.colorName || "-"}
                  </td>
                  <td className="text-center border border-gray-300">
                    {item.uomName || "-"}
                  </td>
                  <td className="text-right px-2 border border-gray-300">
                    {item.qty || ""}
                  </td>
                  <td className="border border-gray-300">
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-full text-right px-2 py-1 outline-none bg-transparent focus:bg-white text-indigo-700 font-medium"
                      value={item.wholeSalePrice || ""}
                      onChange={(e) =>
                        handleWholesalePriceChange(e.target.value, index)
                      }
                      disabled={readOnly}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="text-right px-2 border border-gray-300 font-medium">
                    {item.amount || ""}
                  </td>
                </tr>
              ))}
              {activeBoxItems.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-gray-500 py-4 text-[12px]"
                  >
                    No items in this box.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDeliveryItems;
