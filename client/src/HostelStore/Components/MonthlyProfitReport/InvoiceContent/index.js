import { Text } from '@react-pdf/renderer'
import React from 'react'
import PageWrapper from './PageWrapper'
import { Page, View, StyleSheet } from '@react-pdf/renderer'
import tw from '../../../../Utils/tailwind-react-pdf'


const InvoiceContent = ({ purchaseAmount, saleAmount, startDate, endDate, salesList, totalAmount }) => {



  return (
    <>


      <PageWrapper startDate={startDate} endDate={endDate}>
        <View style={tw("mt-5 w-full")}>
          {(salesList.length > 0) &&
            <View style={tw("flex flex-row flex-wrap border border-gray-600 w-99% m-auto")}>
              <Text style={tw('w-11 border-r text-center p-1 border-gray-500')}>S.No</Text>


              <Text style={tw("w-64 text-center p-1  border-r  border-gray-500")}>
                Product
              </Text>
           
              <Text style={tw("w-20 p-1 text-center border-r  border-gray-500")}>
                Qty
              </Text>
              <Text style={tw("w-24  p-1 text-center border-r  border-gray-500")}>
                Purchase Amount
              </Text> <Text style={tw("w-24  p-1 text-center border-r  border-gray-500")}>
                Sale Amount
              </Text>
              <Text style={tw("w-24  p-1 text-center border-r  border-gray-500")}>
                Profit
              </Text>

            </View>
          }

          {salesList?.map((data, i) =>
            <>

              <View style={tw("flex flex-row flex-wrap border border-gray-600 w-99% m-auto")}>

                <Text style={tw('w-11 border-r p-1 text-center  border-gray-500')}>{i + 1}</Text>

                <Text style={tw("w-64 text-left p-1  border-r  border-gray-500")}>
                  {data?.Product}
                </Text>
              
                <Text style={tw("w-20 text-right p-1 border-r border-gray-500")}>
  {parseFloat(data?.Qty).toFixed(2)}
</Text>

                <Text style={tw(" w-24 text-right p-1  border-r  border-gray-500")}>
                  {data?.["Purchase Amount"]}
                </Text>
                <Text style={tw("w-24 text-right p-1  border-r  border-gray-500")}>
                  {data?.["Sale Amount"]}
                </Text>

                <Text style={tw("w-24  p-1 text-right border-r  border-gray-500")}>
                  {data?.Profit}
                </Text>

              </View>


            </>
          )}
          <View style={tw("w-full m-auto px-0.5")}>

            <View style={tw("flex flex-row  border border-gray-600 w-98%")}>

              <Text style={tw('w-11 text-center  font-bold text-sm p-1')}></Text>
              <Text style={tw('w-64 text-center  font-bold text-sm p-1')}>Total</Text>
              <Text style={tw('w-24 text-center  font-bold text-sm p-1')}></Text>
              <Text style={tw('w-20 text-center  font-bold text-sm p-1')}></Text>
              <Text style={tw('w-24  p-1  border-l border-gray-700 font-bold text-sm text-center')}>{parseFloat(purchaseAmount).toFixed(2)}</Text>
              <Text style={tw('w-24  p-1  border-l border-gray-700 font-bold text-sm text-center')}>{parseFloat(saleAmount).toFixed(2)}</Text>
              <Text style={tw('w-24  p-1 border-l border-gray-700 font-bold text-sm text-center')}>{parseFloat(totalAmount).toFixed(2)}</Text>

            </View>
          </View>

        </View>

      </PageWrapper>
    </>
  )
}

export default InvoiceContent