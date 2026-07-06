import { Text } from '@react-pdf/renderer';
import React from 'react';
import PageWrapper from './PageWrapper';
import { Page, View, StyleSheet } from '@react-pdf/renderer';
import tw from '../../../../Utils/tailwind-react-pdf';

const InvoiceContent = ({ startDate, endDate, salesList, totalAmount }) => {
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginTop: 20,
      width: "80%",
      marginLeft: "auto",
      marginRight: "auto",
    },
    tableHeader: {
      backgroundColor: '#2D3748',
      color: '#FFF',
      borderRadius: 8,
      paddingVertical: 5,
      paddingHorizontal: 12,
      fontWeight: 'bold',
      fontSize: 14,
    },
    tableRow: {
      backgroundColor: '#FFF',
      borderBottomWidth: 1,
      borderColor: '#E2E8F0',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    tableRowAlternate: {
      backgroundColor: '#F7FAFC',
      borderBottomWidth: 1,
      borderColor: '#E2E8F0',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    tableDateSeparator: {
      backgroundColor: '#E2E8F0',
      paddingVertical: 4,
      paddingHorizontal: 12,
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 12,
    },
    tableTotal: {
      backgroundColor: '#F7FAFC',
      borderColor: '#CBD5E0',
      borderTopWidth: 2,
      fontWeight: 'bold',
      paddingVertical: 5,
      paddingHorizontal: 12,
      textAlign: 'right',
      fontSize: 14,
    },
  });

  let lastDate = null;

  return (
    <PageWrapper startDate={startDate} endDate={endDate}>
      <View style={[tw("mt-5 w-full"), styles.container]}>
        {salesList.length > 0 && (
          <View style={[tw("flex flex-row"), styles.tableHeader]}>
            <Text style={tw('w-1/6 text-center')}>S.No</Text>
            <Text style={tw('w-1/6 text-center')}>Date</Text>
            <Text style={tw('w-3/6 text-center')}>Party</Text>
            <Text style={tw('w-3/6 text-center')}>Product</Text>
            <Text style={tw('w-1/6 text-center')}>Qty</Text>
            <Text style={tw('w-1/6 text-center')}>Price</Text>
            <Text style={tw('w-1/6 text-center')}>Amount</Text>
          </View>
        )}

        {salesList?.map((data, i) => {
          const currentDate = new Date(data.Date).toLocaleDateString();
          const isAlternate = i % 2 === 0;

          return (
            <React.Fragment key={i}>
              {currentDate !== lastDate && (
                <View style={styles.tableDateSeparator}>
                  <Text>{currentDate}</Text>
                </View>
              )}
              <View
                style={[
                  tw("flex flex-row"),
                  isAlternate ? styles.tableRowAlternate : styles.tableRow,
                ]}
              >
                <Text style={tw('w-1/6 text-center')}>{i + 1}</Text>
                <Text style={tw('w-1/6 text-left')}>{currentDate}</Text>
                <Text style={tw('w-3/6 text-center')}>{data?.Party}</Text>

                <Text style={tw('w-3/6 text-center')}>{data?.Product}</Text>
                <Text style={tw('w-1/6 text-center')}>{data?.Qty}</Text>
                <Text style={tw('w-1/6 text-center')}>{parseFloat(data?.AvgPrice).toFixed(2)}</Text>
                <Text style={tw('w-1/6 text-center')}>{parseFloat(data?.TotalPrice).toFixed(2)}</Text>
              </View>
              {lastDate = currentDate}
            </React.Fragment>
          );
        })}

        <View style={[tw("flex flex-row justify-end"), styles.tableTotal]}>
          <Text style={tw('mr-4')}>Total:</Text>
          <Text style={tw('text-right mr-5')}>{parseFloat(totalAmount).toFixed(2)}</Text>
        </View>
      </View>
    </PageWrapper>
  );
};

export default InvoiceContent;
