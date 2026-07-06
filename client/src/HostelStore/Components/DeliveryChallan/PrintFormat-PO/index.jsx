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
import { Loader } from "../../../../Basic/components";
import MsExports from "../../../../../src/assets/MSexports.png";

// Font registration
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf" }, // normal
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
      fontWeight: "bold",
    },
  ],
});
Font.registerHyphenationCallback(word => [word]);

const BORDER_GREY = "#9ca3af";
const ZEBRA_BROWN = "#F4EEE9";
const ROWS_PER_PAGE = 35;

export const styles = StyleSheet.create({
  borderBox: {
    borderWidth: 1,
    borderColor: BORDER_GREY,
    margin: 0,
    padding: 8,
  },

  page: {
    fontSize: 8,
    padding: 0,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },

  pageBorder: {
    borderWidth: 1,
    borderColor: BORDER_GREY,
    width: "100%",
    height: "100%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-center",
    paddingHorizontal: 1,
    height: 70,
    borderBottomColor: BORDER_GREY,
    borderBottomWidth: 1
  },

  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 12,
  },

  companyText: {
    fontSize: 8,
    marginBottom: 1,
    textAlign: "left",
    marginRight: 1,
  },

  ValueText: {
    fontSize: 9,
    paddingLeft: 2,
  },

  greenTitle: {
    alignSelf: "flex-end",
    fontFamily: "Roboto",
    fontSize: 13,
    color: "#8B0000",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingRight: 5,
    width: "100%",
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GREY,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#946A52",
    paddingHorizontal: 6,
    paddingVertical: 3,
    color: "white",
    height: 20,
    alignItems: "center",
    display: "flex"
  },

  valueContainer: {
    flexDirection: "row",
    paddingLeft: 6,
  },

  colon: {
    fontSize: 9,
  },

  boxContent: {
    padding: 3,
    paddingRight: 10,
    fontSize: 8,
  },

  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: BORDER_GREY,
    borderBottomColor: BORDER_GREY,
    backgroundColor: "#946A52",
    padding: 3,
  },

  th: {
    flex: 1,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    padding: 3,
    color: "white"
  },

  td: {
    flex: 1,
    fontSize: 8,
    textAlign: "center",
    padding: 3,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: BORDER_GREY,
    borderBottomColor: BORDER_GREY,
  },

  pageNumber: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 8,
  },
});

const FixedPageBorder = () => (
  <View
    fixed
    style={{
      position: "absolute",
      top: 8,
      left: 8,
      right: 8,
      bottom: 8,
      borderWidth: 1,
      borderColor: BORDER_GREY,
    }}
  />
);


// PageWrapper component to handle borders and consistent layout
const PageWrapper = ({ children, pageNumber, totalPages, isFirstPage = true }) => {
  return (
    <Page size="A4" style={{ padding: 8 }}>
      <FixedPageBorder />
      <View style={styles.page}>
        {children}
      </View>
      <View
        fixed
        style={{
          position: "absolute",
          bottom: 14,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 8,
        }}
      >
        <Text>
          Page {pageNumber} / {totalPages}
        </Text>
      </View>
    </Page>
  );
};

