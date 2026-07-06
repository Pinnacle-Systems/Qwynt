import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import Logo from "../../../../src/assets/mplogo.png";
import {
  findFromList,
  getDateFromDateTimeToDisplay,
} from "../../../Utils/helper";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    padding: 0,
    backgroundColor: "#fff",
  },
  topBar: { height: 4, backgroundColor: "#1a1a2e" },

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
  logo: { height: 52, width: 52 },
  companyCenter: { alignItems: "center", flex: 1, paddingHorizontal: 10 },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
    letterSpacing: 0.5,
  },
  companyRight: { width: 150, alignItems: "flex-start" },
  companyRightRow: { flexDirection: "row", marginBottom: 2, width: "100%" },
  companyLabel: { fontSize: 7.5, color: "#888", width: 38 },
  companyColon: { fontSize: 7.5, color: "#888", width: 8 },
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

  // ── META PILLS ──
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
    flexWrap: "wrap",
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
  metaLabel: { fontSize: 7.5, color: "#888", marginRight: 3 },
  metaValue: { fontSize: 7.5, fontWeight: "bold", color: "#1a1a2e" },

  // ── TWO COLUMN ──
  twoCol: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
    border: "1 solid #ddd",
    borderRadius: 3,
  },
  colHalf: { flex: 1 },
  colThird: { flex: 1 },
  sectionHeader: {
    backgroundColor: "#2d2d44",
    color: "#e8e8f0",
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionBody: { padding: 8 },
  infoName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 3,
  },
  infoRow: { flexDirection: "row", marginBottom: 2 },
  infoLabel: { fontSize: 7.5, color: "#888", width: 70 },
  infoValue: { fontSize: 7.5, color: "#222", fontWeight: "bold", flex: 1 },

  // ── SECTION WRAPPER ──
  sectionWrap: {
    marginHorizontal: 20,
    marginBottom: 8,
    border: "1 solid #ddd",
    borderRadius: 3,
    overflow: "hidden",
  },
  sectionTitle: {
    backgroundColor: "#2d2d44",
    color: "#e8e8f0",
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionContent: { padding: 5 },

  // ── GRID / CHECKBOX ──
  gridRow: { flexDirection: "row", flexWrap: "wrap" },
  gridCell: {
    width: "25%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  checkboxBox: {
    width: 9,
    height: 9,
    border: "1 solid #888",
    borderRadius: 1,
    marginRight: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#1a1a2e", border: "1 solid #1a1a2e" },
  checkboxTick: { color: "#fff", fontSize: 6 },
  checkLabel: { fontSize: 7.5, color: "#333" },

  // ── SPEC FIELDS ──
  specTable: { flexDirection: "row", flexWrap: "wrap" },
  specCell: { width: "25%", paddingVertical: 3, paddingRight: 8 },
  specLabel: {
    fontSize: 6.5,
    color: "#888",
    fontWeight: "bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  specValue: { fontSize: 8, color: "#1a1a2e", fontWeight: "bold" },

  // ── THREE COLUMN ──
  threeCol: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  threeColItem: {
    flex: 1,
    border: "1 solid #ddd",
    borderRadius: 3,
    overflow: "hidden",
  },

  // ── REMARKS ──
  remarksBar: {
    marginHorizontal: 20,
    marginBottom: 8,
    border: "1 solid #ddd",
    borderRadius: 3,
    overflow: "hidden",
  },
  remarksBody: { padding: 8, minHeight: 30 },
  remarksText: { fontSize: 7.5, color: "#555", lineHeight: 1.5 },

  // ── SIGNATURES ──
  sigArea: { marginHorizontal: 20, marginTop: 14, marginBottom: 8 },
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
  footerLeft: { fontSize: 7, color: "rgba(255,255,255,0.5)" },
  footerRight: { fontSize: 7, color: "rgba(255,255,255,0.5)" },

  // ── SIZE BREAKUP TABLE ──
  breakupTable: {
    border: "1 solid #ddd",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 6,
  },
  breakupTh: {
    backgroundColor: "#1a1a2e",
    flexDirection: "row",
  },
  breakupThCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRight: "1 solid #4a4a60",
  },
  breakupTrOdd: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    backgroundColor: "#fff",
  },
  breakupTrEven: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    backgroundColor: "#fafafa",
  },
  breakupTd: {
    fontSize: 7.5,
    color: "#333",
    textAlign: "center",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRight: "1 solid #eee",
  },

  // ── LABEL DETAIL FIELDS ──
  labelFieldRow: { flexDirection: "row", marginBottom: 4 },
  labelFieldLabel: { fontSize: 7.5, color: "#888", width: 70 },
  labelFieldValue: {
    fontSize: 7.5,
    color: "#1a1a2e",
    fontWeight: "bold",
    flex: 1,
  },

  // ── ORDER INFO FIELD ROW ──
  orderInfoRow: { flexDirection: "row", marginBottom: 3 },
  orderInfoLabel: { fontSize: 7, color: "#888", width: 72 },
  orderInfoColon: { fontSize: 7, color: "#888", width: 8 },
  orderInfoValue: {
    fontSize: 7,
    color: "#1a1a2e",
    fontWeight: "bold",
    flex: 1,
  },

  // ── QR ──
  qrBox: { alignItems: "center", justifyContent: "center", padding: 6 },
  qrImage: { width: 56, height: 56 },
  qrLabel: { fontSize: 6, color: "#aaa", marginTop: 2, textAlign: "center" },

  // ── PROCESS ROUTE (vertical) ──
  routeWrap: {
    marginHorizontal: 20,
    marginBottom: 8,
    border: "1 solid #ddd",
    borderRadius: 3,
    overflow: "hidden",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottom: "1 solid #f0f0f0",
  },
  routeRowEven: { backgroundColor: "#fafafa" },
  routeRowOdd: { backgroundColor: "#fff" },
  routeSeqBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  routeSeqText: { fontSize: 7, color: "#fff", fontWeight: "bold" },
  routeNameText: { fontSize: 8, color: "#1a1a2e", fontWeight: "bold" },
  routeConnector: {
    marginLeft: 19,
    width: 1,
    height: 6,
    backgroundColor: "#ccc",
  },

  // ── PLATE SET TABLE ──
  plateTable: {
    border: "1 solid #ddd",
    borderRadius: 2,
    overflow: "hidden",
  },
  plateTh: { backgroundColor: "#1a1a2e", flexDirection: "row" },
  plateThCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRight: "1 solid #4a4a60",
  },
  plateTrOdd: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    backgroundColor: "#fff",
  },
  plateTrEven: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    backgroundColor: "#fafafa",
  },
  plateTd: {
    fontSize: 7.5,
    color: "#333",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRight: "1 solid #eee",
  },
});

