import React from "react";
import { fmt3, fmtDate } from "./salesReportUtils";

export default function ExpandedRowDetail({ row }) {
  const boxes = row.boxes || [];

  const charge = parseFloat(row.carriageCharge) || 0;
  const tax = parseFloat(row.carriageTax) || 0;
  let carriageFinalAmt = 0;
  if (row.carriageTaxType === "Percentage") {
    carriageFinalAmt = charge + (charge * tax) / 100;
  } else if (row.carriageTaxType === "Flat") {
    carriageFinalAmt = charge + tax;
  } else {
    carriageFinalAmt = charge + (charge * tax) / 100;
  }
  console.log(row, "oashfasfh");
  return (
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 text-xs">
      {/* meta */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 mb-3">
        <span>
          Delivery Date:{" "}
          <strong className="text-gray-700">
            {fmtDate(row.deliveryDate) || "—"}
          </strong>
        </span>
        <span>
          Vehicle No:{" "}
          <strong className="text-gray-700">{row?.vehicleNo || ""}</strong>
        </span>
        <span>
          Weight:{" "}
          <strong className="text-gray-700">
            {fmt3(row?.weightInKg) || ""}
          </strong>
        </span>
        {!row?.isCustomerExport && (
          <>
            {" "}
            <span>
              Overall Discount Type:{" "}
              <strong className="text-gray-700">
                {row?.discountType || ""}
              </strong>
            </span>
            <span>
              Overall Discount Value:{" "}
              <strong className="text-gray-700">
                {row?.discountValue || ""}
              </strong>
            </span>
          </>
        )}

        <span>
          Carriage Charges:{" "}
          <strong className="text-gray-700">
            {charge > 0 ? fmt3(charge) : "—"}
          </strong>
        </span>
        <span>
          Carriage Tax Type:{" "}
          <strong className="text-gray-700">
            {row.carriageTaxType || "—"}
          </strong>
        </span>
        <span>
          Carriage Final Amount:{" "}
          <strong className="text-gray-700">
            {carriageFinalAmt > 0 ? fmt3(carriageFinalAmt) : "—"}
          </strong>
        </span>
        <span>
          Total Value:{" "}
          <strong className="text-gray-700">{fmt3(row.totalValue)}</strong>
        </span>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100/80 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">
                Box No
              </th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">
                Model Name
              </th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">
                Style No
              </th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">
                HSN Code
              </th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">
                Printing Design
              </th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">
                Cutting Pattern
              </th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">
                Color
              </th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">
                Size
              </th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap text-right">
                Wholesale Price
              </th>

              {!row?.isCustomerExport && (
                <>
                  <th className="px-3 py-1.5 font-medium whitespace-nowrap text-right">
                    Discount
                  </th>
                  <th className="px-3 py-1.5 font-medium whitespace-nowrap text-right">
                    Taxable Amount
                  </th>
                  <th className="px-3 py-1.5 font-medium whitespace-nowrap text-right">
                    Tax %
                  </th>
                  <th className="px-3 py-1.5 font-medium whitespace-nowrap text-right">
                    Net Amount
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {boxes.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-center text-gray-400">
                  No boxes found
                </td>
              </tr>
            )}
            {boxes.map((box, bIdx) => {
              if (!box.items || box.items.length === 0) {
                return (
                  <tr key={box.id}>
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {box.boxNo}
                    </td>
                    <td colSpan={8} className="px-3 py-2 text-gray-400 italic">
                      No items in this box
                    </td>
                  </tr>
                );
              }
              let totalWholesale = 0;
              let totalDiscountAmt = 0;
              let totalTaxable = 0;
              let totalNet = 0;

              const itemRows = box.items.map((item, iIdx) => {
                let currentPrice = item.wholeSalePrice || 0;
                let itemDiscAmt = 0;
                let boxDiscAmt = 0;
                let overallDiscAmt = 0;

                // 1. Item Discount
                if (item.discountValue) {
                  if (
                    item.discountType === "Percentage" ||
                    item.discountType === "%"
                  ) {
                    itemDiscAmt = (currentPrice * item.discountValue) / 100;
                  } else {
                    itemDiscAmt = item.discountValue;
                  }
                }
                currentPrice -= itemDiscAmt;

                // 2. Box Discount
                if (box.boxDiscountValue) {
                  if (
                    box.boxDiscountType === "Percentage" ||
                    box.boxDiscountType === "%"
                  ) {
                    boxDiscAmt = (currentPrice * box.boxDiscountValue) / 100;
                  } else {
                    boxDiscAmt =
                      box.boxDiscountValue / (box.totalBoxItems || 1);
                  }
                }
                currentPrice -= boxDiscAmt;

                // 3. Overall Delivery Discount
                if (row.discountValue) {
                  if (
                    row.discountType === "Percentage" ||
                    row.discountType === "%"
                  ) {
                    overallDiscAmt = (currentPrice * row.discountValue) / 100;
                  } else {
                    overallDiscAmt = row.discountValue / (row.totalItems || 1);
                  }
                }
                currentPrice -= overallDiscAmt;

                // Total Discount and Tax
                let totalDiscount = itemDiscAmt + boxDiscAmt + overallDiscAmt;
                let taxPercent = item.taxPercent || 0;
                let taxAmt = (currentPrice * taxPercent) / 100;
                let netAmount = currentPrice + taxAmt;

                totalWholesale += item.wholeSalePrice || 0;
                totalDiscountAmt += totalDiscount;
                totalTaxable += currentPrice;
                totalNet += netAmount;

                return (
                  <tr
                    key={`${box.id}-${item.id}`}
                    className="hover:bg-gray-50/50"
                  >
                    {/* Only show box No on the first row of that box */}
                    {iIdx === 0 ? (
                      <td
                        rowSpan={box.items.length}
                        className="px-3 py-2 align-top border-r border-gray-100 bg-gray-50/30"
                      >
                        <div className="font-medium text-gray-800">
                          {box.boxNo}
                        </div>
                        <div className="text-gray-400 mt-0.5">
                          {box.totalBoxItems} items
                        </div>
                        {box.boxDiscountValue ? (
                          <div className="text-blue-500 mt-2 text-[10px] uppercase font-semibold">
                            {box.boxDiscountType === "Percentage" ||
                            box.boxDiscountType === "%"
                              ? "Disc %"
                              : "Disc Amt"}
                            <br />
                            <span className="text-blue-700 text-xs">
                              {fmt3(box.boxDiscountValue)}
                            </span>
                          </div>
                        ) : null}
                      </td>
                    ) : null}
                    <td className="px-3 py-2">{item.modelName}</td>
                    <td className="px-3 py-2">{item.styleNo}</td>
                    <td className="px-3 py-2">{item.hsn}</td>
                    <td className="px-3 py-2">{item.printingDesign}</td>
                    <td className="px-3 py-2">{item.cuttingPattern}</td>
                    <td className="px-3 py-2">{item.color}</td>
                    <td className="px-3 py-2">{item.size}</td>
                    <td className="px-3 py-2 text-right">
                      {fmt3(item.wholeSalePrice)}
                    </td>
                    {!row?.isCustomerExport && (
                      <>
                        <td className="px-3 py-2 text-right">
                          {totalDiscount > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className="text-red-600 font-medium">
                                -{fmt3(totalDiscount)}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {fmt3(currentPrice)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {taxPercent > 0 ? `${taxPercent}%` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          {fmt3(netAmount)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              });

              return (
                <React.Fragment key={box.id}>
                  {itemRows}
                  <tr className="bg-gray-50/80 font-semibold border-t border-gray-100 text-gray-800">
                    <td colSpan={8} className="px-3 py-2 text-right">
                      Total:
                    </td>
                    <td className="px-3 py-2 text-right">
                      {fmt3(totalWholesale)}
                    </td>
                    {!row?.isCustomerExport && (
                      <>
                        <td className="px-3 py-2 text-right text-red-600">
                          {totalDiscountAmt > 0
                            ? `-${fmt3(totalDiscountAmt)}`
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {fmt3(totalTaxable)}
                        </td>
                        <td className="px-3 py-2 text-right">—</td>
                        <td className="px-3 py-2 text-right text-gray-900">
                          {fmt3(totalNet)}
                        </td>
                      </>
                    )}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
