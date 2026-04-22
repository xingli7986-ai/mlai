// Internal Pantone-TPX-style palette for textile print color separation.
//
// NOTE: Pantone's actual TPX library is proprietary. The codes and RGB values
// below are a curated internal approximation — plausible codes and visually
// reasonable RGB values covering the major hue / depth segments commonly used
// in apparel printing. For a production deployment that prints against a real
// Pantone lab, swap in the licensed Pantone TPX CSV here.

export type PantoneColor = {
  code: string;
  name: string;
  r: number;
  g: number;
  b: number;
};

export const PANTONE_PALETTE: PantoneColor[] = [
  // Whites & neutrals ------------------------------------------------------
  { code: "11-0601 TPX", name: "Bright White", r: 246, g: 247, b: 245 },
  { code: "11-0602 TPX", name: "Snow White", r: 245, g: 244, b: 240 },
  { code: "11-4201 TPX", name: "Cloud Dancer", r: 240, g: 236, b: 225 },
  { code: "11-0103 TPX", name: "Egret", r: 236, g: 232, b: 220 },
  { code: "11-0507 TPX", name: "Ivory", r: 240, g: 233, b: 214 },
  { code: "12-0704 TPX", name: "Vanilla Cream", r: 236, g: 226, b: 200 },
  { code: "12-0812 TPX", name: "Alabaster Gleam", r: 236, g: 224, b: 194 },
  { code: "13-1009 TPX", name: "Cream Tan", r: 222, g: 207, b: 175 },
  { code: "13-0815 TPX", name: "Yellow Cream", r: 230, g: 210, b: 160 },
  { code: "14-1013 TPX", name: "Parchment", r: 214, g: 200, b: 170 },
  // Beiges & taupes --------------------------------------------------------
  { code: "13-0711 TPX", name: "Sand", r: 218, g: 200, b: 168 },
  { code: "14-1116 TPX", name: "Pebble", r: 200, g: 186, b: 160 },
  { code: "14-1210 TPX", name: "Warm Sand", r: 206, g: 188, b: 158 },
  { code: "15-1306 TPX", name: "Sandstone", r: 195, g: 172, b: 142 },
  { code: "16-1333 TPX", name: "Tawny Birch", r: 172, g: 138, b: 98 },
  { code: "17-1320 TPX", name: "Clove", r: 140, g: 105, b: 80 },
  { code: "18-1124 TPX", name: "Bison", r: 110, g: 78, b: 55 },
  { code: "16-1212 TPX", name: "Taupe", r: 158, g: 138, b: 118 },
  { code: "17-1322 TPX", name: "Stone Grey", r: 148, g: 132, b: 110 },
  { code: "18-1312 TPX", name: "Walnut", r: 124, g: 106, b: 92 },
  // Greys ------------------------------------------------------------------
  { code: "12-0000 TPX", name: "White Smoke", r: 232, g: 232, b: 228 },
  { code: "13-4104 TPX", name: "Light Grey", r: 216, g: 216, b: 214 },
  { code: "14-4102 TPX", name: "Silver Mist", r: 196, g: 196, b: 194 },
  { code: "15-4101 TPX", name: "Glacier Grey", r: 176, g: 178, b: 180 },
  { code: "16-3801 TPX", name: "Ghost Grey", r: 160, g: 160, b: 158 },
  { code: "17-1500 TPX", name: "Frost Grey", r: 140, g: 138, b: 130 },
  { code: "17-4014 TPX", name: "Steel Grey", r: 110, g: 114, b: 118 },
  { code: "18-4105 TPX", name: "Monument", r: 92, g: 96, b: 100 },
  { code: "18-0201 TPX", name: "Charcoal Grey", r: 82, g: 82, b: 84 },
  { code: "19-4205 TPX", name: "Phantom", r: 60, g: 62, b: 66 },
  // Blacks -----------------------------------------------------------------
  { code: "19-0303 TPX", name: "Beluga", r: 58, g: 58, b: 56 },
  { code: "19-4007 TPX", name: "Raven", r: 44, g: 44, b: 46 },
  { code: "19-4006 TPX", name: "Caviar", r: 36, g: 36, b: 38 },
  { code: "19-0506 TPX", name: "Jet Black", r: 26, g: 26, b: 26 },
  { code: "19-4305 TPX", name: "Anthracite", r: 50, g: 52, b: 56 },
  // Reds -------------------------------------------------------------------
  { code: "14-1511 TPX", name: "Blush Pink", r: 240, g: 192, b: 184 },
  { code: "15-1821 TPX", name: "Flamingo Pink", r: 240, g: 160, b: 150 },
  { code: "16-1632 TPX", name: "Shell Pink", r: 234, g: 135, b: 128 },
  { code: "17-1664 TPX", name: "Grenadine", r: 222, g: 80, b: 68 },
  { code: "18-1550 TPX", name: "Aurora Red", r: 200, g: 60, b: 50 },
  { code: "18-1564 TPX", name: "Fiesta", r: 216, g: 66, b: 48 },
  { code: "18-1651 TPX", name: "Chili Pepper", r: 186, g: 45, b: 42 },
  { code: "18-1663 TPX", name: "Poppy Red", r: 206, g: 43, b: 50 },
  { code: "19-1557 TPX", name: "Mars Red", r: 176, g: 36, b: 34 },
  { code: "19-1558 TPX", name: "Scarlet", r: 192, g: 32, b: 50 },
  { code: "19-1761 TPX", name: "Lollipop", r: 208, g: 30, b: 62 },
  { code: "19-1763 TPX", name: "High Risk Red", r: 200, g: 22, b: 44 },
  { code: "19-1555 TPX", name: "Ribbon Red", r: 178, g: 30, b: 36 },
  { code: "19-1559 TPX", name: "Goji Berry", r: 166, g: 36, b: 40 },
  { code: "19-1662 TPX", name: "Rococco Red", r: 150, g: 34, b: 40 },
  { code: "19-1934 TPX", name: "Rumba Red", r: 138, g: 30, b: 50 },
  { code: "19-1535 TPX", name: "Fired Brick", r: 138, g: 50, b: 44 },
  { code: "19-1656 TPX", name: "Rhubarb", r: 156, g: 44, b: 60 },
  // Pinks & magentas -------------------------------------------------------
  { code: "12-2905 TPX", name: "Cradle Pink", r: 246, g: 224, b: 228 },
  { code: "13-2003 TPX", name: "Pastel Rose", r: 244, g: 212, b: 214 },
  { code: "13-2802 TPX", name: "Ballet Slipper", r: 240, g: 208, b: 216 },
  { code: "14-1907 TPX", name: "Powder Pink", r: 232, g: 192, b: 200 },
  { code: "14-1911 TPX", name: "Candy Pink", r: 240, g: 180, b: 190 },
  { code: "15-1520 TPX", name: "Rose Quartz", r: 242, g: 178, b: 178 },
  { code: "15-1922 TPX", name: "Strawberry Ice", r: 232, g: 152, b: 162 },
  { code: "16-1723 TPX", name: "Sachet Pink", r: 230, g: 138, b: 160 },
  { code: "16-1720 TPX", name: "Flamingo", r: 234, g: 124, b: 146 },
  { code: "17-1753 TPX", name: "Hot Pink", r: 232, g: 80, b: 128 },
  { code: "17-2031 TPX", name: "Fandango Pink", r: 214, g: 72, b: 130 },
  { code: "18-2133 TPX", name: "Pink Yarrow", r: 208, g: 46, b: 110 },
  { code: "18-2043 TPX", name: "Raspberry Rose", r: 200, g: 40, b: 120 },
  { code: "19-2428 TPX", name: "Fuchsia Red", r: 170, g: 30, b: 96 },
  { code: "19-2434 TPX", name: "Magenta Purple", r: 138, g: 40, b: 82 },
  { code: "18-2436 TPX", name: "Pink Peacock", r: 204, g: 45, b: 140 },
  // Oranges / corals / peaches --------------------------------------------
  { code: "12-0813 TPX", name: "Banana Cream", r: 248, g: 226, b: 170 },
  { code: "13-1022 TPX", name: "Apricot Illusion", r: 242, g: 200, b: 168 },
  { code: "14-1220 TPX", name: "Peach Pearl", r: 248, g: 186, b: 148 },
  { code: "14-1323 TPX", name: "Peach Amber", r: 244, g: 168, b: 130 },
  { code: "15-1247 TPX", name: "Nectarine", r: 250, g: 144, b: 96 },
  { code: "16-1349 TPX", name: "Golden Poppy", r: 250, g: 138, b: 60 },
  { code: "16-1448 TPX", name: "Persimmon Orange", r: 232, g: 112, b: 60 },
  { code: "16-1462 TPX", name: "Vibrant Orange", r: 255, g: 110, b: 46 },
  { code: "17-1350 TPX", name: "Russet Orange", r: 216, g: 96, b: 50 },
  { code: "17-1463 TPX", name: "Orange Tiger", r: 244, g: 100, b: 46 },
  { code: "17-1464 TPX", name: "Flame", r: 228, g: 82, b: 38 },
  { code: "18-1450 TPX", name: "Pureed Pumpkin", r: 208, g: 70, b: 26 },
  { code: "18-1454 TPX", name: "Red Orange", r: 220, g: 70, b: 38 },
  { code: "18-1561 TPX", name: "Tangerine Tango", r: 221, g: 79, b: 50 },
  { code: "13-0947 TPX", name: "Sunlight", r: 248, g: 212, b: 126 },
  { code: "14-1051 TPX", name: "Butter Yellow", r: 244, g: 214, b: 88 },
  { code: "14-1064 TPX", name: "Saffron", r: 248, g: 192, b: 56 },
  { code: "15-1150 TPX", name: "Amber Yellow", r: 240, g: 172, b: 42 },
  { code: "16-0947 TPX", name: "Mineral Yellow", r: 222, g: 168, b: 58 },
  { code: "17-0945 TPX", name: "Inca Gold", r: 202, g: 150, b: 46 },
  { code: "18-0939 TPX", name: "Golden Brown", r: 172, g: 122, b: 42 },
  // Yellows ---------------------------------------------------------------
  { code: "12-0642 TPX", name: "Lemon Tonic", r: 250, g: 240, b: 96 },
  { code: "12-0643 TPX", name: "Celandine", r: 244, g: 230, b: 90 },
  { code: "12-0736 TPX", name: "Limelight", r: 242, g: 232, b: 108 },
  { code: "13-0859 TPX", name: "Vibrant Yellow", r: 252, g: 222, b: 48 },
  { code: "13-0858 TPX", name: "Cyber Yellow", r: 255, g: 210, b: 0 },
  { code: "14-0852 TPX", name: "Freesia", r: 240, g: 200, b: 30 },
  { code: "14-0850 TPX", name: "Maize", r: 242, g: 194, b: 58 },
  { code: "15-0955 TPX", name: "Old Gold", r: 216, g: 170, b: 46 },
  // Greens ----------------------------------------------------------------
  { code: "12-0304 TPX", name: "Marshmallow", r: 232, g: 234, b: 220 },
  { code: "13-0117 TPX", name: "Pastel Green", r: 200, g: 220, b: 178 },
  { code: "14-0121 TPX", name: "Green Ash", r: 184, g: 210, b: 166 },
  { code: "14-6327 TPX", name: "Jadeite", r: 164, g: 212, b: 178 },
  { code: "15-0343 TPX", name: "Greenery", r: 136, g: 180, b: 64 },
  { code: "15-6437 TPX", name: "Mint", r: 126, g: 192, b: 140 },
  { code: "16-6444 TPX", name: "Island Green", r: 48, g: 174, b: 108 },
  { code: "16-6340 TPX", name: "Classic Green", r: 26, g: 160, b: 88 },
  { code: "17-6229 TPX", name: "Jelly Bean", r: 58, g: 148, b: 92 },
  { code: "17-5641 TPX", name: "Kelly Green", r: 0, g: 134, b: 72 },
  { code: "18-0135 TPX", name: "Online Lime", r: 90, g: 140, b: 42 },
  { code: "18-5424 TPX", name: "Alpine Green", r: 14, g: 102, b: 82 },
  { code: "18-5642 TPX", name: "Amazon", r: 20, g: 110, b: 72 },
  { code: "18-6320 TPX", name: "Viridis", r: 44, g: 92, b: 68 },
  { code: "19-5511 TPX", name: "Forest Green", r: 36, g: 80, b: 60 },
  { code: "19-5914 TPX", name: "Trekking Green", r: 30, g: 62, b: 50 },
  { code: "19-6311 TPX", name: "Mountain View", r: 56, g: 78, b: 64 },
  { code: "16-0532 TPX", name: "Moss", r: 138, g: 130, b: 50 },
  { code: "17-0636 TPX", name: "Golden Olive", r: 120, g: 110, b: 44 },
  { code: "18-0430 TPX", name: "Olive Branch", r: 112, g: 108, b: 60 },
  // Teals & cyans ----------------------------------------------------------
  { code: "13-4810 TPX", name: "Icy Morn", r: 198, g: 228, b: 228 },
  { code: "14-4809 TPX", name: "Pastel Turquoise", r: 162, g: 214, b: 214 },
  { code: "15-5210 TPX", name: "Aqua Sea", r: 124, g: 198, b: 200 },
  { code: "15-4825 TPX", name: "Blue Radiance", r: 86, g: 196, b: 208 },
  { code: "16-5127 TPX", name: "Peacock Blue", r: 0, g: 160, b: 178 },
  { code: "17-4735 TPX", name: "Scuba Blue", r: 0, g: 146, b: 178 },
  { code: "17-5025 TPX", name: "Deep Teal", r: 0, g: 120, b: 130 },
  { code: "18-4930 TPX", name: "Hydro", r: 0, g: 98, b: 120 },
  { code: "19-4726 TPX", name: "Teal", r: 0, g: 82, b: 98 },
  { code: "19-4914 TPX", name: "Bayou", r: 8, g: 60, b: 74 },
  // Blues ------------------------------------------------------------------
  { code: "12-4306 TPX", name: "Powder Blue", r: 214, g: 226, b: 232 },
  { code: "13-4308 TPX", name: "Mist Blue", r: 196, g: 214, b: 224 },
  { code: "13-4411 TPX", name: "Corydalis Blue", r: 164, g: 196, b: 218 },
  { code: "14-4122 TPX", name: "Airy Blue", r: 140, g: 178, b: 208 },
  { code: "15-4020 TPX", name: "Forget-me-not", r: 128, g: 166, b: 196 },
  { code: "15-3930 TPX", name: "Serenity", r: 146, g: 166, b: 198 },
  { code: "16-4132 TPX", name: "Little Boy Blue", r: 100, g: 150, b: 194 },
  { code: "17-4037 TPX", name: "Palace Blue", r: 36, g: 100, b: 168 },
  { code: "17-4247 TPX", name: "French Blue", r: 0, g: 126, b: 194 },
  { code: "18-4148 TPX", name: "Princess Blue", r: 12, g: 80, b: 156 },
  { code: "18-4245 TPX", name: "Mykonos Blue", r: 0, g: 102, b: 152 },
  { code: "18-3949 TPX", name: "Dazzling Blue", r: 36, g: 72, b: 170 },
  { code: "19-3921 TPX", name: "Navy Peony", r: 40, g: 54, b: 102 },
  { code: "19-4027 TPX", name: "Estate Blue", r: 20, g: 58, b: 112 },
  { code: "19-4028 TPX", name: "Moonlit Ocean", r: 20, g: 48, b: 88 },
  { code: "19-4024 TPX", name: "Dark Denim", r: 40, g: 66, b: 100 },
  { code: "19-4127 TPX", name: "Blue Depths", r: 26, g: 48, b: 82 },
  { code: "19-3939 TPX", name: "Deep Blue", r: 22, g: 42, b: 90 },
  { code: "19-3933 TPX", name: "Medieval Blue", r: 38, g: 50, b: 98 },
  { code: "19-4026 TPX", name: "Ensign Blue", r: 18, g: 42, b: 76 },
  // Purples & violets ------------------------------------------------------
  { code: "13-3406 TPX", name: "Orchid Ice", r: 218, g: 214, b: 232 },
  { code: "14-3612 TPX", name: "Pastel Lilac", r: 198, g: 184, b: 220 },
  { code: "15-3716 TPX", name: "Lavender", r: 180, g: 164, b: 218 },
  { code: "16-3520 TPX", name: "Violet Tulip", r: 170, g: 140, b: 200 },
  { code: "16-3521 TPX", name: "Bougainvillea", r: 182, g: 116, b: 192 },
  { code: "17-3240 TPX", name: "Radiant Orchid", r: 174, g: 104, b: 156 },
  { code: "18-3224 TPX", name: "Purple Orchid", r: 144, g: 86, b: 138 },
  { code: "18-3339 TPX", name: "Amaranth Purple", r: 152, g: 68, b: 136 },
  { code: "18-3633 TPX", name: "Purple Heart", r: 100, g: 74, b: 146 },
  { code: "19-3542 TPX", name: "Royal Purple", r: 82, g: 50, b: 122 },
  { code: "19-3540 TPX", name: "Tillandsia Purple", r: 96, g: 60, b: 128 },
  { code: "19-3638 TPX", name: "Prism Violet", r: 74, g: 42, b: 118 },
  { code: "19-3950 TPX", name: "Navy Iris", r: 54, g: 46, b: 102 },
  { code: "19-3536 TPX", name: "Acai", r: 58, g: 42, b: 88 },
  { code: "19-3217 TPX", name: "Plum Perfect", r: 60, g: 38, b: 56 },
  // Browns & earth tones ---------------------------------------------------
  { code: "14-1220 TPX", name: "Apricot Nectar", r: 232, g: 170, b: 128 },
  { code: "16-1334 TPX", name: "Cashew", r: 184, g: 144, b: 102 },
  { code: "17-1125 TPX", name: "Almondine", r: 168, g: 130, b: 96 },
  { code: "17-1224 TPX", name: "Macaroon", r: 160, g: 122, b: 92 },
  { code: "17-1318 TPX", name: "Tawny", r: 150, g: 116, b: 86 },
  { code: "18-1137 TPX", name: "Cognac", r: 142, g: 92, b: 50 },
  { code: "18-1142 TPX", name: "Caramel", r: 160, g: 106, b: 56 },
  { code: "18-1028 TPX", name: "Coffee Liqueur", r: 112, g: 84, b: 52 },
  { code: "19-1218 TPX", name: "Chocolate Brown", r: 96, g: 66, b: 48 },
  { code: "19-0915 TPX", name: "Dark Earth", r: 74, g: 58, b: 44 },
  { code: "19-1116 TPX", name: "Java", r: 62, g: 48, b: 38 },
  { code: "19-1314 TPX", name: "Seal Brown", r: 58, g: 44, b: 36 },
  { code: "19-1015 TPX", name: "Demitasse", r: 48, g: 36, b: 28 },
];

