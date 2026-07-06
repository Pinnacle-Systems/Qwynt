import { Text, View } from '@react-pdf/renderer'
import React from 'react'
import tw from "../../../Utils/tailwind-react-pdf";
import { getDateFromDateTime } from '../../../Utils/helper';
import moment from 'moment';

const Header = ({ startDate, endDate }) => {
  return (
    <View style={{ ...tw("w-full mt-3"), fontFamily: "Times-Roman", fontWeight: 100 }}>
      <Text style={{ ...tw("text-center text-lg") }}>ARM SALES REPORT</Text>
      <Text style={tw("text-sm mt-1 text-center")}>All Productwise Sales Report
        Date From {startDate} to {endDate}
      </Text>
      <Text style={tw("text-sm mt-3 text-center")}>
      Pr. Date {moment(new Date()).format("DD-MM-YYYY")}

      </Text>
    </View>
  )
}

export default Header