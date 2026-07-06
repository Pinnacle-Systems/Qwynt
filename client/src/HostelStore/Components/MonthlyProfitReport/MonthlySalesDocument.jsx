import React from 'react'
import { Document, Page, Text, View, } from '@react-pdf/renderer';
import Header from './Header';
import tw from "../../../Utils/tailwind-react-pdf";
import InvoiceContent from './InvoiceContent';


const MonthlySalesDocument = ({purchaseAmount,saleAmount, startDate, endDate, salesList,totalAmount }) => {
  return (
    <>
      <Document width={500} height={300} style={tw("font-normal")} >
        <InvoiceContent purchaseAmount={purchaseAmount} saleAmount={saleAmount} startDate={startDate} endDate={endDate} salesList={salesList} totalAmount={totalAmount}/>
       
      </Document>
    </>
  )
}

export default MonthlySalesDocument