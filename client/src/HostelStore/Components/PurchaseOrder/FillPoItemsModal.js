import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FxSelectWithAdd } from "../../../Inputs";

const formatINR = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined || amount === "")
    return "";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const FillPoItemsModal = ({
  id,
  isNewVersion,
  quoteVersion,
  poItems,
  setPoItems,
  itemVariantList,
  onClose,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [rows, setRows] = useState([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkQty, setBulkQty] = useState("");

  const selectedVariant = itemVariantList?.data?.find(
    (v) => v.id === selectedVariantId,
  );

  useEffect(() => {
    const details = selectedVariant?.ItemVariantMasterDetails || [];
    setRows(
      details.map((d) => ({
        detailId: d.id,
        printingDesignId: d.printingDesignId,
        printingDesignName: d.printingDesign?.name || "",
        sizeId: d.sizeId,
        sizeName: d.size?.name || "",
        colorId: d.colorId,
        colorName: d.color?.name || "",
        price: d.price ?? "",
        mrpPrice: d.mrpPrice ?? "",
        qty: "",
      })),
    );
    setBulkPrice("");
    setBulkQty("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariantId]);

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const deleteRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const applyBulkValues = () => {
    if (!rows.length) return;
    if (bulkPrice === "" && bulkQty === "") {
      toast.info("Enter Base Price and/or Qty to apply", {
        position: "top-center",
      });
      return;
    }
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        price: bulkPrice !== "" ? bulkPrice : r.price,
        qty: bulkQty !== "" ? bulkQty : r.qty,
      })),
    );
  };

  const maxQuoteVersion = Math.max(
    ...poItems
      .map((i) => parseInt(i.quoteVersion))
      .filter((v) => !isNaN(v) && v > 0),
    0,
  );
  const effectiveQuoteVersion = quoteVersion || maxQuoteVersion || "";

  const isVisibleRow = (row) => {
    if (!id) return true;
    if (isNewVersion) return row.quoteVersion === "New";
    if (!effectiveQuoteVersion) return row.quoteVersion !== "New";
    return parseInt(row.quoteVersion) === parseInt(effectiveQuoteVersion);
  };

  const handleFillPoItems = () => {
    if (!selectedVariantId) {
      toast.info("Please select an Item Variant", { position: "top-center" });
      return;
    }

    const selectedRows = rows.filter((r) => Number(r.qty) > 0);
    if (!selectedRows.length) {
      toast.info("Please enter quantity for at least one item", {
        position: "top-center",
      });
      return;
    }

    const buildComboKey = (variantId, printingDesignId, sizeId, colorId) =>
      [variantId, printingDesignId, sizeId, colorId].join("-");

    const existingComboKeys = new Set(
      poItems
        .filter((row) => row.itemVariantId && isVisibleRow(row))
        .map((row) =>
          buildComboKey(
            row.itemVariantId,
            row.printingDesignId,
            row.sizeId,
            row.colorId,
          ),
        ),
    );

    const duplicateRows = [];
    const rowsToFill = [];

    selectedRows.forEach((r) => {
      const key = buildComboKey(
        selectedVariantId,
        r.printingDesignId,
        r.sizeId,
        r.colorId,
      );
      if (existingComboKeys.has(key)) {
        duplicateRows.push(r);
      } else {
        rowsToFill.push(r);
        existingComboKeys.add(key);
      }
    });

    if (duplicateRows.length) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Items Found",
        html: `The following combinations already exist in this Purchase Order and were skipped:<br/><br/>${duplicateRows
          .map(
            (r) => `${r.printingDesignName} - ${r.sizeName} - ${r.colorName}`,
          )
          .join("<br/>")}`,
        confirmButtonText: "OK",
      });
    }

    if (!rowsToFill.length) {
      return;
    }

    const rowVersion = id
      ? isNewVersion
        ? "New"
        : effectiveQuoteVersion
      : effectiveQuoteVersion;

    const newRows = rowsToFill.map((r) => ({
      itemVariantId: selectedVariantId,
      styleId: selectedVariant?.styleId || "",
      hsnId: selectedVariant?.hsnId || "",
      taxPercent: selectedVariant?.Hsn?.tax,
      uomId: selectedVariant?.uomId || "",
      printingDesignId: r.printingDesignId,
      sizeId: r.sizeId,
      colorId: r.colorId,
      price: r.price,
      mrpPrice: r.mrpPrice,
      qty: r.qty,
      quoteVersion: rowVersion,
      netAmount: 0,
    }));

    setPoItems((prev) => {
      const updated = structuredClone(prev);
      let cursor = 0;
      for (let i = 0; i < updated.length && cursor < newRows.length; i++) {
        if (!updated[i].itemVariantId && isVisibleRow(updated[i])) {
          updated[i] = { ...updated[i], ...newRows[cursor] };
          cursor++;
        }
      }
      while (cursor < newRows.length) {
        updated.push(newRows[cursor]);
        cursor++;
      }
      return updated;
    });

    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-[#f1f1f0]">
      <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
          Fill Purchase Order Items
        </h2>
        <button
          type="button"
          onClick={handleFillPoItems}
          className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600
                     border border-blue-600 flex items-center gap-1 text-xs font-semibold"
        >
          Fill POItems
        </button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <div className="bg-white p-3 rounded-md border border-gray-200">
          <div className="mb-3 flex items-end gap-3 flex-wrap">
            <div className="w-72">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Item Variant
              </label>
              <div className="w-full h-8 px-2 flex items-center border border-gray-300 rounded-lg">
                <div className="flex-1 w-full">
                  <FxSelectWithAdd
                    value={selectedVariantId}
                    onChange={(val) => setSelectedVariantId(val)}
                    options={(itemVariantList?.data || [])
                      .filter((item) => (id ? true : item.active))
                      .map((item) => ({
                        label:
                          item.styleMaster?.modelName?.name ||
                          `Variant ${item.id}`,
                        value: item.id,
                      }))}
                    placeholder="Select Item Variant"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </div>
              </div>
            </div>

            <div className="w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Base Price
              </label>
              <input
                type="number"
                min="0"
                className="h-8 w-full px-2 border border-gray-300 rounded-lg text-xs"
                value={bulkPrice}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setBulkPrice(e.target.value)}
                disabled={!selectedVariantId}
              />
            </div>

            <div className="w-28">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Qty
              </label>
              <input
                type="number"
                min="0"
                className="h-8 w-full px-2 border border-gray-300 rounded-lg text-xs"
                value={bulkQty}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setBulkQty(e.target.value)}
                disabled={!selectedVariantId}
              />
            </div>

            <button
              type="button"
              onClick={applyBulkValues}
              disabled={!selectedVariantId}
              className="h-8 px-4 text-xs font-semibold rounded bg-indigo-600 text-white
                         hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </div>

          <div className="border border-slate-200 rounded-md shadow-sm">
            <div className="relative w-full max-h-[420px] overflow-y-auto py-1">
              <table className="w-full border-collapse table-fixed">
                <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                      S.No
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs">
                      Printing Design
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs">
                      Size
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs">
                      Color
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs w-28">
                      Base Price
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs w-28">
                      MRP Price
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs w-24">
                      Qty
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs w-14">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedVariantId ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-4 text-center text-gray-500 text-xs"
                      >
                        Select an Item Variant to load its details
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-4 text-center text-gray-500 text-xs"
                      >
                        No variant details found
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr
                        key={row.detailId ?? index}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } border-b`}
                      >
                        <td className="text-center border border-gray-300 text-[11px]">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 text-[11px] px-2 py-1">
                          {row.printingDesignName}
                        </td>
                        <td className="border border-gray-300 text-[11px] px-2 py-1">
                          {row.sizeName}
                        </td>
                        <td className="border border-gray-300 text-[11px] px-2 py-1">
                          {row.colorName}
                        </td>
                        <td className="border border-gray-300 text-[11px] p-0">
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-transparent px-2 py-1 text-right"
                            value={row.price}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              updateRow(index, "price", e.target.value)
                            }
                          />
                        </td>
                        <td className="border border-gray-300 text-[11px] px-2 py-1 text-right">
                          {formatINR(row.mrpPrice)}
                        </td>
                        <td className="border border-gray-300 text-[11px] p-0">
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-transparent px-2 py-1 text-right"
                            value={row.qty}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              updateRow(index, "qty", e.target.value)
                            }
                          />
                        </td>
                        <td className="border border-gray-300 text-center">
                          <button
                            type="button"
                            onClick={() => deleteRow(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove row"
                          >
                            <MdDelete />
                          </button>
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

export default FillPoItemsModal;
