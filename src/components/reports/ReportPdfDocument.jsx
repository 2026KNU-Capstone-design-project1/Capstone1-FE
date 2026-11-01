import {
  Document,
  Font,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import coverBackground from '../../assets/report-cover-background.png';
import contentBackground from '../../assets/report-content-background.png';
import notoSansKrBold from '../../assets/fonts/NotoSansKR-Bold.ttf';
import notoSansKrRegular from '../../assets/fonts/NotoSansKR-Regular.ttf';

const COLORS = {
  navy: '#0b2947',
  text: '#173653',
  muted: '#60758a',
  orange: '#ff7019',
  red: '#ff3f49',
  blue: '#2488ef',
  pale: '#f5f8fb',
  border: '#d9e3ec',
  line: '#9ab0c3',
  white: '#ffffff',
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const DETAIL_IMAGE_WIDTH = 232;
const DETAIL_IMAGE_HEIGHT = 236;
const ANALYSIS_PANEL_HEIGHT = 260;

function resolvePdfAsset(asset) {
  const fileName = asset.split('/').at(-1);
  const embeddedAsset = globalThis.__REPORT_PDF_ASSETS__?.[fileName];
  if (embeddedAsset) return embeddedAsset;
  const nodeAssetBase = typeof process !== 'undefined' ? process.env.REPORT_PDF_ASSET_BASE : '';
  if (!nodeAssetBase) return asset;
  const separator = nodeAssetBase.includes('\\') ? '\\' : '/';
  return `${nodeAssetBase}${separator}${fileName}`;
}

Font.register({
  family: 'Noto Sans KR',
  fonts: [
    { src: resolvePdfAsset(notoSansKrRegular), fontWeight: 400 },
    { src: resolvePdfAsset(notoSansKrBold), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    backgroundColor: COLORS.white,
    color: COLORS.navy,
    fontFamily: 'Noto Sans KR',
    fontSize: 9,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  pageCanvas: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  header: {
    position: 'absolute',
    top: 19,
    left: 31,
    width: 533,
    height: 28,
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  brandRow: { position: 'relative', top: -3, flexDirection: 'row', alignItems: 'center' },
  brand: { fontSize: 17, fontWeight: 700, letterSpacing: -0.6 },
  brandSub: { marginLeft: 5, paddingTop: 4, fontSize: 12, color: COLORS.text },
  headerTitle: { marginTop: 4, fontSize: 7.5, color: COLORS.text },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 27,
    width: 541,
    height: 28,
    borderTopWidth: 0.7,
    borderTopColor: COLORS.line,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  footerBrand: { fontSize: 11, fontWeight: 700 },
  footerText: { marginLeft: 7, fontSize: 7, color: COLORS.text },
  footerDivider: { marginHorizontal: 10, color: COLORS.line },
  footerRight: { flexDirection: 'row', alignItems: 'center', fontSize: 7, color: COLORS.text },
  pageNumber: { marginLeft: 9, fontSize: 10, fontWeight: 700 },
  titleAccent: { color: COLORS.orange },
  sectionHeading: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeadingText: { fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  sectionHeadingLine: { flexGrow: 1, height: 0.7, marginLeft: 8, backgroundColor: COLORS.line },
  panel: {
    borderWidth: 0.7,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: '#fbfcfd',
  },
  panelTitle: { fontSize: 11, fontWeight: 700 },
});

function reportMonth(value) {
  const [year, month] = value.split('.');
  return `${year}년 ${Number(month)}월`;
}

function coverTitle(value) {
  return value.replace(/^(?:\d{4}년\s*)?\d{1,2}월\s*/, '');
}

function splitHighlightedTitle(value) {
  const keyword = ['위험성평가', '안전점검', '위험'].find(item => value.includes(item));
  if (!keyword) return { before: value, keyword: '', after: '' };
  const [before, after] = value.split(keyword);
  return { before, keyword, after };
}

function Header({ title }) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>VIRNECT</Text>
        <Text style={styles.brandSub}>Industrial Safety</Text>
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function Footer({ month, pageNumber }) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerLeft}>
        <Text style={styles.footerBrand}>VIRNECT</Text>
        <Text style={styles.footerText}>Industrial Safety</Text>
        <Text style={styles.footerDivider}>|</Text>
        <Text style={styles.footerText}>사람과 현장을 지키는 스마트 산업안전 플랫폼</Text>
      </View>
      <View style={styles.footerRight}>
        <Text>{month} 종합 위험성평가 보고서</Text>
        <Text style={styles.footerDivider}>|</Text>
        <Text style={styles.pageNumber}>{pageNumber}</Text>
      </View>
    </View>
  );
}

function SectionHeading({ children }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionHeadingText}>{children}</Text>
      <View style={styles.sectionHeadingLine} />
    </View>
  );
}

function CoverPage({ data }) {
  const highlighted = splitHighlightedTitle(coverTitle(data.title));
  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <View style={styles.pageCanvas} />
      <Image src={resolvePdfAsset(coverBackground)} style={styles.background} />

      <View style={{ position: 'absolute', top: 45, left: 45 }}>
        <Text style={{ fontSize: 30, fontWeight: 700, color: COLORS.white, letterSpacing: -1.4 }}>VIRNECT</Text>
        <Text style={{ marginTop: 1, fontSize: 12, color: '#c4cfdb' }}>Industrial Safety</Text>
      </View>

      <View style={{ position: 'absolute', top: 46, right: 38, width: 125 }}>
        <Text style={{ fontSize: 9.5, lineHeight: 1.45, color: '#c7d0db' }}>사람과 현장을 지키는{`\n`}스마트 산업안전 플랫폼</Text>
        <View style={{ width: 19, height: 2, marginTop: 12, marginBottom: 10, backgroundColor: COLORS.orange }} />
        <Text style={{ fontSize: 8.5, lineHeight: 1.3, color: '#c7d0db' }}>SMART SAFETY{`\n`}SAFER PEOPLE{`\n`}SUSTAINABLE TOMORROW</Text>
      </View>

      <View style={{ position: 'absolute', top: 165, left: 45, width: 500 }}>
        <Text style={{ fontSize: 34, fontWeight: 700, color: COLORS.white, letterSpacing: -1.2 }}>{reportMonth(data.analysisEnd)}</Text>
        <Text style={{ marginTop: -3, fontSize: 31, fontWeight: 700, color: COLORS.white, letterSpacing: -1 }}>
          {highlighted.before}<Text style={styles.titleAccent}>{highlighted.keyword}</Text>{highlighted.after}
        </Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: '#c5d0dc' }}>{data.siteName}</Text>
      </View>

      <View style={{ position: 'absolute', top: 338, left: 46, width: 260 }}>
        <View style={{ borderLeftWidth: 1, borderLeftColor: '#c8d1db', paddingLeft: 12 }}>
          <Text style={{ fontSize: 10, color: '#f2f5f8' }}>보고 기간</Text>
          <Text style={{ marginTop: 4, fontSize: 11, color: COLORS.white }}>{data.analysisStart} ~ {data.analysisEnd}</Text>
        </View>
        <View style={{ marginTop: 21, borderLeftWidth: 1, borderLeftColor: '#c8d1db', paddingLeft: 12 }}>
          <Text style={{ fontSize: 10, color: '#f2f5f8' }}>작성일</Text>
          <Text style={{ marginTop: 4, fontSize: 11, color: COLORS.white }}>{data.createdAt}</Text>
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 88, left: 45, width: 180 }}>
        <View style={{ width: 19, height: 2, marginBottom: 12, backgroundColor: COLORS.orange }} />
        <Text style={{ fontSize: 9.5, lineHeight: 1.4, color: '#c7d0db' }}>안전한 현장이{`\n`}지속 가능한 내일을 만듭니다.</Text>
        <Text style={{ marginTop: 10, fontSize: 9, lineHeight: 1.3, color: '#c7d0db' }}>SAFE OPERATIONS{`\n`}SUSTAINABLE GROWTH</Text>
      </View>

      <View style={{ position: 'absolute', right: 34, bottom: 28, left: 34, borderTopWidth: 0.6, borderTopColor: '#6d8195', paddingTop: 10, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: 700, color: COLORS.white }}>VIRNECT</Text>
        <Text style={{ marginLeft: 8, fontSize: 8, color: '#c4cfdb' }}>Industrial Safety</Text>
        <Text style={{ marginHorizontal: 10, fontSize: 8, color: '#6d8195' }}>|</Text>
        <Text style={{ fontSize: 8, color: '#c4cfdb' }}>산업의 오늘을 더 안전하게, 내일을 더 크게</Text>
      </View>
    </Page>
  );
}

