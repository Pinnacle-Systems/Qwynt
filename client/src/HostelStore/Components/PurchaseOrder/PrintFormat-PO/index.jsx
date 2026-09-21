import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import Logo from "../../../../../src/assets/mplogo.png";
import { numberToWords } from "number-to-words";
import { getDateFromDateTimeToDisplay } from "../../../../Utils/helper";

/* ═══════════════════════════════════════════════════════════════════════════
   RULED / BOXED LAYOUT
   ───────────────────────────────────────────────────────────────────────────
   • Every text node is pure black (#000). No grey copy anywhere.
   • A ruled frame wraps every page; all bands butt against it so the borders
     line up into one continuous grid.
   • Grey appears ONLY as a fill tint behind black text (header bands).
   • The signature block is pinned to the bottom of the frame and drawn on
     the LAST page only.
   ═══════════════════════════════════════════════════════════════════════════ */

const INK = "#000000";
const BRAND = "#0000FF"; // Blue
const LINE = "#000000";
const TINT = "#E6E6E6"; // band fill
const TINT_SOFT = "#F4F4F4"; // alternating row fill

const B = `1 solid ${LINE}`; // structural rule
const BH = `0.5 solid ${LINE}`; // inner hairline rule

/* Type scale */
const T = {
  micro: 6.5,
  label: 7,
  small: 7.5,
  body: 8.5,
  lead: 10,
  sub: 12,
  display: 16,
};

/* ── PAGE GEOMETRY ───────────────────────────────────────────────────────────
   These four values are interlocked. The signature block is absolutely
   positioned, so the page must reserve room for it or flowing table rows
   will print underneath it.

     frame bottom edge ......... FRAME.bottom          (30)
     signature sits on it ...... height SIGN_HEIGHT    (52)
     content must stop above ... FRAME.bottom + SIGN_HEIGHT + breathing room
   ─────────────────────────────────────────────────────────────────────────── */