// ---------------------------------------------------------------------------
// CIE76 ΔE color matching via RGB → Lab.
// ---------------------------------------------------------------------------

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // sRGB (0..255) → linear RGB
  const lin = (v: number) => {
    const n = v / 255;
    return n > 0.04045 ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92;
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);

  // linear RGB → CIE XYZ (D65)
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;

  // XYZ → Lab (D65 reference white)
  const Xn = 0.95047;
  const Yn = 1.0;
  const Zn = 1.08883;
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(X / Xn);
  const fy = f(Y / Yn);
  const fz = f(Z / Zn);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);

  return [L, a, bLab];
}

// Precompute Lab coordinates for every palette entry once at module load.
const PALETTE_LAB: Array<[number, number, number]> = PANTONE_PALETTE.map((c) =>
  rgbToLab(c.r, c.g, c.b)
);

export function findClosestPantone(
  r: number,
  g: number,
  b: number
): { code: string; name: string } {
  const [L1, a1, b1] = rgbToLab(r, g, b);
  let bestIdx = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < PALETTE_LAB.length; i++) {
    const [L2, a2, b2] = PALETTE_LAB[i];
    const dL = L1 - L2;
    const da = a1 - a2;
    const db = b1 - b2;
    const d = dL * dL + da * da + db * db; // squared CIE76 ΔE (sqrt skipped)
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  const best = PANTONE_PALETTE[bestIdx];
  return { code: best.code, name: best.name };
}
