

// import {
//   Document,
//   Page,
//   View,
//   Text,
//   Image,
//   Font,
//   StyleSheet,
// } from "@react-pdf/renderer";
// // import Sangeethatex from "../../../../../src/assets/Sangeethatex.png";
// import tw from "../../../../Utils/tailwind-react-pdf";
// import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";

// import TaxDetails from "./TaxDetails";
// import { Loader } from "../../../../Basic/components";
// import numberToText from "number-to-text";
// import MsExports from "../../../../../src/assets/MSexports.png";
// import numberToWords from "number-to-words";
// import React from "react";
// // Font registration
// Font.register({
//   family: "Roboto",
//   src: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,600;1,400;1,600&display=swap",
// });
// const BORDER_GREY = "#9ca3af";
// const ZEBRA_BROWN = "#F4EEE9";
// const styles = StyleSheet.create({
//   // page: {
//   //   fontFamily: "Helvetica",
//   //   fontSize: 8,
//   //   padding: 10,
//   //   border: "1 solid #000",
//   // },
//   borderBox: { border: "1 solid black", margin: 0, padding: 8, },
//   page: {
//     // fontFamily: "Helvetica",
//     fontSize: 8,
//     padding: 0,
//     border: "1 solid #000",
//   },
//   header: {
//     alignItems: "center",
//     textAlign: "center",
//     marginBottom: 7,
//     // justifyContent: "space-between",
//     flexDirection: "row",
//     padding: 7,
//     height: 130


//   },
//   logoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,

//   },
//   logo: {
//     width: 80,
//     height: 80,
//     // marginRight: 6,
//     resizeMode: 'contain',
//     marginRight: 12,

//   },
//   companyText: {
//     fontSize: 9,
//     marginBottom: 1,
//     textAlign: "left",
//     marginRight: 4,
//   },
//   ValueText: {
//     fontSize: 9,
//     marginBottom: 1,
//     paddingLeft: 4,   // gap before text starts
//   }
//   ,
//   greenTitle: {
//     textAlign: "center",
//     fontSize: 15,
//     color: "#FFFF",
//     backgroundColor: "#946657",
//     paddingVertical: 4,
//     // borderBottom: "18 solid #1D3A76",

//     fontWeight: "500",
//     // marginVertical: 4,
//     // textDecoration: "underline",
//     // marginBottom: 6,
//   },
//   infoRow: {
//     flexDirection: "row",
//     border: "1 solid #000",
//     justifyContent: "space-between",
//     padding: 4,
//   },
//   infoLeft: { flex: 1 },
//   infoRight: {
//     width: 80,
//     height: 80,
//     border: "1 solid #000",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sectionTitle: {
//     fontSize: 10,
//     fontWeight: "bold",
//     color: "#FFFF",
//     // backgroundColor: "#e6ffe6",
//     backgroundColor: "#946657",
//     padding: 6,
//     marginBottom: 2
//   },
//   valueContainer: {
//     flexDirection: 'row',
//     paddingLeft: 6,   // GAP after label
//   },

//   colon: {
//     fontSize: 9,
//   },
//   boxRow: {
//     flexDirection: "row",
//     border: "1 solid #000",
//     marginTop: 4,
//   },
//   boxCol: {
//     flex: 1,
//     borderRight: "1 solid #000",
//   },
//   boxContent: {
//     padding: 4,
//     fontSize: 8,
//   },
//   tableHeader: {
//     flexDirection: "row",
//     borderTop: "1 solid #000",
//     borderBottom: "1 solid #000",
//     marginTop: 6,
//     backgroundColor: "#946657",
//     padding: 3,
//     color: "#FFFF"
//   },
//   th: {
//     flex: 1,
//     fontSize: 8,
//     fontWeight: "bold",
//     textAlign: "center",
//     // borderRight: "1 solid #000",
//     padding: 3,
//   },
//   td: {
//     flex: 1,
//     fontSize: 8,
//     textAlign: "center",
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderRightColor: BORDER_GREY,
//     borderBottomColor: BORDER_GREY,
//     padding: 3,
//   },
//   totalRow: {
//     flexDirection: "row",
//     borderTop: "1 solid #000",
//   },
//   totalLabel: {
//     flex: 8,
//     textAlign: "center",
//     fontSize: 8,
//     fontWeight: "bold",
//     padding: 3,
//   },
//   totalValue: {
//     flex: 1.2,
//     textAlign: "right",
//     fontSize: 8,
//     padding: 3,
//   },
//   taxBox: {
//     width: 180,
//     border: "1 solid #000",
//     alignSelf: "flex-end",
//     marginTop: 4,
//   },
//   taxHeader: {
//     backgroundColor: "#d1fae5",
//     borderBottom: "1 solid #000",
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 8,
//     padding: 3,
//   },
//   taxRow: {
//     flexDirection: "row",
//     borderTop: "1 solid #000",
//   },
//   taxLabel: { flex: 1, padding: 3, fontSize: 8 },
//   taxValue: {
//     flex: 1,
//     textAlign: "right",
//     padding: 3,
//     fontSize: 8,
//   },
//   remarksSection: {
//     marginTop: 6,
//   },
//   footer: {
//     marginTop: 10,
//   },
//   signatureRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//   },
//   signature: {
//     flex: 1,
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 8,
//   },
//   pageNumber: {
//     position: "absolute",
//     bottom: 10,
//     right: 30,
//     fontSize: 7,
//     color: "#555",
//   },
//   poDetails: {
//     marginTop: 10,
//     width: "50%", // adjust as needed
//   },

//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 4,
//   },

//   label: {
//     fontSize: 8,
//     fontWeight: "bold",
//   },

//   value: {
//     fontSize: 8,
//     textAlign: "right",
//     flexShrink: 1, // helps long text wrap properly
//   },
// });
// const DeliveryInvoice = ({
//   isTaxHookDetailsLoading,
//   poNumber,
//   poDate,
//   deliveryToId,
//   dueDate,
//   payTermId,
//   deliveryType,
//   supplierDetails,
//   poItems,
//   taxTemplateId,
//   discountType,
//   discountValue,
//   remarks,
//   poType,
//   branchData,
//   termsAndCondition,
//   // taxDetails,
//   deliveryTo,
//   tax,
//   taxGroupWise,
//   colorList, uomList, yarnList, sizeList, term, termsData, useTaxDetailsHook, docId, totalQty,
//   transportMode, transporter, vehicleNo

// }) => {

//   console.log(poItems, "poItems")

//   const gstSummary = {};

//   poItems?.filter(i => i.styleId)?.forEach(item => {
//     const amount = item.invoiceQty * item.price;
//     const tax = item?.Hsn?.tax
//     const halfGst = tax / 2;

//     if (!gstSummary[tax]) {
//       gstSummary[tax] = {
//         cgstRate: halfGst,
//         sgstRate: halfGst,
//         cgstAmount: 0,
//         sgstAmount: 0
//       };
//     }

//     gstSummary[tax].cgstAmount += amount * (halfGst / 100);
//     gstSummary[tax].sgstAmount += amount * (halfGst / 100);
//   });

//   const gstArray = Object.keys(gstSummary).map(tax => {
//     return {
//       taxRate: Number(tax),
//       cgstRate: gstSummary[tax].cgstRate,
//       sgstRate: gstSummary[tax].sgstRate,
//       cgstAmount: gstSummary[tax].cgstAmount,
//       sgstAmount: gstSummary[tax].sgstAmount,
//       totalTax: gstSummary[tax].cgstAmount + gstSummary[tax].sgstAmount
//     };
//   });




//   const groupedPoItems = Object.values(
//     poItems.reduce((acc, item) => {
//       const key = [
//         item?.styleId,
//         item?.styleItemId,
//         item?.colorId,
//         item?.uomId,
//         item?.price,
//       ].join("_");

//       console.log({ key }, "keuche");


//       if (!acc[key]) {
//         acc[key] = {
//           ...item,
//           invoiceQty: Number(item.invoiceQty) || 0,
//         };
//       } else {
//         acc[key].invoiceQty += Number(item.invoiceQty) || 0;
//       }

//       return acc;
//     }, {})
//   );




//   const filledPoItems = [
//     ...groupedPoItems,
//     ...Array(Math.max(0, 10 - poItems.length)).fill({}), // empty rows
//   ];


//   console.log(groupedPoItems, "groupedPoItems")


//   console.log(filledPoItems, "filledPoItems")


//   // const totalAmount = filledPoItems?.reduce((sum, item) => {
//   //   const qty = Number(item.invoiceQty || 0);
//   //   const price = Number(item.price || 0);
//   //   return sum + qty * price;
//   // }, 0);

//   const totalAmount = poItems?.reduce((sum, item) => {
//     const qty = Number(item?.invoiceQty ?? 0);
//     const price = Number(item?.price ?? 0);
//     return sum + qty * price;
//   }, 0);

//   // 2️⃣ Discount Amount
//   let discountAmount = 0;

//   if (discountType == "Percentage") {
//     discountAmount = (totalAmount * Number(discountValue || 0)) / 100;
//   }
//   else if (discountType == "Flat") {
//     discountAmount = Number(discountValue || 0);
//   }
//   const result = poItems?.filter(i => i.styleId)?.reduce(
//     (acc, item) => {
//       const amount = item.invoiceQty * item.price;
//       const tax = item?.Hsn?.tax
//       const halfGst = tax / 2;


//       console.log(tax, "tax", amount)

//       const cgstAmount = amount * (halfGst / 100);
//       const sgstAmount = amount * (halfGst / 100);
//       const itemTax = cgstAmount + sgstAmount;



//       // acc.items.push({
//       //   ...item,
//       //   amount,
//       //   cgstRate: halfGst,
//       //   sgstRate: halfGst,
//       //   cgstAmount,
//       //   sgstAmount,
//       //   itemTax
//       // });

