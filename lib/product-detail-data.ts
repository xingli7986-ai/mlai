import { products, type HomeProduct } from './home-consumer-data';

export type ProductSeries = 'classic' | 'commute' | 'vacation' | 'evening';

export type ProductFilter = {
  id: 'all' | ProductSeries;
  label: string;
  desc: string;
};

export type ProductDetail = {
  product: HomeProduct;
  series: ProductSeries;
  seriesLabel: string;
  heroNote: string;
  bodyBenefits: string[];
  occasion: string[];
  printStory: string;
  fabricStory: string;
  fitNotes: string[];
  safetyNotes: string[];
  gallery: string[];
  specs: Array<{ label: string; value: string }>;
  sizes: Array<{ size: string; length: string; bust: string; waist: string; shoulder: string; sleeve: string }>;
  timeline: Array<{ title: string; desc: string }>;
};

export const productFilters: ProductFilter[] = [
  { id: 'all', label: '全部夏季新品', desc: '18 款针织印花连衣裙' },
  { id: 'classic', label: '经典裹身', desc: 'V 领、高腰、腰侧褶裥' },
  { id: 'commute', label: '通勤知性', desc: '克制印花，办公室友好' },
  { id: 'vacation', label: '夏日度假', desc: '轻盈色彩，城市旅行皆宜' },
  { id: 'evening', label: '晚宴聚会', desc: '深色底、大花、成熟气场' },
];

const seriesById: Record<string, ProductSeries> = {
  'ink-garden-knit-wrap-dress': 'classic',
  'camellia-ink-v-neck-dress': 'classic',
  'black-white-abstract-wrap-dress': 'classic',
  'wine-rose-waist-tie-dress': 'classic',
  'blue-white-sea-breeze-wrap-dress': 'classic',
  'vintage-coffee-floral-wrap-dress': 'classic',
  'navy-geometry-commute-dress': 'commute',
  'almond-floral-high-waist-dress': 'commute',
  'dusty-rose-ink-short-sleeve-dress': 'commute',
  'black-fine-floral-office-dress': 'commute',
  'ink-green-botanical-midi-dress': 'commute',
  'island-blue-knit-midi-dress': 'vacation',
  'morning-mist-tea-dress': 'vacation',
  'coral-floral-flutter-sleeve-dress': 'vacation',
  'palm-shadow-light-wrap-dress': 'vacation',
  'black-gold-floral-evening-dress': 'evening',
  'twilight-rose-slim-dress': 'evening',
  'deep-sea-abstract-slit-dress': 'evening',
};

const seriesLabel: Record<ProductSeries, string> = {
  classic: '经典裹身系列',
  commute: '通勤知性系列',
  vacation: '夏日度假系列',
  evening: '晚宴聚会系列',
};

const seriesHeroNote: Record<ProductSeries, string> = {
  classic: '以交叠 V 领、高腰线和腰侧褶裥塑造比例，是 MaxLuLu 夏季针织印花裙的核心款。',
  commute: '在成熟印花与克制版型之间取得平衡，适合办公室、会议与日常城市出行。',
  vacation: '轻盈色彩与柔软针织结合，适合夏日旅行、咖啡馆、城市露台和周末出游。',
  evening: '深色底与大花层次带来成熟气场，适合晚餐、聚会和重要场合。',
};

const seriesOccasions: Record<ProductSeries, string[]> = {
  classic: ['通勤', '约会', '晚餐', '旅行'],
  commute: ['办公室', '会议', '日常', '城市出行'],
  vacation: ['旅行', '周末', '咖啡馆', '夏日度假'],
  evening: ['晚餐', '聚会', '活动', '重要场合'],
};

function buildGallery(product: HomeProduct) {
  const base = product.image.replace('/02-featured-designs/dresses-summer/', '/02-featured-designs/dresses-summer/details/').replace('.png', '');
  return [product.image, `${base}-front.png`, `${base}-print.png`, `${base}-detail.png`];
}

