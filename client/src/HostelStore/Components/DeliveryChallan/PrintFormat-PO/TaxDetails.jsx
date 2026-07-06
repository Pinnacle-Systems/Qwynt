import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import useTaxDetailsHook from '../../../../CustomHooks/TaxHookDetails'
import { groupBy } from 'lodash'

const TaxDetails = ({ items, taxTemplateId, taxGroupWise, taxDetails }) => {

  console.log(taxDetails, "taxDetailstaxDetails")
  console.log(taxGroupWise, "taxGroupWise")


  return (
    <>
      {Object.keys(taxGroupWise).map(taxKey => {
  console.log(taxKey, "taxKey")



        return (
          <React.Fragment key={taxKey}>
            <View
              style={{
                flexDirection: "row",
                borderTop: "1 solid #9ca3af",
                borderRight: "1 solid #9ca3af",
              }}
            >
              <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>
                CGST @{parseFloat(taxKey) / 2}%
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "right",
                  fontSize: 8,
                  padding: 3,
                }}
              >
                {parseFloat(taxDetails.cgstAmount).toFixed(3)}
                
                {/* {parseFloat(taxDetails[taxKey]?.cgstAmount ?? 0).toFixed(3)} */}

              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                borderTop: "1 solid #9ca3af",
                borderRight: "1 solid #9ca3af",
              }}
            >
              <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>
                SGST @{parseFloat(taxKey) / 2}%
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "right",
                  fontSize: 8,
                  padding: 3,
                }}
              >
                {/* {parseFloat(taxDetails[taxKey]?.sgstAmount ?? 0).toFixed(3)} */}
                {parseFloat(taxDetails.sgstAmount).toFixed(3)}

              </Text>
            </View>
          </React.Fragment>

        )
      })}
    </>
  )
}

export default TaxDetails

// import React from 'react';
// import { View, Text, StyleSheet } from '@react-pdf/renderer';
// import { groupBy } from 'lodash';

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: 'row',
//     borderLeft: '1 solid #9ca3af',
//     borderRight: '1 solid #9ca3af',
//     borderTop: '1 solid #9ca3af',
//   },
//   cellLeft: {
//     flex: 4,
//     fontSize: 8,
//     padding: 3,
//     borderRight: '1 solid #9ca3af',
//   },
//   cellRight: {
//     flex: 2,
//     fontSize: 8,
//     padding: 3,
//     textAlign: 'right',
//   },
//   borderBottom: {
//     borderBottom: '1 solid #9ca3af',
//   },
// });

// const TaxDetail = ({ items, taxTemplateId, discountType, discountValue, taxKey  , useTaxDetailsHook}) => {

//   const { isLoading: isTaxHookDetailsLoading, ...taxDetails } =
//     useTaxDetailsHook({ poItems: items, taxTypeId: taxTemplateId, discountType, discountValue });

//   if (isTaxHookDetailsLoading) return null;

//   return (
//     <>
//       <View style={[styles.row, styles.borderBottom]}>
//         <Text style={styles.cellLeft}>CGST @{parseFloat(taxKey) / 2}%</Text>
//         <Text style={styles.cellRight}>{parseFloat(taxDetails.cgstAmount).toFixed(3)}</Text>
//       </View>

//       <View style={[styles.row, styles.borderBottom]}>
//         <Text style={styles.cellLeft}>SGST @{parseFloat(taxKey) / 2}%</Text>
//         <Text style={styles.cellRight}>{parseFloat(taxDetails.sgstAmount).toFixed(3)}</Text>
//       </View>
//     </>
//   );
// };

// const TaxDetails = ({ items, taxTemplateId, discountType, discountValue ,useTaxDetailsHook  }) => {
//   const taxGroupWise = groupBy(items, 'taxPercent');

//   return (
//     <>
//       {Object.keys(taxGroupWise).map((taxKey, index) => (
//         <TaxDetail
//           key={index}
//           taxKey={taxKey}
//           items={taxGroupWise[taxKey]}
//           discountType={discountType}
//           taxTemplateId={taxTemplateId}
//           discountValue={discountValue}
//           useTaxDetailsHook={useTaxDetailsHook}
//         />
//       ))}
//     </>
//   );
// };

// export default TaxDetails;