//       acc.totalCgst += cgstAmount;
//       acc.totalSgst += sgstAmount;
//       acc.overallTax += itemTax;
//       acc.subTotal += amount;

//       return acc;
//     },
//     {
//       // items: [],
//       totalCgst: 0,
//       totalSgst: 0,
//       overallTax: 0,
//       subTotal: 0
//     }
//   );


//   console.log(result, "result");
//   console.log(gstSummary, "gstSummary")
//   const netAmount = Math.max(totalAmount - discountAmount, 0) + (parseFloat(result?.totalSgst) + parseFloat(result?.totalCgst))
//   const roundedNetAmount = Math.round(netAmount);
//   const roundOff = Number((roundedNetAmount - netAmount).toFixed(2));
//   const overallAmount = parseFloat(parseFloat(netAmount) + parseFloat(roundOff)).toFixed(2)


//   console.log(overallAmount, "overallAmount", discountAmount)


//   const chunkArrayVariable = (arr, firstPageSize, otherPageSize) => {
//     console.log(arr, "arrarrarrarrarr");

//     if (!arr || arr.length === 0) return [];

//     const chunks = [];
//     let startIndex = 0;

//     // First page
//     const firstChunk = arr.slice(0, firstPageSize);
//     if (firstChunk.length > 0) {
//       chunks.push(firstChunk);
//       startIndex = firstPageSize;
//     }

//     // Remaining pages
//     while (startIndex < arr.length) {
//       chunks.push(arr.slice(startIndex, startIndex + otherPageSize));
//       startIndex += otherPageSize;
//     }

//     return chunks;
//   };
//   const chunks = chunkArrayVariable(filledPoItems || [], 10, 18);

//   console.log(chunks, "chunks");

//   if (isTaxHookDetailsLoading) return <Loader />

//   const labelStyle = {
//     width: 90,
//     fontSize: 8,
//     padding: 4,
//     fontWeight: "bold",
//     backgroundColor: "#f0f4ff",
//     borderRight: "1 solid #9ca3af",
//   };

//   const valueStyle = {
//     flex: 1,
//     fontSize: 8,
//     padding: 4,
//     textAlign: "left",
//     flexWrap: "wrap",
//   };

//   return (
//     <Document>
//       <Page size="A4" style={styles.borderBox}>
//         <View style={styles.page}>
//           <Text style={styles.greenTitle}>TAX INVOICE</Text>

//           <View style={styles.header}>

//             <View style={{
//               fontSize: 10,
//               // color: "#1D3A76",
//               fontWeight: "bold",
//               marginBottom: 4,
//               marginTop: 4,
//               flexDirection: 'row',
//               width: '52%',
//             }}>
//               <Image source={MsExports} style={styles.logo} />
//               <View style={{ width: 125, flexWrap: 'wrap' }}>

//                 <Text
//                   style={{
//                     fontSize: 16,
//                     fontWeight: "extrabold",
//                     paddingVertical: 3,
//                     paddingHorizontal: 6,
//                     marginBottom: 4,
//                     marginTop: 10,
//                     textAlign: "left",
//                     color: "#000000"

//                   }}
//                 >
//                   {branchData?.branchName}
//                 </Text>



//                 <Text style={{
//                   fontSize: 9,
//                   marginBottom: 1,
//                   textAlign: "left",
//                   marginRight: 4,
//                   width: 170
//                 }}>{branchData?.address}</Text>

//                 <View style={{ flexDirection: 'row' }}>
//                   <Text style={[styles.companyText, { width: 40 }]}>Mobile</Text>
//                   <Text style={styles.companyText}>: {branchData?.contactMobile}</Text>
//                 </View>

//                 <View style={{ flexDirection: 'row' }}>
//                   <Text style={[styles.companyText, { width: 40 }]}>Email</Text>
//                   <Text style={styles.companyText}>: {branchData?.contactEmail}</Text>
//                 </View>

//                 <View style={{ flexDirection: 'row' }}>
//                   <Text style={[styles.companyText, { width: 40 }]}>GST No</Text>
//                   <Text style={styles.companyText}>: 33ALNPA8871B1Z9</Text>
//                 </View>
//               </View>
//             </View>


//             {/* <View style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
//               <Text
//                 style={{
//                   fontSize: 20,
//                   color: "#1D3A76",
//                   fontWeight: "bold",
//                   marginBottom: 4,
//                   marginTop: 10,
//                   textAlign: "center",
//                 }}
//               >
//                 {branchData.branchName}
//               </Text>
//             </View> */}

//             <View >
//               <View style={{ alignItems: "flex-end", marginTop: 15, marginBottom: 3 }}>
//                 <View style={{}}>
//                   <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                     <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>DATE</Text>
//                     <View style={styles.valueContainer}>
//                       <Text style={styles.colon}>:</Text>
//                       <Text style={styles.ValueText}>{getDateFromDateTimeToDisplay(poDate)}</Text>
//                     </View>
//                   </View>

//                   <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                     <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>INVOICE NO</Text>
//                     <View style={styles.valueContainer}>
//                       <Text style={styles.colon}>:</Text>
//                       <Text style={styles.ValueText}>{docId}</Text>
//                     </View>                  </View>

//                   <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                     <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>DELIVERY NOTE NO</Text>
//                     <View style={styles.valueContainer}>
//                       <Text style={styles.colon}>:</Text>
//                       <Text style={styles.ValueText}>NA</Text>
//                     </View>                  </View>
//                   <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                     <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>MODE OF TRANSPORT</Text>
//                     <View style={styles.valueContainer}>
//                       <Text style={styles.colon}>:</Text>
//                       <Text style={styles.ValueText}> {transportMode || "NA"}  </Text>
//                     </View>                  </View>
//                   <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                     <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>TRANSPORTER</Text>
//                     <View style={styles.valueContainer}>
//                       <Text style={styles.colon}>:</Text>
//                       <Text style={styles.ValueText}>{transporter || "NA"}</Text>
//                     </View>                  </View>
//                   <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                     <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>VEHICLE NO</Text>
//                     <View style={styles.valueContainer}>
//                       <Text style={styles.colon}>:</Text>
//                       <Text style={styles.ValueText}>{vehicleNo || "NA"}  </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>




//             </View>

//           </View>

//           <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
//             {/* SUPPLIER DETAILS */}
//             <View style={{ flex: 1 }}>
//               <Text style={styles.sectionTitle}>Bill To :</Text>
//               <View style={styles.boxContent}>

//                 <View style={{
//                   flexDirection: "row",

//                 }}>
//                   <Text style={{
//                     marginTop: 1
//                   }} >M/s</Text>

//                   <Text style={{
//                     fontWeight: "bold",
//                     paddingHorizontal: 2,
//                     marginBottom: 4,
//                     color: "#000",
//                     fontSize: 10
//                   }}>
//                     {supplierDetails?.name}
//                   </Text>
//                 </View>



//                 <View style={{
//                   paddingLeft: 7,
//                   width: 200,
//                 }}>
//                   <Text style={{
//                     fontSize: 9,
//                     textTransform: 'uppercase',
//                     lineHeight: 1.2,
//                     textAlign: 'left',
//                   }}>
//                     {supplierDetails?.address}
//                   </Text>
//                 </View>


//                 <View style={{ flexDirection: "row", marginTop: 4, paddingLeft: 7, }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.contactMobile}</Text>
//                 </View>

//                 {/* <View style={{ flexDirection: "row" }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>PAN No</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.panNo}</Text>
//                 </View> */}

//                 <View style={{ flexDirection: "row", paddingLeft: 7, }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
//                 </View>

//                 <View style={{ flexDirection: "row", paddingLeft: 7, }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.email}</Text>
//                 </View>
//               </View>
//             </View>

//             {/* DELIVERY TO */}
//             <View style={{ flex: 1 }}>
//               <Text style={styles.sectionTitle}>Ship To :</Text>
//               <View style={styles.boxContent}>

//                 <View style={{
//                   flexDirection: "row",

//                 }}>
//                   <Text style={{
//                     marginTop: 1
//                   }} >M/s</Text>

//                   <Text style={{
//                     fontWeight: "bold",
//                     paddingHorizontal: 2,
//                     marginBottom: 4,
//                     color: "#000",
//                     fontSize: 10
//                   }}>
//                     {supplierDetails?.name}
//                   </Text>
//                 </View>



//                 <View style={{
//                   paddingLeft: 7,
//                   width: 200,
//                 }}>
//                   <Text style={{
//                     fontSize: 9,
//                     textTransform: 'uppercase',
//                     lineHeight: 1.2,
//                     textAlign: 'left',
//                   }}>
//                     {supplierDetails?.address}
//                   </Text>
//                 </View>


//                 <View style={{ flexDirection: "row", marginTop: 4, paddingLeft: 7, }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.contactMobile}</Text>
//                 </View>

//                 {/* <View style={{ flexDirection: "row" }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>PAN No</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.panNo}</Text>
//                 </View> */}

//                 <View style={{ flexDirection: "row", paddingLeft: 7, }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
//                 </View>

//                 <View style={{ flexDirection: "row", paddingLeft: 7, }}>
//                   <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
//                   <Text style={styles.companyText}>: {supplierDetails?.email}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>



//           <View style={styles.tableHeader}>
//             <Text style={[styles.th, { flex: 1 }]}>S.No</Text>
//             <Text style={[styles.th, { flex: 5 }]}>Style No</Text>
//             <Text style={[styles.th, { flex: 4 }]}>Item</Text>
//             <Text style={[styles.th, { flex: 4 }]}>Color</Text>
//             <Text style={[styles.th, { flex: 1 }]}>Hsn</Text>

//             <Text style={[styles.th, { flex: 1 }]}>Uom</Text>
//             <Text style={[styles.th, { flex: 2 }]}>Qty</Text>
//             <Text style={[styles.th, { flex: 2 }]}>Price</Text>
//             <Text style={[styles.th, { flex: 2.5 }]}>Amount</Text>
//           </View>


