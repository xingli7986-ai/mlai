/* eslint-disable jsx-a11y/alt-text */
// @react-pdf/renderer's Image component doesn't accept an `alt` attribute,
// so the jsx-a11y/alt-text rule (which applies to HTML <img>) is irrelevant here.

import path from "path";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  COMMON_CONSTRUCTION_NOTES,
  PACKAGING_TEMPLATE,
  POM_DEFINITIONS,
  SIZE_CODES,
} from "./techpack-data";

// ---------------------------------------------------------------------------
// Fonts.
//
// @react-pdf/renderer ships with Helvetica by default (Latin-only). Without a
// CJK-capable font, Chinese characters render as boxes. The font file is
// bundled under /public/fonts so PDF generation does not depend on CDN
// reachability (which is flaky from mainland China networks).
// ---------------------------------------------------------------------------

Font.register({
  family: "NotoSansSC",
  src: path.join(process.cwd(), "public/fonts/NotoSansSC-Regular.ttf"),
});

// ---------------------------------------------------------------------------
// Props.
// ---------------------------------------------------------------------------

export interface TechPackProps {
  styleCode: string;
  styleName: string;
  date: string;
  season: string;
  printImageUrl: string;
  printDescription: string;
  skirtType: { id: string; name: string; enName: string };
  neckline: { id: string; name: string; enName: string };
  sleeveType: { id: string; name: string; enName: string };
  skirtLength: { id: string; name: string; refLengthCm: number };
  fabric: { id: string; name: string; composition: string; gsm: string };
  size: string;
  customMeasurements?: {
    bust: number;
    waist: number;
    hip: number;
    height: number;
  };
  constructionNotes: string;
  bomItems: Array<{
    item: string;
    spec: string;
    quantity: string;
    placement: string;
  }>;
  pomData: Record<string, Record<string, number>>;
  price: number;
  vectorFileUrl?: string;
  colorAnalysis?: Array<{
    hex: string;
    pantoneCode: string;
    pantoneName: string;
    percentage: number;
  }>;
  careInstructions?: string;
}

// ---------------------------------------------------------------------------
// Styles.
// ---------------------------------------------------------------------------

const ACCENT = "#C084FC";
const TEXT = "#111827";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansSC",
    fontSize: 9,
    color: TEXT,
    padding: 36,
    paddingTop: 54,
    paddingBottom: 48,
    lineHeight: 1.45,
  },
  headerBar: {
    position: "absolute",
    top: 24,
    left: 36,
    right: 36,
    height: 2,
    backgroundColor: ACCENT,
  },
  headerText: {
    position: "absolute",
    top: 30,
    left: 36,
    right: 36,
    fontSize: 7.5,
    color: MUTED,
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7.5,
    color: MUTED,
    textAlign: "center",
  },
  h1: {
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 4,
  },
  h1Sub: {
    fontSize: 10,
    textAlign: "center",
    color: MUTED,
    letterSpacing: 3,
    marginBottom: 28,
  },
  h2: {
    fontSize: 13,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
  },
  h3: {
    fontSize: 10,
    marginTop: 10,
    marginBottom: 4,
    color: TEXT,
  },
  p: {
    fontSize: 9,
    lineHeight: 1.55,
    color: TEXT,
    marginBottom: 4,
  },
  pMuted: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.55,
  },
  // Generic key/value summary table (2 cols)
  kvRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingVertical: 6,
  },
  kvKey: {
    width: 110,
    fontSize: 9,
    color: MUTED,
  },
  kvVal: {
    flex: 1,
    fontSize: 9,
    color: TEXT,
  },
  // Full-width data tables (BOM, POM)
  table: {
    borderTopWidth: 1,
    borderTopColor: TEXT,
    borderLeftWidth: 0.5,
    borderLeftColor: LINE,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: TEXT,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  cell: {
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontSize: 8,
    borderRightWidth: 0.5,
    borderRightColor: LINE,
  },
  cellHeader: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 8,
    borderRightWidth: 0.5,
    borderRightColor: LINE,
    color: TEXT,
  },
  // Cover image thumbnail
  coverThumb: {
    width: 180,
    height: 240,
    alignSelf: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: LINE,
  },
  // Page 2 print image
  printImage: {
    width: "100%",
    height: 380,
    objectFit: "contain",
    borderWidth: 1,
    borderColor: LINE,
    marginBottom: 16,
  },
  calloutBox: {
    marginTop: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: ACCENT,
    backgroundColor: "#faf5ff",
  },
  bullet: {
    fontSize: 9,
    marginLeft: 10,
    marginBottom: 3,
  },
});

