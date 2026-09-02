import React, { useEffect, useState } from "react";
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

const mmToPt = (mm) => (mm / 25.4) * 72; // mm → pt
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const BoxQRCodeFormat = ({
  qrBoxesData,
  labelConfig = {
    labelWidth: 80, // Size of two QR codes in width
    labelHeight: 40, // Size of two QR codes in height
    stickersPerRow: 1, // 1 per row for a 100x50 mm label
    horizontalGap: 1,
    verticalGap: 1,
  },
}) => {
  const [qrCodesDataUrl, setQrCodesDataUrl] = useState({});

  const allBoxes = qrBoxesData || [];

  useEffect(() => {
    const generateQRCodes = async () => {
      const urls = {};
      for (const box of allBoxes) {
        if (box.id) {
          try {
            const qrData = JSON.stringify({
              id: box.id,
              docId: box.docId || box.code,
            });
            urls[box.id] = await QRCode.toDataURL(qrData, {
              margin: 0,
              width: 400,
            });
          } catch (e) {
            console.error("Error generating QR for", box.id, e);
          }
        }
      }
      setQrCodesDataUrl(urls);
    };

    if (allBoxes.length > 0) {
      generateQRCodes();
    }
  }, [allBoxes]);

  const { labelWidth, labelHeight, stickersPerRow, horizontalGap } =
    labelConfig;

  const labelWidthPt = mmToPt(labelWidth);
  const labelHeightPt = mmToPt(labelHeight);
  const gapX = mmToPt(horizontalGap);

  // Page size (1 row)
  const pageWidthPt =
    labelWidthPt * stickersPerRow + gapX * (stickersPerRow - 1);
  const pageHeightPt = labelHeightPt;

  // Chunk boxes into pages (stickersPerRow per page)
  const pages = chunkArray(allBoxes, stickersPerRow);

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
          {page.map((box, i) => (
            <View
              key={i}
              style={{
                width: labelWidthPt,
                height: labelHeightPt,
                flexDirection: "row",
                padding: 4,
                gap: 8,
              }}
            >
              {/* Text Details (Left Side) */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: 900, marginBottom: 2 }}
                >
                  Size: {box.Size?.name || "N/A"}
                </Text>

                <View style={{ flexDirection: "column", marginTop: 2 }}>
                  {box?.boxStyleItems?.map((styleItem, idx) => {
                    const styleName = styleItem?.styleMaster?.styleNo;
                    return (
                      <Text key={idx} style={{ fontSize: 8, fontWeight: 900 }}>
                        {styleName} - MRP: Rs.
                        {parseFloat(styleItem?.mrpPrice || 0)?.toFixed(2)} -
                        Qty: {styleItem?.qty || 0}
                      </Text>
                    );
                  })}
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      marginTop: 4,
                      paddingTop: 2,
                    }}
                  >
                    Total Qty:{" "}
                    {box?.boxStyleItems?.reduce(
                      (acc, curr) => acc + (curr.qty || 0),
                      0,
                    ) || 0}
                  </Text>
                </View>
              </View>

              {/* QR CODE SECTION (Right Side) */}
              <View
                style={{
                  width: labelHeightPt * 0.75,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    textAlign: "center",
                  }}
                >
                  {box?.docId}
                </Text>

                {qrCodesDataUrl[box.id] ? (
                  <Image
                    src={qrCodesDataUrl[box.id]}
                    style={{
                      width: labelHeightPt * 0.65,
                      height: labelHeightPt * 0.65,
                    }}
                  />
                ) : null}

                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    textAlign: "center",
                  }}
                >
                  Total Rs.
                  {(
                    box.boxStyleItems?.reduce(
                      (acc, curr) =>
                        acc +
                        (parseInt(curr.qty) || 0) *
                          (parseFloat(curr.mrpPrice) || 0),
                      0,
                    ) || 0
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
};

export default BoxQRCodeFormat;
