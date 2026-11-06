import { Document, Font, Image, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import notoSansKrBold from '../../assets/fonts/NotoSansKR-Bold.ttf';
import notoSansKrRegular from '../../assets/fonts/NotoSansKR-Regular.ttf';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const IMAGE_BOX = { left: 25, top: 157, width: 545, height: 327 };
const COLORS = {
  navy: '#0b2745',
  orange: '#ff6b1a',
  border: '#aeb7c1',
  label: '#f1f3f5',
  white: '#ffffff',
  red: '#ff1717',
};

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
    padding: 0,
    backgroundColor: '#ffffff',
    color: COLORS.navy,
    fontFamily: 'Noto Sans KR',
  },
  infoTable: { position: 'absolute', top: 27, right: 26, width: 210, borderTopWidth: 0.7, borderLeftWidth: 0.7, borderColor: COLORS.border },
  infoRow: { height: 22, flexDirection: 'row', borderRightWidth: 0.7, borderBottomWidth: 0.7, borderColor: COLORS.border },
  infoLabel: { width: 76, paddingLeft: 9, justifyContent: 'center', backgroundColor: COLORS.label, borderRightWidth: 0.7, borderRightColor: COLORS.border },
  infoValue: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  detailTable: { position: 'absolute', top: 550, left: 25, width: 545, borderTopWidth: 0.7, borderLeftWidth: 0.7, borderColor: COLORS.border },
  tableRow: { flexDirection: 'row', borderRightWidth: 0.7, borderBottomWidth: 0.7, borderColor: COLORS.border },
  tableLabel: { width: 98, paddingLeft: 10, justifyContent: 'center', backgroundColor: COLORS.label, borderRightWidth: 0.7, borderRightColor: COLORS.border },
  tableValue: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

function bboxRatio(data) {
  const bbox = data.bbox ?? { x: 0, y: 0, width: 0, height: 0, unit: 'ratio' };
  const isRatio = bbox.unit === 'ratio' || [bbox.x, bbox.y, bbox.width, bbox.height].every(value => value >= 0 && value <= 1);
  if (isRatio) return bbox;
  return {
    x: bbox.x / (data.imageWidth || 1),
    y: bbox.y / (data.imageHeight || 1),
    width: bbox.width / (data.imageWidth || 1),
    height: bbox.height / (data.imageHeight || 1),
  };
}