//           {chunks?.map((chunck, index) => (

//             chunck?.map((row, index) => (

//               <View key={index} style={{ flexDirection: "row", backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F4EEE9", }}>
//                 <Text style={[styles.td, { flex: 1 }]}>{index + 1}</Text>
//                 <Text style={[styles.td, { flex: 5, textAlign: "left" }]}>
//                   {row?.Style?.name}
//                 </Text>
//                 <Text style={[styles.td, { flex: 4, textAlign: "left" }]}>
//                   {row?.StyleItem?.name}
//                 </Text>
//                 <Text style={[styles.td, { flex: 4, textAlign: "left" }]}>
//                   {row?.Color?.name}
//                 </Text>
//                 <Text style={[styles.td, { flex: 1, textAlign: "center" }]}>
//                   {row?.Hsn?.name}
//                 </Text>


//                 <Text style={[styles.td, { flex: 1, textAlign: "left" }]}>
//                   {row?.Uom?.name}
//                 </Text>
//                 <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
//                   {row?.invoiceQty ? (Number(row?.invoiceQty)).toFixed(3) : ""}
//                 </Text>

//                 <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
//                   {row?.price ? (Number(row?.price)).toFixed(2) : ""}
//                 </Text>

//                 <Text style={[styles.td, { flex: 2.5, textAlign: "right" }]}>
//                   {row?.invoiceQty * row?.price ? (
//                     (Number(row?.invoiceQty) || 0) *
//                     (Number(row?.price) || 0)
//                   ).toFixed(2) : ''}
//                 </Text>


//               </View>
//                 ))
//             ))}
//           {/* {kldklsf} */}
//           <View style={{
//             flexDirection: "row", backgroundColor: "#946657",
//           }}>
//             <Text style={[{
//               flex: 1, padding: 3,
//             }]}></Text>

//             <Text style={[{
//               flex: 5, padding: 3,
//             }]}>
//             </Text>

//             <Text style={[{
//               flex: 4, padding: 3,
//               fontSize: 8,
//               color: "white"
//             }]}>
//               Total

//             </Text>
//             <Text style={[{
//               flex: 4, padding: 3,
//             }]}>
//             </Text>
//             <Text style={[{
//               flex: 1, padding: 3,
//             }]}>
//             </Text>


//             <Text style={[{
//               flex: 1, borderRight: "1 solid ", padding: 3, borderRightColor: BORDER_GREY
//             }]}>

//             </Text>
//             <Text style={[{
//               flex: 2, textAlign: "right", fontSize: 8, borderRight: "1 solid ", padding: 3, color: "white", borderRightColor: BORDER_GREY
//             }]}>
//               {parseFloat(totalQty).toFixed(2)}
//             </Text>

//             <Text style={[{
//               flex: 2, borderRight: "1 solid ", padding: 3, borderRightColor: BORDER_GREY
//             }]}>
//             </Text>

//             <Text style={[{
//               flex: 2.5, textAlign: "right", fontSize: 8, borderRight: "1 solid ", padding: 3, color: "white", borderRightColor: BORDER_GREY
//             }]}>
//               {parseFloat(totalAmount).toFixed(2)}
//             </Text>


//           </View>





//           <View
//             style={{
//               alignSelf: "flex-end",
//               borderWidth: 1,
//               // marginTop: 4,
//               width: 180,
//             }}
//           >
//             <View
//               style={{
//                 flexDirection: "row",
//                 borderTop: "1 solid #9ca3af",
//                 borderRight: "1 solid #9ca3af",
//               }}
//             >
//               <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>
//                 Taxable Amount
//               </Text>
//               <Text
//                 style={{
//                   flex: 1,
//                   textAlign: "right",
//                   fontSize: 8,
//                   padding: 3,
//                 }}
//               >
//                 {parseFloat(totalAmount).toFixed(3)}

//               </Text>
//             </View>
//             {gstArray?.map((item, index) => (
//               <React.Fragment key={index}>
//                 {/* CGST Row */}
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     borderTopWidth: 1,
//                     borderTopColor: "#9ca3af",
//                     borderRightWidth: 1,
//                     borderRightColor: "#9ca3af",
//                   }}
//                 >
//                   <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>
//                     CGST @{item.cgstRate}%
//                   </Text>
//                   <Text
//                     style={{
//                       flex: 1,
//                       textAlign: "right",
//                       fontSize: 8,
//                       padding: 3,
//                     }}
//                   >
//                     {item.cgstAmount.toFixed(2)}
//                   </Text>
//                 </View>

//                 {/* SGST Row */}
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     borderTopWidth: 1,
//                     borderTopColor: "#9ca3af",
//                     borderRightWidth: 1,
//                     borderRightColor: "#9ca3af",
//                   }}
//                 >
//                   <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>
//                     SGST @{item.sgstRate}%
//                   </Text>
//                   <Text
//                     style={{
//                       flex: 1,
//                       textAlign: "right",
//                       fontSize: 8,
//                       padding: 3,
//                     }}
//                   >
//                     {item.sgstAmount.toFixed(2)}
//                   </Text>
//                 </View>
//               </React.Fragment>
//             ))}



//             <View
//               style={{
//                 flexDirection: "row",
//                 borderTop: "1 solid #9ca3af",
//                 borderRight: "1 solid #9ca3af",
//               }}
//             >
//               <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>
//                 IGST @%
//               </Text>
//               <Text
//                 style={{
//                   flex: 1,
//                   textAlign: "right",
//                   fontSize: 8,
//                   padding: 3,
//                 }}
//               >
//                 {/* {parseFloat(igstAmount).toFixed(3)} */}

//               </Text>
//             </View>
//             <View
//               style={{
//                 flexDirection: "row",
//                 borderTop: "1 solid #9ca3af",
//                 borderRight: "1 solid #9ca3af",
//               }}
//             >
//               <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>
//                 Round Off
//               </Text>
//               <Text
//                 style={{
//                   flex: 1,
//                   textAlign: "right",
//                   fontSize: 8,
//                   padding: 3,
//                 }}
//               >
//                 {parseFloat(roundOff).toFixed(2)}

//               </Text>
//             </View>

//             <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", backgroundColor: "#946657", color: "#FFFF", padding: 2 }}>
//               <Text style={{ flex: 1, fontSize: 10, paddingTop: 3 }}>Net Amount in Rs</Text>
//               <Text style={{ flex: 1, textAlign: "right", fontSize: 10, padding: 3 }}>
//                 {parseFloat(overallAmount).toFixed(2)}
//               </Text>
//             </View>
//           </View>


//           <View >

//             <View
//               style={{
//                 marginTop: 6,
//                 borderWidth: 1,
//                 borderRadius: 4,
//                 overflow: "hidden",
//               }}
//             >
//               <View
//                 style={{
//                   borderBottom: "1 solid #9ca3af",
//                   backgroundColor: "#946657",
//                   paddingVertical: 5,
//                   paddingHorizontal: 6,
//                   marginBottom: 4
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontSize: 9,
//                     fontWeight: "bold",
//                     color: "#FFFFFF",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   Amount in Words: Rs.{" "}

//                   {/* {numberToText.convertToText(roundedNetAmount || 0, {
//                     language: "en-in",
//                     separator: "",
//                   })} */}
//                   {/* {numberToWords.toWords(overallAmount ? overallAmount : 0)} */}
//                   {numberToWords.toWords(
//                     Number.isFinite(overallAmount) ? Math.round(overallAmount) : 0
//                   )
//                   }
//                   {" "}
//                   Only
//                 </Text>
//               </View>
//               <View
//                 style={{
//                   flexDirection: "row",
//                   borderTop: "1 solid #9ca3af",
//                   borderLeft: "1 solid #9ca3af",
//                   borderRight: "1 solid #9ca3af",
//                 }}
//               >
//                 {/* LEFT : BANK DETAILS */}
//                 <View
//                   style={{
//                     width: 250,
//                     borderRight: "1 solid #9ca3af",
//                   }}
//                 >
//                   <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
//                     <Text style={labelStyle}>Bank Name</Text>
//                     <Text style={valueStyle}>IDBI BANK</Text>
//                   </View>

//                   <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
//                     <Text style={labelStyle}>A/C No</Text>
//                     <Text style={valueStyle}>1622651100000897</Text>
//                   </View>

//                   <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
//                     <Text style={labelStyle}>Branch</Text>
//                     <Text style={valueStyle}>
//                       Palladam Road Veerapandi Privu, Tirupur-5
//                     </Text>
//                   </View>

//                   <View style={{ flexDirection: "row" }}>
//                     <Text style={labelStyle}>IFSC Code</Text>
//                     <Text style={valueStyle}>IBKL0001622</Text>
//                   </View>
//                 </View>

//                 {/* RIGHT : TERMS */}
//                 <View
//                   style={{
//                     flex: 1,
//                     padding: 6,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 8,
//                       fontWeight: "bold",
//                       color: "#946657",
//                       marginBottom: 2,
//                     }}
//                   >
//                     Terms & Conditions:
//                   </Text>

//                   <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
//                     {termsAndCondition || "—"}
//                   </Text>
//                 </View>
//               </View>




//               {/* 
//               <View
//                 style={{
//                   flexDirection: "row",
//                   borderTop: "1 solid #9ca3af",
//                   height: 60,
//                 }}
//               >
//                 <View
//                   style={{
//                     flex: 0.3,
//                     borderRight: "1 solid #9ca3af",
//                     backgroundColor: "#f0f4ff",
//                     paddingVertical: 5,
//                     paddingHorizontal: 6,
//                     minHeight: 60,
//                     width: 40

//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 8,
//                       fontWeight: "bold",
//                       color: "#946657",
//                       flexWrap: "wrap"
//                     }}
//                   >

