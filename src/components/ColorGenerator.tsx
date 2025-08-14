import React, { useState } from 'react';
import { Palette, Zap, Shuffle, Plus } from 'lucide-react';
import { Color } from '../types/color';
import { generateColorVariations, generateComplementaryColors, hexToRgb, rgbToHsl } from '../utils/colorUtils';
import { ColorPicker } from './ColorPicker';
import { ColorCard } from './ColorCard';

interface ColorGeneratorProps {
  onAddColors: (colors: Color[]) => void;
}

export const ColorGenerator: React.FC<ColorGeneratorProps> = ({ onAddColors }) => {
  const [baseColor, setBaseColor] = useState('#6366f1');
  const [generationType, setGenerationType] = useState<'variations' | 'harmony'>('variations');
  const [generatedColors, setGeneratedColors] = useState<Color[]>([]);

  const generateColors = () => {
    let colors: Color[] = [];
    
    if (generationType === 'variations') {
      colors = generateColorVariations(baseColor);
    } else {
      colors = generateComplementaryColors(baseColor);
    }
    
    setGeneratedColors(colors);
  };

  const addAllColors = () => {
    if (generatedColors.length > 0) {
      onAddColors(generatedColors);
      setGeneratedColors([]);
    }
  };

  const addSingleColor = (color: Color) => {
    onAddColors([color]);
  };

  const presetColors = [
    '#ff6b9d', '#4ecdc4', '#45b7d1', '#f9ca24', '#a55eea', '#ff7675',
    '#fd79a8', '#00b894', '#0984e3', '#fdcb6e', '#6c5ce7', '#e84393'
  ];

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Color Generator</h2>
      </div>

      <div className="space-y-6">
        {/* Base Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Base Color
          </label>
          <div className="flex items-center space-x-4">
            <ColorPicker 
              color={baseColor}
              onChange={setBaseColor}
            />
            <div className="flex space-x-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBaseColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    baseColor === color 
                      ? 'border-white scale-110' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Generation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Generation Type
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setGenerationType('variations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                generationType === 'variations'
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Variations</span>
            </button>
            <button
              onClick={() => setGenerationType('harmony')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                generationType === 'harmony'
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              <span>Color Harmony</span>
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateColors}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Generate Colors
        </button>

        {/* Generated Colors */}
        {generatedColors.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Generated Colors ({generatedColors.length})
              </h3>
              <button
                onClick={addAllColors}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add All</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedColors.map((color) => (
                <div key={color.id} className="relative">
                  <ColorCard
                    color={color}
                    onToggleFavorite={() => {}}
                    showActions={false}
                  />
                  <button
                    onClick={() => addSingleColor(color)}
                    className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};