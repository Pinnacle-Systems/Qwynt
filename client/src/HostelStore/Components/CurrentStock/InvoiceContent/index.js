import { Text } from '@react-pdf/renderer'
import React from 'react'
import PageWrapper from './PageWrapper'
import { Page, View,StyleSheet} from '@react-pdf/renderer'
import tw from '../../../../Utils/tailwind-react-pdf'


const InvoiceContent = ({startDate,stockList,totalAmount}) => {
  const numericFields = ["Qty", "Amount"];
  // let totalAmount = 0;
  // for (const obj of salesList) {
  //   totalAmount += obj.Amount;
  // }
   


  return (
    <>{console.log(stockList,"stockList",totalAmount)}
    

        <PageWrapper startDate={startDate} >
          <View style={tw("mt-6 w-full")}>
          {(stockList.length > 0) &&
            <View style={tw("flex flex-row flex-wrap border border-gray-600 w-99% m-auto")}>
                                   <Text style={tw('w-14 border-r text-center p-1 border-gray-500')}>S.No</Text>

              {/* {Object.keys(salesList[0]).map((heading, i) =>
                <Text style={[tw(`${numericFields.includes(heading) ? "w-1/4": "w-2/4"}`) ,tw("text-center p-1  border-r  border-gray-500")]} key={i}>
                  {heading.replace(/_+/g, ' ')}
                </Text>
              )} */}
                     <Text  style={tw("w-80 text-center p-1  border-r  border-gray-500")}>
                              Product
                              </Text>
                              <Text  style={tw("w-24  text-center p-1  border-r  border-gray-500")}>
                             Stock
                              </Text>
                              <Text  style={tw("w-24   p-1 text-center border-r  border-gray-500")}>
                              Sale Rate
                              </Text>
                              <Text  style={tw(" w-24   p-1 text-center border-r  border-gray-500")}>
                              Uom
                              </Text>
                              <Text  style={tw(" w-24   p-1 text-center border-r  border-gray-500")}>
                              Sale Value
                              </Text>

            </View>
          }

                 {stockList?.map((data, i) =>
                      <>

                               <View style={tw("flex flex-row flex-wrap border border-gray-600 w-99% m-auto")}>

                               <Text style={tw('w-14 border-r p-1 text-center  border-gray-500')}>{i + 1}</Text>
                              
                              <Text  style={tw("w-80  text-left p-1  border-r  border-gray-500")}>
                              {data?.Product}
                              </Text>
                              <Text  style={tw("w-24 text-right p-1  border-r  border-gray-500")}>
                              {data?.Stock}
                              </Text>
                              <Text  style={tw("w-24 p-1 text-right border-r  border-gray-500")}>
                                {parseFloat(data?.SaleRate).toFixed(2)}
                              </Text>
                              <Text  style={tw(" w-24   p-1 text-right border-r  border-gray-500")}>
                                {data?.Uom}
                              </Text>
                              <Text  style={tw(" w-24   p-1 text-right border-r  border-gray-500")}>
                                {parseFloat(data?.SaleValue).toFixed(2)}
                              </Text>
                       
                       </View>

        
                      </>
                    )}

                   <View style={tw("w-full m-auto px-1")}>
                   <View style={tw("flex flex-row  border border-gray-600 w-99% ")}>

<Text  style={tw('text-center w-5/6  font-bold text-sm p-3')}>Total</Text>
<Text style={tw('w-16 p-2 border-l border-gray-700 font-bold text-sm text-center')}>{parseFloat(totalAmount).toFixed(2)}</Text>


                    </View>
                   </View>
                    


          </View>
        
        </PageWrapper>
    </>
  )
}

export default InvoiceContent