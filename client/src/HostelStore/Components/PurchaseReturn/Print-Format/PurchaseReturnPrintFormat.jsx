import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
} from "@react-pdf/renderer";
import Logo from "../../../../../src/assets/mplogo.png";
import { findFromList, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────
// Primary Dark  : #1a1a2e   (deep charcoal navy)
// Secondary Dark: #2d2d44   (slate)
// Accent Light  : #f4f4f6   (near-white surface)
// Border        : #ddd / #c8c8d0 / #b0b0b8
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    borderBox: { border: "1 solid #ccc", margin: 0, padding: 0 },
    page: { fontFamily: "Helvetica", fontSize: 8, padding: 0, backgroundColor: "#fff" },

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
    companyCenter: { alignItems: "center" },
    companyName: { fontSize: 18, fontWeight: "bold", color: "#1a1a2e", letterSpacing: 0.5 },
    companyRight: { width: 140, alignItems: "flex-start" },
    companyRightRow: { flexDirection: "row", marginBottom: 2, width: "100%" },
    companyLabel: { fontSize: 7.5, color: "#888", width: 38 },
    companyColon: { fontSize: 7.5, color: "#888", width: 8 },
    companyValue: { fontSize: 7.5, color: "#1a1a2e", fontWeight: "bold", flex: 1 },

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

    // ── REMARKS & TERMS ──
    wordsBar: {
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: "#2d2d44",
        borderRadius: 3,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    remarksRow: {
        flexDirection: "row",
        marginHorizontal: 20,
        border: "1 solid #ddd",
        borderTop: "none",
        borderRadius: 3,
        minHeight: 52,
        overflow: "hidden",
    },
    remarksCol: { flex: 0.5, padding: 8, borderRight: "1 solid #ddd", backgroundColor: "#f8f8f9" },
    termsCol: { flex: 0.5, padding: 8 },
    rTitle: { fontSize: 7.5, fontWeight: "bold", color: "#1a1a2e", marginBottom: 3, letterSpacing: 0.5 },
    rText: { fontSize: 7.5, color: "#555", lineHeight: 1.5 },

    // ── SIGNATURES ──
    sigArea: { marginHorizontal: 20, marginTop: 14, marginBottom: 8 },
    sigCompany: { textAlign: "right", fontSize: 8, fontWeight: "bold", color: "#1a1a2e", marginBottom: 18 },
    sigRow: { flexDirection: "row", justifyContent: "space-between", borderTop: "1 solid #ddd", paddingTop: 4 },
    sigItem: { flex: 1, textAlign: "center", fontSize: 7.5, color: "#555", fontWeight: "bold" },

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
});

// ── COLUMNS ───────────────────────────────────────────────────────────────────
const COLUMNS = [
    { label: "S.No", flex: 0.5 },
    { label: "Description", flex: 3.5 },
    { label: "Size", flex: 1.2 },
    { label: "Color", flex: 1.2 },
    { label: "UOM", flex: 1 },
    { label: "PO Qty", flex: 1 },
    { label: "Inward Qty", flex: 1 },
    { label: "Already\nRet. Qty", flex: 1.2 },
    { label: "Balance Qty", flex: 1 },
    { label: "Return Qty", flex: 1 },
];

const ROWS_PAGE_1 = 18;
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
            PURCHASE RETURN — Continued
        </Text>
        <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>
            Return No: {docId}  |  {branchName}
        </Text>
    </View>
);

const FooterBar = () => (
    <View style={styles.footerBar}>
        <Text style={styles.footerLeft}>This is a computer-generated document.</Text>
        <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
        />
    </View>
);