//                   </Text>
//                   <Text
//                     style={{
//                       fontSize: 8,
//                       fontWeight: "bold",
//                       color: "#946657",
//                       flexWrap: "wrap"
//                     }}
//                   >
//                     Remarks:
//                   </Text>
//                   <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
//                     {remarks || "—"}
//                   </Text>
//                 </View>


//               </View> */}



//             </View>
//             <View
//               style={{
//                 backgroundColor: "#f0f4ff",
//                 paddingVertical: 6,
//                 paddingHorizontal: 8,
//                 borderWidth: 1,
//               }}
//             >
//               <Text
//                 style={{
//                   fontSize: 8,
//                   lineHeight: 1.4,
//                   textAlign: "left",
//                   flexWrap: "wrap",
//                 }}
//               >
//                 Certified that the above particulars are true and correct and are issued
//                 under our authority.
//               </Text>
//             </View>


//           </View>









//           <View style={{ marginTop: 30 }}>
//             <Text
//               style={{ fontSize: 8, textAlign: "right", fontWeight: "bold" }}
//             >
//               For {branchData.branchName}
//             </Text>
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 marginTop: 20,
//               }}
//             >
//               {["Prepared By", "Verified By", "Received By", "Approved By"].map(
//                 (role) => (
//                   <Text
//                     key={role}
//                     style={{
//                       fontSize: 8,
//                       textAlign: "center",
//                       fontWeight: "bold",
//                       flex: 1,
//                     }}
//                   >
//                     {role}
//                   </Text>
//                 )
//               )}
//             </View>
//           </View>







//         </View>
//         <View style={{
//           marginTop: 20, textAlign: "center", fontSize: 8,

//         }}>
//           <Text
//             render={({ pageNumber, totalPages }) =>
//               `Page ${pageNumber} / ${totalPages}`
//             }
//           />
//         </View>



//       </Page>
//     </Document >
//   );
// };

// export default DeliveryInvoice;

// import {
//   Document,
//   Page,
//   View,
//   Text,
//   Image,
//   Font,
//   StyleSheet,
// } from "@react-pdf/renderer";
// import tw from "../../../../Utils/tailwind-react-pdf";
// import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
// import TaxDetails from "./TaxDetails";
// import { Loader } from "../../../../Basic/components";
// import numberToText from "number-to-text";
// import MsExports from "../../../../../src/assets/MSexports.png";
// import numberToWords from "number-to-words";
// import React from "react";

// // Font registration
// Font.register({
//   family: "Roboto",
//   src: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,600;1,400;1,600&display=swap",
// });

// const BORDER_GREY = "#9ca3af";
// const ZEBRA_BROWN = "#F4EEE9";

// const styles = StyleSheet.create({
//   page: {
//     fontSize: 8,
//     padding: 0,
//     border: "1 solid #000",
//   },
//   pageContainer: {
//     padding: 0,
//     margin: 0,
//     position: 'relative',
//   },
//   borderBox: {
//     borderWidth: 1,
//     minHeight: "100%", // This will take the entire page
//     padding: 8,
//   },
//   pageContent: {
//     flex: 1,
//   },
//   // borderBox: { border: "1 solid black", margin: 0, padding: 8 },
//   header: {
//     alignItems: "center",
//     textAlign: "center",
//     marginBottom: 7,
//     flexDirection: "row",
//     padding: 7,
//     height: 130
//   },
//   logo: {
//     width: 80,
//     height: 80,
//     resizeMode: 'contain',
//     marginRight: 12,
//   },
//   companyText: {
//     fontSize: 9,
//     marginBottom: 1,
//     textAlign: "left",
//     marginRight: 4,
//   },
//   ValueText: {
//     fontSize: 9,
//     marginBottom: 1,
//     paddingLeft: 4,
//   },
//   greenTitle: {
//     textAlign: "center",
//     fontSize: 15,
//     color: "#FFFF",
//     backgroundColor: "#946657",
//     paddingVertical: 4,
//     fontWeight: "500",
//   },
//   sectionTitle: {
//     fontSize: 10,
//     fontWeight: "bold",
//     color: "#FFFF",
//     backgroundColor: "#946657",
//     padding: 6,
//     marginBottom: 2
//   },
//   valueContainer: {
//     flexDirection: 'row',
//     paddingLeft: 6,
//   },
//   colon: {
//     fontSize: 9,
//   },
//   tableHeader: {
//     flexDirection: "row",
//     borderTop: "1 solid #000",
//     borderBottom: "1 solid #000",
//     marginTop: 6,
//     backgroundColor: "#946657",
//     padding: 3,
//     color: "#FFFF"
//   },
//   th: {
//     flex: 1,
//     fontSize: 8,
//     fontWeight: "bold",
//     textAlign: "center",
//     padding: 3,
//   },
//   td: {
//     flex: 1,
//     fontSize: 8,
//     textAlign: "center",
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderRightColor: BORDER_GREY,
//     borderBottomColor: BORDER_GREY,
//     padding: 3,
//   },
//   taxBox: {
//     width: 180,
//     border: "1 solid #000",
//     alignSelf: "flex-end",
//     marginTop: 4,
//   },
//   pageNumber: {
//     position: "absolute",
//     bottom: 10,
//     right: 30,
//     fontSize: 7,
//     color: "#555",
//   },

// });

// const DeliveryInvoice = ({
//   isTaxHookDetailsLoading,
//   poDate,
//   supplierDetails,
//   poItems,
//   discountType,
//   discountValue,
//   remarks,
//   branchData,
//   termsAndCondition,
//   tax,
//   colorList,
//   uomList,
//   yarnList,
//   sizeList,
//   term,
//   termsData,
//   useTaxDetailsHook,
//   docId,
//   totalQty,
//   transportMode,
//   transporter,
//   vehicleNo
// }) => {
//   // Calculate GST summary
//   const gstSummary = {};
//   poItems?.filter(i => i.styleId)?.forEach(item => {
//     const amount = item.invoiceQty * item.price;
//     const tax = item?.Hsn?.tax;
//     const halfGst = tax / 2;

//     if (!gstSummary[tax]) {
//       gstSummary[tax] = {
//         cgstRate: halfGst,
//         sgstRate: halfGst,
//         cgstAmount: 0,
//         sgstAmount: 0
//       };
//     }

//     gstSummary[tax].cgstAmount += amount * (halfGst / 100);
//     gstSummary[tax].sgstAmount += amount * (halfGst / 100);
//   });

//   const gstArray = Object.keys(gstSummary).map(tax => {
//     return {
//       taxRate: Number(tax),
//       cgstRate: gstSummary[tax].cgstRate,
//       sgstRate: gstSummary[tax].sgstRate,
//       cgstAmount: gstSummary[tax].cgstAmount,
//       sgstAmount: gstSummary[tax].sgstAmount,
//       totalTax: gstSummary[tax].cgstAmount + gstSummary[tax].sgstAmount
//     };
//   });

//   // Group PO items
//   const groupedPoItems = Object.values(
//     poItems.reduce((acc, item) => {
//       const key = [
//         item?.styleId,
//         item?.styleItemId,
//         item?.colorId,
//         item?.uomId,
//         item?.price,
//       ].join("_");

//       if (!acc[key]) {
//         acc[key] = {
//           ...item,
//           invoiceQty: Number(item.invoiceQty) || 0,
//         };
//       } else {
//         acc[key].invoiceQty += Number(item.invoiceQty) || 0;
//       }

//       return acc;
//     }, {})
//   );

//   const totalAmount = poItems?.reduce((sum, item) => {
//     const qty = Number(item?.invoiceQty ?? 0);
//     const price = Number(item?.price ?? 0);
//     return sum + qty * price;
//   }, 0);

//   // Calculate discount
//   let discountAmount = 0;
//   if (discountType == "Percentage") {
//     discountAmount = (totalAmount * Number(discountValue || 0)) / 100;
//   } else if (discountType == "Flat") {
//     discountAmount = Number(discountValue || 0);
//   }

//   // Calculate tax totals
//   const result = poItems?.filter(i => i.styleId)?.reduce(
//     (acc, item) => {
//       const amount = item.invoiceQty * item.price;
//       const tax = item?.Hsn?.tax;
//       const halfGst = tax / 2;

//       const cgstAmount = amount * (halfGst / 100);
//       const sgstAmount = amount * (halfGst / 100);
//       const itemTax = cgstAmount + sgstAmount;

//       acc.totalCgst += cgstAmount;
//       acc.totalSgst += sgstAmount;
//       acc.overallTax += itemTax;
//       acc.subTotal += amount;

//       return acc;
//     },
//     {
//       totalCgst: 0,
//       totalSgst: 0,
//       overallTax: 0,
//       subTotal: 0
//     }
//   );

//   const netAmount = Math.max(totalAmount - discountAmount, 0) + (parseFloat(result?.totalSgst) + parseFloat(result?.totalCgst));
//   const roundedNetAmount = Math.round(netAmount);
//   const roundOff = Number((roundedNetAmount - netAmount).toFixed(2));
//   const overallAmount = parseFloat(parseFloat(netAmount) + parseFloat(roundOff)).toFixed(2);

//   // Chunk array for pagination
//   const chunkArrayVariable = (arr, firstPageSize, otherPageSize) => {
//     if (!arr || arr.length === 0) return [];

//     const chunks = [];
//     let startIndex = 0;

//     // First page
//     const firstChunk = arr.slice(0, firstPageSize);
//     if (firstChunk.length > 0) {
//       chunks.push(firstChunk);
//       startIndex = firstPageSize;
//     }

//     // Remaining pages
//     while (startIndex < arr.length) {
//       chunks.push(arr.slice(startIndex, startIndex + otherPageSize));
//       startIndex += otherPageSize;
//     }

//     return chunks;
//   };

//   const allRows = [...groupedPoItems];
//   const chunks = chunkArrayVariable(allRows || [], 20, 25);

//   if (isTaxHookDetailsLoading) return <Loader />;

