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
import {
  findFromList,
  getDateFromDateTimeToDisplay,
} from "../../../../Utils/helper";

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
    justifyContent: "flex-start",
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
  { label: "S.No", width: "5%", align: "center" },
  { label: "Description of Goods", width: "36%", align: "left" },
  { label: "HSN", width: "13%", align: "left" },
  { label: "Qty", width: "8%", align: "right" },
  { label: "Price", width: "9%", align: "right" },
  { label: "Gross amt", width: "10%", align: "right" },
  { label: "Tax(%)", width: "9%", align: "right" },
  { label: "Net amt", width: "10%", align: "right" },
];

const MIN_ROWS = 14;

const formatIndianNumber = (num, digits = 2) => {
  if (isNaN(num) || num === null || num === undefined || num === "") return "";
  return Number(num).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const PurchaseOrderPrintFormat = ({
  singleData,
  supplierDetails,
  deliveryTo,
  deliveryType,
  branchData,
  taxDetails,
  enrichedPoItems,
  colorList,
  uomList,
  sizeList,
  styleItemList,
  quoteVersion,
}) => {
  if (!singleData) return null;
  console.log(singleData, "singleData");
  console.log(deliveryTo, "deliveryTo");

  const poNumber = singleData?.docId || "";
  // const quoteVersion = singleData?.quoteVersion || "";
  const poDate = singleData?.docDate || "";
  const dueDate = singleData?.dueDate || "";
  const remarks = singleData?.remarks || "";
  const term = singleData?.termsAndCondtion || "";
  const poItems = singleData?.poItems || [];

  const filledPoItems = poItems
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((i) => i.itemVariantId && i.quoteVersion === quoteVersion);
  console.log(filledPoItems, "filledPoItems");

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
      ? " And " +
        numberToWords
          .toWords(netDecimal)
          .replace(/\b\w/g, (c) => c.toUpperCase()) +
        " Paise"
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
                {/* <Image src={Logo} style={styles.logo} /> */}

                <View style={styles.companyCenter}>
                  <Text style={styles.companyName}>
                    {branchData?.branchName || ""}
                  </Text>
                  {/* <Text style={styles.companySub}>Garment Manufacturing &amp; Exports</Text> */}
                </View>

                <View style={styles.companyRight}>
                  <Text
                    style={{
                      fontSize: 7.5,
                      color: "#555",
                      marginBottom: 2,
                      textAlign: "right",
                    }}
                  >
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
                    ) : null,
                  )}
                </View>
              </View>

              {/* ── TITLE BAND ── */}
              <Text style={styles.titleBand}>PURCHASE ORDER</Text>

              {/* ── PO META ── */}
              <View style={styles.metaRow}>
                {[
                  { label: "PO No", value: poNumber },
                  {
                    label: "PO Date",
                    value: getDateFromDateTimeToDisplay(poDate),
                  },
                  {
                    label: "Delivery Date",
                    value: getDateFromDateTimeToDisplay(dueDate),
                  },
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
                    <Text style={styles.supplierName}>
                      {supplierDetails?.name}
                    </Text>
                    <Text style={styles.supplierAddr}>
                      {supplierDetails?.address}
                    </Text>
                    {[
                      {
                        label: "Mobile No",
                        value: supplierDetails?.contactNumber,
                      },
                      { label: "GST No", value: supplierDetails?.gstNo },
                      {
                        label: "Email",
                        value: supplierDetails?.contactPersonEmail,
                      },
                    ].map(({ label, value }) =>
                      value ? (
                        <View key={label} style={styles.supplierRow}>
                          <Text style={styles.supplierLabel}>{label}</Text>
                          <Text style={styles.supplierValue}>: {value}</Text>
                        </View>
                      ) : null,
                    )}
                  </View>
                </View>

                {/* Delivery */}
                <View style={styles.colHalf}>
                  <Text style={styles.sectionHeader}>DELIVERY TO</Text>
                  <View style={styles.sectionBody}>
                    <Text style={styles.supplierName}>
                      {deliveryType === "ToSelf"
                        ? deliveryTo?.branchName
                        : deliveryTo?.name}
                    </Text>
                    <Text style={styles.supplierAddr}>
                      {deliveryTo?.address}
                    </Text>
                    {[
                      { label: "Mobile No", value: deliveryTo?.contactNumber },
                      { label: "GST No", value: deliveryTo?.gstNo },
                      {
                        label: "Email",
                        value:
                          deliveryType === "ToSelf"
                            ? deliveryTo?.contactEmail
                            : deliveryTo?.email,
                      },
                    ].map(({ label, value }) =>
                      value ? (
                        <View key={label} style={styles.supplierRow}>
                          <Text style={styles.supplierLabel}>{label}</Text>
                          <Text style={styles.supplierValue}>: {value}</Text>
                        </View>
                      ) : null,
                    )}
                  </View>
                </View>
              </View>

              {/* ── TABLE ── */}
              <View style={styles.tableWrap}>
                {/* Header */}
                <View style={styles.tableHeader}>
                  {COLUMNS.map(({ label, width }, i) => (
                    <Text
                      key={label}
                      style={[
                        styles.th,
                        {
                          width,
                          borderRight:
                            i === COLUMNS.length - 1
                              ? "none"
                              : styles.th.borderRight,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  ))}
                </View>

                {/* Filled rows */}
                {(() => {
                  return chunk.map((val, chunkIndex) => {
                    const index = pageIndex * MAX_ROWS_PER_PAGE + chunkIndex;
                    const rowStyle =
                      index % 2 === 0 ? styles.trOdd : styles.trEven;

                    if (val.isEmpty) {
                      return (
                        <View key={`empty-${index}`} style={rowStyle}>
                          <Text
                            style={[
                              styles.td,
                              { width: "5%", color: "transparent" },
                            ]}
                          >
                            {" "}
                          </Text>
                          <Text style={[styles.td, { width: "36%" }]}> </Text>
                          <Text style={[styles.td, { width: "13%" }]}> </Text>
                          <Text style={[styles.td, { width: "8%" }]}> </Text>
                          <Text style={[styles.td, { width: "9%" }]}> </Text>
                          <Text style={[styles.td, { width: "10%" }]}> </Text>
                          <Text style={[styles.td, { width: "9%" }]}> </Text>
                          <Text
                            style={[
                              styles.td,
                              { width: "10%", borderRight: "none" },
                            ]}
                          >
                            {" "}
                          </Text>
                        </View>
                      );
                    }

                    const rawGross = val.qty * val.price;
                    const gross = !isNaN(rawGross)
                      ? formatIndianNumber(rawGross)
                      : "";
                    const enrichedRow = enrichedPoItems?.[val.originalIndex];
                    const rawNet = enrichedRow?.totals?.net;
                    const net = !isNaN(rawNet) && rawNet !== undefined
                      ? formatIndianNumber(rawNet)
                      : "";
                    return (
                      <View key={index} style={rowStyle}>
                        <View
                          style={[
                            styles.td,
                            { width: "5%", justifyContent: "center" },
                          ]}
                        >
                          <Text style={{ textAlign: "center" }}>
                            {index + 1}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            {
                              width: "36%",
                              textAlign: "left",
                              justifyContent: "center",
                            },
                          ]}
                        >
                          <Text>
                            {val?.ItemVariant?.styleMaster?.modelName?.name}
                          </Text>
                          <Text style={{ color: "#555", marginTop: 2 }}>
                            {[
                              val?.printingDesign?.name,
                              val?.Color?.name,
                              val?.Size?.name,
                            ]
                              .filter(Boolean)
                              .join(" / ")}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { width: "13%", justifyContent: "center" },
                          ]}
                        >
                          <Text style={{ textAlign: "right" }}>
                            {val?.Hsn?.name}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { width: "8%", justifyContent: "center" },
                          ]}
                        >
                          <Text style={{ textAlign: "right" }}>
                            {formatIndianNumber(val?.qty)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { width: "9%", justifyContent: "center" },
                          ]}
                        >
                          <Text style={{ textAlign: "right" }}>
                            {formatIndianNumber(val?.price)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            {
                              width: "10%",
                              justifyContent: "center",
                            },
                          ]}
                        >
                          <Text style={{ textAlign: "right" }}>{gross}</Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { width: "9%", justifyContent: "center" },
                          ]}
                        >
                          <Text style={{ textAlign: "right" }}>
                            {formatIndianNumber(val?.taxPercent)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            {
                              width: "10%",
                              justifyContent: "center",
                              borderRight: "none",
                            },
                          ]}
                        >
                          <Text style={{ textAlign: "right" }}>{net}</Text>
                        </View>
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
                      0,
                    );
                    const totalPrice = filledPoItems.reduce(
                      (sum, v) => sum + (isNaN(v.price) ? 0 : parseFloat(v.price)),
                      0,
                    );
                    const totalGross = filledPoItems.reduce(
                      (sum, v) =>
                        sum + (!isNaN(v.qty * v.price) ? v.qty * v.price : 0),
                      0,
                    );
                    const totalNetAmount = filledPoItems.reduce(
                      (sum, v) => {
                        const netAmount = enrichedPoItems?.[v.originalIndex]?.totals?.net || 0;
                        return sum + netAmount;
                      },
                      0,
                    );
                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          marginHorizontal: 20,
                          backgroundColor: "#e8e8ec",
                          borderLeft: "1 solid #b0b0b8",
                          borderRight: "1 solid #b0b0b8",
                          borderBottom: "1 solid #b0b0b8",
                        }}
                      >
                        {/* TOTAL label taking up S.No, Description, HSN (5+36+13 = 54%) */}
                        <Text
                          style={{
                            width: "54%",
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
                        {/* Total Qty (8%) */}
                        <Text
                          style={{
                            width: "8%",
                            fontSize: 8,
                            fontWeight: "bold",
                            color: "#1a1a2e",
                            textAlign: "right",
                            paddingVertical: 5,
                            paddingRight: 3,
                            borderRight: "1 solid #bbbbc8",
                          }}
                        >
                          {formatIndianNumber(totalQty, 3)}
                        </Text>
                        {/* Total Price (9%) */}
                        <Text
                          style={{
                            width: "9%",
                            fontSize: 8,
                            fontWeight: "bold",
                            color: "#1a1a2e",
                            textAlign: "right",
                            paddingVertical: 5,
                            paddingRight: 3,
                            borderRight: "1 solid #bbbbc8",
                          }}
                        >
                          {formatIndianNumber(totalPrice)}
                        </Text>
                        {/* Total Gross (10%) */}
                        <Text
                          style={{
                            width: "10%",
                            fontSize: 8,
                            fontWeight: "bold",
                            color: "#1a1a2e",
                            textAlign: "right",
                            paddingVertical: 5,
                            paddingRight: 3,
                            borderRight: "1 solid #bbbbc8",
                          }}
                        >
                          {formatIndianNumber(totalGross)}
                        </Text>
                        {/* Tax cell — blank (9%) */}
                        <Text
                          style={{
                            width: "9%",
                            fontSize: 8,
                            color: "transparent",
                            paddingVertical: 5,
                            paddingRight: 3,
                            borderRight: "1 solid #bbbbc8",
                          }}
                        >
                          {" "}
                        </Text>
                        {/* Total Net Amount (10%) */}
                        <Text
                          style={{
                            width: "10%",
                            fontSize: 8,
                            fontWeight: "bold",
                            color: "#1a1a2e",
                            textAlign: "right",
                            paddingVertical: 5,
                            paddingRight: 3,
                          }}
                        >
                          {formatIndianNumber(totalNetAmount)}
                        </Text>
                      </View>
                    );
                  })()}

                  {/* ── TAX BOX ── */}
                  <View style={styles.taxBox}>
                    <Text style={styles.taxHeader}>TAX DETAILS</Text>
                    {(taxDetails?.itemDiscount || 0) +
                      (taxDetails?.overallDiscount || 0) >
                      0 && (
                      <View style={styles.taxRow}>
                        <Text style={styles.taxLabel}>Total Discount</Text>
                        <Text style={styles.taxValue}>
                          {formatIndianNumber(
                            (taxDetails?.itemDiscount || 0) +
                              (taxDetails?.overallDiscount || 0),
                          )}
                        </Text>
                      </View>
                    )}
                    <View style={styles.taxRow}>
                      <Text style={styles.taxLabel}>Taxable Amt</Text>
                      <Text style={styles.taxValue}>
                        {formatIndianNumber(taxDetails?.taxable)}
                      </Text>
                    </View>
                    {taxDetails?.slabBreakup
                      ?.filter((item) => item.amount > 0)
                      ?.map((i) => (
                        <View key={i.tax} style={styles.taxRow}>
                          <Text style={styles.taxLabel}>{i.tax}</Text>
                          <Text style={styles.taxValue}>
                            {formatIndianNumber(i.amount)}
                          </Text>
                        </View>
                      ))}
                    {taxDetails?.roundOff ? (
                      <View style={styles.taxRow}>
                        <Text style={styles.taxLabel}>Round Off</Text>
                        <Text style={styles.taxValue}>
                          {formatIndianNumber(taxDetails.roundOff)}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.taxRowNet}>
                      <Text style={styles.taxLabelNet}>Net Amount</Text>
                      <Text style={styles.taxValueNet}>
                        {formatIndianNumber(taxDetails?.net)}
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
                    <Text style={styles.sigCompany}>
                      For {branchData?.branchName}
                    </Text>
                    <View style={styles.sigRow}>
                      {[
                        "Prepared By",
                        "Verified By",
                        "Received By",
                        "Approved By",
                      ].map((role) => (
                        <Text key={role} style={styles.sigItem}>
                          {role}
                        </Text>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* ── FOOTER BAR ── */}
              <View
                style={[styles.footerBar, !isLastPage && { marginTop: 20 }]}
              >
                <Text style={styles.footerLeft}></Text>
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
