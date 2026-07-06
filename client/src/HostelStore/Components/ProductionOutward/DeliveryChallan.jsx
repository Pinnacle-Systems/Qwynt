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

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 8,
        padding: 0,
        paddingBottom: 50,
        backgroundColor: "#fff",
    },
    companyLeft: { width: 140, alignItems: "flex-start" },

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
    companyCenter: { alignItems: "center", flex: 1 },
    companyName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a2e",
        letterSpacing: 0.5,
    },
    companyRight: { width: 140, alignItems: "flex-start" },
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

    // ── TWO COLUMN (FROM / TO) ──
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
    partyName: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#1a1a2e",
        marginBottom: 3,
    },
    partyAddr: {
        fontSize: 7.5,
        color: "#555",
        marginBottom: 4,
        lineHeight: 1.5,
    },
    partyRow: { flexDirection: "row", marginBottom: 2 },
    partyLabel: { fontSize: 7.5, color: "#888", width: 72 },
    partyValue: { fontSize: 7.5, color: "#222", fontWeight: "bold", flex: 1 },

    // ── JOB CARD INFO STRIP ──
    infoStrip: {
        flexDirection: "row",
        marginHorizontal: 20,
        marginBottom: 10,
        border: "1 solid #ddd",
        borderRadius: 3,
        backgroundColor: "#fafafa",
    },
    infoCell: {
        flex: 1,
        padding: 8,
        borderRight: "1 solid #ddd",
    },
    infoCellLast: { flex: 1, padding: 8 },
    infoLabel: {
        fontSize: 6.5,
        color: "#888",
        fontWeight: "bold",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginBottom: 2,
    },
    infoValue: { fontSize: 8, color: "#1a1a2e", fontWeight: "bold" },

    // ── PROCESS GRID TABLE ──
    sectionWrap: {
        marginLeft: 20,
        marginBottom: 10,
        // border: "1 solid #ddd",
        // borderRadius: 3,
        // overflow: "hidden",
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
    tableHeader: { flexDirection: "row", backgroundColor: "#1a1a2e", width: 240, },
    th: {
        fontSize: 7.5,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        borderRight: "1 solid #4a4a60",
        paddingVertical: 5,
        paddingHorizontal: 4,
    },
    trOdd: {
        flexDirection: "row",
        borderBottom: "1 solid #e8e8ec",
        backgroundColor: "#fff",
         width: 240, 
    },
    trEven: {
        flexDirection: "row",
        borderBottom: "1 solid #e8e8ec",
        backgroundColor: "#f6f6f9",
         width: 240, 
    },
    td: {
        fontSize: 7.5,
        color: "#333",
        textAlign: "center",
        borderRight: "1 solid #e0e0e8",
        paddingVertical: 5,
        paddingHorizontal: 4,
    },

    // ── SUMMARY ROW ──
    summaryRow: {
        flexDirection: "row",
        marginHorizontal: 20,
        backgroundColor: "#e8e8ec",
        borderLeft: "1 solid #b0b0b8",
        borderRight: "1 solid #b0b0b8",
        borderBottom: "1 solid #b0b0b8",
    },

    // ── REMARKS ──
    remarksBar: {
        marginHorizontal: 20,
        marginBottom: 10,
        border: "1 solid #ddd",
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 300,
    },
    remarksBody: { padding: 8, minHeight: 28 },
    remarksText: { fontSize: 7.5, color: "#555", lineHeight: 1.5 },

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

    // ── FOOTER BAR ──
    footerBar: {
        backgroundColor: "#1a1a2e",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 4,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerLeft: { fontSize: 7, color: "rgba(255,255,255,0.5)" },
    footerRight: { fontSize: 7, color: "rgba(255,255,255,0.5)" },
});

// ─── PROCESS TABLE COLUMNS ────────────────────────────────────────────────────
const COLUMNS = [
    { label: "S.No", width: 40 },
    { label: "Process Name", width: 300 },
    // { label: "Sequence", flex: 0.8 },
    // { label: "Sent Qty", flex: 1.0 },
    // { label: "Received Qty",flex: 1.0 },
    // { label: "Pending Qty", flex: 1.0 },
    // { label: "Status",      flex: 1.2 },
];

