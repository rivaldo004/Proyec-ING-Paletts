import { Color } from '../types/color';

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

export const generateColorVariations = (baseColor: string): Color[] => {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const variations: Color[] = [];
  
  // Generate lighter and darker variations
  for (let i = -4; i <= 4; i++) {
    const newL = Math.max(5, Math.min(95, hsl.l + (i * 10)));
    const newRgb = hslToRgb(hsl.h, hsl.s, newL);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    
    variations.push({
      id: `${baseColor}-${i}`,
      name: `Variation ${i}`,
      hex: newHex,
      rgb: newRgb,
      hsl: { ...hsl, l: newL },
      isFavorite: false,
      createdAt: new Date()
    });
  }
  
  return variations;
};

export const generateComplementaryColors = (baseColor: string): Color[] => {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const complementary = (hsl.h + 180) % 360;
  const triadic1 = (hsl.h + 120) % 360;
  const triadic2 = (hsl.h + 240) % 360;
  const analogous1 = (hsl.h + 30) % 360;
  const analogous2 = (hsl.h - 30 + 360) % 360;
  
  const colors = [
    { h: complementary, name: 'Complementary' },
    { h: triadic1, name: 'Triadic 1' },
    { h: triadic2, name: 'Triadic 2' },
    { h: analogous1, name: 'Analogous 1' },
    { h: analogous2, name: 'Analogous 2' }
  ];
  
  return colors.map((color, index) => {
    const newRgb = hslToRgb(color.h, hsl.s, hsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    
    return {
      id: `${baseColor}-${color.name}-${index}`,
      name: color.name,
      hex: newHex,
      rgb: newRgb,
      hsl: { h: color.h, s: hsl.s, l: hsl.l },
      isFavorite: false,
      createdAt: new Date()
    };
  });
};

export const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

export const formatColorCode = (color: Color, format: 'hex' | 'rgb' | 'hsl' | 'css-var', varName?: string): string => {
  switch (format) {
    case 'hex':
      return color.hex.toUpperCase();
    case 'rgb':
      return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    case 'hsl':
      return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
    case 'css-var':
      const name = varName || color.name.toLowerCase().replace(/\s+/g, '-');
      return `--${name}: ${color.hex};`;
    default:
      return color.hex;
  }
};