// ── COMPONENT ─────────────────────────────────────────────────────────────────
const PurchaseReturnPrintFormat = ({
    singleData,
    supplierList,
    styleItemList,
    uomList,
    sizeList,
    colorList,
    branchData,
}) => {
    if (!singleData) return null;

    const docId = singleData?.docId || "";
    const docDate = singleData?.docDate || "";
    const dcNo = singleData?.dcNo || "";
    const dcDate = singleData?.dcDate || "";
    const remarks = singleData?.remarks || "";
    const termsAndCondition = singleData?.termsAndCondition || "";

    const supplierDetails =
        singleData?.Supplier ||
        supplierList?.data?.find((s) => parseInt(s.id) === parseInt(singleData?.supplierId)) ||
        {};

    const returnItems = (singleData?.purchaseReturnItems || []).filter(
        (item) => item.styleItemId || item.StyleItem?.id
    );

    // ── Grand totals ──
    const totalPoQty = returnItems.reduce((s, r) => s + (parseFloat(r.poQty) || 0), 0);
    const totalInwardQty = returnItems.reduce((s, r) => s + (parseFloat(r.inwardQty) || 0), 0);
    const totalAlreadyReturnQty = returnItems.reduce((s, r) => s + (parseFloat(r.alreadyReturnQty) || 0), 0);
    const totalBalQty = returnItems.reduce((s, r) => s + (parseFloat(r.balQty) || 0), 0);
    const totalReturnQty = returnItems.reduce((s, r) => s + (parseFloat(r.returnQty) || 0), 0);

    // ── Pagination ──
    const pageChunks = chunkItems(returnItems);
    const totalPg = pageChunks.length;
    const pageOffsets = pageChunks.reduce((acc, chunk, i) => {
        acc.push(i === 0 ? 0 : acc[i - 1] + pageChunks[i - 1].length);
        return acc;
    }, []);

    return (
        <Document>
            {pageChunks.map((chunkRows, pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === totalPg - 1;
                const globalOffset = pageOffsets[pageIndex];
                const minRows = isFirstPage ? ROWS_PAGE_1 : ROWS_PAGE_CONT;
                const emptyCount = Math.max(0, minRows - chunkRows.length);

                // page sub-totals
                const pgReturnQty = chunkRows.reduce((s, r) => s + (parseFloat(r.returnQty) || 0), 0);

                return (
                    <Page key={pageIndex} size="A4" style={styles.borderBox}>
                        <View style={styles.page}>

                            {/* TOP ACCENT BAR */}
                            <View style={styles.topBar} />

                            {isFirstPage ? (
                                <>
                                    {/* ── FULL HEADER ── */}
                                    <View style={styles.header}>
                                        <Image src={Logo} style={styles.logo} />
                                        <View style={styles.companyCenter}>
                                            <Text style={styles.companyName}>{branchData?.branchName || ""}</Text>
                                        </View>
                                        <View style={styles.companyRight}>
                                            <Text style={{ fontSize: 7.5, color: "#555", marginBottom: 2, textAlign: "right" }}>
                                                {branchData?.address || ""}
                                            </Text>
                                            {[
                                                { label: "Mobile", value: branchData?.contactMobile },
                                                { label: "GST No", value: branchData?.gstNo },
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

                                    {/* TITLE BAND */}
                                    <Text style={styles.titleBand}>PURCHASE RETURN</Text>

                                    {/* META PILLS */}
                                    <View style={styles.metaRow}>
                                        {[
                                            { label: "Return No", value: docId },
                                            { label: "Return Date", value: getDateFromDateTimeToDisplay(docDate) },
                                            { label: "DC No", value: dcNo },
                                            { label: "DC Date", value: dcDate ? getDateFromDateTimeToDisplay(dcDate) : "" },
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
                                                <Text style={styles.partyName}>{branchData?.branchName || ""}</Text>
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
                                            <Text style={styles.sectionHeader}>TO</Text>
                                            <View style={styles.sectionBody}>
                                                <Text style={styles.partyName}>{supplierDetails?.name || ""}</Text>
                                                <Text style={styles.partyAddr}>{supplierDetails?.address || ""}</Text>
                                                {[
                                                    { label: "Mobile No", value: supplierDetails?.contactPersonNumber },
                                                    { label: "GST No", value: supplierDetails?.gstNo },
                                                    { label: "Email", value: supplierDetails?.email },
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
                                <ContinuationBar docId={docId} branchName={branchData?.branchName || ""} />
                            )}

                            {/* ── TABLE ── */}
                            <View style={styles.tableWrap}>
                                <TableHeader />

                                {/* Item rows */}
                                {chunkRows.map((row, index) => {
                                    const rowStyle = index % 2 === 0 ? styles.trOdd : styles.trEven;
                                    return (
                                        <View key={globalOffset + index} style={rowStyle}>
                                            <Text style={[styles.td, { flex: 0.5 }]}>{globalOffset + index + 1}</Text>
                                            <Text style={[styles.td, { flex: 3.5, textAlign: "left" }]}>
                                                {row?.StyleItem?.name || findFromList(row.styleItemId, styleItemList?.data, "name")}
                                            </Text>
                                            <Text style={[styles.td, { flex: 1.2, textAlign: "left" }]}>
                                                {row?.Size?.name || findFromList(row.sizeId, sizeList?.data, "name")}
                                            </Text>
                                            <Text style={[styles.td, { flex: 1.2, textAlign: "left" }]}>
                                                {row?.Color?.name || findFromList(row.colorId, colorList?.data, "name")}
                                            </Text>
                                            <Text style={[styles.td, { flex: 1, textAlign: "left" }]}>
                                                {row?.Uom?.name || findFromList(row.uomId, uomList?.data, "name")}
                                            </Text>
                                            <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                                                {row?.poQty ? parseFloat(row.poQty).toFixed(2) : ""}
                                            </Text>
                                            <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                                                {row?.inwardQty ? parseFloat(row.inwardQty).toFixed(2) : ""}
                                            </Text>
                                            <Text style={[styles.td, { flex: 1.2, textAlign: "right" }]}>
                                                {row?.alreadyReturnQty ? parseFloat(row.alreadyReturnQty).toFixed(2) : ""}
                                            </Text>
                                            <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                                                {row?.balQty ? parseFloat(row.balQty).toFixed(2) : ""}
                                            </Text>
                                            <Text style={[styles.td, { flex: 1, textAlign: "right", borderRight: "none" }]}>
                                                {row?.returnQty ? parseFloat(row.returnQty).toFixed(2) : ""}
                                            </Text>
                                        </View>
                                    );
                                })}

                                {/* Empty filler rows */}
                                {Array.from({ length: emptyCount }).map((_, i) => {
                                    const rowStyle = (chunkRows.length + i) % 2 === 0 ? styles.trOdd : styles.trEven;
                                    return (
                                        <View key={`empty-${i}`} style={rowStyle}>
                                            <Text style={[styles.td, { flex: 0.5, color: "transparent" }]}> </Text>
                                            <Text style={[styles.td, { flex: 3.5 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1.2 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1.2 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1.2 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1 }]}> </Text>
                                            <Text style={[styles.td, { flex: 1, borderRight: "none" }]}> </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* ── GRAND TOTAL FOOTER — last page only ── */}
                            {isLastPage && (
                                <View style={{
                                    flexDirection: "row",
                                    marginHorizontal: 20,
                                    backgroundColor: "#e8e8ec",
                                    borderLeft: "1 solid #b0b0b8",
                                    borderRight: "1 solid #b0b0b8",
                                    borderBottom: "1 solid #b0b0b8",
                                }}>
                                    <Text style={{ flex: 0.5, fontSize: 8, paddingVertical: 5, paddingHorizontal: 2, borderRight: "1 solid #bbbbc8", color: "#555", fontWeight: "bold", textAlign: "center" }}>
                                        {/* {returnItems.length} */}
                                    </Text>
                                    <Text style={{ flex: 3.2, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", paddingVertical: 5, paddingRight: 3, borderRight: "1 solid #bbbbc8", textAlign: "right", }}>
                                        TOTAL
                                    </Text>
                                    <Text style={{ flex: 1.2, fontSize: 8, color: "transparent", paddingVertical: 5, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 1.2, fontSize: 8, color: "transparent", paddingVertical: 5, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 1, fontSize: 8, color: "transparent", paddingVertical: 5, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 1, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", textAlign: "right", paddingVertical: 5, paddingRight: 3, borderRight: "1 solid #bbbbc8" }}>
                                        {totalPoQty.toFixed(2)}
                                    </Text>
                                    <Text style={{ flex: 1, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", textAlign: "right", paddingVertical: 5, paddingRight: 3, borderRight: "1 solid #bbbbc8" }}>
                                        {totalInwardQty.toFixed(2)}
                                    </Text>
                                    <Text style={{ flex: 1.1, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", textAlign: "right", paddingVertical: 5, paddingRight: 3, borderRight: "1 solid #bbbbc8" }}>
                                        {totalAlreadyReturnQty.toFixed(2)}
                                    </Text>
                                    <Text style={{ flex: 1, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", textAlign: "right", paddingVertical: 5, paddingRight: 3, borderRight: "1 solid #bbbbc8" }}>
                                        {totalBalQty.toFixed(2)}
                                    </Text>
                                    <Text style={{ flex: 0.9, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", textAlign: "right", paddingVertical: 5, paddingRight: 3 }}>
                                        {totalReturnQty.toFixed(2)}
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
                                    <Text style={{ flex: 0.5, fontSize: 8, color: "transparent", paddingVertical: 4, paddingHorizontal: 3, borderRight: "1 solid #bbbbc8" }}> </Text>
                                    <Text style={{ flex: 10.3, fontSize: 7.5, color: "#888", fontStyle: "italic", textAlign: "right", paddingVertical: 4, paddingRight: 8, borderRight: "1 solid #bbbbc8" }}>
                                        Sub Total (Continued on next page...)
                                    </Text>
                                    <Text style={{ flex: 1, fontSize: 8, fontWeight: "bold", color: "#1a1a2e", textAlign: "right", paddingVertical: 4, paddingRight: 3 }}>
                                        {pgReturnQty.toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            {/* ── REMARKS & TERMS — last page only ── */}
                            {isLastPage && (
                                <>
                                    {/* ADDITIONAL INFO HEADER */}
                                    <View style={styles.wordsBar}>
                                        <Text style={{ fontSize: 8, fontWeight: "bold", color: "#fff", letterSpacing: 0.5 }}>
                                            Additional Information
                                        </Text>
                                    </View>

                                    <View style={styles.remarksRow}>
                                        <View style={styles.remarksCol}>
                                            <Text style={styles.rTitle}>REMARKS</Text>
                                            <Text style={styles.rText}>{remarks}</Text>
                                        </View>
                                        <View style={styles.termsCol}>
                                            <Text style={styles.rTitle}>TERMS &amp; CONDITIONS</Text>
                                            <Text style={styles.rText}>{termsAndCondition}</Text>
                                        </View>
                                    </View>

                                    {/* SIGNATURES */}
                                    <View style={styles.sigArea}>
                                        <Text style={styles.sigCompany}>For {branchData?.branchName || ""}</Text>
                                        <View style={styles.sigRow}>
                                            {["Prepared By", "Verified By", "Received By", "Approved By"].map((role) => (
                                                <Text key={role} style={styles.sigItem}>{role}</Text>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}

                            {/* FOOTER BAR — all pages */}
                            <FooterBar />

                        </View>
                    </Page>
                );
            })}
        </Document>
    );
};

export default PurchaseReturnPrintFormat;