//   // Header Component (reusable)
//   const Header = () => (
//     <>
//       <Text style={styles.greenTitle}>TAX INVOICE</Text>
//       <View style={styles.header}>
//         <View style={{
//           fontSize: 10,
//           fontWeight: "bold",
//           marginBottom: 4,
//           marginTop: 4,
//           flexDirection: 'row',
//           width: '52%',
//         }}>
//           <Image source={MsExports} style={styles.logo} />
//           <View style={{ width: 125, flexWrap: 'wrap' }}>
//             <Text style={{
//               fontSize: 16,
//               fontWeight: "extrabold",
//               paddingVertical: 3,
//               paddingHorizontal: 6,
//               marginBottom: 4,
//               marginTop: 10,
//               textAlign: "left",
//               color: "#000000"
//             }}>
//               {branchData?.branchName}
//             </Text>
//             <Text style={{
//               fontSize: 9,
//               marginBottom: 1,
//               textAlign: "left",
//               marginRight: 4,
//               width: 170
//             }}>{branchData?.address}</Text>

//             <View style={{ flexDirection: 'row' }}>
//               <Text style={[styles.companyText, { width: 40 }]}>Mobile</Text>
//               <Text style={styles.companyText}>: {branchData?.contactMobile}</Text>
//             </View>
//             <View style={{ flexDirection: 'row' }}>
//               <Text style={[styles.companyText, { width: 40 }]}>Email</Text>
//               <Text style={styles.companyText}>: {branchData?.contactEmail}</Text>
//             </View>
//             <View style={{ flexDirection: 'row' }}>
//               <Text style={[styles.companyText, { width: 40 }]}>GST No</Text>
//               <Text style={styles.companyText}>: 33ALNPA8871B1Z9</Text>
//             </View>
//           </View>
//         </View>

//         <View>
//           <View style={{ alignItems: "flex-end", marginTop: 15, marginBottom: 3 }}>
//             <View>
//               <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                 <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>DATE</Text>
//                 <View style={styles.valueContainer}>
//                   <Text style={styles.colon}>:</Text>
//                   <Text style={styles.ValueText}>{getDateFromDateTimeToDisplay(poDate)}</Text>
//                 </View>
//               </View>
//               <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                 <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>INVOICE NO</Text>
//                 <View style={styles.valueContainer}>
//                   <Text style={styles.colon}>:</Text>
//                   <Text style={styles.ValueText}>{docId}</Text>
//                 </View>
//               </View>
//               <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                 <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>DELIVERY NOTE NO</Text>
//                 <View style={styles.valueContainer}>
//                   <Text style={styles.colon}>:</Text>
//                   <Text style={styles.ValueText}>NA</Text>
//                 </View>
//               </View>
//               <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                 <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>MODE OF TRANSPORT</Text>
//                 <View style={styles.valueContainer}>
//                   <Text style={styles.colon}>:</Text>
//                   <Text style={styles.ValueText}> {transportMode || "NA"}</Text>
//                 </View>
//               </View>
//               <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                 <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>TRANSPORTER</Text>
//                 <View style={styles.valueContainer}>
//                   <Text style={styles.colon}>:</Text>
//                   <Text style={styles.ValueText}>{transporter || "NA"}</Text>
//                 </View>
//               </View>
//               <View style={{ flexDirection: "row", marginBottom: 3 }}>
//                 <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>VEHICLE NO</Text>
//                 <View style={styles.valueContainer}>
//                   <Text style={styles.colon}>:</Text>
//                   <Text style={styles.ValueText}>{vehicleNo || "NA"}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </View>
//       </View>

//       <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
//         {/* Bill To */}
//         <View style={{ flex: 1 }}>
//           <Text style={styles.sectionTitle}>Bill To :</Text>
//           <View style={{ padding: 6 }}>
//             <View style={{ flexDirection: "row" }}>
//               <Text style={{ marginTop: 1 }}>M/s</Text>
//               <Text style={{
//                 fontWeight: "bold",
//                 paddingHorizontal: 2,
//                 marginBottom: 4,
//                 color: "#000",
//                 fontSize: 10
//               }}>
//                 {supplierDetails?.name}
//               </Text>
//             </View>
//             <View style={{ paddingLeft: 7, width: 200 }}>
//               <Text style={{
//                 fontSize: 9,
//                 textTransform: 'uppercase',
//                 lineHeight: 1.2,
//                 textAlign: 'left',
//               }}>
//                 {supplierDetails?.address}
//               </Text>
//             </View>
//             <View style={{ flexDirection: "row", marginTop: 4, paddingLeft: 7 }}>
//               <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
//               <Text style={styles.companyText}>: {supplierDetails?.contactMobile}</Text>
//             </View>
//             <View style={{ flexDirection: "row", paddingLeft: 7 }}>
//               <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
//               <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
//             </View>
//             <View style={{ flexDirection: "row", paddingLeft: 7 }}>
//               <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
//               <Text style={styles.companyText}>: {supplierDetails?.email}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Ship To */}
//         <View style={{ flex: 1 }}>
//           <Text style={styles.sectionTitle}>Ship To :</Text>
//           <View style={{ padding: 6 }}>
//             <View style={{ flexDirection: "row" }}>
//               <Text style={{ marginTop: 1 }}>M/s</Text>
//               <Text style={{
//                 fontWeight: "bold",
//                 paddingHorizontal: 2,
//                 marginBottom: 4,
//                 color: "#000",
//                 fontSize: 10
//               }}>
//                 {supplierDetails?.name}
//               </Text>
//             </View>
//             <View style={{ paddingLeft: 7, width: 200 }}>
//               <Text style={{
//                 fontSize: 9,
//                 textTransform: 'uppercase',
//                 lineHeight: 1.2,
//                 textAlign: 'left',
//               }}>
//                 {supplierDetails?.address}
//               </Text>
//             </View>
//             <View style={{ flexDirection: "row", marginTop: 4, paddingLeft: 7 }}>
//               <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
//               <Text style={styles.companyText}>: {supplierDetails?.contactMobile}</Text>
//             </View>
//             <View style={{ flexDirection: "row", paddingLeft: 7 }}>
//               <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
//               <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
//             </View>
//             <View style={{ flexDirection: "row", paddingLeft: 7 }}>
//               <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
//               <Text style={styles.companyText}>: {supplierDetails?.email}</Text>
//             </View>
//           </View>
//         </View>
//       </View>
//     </>
//   );

//   // Table Header Component
//   const TableHeader = () => (
//     <View style={styles.tableHeader}>
//       <Text style={[styles.th, { flex: 1 }]}>S.No</Text>
//       <Text style={[styles.th, { flex: 5 }]}>Style No</Text>
//       <Text style={[styles.th, { flex: 4 }]}>Item</Text>
//       <Text style={[styles.th, { flex: 4 }]}>Color</Text>
//       <Text style={[styles.th, { flex: 1 }]}>Hsn</Text>
//       <Text style={[styles.th, { flex: 1 }]}>Uom</Text>
//       <Text style={[styles.th, { flex: 2 }]}>Qty</Text>
//       <Text style={[styles.th, { flex: 2 }]}>Price</Text>
//       <Text style={[styles.th, { flex: 2.5 }]}>Amount</Text>
//     </View>
//   );

//   // Table Row Component
//   const TableRow = ({ row, index, absoluteIndex }) => (
//     <View key={`row-${absoluteIndex}`} style={{
//       flexDirection: "row",
//       backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F4EEE9"
//     }}>
//       <Text style={[styles.td, { flex: 1 }]}>{absoluteIndex + 1}</Text>
//       <Text style={[styles.td, { flex: 5, textAlign: "left" }]}>
//         {row?.Style?.name}
//       </Text>
//       <Text style={[styles.td, { flex: 4, textAlign: "left" }]}>
//         {row?.StyleItem?.name}
//       </Text>
//       <Text style={[styles.td, { flex: 4, textAlign: "left" }]}>
//         {row?.Color?.name}
//       </Text>
//       <Text style={[styles.td, { flex: 1, textAlign: "center" }]}>
//         {row?.Hsn?.name}
//       </Text>
//       <Text style={[styles.td, { flex: 1, textAlign: "left" }]}>
//         {row?.Uom?.name}
//       </Text>
//       <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
//         {row?.invoiceQty ? (Number(row?.invoiceQty)).toFixed(3) : ""}
//       </Text>
//       <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
//         {row?.price ? (Number(row?.price)).toFixed(2) : ""}
//       </Text>
//       <Text style={[styles.td, { flex: 2.5, textAlign: "right" }]}>
//         {row?.invoiceQty * row?.price ? (
//           (Number(row?.invoiceQty) || 0) *
//           (Number(row?.price) || 0)
//         ).toFixed(2) : ''}
//       </Text>
//     </View>
//   );

//   // Table Total Row Component
//   const TableTotalRow = () => (
//     <View style={{ flexDirection: "row", backgroundColor: "#946657" }}>
//       <Text style={[{ flex: 1, padding: 3 }]}></Text>
//       <Text style={[{ flex: 5, padding: 3 }]}></Text>
//       <Text style={[{
//         flex: 4,
//         padding: 3,
//         fontSize: 8,
//         color: "white"
//       }]}>
//         Total
//       </Text>
//       <Text style={[{ flex: 4, padding: 3 }]}></Text>
//       <Text style={[{ flex: 1, padding: 3 }]}></Text>
//       <Text style={[{
//         flex: 1,
//         borderRight: "1 solid ",
//         padding: 3,
//         borderRightColor: BORDER_GREY
//       }]}></Text>
//       <Text style={[{
//         flex: 2,
//         textAlign: "right",
//         fontSize: 8,
//         borderRight: "1 solid ",
//         padding: 3,
//         color: "white",
//         borderRightColor: BORDER_GREY
//       }]}>
//         {parseFloat(totalQty).toFixed(2)}
//       </Text>
//       <Text style={[{
//         flex: 2,
//         borderRight: "1 solid ",
//         padding: 3,
//         borderRightColor: BORDER_GREY
//       }]}></Text>
//       <Text style={[{
//         flex: 2.5,
//         textAlign: "right",
//         fontSize: 8,
//         borderRight: "1 solid ",
//         padding: 3,
//         color: "white",
//         borderRightColor: BORDER_GREY
//       }]}>
//         {parseFloat(totalAmount).toFixed(2)}
//       </Text>
//     </View>
//   );

