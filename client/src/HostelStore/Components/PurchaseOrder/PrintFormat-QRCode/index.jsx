import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import QRCode from "qrcode";

const mmToPt = (mm) => (mm / 25.4) * 72; // mm → pt
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const PurchaseOrderQRCodeFormat = ({
  qrStocksData,
  labelConfig = {
    labelWidth: 50,
    labelHeight: 25,
    stickersPerRow: 2,
    horizontalGap: 1,
    verticalGap: 1,
  },
}) => {
  const [qrCodesDataUrl, setQrCodesDataUrl] = useState({});

  const allStocks = qrStocksData || [];
  console.log(allStocks, "allStocks");

  useEffect(() => {
    const generateQRCodes = async () => {
      const urls = {};
      for (const stock of allStocks) {
        if (stock.qrCode) {
          try {
            urls[stock.qrCode] = await QRCode.toDataURL(stock.qrCode, {
              margin: 0,
              width: 200,
            });
          } catch (e) {
            console.error("Error generating QR for", stock.qrCode, e);
          }
        }
      }
      setQrCodesDataUrl(urls);
    };

    if (allStocks.length > 0) {
      generateQRCodes();
    }
  }, [allStocks]);

  const { labelWidth, labelHeight, stickersPerRow, horizontalGap } =
    labelConfig;

  const labelWidthPt = mmToPt(labelWidth);
  const labelHeightPt = mmToPt(labelHeight);
  const gapX = mmToPt(horizontalGap);

  // Page size (1 row)
  const pageWidthPt =
    labelWidthPt * stickersPerRow + gapX * (stickersPerRow - 1);
  const pageHeightPt = labelHeightPt;

  // Chunk stocks into pages (stickersPerRow per page)
  const pages = chunkArray(allStocks, stickersPerRow);

  return (
    <Document>
      {pages.map((page, pageIndex) => (
        <Page
          key={pageIndex}
          size={{ width: pageWidthPt, height: pageHeightPt }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: gapX,
            padding: 0,
          }}
        >
          {page.map((stock, i) => (
            <View
              key={i}
              style={{
                width: labelWidthPt,
                height: labelHeightPt,
                justifyContent: "center",
                alignItems: "center",
                paddingLeft: 4,
                paddingRight: 12, // Space for right pre-printed WALRUS logo
                paddingVertical: 2,
              }}
            >
              <Text
                style={{ fontSize: 6.5, textAlign: "center", marginTop: 1 }}
              >
                {stock.qrCode}
              </Text>
              {/* QR CODE IMAGE */}
              <View
                style={{
                  height: labelHeightPt * 0.45,
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: 2,
                }}
              >
                {qrCodesDataUrl[stock.qrCode] ? (
                  <Image
                    src={qrCodesDataUrl[stock.qrCode]}
                    style={{
                      width: labelHeightPt * 0.45,
                      height: labelHeightPt * 0.45,
                    }}
                  />
                ) : null}
              </View>

              <Text
                style={{
                  fontSize: 6.5,
                  textAlign: "center",
                  marginTop: 1,
                  fontWeight: "bold",
                }}
              >
                {stock?.ItemVariant?.styleMaster?.styleNo || ""} /{" "}
                {stock?.Size?.name || ""}
              </Text>
              <Text
                style={{
                  fontSize: 6.5,
                  textAlign: "center",
                  marginTop: 0.5,
                  fontWeight: "bold",
                }}
              >
                MRP : {stock?.PoItems?.mrpPrice?.toFixed(2) || ""} /-
              </Text>
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
};

export default PurchaseOrderQRCodeFormat;