function buildPrintStory(product: HomeProduct, series: ProductSeries) {
  if (product.tags.includes('山茶')) return '山茶与水墨肌理结合，保留东方留白，又避免过度民族化，适合成熟女性的低调辨识度。';
  if (product.tags.includes('蓝白')) return '蓝白配色让印花更清爽，适合夏天和旅行场景，远看干净，近看有节奏。';
  if (product.tags.includes('黑金')) return '黑色底与金色花影制造晚宴感，但版型保持日常可穿，不会过分礼服化。';
  if (product.tags.includes('酒红') || product.tags.includes('玫瑰')) return '玫瑰与酒红调更有女人味，适合晚餐、约会和成熟聚会场景。';
  if (series === 'commute') return '低饱和印花减少视觉压力，既有图案层次，又不会在通勤场景里显得过分夸张。';
  return '以抽象花影和留白层次为主，强调 MaxLuLu 的标志性印花识别，显瘦且高级。';
}

function buildDetail(product: HomeProduct): ProductDetail {
  const series = seriesById[product.id] ?? 'classic';
  const target = product.target;
  const joined = product.joined;
  const remain = Math.max(0, target - joined);

  return {
    product,
    series,
    seriesLabel: seriesLabel[series],
    heroNote: seriesHeroNote[series],
    bodyBenefits: ['V 领修饰肩颈', '高腰线拉长比例', '针织弹力不紧绷', '裙摆垂坠修饰腰腹'],
    occasion: seriesOccasions[series],
    printStory: buildPrintStory(product, series),
    fabricStory: '轻薄针织印花布，柔软、有弹力、垂坠感好。适合夏季高频穿着，坐下、走动和通勤都更自在。',
    fitNotes: [
      series === 'commute' ? '小 V 或克制领口，适合办公室场景。' : '交叠 V 领提升肩颈线条，保留成熟女人味。',
      '腰部褶裥与腰带可调节，对腰腹更友好。',
      '膝下到小腿中段裙长，通勤、聚会和旅行都更稳妥。',
    ],
    safetyNotes: ['胸口交叠位可增加内侧固定点。', 'V 领深度建议分浅 V、标准 V、小深 V 三档。', '浅色款建议配置轻薄里布或胸口防透结构。'],
    gallery: buildGallery(product),
    specs: [
      { label: '面料', value: '轻薄弹力针织印花布' },
      { label: '成分建议', value: '95% 聚酯纤维 / 5% 氨纶' },
      { label: '版型', value: series === 'commute' ? '小 V 高腰通勤版' : 'V 领裹身高腰版' },
      { label: '厚薄', value: '夏季轻薄' },
      { label: '弹力', value: '中等弹力' },
      { label: '交付', value: product.delivery },
    ],
    sizes: [
      { size: 'S', length: '108', bust: '86', waist: '68', shoulder: '37', sleeve: series === 'vacation' ? '18' : '28' },
      { size: 'M', length: '110', bust: '90', waist: '72', shoulder: '38', sleeve: series === 'vacation' ? '19' : '29' },
      { size: 'L', length: '112', bust: '94', waist: '76', shoulder: '39', sleeve: series === 'vacation' ? '20' : '30' },
      { size: 'XL', length: '114', bust: '98', waist: '80', shoulder: '40', sleeve: series === 'vacation' ? '21' : '31' },
    ],
    timeline: [
      { title: '参与众定', desc: `${joined}/${target} 人已参与，还差 ${remain} 人成团。` },
      { title: '尺码确认', desc: '成团后确认尺码、领口安全位与交付信息。' },
      { title: '小批量生产', desc: '按众定人数安排面料印花、裁剪与车缝。' },
      { title: '质检交付', desc: '检查面料、车缝、尺码与包装后发出。' },
    ],
  };
}

export const productDetails: ProductDetail[] = products.map(buildDetail);

export function getProductDetail(productId: string): ProductDetail | undefined {
  return productDetails.find((item) => item.product.id === productId);
}

export function getProductsBySeries(filter: ProductFilter['id']): ProductDetail[] {
  if (filter === 'all') return productDetails;
  return productDetails.filter((item) => item.series === filter);
}