function BboxHeroImage({ data }) {
  if (!data.imageUrl) {
    return (
      <View style={{ position: 'absolute', ...IMAGE_BOX, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8edf1' }}>
        <Text style={{ fontSize: 11, color: '#66798a' }}>이미지 정보 없음</Text>
      </View>
    );
  }

  const sourceWidth = data.imageWidth || 1;
  const sourceHeight = data.imageHeight || 1;
  const scale = Math.max(IMAGE_BOX.width / sourceWidth, IMAGE_BOX.height / sourceHeight);
  const renderedWidth = sourceWidth * scale;
  const renderedHeight = sourceHeight * scale;
  const imageLeft = (IMAGE_BOX.width - renderedWidth) / 2;
  const imageTop = (IMAGE_BOX.height - renderedHeight) / 2;
  const bbox = bboxRatio(data);

  return (
    <View style={{ position: 'absolute', ...IMAGE_BOX, overflow: 'hidden', backgroundColor: '#d9e0e6' }}>
      <Image src={resolvePdfAsset(data.imageUrl)} style={{ position: 'absolute', left: imageLeft, top: imageTop, width: renderedWidth, height: renderedHeight }} />
      <View style={{
        position: 'absolute',
        left: imageLeft + bbox.x * renderedWidth,
        top: imageTop + bbox.y * renderedHeight,
        width: bbox.width * renderedWidth,
        height: bbox.height * renderedHeight,
        borderWidth: 4,
        borderColor: COLORS.red,
      }} />
    </View>
  );
}

function MetaTable({ data }) {
  const rows = [
    ['위험 등급', data.severity],
    ['개선요청일', data.improvementRequestDate],
    ['보고서 생성일', data.reportCreatedAt],
  ];
  return (
    <View style={styles.infoTable}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.infoRow}>
          <View style={styles.infoLabel}><Text style={{ fontSize: 8.2, fontWeight: 700 }}>{label}</Text></View>
          <View style={styles.infoValue}>
            {label === '위험 등급' ? (
              <View style={{ width: 55, height: 18, borderRadius: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: data.severity === 'HIGH' ? '#f24c35' : data.severity === 'MEDIUM' ? '#f6a640' : '#348bc4' }}>
                <Text style={{ fontSize: 8.5, fontWeight: 700, color: COLORS.white }}>{value}</Text>
              </View>
            ) : <Text style={{ fontSize: 8.1 }}>{value}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

function wrapLongTokens(value, maxCharacters) {
  return String(value ?? '')
    .replace(/\\\r?\n/g, '\n')
    .replace(/\\n|\/n/g, '\n')
    .split(/(\s+)/)
    .map(token => {
      if (/^\s+$/.test(token)) return token;
      const characters = Array.from(token);
      if (characters.length <= maxCharacters) return token;
      const lines = [];
      for (let index = 0; index < characters.length; index += maxCharacters) {
        lines.push(characters.slice(index, index + maxCharacters).join(''));
      }
      return lines.join('\n');
    })
    .join('');
}

function DetailRow({ label, value, height, splitLabel, splitValue }) {
  const breakableValue = wrapLongTokens(value, splitLabel ? 27 : 45);
  const breakableSplitValue = wrapLongTokens(splitValue, 7);

  if (splitLabel) {
    return (
      <View style={[styles.tableRow, { minHeight: height }]}>
        <View style={{ width: '68%', flexDirection: 'row' }}>
          <View style={styles.tableLabel}><Text style={{ fontSize: 8.7, fontWeight: 700 }}>▶ {label}</Text></View>
          <View style={styles.tableValue}><Text style={{ fontSize: 8.7, lineHeight: 1.45 }}>{breakableValue}</Text></View>
        </View>
        <View style={{ width: '32%', flexDirection: 'row', borderLeftWidth: 0.7, borderLeftColor: COLORS.border }}>
          <View style={[styles.tableLabel, { width: 86 }]}><Text style={{ fontSize: 8.7, fontWeight: 700 }}>▶ {splitLabel}</Text></View>
          <View style={styles.tableValue}><Text style={{ fontSize: 8.7 }}>{breakableSplitValue}</Text></View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.tableRow, { minHeight: height }]}>
      <View style={styles.tableLabel}><Text style={{ fontSize: 8.7, fontWeight: 700 }}>▶ {label}</Text></View>
      <View style={styles.tableValue}><Text style={{ fontSize: 8.7, lineHeight: 1.45 }}>{breakableValue}</Text></View>
    </View>
  );
}

export function IndividualRiskPdfDocument({ data }) {
  return (
    <Document title={`${data.id} 개별 위험성평가 보고서`} author="VIRNECT Industrial Safety" creator="VIRNECT Industrial Safety">
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }} />
        <View style={{ position: 'absolute', top: 27, left: 29, flexDirection: 'row', alignItems: 'center' }}>
          <Svg width="17" height="23" viewBox="0 0 17 23"><Path d="M7 0h10L10 23H0z" fill={COLORS.orange} /></Svg>
          <View style={{ marginLeft: 6 }}>
            <Text style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.7 }}>VIRNECT</Text>
            <Text style={{ marginTop: -2, marginLeft: 2, fontSize: 10.5, fontWeight: 700 }}>Industrial Safety</Text>
          </View>
        </View>

        <Text style={{ position: 'absolute', top: 88, left: 29, fontSize: 27, fontWeight: 700, letterSpacing: -1 }}>개별 위험성평가 보고서</Text>
        <MetaTable data={data} />
        <View style={{ position: 'absolute', top: 130, left: 25, width: 545, height: 2, backgroundColor: COLORS.orange }} />

        <BboxHeroImage data={data} />



        <View style={{ position: 'absolute', top: 510, left: 26, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 6, height: 21, marginRight: 10, backgroundColor: COLORS.orange }} />
          <Text style={{ fontSize: 16, fontWeight: 700 }}>상세 정보</Text>
        </View>

        <View style={styles.detailTable}>
          <DetailRow label="작업명" value={data.jobName} splitLabel="재해유형" splitValue={data.accidentType} height={37} />
          <DetailRow label="위치" value={data.location} height={37} />
          <DetailRow label="개선내용" value={data.improvement} height={44} />
          <DetailRow label="안전대책" value={data.safetyMeasure} height={56} />
          <DetailRow label="법적사항" value={data.legalBasis} height={45} />
        </View>

        <View style={{ position: 'absolute', right: 25, bottom: 13, left: 25, height: 25, borderTopWidth: 0.7, borderTopColor: '#536c84', paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Svg width="7" height="10" viewBox="0 0 7 10"><Path d="M3 0h4L4 10H0z" fill={COLORS.orange} /></Svg>
            <Text style={{ marginLeft: 3, fontSize: 8.5, fontWeight: 700 }}>VIRNECT</Text>
            <Text style={{ marginLeft: 2, fontSize: 7 }}>Industrial Safety</Text>
          </View>
          <Text style={{ fontSize: 7, color: '#66798a' }}>사람의 안전이 더 큰 내일을 만듭니다.</Text>
        </View>
      </Page>
    </Document>
  );
}
