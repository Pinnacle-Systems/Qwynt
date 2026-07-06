import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer';
import tw from '../../../Utils/tailwind-react-pdf'
import { getDateFromDateTimeToDisplay } from '../../../Utils/helper';
import commaNumber from 'comma-number';

const LedgerReportPrintFormatcus = ({ ledgerData, startDate, endDate }) => {
    const ledgerDetails = ledgerData?.data ? ledgerData.data : []
    // Calculate the total credit and debit amounts
    const totalCredit = ledgerDetails.filter(item => item.type === "Purchase").reduce((total, entry) => total + Math.abs(entry.amount), 0);
    const totalDebit = ledgerDetails.filter(item => item.type === "Payment").reduce((total, entry) => total + Math.abs(entry.amount), 0);
     console.log(ledgerDetails,"ledgerDetail")
    const openingBalance = ledgerData?.openingBalance;
    const closingBalance = ledgerData?.closingBalance;
    const partyName = ledgerData?.partyDetails?.name;
    const columnWidth = [
        5, 10, 10, 15, 20,10, 15, 15

    ];
    const columns = [
        { name: "S.No.", columnWidthPercentage: columnWidth[0], valueGetter: (entry, index) => index + 1, className: "text-center" },
        { name: "Date.", columnWidthPercentage: columnWidth[1], valueGetter: (entry, index) => getDateFromDateTimeToDisplay(entry.date) },
        { name: "Type.", columnWidthPercentage: columnWidth[2], valueGetter: (entry, index) => entry.type },
        { name: "Trans.Id.", columnWidthPercentage: columnWidth[3], valueGetter: (entry, index) => entry.transId },
        { name: "Payment Type / Ref.No.", columnWidthPercentage: columnWidth[4], valueGetter: (entry, index) => `${entry.paymentType}/${entry.paymentRefNo}`, totalsData: "Totals" },
        {
            name: "Credit", columnWidthPercentage: columnWidth[6], openingBalanceRow: "Open. Balance", openingBalanceStyle: "text-center", valueGetter: (entry, index) => entry.type === "Purchase" ? commaNumber(Math.abs(entry.amount).toFixed(2)) : "", totalsData: commaNumber(Math.abs(totalCredit).toFixed(2)),
            closingBalanceData: "Closing Balance"
        },
        { name: "DisCount.", columnWidthPercentage: columnWidth[7], valueGetter: (entry, index) => entry.discount },

        { name: "Debit", columnWidthPercentage: columnWidth[5], openingBalanceRow: parseFloat(openingBalance || 0).toFixed(2), openingBalanceStyle: "text-center", valueGetter: (entry, index) => entry.type === "Payment" ? commaNumber(Math.abs(entry.amount).toFixed(2)) : "", totalsData: commaNumber(Math.abs(totalDebit).toFixed(2)), closingBalanceData: parseFloat(closingBalance).toFixed(2) },
    ];
    return (
        <Document width={500} height={300}>
        <Page size="A4" style={{ fontFamily: "Times-Roman", ...tw("relative pb-[50px] px-4 py-12") }}>
            <View fixed>
                <View style={tw("text-center mb-10 text-xl mt-10 pt-10")}>
                    <Text style={{ fontFamily: "Times-Bold", padding: 10 }}>{partyName} Customer Purchase Ledger Report</Text>
                    <Text style={tw("text-sm")}>{getDateFromDateTimeToDisplay(startDate)} to {getDateFromDateTimeToDisplay(endDate)}</Text>
                </View>
    
                {/* Table Header */}
                <View style={{ ...tw("w-full flex flex-row border-t-2 border-l-2 text-[11px]"), fontFamily: "Times-Bold" }}>
                    {columns.map((i) => (
                        <Text key={i.name} style={tw(`w-[${i.columnWidthPercentage}%] ${i.openingBalanceStyle} border-r-2 p-2`)}>
                            {i.openingBalanceRow}
                        </Text>
                    ))}
                </View>
                <View style={{ ...tw("w-full flex flex-row border-l-2 border-t-2 text-sm text-center"), fontFamily: "Times-Bold" }}>
                    {columns.map((i) => (
                        <Text key={i.name} style={tw(`w-[${i.columnWidthPercentage}%] border-r-2 border-b-2 p-2`)}>
                            {i.name}
                        </Text>
                    ))}
                </View>
            </View>
    
            {/* Ledger Details */}
            <View style={tw("text-xs")}>
                {ledgerDetails.length > 0 ? (
                    <>
                        {ledgerDetails.map((entry, index) => (
                            <View key={index} style={tw(`w-full flex flex-row border-l-2 border-b-2`)} wrap={false}>
                                {columns.map((i) => (
                                    <Text style={tw(`w-[${i.columnWidthPercentage}%] ${i.openingBalanceStyle} ${i?.className} border-r-2 p-2`)}>
                                        {i.valueGetter(entry, index)}
                                    </Text>
                                ))}
                            </View>
                        ))}
                    </>
                ) : (
                    <View style={tw(`w-full flex flex-row border-l-2 border-b-2 h-[20px]`)} wrap={false}>
                        {columns.map((i) => (
                            <Text style={tw(`w-[${i.columnWidthPercentage}%] ${i.openingBalanceStyle} border-r-2 p-2`)}></Text>
                        ))}
                    </View>
                )}
    
                {/* Totals and Closing Balance */}
                <View style={{ ...tw("w-full flex flex-row border-l-2 border-b-2"), fontFamily: "Times-Bold" }}>
                    {columns.map((i) => (
                        <Text style={tw(`w-[${i.columnWidthPercentage}%] ${i.openingBalanceStyle} border-r-2 p-2`)}>
                            {i.totalsData}
                        </Text>
                    ))}
                </View>
                <View style={{ ...tw("w-full flex flex-row border-l-2 border-b-2 text-[11px]"), fontFamily: "Times-Bold" }}>
                    {columns.map((i) => (
                        <Text style={tw(`w-[${i.columnWidthPercentage}%] ${i.openingBalanceStyle} border-r-2 p-2`)}>
                            {i.closingBalanceData}
                        </Text>
                    ))}
                </View>
            </View>
    
            {/* Footer with Page Numbers */}
            <View fixed style={tw("absolute bottom-5 w-full")}>
                <View style={tw("text-center w-full pb-2 pt-2 text-xs")}>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} fixed />
                </View>
            </View>
        </Page>
    </Document>
    
    )
}

export default LedgerReportPrintFormatcus