const FRAME = { top: 16, bottom: 30, side: 20 };
const SIGN_HEIGHT = 52;
const CONTENT_BOTTOM = FRAME.bottom + SIGN_HEIGHT + 6; // = 88

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: T.body,
    color: INK,
    backgroundColor: "#fff",
    paddingTop: FRAME.top,
    paddingBottom: FRAME.bottom,
  },

  /* ── PAGE FRAME (fixed: redrawn on every page) ── */
  frame: {
    position: "absolute",
    top: FRAME.top,
    bottom: FRAME.bottom,
    left: FRAME.side,
    right: FRAME.side,
    border: B,
  },

  /* Every band sits inside the frame, edge to edge */
  band: {
    marginHorizontal: FRAME.side,
    borderLeft: B,
    borderRight: B,
  },

  /* ── MASTHEAD ── */
  masthead: {
    flexDirection: "row",
    borderBottom: B,
  },
  logoCell: {
    width: 62,
    borderRight: B,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  logo: { height: 44, width: 44 },
  brandCell: {
    flex: 1,
    padding: 7,
    justifyContent: "center",
  },
  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.display,
    color: BRAND,
    marginBottom: 3,
  },
  companyLine: {
    fontSize: T.small,
    color: INK,
    lineHeight: 1.4,
  },
  contactCell: {
    width: 220,
    borderLeft: B,
    padding: 6,
    justifyContent: "center",
  },
  kvRow: { flexDirection: "row", marginBottom: 3 },
  kvKey: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.body,
    color: INK,
    width: 50,
  },
  kvVal: { fontSize: T.body, color: INK, flex: 1 },

  /* ── TITLE BAND ── */
  titleBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TINT,
    borderBottom: B,
    paddingVertical: 5,
  },
  titleText: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.sub,
    letterSpacing: 4,
    color: BRAND,
  },
  revisedText: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.label,
    letterSpacing: 1,
    color: INK,
    marginLeft: 10,
    border: B,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    backgroundColor: "#fff",
  },

  /* ── META GRID ── */
  metaRow: {
    flexDirection: "row",
    borderBottom: B,
  },
  metaCell: {
    flex: 1,
    padding: 5,
  },
  metaDiv: { borderRight: BH },
  metaLabel: {
    fontSize: T.micro,
    letterSpacing: 0.8,
    color: INK,
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.body,
    color: INK,
  },

  /* ── PARTY BOXES ── */
  partyRow: {
    flexDirection: "row",
    borderBottom: B,
  },
  partyCol: { flex: 1 },
  partyColDiv: { borderRight: B },
  partyHead: {
    backgroundColor: TINT,
    borderBottom: BH,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
  },
  partyHeadText: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.label,
    letterSpacing: 1.4,
    color: BRAND,
  },
  partyBody: { padding: 6 },
  partyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.lead,
    color: INK,
    marginBottom: 2,
  },
  partyAddr: {
    fontSize: T.small,
    color: INK,
    lineHeight: 1.45,
    marginBottom: 4,
  },
  pKey: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.small,
    color: INK,
    width: 44,
  },
  pVal: { fontSize: T.small, color: INK, flex: 1 },

  /* ── TABLE ── */
  thead: {
    flexDirection: "row",
    backgroundColor: TINT,
    borderBottom: B,
  },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.label,
    letterSpacing: 0.5,
    color: BRAND,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRight: BH,
  },
  tr: {
    flexDirection: "row",
    borderBottom: BH,
    minHeight: 18,
  },
  trAlt: {
    flexDirection: "row",
    borderBottom: BH,
    minHeight: 18,
    backgroundColor: TINT_SOFT,
  },
  td: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRight: BH,
    justifyContent: "center",
  },
  cell: { fontSize: T.small, color: INK },
  cellNum: { fontSize: T.small, color: INK, textAlign: "right" },
  itemName: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.small,
    color: INK,
  },
  itemAttrs: {
    fontSize: T.micro,
    color: INK,
    marginTop: 1.5,
  },

  /* ── TABLE TOTAL ── */
  totalRow: {
    flexDirection: "row",
    borderTop: B,
    borderBottom: B,
    backgroundColor: TINT,
  },
  totalCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.body,
    color: BRAND,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRight: BH,
    textAlign: "right",
  },

  /* ── WORDS BAND ── */
  wordsRow: {
    flexDirection: "row",
    borderBottom: B,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  wordsKey: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.small,
    color: BRAND,
  },
  wordsVal: {
    fontSize: T.small,
    color: INK,
    flex: 1,
  },

  /* ── NOTES + SUMMARY ── */
  lowerRow: {
    flexDirection: "row",
    borderBottom: B,
  },
  notesCol: {
    flex: 1,
    borderRight: B,
  },
  noteBlock: { borderBottom: BH },
  noteHead: {
    backgroundColor: TINT,
    borderBottom: BH,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
  },
  noteHeadText: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.label,
    letterSpacing: 1.4,
    color: BRAND,
  },
  noteText: {
    fontSize: T.small,
    color: INK,
    lineHeight: 1.5,
    padding: 6,
  },

  sumCol: { width: 190 },
  sumRow: {
    flexDirection: "row",
    borderBottom: BH,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
  },
  sumKey: { flex: 1, fontSize: T.small, color: INK },
  sumVal: { fontSize: T.small, color: INK, textAlign: "right" },
  sumNetRow: {
    flexDirection: "row",
    borderTop: B,
    backgroundColor: TINT,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  sumNetKey: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
    fontSize: T.body,
    color: BRAND,
  },
  sumNetVal: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.body,
    color: BRAND,
    textAlign: "right",
  },

  /* ── SIGNATURES (pinned to the frame's bottom edge, last page only) ── */
  signAnchor: {
    position: "absolute",
    bottom: FRAME.bottom,
    left: FRAME.side,
    right: FRAME.side,
  },
  signRow: {
    flexDirection: "row",
    height: SIGN_HEIGHT,
    border: B,
    backgroundColor: "#fff",
  },
  signCell: {
    flex: 1,
    padding: 5,
    justifyContent: "flex-end", // labels rest on the baseline
  },
  signCellDiv: { borderRight: B },
  signFor: {
    fontFamily: "Helvetica-Bold",
    fontSize: T.small,
    color: INK,
  },
  signText: {
    fontSize: T.label,
    letterSpacing: 0.8,
    color: INK,
  },

  /* ── FOOTER (fixed) ── */
  footer: {
    position: "absolute",
    bottom: FRAME.bottom - 13,
    left: FRAME.side,
    right: FRAME.side,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: T.micro,
    color: INK,
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN MODEL — drives head, body and total row so nothing drifts
   ═══════════════════════════════════════════════════════════════════════════ */
const COLUMNS = [
  { key: "sno", label: "S.NO", width: "6%", align: "center" },
  { key: "desc", label: "DESCRIPTION OF GOODS", width: "32%", align: "left" },
  { key: "hsn", label: "HSN", width: "11%", align: "center" },
  { key: "uom", label: "UOM", width: "5%", align: "center" },
  { key: "qty", label: "QTY", width: "9%", align: "right" },
  { key: "rate", label: "RATE", width: "11%", align: "right" },
  { key: "tax", label: "TAX %", width: "8%", align: "right" },
  { key: "amt", label: "AMOUNT", width: "18%", align: "right" },
];

const W = (key) => COLUMNS.find((c) => c.key === key)?.width;
const LAST = COLUMNS[COLUMNS.length - 1].key;

const MIN_ROWS = 6;

const fmt = (num, digits = 2) => {
  if (num === null || num === undefined || num === "" || isNaN(num)) return "";
  return Number(num).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const toTitle = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const PurchaseOrderPrintFormat = ({
  singleData,
  supplierDetails,
  deliveryTo,
  deliveryType,
  branchData,
  taxDetails,
  quoteVersion,
}) => {
  if (!singleData) return null;

  const poNumber = singleData?.docId || "";
  const poDate = singleData?.docDate || "";
  const dueDate = singleData?.dueDate || "";
  const remarks = singleData?.remarks || "";
  const term = singleData?.termsAndCondtion || "";
  const poItems = singleData?.poItems || [];

  const items = poItems
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((i) => i.itemVariantId && i.quoteVersion === quoteVersion);

  /* Amount in words */
  const netAmount = parseFloat(taxDetails?.net || 0);
  const netInt = Math.floor(netAmount);
  const netPaise = Math.round((netAmount - netInt) * 100);
  const amountWords =
    toTitle(
      numberToWords.toWords(netInt).replace(/,/g, "").replace(/-/g, " "),
    ) +
    (netPaise > 0
      ? ` And ${toTitle(numberToWords.toWords(netPaise))} Paise`
      : "") +
    " Only";

  /* Column totals */
  const totals = items.reduce(
    (acc, v) => {
      const qty = parseFloat(v.qty) || 0;
      const price = parseFloat(v.price) || 0;
      acc.qty += qty;
      acc.gross += qty * price;
      return acc;
    },
    { qty: 0, gross: 0 },
  );

  const fillerCount = Math.max(0, MIN_ROWS - items.length);
  const isRevised = quoteVersion > 1;

  const fields = (rows) =>
    rows
      .filter(({ value }) => value)
      .map(({ label, value }) => (
        <View key={label} style={{ flexDirection: "row", marginBottom: 1.5 }}>
          <Text style={styles.pKey}>{label}</Text>
          <Text style={styles.pVal}>: {value}</Text>
        </View>
      ));

  const tdStyle = (key, extra) => [
    styles.td,
    { width: W(key) },
    key === LAST && { borderRight: "none" },
    extra,
  ];

  /* Signature block — rendered by the fixed anchor below, last page only */
  const signatureBlock = (
    <View style={styles.signRow}>
      <View style={[styles.signCell, styles.signCellDiv]}>
        <Text style={styles.signText}>PREPARED BY</Text>
      </View>
      <View style={[styles.signCell, styles.signCellDiv]}>
        <Text style={styles.signText}>VERIFIED BY</Text>
      </View>
      <View style={[styles.signCell, { alignItems: "flex-end" }]}>
        <Text style={styles.signText}>AUTHORISED SIGNATORY</Text>
      </View>
    </View>
  );

  return (
    <Document>
      {/* One wrapping Page: react-pdf paginates rows itself, the table head
          repeats via `fixed`, and the ruled frame + footer redraw per page. */}
      <Page size="A4" style={styles.page} wrap>
        {/* ══ RULED PAGE FRAME ══ */}
        <View style={styles.frame} fixed />

        {/* ══ MASTHEAD ══ */}
        <View style={[styles.band, styles.masthead]}>
          {Logo ? (
            <View style={styles.logoCell}>
              <Image src={Logo} style={styles.logo} />
            </View>
          ) : null}

          <View style={styles.brandCell}>
            <Text style={styles.companyName}>
              {branchData?.branchName || ""}
            </Text>
            {branchData?.address ? (
              <Text style={styles.companyLine}>{branchData.address}</Text>
            ) : null}
          </View>

          <View style={styles.contactCell}>
            {[
              { label: "Mobile", value: branchData?.contactMobile },
              { label: "Email", value: branchData?.contactEmail },
              { label: "GSTIN", value: branchData?.company?.gstNo },
            ]
              .filter(({ value }) => value)
              .map(({ label, value }) => (
                <View key={label} style={styles.kvRow}>
                  <Text style={styles.kvKey}>{label}</Text>
                  <Text style={styles.kvVal}>: {value}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* ══ TITLE ══ */}
        <View style={[styles.band, styles.titleBand]}>
          <Text style={styles.titleText}>PURCHASE ORDER</Text>
          {isRevised ? (
            <Text style={styles.revisedText}>REVISED V{quoteVersion}</Text>
          ) : null}
        </View>

        {/* ══ META GRID ══ */}
        <View style={[styles.band, styles.metaRow]}>
          {[
            { label: "PO NUMBER", value: poNumber },
            { label: "PO DATE", value: getDateFromDateTimeToDisplay(poDate) },
            {
              label: "DELIVERY DATE",
              value: getDateFromDateTimeToDisplay(dueDate),
            },
            { label: "LINE ITEMS", value: String(items.length) },
          ].map(({ label, value }, i, arr) => (
            <View
              key={label}
              style={[styles.metaCell, i < arr.length - 1 && styles.metaDiv]}
            >
              <Text style={styles.metaLabel}>{label}</Text>
              <Text style={styles.metaValue}>{value || "-"}</Text>
            </View>
          ))}
        </View>

        {/* ══ PARTIES ══ */}
        <View style={[styles.band, styles.partyRow]}>
          <View style={[styles.partyCol, styles.partyColDiv]}>
            <View style={styles.partyHead}>
              <Text style={styles.partyHeadText}>SUPPLIER</Text>
            </View>
            <View style={styles.partyBody}>
              <Text style={styles.partyName}>{supplierDetails?.name}</Text>
              {supplierDetails?.address ? (
                <Text style={styles.partyAddr}>{supplierDetails.address}</Text>
              ) : null}
              {fields([
                { label: "Mobile", value: supplierDetails?.contactNumber },
                { label: "GSTIN", value: supplierDetails?.gstNo },
                { label: "Email", value: supplierDetails?.contactPersonEmail },
              ])}
            </View>
          </View>

          <View style={styles.partyCol}>
            <View style={styles.partyHead}>
              <Text style={styles.partyHeadText}>DELIVER TO</Text>
            </View>
            <View style={styles.partyBody}>
              <Text style={styles.partyName}>
                {deliveryType === "ToSelf"
                  ? deliveryTo?.branchName
                  : deliveryTo?.name}
              </Text>
              {deliveryTo?.address ? (
                <Text style={styles.partyAddr}>{deliveryTo.address}</Text>
              ) : null}
              {fields([
                { label: "Mobile", value: deliveryTo?.contactNumber },
                { label: "GSTIN", value: deliveryTo?.gstNo },
                {
                  label: "Email",
                  value:
                    deliveryType === "ToSelf"
                      ? deliveryTo?.contactEmail
                      : deliveryTo?.email,
                },
              ])}
            </View>
          </View>
        </View>

        {/* ══ TABLE HEAD — repeats on every page ══ */}
        <View style={[styles.band, styles.thead]} fixed>
          {COLUMNS.map((c) => (
            <Text
              key={c.key}
              style={[
                styles.th,
                { width: c.width, textAlign: c.align },
                c.key === LAST && { borderRight: "none" },
              ]}
            >
              {c.label}
            </Text>
          ))}
        </View>

        {/* ══ TABLE BODY ══ */}
        {items.map((val, index) => {
          const gross =
            (parseFloat(val.qty) || 0) * (parseFloat(val.price) || 0);
          const attrs = [
            val?.printingDesign?.name,
            val?.Color?.name,
            val?.Size?.name,
          ]
            .filter(Boolean)
            .join(" / ");

          return (
            <View
              key={val.originalIndex}
              style={[styles.band, index % 2 ? styles.trAlt : styles.tr]}
              wrap={false}
            >
              <View style={tdStyle("sno")}>
                <Text style={[styles.cell, { textAlign: "center" }]}>
                  {index + 1}
                </Text>
              </View>

              <View style={tdStyle("desc")}>
                <Text style={styles.itemName}>
                  {val?.ItemVariant?.styleMaster?.modelName?.name || "-"}
                </Text>
                {attrs ? <Text style={styles.itemAttrs}>{attrs}</Text> : null}
              </View>

              <View style={tdStyle("hsn")}>
                <Text style={[styles.cell, { textAlign: "center" }]}>
                  {val?.Hsn?.name || "-"}
                </Text>
              </View>

              <View style={tdStyle("uom")}>
                <Text style={[styles.cell, { textAlign: "center" }]}>
                  {val?.Uom?.name || "-"}
                </Text>
              </View>

              <View style={tdStyle("qty")}>
                <Text style={styles.cellNum}>{fmt(val?.qty, 3)}</Text>
              </View>

              <View style={tdStyle("rate")}>
                <Text style={styles.cellNum}>{fmt(val?.price)}</Text>
              </View>

              <View style={tdStyle("tax")}>
                <Text style={styles.cellNum}>{fmt(val?.taxPercent, 0)}</Text>
              </View>

              <View style={tdStyle("amt")}>
                <Text style={styles.cellNum}>{fmt(gross)}</Text>
              </View>
            </View>
          );
        })}

        {/* Filler rows keep the grid intact on short orders */}
        {Array.from({ length: fillerCount }).map((_, i) => {
          const index = items.length + i;
          return (
            <View
              key={`filler-${i}`}
              style={[styles.band, index % 2 ? styles.trAlt : styles.tr]}
            >
              {COLUMNS.map((c) => (
                <View key={c.key} style={tdStyle(c.key)}>
                  <Text style={styles.cell}> </Text>
                </View>
              ))}
            </View>
          );
        })}

        {/* ══ TABLE TOTAL ══ */}
        <View style={[styles.band, styles.totalRow]} wrap={false}>
          <Text style={[styles.totalCell, { width: "54%" }]}>TOTAL</Text>
          <Text style={[styles.totalCell, { width: W("qty") }]}>
            {fmt(totals.qty, 3)}
          </Text>
          <Text style={[styles.totalCell, { width: W("rate") }]}> </Text>
          <Text style={[styles.totalCell, { width: W("tax") }]}> </Text>
          <Text
            style={[styles.totalCell, { width: W("amt"), borderRight: "none" }]}
          >
            {fmt(totals.gross)}
          </Text>
        </View>

        {/* ══ AMOUNT IN WORDS ══ */}
        <View style={[styles.band, styles.wordsRow]} wrap={false}>
          <Text style={styles.wordsKey}>AMOUNT IN WORDS : </Text>
          <Text style={styles.wordsVal}>{amountWords}</Text>
        </View>

        {/* ══ NOTES + SUMMARY ══ */}
        <View style={[styles.band, styles.lowerRow]} wrap={false}>
          <View style={styles.notesCol}>
            {remarks ? (
              <View style={styles.noteBlock}>
                <View style={styles.noteHead}>
                  <Text style={styles.noteHeadText}>REMARKS</Text>
                </View>
                <Text style={styles.noteText}>{remarks}</Text>
              </View>
            ) : null}
            {term ? (
              <View>
                <View style={styles.noteHead}>
                  <Text style={styles.noteHeadText}>
                    TERMS &amp; CONDITIONS
                  </Text>
                </View>
                <Text style={styles.noteText}>{term}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.sumCol}>
            <View style={styles.noteHead}>
              <Text style={styles.noteHeadText}>TAX SUMMARY</Text>
            </View>

            <View style={styles.sumRow}>
              <Text style={styles.sumKey}>Total Discount</Text>
              <Text style={styles.sumVal}>
                {fmt(
                  (taxDetails?.itemDiscount || 0) +
                    (taxDetails?.overallDiscount || 0),
                )}
              </Text>
            </View>
            <View style={styles.sumRow}>
              <Text style={styles.sumKey}>Taxable Amount</Text>
              <Text style={styles.sumVal}>{fmt(taxDetails?.taxable)}</Text>
            </View>

            {(() => {
              const slabs =
                taxDetails?.slabBreakup?.filter((i) => i.amount > 0) || [];
              const grouped = {};
              slabs.forEach((i) => {
                grouped[i.tax] = (grouped[i.tax] || 0) + i.amount;
              });
              return Object.keys(grouped).map((taxName) => (
                <View key={taxName} style={styles.sumRow}>
                  <Text style={styles.sumKey}>{taxName}</Text>
                  <Text style={styles.sumVal}>{fmt(grouped[taxName])}</Text>
                </View>
              ));
            })()}

            <View style={styles.sumRow}>
              <Text style={styles.sumKey}>Round Off</Text>
              <Text style={styles.sumVal}>
                {fmt(taxDetails?.roundOff || 0)}
              </Text>
            </View>

            <View style={styles.sumNetRow}>
              <Text style={styles.sumNetKey}>NET AMOUNT</Text>
              <Text style={styles.sumNetVal}>{fmt(taxDetails?.net)}</Text>
            </View>
          </View>
        </View>

        {/* ══ BUMPER FOR SIGNATURE BLOCK ══ */}
        {/* Pushes in-flow content up on the final page so it doesn't overlap
            with the absolutely positioned signature block. */}
        <View style={{ height: SIGN_HEIGHT }} wrap={false} />

        {/* ══ SIGNATURES — bottom of the LAST page only ══════════════════════
            `fixed` puts this anchor on every page; the render callback then
            draws the block only when pageNumber === totalPages. */}
        <View
          style={styles.signAnchor}
          fixed
          render={({ pageNumber, totalPages }) =>
            pageNumber === totalPages ? signatureBlock : null
          }
        />

        {/* ══ FOOTER (fixed) ══ */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {poNumber ? `PO No: ${poNumber}` : ""}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default PurchaseOrderPrintFormat;