const DeliveryChallanPrint = ({
  isTaxHookDetailsLoading,
  poNumber,
  poDate,
  deliveryToId,
  dueDate,
  payTermId,
  deliveryType,
  supplierDetails,
  poItems,
  taxTemplateId,
  discountType,
  discountValue,
  remarks,
  poType,
  branchData,
  termsAndCondition,
  deliveryTo,
  tax,
  taxGroupWise,
  colorList, uomList, yarnList, sizeList, term, termsData, useTaxDetailsHook, docId, totalQty,
  transportMode, transporter, vehicleNo, deliveryItems
}) => {
  const filledPoItems = [
    ...deliveryItems,
    ...Array(Math.max(0, 15 - deliveryItems.length)).fill({}), // empty rows
  ];

  // const baseRow = {
  //   colorId: "4",
  //   hsnId: 1,
  //   noOfBox: "10000.000",
  //   qty: 10000,
  //   styleId: "1",
  //   styleItemId: "1",
  //   uomId: 10,
  // };

  // const filledPoItems = Array.from({ length: 40 }, () => ({
  //   ...baseRow,
  // }));

  if (isTaxHookDetailsLoading) return <Loader />;

  // Calculate total pages
  const totalPages = Math.ceil(filledPoItems.length / ROWS_PER_PAGE);

  // Function to render table rows for a specific page
  const renderTableRows = (startIndex, endIndex) => {
    const pageItems = filledPoItems.slice(startIndex, endIndex);

    return pageItems.map((row, index) => {
      const globalIndex = startIndex + index;
      return (
        <View key={globalIndex} style={{
          flexDirection: "row",
          backgroundColor: globalIndex % 2 === 0 ? "#FFFFFF" : "#F4EEE9",
        }}>
          <Text style={[styles.td, { flex: 1 }]}>{globalIndex + 1}</Text>
          <Text style={[styles.td, { flex: 5, textAlign: "left" }]}>
            {row?.Style?.name}
          </Text>
          <Text style={[styles.td, { flex: 3, textAlign: "left" }]}>
            {row?.StyleItem?.name}
          </Text>
          <Text style={[styles.td, { flex: 2, textAlign: "left" }]}>
            {row?.Color?.name}
          </Text>
          <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
            {row?.styleId ? 9988 : ""}
          </Text>
          <Text style={[styles.td, { flex: 1, textAlign: "left" }]}>
            {row?.Uom?.name}
          </Text>
          <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
            {row?.noOfBox ? (Number(row?.noOfBox)).toFixed(3) : ""}
          </Text>
          <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>
            {row?.qty ? (Number(row?.qty)).toFixed(3) : ""}
          </Text>
        </View>
      );
    });
  };

  // Function to render header (only on first page)
  const renderHeader = () => (
    <>
      <Text style={styles.greenTitle}>DELIVERY CHALLAN</Text>

      <View style={styles.header}>
        <Image source={MsExports} style={styles.logo} />
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={{
            fontSize: 8,
            marginBottom: 1,
            textAlign: "right",
            marginRight: 1,
            width: 200,
            paddingRight: 5,
            marginTop: 12,
          }}>{branchData?.address}</Text>
          <View style={{ flexDirection: 'row', paddingRight: 2 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.companyText]}>GST NO</Text>
              <Text style={styles.companyText}>: 33ALNPA8871B1Z9 /</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.companyText]}>CONTACT</Text>
              <Text style={styles.companyText}>: {branchData?.contactMobile}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', paddingRight: 2 }}>
            <Text style={[styles.companyText]}>EMAIL</Text>
            <Text style={styles.companyText}>: {branchData?.contactEmail}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <View style={{ flex: 1, borderRightWidth: 1, borderColor: BORDER_GREY, paddingBottom: 6 }}>
          <Text style={styles.sectionTitle}>DELIVERY TO :</Text>
          <View style={styles.boxContent}>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <Text style={{ fontWeight: "bold", paddingHorizontal: 1, marginBottom: 2, fontSize: 10 }}>
                {supplierDetails?.name}
              </Text>
            </View>

            <View style={{ paddingLeft: 2, width: 200, marginBottom: 1 }}>
              <Text style={{ fontSize: 8, textTransform: 'uppercase', lineHeight: 1.2, textAlign: 'left' }}>
                {supplierDetails?.address}
              </Text>
            </View>

            <View style={{ flexDirection: "row", marginTop: 1, paddingLeft: 2, marginBottom: 1 }}>
              <Text style={[styles.companyText, { width: 40 }]}>CONTACT</Text>
              <Text style={styles.companyText}>: {supplierDetails?.contactNumber ? supplierDetails?.contactNumber : ""}</Text>
            </View>

            <View style={{ flexDirection: "row", paddingLeft: 2, marginBottom: 1 }}>
              <Text style={[styles.companyText, { width: 40 }]}>GST NO</Text>
              <Text style={styles.companyText}>: {supplierDetails?.gstNo}</Text>
            </View>

            <View style={{ flexDirection: "row", paddingLeft: 2 }}>
              <Text style={[styles.companyText, { width: 40 }]}>EMAIL</Text>
              <Text style={styles.companyText}>: {supplierDetails?.contactPersonEmail}</Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.boxContent}>
            <View style={{ alignItems: "flex-end", paddingVertical: 4 }}>
              <View style={{}}>
                <View style={{ flexDirection: "row", marginBottom: 2 }}>
                  <Text style={[styles.companyText, { textAlign: "left", width: 34 }]}>DC NO</Text>
                  <View style={styles.valueContainer}>
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.ValueText}>{docId}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", marginBottom: 2, marginRight: 5 }}>
                  <Text style={[styles.companyText, { textAlign: "left" }]}>DC DATE</Text>
                  <View style={styles.valueContainer}>
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.ValueText}>{getDateFromDateTimeToDisplay(poDate)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );

  // Function to render footer (only on last page)
  const renderFooter = () => (
    <>
      <View style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: BORDER_GREY,
      }}>
        <Text style={[styles.td, {
          flex: 13.8,
          fontWeight: "bold",
          textAlign: "right",
          paddingRight: 14,
          borderBottomWidth: 0,
        }]}>
          TOTAL
        </Text>
        <Text style={[styles.td, {
          flex: 1.7,
          textAlign: "right",
          fontWeight: "bold",
          borderBottomWidth: 0,
        }]}>
          {parseFloat(totalQty).toFixed(3)}
        </Text>
      </View>

      <View style={{
        flexDirection: "row",
      }}>
        <View style={{
          flex: 3,
          justifyContent: "center",
          alignItems: "center",
          borderRightWidth: 1,
          borderRightColor: BORDER_GREY,

          // padding: 5,
        }}>
          <Text style={{ fontSize: 9, fontWeight: "bold", textAlign: "center" }}>
            Thank You For Your Business
          </Text>
        </View>

        <View style={{ flex: 1, alignItems: "center", padding: 5 }}>
          <Image source={MsExports} style={styles.logo} />
          <Text style={{ fontSize: 8, fontWeight: "bold", textAlign: "center", marginTop: 20 }}>
            AUTHORISED SIGNATORY
          </Text>
        </View>
      </View>
    </>
  );

  // Create pages array
  const pages = [];

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const startIndex = pageIndex * ROWS_PER_PAGE;
    const endIndex = Math.min(startIndex + ROWS_PER_PAGE, filledPoItems.length);
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === totalPages - 1;

    pages.push(
      <PageWrapper
        key={pageIndex}
        pageNumber={pageIndex + 1}
        totalPages={totalPages}
        isFirstPage={isFirstPage}
      >
        {/* Header - only on first page */}
        {isFirstPage && renderHeader()}

        {/* Table Header - show on all pages */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1 }]}>S.NO</Text>
          <Text style={[styles.th, { flex: 5 }]}>STYLE NO</Text>
          <Text style={[styles.th, { flex: 3 }]}>ITEM</Text>
          <Text style={[styles.th, { flex: 2 }]}>COLOR</Text>
          <Text style={[styles.th, { flex: 1 }]}>HSN</Text>
          <Text style={[styles.th, { flex: 1 }]}>UOM</Text>
          <Text style={[styles.th, { flex: 2 }]}>NO OF BOX</Text>
          <Text style={[styles.th, { flex: 2 }]}>QTY</Text>
        </View>

        {/* Table Rows */}
        {renderTableRows(startIndex, endIndex)}

        {/* Footer - only on last page */}
        {isLastPage && renderFooter()}
      </PageWrapper>
    );
  }

  return (
    <Document>
      {pages}
    </Document>
  );
};

export default DeliveryChallanPrint;