//   // Summary Section Component (for last page)
//   const SummarySection = () => (
//     <>
//       <View style={{ alignSelf: "flex-end", borderWidth: 1,
//         <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", borderRight: "1 solid #9ca3af" }}>
//           <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>Taxable Amount</Text>
//           <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
//             {parseFloat(totalAmount).toFixed(3)}
//           </Text>
//         </View>

//         {gstArray?.map((item, index) => (
//           <React.Fragment key={index}>
//             <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#9ca3af", borderRightWidth: 1, borderRightColor: "#9ca3af" }}>
//               <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>CGST @{item.cgstRate}%</Text>
//               <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
//                 {item.cgstAmount.toFixed(2)}
//               </Text>
//             </View>
//             <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#9ca3af", borderRightWidth: 1, borderRightColor: "#9ca3af" }}>
//               <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>SGST @{item.sgstRate}%</Text>
//               <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
//                 {item.sgstAmount.toFixed(2)}
//               </Text>
//             </View>
//           </React.Fragment>
//         ))}

//         <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", borderRight: "1 solid #9ca3af" }}>
//           <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>IGST @%</Text>
//           <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}></Text>
//         </View>

//         <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", borderRight: "1 solid #9ca3af" }}>
//           <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>Round Off</Text>
//           <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
//             {parseFloat(roundOff).toFixed(2)}
//           </Text>
//         </View>

//         <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", backgroundColor: "#946657", color: "#FFFF", padding: 2 }}>
//           <Text style={{ flex: 1, fontSize: 10, paddingTop: 3 }}>Net Amount in Rs</Text>
//           <Text style={{ flex: 1, textAlign: "right", fontSize: 10, padding: 3 }}>
//             {parseFloat(overallAmount).toFixed(2)}
//           </Text>
//         </View>
//       </View>

//       <View>
//         <View style={{ marginTop: 6, borderWidth: 1,
//           <View style={{ borderBottom: "1 solid #9ca3af", backgroundColor: "#946657", paddingVertical: 5, paddingHorizontal: 6, marginBottom: 4 }}>
//             <Text style={{ fontSize: 9, fontWeight: "bold", color: "#FFFFFF", flexWrap: "wrap" }}>
//               Amount in Words: Rs. {numberToWords.toWords(
//                 Number.isFinite(overallAmount) ? Math.round(overallAmount) : 0
//               )} Only
//             </Text>
//           </View>

//           <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", borderLeft: "1 solid #9ca3af", borderRight: "1 solid #9ca3af" }}>
//             <View style={{ width: 250, borderRight: "1 solid #9ca3af" }}>
//               <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
//                 <Text style={{ width: 90, fontSize: 8, padding: 4, fontWeight: "bold", backgroundColor: "#f0f4ff", borderRight: "1 solid #9ca3af" }}>Bank Name</Text>
//                 <Text style={{ flex: 1, fontSize: 8, padding: 4, textAlign: "left", flexWrap: "wrap" }}>IDBI BANK</Text>
//               </View>
//               <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
//                 <Text style={{ width: 90, fontSize: 8, padding: 4, fontWeight: "bold", backgroundColor: "#f0f4ff", borderRight: "1 solid #9ca3af" }}>A/C No</Text>
//                 <Text style={{ flex: 1, fontSize: 8, padding: 4, textAlign: "left", flexWrap: "wrap" }}>1622651100000897</Text>
//               </View>
//               <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
//                 <Text style={{ width: 90, fontSize: 8, padding: 4, fontWeight: "bold", backgroundColor: "#f0f4ff", borderRight: "1 solid #9ca3af" }}>Branch</Text>
//                 <Text style={{ flex: 1, fontSize: 8, padding: 4, textAlign: "left", flexWrap: "wrap" }}>
//                   Palladam Road Veerapandi Privu, Tirupur-5
//                 </Text>
//               </View>
//               <View style={{ flexDirection: "row" }}>
//                 <Text style={{ width: 90, fontSize: 8, padding: 4, fontWeight: "bold", backgroundColor: "#f0f4ff", borderRight: "1 solid #9ca3af" }}>IFSC Code</Text>
//                 <Text style={{ flex: 1, fontSize: 8, padding: 4, textAlign: "left", flexWrap: "wrap" }}>IBKL0001622</Text>
//               </View>
//             </View>

//             <View style={{ flex: 1, padding: 6 }}>
//               <Text style={{ fontSize: 8, fontWeight: "bold", color: "#946657", marginBottom: 2 }}>
//                 Terms & Conditions:
//               </Text>
//               <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
//                 {termsAndCondition || "—"}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={{ backgroundColor: "#f0f4ff", paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1,
//           <Text style={{ fontSize: 8, lineHeight: 1.4, textAlign: "left", flexWrap: "wrap" }}>
//             Certified that the above particulars are true and correct and are issued under our authority.
//           </Text>
//         </View>
//       </View>

//       <View style={{ marginTop: 30 }}>
//         <Text style={{ fontSize: 8, textAlign: "right", fontWeight: "bold" }}>
//           For {branchData.branchName}
//         </Text>
//         <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
//           {["Prepared By", "Verified By", "Received By", "Approved By"].map((role) => (
//             <Text key={role} style={{ fontSize: 8, textAlign: "center", fontWeight: "bold", flex: 1 }}>
//               {role}
//             </Text>
//           ))}
//         </View>
//       </View>
//     </>
//   );

//   // Calculate starting index for each chunk
//   let globalIndex = 0;

//   return (
//     <Document>
//       {/* Calculate how many rows we have */}
//       {chunks.map((chunk, pageIndex) => {
//         const isLastPage = pageIndex === chunks.length - 1;
//         const isFirstPage = pageIndex === 0;

//         return (
//           <Page key={`page-${pageIndex}`} size="A4" style={styles.pageContainer}>
//             <View style={styles.pageContent}>
//               {/* Only show header on first page */}
//               {isFirstPage && <Header />}

//               {/* Always show table header on each page */}
//               <TableHeader />

//               {/* Table rows for this chunk */}
//               {chunk.map((row, rowIndex) => {
//                 const absoluteIndex = (() => {
//                   let index = rowIndex;
//                   for (let i = 0; i < pageIndex; i++) {
//                     index += chunks[i].length;
//                   }
//                   return index;
//                 })();

//                 return (
//                   <TableRow
//                     key={`row-${pageIndex}-${rowIndex}`}
//                     row={row}
//                     index={rowIndex}
//                     absoluteIndex={absoluteIndex}
//                   />
//                 );
//               })}

//               {/* Only show total row on last page after all rows */}
//               {isLastPage && (
//                 <>
//                   <TableTotalRow />
//                   {/* SummarySection will now be on its own page if needed */}
//                 </>
//               )}
//             </View>
//             <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
//           </Page>
//         );
//       })}

//       {/* Separate page for summary section to prevent wrapping */}
//       <Page size="A4" style={styles.pageContainer}>
//         <View style={styles.pageContent}>
//           <SummarySection />
//         </View>
//         <Text style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
//           fixed
//         />
//       </Page>
//     </Document>
//   );
// };

// export default DeliveryInvoice;

import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
import TaxDetails from "./TaxDetails";
import { Loader } from "../../../../Basic/components";
import numberToText from "number-to-text";
import MsExports from "../../../../../src/assets/MSexports.png";
import numberToWords from "number-to-words";
import React from "react";

// Font registration
Font.register({
  family: "Roboto",
  src: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,600;1,400;1,600&display=swap",
});

const BORDER_GREY = "#9ca3af";
const ZEBRA_BROWN = "#F4EEE9";


const styles = StyleSheet.create({
  page: {
    padding: 10,
  },

  pageBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9ca3af",
    paddingTop: 10,
    paddingBottom: 10,
  },
  borderWrapper: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    minHeight: "100%",
    width: "100%",
    padding: 8,
  },
  header: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 7,
    flexDirection: "row",
    padding: 7,
    height: 130
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 12,
  },
  companyText: {
    fontSize: 9,
    marginBottom: 1,
    textAlign: "left",
    marginRight: 4,
  },
  ValueText: {
    fontSize: 9,
    marginBottom: 1,
    paddingLeft: 4,
  },
  greenTitle: {
    textAlign: "center",
    fontSize: 15,
    color: "#FFFF",
    backgroundColor: "#946657",
    paddingVertical: 4,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFF",
    backgroundColor: "#946657",
    padding: 6,
    marginBottom: 2
  },
  valueContainer: {
    flexDirection: 'row',
    paddingLeft: 6,
  },
  colon: {
    fontSize: 9,
  },
  tableHeader: {
    flexDirection: "row",
    borderTop: "1 solid #000",
    borderBottom: "1 solid #000",
    marginTop: 6,
    backgroundColor: "#946657",
    padding: 3,
    color: "#FFFF"
  },
  th: {
    flex: 1,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    padding: 3,
  },
  td: {
    flex: 1,
    fontSize: 8,
    textAlign: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: BORDER_GREY,
    borderBottomColor: BORDER_GREY,
    padding: 3,
  },
  taxBox: {
    width: 180,
    border: "1 solid #000",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  pageNumber: {
    position: "absolute",
    bottom: 10,
    right: 30,
    fontSize: 7,
    color: "#555",
  },
});


