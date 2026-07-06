import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import numWords from 'num-words';
import logo from "../../../assets/armlogo0.jpg";
import secureLocalStorage from 'react-secure-storage';
import moment from 'moment';
import { findFromList } from '../../../Utils/helper';

export default function PrintFormat({ poBillItems = [], innerRef, date, data, id, docId, isOn }) {
  const currTime = new Date().toLocaleTimeString();
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );

  function getTotal(field1, field2) {
    if (!poBillItems.length) return 0;
    const total = poBillItems.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field1] && current[field2] ? current[field1] * current[field2] : 0);
    }, 0);
    return parseFloat(total);
  }

  const totalAmount = getTotal("qty", "price").toFixed(2);
    const discount =   parseFloat(data.ourPrice || 0) - parseFloat(totalAmount || 0)
   const totalOverallCharge =   parseFloat(data.icePrice || 0) + parseFloat(data.packingCharge || 0) + 
    parseFloat(data.labourCharge || 0) + parseFloat(data.tollgate || 0) + 
    parseFloat(data.transport || 0)
  return (
    <Document>
  <Page style={styles.page}>
    <View fixed style={styles.headerContainer}>
      <Image style={styles.logo} src={logo} />
      <Text style={styles.title}>PURCHASE BILL</Text>
      <View style={styles.billInfoContainer}>
        <Text style={styles.infoText2}>
          <Text style={styles.bold}>Bill.No</Text>: {docId || 'N/A'}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.bold}>Bill.Date</Text>: {moment(date).format("DD-MM-YYYY")}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.bold}>Time</Text>: {currTime}
        </Text>
      </View>
    </View>

    <View style={styles.container}>
      <View style={styles.infoWrapper}>
        <View style={styles.fromInfoContainer}>
          <Text style={styles.infoText1}>
            <Svg style={styles.icon} viewBox="0 0 24 24">
              <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </Svg>
            <Text style={styles.bold}> ARM BROTHERS</Text>
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>FISH MERCHANT & ALL FISH COMMISSION AGENT</Text>
          </Text>
          <Text style={styles.infoText}>29, KANGEYAM CROSS ROAD, TIRUPUR-4</Text>
          <Text style={styles.infoText}>8220468448, 8300022602, 9940806009, 6381644996</Text>
        </View>
        <View style={styles.toInfoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Supplier Name</Text>: {data?.supplier?.name || 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Contact Number</Text>: {data?.supplier?.contactMobile || 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Contact Person</Text>: {data?.supplier?.contactPersonName || 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Address</Text>: {data?.supplier?.address || 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Pincode</Text>: {data?.supplier?.pincode || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Name of Item</Text>
          <Text style={styles.tableHeaderCell}>Qty</Text>
          <Text style={styles.tableHeaderCell}>Rate</Text>
          <Text style={styles.tableHeaderCell}>Amount</Text>
          <Text style={styles.tableHeaderCell}>Remarks</Text>

        </View>
        {(poBillItems || []).map((item, index) => (
  <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowOdd]}>
    <Text style={styles.tableCellitem}>
      {id ? item?.Product?.name : findFromList(item?.productId, "name") || 'N/A'}
    </Text>
    <Text style={styles.tableCell}>{item?.qty || 0}</Text>
    <Text style={styles.tableCell}>{(item?.price || 0).toFixed(2)}</Text>
    <Text style={[styles.tableCell, styles.withBorder]}>
      {(item.price * item.qty).toFixed(2)}
    </Text>
    <Text style={styles.tableCell}>{/* Add content here or keep it empty */}</Text>
  </View>
))}

        <View style={styles.tableFooter}>
          <Text style={styles.tableFooterCell}>Sub Total</Text>
          <Text style={styles.tableFooterCell1}>
  {parseFloat(totalAmount).toLocaleString('en-IN')}
</Text>        </View>
      </View>


     

      {/* Additional Charges Table */}
      <View style={styles.table}>
        {/* Row 1 */}
        <View style={styles.chargeTableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.textLabel}>Ice Price</Text>
            <Text style={styles.textValue}>{data.icePrice || 0}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.textLabel}>Packing Charge</Text>
            <Text style={styles.textValue}>{data.packingCharge || 0}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.textLabel}>Labour Charge</Text>
            <Text style={styles.textValue}>{data.labourCharge || 0}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.textLabel}>Paid Amount</Text>
            <Text style={styles.textValue}>{data.paidAmount || 0}</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.chargeTableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.textLabel}>Tollgate</Text>
            <Text style={styles.textValue}>{data.tollgate || 0}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.textLabel}>Transport</Text>
            <Text style={styles.textValue}>{data.transport || 0}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.textLabel}>Total Overall Charge</Text>
            <Text style={styles.textValue}>
              {totalOverallCharge}
            </Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.textLabel}>Discount</Text>
            <Text style={styles.textValue}>{parseFloat(data.ourPrice || 0) - parseFloat(totalAmount)}</Text>
          </View>
        </View>
        <View style={styles.footerce}>
  <View style={styles.footerRow}>
    <Text style={styles.label}>Subtotal:</Text>
    <Text style={styles.value}>{totalAmount}</Text>
  </View>
  <View style={styles.footerRow}>
    <Text style={styles.label}>Total OverAll Charge</Text>
    <Text style={styles.value}>{totalOverallCharge}</Text>
  </View>
  <View style={styles.footerRow}>
    <Text style={styles.label}>Discount:</Text>
    <Text style={styles.value}>{discount.toFixed(2)}</Text>
  </View>

  <View style={[styles.footerRow, styles.highlightRow]}>
    <Text style={[styles.label, styles.highlightText]}>Total Amount:</Text>
    <Text style={[styles.value, styles.highlightText]}>
      {((parseFloat(totalAmount)) +(parseFloat(totalOverallCharge)) + (parseFloat(discount))).toFixed(2)}
    </Text>
  </View>
  <View style={styles.amountInWordsContainer}>
    <Text style={styles.amountInWordsText}>
      Amount in Words: {numWords((parseFloat(totalAmount)) + (parseFloat(discount))+ parseFloat(totalOverallCharge))} RUPEES
    </Text>
  </View>