const TableHeader = () => (
    <View style={styles.tableHeader}>
        {COLUMNS.map(({ label, width }, i) => (
            <Text
                key={label}
                style={[
                    styles.th,
                    { width },
                    i === COLUMNS.length - 1 && { borderRight: "none" },
                ]}
            >
                {label}
            </Text>
        ))}
    </View>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

/**
 * Props:
 *   singleData  — the full API response `data` object (see sample JSON)
 *   branchData  — branch/company info
 *   processList — { data: [...] } from useGetProcessMasterQuery
 */
const DeliveryChallanPrintFormat = ({ singleData, branchData, processList, supplierDetails, jobCardList, deliveryQty }) => {
    if (!singleData) return null;

    const {
        docId,
        docDate,
        dcNo,
        vehicleNo,
        remarks,
        Supplier,
        JobCard,
        ProductionAllocation,
        productionOutwardDetails = [],
        styleItemId,
        jobCardId,
    } = singleData;

    const totalSent = productionOutwardDetails.reduce((s, r) => s + (Number(r.sentQty) || 0), 0);
    const totalReceived = productionOutwardDetails.reduce((s, r) => s + (Number(r.receivedQty) || 0), 0);
    const totalPending = productionOutwardDetails.reduce((s, r) => s + (Number(r.pendingQty) || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* ── TOP ACCENT BAR ── */}
                <View style={styles.topBar} />

                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.companyLeft}>

                        <Image src={Logo} style={styles.logo} />
                    </View>

                    <View style={styles.companyCenter}>
                        <Text style={styles.companyName}>
                            {branchData?.branchName || "MUTHU PRINTERS"}
                        </Text>
                        {/* {branchData?.address ? (
                            <Text style={{ fontSize: 7.5, color: "#666", marginTop: 2, textAlign: "center" }}>
                                {branchData.address}
                            </Text>
                        ) : null} */}
                    </View>

                    <View style={styles.companyRight}>
                        {/* {[
                            { label: "Mobile", value: branchData?.contactMobile },
                            { label: "GST No", value: branchData?.company?.gstNo || branchData?.gstNo },
                            { label: "Email",  value: branchData?.contactEmail },
                        ].map(({ label, value }) =>
                            value ? (
                                <View key={label} style={styles.companyRightRow}>
                                    <Text style={styles.companyLabel}>{label}</Text>
                                    <Text style={styles.companyColon}> : </Text>
                                    <Text style={styles.companyValue}>{value}</Text>
                                </View>
                            ) : null
                        )} */}
                    </View>
                </View>

                {/* ── TITLE BAND ── */}
                <Text style={styles.titleBand}>DELIVERY CHALLAN</Text>

                {/* ── META PILLS ── */}
                <View style={styles.metaRow}>
                    {[
                        { label: "Process Issue No", value: docId },
                        { label: "Date", value: moment.utc(docDate).format("DD-MM-YYYY") },
                        { label: "DC No", value: dcNo || "—" },
                        { label: "Vehicle No", value: vehicleNo || "—" },
                        { label: "Job Card No", value: JobCard?.docId || "—" },
                    ].map(({ label, value }) => (
                        <View key={label} style={styles.metaPill}>
                            <Text style={styles.metaLabel}>{label}:</Text>
                            <Text style={styles.metaValue}>{value}</Text>
                        </View>
                    ))}
                </View>

                {/* ── FROM / TO ── */}
                <View style={styles.twoCol}>
                    {/* FROM — our branch */}
                    <View style={[styles.colHalf, { borderRight: "1 solid #ddd" }]}>
                        <Text style={styles.sectionHeader}>FROM</Text>
                        <View style={styles.sectionBody}>
                            <Text style={styles.partyName}>
                                {branchData?.branchName || "MUTHU PRINTERS"}
                            </Text>
                            {branchData?.address ? (
                                <Text style={styles.partyAddr}>{branchData.address}</Text>
                            ) : null}
                            {[
                                { label: "Mobile No", value: branchData?.contactMobile },
                                { label: "GST No", value: branchData?.company?.gstNo || branchData?.gstNo },
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

                    {/* TO — supplier */}
                    <View style={styles.colHalf}>
                        <Text style={styles.sectionHeader}>TO (SUPPLIER)</Text>
                        <View style={styles.sectionBody}>
                            <Text style={styles.partyName}>{supplierDetails?.name || "—"}</Text>
                            {supplierDetails?.address ? (
                                <Text style={styles.partyAddr}>{supplierDetails.address}</Text>
                            ) : null}
                            {[
                                { label: "Contact Person", value: supplierDetails?.contactPersonName },
                                { label: "Mobile No", value: supplierDetails?.contactNumber },
                                { label: "GST No", value: supplierDetails?.gstNo },
                                { label: "Email", value: supplierDetails?.contactPersonEmail },
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

                {/* ── JOB CARD INFO STRIP ── */}
                <View style={styles.infoStrip}>
                    <View style={styles.infoCell}>
                        <Text style={styles.infoLabel}>Item Description</Text>
                        <Text style={styles.infoValue}>
                            {findFromList(jobCardId, jobCardList?.data, "styleItemName") ||
                                "—"}
                        </Text>
                    </View>
                    <View style={styles.infoCell}>
                        <Text style={styles.infoLabel}>Delivery Qty</Text>
                        <Text style={styles.infoValue}>
                            {deliveryQty ?? "—"}
                        </Text>
                    </View>
                    {/* <View style={styles.infoCell}>
                        <Text style={styles.infoLabel}>Production Type</Text>
                        <Text style={styles.infoValue}>
                            {JobCard?.productionType || "—"}
                        </Text>
                    </View>
                    <View style={styles.infoCellLast}>
                        <Text style={styles.infoLabel}>Item Type</Text>
                        <Text style={styles.infoValue}>
                            {JobCard?.itemType || "—"}
                        </Text>
                    </View> */}
                </View>

                {/* ── PROCESS DETAILS GRID ── */}
                <View style={styles.sectionWrap}>
                    {/* <Text style={styles.sectionTitle}>PROCESS DETAILS</Text> */}

                    <TableHeader />

                    {productionOutwardDetails.length === 0 ? (
                        <View style={[styles.trOdd, { justifyContent: "center", paddingVertical: 12 }]}>
                            <Text style={{ fontSize: 7.5, color: "#aaa", textAlign: "center", flex: 1, fontStyle: "italic" }}>
                                No process details found.
                            </Text>
                        </View>
                    ) : (
                        productionOutwardDetails.map((row, idx) => {
                            const rowStyle = idx % 2 === 0 ? styles.trOdd : styles.trEven;
                            const procName =
                                row?.Process?.name ||
                                findFromList(row.processId, processList?.data, "name") ||
                                `Process ${idx + 1}`;
                            const sentQty = Number(row.sentQty) || 0;
                            const receivedQty = Number(row.receivedQty) || 0;
                            const pendingQty = Number(row.pendingQty) ?? sentQty - receivedQty;

                            // Derive a simple status from quantities
                            let statusLabel = "Sent";
                            let statusColor = "#1a1a2e";
                            if (receivedQty > 0 && receivedQty >= sentQty) {
                                statusLabel = "Received";
                                statusColor = "#15803d";
                            } else if (receivedQty > 0) {
                                statusLabel = "Partial";
                                statusColor = "#b45309";
                            }

                            return (
                                <View key={row.id || idx} style={rowStyle} wrap={false}>
                                    <Text style={[styles.td, { width: 40  }]}>{idx + 1}</Text>
                                    <Text style={[styles.td, { width: 300, textAlign: "left", fontWeight: "bold", color: "#1a1a2e" }]}>
                                        {procName}
                                    </Text>
                                    {/* <Text style={[styles.td, { flex: 0.8 }]}>{row.sequence ?? "—"}</Text> */}
                                    {/* <Text style={[styles.td, { flex: 1.0, textAlign: "right" }]}>{sentQty}</Text> */}
                                    {/* <Text style={[styles.td, { flex: 1.0, textAlign: "right" }]}>
                                        {receivedQty > 0 ? receivedQty : "—"}
                                    </Text>
                                    <Text style={[styles.td, { flex: 1.0, textAlign: "right" }]}>
                                        {pendingQty > 0 ? pendingQty : "—"}
                                    </Text>
                                    <Text style={[styles.td, { flex: 1.2, borderRight: "none", color: statusColor, fontWeight: "bold" }]}>
                                        {statusLabel}
                                    </Text> */}
                                </View>
                            );
                        })
                    )}

                    {/* ── TOTAL ROW ── */}
                    {/* {productionOutwardDetails.length > 0 && (
                        <View style={{
                            flexDirection: "row",
                            backgroundColor: "#e8e8ec",
                            borderTop: "1 solid #b0b0b8",
                        }}>
                            <Text style={[styles.td, { flex: 0.4, color: "transparent" }]}> </Text>
                            <Text style={[styles.td, { flex: 2.5, fontWeight: "bold", color: "#1a1a2e", textAlign: "right" }]}>
                                TOTAL
                            </Text>
                            <Text style={[styles.td, { flex: 0.8, color: "transparent" }]}> </Text>
                            <Text style={[styles.td, { flex: 1.0, fontWeight: "bold", color: "#1a1a2e", textAlign: "right" }]}>
                                {totalSent}
                            </Text>
                            <Text style={[styles.td, { flex: 1.0, fontWeight: "bold", color: "#1a1a2e", textAlign: "right" }]}>
                                {totalReceived > 0 ? totalReceived : "—"}
                            </Text>
                            <Text style={[styles.td, { flex: 1.0, fontWeight: "bold", color: "#1a1a2e", textAlign: "right" }]}>
                                {totalPending > 0 ? totalPending : "—"}
                            </Text>
                            <Text style={[styles.td, { flex: 1.2, borderRight: "none" }]}> </Text>
                        </View>
                    )} */}
                </View>

                {/* ── REMARKS ── */}
                <View style={styles.remarksBar}>
                    <Text style={styles.sectionTitle}>REMARKS</Text>
                    <View style={styles.remarksBody}>
                        <Text style={styles.remarksText}>{remarks || ""}</Text>
                    </View>
                </View>

                {/* ── SIGNATURES ── */}
                <View style={styles.sigArea}>
                    <Text style={styles.sigCompany}>
                        For {branchData?.branchName || ""}
                    </Text>
                    <View style={styles.sigRow}>
                        {["Prepared By", "Supplier Sign", "Authorised Sign", "Receiver Sign"].map((role) => (
                            <Text key={role} style={styles.sigItem}>{role}</Text>
                        ))}
                    </View>
                </View>

                {/* ── FOOTER BAR ── */}
                <View style={styles.footerBar} fixed>
                    <Text style={styles.footerLeft}>
                        {docId} — {supplierDetails?.name || ""}
                    </Text>
                    <Text
                        style={styles.footerRight}
                        render={({ pageNumber, totalPages }) =>
                            `Page ${pageNumber} / ${totalPages}`
                        }
                    />
                </View>

            </Page>
        </Document>
    );
};

export default DeliveryChallanPrintFormat;