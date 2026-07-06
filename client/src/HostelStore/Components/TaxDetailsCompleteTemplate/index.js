import React, { useCallback, useRef } from "react";
import { discountTypes } from "../../../Utils/DropdownData";

import { Loader } from "../../../Basic/components";
import { findFromList, substract as s } from "../../../Utils/helper";
import { useGetTaxTemplateByIdQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetTaxTermMasterQuery } from "../../../redux/services/TaxTermMasterServices";

const TaxDetailsFullTemplate = ({
  poItems,
  currentIndex: index,
  setCurrentSelectedIndex,
  readOnly,
  handleInputChange,
  isNewVersion,
  id,
  onCloseFocus,
  isSupplierOutside,
}) => {
  const row = poItems[index];
  const discountTypeRef = useRef(null);
  const discountValueRef = useRef(null);
  const taxPercentRef = useRef(null);

  if (!row) return null;

  let discountType = row["discountType"];
  let discountValue = isNaN(parseFloat(row["discountValue"]))
    ? 0
    : parseFloat(row["discountValue"]);
  let taxPercent = isNaN(parseFloat(row["taxPercent"]))
    ? 0
    : parseFloat(row["taxPercent"]);

  const handleExitToNextRow = useCallback(
    (event) => {
      if (event?.key && event.key !== "Enter" && event.key !== "Tab") {
        return;
      }

      event?.preventDefault?.();
      event?.stopPropagation?.();
      document.activeElement?.blur?.();
      setCurrentSelectedIndex("");
      window.setTimeout(() => {
        onCloseFocus?.(index);
      }, 0);
    },
    [index, onCloseFocus, setCurrentSelectedIndex],
  );

  const focusField = (fieldRef) => {
    window.setTimeout(() => {
      fieldRef.current?.focus?.();
      fieldRef.current?.select?.();
    }, 0);
  };

  const focusNextEditableField = useCallback(
    (event, currentField) => {
      if (event.key !== "Enter" && event.key !== "Tab") return;

      event.preventDefault();
      event.stopPropagation();

      const orderedFields = [
        {
          key: "discountType",
          ref: discountTypeRef,
          disabled: readOnly,
        },
        {
          key: "discountValue",
          ref: discountValueRef,
          disabled: readOnly || !discountType,
        },
        {
          key: "taxPercent",
          ref: taxPercentRef,
          disabled: readOnly,
        },
      ];

      const currentIndex = orderedFields.findIndex(
        (field) => field.key === currentField,
      );

      const nextField = orderedFields
        .slice(currentIndex + 1)
        .find((field) => !field.disabled);

      if (nextField) {
        focusField(nextField.ref);
        return;
      }

      handleExitToNextRow(event);
    },
    [discountType, handleExitToNextRow, id, isNewVersion, readOnly],
  );

  return (
    <div
      className={`${Number.isInteger(index) ? "block" : "hidden"} bg-gray-200 z-50 overflow-auto `}
    >
      <div className=" flex text-sm justify-around text-center border-t border-r border-l border-gray-500 bo font-bold p-1">
        <span>Tax Details</span>
      </div>
      <table className="border border-gray-500 w-full text-xs text-start">
        <thead className="border border-gray-500">
          <tr>
            <th className="w-52 border border-gray-500">Tax Name</th>
            <th className="w-28 border border-gray-500">Value</th>
            <th className="w-28 border border-gray-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-7">
            <td className="border border-gray-500">Gross Amount</td>
            <td className="border border-gray-500  text-right" colSpan={2}>
              {parseFloat(row?.totals?.gross)?.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-500">Discount Type</td>
            <td className="border border-gray-500" colSpan={2}>
              <select
                autoFocus
                ref={discountTypeRef}
                disabled={readOnly}
                className="text-left w-full rounded h-8 new-data-input"
                value={discountType}
                onChange={(e) =>
                  handleInputChange(e.target.value, index, "discountType")
                }
                onKeyDown={(event) =>
                  focusNextEditableField(event, "discountType")
                }
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
          <tr className="h-7">
            <td className="border border-gray-500">Discount</td>
            <td className="border border-gray-500" colSpan={2}>
              <input
                ref={discountValueRef}
                type="text"
                disabled={readOnly || !discountType}
                className="h-7 w-full text-righ table-data-input px-1"
                value={discountValue}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  handleInputChange(e.target.value, index, "discountValue")
                }
                onKeyDown={(event) =>
                  focusNextEditableField(event, "discountValue")
                }
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-500 py-1.5">Taxable Amount</td>
            <td className="border border-gray-500 text-right" colSpan={2}>
              {parseFloat(row?.totals?.taxable)?.toFixed(2)}
            </td>
          </tr>
          <tr className="h-7">
            <td className="border border-gray-500">Tax</td>
            <td className="border border-gray-500" colSpan={2}>
              <input
                ref={taxPercentRef}
                type="text"
                disabled={readOnly}
                className="h-7 w-full text-right new-data-input px-1"
                value={taxPercent}
                onChange={(e) => {
                  handleInputChange(e.target.value, index, "taxPercent");
                }}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleExitToNextRow}
              />
            </td>
          </tr>

          {isSupplierOutside ? (
            <tr className="h-7">
              <td className="border border-gray-500">IGST</td>
              <td className="border border-gray-500 text-right" colSpan={2}>
                {row?.totals?.igst?.toFixed(2)}
              </td>
            </tr>
          ) : (
            <>
              <tr className="h-7">
                <td className="border border-gray-500">CGST</td>
                <td className="border border-gray-500 text-right" colSpan={2}>
                  {row?.totals?.cgst?.toFixed(2)}
                </td>
              </tr>

              <tr className="h-7">
                <td className="border border-gray-500">SGST</td>
                <td className="border border-gray-500 text-right" colSpan={2}>
                  {row?.totals?.sgst?.toFixed(2)}
                </td>
              </tr>
            </>
          )}

          <tr className="h-7">
            <td className="border border-gray-500">Net Amount</td>
            <td className="border border-gray-500  text-right" colSpan={2}>
              {row?.totals?.net?.toFixed(2)}
            </td>
          </tr>
          {/* {formulas.filter(item => !item.isPowise).map((f, i) =>
                        <tr key={i}>
                            <td className="border border-gray-500 font-semibold">{f.displayName}</td>
                            <td className="border border-gray-500 font-semibold text-right">
                                {eval(getRegex(f.value))}
                            </td>
                            <td className="border border-gray-500 font-semibold text-right">
                                {
                                    eval(getRegex(f.amount))
                                }
                            </td>
                            
                        </tr>
                    )} */}
        </tbody>
      </table>
    </div>
  );
};

export default TaxDetailsFullTemplate;
