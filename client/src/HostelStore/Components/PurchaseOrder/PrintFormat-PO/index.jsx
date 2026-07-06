import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import Logo from "../../../../../src/assets/mplogo.png";
import { numberToWords } from "number-to-words";
import { findFromList, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────
// Primary Dark  : #1a1a2e   (deep charcoal navy)
// Secondary Dark: #2d2d44   (slate)
// Accent Light  : #f4f4f6   (near-white surface)
// Border        : #ddd / #ebebeb
// Text Primary  : #1a1a2e
// Text Muted    : #555 / #888
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── PAGE ──
  borderBox: {
    border: "1 solid #ccc",
    margin: 0,
    padding: 0,
  },
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    padding: 0,
    backgroundColor: "#fff",
  },

  // ── TOP ACCENT BAR ──
  topBar: {
    height: 4,
    backgroundColor: "#1a1a2e",
  },

  // ── HEADER ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottom: "1.5 solid #1a1a2e",
  },
  logo: {
    height: 52,
    width: 52,
  },
  companyCenter: {
    alignItems: "center",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
    letterSpacing: 0.5,
  },
  companySub: {
    fontSize: 7.5,
    color: "#666",
    marginTop: 2,
  },
  companyRight: {
    width: 140,
    alignItems: "flex-start",
  },
  companyRightRow: {
    flexDirection: "row",
    marginBottom: 2,
    width: "100%",
  },
  companyLabel: {
    fontSize: 7.5,
    color: "#888",
    width: 38,
  },
  companyColon: {
    fontSize: 7.5,
    color: "#888",
    width: 8,
  },
  companyValue: {
    fontSize: 7.5,
    color: "#1a1a2e",
    fontWeight: "bold",
    flex: 1,
  },

  // ── TITLE BAND ──
  titleBand: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 3,
    paddingVertical: 6,
  },

  // ── PO META PILLS ──
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  metaPill: {
    flexDirection: "row",
    backgroundColor: "#f4f4f6",
    border: "1 solid #ddd",
    borderLeft: "2 solid #1a1a2e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  metaPillRevised: {
    flexDirection: "row",
    backgroundColor: "#fff5f5",
    border: "1 solid #ddd",
    borderLeft: "2 solid #c0392b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  metaLabel: {
    fontSize: 7.5,
    color: "#888",
    marginRight: 3,
  },
  metaValue: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  metaValueRevised: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#c0392b",
  },

  // ── SUPPLIER / DELIVERY SECTION ──
  twoCol: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 10,
    border: "1 solid #ddd",
    borderRadius: 3,
  },
  colHalf: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: "#2d2d44",
    color: "#e8e8f0",
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionBody: {
    padding: 8,
  },
  supplierName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 3,
  },
  supplierAddr: {
    fontSize: 7.5,
    color: "#555",
    textTransform: "uppercase",
    marginBottom: 4,
    lineHeight: 1.5,
  },
  supplierRow: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  supplierLabel: {
    fontSize: 7.5,
    color: "#888",
    width: 58,
  },
  supplierValue: {
    fontSize: 7.5,
    color: "#222",
    fontWeight: "bold",
  },

  // ── TABLE ──
  tableWrap: {
    marginHorizontal: 20,
    border: "1 solid #b0b0b8",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
  },
  th: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    borderRight: "1 solid #4a4a60",
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  trEven: {
    flexDirection: "row",
    borderBottom: "1 solid #c8c8d0",
    backgroundColor: "#fafafa",
  },
  trOdd: {
    flexDirection: "row",
    borderBottom: "1 solid #c8c8d0",
    backgroundColor: "#fff",
  },
  td: {
    fontSize: 7.5,
    color: "#333",
    textAlign: "center",
    borderRight: "1 solid #c8c8d0",
    paddingVertical: 4,
    paddingHorizontal: 3,
  },

  // ── TOTAL ROW ──
  totalRow: {
    flexDirection: "row",
    borderTop: "1.5 solid #1a1a2e",
    borderBottom: "1 solid #ddd",
    marginHorizontal: 20,
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    fontSize: 8,
    fontWeight: "bold",
    color: "#1a1a2e",
    padding: 5,
  },
  totalValue: {
    width: 70,
    textAlign: "right",
    fontSize: 8,
    fontWeight: "bold",
    color: "#1a1a2e",
    padding: 5,
    borderLeft: "1 solid #ddd",
  },

  // ── TAX BOX ──
  taxBox: {
    width: 150,
    marginTop: 8,
    marginRight: 20,
    alignSelf: "flex-end",
    border: "1 solid #ddd",
    borderRadius: 3,
    overflow: "hidden",
  },
  taxHeader: {
    backgroundColor: "#2d2d44",
    color: "#e8e8f0",
    textAlign: "center",
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 1,
    paddingVertical: 4,
  },
  taxRow: {
    flexDirection: "row",
    borderTop: "1 solid #ebebeb",
  },
  taxRowNet: {
    flexDirection: "row",
    borderTop: "1 solid #1a1a2e",
    backgroundColor: "#1a1a2e",
  },
  taxLabel: {
    flex: 1,
    fontSize: 7.5,
    color: "#333",
    padding: 4,
  },
  taxValue: {
    fontSize: 7.5,
    color: "#333",
    textAlign: "right",
    padding: 4,
    // minWidth: 55,
  },
  taxLabelNet: {
    flex: 1,
    fontSize: 7.5,
    color: "#fff",
    fontWeight: "bold",
    padding: 4,
  },
  taxValueNet: {
    fontSize: 7.5,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "right",
    padding: 4,
    // minWidth: 55,
  },

  // ── AMOUNT IN WORDS BAR ──
  wordsBar: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#2d2d44",
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  wordsText: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#e8e8f0",
  },
  wordsValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
  },

  // ── REMARKS & TERMS ──
  remarksRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    border: "1 solid #ddd",
    borderTop: "none",
    borderRadius: 3,
    minHeight: 52,
    overflow: "hidden",
  },
  remarksCol: {
    flex: 0.4,
    padding: 8,
    borderRight: "1 solid #ddd",
    backgroundColor: "#f8f8f9",
  },
  termsCol: {
    flex: 0.6,
    padding: 8,
  },
  rTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  rText: {
    fontSize: 7.5,
    color: "#555",
    lineHeight: 1.5,
  },

  // ── SIGNATURES ──
  sigArea: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  sigCompany: {
    textAlign: "right",
    fontSize: 8,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 18,
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #ddd",
    paddingTop: 4,
  },
  sigItem: {
    flex: 1,
    textAlign: "center",
    fontSize: 7.5,
    color: "#555",
    fontWeight: "bold",
  },

  // ── FOOTER ──
  footerBar: {
    backgroundColor: "#1a1a2e",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginTop: 8,
  },
  footerLeft: {
    fontSize: 7,
    color: "rgba(255,255,255,0.5)",
  },
  footerRight: {
    fontSize: 7,
    color: "rgba(255,255,255,0.5)",
  },
});

