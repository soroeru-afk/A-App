export interface DicColor {
  code: string;
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  c: number;
  m: number;
  y: number;
  k: number;
}

// A curated list of representative DIC colors for demonstration
// including the DIC-F153 from the user's reference.
export const dicColors: DicColor[] = [
  { code: "DIC-F153", name: "フランスの伝統色 暗い黄", hex: "#85651E", r: 133, g: 101, b: 30, c: 0, m: 31, y: 91, k: 59 },
  { code: "DIC-1", name: "Yellow", hex: "#F2D800", r: 242, g: 216, b: 0, c: 0, m: 10, y: 100, k: 0 },
  { code: "DIC-2", name: "Gold Yellow", hex: "#F2C200", r: 242, g: 194, b: 0, c: 0, m: 20, y: 100, k: 0 },
  { code: "DIC-3", name: "Orange Yellow", hex: "#F2A700", r: 242, g: 167, b: 0, c: 0, m: 35, y: 100, k: 0 },
  { code: "DIC-10", name: "Red", hex: "#E60012", r: 230, g: 0, b: 18, c: 0, m: 100, y: 100, k: 0 },
  { code: "DIC-54", name: "Pink", hex: "#E95388", r: 233, g: 83, b: 136, c: 0, m: 80, y: 10, k: 0 },
  { code: "DIC-64", name: "Purple", hex: "#8E3B97", r: 142, g: 59, b: 151, c: 50, m: 90, y: 0, k: 0 },
  { code: "DIC-156", name: "Light Blue", hex: "#00A0E9", r: 0, g: 160, b: 233, c: 100, m: 20, y: 0, k: 0 },
  { code: "DIC-198", name: "Green", hex: "#009944", r: 0, g: 153, b: 68, c: 100, m: 0, y: 80, k: 0 },
  { code: "DIC-256", name: "Yellow Green", hex: "#8FC31F", r: 143, g: 195, b: 31, c: 45, m: 0, y: 100, k: 0 },
  { code: "DIC-579", name: "Navy", hex: "#1D2088", r: 29, g: 32, b: 136, c: 100, m: 90, y: 0, k: 10 },
  { code: "DIC-580", name: "Dark Green", hex: "#006837", r: 0, g: 104, b: 55, c: 100, m: 0, y: 100, k: 40 },
  { code: "DIC-582", name: "Brown", hex: "#8A5C38", r: 138, g: 92, b: 56, c: 30, m: 60, y: 80, k: 20 },
  { code: "DIC-584", name: "Black", hex: "#1A1A1A", r: 26, g: 26, b: 26, c: 60, m: 60, y: 60, k: 100 },
  { code: "DIC-N 702", name: "金茶", hex: "#C66E00", r: 198, g: 110, b: 0, c: 0, m: 60, y: 100, k: 10 },
  { code: "DIC-N 704", name: "赤茶", hex: "#8A3319", r: 138, g: 51, b: 25, c: 20, m: 80, y: 100, k: 40 },
  { code: "DIC-N 712", name: "臙脂", hex: "#880022", r: 136, g: 0, b: 34, c: 30, m: 100, y: 70, k: 40 },
  { code: "DIC-N 718", name: "紫紺", hex: "#3A004B", r: 58, g: 0, b: 75, c: 80, m: 100, y: 0, k: 60 },
  { code: "DIC-N 728", name: "濃藍", hex: "#0E1A35", r: 14, g: 26, b: 53, c: 100, m: 80, y: 40, k: 80 },
  { code: "DIC-F10", name: "フランスの伝統色 赤", hex: "#B92946", r: 185, g: 41, b: 70, c: 15, m: 100, y: 55, k: 15 },
  { code: "DIC-F65", name: "フランスの伝統色 青", hex: "#005392", r: 0, g: 83, b: 146, c: 100, m: 60, y: 10, k: 10 },
];

export function getNearestDicColor(r: number, g: number, b: number): { color: DicColor, distance: number } {
  let minDistance = Infinity;
  let nearestColor = dicColors[0];

  for (const color of dicColors) {
    // ユーグリッド距離 (R, G, B)
    const distance: number = Math.sqrt(
        Math.pow(color.r - r, 2) + Math.pow(color.g - g, 2) + Math.pow(color.b - b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = color;
    }
  }

  return { color: nearestColor, distance: minDistance };
}
