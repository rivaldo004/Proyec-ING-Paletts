import React, { useState, useCallback } from 'react';
import { Pipette, Palette, Shuffle } from 'lucide-react';
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from '../utils/colorUtils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const handleHslChange = useCallback((h: number, s: number, l: number) => {
    const newRgb = hslToRgb(h, s, l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChange(newHex);
  }, [onChange]);

  const generateRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    onChange(randomHex);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-600 transition-colors"
      >
        <div 
          className="w-6 h-6 rounded border-2 border-gray-500"
          style={{ backgroundColor: color }}
        />
        <Pipette className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-mono text-gray-300">{color.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl z-50 min-w-80">
          <div className="space-y-4">
            {/* Color Preview */}
            <div className="flex items-center justify-between">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-600"
                style={{ backgroundColor: color }}
              />
              <button
                onClick={generateRandomColor}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span className="text-sm">Random</span>
              </button>
            </div>

            {/* Hex Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">HEX</label>
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    onChange(value);
                  }
                }}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm font-mono text-white focus:border-purple-500 focus:outline-none"
                placeholder="#000000"
              />
            </div>

            {/* HSL Sliders */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hue: {hsl.h}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hsl.h}
                  onChange={(e) => handleHslChange(parseInt(e.target.value), hsl.s, hsl.l)}
                  className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Saturation: {hsl.s}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.s}
                  onChange={(e) => handleHslChange(hsl.h, parseInt(e.target.value), hsl.l)}
                  className="w-full h-2 bg-gradient-to-r from-gray-500 to-current rounded-lg appearance-none cursor-pointer"
                  style={{ color: `hsl(${hsl.h}, 100%, 50%)` }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Lightness: {hsl.l}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => handleHslChange(hsl.h, hsl.s, parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-black via-current to-white rounded-lg appearance-none cursor-pointer"
                  style={{ color: `hsl(${hsl.h}, ${hsl.s}%, 50%)` }}
                />
              </div>
            </div>

            {/* RGB Inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">R</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => {
                    const newRgb = { ...rgb, r: parseInt(e.target.value) || 0 };
                    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                    onChange(newHex);
                  }}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">G</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => {
                    const newRgb = { ...rgb, g: parseInt(e.target.value) || 0 };
                    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                    onChange(newHex);
                  }}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">B</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => {
                    const newRgb = { ...rgb, b: parseInt(e.target.value) || 0 };
                    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                    onChange(newHex);
                  }}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};