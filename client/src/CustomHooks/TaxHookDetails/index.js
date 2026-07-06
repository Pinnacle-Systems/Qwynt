import React, { useEffect, useState } from "react";

import { substract as s } from "../../Utils/helper";
import { useGetTaxTemplateByIdQuery } from "../../redux/services/TaxTemplateServices";
import { useGetTaxTermMasterQuery } from "../../redux/services/TaxTermMasterServices";

const useTaxDetailsHook = ({
  poItems,
  taxTypeId,
  isSupplierOutside = false,
  discountType: overAllDiscountType,
  discountValue: overAllDiscountValue,
}) => {
  const substract = s;
  const [formulas, setFormulas] = useState([]);

  const { data, isLoading, isFetching } = useGetTaxTemplateByIdQuery(
    taxTypeId,
    { skip: !taxTypeId },
  );

  const {
    data: taxTermMaster,
    isLoading: isTemplateTermLoading,
    isFetching: isTemplateTermFetching,
  } = useGetTaxTermMasterQuery(taxTypeId, { skip: !taxTypeId });

  function evaluateFormula({
    formula,
    price,
    qty,
    discountType,
    discountValue,
    taxPercent,
    overAllDiscountType,
    overAllDiscountValue,
  }) {
    const baseAmount = price * qty;

    const discount =
      discountType === "Flat"
        ? discountValue
        : (baseAmount * discountValue) / 100;

    const taxableAmount = baseAmount - discount;

    const overAllDiscount =
      overAllDiscountType === "Flat"
        ? overAllDiscountValue
        : (taxableAmount * overAllDiscountValue) / 100;

    const add = (...args) => args.reduce((s, v) => s + (Number(v) || 0), 0);
    const sub = (a, b) => a - b;
    const mul = (a, b) => a * b;
    const div = (a, b) => (b === 0 ? 0 : a / b);

    return Number(eval(formula)) || 0;
  }

  function getRegex(formula) {
    if (!formula) return formula;
    let input = formula;
    const words = formula.match(/\{(.*?)\}/g);
    if (!words) return formula;
    words.forEach((element) => {
      input = input.replace(element, getFormula(element.slice(1, -1)));
    });
    return getRegex(input);
  }

  function getFormula(constant) {
    const split = constant.split("_");
    let name = split[0];
    let value = split[1];
    let formula = formulas.find((f) => f.name === name);
    return formula ? formula[value.toLowerCase()] : "";
  }
  useEffect(() => {
    if (data) {
      setFormulas(
        data.data.TaxTemplateDetails.map((f) => {
          return {
            name: getName(f.taxTermId),
            isPowise: getIsPoItem(f?.taxTermId),
            displayName: f.displayName,
            value: f.value,
            amount: f.amount,
          };
        }),
      );
    }
  }, [
    isLoading,
    isFetching,
    isTemplateTermFetching,
    isTemplateTermLoading,
    taxTypeId,
  ]);

  if (!taxTypeId) return { data: null };
  function getName(id) {
    if (!taxTermMaster) return "";
    let data = taxTermMaster.data.find((t) => parseInt(t.id) === parseInt(id));
    if (!data) return "";
    return data.name;
  }

  function getFormulaByName(formulaName) {
    let formula = formulas.find((f) => f.name === formulaName);
    return formula ? formula : "";
  }

  function getIsPoItem(id) {
    if (!taxTermMaster) return false;
    let data = taxTermMaster.data.find((t) => parseInt(t.id) === parseInt(id));
    if (!data) return false;
    return data.isPoWise;
  }

  function getTotalQuantity(taxTerm, valueOrAmount) {
    const formula = getRegex(getFormulaByName(taxTerm)?.[valueOrAmount]);
    if (!formula) return 0;

    return poItems.reduce((acc, row) => {
      const price = Number(row.price) || 0;
      const qty = Number(row.qty) || 0;
      const discountType = row.discountType;
      const discountValue = Number(row.discountValue) || 0;
      const taxPercent = Number(row.taxPercent) || 0;

      return (
        acc +
        evaluateFormula({
          formula,
          price,
          qty,
          discountType,
          discountValue,
          taxPercent,
          overAllDiscountType,
          overAllDiscountValue,
        })
      );
    }, 0);
  }

  if (!formulas || isFetching || isLoading) {
    return {
      isLoading:
        isTemplateTermFetching ||
        isTemplateTermLoading ||
        isLoading ||
        isFetching,
    };
  }
  let grossAmount = getTotalQuantity("GROSS", "amount");
  let discountAmount = getTotalQuantity("DISCOUNT", "amount");
  let taxableAmount = getTotalQuantity("TAXABLE", "amount");
  let cgstAmount = getTotalQuantity("CGST", "amount");
  let sgstAmount = getTotalQuantity("SGST", "amount");
  let igstAmount = getTotalQuantity("IGST", "amount");
  let roundOffAmount = getTotalQuantity("ROUNDOFF", "amount");
  let netAmount = getTotalQuantity("NET", "amount");
  let overAllDiscountAmount = getTotalQuantity("OVERALLDISCOUNT", "amount");
  return {
    sgstAmount,
    grossAmount,
    netAmount,
    discountAmount,
    cgstAmount,
    igstAmount,
    // igstValue,
    // sgstValue,
    // cgstValue,
    taxableAmount,
    overAllDiscountAmount,
    roundOffAmount,
    isLoading:
      isTemplateTermFetching ||
      isTemplateTermLoading ||
      isLoading ||
      isFetching,
  };
};

export default useTaxDetailsHook;
