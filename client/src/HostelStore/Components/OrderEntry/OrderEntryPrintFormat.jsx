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
const styles = StyleSheet.create({
    borderBox: { border: "1 solid #ccc", margin: 0, padding: 0 },
    page: { fontFamily: "Helvetica", fontSize: 8, padding: 0, paddingBottom: 60, backgroundColor: "#fff" },

    // ── TOP ACCENT BAR ──
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
    companyLeft: { width: 140, alignItems: "flex-start" },
    companyCenter: { alignItems: "center", flex: 1 },
    companyName: { fontSize: 18, fontWeight: "bold", color: "#1a1a2e", letterSpacing: 0.5 },
    companyRight: { width: 140, alignItems: "flex-start" },
    companyRightRow: { flexDirection: "row", marginBottom: 2, width: "100%" },
    companyLabel: { fontSize: 7.5, color: "#888", width: 38 },
    companyColon: { fontSize: 7.5, color: "#888", width: 8 },
    companyValue: { fontSize: 7.5, color: "#1a1a2e", fontWeight: "bold", flex: 1 },

    titleBand: {
        backgroundColor: "#1a1a2e",
        color: "#fff",
        textAlign: "center",
        fontSize: 13,
        fontWeight: "bold",
        letterSpacing: 3,
        paddingVertical: 6,
        marginBottom: 10,
    },

    // ── META PILLS ──
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
    metaLabel: { fontSize: 7.5, color: "#888", marginRight: 3 },
    metaValue: { fontSize: 7.5, fontWeight: "bold", color: "#1a1a2e" },

    // ── FROM / TO SECTION ──
    twoCol: {
        flexDirection: "row",
        marginHorizontal: 20,
        marginBottom: 10,
        border: "1 solid #ddd",
        borderRadius: 3,
    },
    colHalf: { flex: 1 },
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
    partyName: { fontSize: 9, fontWeight: "bold", color: "#1a1a2e", marginBottom: 3 },
    partyAddr: { fontSize: 7.5, color: "#555", textTransform: "uppercase", marginBottom: 4, lineHeight: 1.5 },
    partyRow: { flexDirection: "row", marginBottom: 1.5 },
    partyLabel: { fontSize: 7.5, color: "#888", width: 58 },
    partyValue: { fontSize: 7.5, color: "#222", fontWeight: "bold" },

    // ── ORDER DETAILS BOX ──
    detailsGrid: {
        marginHorizontal: 20,
        marginBottom: 10,
        border: "1 solid #ddd",
        borderRadius: 3,
        flexDirection: "row",
        backgroundColor: "#fafafa"
    },
    detailsCol: { flex: 1, padding: 8, borderRight: "1 solid #ddd" },
    detailsItem: { flexDirection: "row", marginBottom: 4 },
    detailsLabel: { fontSize: 7.5, color: "#888", width: 80 },
    detailsValue: { fontSize: 7.5, color: "#1a1a2e", fontWeight: "bold" },

    // ── TABLE ──
    tableWrap: { marginHorizontal: 20, border: "1 solid #b0b0b8" },
    tableHeader: { flexDirection: "row", backgroundColor: "#1a1a2e" },
    th: {
        fontSize: 7.5,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        borderRight: "1 solid #4a4a60",
        paddingVertical: 5,
        paddingHorizontal: 3,
    },
    trOdd: { flexDirection: "row", borderBottom: "1 solid #c8c8d0", backgroundColor: "#fff" },
    trEven: { flexDirection: "row", borderBottom: "1 solid #c8c8d0", backgroundColor: "#fafafa" },
    td: {
        fontSize: 7.5,
        color: "#333",
        textAlign: "center",
        borderRight: "1 solid #c8c8d0",
        paddingVertical: 4,
        paddingHorizontal: 3,
    },

    // ── REQUIREMENTS SECTION ──
    requirementsBox: {
        marginHorizontal: 20,
        marginBottom: 10,
        border: "1 solid #ddd",
        borderRadius: 3,
    },
    requirementsBody: {
        padding: 10,
        fontSize: 8,
        lineHeight: 1.5,
        color: "#333",
        minHeight: 40,
    },

    // ── FOOTER BAR ──
    footerBar: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
    },
    footerRight: { fontSize: 8, color: "#1a1a2e", fontWeight: "bold" },
});

// ── TABLE COLUMNS ─────────────────────────────────────────────────────────────
const COLUMNS = [
    { label: "S.No", flex: 0.4 },
    { label: "Description of Goods", flex: 2.5 },
    { label: "Item Group", flex: 1.2 },
    { label: "HSN", flex: 0.8 },
    { label: "Type", flex: 1.2 },
    { label: "UOM", flex: 0.7 },
    { label: "Order Qty", flex: 0.9 },
];