function MetricCard({ metric }) {
  return (
    <View style={[styles.panel, { width: 127, height: 94, padding: 14 }]}>
      <Text style={{ fontSize: 10, color: COLORS.text }}>{metric.label}</Text>
      <Text style={{ marginTop: 10, fontSize: metric.value.length > 7 ? 20 : 24, fontWeight: 700 }}>{metric.value}</Text>
      {metric.change ? (
        <Text style={{ marginTop: 8, fontSize: 8.5, color: COLORS.red }}>▲ {metric.change}</Text>
      ) : (
        <Text style={{ marginTop: 7, fontSize: 8.5, color: COLORS.text }}>{metric.subtext}</Text>
      )}
    </View>
  );
}

function InsightCard({ insight }) {
  const compactValue = insight.value.length > 5;
  return (
    <View style={[styles.panel, { width: 127, height: 104, padding: 13 }]}>
      <Text style={{ fontSize: 9.2, color: COLORS.text }}>{insight.label}</Text>
      <Text style={{ marginTop: 6, fontSize: compactValue ? 11.3 : 17, lineHeight: 1.2, fontWeight: 700 }}>{insight.value}</Text>
      <View style={{ width: 18, height: 1.5, marginTop: 5, marginBottom: 5, backgroundColor: COLORS.orange }} />
      <Text style={{ fontSize: 7.1, lineHeight: 1.4, color: COLORS.text }}>{insight.detail}</Text>
    </View>
  );
}

