import React, { useEffect } from "react";
import { discountTypes } from "../../../Utils/DropdownData";
import { numberToWords } from "number-to-words";
import { numberToText } from "number-to-text";
import { groupBy } from "lodash";

const PoSummary = ({
  poItems = [],
  readOnly,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  totals,
  isNewVersion,
  id,
  setSummary,
  isCustomerExport,
}) => {
  const amount = Math.abs(totals?.net || 0);
  return (
    <div className={`bg-gray-200 rounded z-50 w-[500px]`}>
      <table className="border border-gray-500 w-full text-xs text-start">
        <thead className="border border-gray-500">
          <tr>
            <th className="w-36 border border-gray-500">Tax Details</th>
            <th className="w-28 border border-gray-500">Value</th>
            <th className="w-28 border border-gray-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-500 py-1.5">Gross Amount</td>
            <td className="border border-gray-500 text-right" colSpan={2}>
              {(totals?.gross).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-500">Discount Type</td>
            <td className="border border-gray-500" colSpan={2}>
              <select
                autoFocus
                name="type"
                disabled={readOnly || isCustomerExport}
                className="text-left w-full rounded h-8 new-data-input"
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value);
                }}
              >
                <option value={""}>Select</option>
                {discountTypes.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.show}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr className="">
            <td className="border border-gray-500">Discount</td>
            <td className="border border-gray-500">
              <input
                type="text"
                name="value"
                disabled={readOnly || !discountType || isCustomerExport}
                className="h-6 w-full text-right new-data-input"
                value={discountValue}
                onKeyDown={(e) => {
                  if (e.code === "Minus" || e.code === "NumpadSubtract")
                    e.preventDefault();
                  if (e.key === "Delete") {
                    setDiscountValue(0);
                  }
                  if (e.key === "Enter") {
                    setSummary(false);
                  }
                }}
                min={"0"}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  setDiscountValue(e.target.value);
                }}
              />
            </td>
            <td className="border border-gray-500">
              <input
                disabled
                type="text"
                name="value"
                className="h-7 w-full text-right"
                //  value={}
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-500 py-1.5">Taxable Amount</td>
            <td className="border border-gray-500 text-right" colSpan={2}>
              {(totals?.taxable).toFixed(2)}
            </td>
          </tr>
          {totals?.slabBreakup
            ?.filter((item) => item.amount > 0)
            ?.map((i) => (
              <tr className="h-7">
                <td className="border border-gray-500">{i.tax} </td>
                <td className="border border-gray-500" colSpan={2}>
                  <input
                    disabled
                    type="text"
                    name="value"
                    className="h-7 w-full text-right"
                    value={i.amount.toFixed(2)}
                  />
                </td>
              </tr>
            ))}
          <tr className="h-7">
            <td className="border border-gray-500">IGST Amount</td>
            <td className="border border-gray-500" colSpan={2}>
              <input
                disabled
                type="text"
                name="value"
                className="h-7 w-full text-right"
                value={0}
              />
            </td>
          </tr>
          <tr className="h-7">
            <td className="border border-gray-500">Net Amount</td>
            <td className="border border-gray-500" colSpan={2}>
              <input
                disabled
                type="text"
                name="value"
                className="h-7 w-full text-right"
                value={(totals?.net).toFixed(2)}
              />
            </td>
          </tr>
          <tr className="h-7">
            <td className="border border-gray-500">Round Off</td>
            <td className="border border-gray-500" colSpan={2}>
              <input
                disabled
                type="text"
                name="value"
                className="h-7 w-full text-right"
                value={parseFloat(totals?.roundOff).toFixed(2)}
              />
            </td>
          </tr>
          <tr className="h-7">
            <td className="border border-gray-500">Amount in Words</td>
            <td className="border border-gray-500" colSpan={2}>
              <input
                disabled
                type="text"
                name="value"
                className="h-7 w-full text-right"
                value={
                  amount === 0
                    ? "Rupees Zero Only"
                    : "Rupees " +
                      numberToWords
                        .toWords(amount)
                        .replace(/,/g, "") // remove commas only
                        .replace(/-/g, " ") // ✅ hyphen → space ("Fifty Five")
                        .replace(/\b\w/g, (c) => c.toUpperCase()) +
                      " Only"
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PoSummary;
