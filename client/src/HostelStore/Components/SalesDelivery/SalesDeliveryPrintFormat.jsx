import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import Logo from "../../../assets/gwynt_logo.png";
import moment from "moment";
import { findFromList } from "../../../Utils/helper";

// ─── NUMBER TO WORDS ──────────────────────────────────────────────────────────
const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
function numToWords(n) {
  if (n === 0) return "Zero";
  if (n < 0) return "Minus " + numToWords(-n);
  let str = "";
  if (Math.floor(n / 10000000) > 0) {
    str += numToWords(Math.floor(n / 10000000)) + " Crore ";
    n %= 10000000;
  }
  if (Math.floor(n / 100000) > 0) {
    str += numToWords(Math.floor(n / 100000)) + " Lakh ";
    n %= 100000;
  }
  if (Math.floor(n / 1000) > 0) {
    str += numToWords(Math.floor(n / 1000)) + " Thousand ";
    n %= 1000;
  }
  if (Math.floor(n / 100) > 0) {
    str += ones[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n > 0) {
    if (n < 20) {
      str += ones[n];
    } else {
      str += tens[Math.floor(n / 10)];
      if (n % 10 > 0) str += " " + ones[n % 10];
    }
  }
  return str.trim();
}
function numberToWords(amount) {
  const num = parseFloat(amount) || 0;
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = numToWords(rupees) + " Rupees";
  if (paise > 0) result += " and " + numToWords(paise) + " Paise";
  result += " Only";
  return result;
}

// ─── INDIAN RUPEE FORMAT ──────────────────────────────────────────────────────
function formatINR(amount) {
  const num = parseFloat(amount) || 0;
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const formatted =
    rest.length > 0
      ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
  return formatted + "." + decPart;
}

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────
const DARK = "#1a1a2e";
const DARK2 = "#2d2d44";
const LIGHT_BG = "#fafafa";
const BORDER = "#b0b0b8";
const BORDER_LIGHT = "#ddd";
const BORDER_ROW = "#c8c8d0";

const styles = StyleSheet.create({
  borderBox: { border: `1 solid #ccc`, margin: 0, padding: 0 },
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    padding: 0,
    paddingBottom: 52,
    backgroundColor: "#fff",
  },
  topBar: { height: 4, backgroundColor: DARK },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottom: `1.5 solid ${DARK}`,
  },
  logo: { height: 52, width: 52 },
  companyCenter: { alignItems: "center", flex: 1 },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    letterSpacing: 0.5,
  },
  companyAddress: {
    fontSize: 7.5,
    color: "#555",
    textAlign: "center",
    marginTop: 2,
  },
  titleBand: {
    backgroundColor: DARK,
    color: "#fff",
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    paddingVertical: 6,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 6,
  },
  metaPill: {
    flexDirection: "row",
    backgroundColor: "#f4f4f6",
    border: `1 solid ${BORDER_LIGHT}`,
    borderLeft: `2 solid ${DARK}`,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 2,
  },
  metaLabel: { fontSize: 7.5, color: "#888", marginRight: 3 },
  metaValue: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: DARK },
  twoCol: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
  },
  colHalf: { flex: 1 },
  sectionHeader: {
    backgroundColor: DARK2,
    color: "#e8e8f0",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionBody: { padding: 8 },
  partyName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 3,
  },
  partyAddr: {
    fontSize: 7.5,
    color: "#555",
    textTransform: "uppercase",
    marginBottom: 4,
    lineHeight: 1.5,
  },
  partyRow: { flexDirection: "row", marginBottom: 2 },
  partyLabel: { fontSize: 7.5, color: "#888", width: 88 },
  partyValue: {
    fontSize: 7.5,
    color: "#222",
    fontFamily: "Helvetica-Bold",
    paddingLeft: 5,
  },
  tableWrap: { marginHorizontal: 20 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: DARK,
    borderTop: `1 solid ${BORDER}`,
    borderLeft: `1 solid ${BORDER}`,
    borderRight: `1 solid ${BORDER}`,
  },
  th: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
    textAlign: "center",
    borderRight: `1 solid #4a4a60`,
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  trOdd: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderLeft: `1 solid ${BORDER}`,
    borderRight: `1 solid ${BORDER}`,
  },
  trEven: {
    flexDirection: "row",
    backgroundColor: LIGHT_BG,
    borderLeft: `1 solid ${BORDER}`,
    borderRight: `1 solid ${BORDER}`,
  },
  td: {
    fontSize: 7.5,
    color: "#333",
    textAlign: "center",
    borderRight: `1 solid ${BORDER_ROW}`,
    borderBottom: `1 solid ${BORDER_ROW}`,
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  totalRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#e8e8ec",
    borderLeft: `1 solid ${BORDER}`,
    borderRight: `1 solid ${BORDER}`,
    borderBottom: `1 solid ${BORDER}`,
  },
  taxOuterRow: {
    flexDirection: "row",
    marginTop: 8,
    marginHorizontal: 20,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  bankBox: {
    flex: 1,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
    alignSelf: "flex-start",
  },
  taxBox: {
    width: 175,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
    overflow: "hidden",
  },
  taxHeader: {
    backgroundColor: DARK2,
    color: "#e8e8f0",
    textAlign: "center",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    paddingVertical: 4,
  },
  taxRow: { flexDirection: "row", borderTop: `1 solid #ebebeb` },
  taxRowNet: {
    flexDirection: "row",
    borderTop: `1 solid ${BORDER}`,
    backgroundColor: "#f0f0f4",
  },
  taxRowGrand: {
    flexDirection: "row",
    borderTop: `1.5 solid ${DARK}`,
    backgroundColor: DARK,
  },
  taxLabel: { flex: 1, fontSize: 7.5, color: "#333", padding: 4 },
  taxValue: {
    fontSize: 7.5,
    color: "#333",
    textAlign: "right",
    padding: 4,
    minWidth: 60,
  },
  taxLabelNet: {
    flex: 1,
    fontSize: 7.5,
    color: DARK,
    fontFamily: "Helvetica-Bold",
    padding: 4,
  },
  taxValueNet: {
    fontSize: 7.5,
    color: DARK,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    padding: 4,
    minWidth: 60,
  },
  taxLabelGrand: {
    flex: 1,
    fontSize: 7.5,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    padding: 4,
  },
  taxValueGrand: {
    fontSize: 7.5,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    padding: 4,
    minWidth: 60,
  },
  bottomSection: {
    marginHorizontal: 20,
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  remarksBox: { flex: 1, border: `1 solid ${BORDER_LIGHT}`, borderRadius: 3 },
  termsBox: { flex: 2, border: `1 solid ${BORDER_LIGHT}`, borderRadius: 3 },
  footerBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  footerRight: { fontSize: 8, color: DARK, fontFamily: "Helvetica-Bold" },
});

