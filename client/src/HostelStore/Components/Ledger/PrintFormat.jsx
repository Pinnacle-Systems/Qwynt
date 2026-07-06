import React from 'react'
import {
    Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer';
import tw from '../../../Utils/tailwind-react-pdf'
import { findFromList, getDateFromDateTimeToDisplay } from '../../../Utils/helper';
import commaNumber from 'comma-number';


import { Font } from "@react-pdf/renderer";
import moment from 'moment';

// Font.register({
//     family: "HelveticaBold",
//     src: "https://fonts.gstatic.com/s/helvetica/Helvetica-Bold.ttf"
// });
const styles = StyleSheet.create({
    // page: {
    //   fontFamily: "Helvetica",
    //   fontSize: 8,
    //   padding: 10,
    //   border: "1 solid #000",
    // },
    borderBox: { border: "1 solid black", margin: 0, padding: 8, },
    page: {
        // fontFamily: "Helvetica",
        fontSize: 8,
        padding: 4,
        border: "1 solid #000",
    },
    header: {
        alignItems: "center",
        textAlign: "center",
        marginBottom: 4,
        justifyContent: "space-between",
        flexDirection: "row",
        padding: 7,
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,

    },
    logo: {
        // width: 60,
        height: 40,
        marginRight: 6,
    },
    companyText: {
        fontSize: 9,
        marginBottom: 1,
        textAlign: "left",
    },
    companyText1: {
        fontSize: 9,
        marginBottom: 1,
        textAlign: "right",
        // marginRight: 4
    },
    boxTitle: {
        fontSize: 9,
        fontWeight: "bold",
        marginBottom: 4
    },

    box: {
        border: "1 solid #999",
        padding: 6,
        minHeight: 90
    },

    boxHeading: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 3
    },

    boxText: {
        fontSize: 8,
        marginBottom: 4,
        textTransform: "uppercase"
    },

    row: {
        flexDirection: "row",
        marginBottom: 2
    },

    label: {
        fontSize: 8,
        width: 55
    },

    value: {
        fontSize: 8
    },
    greenTitle: {
        textAlign: "center",
        fontSize: 15,
        color: "#1D3A76",
        paddingVertical: 4,
        // borderBottom: "18 solid #1D3A76",
        justifyContent: "center",
        flexDirection: "row",
        fontWeight: "500",
        // marginVertical: 4,
        // textDecoration: "underline",
        // marginBottom: 6,
    },
    infoRow: {
        flexDirection: "row",
        border: "1 solid #000",
        justifyContent: "space-between",
        padding: 4,
    },
    infoLeft: { flex: 1 },
    infoRight: {
        width: 80,
        height: 80,
        border: "1 solid #000",
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#FFFF",
        // backgroundColor: "#e6ffe6",
        backgroundColor: "#1D3A76",
        padding: 6,
        marginBottom: 2
    },
    boxRow: {
        flexDirection: "row",
        border: "1 solid #000",
        marginTop: 4,
    },
    boxCol: {
        flex: 1,
        borderRight: "1 solid #000",
    },
    boxContent: {
        padding: 4,
        fontSize: 8,
    },
    tableHeader: {
        flexDirection: "row",
        borderTop: "1 solid #000",
        borderBottom: "1 solid #000",
        marginTop: 6,
        backgroundColor: "#1D3A76",
        padding: 3,
        color: "#FFFF"
    },
    th: {
        flex: 1,
        fontSize: 8,
        fontWeight: "bold",
        textAlign: "center",
        padding: 3,
    },
    td: {
        flex: 1,
        fontSize: 8,
        textAlign: "center",
        // borderRight: "1 solid #000",
        // borderBottom: "1 solid #000",
        padding: 3,
    },
    totalRow: {
        flexDirection: "row",
        borderTop: "1 solid #000",
    },
    totalLabel: {
        flex: 8,
        textAlign: "center",
        fontSize: 8,
        fontWeight: "bold",
        padding: 3,
    },
    totalValue: {
        flex: 1.2,
        textAlign: "right",
        fontSize: 8,
        padding: 3,
    },
    taxBox: {
        width: 180,
        border: "1 solid #000",
        alignSelf: "flex-end",
        marginTop: 4,
    },
    taxHeader: {
        backgroundColor: "#d1fae5",
        borderBottom: "1 solid #000",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 8,
        padding: 3,
    },
    taxRow: {
        flexDirection: "row",
        borderTop: "1 solid #000",
    },
    taxLabel: { flex: 1, padding: 3, fontSize: 8 },
    taxValue: {
        flex: 1,
        textAlign: "right",
        padding: 3,
        fontSize: 8,
    },
    remarksSection: {
        marginTop: 6,
    },
    footer: {
        marginTop: 10,
    },
    signatureRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    signature: {
        flex: 1,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 8,
    },
    pageNumber: {
        position: "absolute",
        bottom: 10,
        right: 30,
        fontSize: 7,
        color: "#555",
    },
    poDetails: {
        marginTop: 10,
        width: "50%", // adjust as needed
    },

    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },

});