const DeliveryInvoice = ({
  isTaxHookDetailsLoading,
  poDate,
  supplierDetails,
  poItems,
  discountType,
  discountValue,
  remarks,
  branchData,
  termsAndCondition,
  tax,
  colorList,
  uomList,
  yarnList,
  sizeList,
  term,
  termsData,
  useTaxDetailsHook,
  docId,
  totalQty,
  transportMode,
  transporter,
  vehicleNo
}) => {
  // Calculate GST summary
  const gstSummary = {};
  poItems?.filter(i => i.styleId)?.forEach(item => {
    const amount = item.invoiceQty * item.price;
    const tax = item?.Hsn?.tax;
    const halfGst = tax / 2;

    if (!gstSummary[tax]) {
      gstSummary[tax] = {
        cgstRate: halfGst,
        sgstRate: halfGst,
        cgstAmount: 0,
        sgstAmount: 0
      };
    }

    gstSummary[tax].cgstAmount += amount * (halfGst / 100);
    gstSummary[tax].sgstAmount += amount * (halfGst / 100);
  });

  const gstArray = Object.keys(gstSummary).map(tax => {
    return {
      taxRate: Number(tax),
      cgstRate: gstSummary[tax].cgstRate,
      sgstRate: gstSummary[tax].sgstRate,
      cgstAmount: gstSummary[tax].cgstAmount,
      sgstAmount: gstSummary[tax].sgstAmount,
      totalTax: gstSummary[tax].cgstAmount + gstSummary[tax].sgstAmount
    };
  });

  // Group PO items
  const groupedPoItems = Object.values(
    poItems.reduce((acc, item) => {
      const key = [
        item?.styleId,
        item?.styleItemId,
        item?.colorId,
        item?.uomId,
        item?.price,
      ].join("_");

      if (!acc[key]) {
        acc[key] = {
          ...item,
          invoiceQty: Number(item.invoiceQty) || 0,
        };
      } else {
        acc[key].invoiceQty += Number(item.invoiceQty) || 0;
      }

      return acc;
    }, {})
  );

  const totalAmount = poItems?.reduce((sum, item) => {
    const qty = Number(item?.invoiceQty ?? 0);
    const price = Number(item?.price ?? 0);
    return sum + qty * price;
  }, 0);

  // Calculate discount
  let discountAmount = 0;
  if (discountType == "Percentage") {
    discountAmount = (totalAmount * Number(discountValue || 0)) / 100;
  } else if (discountType == "Flat") {
    discountAmount = Number(discountValue || 0);
  }

  // Calculate tax totals
  const result = poItems?.filter(i => i.styleId)?.reduce(
    (acc, item) => {
      const amount = item.invoiceQty * item.price;
      const tax = item?.Hsn?.tax;
      const halfGst = tax / 2;

      const cgstAmount = amount * (halfGst / 100);
      const sgstAmount = amount * (halfGst / 100);
      const itemTax = cgstAmount + sgstAmount;

      acc.totalCgst += cgstAmount;
      acc.totalSgst += sgstAmount;
      acc.overallTax += itemTax;
      acc.subTotal += amount;

      return acc;
    },
    {
      totalCgst: 0,
      totalSgst: 0,
      overallTax: 0,
      subTotal: 0
    }
  );

  const netAmount = Math.max(totalAmount - discountAmount, 0) + (parseFloat(result?.totalSgst) + parseFloat(result?.totalCgst));
  const roundedNetAmount = Math.round(netAmount);
  const roundOff = Number((roundedNetAmount - netAmount).toFixed(2));
  const overallAmount = parseFloat(parseFloat(netAmount) + parseFloat(roundOff)).toFixed(2);

  // Chunk array for pagination
  const chunkArrayVariable = (arr, firstPageSize, otherPageSize) => {
    if (!arr || arr.length === 0) return [];

    const chunks = [];
    let startIndex = 0;

    // First page
    const firstChunk = arr.slice(0, firstPageSize);
    if (firstChunk.length > 0) {
      chunks.push(firstChunk);
      startIndex = firstPageSize;
    }

    // Remaining pages
    while (startIndex < arr.length) {
      chunks.push(arr.slice(startIndex, startIndex + otherPageSize));
      startIndex += otherPageSize;
    }

    return chunks;
  };

  const allRows = [...groupedPoItems];
  const chunks = chunkArrayVariable(allRows || [], 20, 25);

  if (isTaxHookDetailsLoading) return <Loader />;

  // Header Component (reusable)
  const Header = () => (
    <>
      <Text style={styles.greenTitle}>TAX INVOICE</Text>
      <View style={styles.header}>
        <View style={{
          fontSize: 10,
          fontWeight: "bold",
          marginBottom: 4,
          marginTop: 4,
          flexDirection: 'row',
          width: '52%',
        }}>
          <Image source={MsExports} style={styles.logo} />
          <View style={{ width: 125, flexWrap: 'wrap' }}>
            <Text style={{
              fontSize: 16,
              fontWeight: "extrabold",
              paddingVertical: 3,
              paddingHorizontal: 6,
              marginBottom: 4,
              marginTop: 10,
              textAlign: "left",
              color: "#000000"
            }}>
              {branchData?.branchName}
            </Text>
            <Text style={{
              fontSize: 9,
              marginBottom: 1,
              textAlign: "left",
              marginRight: 4,
              width: 170
            }}>{branchData?.address}</Text>

            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.companyText, { width: 40 }]}>Mobile</Text>
              <Text style={styles.companyText}>: {branchData?.contactMobile}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.companyText, { width: 40 }]}>Email</Text>
              <Text style={styles.companyText}>: {branchData?.contactEmail}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.companyText, { width: 40 }]}>GST No</Text>
              <Text style={styles.companyText}>: 33ALNPA8871B1Z9</Text>
            </View>
          </View>
        </View>

        <View>
          <View style={{ alignItems: "flex-end", marginTop: 15, marginBottom: 3 }}>
            <View>
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>DATE</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.ValueText}>{getDateFromDateTimeToDisplay(poDate)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>INVOICE NO</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.ValueText}>{docId}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>DELIVERY NOTE NO</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.ValueText}>NA</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>MODE OF TRANSPORT</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.ValueText}> {transportMode || "NA"}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>TRANSPORTER</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.ValueText}>{transporter || "NA"}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={[styles.companyText, { width: 120, textAlign: "left" }]}>VEHICLE NO</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.ValueText}>{vehicleNo || "NA"}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        {/* Bill To */}
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Bill To :</Text>
          <View style={{ padding: 6 }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{
                fontWeight: "bold",
                paddingHorizontal: 2,
                color: "#000", marginTop: 1.5,
                fontSize: 8
              }}>M/s</Text>
              <Text style={{
                fontWeight: "bold",
                paddingHorizontal: 2,
                marginBottom: 4,
                color: "#000",
                fontSize: 10
              }}>
                {supplierDetails?.name}
              </Text>
            </View>
            <View style={{ paddingLeft: 7, width: 200 }}>
              <Text style={{
                fontSize: 9,
                textTransform: 'uppercase',
                lineHeight: 1.2,
                textAlign: 'left',
              }}>
                {supplierDetails?.address}
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginTop: 4, paddingLeft: 7 }}>
              <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
              <Text style={styles.companyText}>: {supplierDetails?.contactMobile}</Text>
            </View>
            <View style={{ flexDirection: "row", paddingLeft: 7 }}>
              <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
              <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
            </View>
            <View style={{ flexDirection: "row", paddingLeft: 7 }}>
              <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
              <Text style={styles.companyText}>: {supplierDetails?.email}</Text>
            </View>
          </View>
        </View>

        {/* Ship To */}
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Ship To :</Text>
          <View style={{ padding: 6 }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{
                fontWeight: "bold",
                paddingHorizontal: 2,
                color: "#000", marginTop: 1.5,
                fontSize: 8
              }}>M/s</Text>              <Text style={{
                fontWeight: "bold",
                paddingHorizontal: 2,
                marginBottom: 4,
                color: "#000",
                fontSize: 10
              }}>
                {supplierDetails?.name}
              </Text>
            </View>
            <View style={{ paddingLeft: 7, width: 200 }}>
              <Text style={{
                fontSize: 9,
                textTransform: 'uppercase',
                lineHeight: 1.2,
                textAlign: 'left',
              }}>
                {supplierDetails?.address}
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginTop: 4, paddingLeft: 7 }}>
              <Text style={[styles.companyText, { width: 70 }]}>Mobile No</Text>
              <Text style={styles.companyText}>: {supplierDetails?.contactMobile}</Text>
            </View>
            <View style={{ flexDirection: "row", paddingLeft: 7 }}>
              <Text style={[styles.companyText, { width: 70 }]}>GST No</Text>
              <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
            </View>
            <View style={{ flexDirection: "row", paddingLeft: 7 }}>
              <Text style={[styles.companyText, { width: 70 }]}>Email</Text>
              <Text style={styles.companyText}>: {supplierDetails?.email}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
 const EmptyTableRow = ({ index }) => (
    <View
      key={`empty-row-${index}`}
      style={{
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        minHeight: 18, // important: keeps row height consistent
      }}
    >
      {[1, 5, 4, 4, 1, 1, 2, 2, 2.5].map((flex, i) => (
        <Text
          key={i}
          style={[
            styles.td,
            { flex, textAlign: i >= 6 ? "right" : "left" },
          ]}
        >
          {" "}
        </Text>
      ))}
    </View>
  );
  // Table Header Component
  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.th, { flex: 1 }]}>S.No</Text>
      <Text style={[styles.th, { flex: 5 }]}>Style No</Text>
      <Text style={[styles.th, { flex: 4 }]}>Item</Text>
      <Text style={[styles.th, { flex: 4 }]}>Color</Text>
      <Text style={[styles.th, { flex: 1 }]}>Hsn</Text>
      <Text style={[styles.th, { flex: 1 }]}>Uom</Text>
      <Text style={[styles.th, { flex: 2 }]}>Qty</Text>
      <Text style={[styles.th, { flex: 2 }]}>Price</Text>
      <Text style={[styles.th, { flex: 2.5 }]}>Amount</Text>
    </View>
  );

  // Table Row Component
  const TableRow = ({ row, index, absoluteIndex }) => (
    <View key={`row-${absoluteIndex}`} style={{
      flexDirection: "row",
      backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F4EEE9"
    }}>
      <Text style={[styles.td, { flex: 1 }]}>{absoluteIndex + 1}</Text>
      <Text style={[styles.td, { flex: 5, textAlign: "left" }]}>
        {row?.Style?.name}
      </Text>
      <Text style={[styles.td, { flex: 4, textAlign: "left" }]}>
        {row?.StyleItem?.name}
      </Text>
      <Text style={[styles.td, { flex: 4, textAlign: "left" }]}>
        {row?.Color?.name}
      </Text>
      <Text style={[styles.td, { flex: 1, textAlign: "center" }]}>
        {row?.Hsn?.name}
      </Text>
      <Text style={[styles.td, { flex: 1, textAlign: "left" }]}>
        {row?.Uom?.name}
      </Text>
      <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
        {row?.invoiceQty ? (Number(row?.invoiceQty)).toFixed(3) : ""}
      </Text>
      <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
        {row?.price ? (Number(row?.price)).toFixed(2) : ""}
      </Text>
      <Text style={[styles.td, { flex: 2.5, textAlign: "right" }]}>
        {row?.invoiceQty * row?.price ? (
          (Number(row?.invoiceQty) || 0) *
          (Number(row?.price) || 0)
        ).toFixed(2) : ''}
      </Text>
    </View>
  );

  // Table Total Row Component
  const TableTotalRow = () => (
    <View style={{ flexDirection: "row", backgroundColor: "#946657" }}>
      <Text style={[{ flex: 1, padding: 3 }]}></Text>
      <Text style={[{ flex: 5, padding: 3 }]}></Text>
      <Text style={[{
        flex: 4,
        padding: 3,
        fontSize: 8,
        color: "white"
      }]}>
        Total
      </Text>
      <Text style={[{ flex: 4, padding: 3 }]}></Text>
      <Text style={[{ flex: 1, padding: 3 }]}></Text>
      <Text style={[{
        flex: 1,
        borderRight: "1 solid ",
        padding: 3,
        borderRightColor: BORDER_GREY
      }]}></Text>
      <Text style={[{
        flex: 2,
        textAlign: "right",
        fontSize: 8,
        borderRight: "1 solid ",
        padding: 3,
        color: "white",
        borderRightColor: BORDER_GREY
      }]}>
        {parseFloat(totalQty).toFixed(3)}
      </Text>
      <Text style={[{
        flex: 2,
        borderRight: "1 solid ",
        padding: 3,
        borderRightColor: BORDER_GREY
      }]}></Text>
      <Text style={[{
        flex: 2.5,
        textAlign: "right",
        fontSize: 8,
        borderRight: "1 solid ",
        padding: 3,
        color: "white",
        borderRightColor: BORDER_GREY
      }]}>
        {parseFloat(totalAmount).toFixed(2)}
      </Text>
    </View>
  );

  // Summary Section Component (for last page)
  const SummarySection = () => (
    <>

      <View style={{
        alignSelf: "flex-end", borderWidth: 1,
        borderColor: "#9ca3af", width: 180, marginTop: 4
      }}>
        <View style={{ flexDirection: "row", }}>
          <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>Taxable Amount</Text>
          <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
            {parseFloat(totalAmount).toFixed(3)}
          </Text>
        </View>

        {gstArray?.map((item, index) => (
          <React.Fragment key={index}>
            <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#9ca3af" }}>
              <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>CGST @{item.cgstRate}%</Text>
              <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
                {item.cgstAmount.toFixed(2)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#9ca3af" }}>
              <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>SGST @{item.sgstRate}%</Text>
              <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
                {item.sgstAmount.toFixed(2)}
              </Text>
            </View>
          </React.Fragment>
        ))}

        <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#9ca3af" }}>
          <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>IGST @%</Text>
          <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}></Text>
        </View>

        <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#9ca3af" }}>
          <Text style={{ flex: 2, fontSize: 8, padding: 3 }}>Round Off</Text>
          <Text style={{ flex: 1, textAlign: "right", fontSize: 8, padding: 3 }}>
            {parseFloat(roundOff).toFixed(2)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", backgroundColor: "#946657", color: "#FFFF", padding: 2 }}>
          <Text style={{ flex: 1, fontSize: 10, paddingTop: 3 }}>Net Amount in Rs</Text>
          <Text style={{ flex: 1, textAlign: "right", fontSize: 10, padding: 3 }}>
            {parseFloat(overallAmount).toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={{ borderBottom: "1 solid #9ca3af", backgroundColor: "#946657", paddingVertical: 5, paddingHorizontal: 6, marginTop: 4 }}>
        <Text style={{ fontSize: 9, fontWeight: "bold", color: "#FFFFFF", flexWrap: "wrap" }}>
          Amount in Words: Rs. {numberToWords.toWords(
            Number.isFinite(overallAmount) ? Math.round(overallAmount) : 0
          )} Only
        </Text>
      </View>


    </>
  );

  // Calculate starting index for each chunk
  let globalIndex = 0;
 

  return (
    <Document>
      {/* Calculate how many rows we have */}
      {chunks.map((chunk, pageIndex) => {
        const isLastPage = pageIndex === chunks.length - 1;
        const isFirstPage = pageIndex === 0;

        return (
          <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
            {/* Border wrapper that surrounds the entire page content */}
            <View style={styles.pageBorder}>
              {/* Only show header on first page */}
              {isFirstPage && <Header />}

              {/* Always show table header on each page */}
              <TableHeader />

              {/* Table rows for this chunk */}
              {chunk.map((row, rowIndex) => {
                const absoluteIndex = (() => {
                  let index = rowIndex;
                  for (let i = 0; i < pageIndex; i++) {
                    index += chunks[i].length;
                  }
                  return index;
                })();

                return (
                  <TableRow
                    key={`row-${pageIndex}-${rowIndex}`}
                    row={row}
                    index={rowIndex}
                    absoluteIndex={absoluteIndex}
                  />
                );
              })}
              {pageIndex === 0 &&
                chunk.length < 10 &&
                Array.from({ length: 10 - chunk.length }).map((_, i) => (
                  <EmptyTableRow key={`filler-${i}`} index={i} />
                ))}

              {/* Only show total row on last page after all rows */}
              {isLastPage && <TableTotalRow />}
              {/* ✅ SUMMARY SECTION – smart pagination */}
              {isLastPage && (
                <View wrap={false}>
                  <SummarySection />
                </View>
              )}
            </View>
            <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
          </Page>
        );
      })}

      {/* Separate page for summary section to prevent wrapping */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder}>

          <View>
            <View style={{
              marginTop: 6, borderWidth: 1,
              borderColor: "#9ca3af", borderRadius: 4, overflow: "hidden"
            }}>

              <View style={{ flexDirection: "row", borderTop: "1 solid #9ca3af", borderLeft: "1 solid #9ca3af", borderRight: "1 solid #9ca3af" }}>
                <View style={{ width: 250, borderRight: "1 solid #9ca3af" }}>
                  <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
                    <Text style={{ width: 90, fontSize: 8, padding: 4, fontWeight: "bold", backgroundColor: "#f0f4ff", borderRight: "1 solid #9ca3af" }}>Bank Name</Text>
                    <Text style={{ flex: 1, fontSize: 8, padding: 4, textAlign: "left", flexWrap: "wrap" }}>IDBI BANK</Text>
                  </View>
                  <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
                    <Text style={{ width: 90, fontSize: 8, padding: 4, fontWeight: "bold", backgroundColor: "#f0f4ff", borderRight: "1 solid #9ca3af" }}>A/C No</Text>
                    <Text style={{ flex: 1, fontSize: 8, padding: 4, textAlign: "left", flexWrap: "wrap" }}>1622651100000897</Text>
                  </View>
                  <View style={{ flexDirection: "row", borderBottom: "1 solid #9ca3af" }}>
                    <Text style={{ width: 90, fontSize: 8, padding: 4, fontWeight: "bold", backgroundColor: "#f0f4ff", borderRight: "1 solid #9ca3af" }}>Branch</Text>
                    <Text style={{ flex: 1, fontSize: 8, padding: 4, textAlign: "left", flexWrap: "wrap" }}>
                      Palladam Road Veerapandi Privu, Tirupur-5
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ width: 90, fontSize: 8, padding: 4, fontWeight: "bold", backgroundColor: "#f0f4ff", borderRight: "1 solid #9ca3af" }}>IFSC Code</Text>
                    <Text style={{ flex: 1, fontSize: 8, padding: 4, textAlign: "left", flexWrap: "wrap" }}>IBKL0001622</Text>
                  </View>
                </View>

                <View style={{ flex: 1, padding: 6 }}>
                  <Text style={{ fontSize: 8, fontWeight: "bold", color: "#946657", marginBottom: 2 }}>
                    Terms & Conditions:
                  </Text>
                  <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
                    {termsAndCondition || "—"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{
              backgroundColor: "#f0f4ff", paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1,
              borderColor: "#9ca3af",
            }}>
              <Text style={{ fontSize: 8, lineHeight: 1.4, textAlign: "left", flexWrap: "wrap" }}>
                Certified that the above particulars are true and correct and are issued under our authority.
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={{ fontSize: 8, textAlign: "right", fontWeight: "bold" }}>
              For {branchData.branchName}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
              {["Prepared By", "Verified By", "Received By", "Approved By"].map((role) => (
                <Text key={role} style={{ fontSize: 8, textAlign: "center", fontWeight: "bold", flex: 1 }}>
                  {role}
                </Text>
              ))}
            </View>
          </View>        </View>

      </Page>
    </Document>
  );
};

export default DeliveryInvoice;