const getColumns = (isCumInvoice) => [
  { label: "S.No", flex: 0.5 },
  { label: "Box No", flex: 2 },
  { label: "Style No", flex: 3.5 },
  { label: "HSN", flex: 1.5 },
  { label: "Size", flex: 1 },
  ...(isCumInvoice
    ? [
        { label: "Tax %", flex: 1 },
        { label: "Price", flex: 1.5 },
      ]
    : []),
];

const TableHeader = ({ isCumInvoice }) => {
  const cols = getColumns(isCumInvoice);
  return (
    <View style={styles.tableHeader}>
      {cols.map(({ label, flex }, i) => (
        <Text
          key={label}
          style={[
            styles.th,
            { flex },
            i === cols.length - 1 && { borderRight: "none" },
          ]}
        >
          {label}
        </Text>
      ))}
    </View>
  );
};

const ContinuationBar = ({ docId, branchName }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: DARK,
      paddingHorizontal: 20,
      paddingVertical: 6,
      marginBottom: 2,
    }}
  >
    <Text
      style={{
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: "#fff",
        letterSpacing: 2,
      }}
    >
      SALES DELIVERY — Continued
    </Text>
    <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>
      DC No: {docId} | {branchName}
    </Text>
  </View>
);

const SalesDeliveryPrintFormat = ({
  data,
  taxDetails,
  isCumInvoice,
  payTermList,
  isCustomerExport,
}) => {
  if (!data) return null;
  console.log(data, "receiveddata");



  const branch = data?.Branch || {};
  const customer = data?.Customer || {};
  const bank = data?.Bank || {};
  console.log(bank, "bank");



  const allItems = [];
  if (data?.saledBox && data.saledBox.length > 0) {
    data.saledBox.forEach((box) => {
      const boxCode = box.boxCode || box.Box?.docId || "";
      (box.saledItems || []).forEach((item) => {
        if (item.styleId) {
          allItems.push({
            ...item,
            boxNumber: boxCode,
            styleName: item?.styleNo,
            hsnName: item?.hsnCode || item.Hsn?.name || "",
            sizeName: item?.sizeName,
            calcQty: 1,
            calcPrice: item?.wholeSalePrice,
            calcTax: item?.taxPercent || item.Hsn?.tax || 0,
          });
        }
      });
    });
  } else {
    (data?.salesDeliveryItems || []).forEach((item) => {
      if (item.styleItemId) {
        allItems.push({
          ...item,
          boxNumber: "",
          styleName: item?.StyleItem?.name || "",
          hsnName: item?.Hsn?.name || "",
          sizeName: item?.Size?.name || item?.StyleItem?.Size?.name || "",
          uomName: item?.Uom?.name || "",
          calcPrice: item.price || 0,
          calcQty: item.qty || 0,
          calcTax: item.taxPercent || 0,
        });
      }
    });
  }

  const totalQty = allItems.reduce(
    (s, i) => s + (parseFloat(i.calcQty) || 0),
    0,
  );
  const totalAmount = allItems.reduce(
    (s, i) => s + (parseFloat(i.calcQty) || 0) * (parseFloat(i.calcPrice) || 0),
    0,
  );

  const taxableTotal = parseFloat(taxDetails?.taxable || 0);
  const netAmount = parseFloat(taxDetails?.net || 0);
  const totalDiscount = parseFloat(
    (taxDetails?.itemDiscount || 0) + (taxDetails?.overallDiscount || 0),
  );
  const roundOff = parseFloat(taxDetails?.roundOff || 0);

  // Compute carriage final amount from data fields
  const carriageChargePrint = parseFloat(data?.carriageCharge || 0);
  const carriageTaxPrint = parseFloat(data?.carriageTax || 0);
  const carriageTaxTypePrint = data?.carriageTaxType || "";
  let carriageFinalAmtPrint = 0;
  if (carriageTaxTypePrint === "Flat") {
    carriageFinalAmtPrint = carriageChargePrint + carriageTaxPrint;
  } else {
    carriageFinalAmtPrint =
      carriageChargePrint + (carriageChargePrint * carriageTaxPrint) / 100;
  }

  const grandTotal = netAmount + carriageFinalAmtPrint;

  const taxSlabBreakupRaw = (taxDetails?.slabBreakup || []).filter(
    (s) => (s.amount || 0) > 0,
  );

  const taxSlabBreakup = [];
  const gstMap = {};

  taxSlabBreakupRaw.forEach((slab) => {
    if (slab.tax.startsWith("CGST") || slab.tax.startsWith("SGST")) {
      const match = slab.tax.match(/[\d.]+/);
      const pct = match ? parseFloat(match[0]) : 0;
      const combinedPct = pct * 2;
      const key = `GST @ ${combinedPct}%`;

      if (!gstMap[key]) {
        gstMap[key] = { tax: key, amount: 0 };
      }
      gstMap[key].amount += parseFloat(slab.amount || 0);
    } else {
      taxSlabBreakup.push(slab);
    }
  });

  Object.values(gstMap).forEach((gstSlab) => {
    taxSlabBreakup.push(gstSlab);
  });

  return (
    <Document>
      <Page
        size="A4"
        style={[styles.borderBox, { paddingTop: 15, paddingBottom: 60 }]}
        wrap={true}
      >
        {/* HEADER, TITLE BAND, SALED DETAILS, CUSTOMER DETAILS - rendered once at the top */}
        <View style={styles.header}>
          <View style={{ width: 60 }}>
            <Image src={Logo} style={styles.logo} />
          </View>
          <View style={styles.companyCenter}>
            <Text style={styles.companyName}>
              {branch?.branchName || "EMPIERE GARMENTS"}
            </Text>
            <Text style={styles.companyAddress}>{branch?.address || ""}</Text>
            {branch?.contactEmail ? (
              <Text style={{ fontSize: 7.5, color: "#555", marginTop: 1 }}>
                {branch.contactEmail}
                {branch?.contactMobile ? `  |  ${branch.contactMobile}` : ""}
              </Text>
            ) : null}
          </View>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.titleBand}>SALES INVOICE</Text>

        <View style={styles.twoCol}>
          <View
            style={[
              styles.colHalf,
              { borderRight: `1 solid ${BORDER_LIGHT}`, flex: 0.8 },
            ]}
          >
            <Text style={styles.sectionHeader}>SALES DELIVERY DETAILS</Text>
            <View style={styles.sectionBody}>
              {[
                { label: "Sales Delivery No", value: data?.docId },
                {
                  label: "Sales Delivery Date",
                  value: data?.docDate
                    ? moment(data.docDate).format("DD-MM-YYYY")
                    : "",
                },
                {
                  label: "Delivery Date",
                  value: data?.deliveryDate
                    ? moment(data.deliveryDate).format("DD-MM-YYYY")
                    : "",
                },
                { label: "Pay Term", value: data?.PayTerm?.name },
                { label: "Grand Total", value: formatINR(grandTotal) },
              ]
                .filter((r) => r.value)
                .map(({ label, value }) => (
                  <View key={label} style={styles.partyRow}>
                    <Text style={styles.partyLabel}>{label}:</Text>
                    <Text style={styles.partyValue}>{value}</Text>
                  </View>
                ))}
            </View>
          </View>
          <View style={[styles.colHalf, { flex: 1.2 }]}>
            <Text style={styles.sectionHeader}>CUSTOMER DETAILS</Text>
            <View style={styles.sectionBody}>
              <Text style={styles.partyName}>{customer?.name || ""}</Text>
              <Text style={styles.partyAddr}>{customer?.address || ""}</Text>
              {[
                {
                  label: "Contact Person",
                  value: customer?.contactPersonName,
                },
                { label: "Mobile No", value: customer?.contactNumber },
                { label: "GST No", value: customer?.gstNo },
                { label: "Email", value: customer?.contactPersonEmail },
              ].map(({ label, value }) =>
                value ? (
                  <View key={label} style={styles.partyRow}>
                    <Text style={styles.partyLabel}>{label}:</Text>
                    <Text style={styles.partyValue}>{value}</Text>
                  </View>
                ) : null,
              )}
            </View>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.tableWrap}>
          {/* Repeating Table Header */}
          <View fixed>
            <TableHeader isCumInvoice={isCumInvoice} />
          </View>

          {allItems.map((row, index) => {
            const rowStyle = index % 2 === 0 ? styles.trOdd : styles.trEven;

            let firstIndex = index;
            while (
              firstIndex > 0 &&
              allItems[firstIndex - 1].boxNumber &&
              allItems[firstIndex - 1].boxNumber === row.boxNumber
            ) {
              firstIndex--;
            }
            let lastIndex = index;
            while (
              lastIndex < allItems.length - 1 &&
              allItems[lastIndex + 1].boxNumber &&
              allItems[lastIndex + 1].boxNumber === row.boxNumber
            ) {
              lastIndex++;
            }
            const middleIndex = Math.floor((firstIndex + lastIndex) / 2);
            const isSameAsNext =
              index < allItems.length - 1 &&
              row.boxNumber &&
              row.boxNumber === allItems[index + 1].boxNumber;

            return (
              <View key={index} style={rowStyle} wrap={false}>
                <Text style={[styles.td, { flex: 0.5 }]}>{index + 1}</Text>
                <Text
                  style={[
                    styles.td,
                    {
                      flex: 2,
                      textAlign: "center",
                      backgroundColor: "#fff",
                      borderBottom: isSameAsNext
                        ? "none"
                        : `1 solid ${BORDER_ROW}`,
                    },
                  ]}
                >
                  {index === middleIndex ? row.boxNumber || "" : ""}
                </Text>
                <Text style={[styles.td, { flex: 3.5, textAlign: "left" }]}>
                  {row.styleName || ""}
                </Text>
                <Text
                  style={[
                    styles.td,
                    {
                      flex: 1.5,
                      borderRight: isCumInvoice
                        ? `1 solid ${BORDER_ROW}`
                        : "none",
                      textAlign: "right",
                    },
                  ]}
                >
                  {row.hsnName || ""}
                </Text>
                <Text
                  style={[
                    styles.td,
                    {
                      flex: 1,
                      borderRight: isCumInvoice
                        ? `1 solid ${BORDER_ROW}`
                        : "none",
                      textAlign: "left",
                    },
                  ]}
                >
                  {row.sizeName || ""}
                </Text>
                {isCumInvoice && (
                  <>
                    <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                      {row.calcTax ? `${parseFloat(row.calcTax)}%` : ""}
                    </Text>
                    <Text
                      style={[
                        styles.td,
                        {
                          flex: 1.5,
                          textAlign: "right",
                          borderRight: "none",
                        },
                      ]}
                    >
                      {row.calcPrice
                        ? parseFloat(row.calcPrice).toFixed(2)
                        : ""}
                    </Text>
                  </>
                )}
              </View>
            );
          })}
        </View>

        <View wrap={false}>
          {/* TABLE TOTAL FOOTER */}
          {isCumInvoice && (
            <View
              style={{
                flexDirection: "row",
                marginHorizontal: 20,
                backgroundColor: "#e8e8ec",
                borderLeft: `1 solid ${BORDER}`,
                borderRight: `1 solid ${BORDER}`,
                borderBottom: `1 solid ${BORDER}`,
              }}
            >
              <Text
                style={{
                  flex: 9,
                  fontSize: 7.5,
                  fontFamily: "Helvetica-Bold",
                  color: DARK,
                  textAlign: "right",
                  paddingVertical: 4,
                  paddingRight: 8,
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  flex: 1.5,
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: DARK,
                  textAlign: "right",
                  paddingVertical: 4,
                  paddingRight: 3,
                }}
              >
                {formatINR(totalAmount)}
              </Text>
            </View>
          )}

          {/* TOTALS ROW */}
          <View style={styles.taxOuterRow}>
            {/* BANK DETAILS — left side */}
            {bank?.name ? (
              <View style={styles.bankBox}>
                <Text
                  style={[
                    styles.taxHeader,
                    { textAlign: "left", paddingHorizontal: 6 },
                  ]}
                >
                  BANK DETAILS
                </Text>
                {[
                  { label: "Bank Name", value: bank.name },
                  { label: "A/C Holder", value: bank.holderName },
                  { label: "A/C No", value: bank.accNo },
                  { label: "IFSC", value: bank.ifsc },
                  { label: "Swift Code", value: bank.swiftCode },
                ]
                  .filter((r) => r.value)
                  .map((r) => (
                    <View
                      key={r.label}
                      style={[styles.taxRow, { alignItems: "flex-start" }]}
                    >
                      <Text
                        style={[
                          styles.taxLabel,
                          { color: "#888", minWidth: 52 },
                        ]}
                      >
                        {r.label}
                      </Text>
                      <Text
                        style={[
                          styles.taxLabel,
                          {
                            fontFamily: "Helvetica-Bold",
                            color: DARK,
                            flex: 2,
                          },
                        ]}
                      >
                        {r.value}
                      </Text>
                    </View>
                  ))}
                {/* Amount in words below bank details */}
                <View
                  style={{
                    padding: 4,
                    borderTop: `1 solid #ebebeb`,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7.5,
                      fontFamily: "Helvetica-Bold",
                      color: DARK,
                    }}
                  >
                    {numberToWords(grandTotal)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {/* TAX DETAILS — right side */}
            <View style={styles.taxBox}>
              <Text style={styles.taxHeader}>TAX DETAILS</Text>
              {totalDiscount > 0 && (
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>Total Discount</Text>
                  <Text style={styles.taxValue}>
                    {formatINR(totalDiscount)}
                  </Text>
                </View>
              )}
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>Taxable Amt</Text>
                <Text style={styles.taxValue}>{formatINR(taxableTotal)}</Text>
              </View>
              {taxSlabBreakup.map((slab) => (
                <View key={slab.tax} style={styles.taxRow}>
                  <Text style={styles.taxLabel}>{slab.tax}</Text>
                  <Text style={styles.taxValue}>
                    {formatINR(parseFloat(slab.amount || 0))}
                  </Text>
                </View>
              ))}
              {roundOff !== 0 && (
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>Round Off</Text>
                  <Text style={styles.taxValue}>{formatINR(roundOff)}</Text>
                </View>
              )}
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>Net Amount</Text>
                <Text style={styles.taxValue}>{formatINR(netAmount)}</Text>
              </View>
              {carriageFinalAmtPrint > 0 && (
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>Carriage Charges</Text>
                  <Text style={styles.taxValue}>
                    {formatINR(carriageFinalAmtPrint)}
                  </Text>
                </View>
              )}
              <View style={styles.taxRowGrand}>
                <Text style={styles.taxLabelGrand}>Grand Total</Text>
                <Text style={styles.taxValueGrand}>
                  {formatINR(grandTotal)}
                </Text>
              </View>
            </View>
          </View>

          {/* REMARKS & TERMS */}
          <View style={styles.bottomSection}>
            {data?.termsAndCondition ? (
              <View style={styles.termsBox}>
                <Text style={styles.sectionHeader}>TERMS &amp; CONDITIONS</Text>
                <View style={styles.sectionBody}>
                  <Text
                    style={{
                      fontSize: 7.5,
                      color: "#555",
                      lineHeight: 1.5,
                    }}
                  >
                    {data.termsAndCondition}
                  </Text>
                </View>
              </View>
            ) : null}
            {data?.remarks ? (
              <View style={styles.remarksBox}>
                <Text style={styles.sectionHeader}>REMARKS</Text>
                <View style={styles.sectionBody}>
                  <Text style={{ fontSize: 7.5, color: "#555" }}>
                    {data.remarks}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* FOOTER — signatures left, page number right */}
        <View
          style={[
            styles.footerBar,
            {
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1 solid ${BORDER_LIGHT}`,
            },
          ]}
          fixed
        >
          <View style={{ flexDirection: "row", flex: 1 }}>
            {["For EMPIERE GARMENTS", "Customer Sign"].map((role) => (
              <Text
                key={role}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 7,
                  color: "#555",
                  fontFamily: "Helvetica-Bold",
                }}
              >
                {role}
              </Text>
            ))}
          </View>
          <Text
            style={[styles.footerRight, { minWidth: 60, textAlign: "right" }]}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default SalesDeliveryPrintFormat;