// ── COLUMN DEFINITIONS ────────────────────────────────────────────────────────
const COLUMNS = [
  { label: "S.No", flex: 0.5, align: "center" },
  { label: "Item", flex: 4, align: "left" },
  { label: "Size", flex: 1.5, align: "left" },
  { label: "Color", flex: 1.5, align: "left" },
  { label: "UOM", flex: 1, align: "left" },
  { label: "Qty", flex: 1, align: "right" },
  { label: "Rate", flex: 1, align: "right" },
  { label: "Tax(%)", flex: 1, align: "right" },
  { label: "Amount", flex: 1.2, align: "right" },
];

const MIN_ROWS = 14;

const PurchaseOrderPrintFormat = ({
  singleData,
  supplierDetails,
  deliveryTo,
  deliveryType,
  branchData,
  taxDetails,
  colorList,
  uomList,
  sizeList,
  styleItemList,
  quoteVersion
}) => {
  if (!singleData) return null;

  const poNumber = singleData?.docId || "";
  // const quoteVersion = singleData?.quoteVersion || "";
  const poDate = singleData?.docDate || "";
  const dueDate = singleData?.dueDate || "";
  const remarks = singleData?.remarks || "";
  const term = singleData?.termsAndCondtion || "";
  const poItems = singleData?.poItems || [];

  const filledPoItems = poItems.filter(
    (i) => i.styleItemId && i.quoteVersion === quoteVersion
  );

  // Amount in words
  const netAmount = parseFloat(taxDetails?.net || 0);
  const netInt = Math.floor(netAmount);
  const netDecimal = Math.round((netAmount - netInt) * 100);
  const amountWords =
    numberToWords
      .toWords(netInt)
      .replace(/,/g, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) +
    (netDecimal > 0
      ? " And " + numberToWords.toWords(netDecimal).replace(/\b\w/g, (c) => c.toUpperCase()) + " Paise"
      : "") +
    " Only";

  const MAX_ROWS_PER_PAGE = 14;

  // Create padded array of rows
  const allRows = [...filledPoItems];

  // Pad up to MIN_ROWS to reach minimum desired document length
  while (allRows.length < MIN_ROWS) {
    allRows.push({ isEmpty: true });
  }

  // Pad the rest so every page chunk is fully padded up to MAX_ROWS_PER_PAGE.
  // This ensures consistent table heights on ALL pages, including the last one,
  // making the footers perfectly land at the bottom without breaking.
  while (allRows.length % MAX_ROWS_PER_PAGE !== 0) {
    allRows.push({ isEmpty: true });
  }

  const pageChunks = [];
  for (let i = 0; i < Math.max(allRows.length, 1); i += MAX_ROWS_PER_PAGE) {
    pageChunks.push(allRows.slice(i, i + MAX_ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pageChunks.map((chunk, pageIndex) => {
        const isLastPage = pageIndex === pageChunks.length - 1;

        return (
          <Page key={pageIndex} size="A4" style={styles.borderBox}>
            <View style={styles.page}>

              {/* ── TOP ACCENT BAR ── */}
              <View style={styles.topBar} />

              {/* ── HEADER ── */}
              <View style={styles.header}>
                <Image src={Logo} style={styles.logo} />

                <View style={styles.companyCenter}>
                  <Text style={styles.companyName}>{branchData?.branchName || ""}</Text>
                  {/* <Text style={styles.companySub}>Garment Manufacturing &amp; Exports</Text> */}
                </View>

                <View style={styles.companyRight}>
                  <Text style={{ fontSize: 7.5, color: "#555", marginBottom: 2, textAlign: "right" }}>
                    {branchData?.address || ""}
                  </Text>
                  {[
                    { label: "Mobile", value: branchData?.contactMobile },
                    { label: "GST No", value: branchData?.company?.gstNo },
                    { label: "Email", value: branchData?.contactEmail },
                  ].map(({ label, value }) =>
                    value ? (
                      <View key={label} style={styles.companyRightRow}>
                        <Text style={styles.companyLabel}>{label}</Text>
                        <Text style={styles.companyColon}> : </Text>
                        <Text style={styles.companyValue}>{value}</Text>
                      </View>
                    ) : null
                  )}
                </View>
              </View>

              {/* ── TITLE BAND ── */}
              <Text style={styles.titleBand}>PURCHASE ORDER</Text>

              {/* ── PO META ── */}
              <View style={styles.metaRow}>
                {[
                  { label: "PO No", value: poNumber },
                  { label: "PO Date", value: getDateFromDateTimeToDisplay(poDate) },
                  { label: "Due Date", value: getDateFromDateTimeToDisplay(dueDate) },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.metaPill}>
                    <Text style={styles.metaLabel}>{label}:</Text>
                    <Text style={styles.metaValue}>{value}</Text>
                  </View>
                ))}
                {quoteVersion > 1 && (
                  <View style={styles.metaPillRevised}>
                    <Text style={styles.metaLabel}>Revised PO:</Text>
                    <Text style={styles.metaValueRevised}>v{quoteVersion}</Text>
                  </View>
                )}
              </View>

              {/* ── SUPPLIER & DELIVERY ── */}
              <View style={styles.twoCol}>
                {/* Supplier */}
                <View style={[styles.colHalf, { borderRight: "1 solid #ddd" }]}>
                  <Text style={styles.sectionHeader}>SUPPLIER DETAILS</Text>
                  <View style={styles.sectionBody}>
                    <Text style={styles.supplierName}>{supplierDetails?.name}</Text>
                    <Text style={styles.supplierAddr}>{supplierDetails?.address}</Text>
                    {[
                      { label: "Mobile No", value: supplierDetails?.contactNumber },
                      { label: "GST No", value: supplierDetails?.gstNo },
                      { label: "Email", value: supplierDetails?.contactPersonEmail },
                    ].map(({ label, value }) =>
                      value ? (
                        <View key={label} style={styles.supplierRow}>
                          <Text style={styles.supplierLabel}>{label}</Text>
                          <Text style={styles.supplierValue}>: {value}</Text>
                        </View>
                      ) : null
                    )}
                  </View>
                </View>

                {/* Delivery */}
                <View style={styles.colHalf}>
                  <Text style={styles.sectionHeader}>DELIVERY TO</Text>
                  <View style={styles.sectionBody}>
                    <Text style={styles.supplierName}>
                      {deliveryType === "ToSelf" ? deliveryTo?.branchName : deliveryTo?.name}
                    </Text>
                    <Text style={styles.supplierAddr}>{deliveryTo?.address}</Text>
                    {[
                      { label: "Mobile No", value: deliveryTo?.contactMobile },
                      { label: "GST No", value: deliveryTo?.gstNo },
                      { label: "Email", value: deliveryType === "ToSelf" ? deliveryTo?.contactEmail : deliveryTo?.email },
                    ].map(({ label, value }) =>
                      value ? (
                        <View key={label} style={styles.supplierRow}>
                          <Text style={styles.supplierLabel}>{label}</Text>
                          <Text style={styles.supplierValue}>: {value}</Text>
                        </View>
                      ) : null
                    )}
                  </View>
                </View>
              </View>

              {/* ── TABLE ── */}
              <View style={styles.tableWrap}>
                {/* Header */}
                <View style={styles.tableHeader}>
                  {COLUMNS.map(({ label, flex }) => (
                    <Text key={label} style={[styles.th, { flex }]}>{label}</Text>
                  ))}
                </View>

                {/* Filled rows */}
                {(() => {
                  return chunk.map((val, chunkIndex) => {
                    const index = pageIndex * MAX_ROWS_PER_PAGE + chunkIndex;
                    const rowStyle = index % 2 === 0 ? styles.trOdd : styles.trEven;

                    if (val.isEmpty) {
                      return (
                        <View key={`empty-${index}`} style={rowStyle}>
                          <Text style={[styles.td, { flex: 0.5, color: "transparent" }]}> </Text>
                          <Text style={[styles.td, { flex: 4 }]}> </Text>
                          <Text style={[styles.td, { flex: 1.5 }]}> </Text>
                          <Text style={[styles.td, { flex: 1.5 }]}> </Text>
                          <Text style={[styles.td, { flex: 1 }]}> </Text>
                          <Text style={[styles.td, { flex: 1 }]}> </Text>
                          <Text style={[styles.td, { flex: 1 }]}> </Text>
                          <Text style={[styles.td, { flex: 1 }]}> </Text>
                          <Text style={[styles.td, { flex: 1.2, borderRight: "none" }]}> </Text>
                        </View>
                      );
                    }

                    const gross = !isNaN(val.qty * val.price)
                      ? (val.qty * val.price).toFixed(2)
                      : "";
                    return (
                      <View key={index} style={rowStyle}>
                        <Text style={[styles.td, { flex: 0.5 }]}>{index + 1}</Text>
                        <Text style={[styles.td, { flex: 4, textAlign: "left" }]}>
                          {findFromList(val.styleItemId, styleItemList?.data, "name")}
                        </Text>
                        <Text style={[styles.td, { flex: 1.5, textAlign: "left" }]}>
                          {val.Size?.name || findFromList(val.sizeId, sizeList?.data, "name")}
                        </Text>
                        <Text style={[styles.td, { flex: 1.5, textAlign: "left" }]}>
                          {val.Color?.name || findFromList(val.colorId, colorList?.data, "name")}
                        </Text>
                        <Text style={[styles.td, { flex: 1, textAlign: "left" }]}>
                          {val.Uom?.name || findFromList(val.uomId, uomList?.data, "name")}
                        </Text>
                        <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                          {isNaN(val.qty) ? "" : parseFloat(val.qty).toFixed(3)}
                        </Text>
                        <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                          {isNaN(val.price) ? "" : parseFloat(val.price).toFixed(2)}
                        </Text>
                        <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                          {isNaN(val.taxPercent) ? "" : parseFloat(val.taxPercent).toFixed(2)}
                        </Text>
                        <Text style={[styles.td, { flex: 1.2, textAlign: "right", borderRight: "none" }]}>
                          {gross}
                        </Text>
                      </View>
                    );
                  });
                })()}
              </View>

              {/* ── TABLE FOOTER TOTAL ROW ── */}
              {isLastPage && (
                <>
                  {(() => {
                    const totalQty = filledPoItems.reduce(
                      (sum, v) => sum + (isNaN(v.qty) ? 0 : parseFloat(v.qty)),
                      0
                    );
                    const totalAmount = filledPoItems.reduce(
                      (sum, v) =>
                        sum + (!isNaN(v.qty * v.price) ? v.qty * v.price : 0),
                      0
                    );
                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          marginHorizontal: 20,
                          backgroundColor: "#e8e8ec",
                          // borderTop: "1.5 solid #aaaabc",
                          borderLeft: "1 solid #b0b0b8",
                          borderRight: "1 solid #b0b0b8",
                          borderBottom: "1 solid #b0b0b8",
                        }}
                      >
                        {/* S.No cell */}
                        <Text style={{ flex: 0.5, fontSize: 8, color: "transparent", paddingVertical: 5, paddingHorizontal: 2, borderRight: "1 solid #bbbbc8" }}> </Text>
                        {/* Item + Size + Color + UOM merged label */}
                        <Text
                          style={{
                            flex: 8,
                            fontSize: 8,
                            fontWeight: "bold",
                            color: "#1a1a2e",
                            textAlign: "right",
                            paddingVertical: 5,
                            paddingRight: 8,
                            borderRight: "1 solid #bbbbc8",
                          }}
                        >
                          TOTAL
                        </Text>
                        {/* Total Qty */}
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 8,
                            fontWeight: "bold",
                            color: "#1a1a2e",
                            textAlign: "right",
                            paddingVertical: 5,
                            paddingRight: 3,
                            borderRight: "1 solid #bbbbc8",
                          }}
                        >
                          {totalQty.toFixed(3)}
                        </Text>
                        {/* Rate cell — blank */}
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 8,
                            color: "transparent",
                            paddingVertical: 5,
                            paddingRight: 3,
                            borderRight: "1 solid #bbbbc8",
                          }}
                        >
                          {" "}
                        </Text>
                        {/* Tax cell — blank */}
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 8,
                            color: "transparent",
                            paddingVertical: 5,
                            paddingRight: 3,
                            borderRight: "1 solid #bbbbc8",
                          }}
                        >
                          {" "}
                        </Text>
                        {/* Total Amount */}
                        <Text
                          style={{
                            flex: 1.2,
                            fontSize: 8,
                            fontWeight: "bold",
                            color: "#1a1a2e",
                            textAlign: "right",
                            paddingVertical: 5,
                            paddingRight: 3,
                          }}
                        >
                          {totalAmount.toFixed(2)}
                        </Text>
                      </View>
                    );
                  })()}

                  {/* ── TAX BOX ── */}
                  <View style={styles.taxBox}>
                    <Text style={styles.taxHeader}>TAX DETAILS</Text>
                    <View style={styles.taxRow}>
                      <Text style={styles.taxLabel}>Taxable Amt</Text>
                      <Text style={styles.taxValue}>
                        {parseFloat(taxDetails?.taxable || 0).toFixed(2)}
                      </Text>
                    </View>
                    {taxDetails?.slabBreakup
                      ?.filter((item) => item.amount > 0)
                      ?.map((i) => (
                        <View key={i.tax} style={styles.taxRow}>
                          <Text style={styles.taxLabel}>{i.tax}</Text>
                          <Text style={styles.taxValue}>
                            {parseFloat(i.amount || 0).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    <View style={styles.taxRowNet}>
                      <Text style={styles.taxLabelNet}>Net Amount</Text>
                      <Text style={styles.taxValueNet}>
                        {parseFloat(taxDetails?.net || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* ── AMOUNT IN WORDS ── */}
                  <View style={styles.wordsBar}>
                    <Text style={styles.wordsText}>
                      Amount in Words:{" "}
                      <Text style={styles.wordsValue}>{amountWords}</Text>
                    </Text>
                  </View>

                  {/* ── REMARKS & TERMS ── */}
                  <View style={styles.remarksRow}>
                    <View style={styles.remarksCol}>
                      <Text style={styles.rTitle}>REMARKS</Text>
                      <Text style={styles.rText}>{remarks}</Text>
                    </View>
                    <View style={styles.termsCol}>
                      <Text style={styles.rTitle}>TERMS &amp; CONDITIONS</Text>
                      <Text style={styles.rText}>{term}</Text>
                    </View>
                  </View>

                  {/* ── SIGNATURES ── */}
                  <View style={styles.sigArea}>
                    <Text style={styles.sigCompany}>For {branchData?.branchName}</Text>
                    <View style={styles.sigRow}>
                      {["Prepared By", "Verified By", "Received By", "Approved By"].map((role) => (
                        <Text key={role} style={styles.sigItem}>{role}</Text>
                      ))}
                    </View>
                  </View>

                </>
              )}

              {/* ── FOOTER BAR ── */}
              <View style={[styles.footerBar, !isLastPage && { marginTop: 20 }]}>
                <Text style={styles.footerLeft}>

                </Text>
                <Text
                  style={styles.footerRight}
                  render={({ pageNumber, totalPages }) =>
                    `Page ${pageNumber} / ${totalPages}`
                  }
                />
              </View>

            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default PurchaseOrderPrintFormat;