</View>

      </View>
    </View>
    <View style={styles.footer}>
      <Text style={styles.footerText}>Thank you for your business!</Text>
      <Text style={styles.footerText}>Contact us: fishmarinelife786@gmail.com</Text>
      <Text style={styles.footerText}>Phone: 8220468448</Text>
    </View>
  </Page>
</Document>

  );
}

const styles = StyleSheet.create({
  page: {
    padding: 15,
  },
  withBorder: {
    borderRightWidth: 1, // Thickness of the right border
    borderRightColor: '#000', // Color of the right border
  },
  container: {
    width: '100%',
    padding: 5,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chargeTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensures spacing between columns
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCol: {
    width: '33.33%', // Each column takes up 1/3 of the row width
    paddingHorizontal: 5, // Small padding for text inside cells
  },
  textLabel: {
    fontSize: 10,
    color: '#333',
  },
  textValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#0381EF',
    paddingBottom: 2,
    marginBottom: 5,
  },
  footerce: {
    padding: 20,
  },
  highlightRow: {
    backgroundColor: '#f0f9ff', // Light blue background to highlight
    padding: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007bff', // Blue border
  },
  highlightText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff', // Blue text color for emphasis
  },

  logo: {
    width: 60,
    height: 60,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0381EF',
    flex: 1,
  },
  billInfoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  infoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  border: {
    borderBottomWidth: 1, 
    borderBottomColor: '#000', 
    marginVertical: 10,  
  },
  fromInfoContainer: {
    width: '45%',
  },
  toInfoContainer: {
    width: '45%',
  },
  infoText: {
    fontSize: 10,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText1: {
    fontSize: 12,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    color: '#0381EF',
  },

  footerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    color: '#333',

  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 12,
    color: '#333',
  },
  infoText2: {
    fontSize: 10,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FC8B02',
    padding: 5,
    borderRadius: 10

  },
  icon: {
    marginRight: 6,
    width: 12,
    height: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#0381EF',
    marginVertical: 4,
  },
  tableContainer: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FC8B02',
    padding: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowOdd: {
    backgroundColor: '#F5F5F5',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
    paddingRight: 28
  },
  tableCellitem: {
    flex: 1,
    fontSize: 10,
    textAlign: 'left',
    paddingRight: 31
  },
  tableFooter: {
    flexDirection: 'row',
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: '#000',
    backgroundColor: '#FC8B02',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableFooterCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableFooterCell1: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 145,
  },
  amountInWordsContainer: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#0381EF',
    paddingTop: 4,
    backgroundColor: '#FC8B02',
    paddingHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
  },
  amountInWordsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#003366',
    fontStyle: 'italic',

    textTransform: 'uppercase',
    textAlign: 'center',
    flex: 1,
    paddingBottom: 6,
  },
  footer: {
    marginTop: 20,
    left: 15,
    right: 15,
    borderTopWidth: 1,
    borderTopColor: '#0381EF',
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#003366',
    textAlign: 'center',
  },
});
