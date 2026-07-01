export function hsvToRgb(h: number, s: number, v: number) {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h <= 360) { r = c; g = 0; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;
  return [num >> 16, (num >> 8) & 255, num & 255];
}

export function rgbToCmyk(r: number, g: number, b: number) {
  let c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255, k = Math.min(c, Math.min(m, y));
  if (k === 1) return [0, 0, 0, 100];
  c = Math.round(((c - k) / (1 - k)) * 100);
  m = Math.round(((m - k) / (1 - k)) * 100);
  y = Math.round(((y - k) / (1 - k)) * 100);
  k = Math.round(k * 100);
  return [c, m, y, k];
}

export function cmykToRgb(c: number, m: number, y: number, k: number) {
  c /= 100; m /= 100; y /= 100; k /= 100;
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return [Math.round(r), Math.round(g), Math.round(b)];
}

export function getLuminance(r: number, g: number, b: number) {
  const [R, G, B] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return R * 0.2126 + G * 0.7152 + B * 0.0722;
}

export function getContrastRatio(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function hexToArgb(hex: string, alpha: number) {
  const cleanHex = hex.replace('#', '');
  const aHex = Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${aHex}${cleanHex}`;
}

export function parseColorString(str: string): { r: number, g: number, b: number, a?: number } | null {
  str = str.trim();
  
  // match rgb() or rgba()
  const rgbaMatch = str.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)/i);
  if (rgbaMatch) {
    return {
      r: Math.max(0, Math.min(255, parseInt(rgbaMatch[1], 10))),
      g: Math.max(0, Math.min(255, parseInt(rgbaMatch[2], 10))),
      b: Math.max(0, Math.min(255, parseInt(rgbaMatch[3], 10))),
      a: rgbaMatch[4] ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : undefined
    };
  }

  // match Hex
  let hexStr = str.replace(/^#/, '');
  if (/^[A-Fa-f0-9]+$/.test(hexStr)) {
    if (hexStr.length === 3) hexStr = hexStr.split('').map(c => c + c).join('');
    
    if (hexStr.length === 6) {
      return {
        r: parseInt(hexStr.substring(0, 2), 16),
        g: parseInt(hexStr.substring(2, 4), 16),
        b: parseInt(hexStr.substring(4, 6), 16)
      };
    }
    
    if (hexStr.length === 8) {
      return {
        a: parseInt(hexStr.substring(0, 2), 16) / 255,
        r: parseInt(hexStr.substring(2, 4), 16),
        g: parseInt(hexStr.substring(4, 6), 16),
        b: parseInt(hexStr.substring(6, 8), 16)
      };
    }
  }
  
  // match vec4 or platform-specific float formats (SwiftUI, UIColor, etc.)
  // regex to grab numbers relative to labels like red: green: etc or just plain comma separated floats
  const floatMatches = str.match(/([0-9.]+)/g);
  if (floatMatches && (str.toLowerCase().includes('color') || str.toLowerCase().includes('vec'))) {
    if (floatMatches.length >= 3) {
      const r = Math.max(0, Math.min(255, Math.round(parseFloat(floatMatches[0]) * 255)));
      const g = Math.max(0, Math.min(255, Math.round(parseFloat(floatMatches[1]) * 255)));
      const b = Math.max(0, Math.min(255, Math.round(parseFloat(floatMatches[2]) * 255)));
      const a = floatMatches[3] ? Math.max(0, Math.min(1, parseFloat(floatMatches[3]))) : undefined;
      // Heuristic: if they are all <= 1.0, it's likely a float format
      if (parseFloat(floatMatches[0]) <= 1.0 && parseFloat(floatMatches[1]) <= 1.0 && parseFloat(floatMatches[2]) <= 1.0) {
        return { r, g, b, a };
      }
    }
  }

  // Fallback for simple comma separated integers (e.g. 255, 0, 0)
  if (floatMatches && floatMatches.length >= 3 && !str.includes('(')) {
    const r = parseInt(floatMatches[0], 10);
    const g = parseInt(floatMatches[1], 10);
    const b = parseInt(floatMatches[2], 10);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b) && r <= 255 && g <= 255 && b <= 255) {
       return { r, g, b };
    }
  }

  return null;
}
