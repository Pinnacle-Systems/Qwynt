import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import numWords from 'num-words';
import logo from "../../../assets/armlogo0.jpg";
import secureLocalStorage from 'react-secure-storage';
import moment from 'moment';
import { findFromList } from '../../../Utils/helper';

export default function Form({ poBillItems = [], innerRef, date, data, id, docId, isOn }) {
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

  return (
    <Document>
      <Page style={styles.page}>
        <View fixed style={styles.headerContainer}>
          <Image style={styles.logo} src={logo} />
          <Text style={styles.title}>
            {isOn ? "INVOICE" : "QUOTATION"}
          </Text>
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
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></Svg>
                <Text style={styles.bold}></Text> ARM BROTHERS
              </Text>
              <Text style={styles.infoText}>
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></Svg>
                <Text style={styles.bold}></Text> FISH MERCHANT & ALL FISH COMMISSION AGENT
              </Text>
              <Text style={styles.infoText}>
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></Svg>
                <Text style={styles.bold}></Text> 29, KANGEYAM CROSS ROAD, TIRUPUR-4
              </Text>
              <Text style={styles.infoText}>
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></Svg>
                <Text style={styles.bold}></Text> 8220468448, 8300022602, 9940806009, 6381644996
              </Text>
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
                <Text style={styles.tableCell}>
                  {id ? item?.Product?.name : findFromList(item?.productId, "name") || 'N/A'}
                </Text>
                <Text style={styles.tableCell1}>{item?.qty || 0}</Text>
                <Text style={styles.tableCell1}>{(item?.price || 0).toFixed(2)}</Text>
                <Text style={styles.tableCell1}>{(item.price * item.qty).toFixed(2)}</Text>
                <Text style={styles.tableCell}>{/* Add content here or keep it empty */}</Text>
              </View>
            ))}
            <View style={styles.tableFooter}>
              <Text style={styles.tableFooterCell}>Total</Text>
              <Text style={styles.tableFooterCell1}>
                {parseFloat(totalAmount).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.amountInWordsContainer}>
              <Text style={styles.amountInWordsText}>
                <Svg style={styles.icon} viewBox="0 0 24 24">
                  <Path d="M4 4h16v16H4V4zm1.5 1.5v3H6v-3h2v3h1.5v-3h2v3h1.5v-3h2v3h1.5v-3H18v6h-6v-1.5H7.5V18h-2v-6H6v3H4.5v-6H6v1.5h2V6H6V4.5H5.5z" />
                </Svg>
                Amount in Words: {totalAmount ? numWords(parseInt(totalAmount)).toUpperCase() : 'Invalid amount'} RUPEES
              </Text>
            </View>
          </View>



        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerText}>Contact us:  fishmarinelife786@gmail.com</Text>
          <Text style={styles.footerText}>Phone: 8220468448</Text>
        </View>
      </Page>
    </Document >
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 15,
  },
  container: {
    width: '100%',
    padding: 5,
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
  withBorder: {
    borderRightWidth: 1, // Thickness of the right border
    borderRightColor: '#000', // Color of the right border
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
    textAlign: 'left',
  },
  tableCell1: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
    paddingRight: 33
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
    paddingRight: 123,
  },
  amountInWordsContainer: {
    marginTop: 15,
    marginBottom: 15,

    borderTopWidth: 1,
    borderTopColor: '#0381EF',
    paddingTop: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
  },
  amountInWordsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#003366',
    textTransform: 'uppercase',
    textAlign: 'center',
    flex: 1,
    paddingBottom: 6,
  },
  footer: {
    marginTop: 20,
    bottom: 15,
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