function PriorityTable({ rows }) {
  const widths = [88, 150, 135, 82, 76];
  const headers = ['위험 ID', '위험 내용', '위치', '위험 등급', '처리 상태'];
  return (
    <View style={{ borderWidth: 0.7, borderColor: COLORS.border }}>
      <View style={{ height: 28, flexDirection: 'row', backgroundColor: '#173f58' }}>
        {headers.map((header, index) => (
          <View key={header} style={{ width: widths[index], borderRightWidth: index === headers.length - 1 ? 0 : 0.5, borderRightColor: '#7391a5', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 8.5, color: COLORS.white }}>{header}</Text>
          </View>
        ))}
      </View>
      {rows.map(row => (
        <View key={row.id} style={{ height: 28, flexDirection: 'row', borderTopWidth: 0.6, borderTopColor: COLORS.border, backgroundColor: COLORS.white }}>
          {[row.id, row.content, row.location].map((value, index) => (
            <View key={`${row.id}-${index}`} style={{ width: widths[index], borderRightWidth: 0.5, borderRightColor: COLORS.border, paddingHorizontal: 8, justifyContent: 'center' }}>
              <Text style={{ fontSize: 8.2, color: COLORS.text }}>{value}</Text>
            </View>
          ))}
          <View style={{ width: widths[3], borderRightWidth: 0.5, borderRightColor: COLORS.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 8.5, color: COLORS.red }}>{row.severity}</Text>
          </View>
          <View style={{ width: widths[4], alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 55, height: 19, borderRadius: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: row.status === '미처리' ? '#ffe0e3' : '#dcebfd' }}>
              <Text style={{ fontSize: 8.5, color: row.status === '미처리' ? COLORS.red : COLORS.blue }}>{row.status}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function SummaryPage({ data }) {
  const month = reportMonth(data.analysisEnd);
  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <View style={styles.pageCanvas} />
      <Image src={resolvePdfAsset(contentBackground)} style={styles.background} />

      <View style={{ position: 'absolute', top: 15, left: 32, right: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={styles.brandRow}>
          <Text style={[styles.brand, { color: COLORS.white }]}>VIRNECT</Text>
          <Text style={[styles.brandSub, { color: COLORS.white }]}>Industrial Safety</Text>
        </View>
        <Text style={{ fontSize: 7.5, color: COLORS.white }}>{month} 종합 위험성평가 보고서  |  {data.siteName}</Text>
      </View>

      <View style={{ position: 'absolute', top: 75, left: 33, width: 500 }}>
        <Text style={{ fontSize: 25, fontWeight: 700, letterSpacing: -0.8 }}>1. 종합 위험 현황 및 <Text style={styles.titleAccent}>핵심 인사이트</Text></Text>
        <Text style={{ marginTop: 1, fontSize: 10.5, lineHeight: 1.5, color: COLORS.text }}>{month} 한 달간 탐지된 위험 현황을 종합적으로 분석하고,{`\n`}주요 관리 사항과 우선 개선이 필요한 위험을 제시합니다.</Text>
      </View>

      <View style={{ position: 'absolute', top: 181, left: 27, width: 541 }}>
        <SectionHeading>1-1. 전체 위험 현황 요약</SectionHeading>
        <View style={{ marginTop: 5, flexDirection: 'row', gap: 11 }}>
          {data.summary.metrics.map(metric => <MetricCard key={metric.label} metric={metric} />)}
        </View>
      </View>

      <View style={{ position: 'absolute', top: 317, left: 27, width: 541 }}>
        <SectionHeading>1-2. 핵심 인사이트</SectionHeading>
        <View style={{ marginTop: 5, flexDirection: 'row', gap: 11 }}>
          {data.summary.insights.map(insight => <InsightCard key={insight.label} insight={insight} />)}
        </View>
      </View>

      <View style={{ position: 'absolute', top: 463, left: 27, width: 541 }}>
        <SectionHeading>1-3. 우선 개선 필요 위험</SectionHeading>
        <View style={{ marginTop: 5 }}><PriorityTable rows={data.summary.priorityRisks} /></View>
        
      </View>

      <View style={{ position: 'absolute', top: 625, left: 27, width: 541 }}>
        <SectionHeading>1-4. 종합 분석 및 관리 권고</SectionHeading>
        <View style={[styles.panel, { marginTop: 5, height: 92, padding: 18, backgroundColor: COLORS.white }]}>
          <Text style={{ fontSize: 12, fontWeight: 700 }}>종합 관리 의견</Text>
          <Text style={{ marginTop: 8, fontSize: 8.5, lineHeight: 1.55, color: COLORS.text }}>{data.summary.managementComment}</Text>
        </View>
      </View>

      <Footer month={month} pageNumber={2} />
    </Page>
  );
}

function AnalysisNarrativePanel({ narrative, height }) {
  return (
    <View style={[styles.panel, { width: 251, height, padding: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 3, height: 14, marginRight: 7, backgroundColor: COLORS.orange }} />
        <Text style={{ fontSize: 10.8, fontWeight: 700 }}>{narrative.panelTitle}</Text>
      </View>
      <View style={{ flex: 1, marginTop: 9, justifyContent: 'space-between' }}>
        {narrative.items.map((item, index) => (
          <View key={item.id} style={{ paddingTop: index === 0 ? 0 : 8, borderTopWidth: index === 0 ? 0 : 0.5, borderTopColor: COLORS.border }}>
            <Text style={{ fontSize: 8.7, fontWeight: 700, color: index === narrative.items.length - 1 ? COLORS.orange : COLORS.navy }}>{item.title}</Text>
            <Text style={{ marginTop: 3, fontSize: 7.1, lineHeight: 1.45, color: COLORS.text }}>{item.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AreaBarChart({ data }) {
  const max = Math.max(...data.map(item => item.count));
  return (
    <View style={{ marginTop: 5, height: 150, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
      {data.map((item, index) => {
        const height = 92 * item.count / max;
        return (
          <View key={item.label} style={{ width: 37, height: 140, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ marginBottom: 4, fontSize: 8.5, fontWeight: 700 }}>{item.count}</Text>
            <View style={{ width: 30, height, borderRadius: 2, backgroundColor: index === 0 ? COLORS.orange : '#91b3d7' }} />
            <Text style={{ marginTop: 6, fontSize: 7.5 }}>{item.label}</Text>
            <Text style={{ marginTop: 2, fontSize: 7 }}>({item.ratio}%)</Text>
          </View>
        );
      })}
    </View>
  );
}

function polarPoint(radius, angle) {
  const radians = angle * Math.PI / 180;
  return {
    x: 67.5 + radius * Math.cos(radians),
    y: 67.5 + radius * Math.sin(radians),
  };
}

function donutPath(startAngle, endAngle) {
  const outerRadius = 53;
  const innerRadius = 31;
  const outerStart = polarPoint(outerRadius, startAngle);
  const outerEnd = polarPoint(outerRadius, endAngle);
  const innerEnd = polarPoint(innerRadius, endAngle);
  const innerStart = polarPoint(innerRadius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function DonutChart({ data, total }) {
  const segments = data.reduce((result, item) => {
    const previous = result.at(-1);
    const startAngle = previous ? previous.endAngle : -90;
    const endAngle = startAngle + item.ratio * 3.6;
    const segment = { ...item, startAngle, endAngle };
    return [...result, segment];
  }, []);

  return (
    <View style={{ position: 'relative', width: 135, height: 135 }}>
      <Svg width="135" height="135" viewBox="0 0 135 135">
        {segments.map(segment => (
          <Path
            key={segment.label}
            d={donutPath(segment.startAngle, segment.endAngle)}
            fill={segment.color}
          />
        ))}
      </Svg>
      <View style={{ position: 'absolute', top: 48, left: 42, width: 51, alignItems: 'center' }}>
        <Text style={{ fontSize: 7.5 }}>전체</Text>
        <Text style={{ marginTop: 3, fontSize: 14, fontWeight: 700 }}>{total}건</Text>
      </View>
    </View>
  );
}

function AnalysisPage({ data }) {
  const month = reportMonth(data.analysisEnd);
  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <View style={styles.pageCanvas} />
      <Header title={`${month} 종합 위험성평가 보고서`} />

      <View style={{ position: 'absolute', top: 70, left: 31, width: 520 }}>
        <View style={{ width: 28, height: 3, marginBottom: 13, backgroundColor: COLORS.orange }} />
        <Text style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.8 }}>2. 구역별 및 유형별 <Text style={styles.titleAccent}>위험 분석</Text></Text>
        <Text style={{ marginTop: 1, fontSize: 10, lineHeight: 1.5, color: COLORS.text }}>{month} 동안 탐지된 위험을 구역별, 유형별로 분석하여{`\n`}주요 위험이 발생한 위치와 유형의 특성을 파악하였습니다.</Text>
      </View>

      <View style={{ position: 'absolute', top: 181, left: 30, width: 535 }}>
        <SectionHeading>2-1. 구역별 위험 분석</SectionHeading>
        <View style={{ marginTop: 5, flexDirection: 'row', gap: 7 }}>
          <View style={[styles.panel, { width: 277, height: ANALYSIS_PANEL_HEIGHT, padding: 13 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
              <Text style={styles.panelTitle}>구역별 위험 발생 건수</Text>
              <Text style={{ fontSize: 7 }}>단위: 건</Text>
            </View>
            <AreaBarChart data={data.analysis.areas} />
          </View>
          <AnalysisNarrativePanel narrative={data.analysis.areaNarrative} height={ANALYSIS_PANEL_HEIGHT} />
        </View>
      </View>

      <View style={{ position: 'absolute', top: 475, left: 30, width: 535 }}>
        <SectionHeading>2-2. 위험 유형별 분석</SectionHeading>
        <View style={{ marginTop: 5, flexDirection: 'row', gap: 7 }}>
          <View style={[styles.panel, { width: 277, height: ANALYSIS_PANEL_HEIGHT, padding: 13 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 }}>
              <Text style={styles.panelTitle}>유형별 위험 발생 비율</Text>
              <Text style={{ fontSize: 7 }}>단위: 건, %</Text>
            </View>
            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
              <DonutChart data={data.analysis.types} total={data.totalRiskCount} />
              <View style={{ marginLeft: 7, width: 103, gap: 8 }}>
                {data.analysis.types.map(item => (
                  <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: item.color }} />
                    <Text style={{ width: 47, marginLeft: 6, fontSize: 7.3 }}>{item.label}</Text>
                    <Text style={{ fontSize: 7.3 }}>{item.count} ({item.ratio}%)</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <AnalysisNarrativePanel narrative={data.analysis.typeNarrative} height={ANALYSIS_PANEL_HEIGHT} />
        </View>
      </View>

      <Footer month={month} pageNumber={3} />
    </Page>
  );
}

function bboxRatio(risk) {
  const bbox = risk.bbox ?? { x: 0, y: 0, width: 0, height: 0, unit: 'ratio' };
  const ratioUnit = bbox.unit === 'ratio' || [bbox.x, bbox.y, bbox.width, bbox.height].every(value => value >= 0 && value <= 1);
  if (ratioUnit) return bbox;
  return {
    x: bbox.x / risk.imageWidth,
    y: bbox.y / risk.imageHeight,
    width: bbox.width / risk.imageWidth,
    height: bbox.height / risk.imageHeight,
  };
}

function BboxImage({ risk }) {
  const sourceWidth = risk.imageWidth || 1;
  const sourceHeight = risk.imageHeight || 1;
  const scale = Math.min(DETAIL_IMAGE_WIDTH / sourceWidth, DETAIL_IMAGE_HEIGHT / sourceHeight);
  const imageWidth = sourceWidth * scale;
  const imageHeight = sourceHeight * scale;
  const imageLeft = (DETAIL_IMAGE_WIDTH - imageWidth) / 2;
  const imageTop = (DETAIL_IMAGE_HEIGHT - imageHeight) / 2;
  const bbox = bboxRatio(risk);

  return (
    <View style={{ position: 'relative', width: DETAIL_IMAGE_WIDTH, height: DETAIL_IMAGE_HEIGHT, overflow: 'hidden', backgroundColor: '#172b3c' }}>
      <Image
        src={resolvePdfAsset(risk.imageUrl)}
        style={{ position: 'absolute', left: imageLeft, top: imageTop, width: imageWidth, height: imageHeight }}
      />
      <View
        style={{
          position: 'absolute',
          left: imageLeft + bbox.x * imageWidth,
          top: imageTop + bbox.y * imageHeight,
          width: bbox.width * imageWidth,
          height: bbox.height * imageHeight,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: '#ff4955',
        }}
      />
    </View>
  );
}

function statusMeta(status) {
  if (status === '미처리') return { color: COLORS.red, background: '#ffe1e4' };
  if (status === '처리중') return { color: COLORS.blue, background: '#e0efff' };
  return { color: '#15936a', background: '#dff5ec' };
}

function severityMeta(severity) {
  if (severity === 'HIGH') return { color: COLORS.red, background: '#ffe1e4' };
  if (severity === 'MEDIUM') return { color: '#e87919', background: '#ffe7cd' };
  return { color: '#2477b8', background: '#e0efff' };
}

function DetailRow({ label, children, height, accent = false }) {
  return (
    <View style={{ minHeight: height, flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: COLORS.border }}>
      <View style={{ width: 68, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
        <Text style={{ fontSize: 7.5, fontWeight: 700 }}>{label}</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 8, justifyContent: 'center' }}>
        <Text style={{ fontSize: 7.3, lineHeight: 1.4, color: accent ? COLORS.orange : COLORS.text }}>{children}</Text>
      </View>
    </View>
  );
}

function RiskCard({ risk }) {
  const status = statusMeta(risk.status);
  const severity = severityMeta(risk.severity);
  return (
    <View style={{ height: 282, borderWidth: 0.8, borderColor: '#cbd9e5', borderRadius: 4, overflow: 'hidden' }} wrap={false}>
      <View style={{ height: 35, paddingRight: 9, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7f9fb' }}>
        <View style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.orange }}>
          <Text style={{ fontSize: 15, fontWeight: 700, color: COLORS.white }}>{String(risk.sequence).padStart(2, '0')}</Text>
        </View>
        <Text style={{ marginLeft: 14, fontSize: 12.5, fontWeight: 700 }}>{risk.id}</Text>
        <View style={{ width: 0.7, height: 17, marginHorizontal: 12, backgroundColor: '#7da0c1' }} />
        <Text style={{ flex: 1, fontSize: 12.5, fontWeight: 700 }}>{risk.title}</Text>
        <Text style={{ marginRight: 7, fontSize: 7.2, fontWeight: 700 }}>위험등급</Text>
        <View style={{ width: 61, height: 21, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: severity.background }}>
          <Text style={{ fontSize: 8.5, fontWeight: 700, color: severity.color }}>{risk.severity}</Text>
        </View>
        <Text style={{ marginRight: 7, marginLeft: 14, fontSize: 7.2, fontWeight: 700 }}>처리상태</Text>
        <View style={{ width: 61, height: 21, borderRadius: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 0.8, borderColor: status.color, backgroundColor: status.background }}>
          <Text style={{ fontSize: 8.5, fontWeight: 700, color: status.color }}>{risk.status}</Text>
        </View>
      </View>

      <View style={{ height: 247, padding: 6, flexDirection: 'row', gap: 7 }}>
        <BboxImage risk={risk} />
        <View style={{ flex: 1, height: DETAIL_IMAGE_HEIGHT, borderTopWidth: 0.6, borderRightWidth: 0.6, borderLeftWidth: 0.6, borderColor: COLORS.border }}>
          <DetailRow label="작업명" height={28}>{risk.jobName}</DetailRow>
          <DetailRow label="재해유형" height={28} accent>{risk.accidentType}</DetailRow>
          <DetailRow label="위치" height={28}>{risk.location}</DetailRow>
          <DetailRow label="최초 발견일" height={28}>{risk.firstDetected}</DetailRow>
          <DetailRow label="위험내용" height={42}>{risk.description}</DetailRow>
          <DetailRow label="권고 조치" height={43}>{risk.recommendation}</DetailRow>
          <DetailRow label="법적사항" height={39}>{risk.legalBasis}</DetailRow>
        </View>
      </View>
    </View>
  );
}

function chunkRisks(risks) {
  const chunks = [];
  for (let index = 0; index < risks.length; index += 2) chunks.push(risks.slice(index, index + 2));
  return chunks;
}

function DetailPage({ data, risks, pageNumber }) {
  const month = reportMonth(data.analysisEnd);
  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <View style={styles.pageCanvas} />
      <Header title={`${month} 종합 위험성평가 보고서`} />
      <View style={{ position: 'absolute', top: 70, left: 34, width: 510 }}>
        <View style={{ width: 27, height: 3, marginBottom: 13, backgroundColor: COLORS.orange }} />
        <Text style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.8 }}>3. 개별 위험 상세 요약</Text>
        <Text style={{ marginTop: 1, fontSize: 9.5, lineHeight: 1.5, color: COLORS.text }}>{month}에 탐지된 주요 위험 사례 중 위험도와 현장 영향도가 높은{`\n`}사례를 선정하여 요약하였습니다.</Text>
      </View>
      <View style={{ position: 'absolute', top: 180, left: 27, width: 541, gap: 25 }}>
        {risks.map(risk => <RiskCard key={risk.id} risk={risk} />)}
      </View>
      <Footer month={month} pageNumber={pageNumber} />
    </Page>
  );
}

export function ReportPdfDocument({ data }) {
  const riskPages = chunkRisks(data.risks);
  return (
    <Document
      title={data.title}
      author="VIRNECT Industrial Safety"
      subject={`${reportMonth(data.analysisEnd)} 종합 위험성평가 보고서`}
      creator="VIRNECT Industrial Safety"
    >
      <CoverPage data={data} />
      <SummaryPage data={data} />
      <AnalysisPage data={data} />
      {riskPages.map((risks, index) => (
        <DetailPage key={risks[0].id} data={data} risks={risks} pageNumber={index + 4} />
      ))}
    </Document>
  );
}

