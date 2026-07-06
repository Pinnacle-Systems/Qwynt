import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
} from "@react-pdf/renderer";
import Logo from "../../../assets/mplogo.png";
import moment from "moment";
import { findFromList } from "../../../Utils/helper";

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

    // ── TOP ACCENT BAR ──
    topBar: { height: 4, backgroundColor: DARK },

    // ── HEADER ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 14,
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

    // ── META PILLS ──
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

    // ── FROM / TO SECTION ──
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
    partyLabel: { fontSize: 7.5, color: "#888", width: 72 },
    partyValue: { fontSize: 7.5, color: "#222", fontFamily: "Helvetica-Bold" },

    // ── EXPORT DETAILS GRID ──
    exportGrid: {
        marginHorizontal: 20,
        marginBottom: 8,
        border: `1 solid ${BORDER_LIGHT}`,
        borderRadius: 3,
        flexDirection: "row",
        backgroundColor: LIGHT_BG,
    },
    exportCol: { flex: 1, padding: 8, borderRight: `1 solid ${BORDER_LIGHT}` },
    exportItem: { flexDirection: "row", marginBottom: 4 },
    exportLabel: { fontSize: 7.5, color: "#888", width: 88 },
    exportValue: {
        fontSize: 7.5,
        color: DARK,
        fontFamily: "Helvetica-Bold",
        flex: 1,
    },

    // ── TABLE ──
    tableWrap: { marginHorizontal: 20, border: `1 solid ${BORDER}` },
    tableHeader: { flexDirection: "row", backgroundColor: DARK },
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
        borderBottom: `1 solid ${BORDER_ROW}`,
        backgroundColor: "#fff",
    },
    trEven: {
        flexDirection: "row",
        borderBottom: `1 solid ${BORDER_ROW}`,
        backgroundColor: LIGHT_BG,
    },
    td: {
        fontSize: 7.5,
        color: "#333",
        textAlign: "center",
        borderRight: `1 solid ${BORDER_ROW}`,
        paddingVertical: 4,
        paddingHorizontal: 3,
    },

    // ── TOTALS ROW ──
    totalRow: {
        flexDirection: "row",
        marginHorizontal: 20,
        backgroundColor: "#e8e8ec",
        borderLeft: `1 solid ${BORDER}`,
        borderRight: `1 solid ${BORDER}`,
        borderBottom: `1 solid ${BORDER}`,
    },

    // ── PO-STYLE TAX BOX ──
    taxBox: {
        width: 160,
        marginTop: 8,
        marginRight: 20,
        alignSelf: "flex-end",
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
    taxRow: {
        flexDirection: "row",
        borderTop: `1 solid #ebebeb`,
    },
    taxRowNet: {
        flexDirection: "row",
        borderTop: `1 solid ${DARK}`,
        backgroundColor: DARK,
    },
    taxLabel: { flex: 1, fontSize: 7.5, color: "#333", padding: 4 },
    taxValue: { fontSize: 7.5, color: "#333", textAlign: "right", padding: 4, minWidth: 55 },
    taxLabelNet: { flex: 1, fontSize: 7.5, color: "#fff", fontFamily: "Helvetica-Bold", padding: 4 },
    taxValueNet: { fontSize: 7.5, color: "#fff", fontFamily: "Helvetica-Bold", textAlign: "right", padding: 4, minWidth: 55 },

    // ── BANK + SUMMARY ──
    bankSummaryRow: {
        flexDirection: "row",
        marginHorizontal: 20,
        marginTop: 8,
        gap: 8,
    },
    bankBox: {
        flex: 1,
        border: `1 solid ${BORDER_LIGHT}`,
        borderRadius: 3,
    },
    summaryBox: {
        width: 200,
        border: `1 solid ${BORDER_LIGHT}`,
        borderRadius: 3,
    },
    summaryRow: {
        flexDirection: "row",
        borderBottom: `1 solid ${BORDER_LIGHT}`,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    summaryLabel: { fontSize: 7.5, color: "#888", flex: 1 },
    summaryValue: {
        fontSize: 7.5,
        fontFamily: "Helvetica-Bold",
        color: DARK,
        textAlign: "right",
    },

    // ── BOTTOM SECTION ──
    bottomSection: {
        marginHorizontal: 20,
        marginTop: 8,
        flexDirection: "row",
        gap: 8,
    },
    remarksBox: {
        flex: 1,
        border: `1 solid ${BORDER_LIGHT}`,
        borderRadius: 3,
    },
    termsBox: {
        flex: 2,
        border: `1 solid ${BORDER_LIGHT}`,
        borderRadius: 3,
    },

    // ── FOOTER ──
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

// ── TABLE COLUMNS ─────────────────────────────────────────────────────────────
// For export: no Tax% or Net Amount columns
// For domestic: include Tax% and Net Amount
const getColumns = (isExport) => [
    { label: "S.No", flex: 0.4 },
    { label: "Description of Goods", flex: 3 },
    { label: "HSN", flex: 1.2 },
    { label: "UOM", flex: 0.8 },
    { label: "Qty", flex: 0.8 },
    { label: "Dozen", flex: 0.8 },
    { label: "Price", flex: 1 },
    ...(!isExport ? [{ label: "Tax %", flex: 0.7 }] : []),
    { label: "Gross Amount", flex: 1.2 },
    // Tax% and Net Amount only for domestic
];



const TableHeader = ({ isExport, currencySymbol }) => {
    const cols = getColumns(isExport);
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
                    {label === "Price" && currencySymbol ? `Price (${currencySymbol})` : label}
                    {label === "Gross Amount" && currencySymbol ? `\n(${currencySymbol})` : ""}
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
            marginBottom: 2
        }}
    >
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#fff", letterSpacing: 2 }}>
            PROFORMA INVOICE — Continued
        </Text>
        <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>
            PI No: {docId}  |  {branchName}
        </Text>
    </View>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const ProformaInvoicePrintFormat = ({ data, taxDetails, isCustomerExport: isExportProp, cityList, currencyList, payTermList }) => {
    if (!data) return null;

    const isExport = isExportProp ?? data?.customer?.isCustomerExport ?? false;
    const currencySymbol = findFromList(data?.currencyId, currencyList?.data, "symbol") || "";

    const ROWS_PAGE_1 = isExport ? 11 : 13;
    const ROWS_PAGE_CONT = isExport ? 11 : 13;

    const chunkItems = (items) => {
        const pages = [];
        let rem = [...items];
        pages.push(rem.splice(0, ROWS_PAGE_1));
        while (rem.length > 0) pages.push(rem.splice(0, ROWS_PAGE_CONT));
        return pages;
    };

    const branch = data?.Branch || {};
    const customer = data?.customer || {};
    const bank = data?.Bank || {};

    // Filter only real items
    const allItems = (data?.items || []).filter((i) => i.styleItemId);

    // Totals
    const totalQty = allItems.reduce((s, i) => s + (parseFloat(i.qty) || 0), 0);
    const totalDozen = allItems.reduce((s, i) => s + (parseFloat(i.dozen) || 0), 0);
    const totalGross = allItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const carriageCharge = parseFloat(data?.carriageCharge) || 0;
    const grandTotal = isExport ? totalGross + carriageCharge : totalGross;

    // ── DOMESTIC TAX: per-slab breakup (mirrors PurchaseOrderPrintFormat taxBox) ──
    // Each item carries taxPercent; group by slab, sum taxable + tax amounts
    const taxableTotal = parseFloat(taxDetails?.taxable || 0);
    const totalTaxAmt = parseFloat(taxDetails?.net || 0) - taxableTotal;
    const netAmount = parseFloat(taxDetails?.net || 0);
    const taxSlabBreakup = (taxDetails?.slabBreakup || []).filter(s => (s.amount || 0) > 0);

    const loadingPort = findFromList(data?.loadingId, cityList?.data, "name") || "";
    const deliveryPort = findFromList(data?.deliveryId, cityList?.data, "name") || "";

    // Pagination
    // const pageChunks = chunkItems(allItems);
    // const renderChunks = pageChunks.length === 0 ? [[]] : pageChunks;
    // Only chunk if items exceed page 1 capacity
    const pageChunks = (() => {
        if (allItems.length === 0) return [[]];
        const pages = [];
        let rem = [...allItems];
        pages.push(rem.splice(0, ROWS_PAGE_1));
        while (rem.length > 0) pages.push(rem.splice(0, ROWS_PAGE_CONT));
        return pages;
    })();

    // Never render a page that has zero real items AND is not page 1
    const renderChunks = pageChunks.filter((chunk, i) => i === 0 || chunk.length > 0);
    const pageOffsets = renderChunks.reduce((acc, chunk, i) => {
        acc.push(i === 0 ? 0 : acc[i - 1] + renderChunks[i - 1].length);
        return acc;
    }, []);

    const cols = getColumns(isExport);

    return (
        <Document>
            {renderChunks.map((chunkRows, pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === renderChunks.length - 1;
                const globalOffset = pageOffsets[pageIndex] || 0;
                const minRows = isFirstPage ? ROWS_PAGE_1 : ROWS_PAGE_CONT;
                const emptyCount = Math.max(0, minRows - chunkRows.length);

                return (
                    <Page key={pageIndex} size="A4" style={styles.borderBox}>
                        <View style={styles.page}>
                            {/* TOP ACCENT BAR */}
                            <View style={styles.topBar} />

                            {isFirstPage ? (
                                <>
                                    {/* ── HEADER ── */}
                                    <View style={styles.header}>
                                        <View style={{ width: 60 }}>
                                            <Image src={Logo} style={styles.logo} />
                                        </View>
                                        <View style={styles.companyCenter}>
                                            <Text style={styles.companyName}>{branch?.branchName || "MUTHU PRINTERS"}</Text>
                                            <Text style={styles.companyAddress}>{branch?.address || ""}</Text>
                                            {branch?.contactEmail ? (
                                                <Text style={{ fontSize: 7.5, color: "#555", marginTop: 1 }}>
                                                    {branch.contactEmail}{branch?.contactMobile ? `  |  ${branch.contactMobile}` : ""}
                                                </Text>
                                            ) : null}
                                        </View>
                                        <View style={{ width: 60 }} />
                                    </View>

                                    {/* TITLE BAND */}
                                    <Text style={styles.titleBand}>PROFORMA INVOICE</Text>

                                    {/* INTRO TEXT */}
                                    <View style={{ marginHorizontal: 20, marginBottom: 6, backgroundColor: "#f9f9fb", border: `1 solid ${BORDER_LIGHT}`, borderRadius: 3, padding: 8 }}>
                                        {isExport && (
                                            <Text style={{ fontSize: 7.5, color: DARK, fontFamily: "Helvetica-Bold", marginBottom: 3, letterSpacing: 0.3 }}>
                                                Accessories For 100% Export Oriented Ready Made Garments Industry
                                            </Text>
                                        )}
                                        <Text style={{ fontSize: 7.5, color: "#555", marginBottom: 2 }}>
                                            Herewith we are giving our rate quotation for the following items.
                                        </Text>
                                        <Text style={{ fontSize: 7.5, color: "#555" }}>
                                            If you have any questions about the rate quotations, please contact us.
                                        </Text>
                                    </View>

                                    {/* META PILLS */}
                                    <View style={styles.metaRow}>
                                        {[
                                            { label: "PI No", value: data?.docId },
                                            { label: "PI Date", value: data?.docDate ? moment(data.docDate).format("DD-MM-YYYY") : "" },
                                            { label: "Payment Term", value: findFromList(data?.payTermId, payTermList?.data, "name") || "" },
                                            { label: "Valid To", value: data?.validityTo ? moment(data.validityTo).format("DD-MM-YYYY") : "" },
                                            { label: "Delivery Date", value: data?.deliveryDate ? moment(data.deliveryDate).format("DD-MM-YYYY") : "" },
                                        ].map(({ label, value }) => (
                                            <View key={label} style={styles.metaPill}>
                                                <Text style={styles.metaLabel}>{label}:</Text>
                                                <Text style={styles.metaValue}>{value}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* FROM / TO */}
                                    <View style={styles.twoCol}>
                                        <View style={[styles.colHalf, { borderRight: `1 solid ${BORDER_LIGHT}` }]}>
                                            <Text style={styles.sectionHeader}>FROM</Text>
                                            <View style={styles.sectionBody}>
                                                <Text style={styles.partyName}>{branch?.branchName || "MUTHU PRINTERS"}</Text>
                                                <Text style={styles.partyAddr}>{branch?.address || ""}</Text>
                                                {[
                                                    { label: "Mobile No", value: branch?.contactMobile },
                                                    { label: "GST No", value: branch?.company?.gstNo },
                                                    { label: "Email", value: branch?.contactEmail },
                                                ].map(({ label, value }) => value ? (
                                                    <View key={label} style={styles.partyRow}>
                                                        <Text style={styles.partyLabel}>{label}</Text>
                                                        <Text style={styles.partyValue}>: {value}</Text>
                                                    </View>
                                                ) : null)}

                                            </View>
                                        </View>
                                        <View style={styles.colHalf}>
                                            <Text style={styles.sectionHeader}>CUSTOMER DETAILS</Text>
                                            <View style={styles.sectionBody}>
                                                <Text style={styles.partyName}>{customer?.name || "N/A"}</Text>
                                                <Text style={styles.partyAddr}>{customer?.address || ""}</Text>
                                                {[
                                                    { label: "Contact Person", value: customer?.contactPersonName },
                                                    { label: "Mobile No", value: customer?.contactNumber },
                                                    { label: "GST No", value: customer?.gstNo },
                                                    { label: "Email", value: customer?.contactPersonEmail },
                                                ].map(({ label, value }) => value ? (
                                                    <View key={label} style={styles.partyRow}>
                                                        <Text style={styles.partyLabel}>{label}</Text>
                                                        <Text style={styles.partyValue}>: {value}</Text>
                                                    </View>
                                                ) : null)}
                                            </View>
                                        </View>
                                    </View>

                                    {/* EXPORT DETAILS GRID */}
                                    {isExport && (
                                        <View style={styles.exportGrid}>
                                            <View style={styles.exportCol}>
                                                <View style={styles.exportItem}>
                                                    <Text style={styles.exportLabel}>Country of Origin</Text>
                                                    <Text style={styles.exportValue}>: INDIA</Text>
                                                </View>
                                                <View style={styles.exportItem}>
                                                    <Text style={styles.exportLabel}>Port of Loading</Text>
                                                    <Text style={styles.exportValue}>: {loadingPort || "—"}</Text>
                                                </View>
                                            </View>
                                            <View style={[styles.exportCol, { borderRight: "none" }]}>
                                                <View style={styles.exportItem}>
                                                    <Text style={styles.exportLabel}>Port of Delivery</Text>
                                                    <Text style={styles.exportValue}>: {deliveryPort || "—"}</Text>
                                                </View>
                                                <View style={styles.exportItem}>
                                                    <Text style={styles.exportLabel}>Weight (KG)</Text>
                                                    <Text style={styles.exportValue}>: {data?.weightInKg ? parseFloat(data.weightInKg).toFixed(3) : "—"}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <ContinuationBar docId={data?.docId} branchName={branch?.branchName || ""} />
                            )}

                            {/* ── TABLE ── */}
                            <View style={styles.tableWrap}>
                                <TableHeader isExport={isExport} currencySymbol={currencySymbol} />

                                {/* Item rows */}
                                {chunkRows.map((row, index) => {
                                    const rowStyle = index % 2 === 0 ? styles.trOdd : styles.trEven;
                                    const gross = parseFloat(row.amount) || 0;
                                    const taxPct = parseFloat(row.taxPercent) || 0;
                                    const netAmt = gross + (gross * taxPct) / 100;
                                    return (
                                        <View key={globalOffset + index} style={rowStyle}>
                                            <Text style={[styles.td, { flex: 0.4 }]}>{globalOffset + index + 1}</Text>
                                            <Text style={[styles.td, { flex: 3, textAlign: "left" }]}>{row?.StyleItem?.name || ""}</Text>
                                            <Text style={[styles.td, { flex: 1.2 }]}>{row?.Hsn?.name || ""}</Text>
                                            <Text style={[styles.td, { flex: 0.8 }]}>{row?.Uom?.name || ""}</Text>
                                            <Text style={[styles.td, { flex: 0.8, textAlign: "right" }]}>{row.qty ? parseFloat(row.qty).toFixed(3) : ""}</Text>
                                            <Text style={[styles.td, { flex: 0.8, textAlign: "right" }]}>{row.dozen ? parseFloat(row.dozen).toFixed(2) : ""}</Text>
                                            <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{row.price ? `${currencySymbol} ${parseFloat(row.price).toFixed(2)}` : ""}</Text>
                                            {!isExport && (
                                                <>
                                                    <Text style={[styles.td, { flex: 0.7, textAlign: "right" }]}>{taxPct ? `${taxPct}%` : ""}</Text>
                                                </>
                                            )}
                                            <Text style={[styles.td, { flex: 1.2, textAlign: "right" }, isExport && { borderRight: "none" }]}>
                                                {gross ? `${currencySymbol} ${gross.toFixed(2)}` : ""}
                                            </Text>
                                            {/* Tax % and Net Amount — domestic only */}

                                        </View>
                                    );
                                })}

                                {/* Empty filler rows */}
                                {Array.from({ length: emptyCount }).map((_, i) => {
                                    const rowStyle = (chunkRows.length + i) % 2 === 0 ? styles.trOdd : styles.trEven;
                                    return (
                                        <View key={`empty-${i}`} style={rowStyle}>
                                            {cols.map(({ flex }, ci) => (
                                                <Text key={ci} style={[styles.td, { flex }, ci === cols.length - 1 && { borderRight: "none" }]}> </Text>
                                            ))}
                                        </View>
                                    );
                                })}
                            </View>

                            {/* ── TOTALS ROW ── */}
                            {isLastPage && (
                                <>
                                    {/* Totals bar */}
                                    <View style={styles.totalRow}>
                                        <Text style={{ flex: 0.4, fontSize: 8, color: "transparent", paddingVertical: 4, borderRight: `1 solid #bbbbc8` }}> </Text>
                                        <Text style={{ flex: 2.9, fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, paddingVertical: 4, paddingRight: 2, textAlign: "right", borderRight: `1 solid #bbbbc8` }}>TOTAL</Text>
                                        <Text style={{ flex: 1.2, fontSize: 8, color: "transparent", paddingVertical: 4, borderRight: `1 solid #bbbbc8` }}> </Text>
                                        <Text style={{ flex: 0.8, fontSize: 8, color: "transparent", paddingVertical: 4, borderRight: `1 solid #bbbbc8` }}> </Text>
                                        <Text style={{ flex: 0.8, fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "right", paddingVertical: 4, paddingRight: 2, borderRight: `1 solid #bbbbc8` }}>{totalQty.toFixed(3)}</Text>
                                        <Text style={{ flex: 0.8, fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "right", paddingVertical: 4, paddingRight: 2, borderRight: `1 solid #bbbbc8` }}>{totalDozen.toFixed(2)}</Text>
                                        <Text style={{ flex: 1, fontSize: 8, color: "transparent", paddingVertical: 4, borderRight: `1 solid #bbbbc8` }}> </Text>
                                        {!isExport && (
                                            <>
                                                <Text style={{ flex: 0.7, fontSize: 8, color: "transparent", paddingVertical: 4, borderRight: `1 solid #bbbbc8` }}> </Text>
                                            </>
                                        )}
                                        <Text style={{ flex: 1.2, fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "right", paddingVertical: 4, paddingRight: 2, borderRight: !isExport ? `1 solid #bbbbc8` : "none" }}>
                                            {currencySymbol} {totalGross.toFixed(2)}
                                        </Text>

                                    </View>

                                    {!isExport && taxSlabBreakup.length > 0 && (
                                        <View style={styles.taxBox}>
                                            <Text style={styles.taxHeader}>TAX DETAILS</Text>
                                            <View style={styles.taxRow}>
                                                <Text style={styles.taxLabel}>Taxable Amt</Text>
                                                <Text style={styles.taxValue}>{taxableTotal.toFixed(2)}</Text>
                                            </View>
                                            {taxSlabBreakup.map((slab) => (
                                                <View key={slab.tax} style={styles.taxRow}>
                                                    <Text style={styles.taxLabel}>{slab.tax}</Text>
                                                    <Text style={styles.taxValue}>
                                                        {parseFloat(slab.amount || 0).toFixed(2)}
                                                    </Text>
                                                </View>
                                            ))}
                                            <View style={styles.taxRowNet}>
                                                <Text style={styles.taxLabelNet}>Net Amount</Text>
                                                <Text style={styles.taxValueNet}>{netAmount.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* ── EXPORT: CARRIAGE + GRAND TOTAL ── */}
                                    {/* ── BANK + SUMMARY ── */}
                                    <View style={styles.bankSummaryRow}>
                                        {isExport && bank?.name ? (
                                            <View style={styles.bankBox}>
                                                <Text style={styles.sectionHeader}>ADVISING BANK</Text>
                                                <View style={styles.sectionBody}>
                                                    <Text style={styles.partyName}>{bank.name}</Text>
                                                    {bank?.Branch?.name && (
                                                        <Text style={{ fontSize: 7.5, color: "#555", marginBottom: 2 }}>Branch: {bank.Branch.name}</Text>
                                                    )}
                                                    {[
                                                        { label: "A/c No", value: bank.accNo },
                                                        { label: "IFSC", value: bank.ifsc },
                                                        { label: "Swift Code", value: bank.swiftCode },
                                                    ].map(({ label, value }) => value ? (
                                                        <View key={label} style={styles.partyRow}>
                                                            <Text style={styles.partyLabel}>{label}</Text>
                                                            <Text style={styles.partyValue}>: {value}</Text>
                                                        </View>
                                                    ) : null)}
                                                </View>
                                            </View>
                                        ) : (
                                            <View style={{ flex: 1 }} />
                                        )}

                                        {/* Summary box */}
                                        {
                                            isExport && (
                                                <View style={styles.summaryBox}>
                                                    <Text style={styles.sectionHeader}>SUMMARY</Text>

                                                    <View style={styles.summaryRow}>
                                                        <Text style={styles.summaryLabel}>Gross Amount</Text>
                                                        <Text style={styles.summaryValue}>{currencySymbol} {totalGross.toFixed(2)}</Text>
                                                    </View>
                                                    {isExport && carriageCharge > 0 && (
                                                        <View style={styles.summaryRow}>
                                                            <Text style={styles.summaryLabel}>Carriage & Air Freight</Text>
                                                            <Text style={styles.summaryValue}>{currencySymbol} {carriageCharge.toFixed(2)}</Text>
                                                        </View>
                                                    )}
                                                    <View style={[styles.summaryRow, { backgroundColor: DARK, borderBottom: "none", borderRadius: 2 }]}>
                                                        <Text style={[styles.summaryLabel, { color: "#ccc", fontFamily: "Helvetica-Bold" }]}>
                                                            {isExport ? "Grand Total" : "Net Amount"}
                                                        </Text>
                                                        <Text style={[styles.summaryValue, { color: "#fff" }]}>
                                                            {currencySymbol} {isExport ? grandTotal.toFixed(2) : netAmount.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )
                                        }

                                    </View>

                                    {/* ── REMARKS & TERMS ── */}
                                    <View style={styles.bottomSection}>
                                        <View style={styles.remarksBox}>
                                            <Text style={styles.sectionHeader}>REMARKS</Text>
                                            <View style={styles.sectionBody}>
                                                <Text style={{ fontSize: 7.5, color: "#555" }}>{data?.remarks || "N/A"}</Text>
                                            </View>
                                        </View>
                                        {data?.termsAndCondition ? (
                                            <View style={styles.termsBox}>
                                                <Text style={styles.sectionHeader}>TERMS &amp; CONDITIONS</Text>
                                                <View style={styles.sectionBody}>
                                                    <Text style={{ fontSize: 7.5, color: "#555", lineHeight: 1.5 }}>{data.termsAndCondition}</Text>
                                                </View>
                                            </View>
                                        ) : null}
                                    </View>

                                    {/* ── SIGNATURES ── */}
                                    <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 8 }}>
                                        <Text style={{ textAlign: "right", fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 20 }}>
                                            For {branch?.branchName || ""}
                                        </Text>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${BORDER_LIGHT}`, paddingTop: 4 }}>
                                            {["Prepared By", "Checked By", "Approved By", "Customer Sign"].map((role) => (
                                                <Text key={role} style={{ flex: 1, textAlign: "center", fontSize: 7.5, color: "#555", fontFamily: "Helvetica-Bold" }}>
                                                    {role}
                                                </Text>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}

                            {/* ── SUB-TOTAL (non-last pages) ── */}
                            {!isLastPage && (
                                <View style={{ flexDirection: "row", marginHorizontal: 20, backgroundColor: "#f4f4f6", borderLeft: `1 solid ${BORDER}`, borderRight: `1 solid ${BORDER}`, borderBottom: `1 solid ${BORDER}` }}>
                                    <Text style={{ flex: 5, fontSize: 7.5, color: "#888", fontStyle: "italic", textAlign: "right", paddingVertical: 4, paddingRight: 8 }}>
                                        Sub Total (Continued on next page...)
                                    </Text>
                                    <Text style={{ flex: 1.2, fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "right", paddingVertical: 4, paddingRight: 3 }}>
                                        {currencySymbol} {chunkRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0).toFixed(2)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* FOOTER BAR */}
                        <View style={styles.footerBar} fixed>
                            <Text style={styles.footerRight} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                        </View>
                    </Page>
                );
            })}
        </Document>
    );
};

export default ProformaInvoicePrintFormat;