const ROWS_PAGE_1 = 15;
const ROWS_PAGE_CONT = 22;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const chunkItems = (items) => {
    const pages = [];
    let rem = [...items];
    pages.push(rem.splice(0, ROWS_PAGE_1));
    while (rem.length > 0) pages.push(rem.splice(0, ROWS_PAGE_CONT));
    return pages;
};

const TableHeader = () => (
    <View style={styles.tableHeader}>
        {COLUMNS.map(({ label, flex }, i) => (
            <Text
                key={label}
                style={[styles.th, { flex }, i === COLUMNS.length - 1 && { borderRight: "none" }]}
            >
                {label}
            </Text>
        ))}
    </View>
);

const ContinuationBar = ({ docId, branchName }) => (
    <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1a1a2e",
        paddingHorizontal: 20,
        paddingVertical: 6,
    }}>
        <Text style={{ fontSize: 9, fontWeight: "bold", color: "#fff", letterSpacing: 2 }}>
            ORDER ENTRY — Continued
        </Text>
        <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>
            Order No: {docId}  |  {branchName}
        </Text>
    </View>
);

// ── COMPONENT ─────────────────────────────────────────────────────────────────
const OrderEntryPrintFormat = ({ data, customerDetails, branchData, qrCodeDataUrl, styleItemList, sizeList, uomList, itemGroupList, hsnList }) => {
    if (!data) return null;

    const orderItems = (data?.orderItems || []).filter(item => item.styleItemId);

    // ── Grand total ──
    const totalOrderQty = orderItems.reduce((s, r) => s + (parseFloat(r.orderQty) || 0), 0);

    // ── Pagination ──
    const pageChunks = chunkItems(orderItems);
    const pageOffsets = pageChunks.reduce((acc, chunk, i) => {
        acc.push(i === 0 ? 0 : acc[i - 1] + pageChunks[i - 1].length);
        return acc;
    }, []);

    // If no items, render a single empty page
    const renderChunks = pageChunks.length === 0 ? [[]] : pageChunks;

    // ── Helper: build size breakup label lines ──
    const getSizeBreakupText = (row) => {
        const breakup = row.sizeBreakup?.filter((sb) => (Number(sb.qty) || 0) > 0);
        if (!breakup || breakup.length === 0) return null;

        return breakup.map((sb) => {
            const size = findFromList(sb.sizeId, sizeList?.data, "name");
            const qty = Number(sb.qty);


            return `${size || "All"}: ${qty}`;

        }).filter(Boolean).join("  |  ");
    };

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
                                    {/* ── FULL HEADER ── */}
                                    <View style={styles.header}>
                                        <View style={styles.companyLeft}>
                                            <Image src={Logo} style={styles.logo} />
                                        </View>
                                        <View style={styles.companyCenter}>
                                            <Text style={styles.companyName}>{branchData?.branchName || "MUTHU PRINTERS"}</Text>
                                        </View>
                                        <View style={styles.companyRight}>
                                            {qrCodeDataUrl && (
                                                <View style={{ border: "none", width: 60, height: 60, marginTop: 5, alignSelf: "flex-end", alignItems: "center", justifyContent: "center" }}>
                                                    <Image src={qrCodeDataUrl} style={{ width: 50, height: 50 }} />
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* TITLE BAND */}
                                    <Text style={styles.titleBand}>ORDER ENTRY</Text>

                                    {/* META PILLS */}
                                    <View style={styles.metaRow}>
                                        {[
                                            { label: "Order No", value: data?.docId },
                                            { label: "Order Date", value: moment(data?.docDate).format("DD-MM-YYYY") },
                                            { label: "Order Type", value: data?.orderType },
                                            { label: "Production Type", value: data?.productionType },

                                            { label: "Delivery Date", value: moment(data?.deliveryDate).format("DD-MM-YYYY") },
                                        ].map(({ label, value }) => (
                                            <View key={label} style={styles.metaPill}>
                                                <Text style={styles.metaLabel}>{label}:</Text>
                                                <Text style={styles.metaValue}>{value}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* FROM / TO */}
                                    <View style={styles.twoCol}>
                                        {/* FROM */}
                                        <View style={[styles.colHalf, { borderRight: "1 solid #ddd" }]}>
                                            <Text style={styles.sectionHeader}>FROM</Text>
                                            <View style={styles.sectionBody}>
                                                <Text style={styles.partyName}>{branchData?.branchName || "MUTHU PRINTERS"}</Text>
                                                <Text style={styles.partyAddr}>{branchData?.address || ""}</Text>
                                                {[
                                                    { label: "Mobile No", value: branchData?.contactMobile },
                                                    { label: "GST No", value: branchData?.gstNo },
                                                    { label: "Email", value: branchData?.contactEmail },
                                                ].map(({ label, value }) =>
                                                    value ? (
                                                        <View key={label} style={styles.partyRow}>
                                                            <Text style={styles.partyLabel}>{label}</Text>
                                                            <Text style={styles.partyValue}>: {value}</Text>
                                                        </View>
                                                    ) : null
                                                )}
                                            </View>
                                        </View>
                                        {/* TO */}
                                        <View style={styles.colHalf}>
                                            <Text style={styles.sectionHeader}>CUSTOMER DETAILS</Text>
                                            <View style={styles.sectionBody}>
                                                <Text style={styles.partyName}>{customerDetails?.name || "N/A"}</Text>
                                                <Text style={styles.partyAddr}>{customerDetails?.address || ""}</Text>
                                                {[
                                                    { label: "Contact Person", value: customerDetails?.contactPersonName },
                                                    { label: "Mobile No", value: customerDetails?.contactNumber },
                                                    { label: "GST No", value: customerDetails?.gstNo },
                                                ].map(({ label, value }) =>
                                                    value ? (
                                                        <View key={label} style={styles.partyRow}>
                                                            <Text style={styles.partyLabel}>{label}</Text>
                                                            <Text style={styles.partyValue}>: {value}</Text>
                                                        </View>
                                                    ) : null
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <ContinuationBar docId={data?.docId} branchName={branchData?.branchName || ""} />
                            )}

                            {/* ── TABLE ── */}
                            <View style={styles.tableWrap}>
                                <TableHeader />

                                {/* Item rows */}
                                {chunkRows.map((row, index) => {
                                    const rowStyle = index % 2 === 0 ? styles.trOdd : styles.trEven;
                                    const breakupText = getSizeBreakupText(row);
                                    return (
                                        <View key={globalOffset + index} style={rowStyle} wrap={false}>
                                            {/* S.No */}
                                            <Text style={[styles.td, { flex: 0.4 }]}>
                                                {globalOffset + index + 1}
                                            </Text>

                                            {/* Description + size breakup inline */}
                                            <View style={[styles.td, { flex: 2.5, textAlign: "left", justifyContent: "center" }]}>
                                                <Text style={{ fontSize: 7.5, fontWeight: "bold", color: "#1a1a2e" }}>
                                                    {row?.StyleItem?.name || findFromList(row.styleItemId, styleItemList?.data, "name")}
                                                </Text>
                                                {breakupText ? (
                                                    <Text style={{ fontSize: 6.5, color: "#555", marginTop: 2 }}>
                                                        {breakupText}
                                                    </Text>
                                                ) : null}
                                            </View>

                                            {/* Item Group */}
                                            <Text style={[styles.td, { flex: 1.2, textAlign: "left" }]}>
                                                {row?.ItemGroup?.name || findFromList(row.itemGroupId, itemGroupList?.data, "name")}
                                            </Text>

                                            {/* HSN */}
                                            <Text style={[styles.td, { flex: 0.8 }]}>
                                                {row?.Hsn?.name || findFromList(row.hsnId, hsnList?.data, "name")}
                                            </Text>

                                            {/* Type */}
                                            <Text style={[styles.td, { flex: 1.2 }]}>
                                                {row?.trackingType || "None"}
                                            </Text>

                                            {/* UOM */}
                                            <Text style={[styles.td, { flex: 0.7 }]}>
                                                {row?.Uom?.name || findFromList(row.uomId, uomList?.data, "name")}
                                            </Text>

                                            {/* Order Qty */}
                                            <Text style={[styles.td, { flex: 0.9, textAlign: "right", borderRight: "none" }]}>
                                                {row?.orderQty ? parseFloat(row.orderQty).toFixed(2) : ""}
                                            </Text>
                                        </View>
                                    );
                                })}

                                {/* Empty filler rows */}
                                {Array.from({ length: emptyCount }).map((_, i) => {
                                    const rowStyle = (chunkRows.length + i) % 2 === 0 ? styles.trOdd : styles.trEven;
                                    return (
                                        <View key={`empty-${i}`} style={rowStyle}>
                                            <Text style={[styles.td, { flex: 0.4, color: "transparent" }]}> </Text>
                                            <Text style={[styles.td, { flex: 2.5 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1.2 }]}> </Text>
                                            <Text style={[styles.td, { flex: 0.8 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1.2 }]}> </Text>
                                            <Text style={[styles.td, { flex: 0.7 }]}> </Text>
                                            <Text style={[styles.td, { flex: 0.9, borderRight: "none" }]}> </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* ── GRAND TOTAL — last page only ── */}
                            {isLastPage && (
                                <View style={{
                                    flexDirection: "row",
                                    marginHorizontal: 20,
                                    backgroundColor: "#e8e8ec",
                                    borderLeft: "1 solid #b0b0b8",
                                    borderRight: "1 solid #b0b0b8",
                                    borderBottom: "1 solid #b0b0b8",
                                }}>
                                    <Text style={{ flex: 0.4, fontSize: 8, paddingVertical: 5, paddingHorizontal: 2, borderRight: "1 solid #bbbbc8", color: "transparent" }}> </Text>
                                    <Text style={{ flex: 2.4, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", paddingVertical: 5, paddingRight: 1, borderRight: "1 solid #bbbbc8", textAlign: "right" }}>
                                        TOTAL
                                    </Text>
                                    <Text style={{ flex: 1.2, fontSize: 8, color: "transparent", paddingVertical: 5, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 0.8, fontSize: 8, color: "transparent", paddingVertical: 5, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 1.2, fontSize: 8, color: "transparent", paddingVertical: 5, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 0.7, fontSize: 8, color: "transparent", paddingVertical: 5, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 0.9, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", textAlign: "right", paddingVertical: 5, paddingRight: 3 }}>
                                        {totalOrderQty.toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            {/* ── SUB TOTAL — non-last pages ── */}
                            {!isLastPage && (
                                <View style={{
                                    flexDirection: "row",
                                    marginHorizontal: 20,
                                    backgroundColor: "#f4f4f6",
                                    borderLeft: "1 solid #b0b0b8",
                                    borderRight: "1 solid #b0b0b8",
                                    borderBottom: "1 solid #b0b0b8",
                                }}>
                                    <Text style={{ flex: 0.4, fontSize: 8, color: "transparent", paddingVertical: 4, paddingHorizontal: 3, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 5.9, fontSize: 7.5, color: "#888", fontStyle: "italic", textAlign: "right", paddingVertical: 4, paddingRight: 8, borderRight: "1 solid #bbbbc8" }}>
                                        Sub Total (Continued on next page...)
                                    </Text>
                                    <Text style={{ flex: 0.9, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", textAlign: "right", paddingVertical: 4, paddingRight: 3 }}>
                                        {chunkRows.reduce((s, r) => s + (parseFloat(r.orderQty) || 0), 0).toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            {/* ── REQUIREMENTS, REMARKS & TERMS — last page only ── */}
                            {isLastPage && (
                                <>
                                    {/* CUSTOMER REQUIREMENTS */}
                                    <View style={[styles.requirementsBox, { marginTop: 10 }]}>
                                        <View style={{ backgroundColor: "#2d2d44", paddingHorizontal: 10, paddingVertical: 5 }}>
                                            <Text style={{ color: "#e8e8f0", fontSize: 7.5, fontWeight: "bold" }}>CUSTOMER REQUIREMENTS</Text>
                                        </View>
                                        <View style={styles.requirementsBody}>
                                            <Text>{data?.requirements || "No specific requirements mentioned."}</Text>
                                        </View>
                                    </View>

                                    {/* REMARKS */}
                                    <View style={[styles.twoCol, { marginTop: 5 }]}>
                                        <View style={[styles.colHalf, { borderRight: "1 solid #ddd", backgroundColor: "#f8f8f9" }]}>
                                            <Text style={styles.sectionHeader}>REMARKS</Text>
                                            <View style={styles.sectionBody}>
                                                <Text style={{ fontSize: 7.5, color: "#555" }}>{data?.remarks || "N/A"}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* SIGNATURES */}
                                    <View style={{ marginHorizontal: 20, marginTop: 14, marginBottom: 8 }}>
                                        <Text style={{ textAlign: "right", fontSize: 8, fontWeight: "bold", color: "#1a1a2e", marginBottom: 18 }}>
                                            For {branchData?.branchName || ""}
                                        </Text>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", borderTop: "1 solid #ddd", paddingTop: 4 }}>
                                            {["Prepared By", "Checked By", "Approved By", "Customer Sign"].map((role) => (
                                                <Text key={role} style={{ flex: 1, textAlign: "center", fontSize: 7.5, color: "#555", fontWeight: "bold" }}>
                                                    {role}
                                                </Text>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}

                        </View>

                        {/* FOOTER BAR — all pages */}
                        <View style={styles.footerBar} fixed>
                            <Text
                                style={styles.footerRight}
                                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                            />
                        </View>
                    </Page>
                );
            })}
        </Document>
    );
};

export default OrderEntryPrintFormat;