// ---------------------------------------------------------------------------
// Reusable frame — header bar, header text, page footer.
// ---------------------------------------------------------------------------

function Frame({
  styleCode,
  date,
  pageNo,
  totalPages,
  children,
}: {
  styleCode: string;
  date: string;
  pageNo: number;
  totalPages: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <View style={styles.headerBar} fixed />
      <Text style={styles.headerText} fixed>
        MaxLuLu AI Tech Pack  |  {styleCode}  |  {date}
      </Text>
      {children}
      <Text style={styles.footer} fixed>
        {pageNo} / {totalPages}
      </Text>
    </>
  );
}

// ---------------------------------------------------------------------------
// The Document.
// ---------------------------------------------------------------------------

const TOTAL_PAGES = 7;

export function TechPackDocument(props: TechPackProps) {
  const {
    styleCode,
    styleName,
    date,
    season,
    printImageUrl,
    printDescription,
    skirtType,
    neckline,
    sleeveType,
    skirtLength,
    fabric,
    size,
    customMeasurements,
    constructionNotes,
    bomItems,
    pomData,
    price,
    vectorFileUrl,
    colorAnalysis,
    careInstructions,
  } = props;

  const careLabelBody = careInstructions
    ? `尼龙满幅洗标 10×2.5cm, 印刷中英双语, 洗涤说明: ${careInstructions}。缝于左侧缝距腰 15cm 处, 与品牌织标同一缝线。`
    : PACKAGING_TEMPLATE.careLabel.spec;

  const sizeLabel =
    size === "custom" && customMeasurements
      ? `自定义 (胸 ${customMeasurements.bust} / 腰 ${customMeasurements.waist} / 臀 ${customMeasurements.hip} / 身高 ${customMeasurements.height} cm)`
      : size;

  return (
    <Document
      title={`${styleCode} Tech Pack`}
      author="MaxLuLu AI"
      subject="Garment Technical Package"
    >
      {/* ======================= P1 Cover ======================= */}
      <Page size="A4" style={styles.page}>
        <Frame styleCode={styleCode} date={date} pageNo={1} totalPages={TOTAL_PAGES}>
          <Text style={styles.h1}>MaxLuLu AI</Text>
          <Text style={styles.h1Sub}>TECH PACK · 技术包</Text>

          <View style={{ marginHorizontal: 60, marginTop: 10 }}>
            <CoverRow k="款号 Style Code" v={styleCode} />
            <CoverRow k="款名 Style Name" v={styleName} />
            <CoverRow k="季节 Season" v={season} />
            <CoverRow k="面料 Fabric" v={`${fabric.name} · ${fabric.composition} · ${fabric.gsm}`} />
            <CoverRow k="裙型 Silhouette" v={`${skirtType.name} (${skirtType.enName})`} />
            <CoverRow k="尺码 Size" v={sizeLabel} />
            <CoverRow k="建议零售价" v={`¥ ${price}`} />
            <CoverRow k="日期 Date" v={date} />
          </View>

          {printImageUrl ? <Image src={printImageUrl} style={styles.coverThumb} /> : null}
          <Text style={[styles.pMuted, { textAlign: "center", marginTop: 6 }]}>
            Print Reference — 印花预览
          </Text>
        </Frame>
      </Page>

      {/* ======================= P2 Print Design ======================= */}
      <Page size="A4" style={styles.page}>
        <Frame styleCode={styleCode} date={date} pageNo={2} totalPages={TOTAL_PAGES}>
          <Text style={styles.h2}>印花设计 Print Design</Text>
          {printImageUrl ? <Image src={printImageUrl} style={styles.printImage} /> : null}

          <Text style={styles.h3}>印花描述 Print Description</Text>
          <Text style={styles.p}>{printDescription || "—"}</Text>

          <Text style={styles.h3}>色彩风格 Color Story</Text>
          <Text style={styles.p}>
            由 AI 根据用户描述生成; 工厂打样时按印花图色号取色, 偏差 ≤ ΔE 3.0。
          </Text>

          <View style={styles.calloutBox}>
            <Text style={styles.p}>
              循环单元建议 Repeat Unit: 30cm × 30cm @ 300 DPI, 文件格式 TIFF / PDF, CMYK 色模式。
            </Text>
            <Text style={styles.pMuted}>
              打印前需提供分色稿与色卡 (Pantone TCX), 初样通过后批量生产。
            </Text>
          </View>

          {vectorFileUrl ? (
            <>
              <Text style={styles.h3}>印花源文件 Production Vector</Text>
              <Text style={styles.p}>
                矢量分色文件 (.ai 格式) 已生成, 共 {colorAnalysis?.length ?? 0} 个分色层。
              </Text>
              <Text style={[styles.pMuted, { marginBottom: 6 }]}>
                下载链接 Download: {vectorFileUrl}
              </Text>
            </>
          ) : null}

          {colorAnalysis && colorAnalysis.length > 0 ? (
            <>
              <Text style={styles.h3}>分色表 Color Separation</Text>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.cellHeader, { width: 28 }]}>#</Text>
                  <Text style={[styles.cellHeader, { width: 34 }]}>色块</Text>
                  <Text style={[styles.cellHeader, { width: 110 }]}>Pantone TPX</Text>
                  <Text style={[styles.cellHeader, { flex: 1 }]}>颜色名称 Name</Text>
                  <Text style={[styles.cellHeader, { width: 60, textAlign: "right" }]}>
                    占比 %
                  </Text>
                </View>
                {colorAnalysis.map((c, i) => (
                  <View
                    key={`${c.pantoneCode}-${i}`}
                    style={styles.tableRow}
                    wrap={false}
                  >
                    <Text style={[styles.cell, { width: 28 }]}>{i + 1}</Text>
                    <View
                      style={[
                        styles.cell,
                        { width: 34, justifyContent: "center" },
                      ]}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 14,
                          backgroundColor: c.hex,
                          borderWidth: 0.5,
                          borderColor: "#9ca3af",
                        }}
                      />
                    </View>
                    <Text style={[styles.cell, { width: 110 }]}>
                      {c.pantoneCode}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      {c.pantoneName}
                    </Text>
                    <Text style={[styles.cell, { width: 60, textAlign: "right" }]}>
                      {c.percentage.toFixed(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </Frame>
      </Page>

      {/* ======================= P3 Style Spec ======================= */}
      <Page size="A4" style={styles.page}>
        <Frame styleCode={styleCode} date={date} pageNo={3} totalPages={TOTAL_PAGES}>
          <Text style={styles.h2}>款式说明 Style Specification</Text>

          <View>
            <StyleRow k="裙型 Silhouette" v={`${skirtType.name} · ${skirtType.enName}`} />
            <StyleRow k="领型 Neckline" v={`${neckline.name} · ${neckline.enName}`} />
            <StyleRow k="袖型 Sleeve" v={`${sleeveType.name} · ${sleeveType.enName}`} />
            <StyleRow k="裙长 Length" v={`${skirtLength.name} · M 码参考 ${skirtLength.refLengthCm}cm`} />
            <StyleRow k="主面料 Fabric" v={`${fabric.name} · ${fabric.composition} · ${fabric.gsm}`} />
          </View>

          <Text style={[styles.pMuted, { marginTop: 18 }]}>
            注: Phase 1 以文字描述为主, 矢量结构线稿 (Technical Flat) 于 Phase 2 版本补充;
            工厂可根据上述版型组合结合 POM 表样片打板。
          </Text>
        </Frame>
      </Page>

      {/* ======================= P4 BOM ======================= */}
      <Page size="A4" style={styles.page}>
        <Frame styleCode={styleCode} date={date} pageNo={4} totalPages={TOTAL_PAGES}>
          <Text style={styles.h2}>物料清单 Bill of Materials</Text>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cellHeader, { width: 26 }]}>#</Text>
              <Text style={[styles.cellHeader, { width: 80 }]}>物料名称</Text>
              <Text style={[styles.cellHeader, { flex: 1 }]}>规格</Text>
              <Text style={[styles.cellHeader, { width: 80 }]}>用量</Text>
              <Text style={[styles.cellHeader, { width: 110 }]}>位置</Text>
            </View>
            {bomItems.map((b, i) => (
              <View
                key={`${b.item}-${i}`}
                style={styles.tableRow}
                wrap={false}
              >
                <Text style={[styles.cell, { width: 26 }]}>{i + 1}</Text>
                <Text style={[styles.cell, { width: 80 }]}>{b.item}</Text>
                <Text style={[styles.cell, { flex: 1 }]}>{b.spec}</Text>
                <Text style={[styles.cell, { width: 80 }]}>{b.quantity}</Text>
                <Text style={[styles.cell, { width: 110 }]}>{b.placement}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.pMuted, { marginTop: 14 }]}>
            以上辅料供应商由工厂按 MaxLuLu 标准自行对接; 首批下单前需将所有样品寄回品牌方核对。
          </Text>
        </Frame>
      </Page>

      {/* ======================= P5 POM / Size Spec ======================= */}
      <Page size="A4" style={styles.page}>
        <Frame styleCode={styleCode} date={date} pageNo={5} totalPages={TOTAL_PAGES}>
          <Text style={styles.h2}>尺寸规格表 Size Spec (POM)</Text>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cellHeader, { flex: 1.4 }]}>POM</Text>
              {SIZE_CODES.map((s) => (
                <Text key={s} style={[styles.cellHeader, { width: 36, textAlign: "center" }]}>
                  {s}
                </Text>
              ))}
              <Text style={[styles.cellHeader, { width: 36, textAlign: "center" }]}>公差 ±</Text>
            </View>
            {POM_DEFINITIONS.map((pom) => (
              <View key={pom.id} style={styles.tableRow} wrap={false}>
                <Text style={[styles.cell, { flex: 1.4 }]}>{pom.name}</Text>
                {SIZE_CODES.map((s) => (
                  <Text
                    key={s}
                    style={[styles.cell, { width: 36, textAlign: "center" }]}
                  >
                    {formatNum(pomData[s]?.[pom.id])}
                  </Text>
                ))}
                <Text style={[styles.cell, { width: 36, textAlign: "center" }]}>
                  {pom.tolerance.toFixed(1)}
                </Text>
              </View>
            ))}
          </View>

          {size === "custom" && customMeasurements ? (
            <View style={styles.calloutBox}>
              <Text style={styles.p}>
                本单采用自定义尺码 Custom Measurements:
              </Text>
              <Text style={styles.p}>
                胸围 Bust {customMeasurements.bust}cm · 腰围 Waist {customMeasurements.waist}cm ·
                臀围 Hip {customMeasurements.hip}cm · 身高 Height {customMeasurements.height}cm
              </Text>
              <Text style={styles.pMuted}>
                工厂需以客户实测三围为准进行单件打板, 上方标准表仅作基础参考。
              </Text>
            </View>
          ) : (
            <Text style={[styles.pMuted, { marginTop: 12 }]}>
              本单客户下单尺码: {sizeLabel}。量衣需符合以上规格, 超出公差请反馈品牌方确认。
            </Text>
          )}
        </Frame>
      </Page>

      {/* ======================= P6 Construction ======================= */}
      <Page size="A4" style={styles.page}>
        <Frame styleCode={styleCode} date={date} pageNo={6} totalPages={TOTAL_PAGES}>
          <Text style={styles.h2}>缝制工艺 Construction</Text>

          <Text style={styles.h3}>
            款式专项工艺 Style-specific — {skirtType.name} ({skirtType.enName})
          </Text>
          {constructionNotes.split(/\n+/).map((line, i) => (
            <Text key={i} style={styles.p}>
              {line}
            </Text>
          ))}

          <Text style={styles.h3}>通用工艺要求 Common Requirements</Text>
          {COMMON_CONSTRUCTION_NOTES.map((line, i) => (
            <Text key={i} style={styles.bullet}>
              • {line}
            </Text>
          ))}
        </Frame>
      </Page>

      {/* ======================= P7 Labels & Packaging ======================= */}
      <Page size="A4" style={styles.page}>
        <Frame styleCode={styleCode} date={date} pageNo={7} totalPages={TOTAL_PAGES}>
          <Text style={styles.h2}>标签 · 包装 Labels & Packaging</Text>

          <Section
            title={PACKAGING_TEMPLATE.brandLabel.title}
            body={PACKAGING_TEMPLATE.brandLabel.spec}
          />
          <Section
            title={PACKAGING_TEMPLATE.careLabel.title}
            body={careLabelBody}
          />
          <Section
            title={PACKAGING_TEMPLATE.sizeLabel.title}
            body={PACKAGING_TEMPLATE.sizeLabel.spec}
          />
          <Section
            title={PACKAGING_TEMPLATE.hangTag.title}
            body={PACKAGING_TEMPLATE.hangTag.spec}
          />
          <Section
            title={PACKAGING_TEMPLATE.packaging.title}
            body={PACKAGING_TEMPLATE.packaging.spec}
          />

          <View style={styles.calloutBox}>
            <Text style={styles.pMuted}>
              包装细节以品牌方最终下发的 Visual Guide 为准; 礼盒装订单由品牌方指定包装供应商统一发货。
            </Text>
          </View>
        </Frame>
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Small leaf components.
// ---------------------------------------------------------------------------

function CoverRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvKey}>{k}</Text>
      <Text style={styles.kvVal}>{v}</Text>
    </View>
  );
}

function StyleRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvKey}>{k}</Text>
      <Text style={styles.kvVal}>{v}</Text>
    </View>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.h3}>{title}</Text>
      <Text style={styles.p}>{body}</Text>
    </View>
  );
}

function formatNum(n: number | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toFixed(1);
}
