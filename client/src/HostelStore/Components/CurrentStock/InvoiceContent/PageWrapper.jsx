import { Page, View,Text } from '@react-pdf/renderer'
import React from 'react'

import tw from '../../../../Utils/tailwind-react-pdf'
import Header from '../Header'


const PageWrapper = ({ children ,startDate}) => {
    return (
       
        <Page size={"A4"} wrap style={[tw("px-3 pb-[60px] text-sm flex flex-col h-full relative "), { fontFamily: "Times-Roman" }]} >


            <View fixed>
            <Header startDate={startDate}  />

            </View>
            <View>
                {children}
            </View>
            <View fixed style={tw("pr-2 pb-2 mt-3 absolute bottom-3")}>

             
                <View style={tw("text-right w-full pb-1 pt-2 pr-3")}>

<Text render={({ pageNumber, totalPages }) => (
   `Page No:${pageNumber} / ${totalPages}`
)} fixed />
</View>
            </View>
        </Page>
    )
}

export default PageWrapper