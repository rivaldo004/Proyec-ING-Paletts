export interface Color {
  id: string;
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  isFavorite: boolean;
  createdAt: Date;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: Color[];
  createdAt: Date;
  isFavorite: boolean;
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'css-var';