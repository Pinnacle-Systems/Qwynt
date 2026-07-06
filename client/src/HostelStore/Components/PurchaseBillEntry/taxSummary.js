import { useEffect } from "react";

export function calculateTaxWithHSNBreakupAndInsertIntoInwardItems(
  inwardItems = [],
  isSupplierOutside = false,
  discountType,
  discountValue,
) {
  let roundTo = 2;

  const result = {
    gross: 0,
    itemDiscount: 0,
    overallDiscount: 0,
    taxable: 0,
    roundOff: 0,
    net: 0,
    slabBreakup: [],
    hsnBreakup: {},
  };

  const slabMap = {};
  const hsnMap = {};

  // ---- Step 1: Base item calc ----
  inwardItems?.forEach((item) => {
    const qty = Number(item?.inwardQty) || 0;
    const price = Number(item?.price) || 0;
    const taxPct = Number(item?.taxPercent) || 0;
    const discountVal = Number(item?.discountValue) || 0;
    const dType = item?.discountType || "Flat";
    const hsn = item?.hsn || "NA";

    const gross = qty * price;

    const itemDiscount =
      dType === "Flat" ? discountVal : (gross * discountVal) / 100;

    const taxableBeforeOverall = gross - itemDiscount;

    // 👉 Attach base values directly into inwardItems
    item._gross = gross;
    item._itemDiscount = itemDiscount;
    item._taxableBeforeOverall = taxableBeforeOverall;
    item._hsn = hsn;
    item._taxPct = taxPct;
  });

  const totalTaxableBeforeOverall = inwardItems.reduce(
    (s, i) => s + i._taxableBeforeOverall,
    0,
  );

  // ---- Step 2: Overall discount ----
  let overallDiscount = 0;
  if (discountType == "Flat") {
    overallDiscount = discountValue;
  } else {
    overallDiscount = (totalTaxableBeforeOverall * discountValue) / 100;
  }

  // ---- Step 3: Apply overall + GST per item ----
  inwardItems.forEach((item) => {
    const ratio =
      totalTaxableBeforeOverall === 0
        ? 0
        : item._taxableBeforeOverall / totalTaxableBeforeOverall;

    const overallShare = overallDiscount * ratio;
    const finalTaxable = item._taxableBeforeOverall - overallShare;

    let cgst = 0,
      sgst = 0,
      igst = 0;
    const taxType = item.taxType || (isSupplierOutside ? "IGST" : "CGST_SGST");
    if (taxType === "IGST") {
      igst = (finalTaxable * item._taxPct) / 100;
    } else {
      const half = item._taxPct / 2;
      cgst = (finalTaxable * half) / 100;
      sgst = (finalTaxable * half) / 100;
    }

    const net = finalTaxable + cgst + sgst + igst;

    // 👉 INSERT totals INTO inwardItems
    item.totals = {
      gross: +item._gross.toFixed(roundTo),
      itemDiscount: +item._itemDiscount.toFixed(roundTo),
      overallDiscountShare: +overallShare.toFixed(roundTo),
      taxable: +finalTaxable.toFixed(roundTo),
      cgst: +cgst.toFixed(roundTo),
      sgst: +sgst.toFixed(roundTo),
      igst: +igst.toFixed(roundTo),
      net: +net.toFixed(roundTo),
    };

    // ---- Global + slab + hsn ----
    result.gross += item._gross;
    result.itemDiscount += item._itemDiscount;
    result.overallDiscount += overallShare;
    result.taxable += finalTaxable;

    if (taxType === "IGST") {
      const key = `IGST_${item._taxPct}`;
      slabMap[key] = (slabMap[key] || 0) + igst;

      hsnMap[item._hsn] = hsnMap[item._hsn] || {};
      hsnMap[item._hsn][key] = (hsnMap[item._hsn][key] || 0) + igst;
    } else {
      const half = item._taxPct / 2;
      const cgstKey = `CGST_${half}`;
      const sgstKey = `SGST_${half}`;

      slabMap[cgstKey] = (slabMap[cgstKey] || 0) + cgst;
      slabMap[sgstKey] = (slabMap[sgstKey] || 0) + sgst;

      hsnMap[item._hsn] = hsnMap[item._hsn] || {};
      hsnMap[item._hsn][cgstKey] = (hsnMap[item._hsn][cgstKey] || 0) + cgst;
      hsnMap[item._hsn][sgstKey] = (hsnMap[item._hsn][sgstKey] || 0) + sgst;
    }
  });

  // ---- Step 4: Build breakups ----
  result.slabBreakup = Object.entries(slabMap).map(([key, amt]) => {
    const [type, pct] = key.split("_");
    return { tax: `${type} ${pct}%`, amount: +amt.toFixed(roundTo) };
  });

  Object.keys(hsnMap).forEach((hsn) => {
    result.hsnBreakup[hsn] = Object.entries(hsnMap[hsn]).map(([key, amt]) => {
      const [type, pct] = key.split("_");
      return { tax: `${type} ${pct}%`, amount: +amt.toFixed(roundTo) };
    });
  });

  const totalTax = result.slabBreakup.reduce((s, b) => s + b.amount, 0);
  const totalBeforeRound = result.taxable + totalTax;

  const roundedNet = Math.round(totalBeforeRound);
  result.roundOff = +(roundedNet - totalBeforeRound).toFixed(roundTo);
  result.net = roundedNet;

  ["gross", "itemDiscount", "overallDiscount", "taxable"].forEach((k) => {
    result[k] = +result[k].toFixed(roundTo);
  });

return { ...result, items: inwardItems };
}
