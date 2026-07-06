import { Text } from '@react-pdf/renderer'
import React from 'react'
import PageWrapper from './PageWrapper'
import { Page, View,StyleSheet} from '@react-pdf/renderer'
import tw from '../../../../Utils/tailwind-react-pdf'
import moment from 'moment'
import { getDateFromDateTimeToDisplay } from '../../../../Utils/helper'


const InvoiceContent = ({totalAmount,startDate,endDate,salesList}) => {
  const numericFields = ["Qty", "Amount"];
 
   

  const styles = StyleSheet.create({
    textRight: {
      textAlign:"right",
      width:24
    },
    textLeft: {
      textAlign:"left",
      width:"40%"
    },
    
  });

  

  return (
    <>{console.log(salesList,"saleslistttpurchasee")}
    

        <PageWrapper startDate={startDate} endDate={endDate}>
        <View style={tw("mt-5 w-full")}>
  {salesList.length > 0 && (
    <View style={tw("flex flex-row flex-wrap border border-gray-300 w-full rounded-lg shadow-md")}>
      <Text style={tw('w-2/12 border-r text-center p-3 bg-gray-100 font-semibold text-sm')}>Date</Text>
      <Text style={tw('w-3/12 border-r text-center p-3 bg-gray-100 font-semibold text-sm')}>Party Name</Text>
      <Text style={tw('w-2/12 border-r text-center p-3 bg-gray-100 font-semibold text-sm')}>Product</Text>
      <Text style={tw('w-1/12 border-r text-center p-3 bg-gray-100 font-semibold text-sm')}>Qty</Text>
      <Text style={tw('w-2/12 border-r text-center p-3 bg-gray-100 font-semibold text-sm')}>Avg Price</Text>
      <Text style={tw('w-2/12 text-center p-3 bg-gray-100 font-semibold text-sm')}>Amount</Text>
    </View>
  )}

  {salesList.map((data, i) => (
    <View key={i} style={tw("flex flex-row flex-wrap border border-gray-200 w-full rounded-lg shadow-sm mb-3")}>
      <Text style={tw('w-2/12 border-r p-3 text-left bg-white text-sm text-gray-800')}>{getDateFromDateTimeToDisplay(data?.createdAt)}</Text>
      <Text style={tw('w-3/12 border-r p-3 text-left bg-white text-sm text-gray-800')}>{data?.Party}</Text>
      <Text style={tw('w-2/12 border-r p-3 text-right bg-white text-sm text-gray-800')}>{data?.Product}</Text>
      <Text style={tw('w-1/12 border-r p-3 text-right bg-white text-sm text-gray-800')}>{data?.Qty}</Text>
      <Text style={tw('w-2/12 border-r p-3 text-right bg-white text-sm text-gray-800')}>{data?.AvgPrice}</Text>
      <Text style={tw('w-2/12 p-3 text-right bg-white text-sm text-gray-800')}>{parseFloat(data?.TotalPrice || 0).toFixed(2)}</Text>
    </View>
  ))}

  <View style={tw("flex flex-row justify-between border border-gray-600 w-full rounded-lg shadow-md")}>
    <Text style={tw('w-8/12 text-center font-bold text-sm p-3')}>Total</Text>
    <Text style={tw('w-4/12 p-3 border-l border-gray-700 font-bold text-sm text-right')}>{parseFloat(totalAmount).toFixed(2)}</Text>
  </View>
</View>

        
        </PageWrapper>
    </>
  )
}

export default InvoiceContent