// ── SHARED HELPERS ────────────────────────────────────────────────────────────

const Checkbox = ({ checked, label, width }) => (
  <View style={[styles.gridCell, width ? { width } : {}]}>
    <View style={[styles.checkboxBox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkboxTick}>✓</Text>}
    </View>
    <Text style={styles.checkLabel}>{label}</Text>
  </View>
);

const SpecField = ({ label, value, width }) => (
  <View style={[styles.specCell, width ? { width } : {}]}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value || "—"}</Text>
  </View>
);

// ── PROCESS ROUTE — vertical simple view ─────────────────────────────────────

const ProcessRouteVertical = ({
  processRoute = [],
  title = "PROCESS ROUTE",
}) => {
  if (!processRoute || processRoute.length === 0) return null;

  const colSize = Math.ceil(processRoute.length / 3);
  const columns = [
    processRoute.slice(0, colSize),
    processRoute.slice(colSize, colSize * 2),
    processRoute.slice(colSize * 2),
  ];

  return (
    <View style={styles.routeWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View
        style={[
          styles.sectionContent,
          { flexDirection: "row", flexWrap: "wrap" },
        ]}
      >
        {processRoute.map((step, idx) => (
          <View
            key={idx}
            style={{
              width: "25%",
              borderRight: (idx + 1) % 4 === 0 ? "none" : "1 solid #eee",
              borderBottom: "1 solid #f0f0f0",
            }}
          >
            <View
              style={[
                styles.routeRow,
                idx % 2 === 0 ? styles.routeRowOdd : styles.routeRowEven,
              ]}
            >
              <View style={styles.routeSeqBadge}>
                <Text style={styles.routeSeqText}>{idx + 1}</Text>
              </View>
              <Text style={styles.routeNameText}>
                {step.name || `Step ${idx + 1}`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── PLATE SET TABLE ───────────────────────────────────────────────────────────

const PlateSetTable = ({ plateDetails = [] }) => {
  const filtered = plateDetails.filter((p) => p.plateName || p.qty);
  if (filtered.length === 0)
    return (
      <Text style={{ fontSize: 7.5, color: "#aaa", fontStyle: "italic" }}>
        No plate details.
      </Text>
    );
  return (
    <View style={styles.plateTable}>
      <View style={styles.plateTh}>
        <Text style={[styles.plateThCell, { flex: 0.4 }]}>S.No</Text>
        <Text style={[styles.plateThCell, { flex: 3 }]}>Plate Name</Text>
        <Text style={[styles.plateThCell, { flex: 1, borderRight: "none" }]}>
          Qty
        </Text>
      </View>
      {filtered.map((row, idx) => (
        <View
          key={idx}
          style={idx % 2 === 0 ? styles.plateTrOdd : styles.plateTrEven}
        >
          <Text style={[styles.plateTd, { flex: 0.4, textAlign: "center" }]}>
            {idx + 1}
          </Text>
          <Text style={[styles.plateTd, { flex: 3 }]}>
            {row.plateName || "—"}
          </Text>
          <Text
            style={[
              styles.plateTd,
              { flex: 1, textAlign: "right", borderRight: "none" },
            ]}
          >
            {row.qty || ""}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ── SIZE BREAKUP TABLE (PDF) ──────────────────────────────────────────────────

const SizeBreakupTable = ({ sizeDetails, sizeList }) => {
  if (!sizeDetails || sizeDetails.length === 0) return null;

  return (
    <View style={styles.breakupTable}>
      <View style={styles.breakupTh}>
        <Text style={[styles.breakupThCell, { flex: 0.4 }]}>S.No</Text>
        <Text style={[styles.breakupThCell, { flex: 2 }]}>Size</Text>
        <Text style={[styles.breakupThCell, { flex: 1, borderRight: "none" }]}>
          Qty
        </Text>
      </View>
      {sizeDetails.map((item, idx) => (
        <View
          key={idx}
          style={idx % 2 === 0 ? styles.breakupTrOdd : styles.breakupTrEven}
        >
          <Text style={[styles.breakupTd, { flex: 0.4 }]}>{idx + 1}</Text>
          <Text style={[styles.breakupTd, { flex: 2, textAlign: "left" }]}>
            {findFromList(item.sizeId, sizeList?.data, "name") || "—"}
          </Text>
          <Text
            style={[
              styles.breakupTd,
              { flex: 1, textAlign: "right", borderRight: "none" },
            ]}
          >
            {Number(item.qty) || ""}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ── FOOTER BLOCK (shared) ─────────────────────────────────────────────────────

const FooterBlock = ({ remarks, branchName }) => (
  <>
    <View style={styles.remarksBar}>
      <Text style={styles.sectionTitle}>REMARKS</Text>
      <View style={styles.remarksBody}>
        <Text style={styles.remarksText}>{remarks || ""}</Text>
      </View>
    </View>

    <View style={styles.sigArea}>
      <Text style={styles.sigCompany}>For {branchName || ""}</Text>
      <View style={styles.sigRow}>
        {[
          "Designer Sign",
          "Incharge Sign",
          "Proprietor Sign",
          "Operator Sign",
        ].map((role) => (
          <Text key={role} style={styles.sigItem}>
            {role}
          </Text>
        ))}
      </View>
    </View>

    <View style={styles.footerBar}>
      <Text style={styles.footerLeft}></Text>
      <Text
        style={styles.footerRight}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  </>
);

// ── RESOLVE PROCESS ROUTE NAMES ───────────────────────────────────────────────
// processRoute from DB: [{ type, processId, sequence, isFront, isFrontAndBack }]
// We need to resolve display names from the various process lists.

const resolveRouteSteps = (
  dbProcessRoute = [],
  defaultList = [],
  laminationList = [],
  varnishList = [],
  boardList = [],
  printingList = [],
  labelPrintingList = [],
  finishingList = [],
) => {
  const sorted = [...dbProcessRoute].sort((a, b) => a.sequence - b.sequence);
  return sorted.map((r) => {
    const allLists = [
      ...defaultList,
      ...laminationList,
      ...varnishList,
      ...boardList,
      ...printingList,
      ...labelPrintingList,
      ...finishingList,
    ];
    const found = allLists.find((p) => p.id === r.processId);
    let name = found?.name || `#${r.processId}`;
    if (r.isFront) name += " (Front)";
    else if (r.isFrontAndBack) name += " (F & B)";
    return { name, sequence: r.sequence };
  });
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

const JobCardPrintFormat = ({
  singleData,
  customerList,
  boardList,
  gsmList,
  plateList,
  dieList,
  defaultList,
  laminationList,
  varnishList,
  machineList,
  branchData,
  orderList,
  sizeList,
  colorList,
  qrCodeDataUrl,
  employeeList,
  styleItemList,
  labelPrintingList,
  finishingList,
  printingList,
  styleList,
}) => {
  if (!singleData) return null;

  const {
    docId,
    docDate,
    orderQty,
    customerId,
    remarks,
    cuttingSizeId,
    splitType,
    runningQty,
    plateId,
    dieId,
    totalPlatesets,
    machineDetails,
    jobRunTime,
    itemType,
    styleItemId,
    block,
    rollQty,
    totalMeter,
    jobCardSizeDetails,
    trackingType,
    productionType,
    tagCardUps,
    followUpId,
    designerId,
    processRoute: dbProcessRoute,
    plateDetails,
    labelSizeId,
    colorId,
    labelItemId,
  } = singleData;

  const isLabel = itemType === "LABEL";

  const customer = customerList?.data?.find((c) => c.id === customerId);
  const orderEntry = orderList?.data?.find(
    (o) => o.id === singleData?.orderEntryId,
  );
  const styleItemName =
    singleData?.StyleItem?.name ||
    findFromList(styleItemId, styleItemList?.data, "name") ||
    "";
  const followUpName =
    employeeList?.data?.find((e) => e.id === followUpId)?.name || "";
  const designerName =
    employeeList?.data?.find((e) => e.id === designerId)?.name || "";
  const cuttingSizeName = findFromList(cuttingSizeId, sizeList?.data, "name");
  const labelSizeName = findFromList(labelSizeId, sizeList?.data, "name");
  const labelColorName =
    findFromList(colorId, colorList?.data || [], "name") || "";
  const labelItem =
    findFromList(labelItemId, styleList?.data || [], "name") || "";

  // Selected machines (only those in machineDetails)
  const selectedMachineIds = machineDetails?.map((m) => m.macId) || [];
  const selectedMachines = (machineList?.data || machineList || []).filter(
    (m) => selectedMachineIds.includes(m.id),
  );

  // Process route steps with resolved names
  const routeSteps = resolveRouteSteps(
    dbProcessRoute || [],
    defaultList || [],
    laminationList || [],
    varnishList || [],
    boardList || [],
    printingList || [], // printingList — pass if available
    labelPrintingList || [],
    finishingList || [],
  );

  // Plate set details filtered
  const filteredPlateDetails = (plateDetails || []).filter(
    (p) => p.plateName || p.qty,
  );

  const BoardDetailsGrid = ({
    boardQualities = [],
    boardList,
    gsmList,
    sizeList,
  }) => {
    const filtered = boardQualities.filter((r) => r.processId);
    if (filtered.length === 0) return null;
    return (
      <View>
        <Text style={{ paddingLeft: 5, marginTop: 2 }}>BOARD DETAILS</Text>
        <View style={styles.sectionContent}>
          <View style={styles.breakupTable}>
            <View style={styles.breakupTh}>
              <Text style={[styles.breakupThCell, { flex: 0.4 }]}>S.No</Text>
              <Text style={[styles.breakupThCell, { flex: 2 }]}>
                Board Quality
              </Text>
              <Text style={[styles.breakupThCell, { flex: 1 }]}>GSM</Text>
              <Text style={[styles.breakupThCell, { flex: 1.5 }]}>
                Full Board
              </Text>
              <Text
                style={[styles.breakupThCell, { flex: 1, borderRight: "none" }]}
              >
                No. of Sheets
              </Text>
            </View>
            {filtered.map((row, idx) => (
              <View
                key={idx}
                style={
                  idx % 2 === 0 ? styles.breakupTrOdd : styles.breakupTrEven
                }
              >
                <Text
                  style={[styles.breakupTd, { flex: 0.4, textAlign: "center" }]}
                >
                  {idx + 1}
                </Text>
                <Text style={[styles.breakupTd, { flex: 2 }]}>
                  {findFromList(row.processId, boardList, "name") || "—"}
                </Text>
                <Text style={[styles.breakupTd, { flex: 1 }]}>
                  {findFromList(row.gsmId, gsmList?.data, "name") || "—"}
                </Text>
                <Text style={[styles.breakupTd, { flex: 1.5 }]}>
                  {findFromList(row.fullBoardId, sizeList?.data, "name") || "—"}
                </Text>
                <Text
                  style={[
                    styles.breakupTd,
                    { flex: 1, textAlign: "right", borderRight: "none" },
                  ]}
                >
                  {row.noOfSheets || "—"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── TOP ACCENT BAR ── */}
        <View style={styles.topBar} />

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Image src={Logo} style={styles.logo} />
          <View style={styles.companyCenter}>
            <Text style={styles.companyName}>
              {branchData?.branchName || ""}
            </Text>
            {branchData?.address ? (
              <Text
                style={{
                  fontSize: 7.5,
                  color: "#666",
                  marginTop: 2,
                  textAlign: "center",
                }}
              >
                {branchData.address}
              </Text>
            ) : null}
          </View>
          <View style={styles.companyRight}>
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
        <Text style={styles.titleBand}>
          {isLabel ? "JOB CARD — LABEL" : "JOB CARD"}
        </Text>

        {/* ── META PILLS ── */}
        <View style={styles.metaRow}>
          {[
            { label: "Job Card No", value: docId },
            { label: "Date", value: getDateFromDateTimeToDisplay(docDate) },
            { label: "Order No", value: orderEntry?.docId || "-" },
            { label: "Order Qty", value: orderQty ? Number(orderQty) : "" },
          ].map(({ label, value }) => (
            <View key={label} style={styles.metaPill}>
              <Text style={styles.metaLabel}>{label}:</Text>
              <Text style={styles.metaValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── CUSTOMER + ORDER DETAILS + QR ── */}
        <View style={[styles.twoCol, { alignItems: "stretch" }]}>
          {/* Customer */}
          <View
            style={[
              styles.colThird,
              { borderRight: "1 solid #ddd", flex: 1.2 },
            ]}
          >
            <Text style={styles.sectionHeader}>CUSTOMER</Text>
            <View style={styles.sectionBody}>
              <Text
                style={{ fontSize: 8, fontWeight: "bold", color: "#1a1a2e" }}
              >
                {customer?.name || "—"}
              </Text>
              <Text style={{ fontSize: 7, color: "#888", marginTop: 3 }}>
                Production: {productionType || "—"}
              </Text>
            </View>
          </View>

          {/* Order Details */}
          <View
            style={[styles.colThird, { borderRight: "1 solid #ddd", flex: 2 }]}
          >
            <Text style={styles.sectionHeader}>ORDER DETAILS</Text>
            <View style={styles.sectionBody}>
              {[
                { label: "Item Description", value: styleItemName },
                ...(!isLabel
                  ? [
                      { label: "Tag / Card Ups", value: tagCardUps },
                      { label: "Job Run Time", value: jobRunTime },
                    ]
                  : []),
                { label: "Follow Up", value: followUpName },
                { label: "Designer", value: designerName },
              ].map(({ label, value }) => (
                <View key={label} style={styles.orderInfoRow}>
                  <Text style={styles.orderInfoLabel}>{label}</Text>
                  <Text style={styles.orderInfoColon}> : </Text>
                  <Text style={styles.orderInfoValue}>{value || "—"}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* QR Code */}
          <View
            style={{
              flex: 0.6,
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
            }}
          >
            {qrCodeDataUrl ? (
              <>
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
                <Text style={styles.qrLabel}>Scan to identify</Text>
              </>
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  border: "1 dashed #ccc",
                  borderRadius: 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 6, color: "#bbb", textAlign: "center" }}
                >
                  QR Code
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            NON-LABEL LAYOUT
        ══════════════════════════════════════════════════ */}
        {!isLabel && (
          <>
            {/* ── SPECIFICATIONS ── */}
            <View style={styles.sectionWrap}>
              <BoardDetailsGrid
                boardQualities={singleData?.boardQualities || []}
                boardList={boardList}
                gsmList={gsmList}
                sizeList={sizeList}
              />
              <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>
              <View style={styles.sectionContent}>
                <View style={styles.specTable}>
                  <SpecField label="Cutting Size" value={cuttingSizeName} />
                  <SpecField label="Split Type" value={splitType || "—"} />
                  <SpecField label="Running Qty" value={runningQty || "—"} />
                  <SpecField
                    label="Plate Details"
                    value={findFromList(plateId, plateList?.data, "name")}
                  />
                  <SpecField
                    label="Die Details"
                    value={findFromList(dieId, dieList?.data, "name")}
                  />
                  <SpecField
                    label="Total Plate Sets"
                    value={totalPlatesets || "—"}
                  />
                </View>
              </View>
            </View>

            {/* ── SIZE DETAILS + PLATE SET DETAILS — side by side ── */}
            <View
              style={{
                flexDirection: "row",
                marginHorizontal: 20,
                marginBottom: 8,
                gap: 8,
              }}
            >
              {/* Size Details */}
              <View
                style={{
                  flex: 1,
                  border: "1 solid #ddd",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Text style={{ paddingLeft: 5, marginTop: 2 }}>
                  {"SIZE WISE DETAILS"}
                </Text>
                <View style={styles.sectionContent}>
                  {jobCardSizeDetails && jobCardSizeDetails.length > 0 ? (
                    <SizeBreakupTable
                      //   trackingType={trackingType}
                      sizeDetails={jobCardSizeDetails}
                      sizeList={sizeList}
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: 7.5,
                        color: "#aaa",
                        fontStyle: "italic",
                      }}
                    >
                      No size details available.
                    </Text>
                  )}
                </View>
              </View>

              {/* Plate Set Details */}
              <View
                style={{
                  flex: 1,
                  border: "1 solid #ddd",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Text style={{ paddingLeft: 5, marginTop: 2 }}>
                  PLATE SET DETAILS
                </Text>
                <View style={styles.sectionContent}>
                  <PlateSetTable plateDetails={plateDetails || []} />
                </View>
              </View>
            </View>

            {/* ── PROCESS ROUTE — vertical ── */}
            <ProcessRouteVertical
              processRoute={routeSteps}
              title="PROCESS ROUTE"
            />

            {/* ── MACHINES (selected only) ── */}
            {selectedMachines.length > 0 && (
              <View style={styles.sectionWrap}>
                <Text style={styles.sectionTitle}>MACHINE DETAILS</Text>
                <View style={[styles.sectionContent, { paddingVertical: 6 }]}>
                  <View style={styles.gridRow}>
                    {selectedMachines.map((item) => (
                      <Checkbox
                        key={item.id}
                        checked={true}
                        label={`${item.name}${item.Size?.name ? ` (${item.Size.name})` : ""}`}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════
            LABEL LAYOUT
        ══════════════════════════════════════════════════ */}
        {isLabel && (
          <>
            {/* ── LABEL DETAILS + SIZE BREAKUP ── */}
            <View style={styles.twoCol}>
              <View style={[styles.colHalf, { borderRight: "1 solid #ddd" }]}>
                <Text style={styles.sectionHeader}>LABEL DETAILS</Text>
                <View style={styles.sectionBody}>
                  {[
                    {
                      label: "Label Quality",
                      value: labelItem,
                    },
                    { label: "Label Size", value: labelSizeName },
                    { label: "Label Color", value: labelColorName },
                    // {
                    //   label: "Label Qty",
                    //   value: orderQty ? Number(orderQty) : "",
                    // },
                    { label: "Roll Qty", value: rollQty },
                    { label: "Total Meter", value: totalMeter },
                    { label: "Block", value: block },
                  ].map(({ label, value }) => (
                    <View key={label} style={styles.labelFieldRow}>
                      <Text style={styles.labelFieldLabel}>{label}</Text>
                      <Text style={styles.labelFieldValue}>
                        : {value || "—"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Size breakup */}
              <View style={styles.colHalf}>
                <Text style={styles.sectionHeader}>{"SIZE WISE DETAILS"}</Text>
                <View style={styles.sectionBody}>
                  {jobCardSizeDetails && jobCardSizeDetails.length > 0 ? (
                    <SizeBreakupTable
                      trackingType={trackingType}
                      sizeDetails={jobCardSizeDetails}
                      sizeList={sizeList}
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: 7.5,
                        color: "#aaa",
                        fontStyle: "italic",
                      }}
                    >
                      No size details available.
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* ── PROCESS ROUTE — vertical ── */}
            <ProcessRouteVertical
              processRoute={routeSteps}
              title="PROCESS ROUTE"
            />

            <View style={{ flex: 1 }} />
          </>
        )}

        {/* ── REMARKS + SIGNATURES + FOOTER ── */}
        <FooterBlock remarks={remarks} branchName={branchData?.branchName} />
      </Page>
    </Document>
  );
};

export default JobCardPrintFormat;