const LedgerReportPrintFormat = ({ ledgerData, startDate, endDate, branchData, partyId, partyData }) => {

    console.log(endDate, "endDate")

    const ledgerDetails = ledgerData?.data ? ledgerData.data : []
    // Calculate the total credit and debit amounts
    console.log(partyId, partyData, "ledgerData")
    const totalCredit = ledgerDetails?.reduce((total, entry) => total + Math.abs(entry.credit), 0);
    const totalDebit = ledgerDetails?.reduce((total, entry) => total + Math.abs(entry.debit), 0);
    const totalDiscount = ledgerDetails.reduce((total, entry) => total + Math.abs(entry.discount || 0), 0);
    const openingBalance = ledgerData?.openingBalance;
    const closingBalance = ledgerData?.closingBalance;
    const partyName = ledgerData?.partyDetails?.name;
    const columnWidth = [
        5, 10, 10, 15, 20, 10, 15, 15
    ];
    const columns = [
        { name: "S.No.", columnWidthPercentage: columnWidth[0], valueGetter: (entry, index) => index + 1, className: "text-center" },
        { name: "Date.", columnWidthPercentage: columnWidth[1], valueGetter: (entry, index) => getDateFromDateTimeToDisplay(entry.date) },
        { name: "Particulars", columnWidthPercentage: columnWidth[2], valueGetter: (entry, index) => entry.txnType },
        { name: "Trans.Id.", columnWidthPercentage: columnWidth[3], valueGetter: (entry, index) => entry.transId },
        { name: "Payment Type / Ref.No.", columnWidthPercentage: columnWidth[4], valueGetter: (entry, index) => `${entry.paymentType}/${entry.paymentRefNo}`, totalsData: "Totals" },


        { name: "Debit", columnWidthPercentage: columnWidth[7], valueGetter: (entry, index) => entry.credit },


        { name: "DisCount.", columnWidthPercentage: columnWidth[7], valueGetter: (entry, index) => entry.discount },

        { name: "Debit", columnWidthPercentage: columnWidth[7], valueGetter: (entry, index) => entry.debit },

    ];

    console.log(branchData, "branchData")

    return (
        // <Document width={500} height={300} >
        //     <Page size="A4" style={{ border: "1 solid black", margin: 0, padding: 8, fontFamily: "Times-Roman", ...tw("relative pb-[50px] px-2") }}>
        //         {/* Ledger Header */}
        //         {/* <View style={{ marginBottom: 2, marginTop: 3 }}>
        //             <Text style={{ fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 5, }}>
        //                 CUSTOMER LEDGER REPORT
        //             </Text>
        //         </View> */}
        //         <View style={styles.header}>
        //             <View style={{ width: 125, flexWrap: 'wrap' }}>
        //                 <Text style={styles.companyText}>{branchData?.address}</Text>

        //                 <View style={{ flexDirection: 'row' }}>
        //                     <Text style={[styles.companyText, { width: 40 }]}>Mobile</Text>
        //                     <Text style={styles.companyText}>: {branchData?.contactMobile}</Text>
        //                 </View>

        //                 <View style={{ flexDirection: 'row' }}>
        //                     <Text style={[styles.companyText, { width: 40 }]}>Email</Text>
        //                     <Text style={styles.companyText}>: {branchData?.contactEmail}</Text>
        //                 </View>

        //                 <View style={{ flexDirection: 'row' }}>
        //                     <Text style={[styles.companyText, { width: 40 }]}>GST No</Text>
        //                     <Text style={styles.companyText}>: {branchData?.gstNo}</Text>
        //                 </View>
        //             </View>

        //             <View style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        //                 <Text
        //                     style={{
        //                         fontSize: 20,
        //                         color: "#1D3A76",
        //                         fontWeight: "bold",
        //                         marginBottom: 4,
        //                         marginTop: 10,
        //                         textAlign: "center",
        //                     }}
        //                 >
        //                     {branchData?.branchName}
        //                 </Text>
        //             </View>

        //             {/* <Image src={Sangeethatex} style={styles.logo} /> */}
        //         </View>
        //         {/* Ledger Header */}
        //         <View style={{ marginBottom: 15, padding: 10 }}>
        //             {/* Top Row: Company Left & Branch Right */}
        //             <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
        //                 {/* Left: Company Details */}
        //                 <View>
        //                     <Text style={{ fontSize: 10, fontWeight: "bold" }}>{findFromList(partyId, partyData, "name")}</Text>
        //                     <Text style={{ fontSize: 9, width: 200 }}>{findFromList(partyId, partyData, "address")}</Text>
        //                     {/* <Text style={{ fontSize: 9 }}>NEW 36, OLD 207 EAST SAMBANDHAM ROAD</Text>
        //                     <Text style={{ fontSize: 9 }}>RS PURAM</Text>
        //                     <Text style={{ fontSize: 9 }}>COIMBATORE - 641002</Text> */}
        //                     <Text style={{ fontSize: 9 }}>Contact: {findFromList(partyId, partyData, "contactMobile")}</Text>
        //                     <Text style={{ fontSize: 9 }}>E-Mail: {findFromList(partyId, partyData, "email")}</Text>
        //                 </View>

        //                 {/* Right: Branch / Secondary Info */}
        //                 <View style={{ alignItems: "flex-end" }}>
        //                     <Text style={{ fontSize: 10, fontWeight: "bold" }}>PINNACLE SYSTEMS / TIRUPUR</Text>
        //                     <Text style={{ fontSize: 9 }}>65/108 - 1ST FLOOR</Text>
        //                     <Text style={{ fontSize: 9 }}>MURUGAPALAYAM 1ST STREET</Text>
        //                     <Text style={{ fontSize: 9 }}>TIRUPUR-641603</Text>
        //                     <Text style={{ fontSize: 9 }}>MOB: 9994610733</Text>
        //                 </View>
        //             </View>

        //             <View>
        //                 <Text style={{ fontSize: 10, textAlign: "center" }}>
        //                     1-Apr-24 to 16-Dec-24
        //                 </Text>
        //             </View>
        //         </View>


        //         <View style={styles.page}>
        //             {/* Header */}
        //             <View style={styles.header}>
        //                 <Text style={styles.party}>{partyName}</Text>
        //                 <Text style={styles.period}></Text>
        //             </View>

        //             {/* Table Header */}
        //             <View style={[styles.row, styles.headerRow]}>
        //                 <Text style={[styles.cell, styles.date]}>Date</Text>
        //                 {/* <Text style={[styles.cell, styles.particulars]}>Particulars</Text> */}
        //                 <Text style={[styles.cell, styles.vchType]}>Voucher Type</Text>
        //                 <Text style={[styles.cell, styles.vchNo]}>TransactionId</Text>
        //                 <Text style={[styles.cell, styles.amount]}>Debit</Text>
        //                 <Text style={[styles.cell, styles.amount]}>Credit</Text>
        //             </View>

        //             {/* Rows */}
        // {ledgerDetails.map((r, i) => (
        //     <View key={i} style={styles.row}>
        //         <Text style={[styles.cell, styles.date]}>
        //             {getDateFromDateTimeToDisplay(r.txnDate) || ""}
        //         </Text>

        //         {/* <Text style={[styles.cell, styles.particulars]}>
        //             {r.direction} {r.particulars}
        //         </Text> */}

        //         <Text style={[styles.cell, styles.vchType]}>
        //             {r.txnType || ""}
        //         </Text>

        //         <Text style={[styles.cell, styles.vchNo]}>
        //             {r.transactionId || ""}
        //         </Text>

        //         <Text style={[styles.cell, styles.amount]}>
        //             {parseFloat(r.debit ? r.debit : 0).toFixed(3)}
        //         </Text>

        //         <Text style={[styles.cell, styles.amount]}>
        //             {parseFloat(r.credit ? r.credit : 0).toFixed(3)}
        //         </Text>
        //     </View>
        // ))}

        //             {/* Totals */}
        //             <View style={[styles.row, styles.totalRow]}>
        //                 <Text style={[styles.cell, styles.totalLabel]}>
        //                 </Text>

        //                 <Text style={[styles.cell, styles.amount]}>
        //                     {parseFloat(totalDebit).toFixed(3)}

        //                 </Text>

        //                 <Text style={[styles.cell, styles.amount]}>
        //                     {parseFloat(totalCredit).toFixed(3)}
        //                 </Text>

        //             </View>
        //             <View style={[styles.row, styles.totalRow]}>
        //                 <Text style={[styles.cell, styles.totalLabel]}>
        //                     By Closing Balance
        //                 </Text>

        //                 <Text style={[styles.cell, styles.amount]}>
        //                     { }

        //                 </Text>

        //                 <Text style={[styles.cell, styles.amount]}>
        //                     {(parseFloat(totalDebit) - parseFloat(totalCredit)).toFixed(3)}
        //                 </Text>

        //             </View>
        //         </View>
        //     </Page>
        // </Document>
        <Document>
            <Page size="A4" style={styles.borderBox}>
                <View style={styles.page}>

                    <View style={styles.header}>
                        {/* <View style={{ width: 200, flexWrap: 'wrap' }}>
                            <Text style={styles.companyText}>{branchData?.address}</Text>

                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.companyText, { width: 40 }]}>Mobile</Text>
                                <Text style={styles.companyText}>: {branchData?.contactMobile}</Text>
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.companyText, { width: 40 }]}>Email</Text>
                                <Text style={styles.companyText}>: {branchData?.contactEmail}</Text>
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.companyText, { width: 40 }]}>GST No</Text>
                                <Text style={styles.companyText}>: {branchData?.gstNo}</Text>
                            </View>
                        </View> */}
                        <View style={{ width: "100%", marginVertical: 6 }}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    textTransform: "uppercase",
                                }}
                            >
                                CUSTOMER LEDGER REPORT
                            </Text>
                        </View>


                        {/* <View style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: "#1D3A76",
                                    fontWeight: "bold",
                                    marginBottom: 4,
                                    marginTop: 10,
                                    textAlign: "center",
                                }}
                            >
                                {branchData?.branchName}
                            </Text>
                        </View> */}

                        {/* <Image src={Sangeethatex} style={styles.logo} /> */}

                    </View>
                    {/* 
                    <View >
                        <View style={{ alignItems: "", marginTop: 5, marginBottom: 3, marginRight: 7 }}>
                            <View style={{}}>
                                <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                    <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>Customer Name</Text>
                                    <Text style={styles.companyText}>:{findFromList(partyId, partyData, "name")}</Text>
                                </View>

                                <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                    <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>PO Date</Text>
                                </View>

                                <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                    <Text style={[styles.companyText, { width: 50, textAlign: "left" }]}>Due Date</Text>
                                </View>
                            </View>
                        </View>




                    </View> */}
                    <View style={{ width: "100%", marginVertical: 6 }}>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "bold",
                                textAlign: "center",
                                letterSpacing: 0.3
                            }}
                        >
                            {moment(startDate).format("DD-MM-YYYY")}  TO  {moment(endDate).format("DD-MM-YYYY")}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            marginTop : 5
                        }}
                    >
                        {/* FROM */}
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.boxTitle}>From</Text>

                            <View style={styles.box}>
                                <Text style={styles.boxHeading}>
                                    {branchData?.branchName}
                                </Text>

                                <Text style={styles.boxText}>
                                    {branchData?.address}
                                </Text>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Mobile</Text>
                                    <Text style={styles.value}>: {branchData?.contactMobile}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>GST No</Text>
                                    <Text style={styles.value}>: {branchData?.gstno}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Email</Text>
                                    <Text style={styles.value}>: {branchData?.contactEmail}</Text>
                                </View>
                            </View>
                        </View>

                        {/* TO */}
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.boxTitle}>To</Text>

                            <View style={styles.box}>
                                <Text style={styles.boxHeading}>
                                    {findFromList(partyId, partyData, "name")}
                                </Text>

                                <Text style={styles.boxText}>
                                    {findFromList(partyId, partyData, "address")}
                                </Text>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Mobile</Text>
                                    <Text style={styles.value}>
                                        : {findFromList(partyId, partyData, "contactMobile")}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>GST No</Text>
                                    <Text style={styles.value}>
                                        : {findFromList(partyId, partyData, "gstNo")}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Email</Text>
                                    <Text style={styles.value}>
                                        : {findFromList(partyId, partyData, "email")}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>



                    <View >










                    </View>


                    <View style={{
                        flexDirection: "row",
                        borderTop: "3 solid #000",
                        borderBottom: "1 solid #000",
                        marginRight: 4,
                        marginTop: 5

                    }}>
                        <Text style={[styles.th, { flex: 0.5 }]}>S.No</Text>
                        <Text style={[styles.th, { flex: 1 }]}>Date</Text>
                        <Text style={[styles.th, { flex: 5 }]}>Vch Type</Text>
                        <Text style={[styles.th, { flex: 2 }]}>Vch No</Text>
                        <Text style={[styles.th, { flex: 2 ,textAlign : "right"  }]}>Debit</Text>
                        <Text style={[styles.th, { flex: 2 ,textAlign : "right" }]}>Credit</Text>

                    </View>


                    {ledgerDetails?.map((r, index) => (
                        <View key={index} style={{ flexDirection: "row", }}>
                            <Text style={[styles.td, { flex: 0.5 }]}>{index + 1}</Text>
                            <Text style={[styles.td, { flex: 1 }]}>
                                {getDateFromDateTimeToDisplay(r.txnDate) || ""}
                            </Text>
                            <Text style={[styles.td, { flex: 5 }]}>
                                {r.txnType || ""}
                            </Text>
                            <Text style={[styles.td, { flex: 2 }]}>
                                {r.transactionId || ""}
                            </Text>



                            <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
                                {parseFloat(r.debit ? r.debit : 0).toFixed(2)}
                            </Text>

                            <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
                                {parseFloat(r.credit ? r.credit : 0).toFixed(2)}
                            </Text>


                        </View>
                    ))}
                    <View style={{
                        flexDirection: "row",
                        borderTop: "1 solid #000",
                        borderBottom: "1 solid #000",

                    }}>
                        <Text style={[styles.td, { flex: 0.5 }]}></Text>
                        <Text style={[styles.td, { flex: 1 }]}></Text>
                        <Text style={[styles.td, { flex: 5 }]}></Text>
                        <Text style={[styles.td, { flex: 2 }]}></Text>
                        <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>{parseFloat(totalDebit).toFixed(2)}</Text>
                        <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>{parseFloat(totalCredit).toFixed(2)}</Text>

                    </View>

                    {/* <View style={{ width: "100%", marginTop: 8 }}>
                        <View
                            style={{
                                alignSelf: "flex-end",
                                width: 140,

                            }}
                        >
                            <View style={{ flexDirection: "row", marginBottom: 4 }}>
                                <Text style={[styles.companyText, { width: 80 }]}>
                                    Total Debit
                                </Text>
                                <Text style={styles.companyText1}>
                                    : {parseFloat(totalDebit || 0).toFixed(2)}
                                </Text>
                            </View>

                            <View style={{ flexDirection: "row", marginBottom: 4 }}>
                                <Text style={[styles.companyText, { width: 80 }]}>
                                    Total Credit
                                </Text>
                                <Text style={styles.companyText1}>
                                    : {parseFloat(totalCredit || 0).toFixed(2)}
                                </Text>
                            </View>

                            <View style={{ flexDirection: "row", }}>
                                <Text
                                    style={[
                                        styles.companyText,
                                        { width: 80, fontWeight: "bold" }
                                    ]}
                                >
                                    Closing Balance
                                </Text>
                                <Text style={[styles.companyText1, { fontWeight: "bold" , textAlign : "right"}]}>
                                    : {(parseFloat(totalDebit) - parseFloat(totalCredit)).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View> */}
                    <View style={{ width: "100%", marginTop: 8 }}>
                        <View style={{ alignSelf: "flex-end", width: 220 }}>

                            {/* Total Debit */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                <Text style={styles.companyText}>Total Debit</Text>
                                <Text style={styles.companyText1}>
                                    {parseFloat(totalDebit || 0).toFixed(2)}
                                </Text>
                            </View>

                            {/* Total Credit */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                <Text style={styles.companyText}>Total Credit</Text>
                                <Text style={styles.companyText1}>
                                    {parseFloat(totalCredit || 0).toFixed(2)}
                                </Text>
                            </View>

                            {/* Closing Balance */}
                            <View style={{
                                flexDirection: "row", justifyContent: "space-between", borderTop: "1 solid #000",

                            }}>
                                <Text style={[styles.companyText, { fontWeight: "bold", marginTop: 4 }]}>
                                    Closing Balance
                                </Text>
                                <Text style={[styles.companyText1, { fontWeight: "bold", marginTop: 4 }]}>
                                    {(parseFloat(totalDebit) - parseFloat(totalCredit)).toFixed(2)}
                                </Text>
                            </View>

                        </View>
                    </View>











                </View>


                <View style={{
                    marginTop: 20, textAlign: "center", fontSize: 8,

                }}>
                    <Text
                        render={({ pageNumber, totalPages }) =>
                            `Page ${pageNumber} / ${totalPages}`
                        }
                    />
                </View>



            </Page>
        </Document >
    )
}

export default LedgerReportPrintFormat
