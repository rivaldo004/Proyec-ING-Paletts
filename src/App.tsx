import React, { useState, useMemo } from 'react';
import { 
  Palette, 
  Heart, 
  Search, 
  Plus, 
  Download, 
  Upload,
  Filter,
  Grid,
  List,
  Settings,
  Trash2
} from 'lucide-react';
import { Color, ColorPalette } from './types/color';
import { ColorCard } from './components/ColorCard';
import { ColorPicker } from './components/ColorPicker';
import { ColorGenerator } from './components/ColorGenerator';
import { useLocalStorage } from './hooks/useLocalStorage';
import { hexToRgb, rgbToHsl } from './utils/colorUtils';

function App() {
  const [colors, setColors] = useLocalStorage<Color[]>('color-palette-colors', []);
  const [palettes, setPalettes] = useLocalStorage<ColorPalette[]>('color-palette-palettes', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newColorValue, setNewColorValue] = useState('#6366f1');
  const [newColorName, setNewColorName] = useState('');
  const [activeTab, setActiveTab] = useState<'colors' | 'generator' | 'palettes'>('colors');

  // Estados y lógica para la combinación de colores
  const [color1, setColor1] = useState('#6366f1');
  const [color2, setColor2] = useState('#ff6b9d');
  const [combinedColor, setCombinedColor] = useState<string>('');
  const [combinationHistory, setCombinationHistory] = useState<{color1: string, color2: string, result: string, name: string}[]>([]);
  const [editingIdx, setEditingIdx] = useState<number|null>(null);
  const [editingName, setEditingName] = useState('');

  function handleCombineColors() {
    function hexToRgbObj(hex: string) {
      hex = hex.replace('#', '');
      const bigint = parseInt(hex, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
      };
    }
    function rgbToHex(r: number, g: number, b: number) {
      return (
        '#' +
        [r, g, b]
          .map(x => x.toString(16).padStart(2, '0'))
          .join('')
      );
    }
    const rgb1 = hexToRgbObj(color1);
    const rgb2 = hexToRgbObj(color2);
    // Combina promediando los componentes
    const r = Math.round((rgb1.r + rgb2.r) / 2);
    const g = Math.round((rgb1.g + rgb2.g) / 2);
    const b = Math.round((rgb1.b + rgb2.b) / 2);
    const resultHex = rgbToHex(r, g, b);
    setCombinedColor(resultHex);
    setCombinationHistory(prev => [
      { color1, color2, result: resultHex, name: '' },
      ...prev,
    ]);
  }

  function handleStartEditName(idx: number) {
    setEditingIdx(idx);
    setEditingName(combinationHistory[idx]?.name || '');
  }
  function handleSaveName(idx: number) {
    setCombinationHistory(prev => prev.map((combo, i) =>
      i === idx ? { ...combo, name: editingName } : combo
    ))
    setEditingIdx(null);
    setEditingName('');
  }
  function handleDeleteCombination(idx: number) {
    setCombinationHistory(prev => prev.filter((_, i) => i !== idx));
  }

  // Filter colors based on search and favorites
  const filteredColors = useMemo(() => {
    return colors.filter(color => {
      const matchesSearch = color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          color.hex.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorites = !filterFavorites || color.isFavorite;
      return matchesSearch && matchesFavorites;
    });
  }, [colors, searchTerm, filterFavorites]);

  const addColor = () => {
    if (!newColorName.trim()) return;

    const rgb = hexToRgb(newColorValue);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const newColor: Color = {
      id: Date.now().toString(),
      name: newColorName.trim(),
      hex: newColorValue,
      rgb,
      hsl,
      isFavorite: false,
      createdAt: new Date()
    };

    setColors(prev => [newColor, ...prev]);
    setNewColorName('');
  };

  const addGeneratedColors = (generatedColors: Color[]) => {
    setColors(prev => [...generatedColors, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setColors(prev => prev.map(color => 
      color.id === id ? { ...color, isFavorite: !color.isFavorite } : color
    ));
  };

  const deleteColor = (id: string) => {
    setColors(prev => prev.filter(color => color.id !== id));
  };

  const renameColor = (id: string, newName: string) => {
    setColors(prev => prev.map(color => 
      color.id === id ? { ...color, name: newName } : color
    ));
  };

  const exportColors = () => {
    const dataStr = JSON.stringify({ colors, palettes }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'color-palette.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importColors = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.colors) setColors(data.colors);
        if (data.palettes) setPalettes(data.palettes);
      } catch (error) {
        console.error('Error importing colors:', error);
      }
    };
    reader.readAsText(file);
  };

  const clearAllColors = () => {
    if (window.confirm('Are you sure you want to delete all colors? This action cannot be undone.')) {
      setColors([]);
    }
  };

  const favoriteColors = colors.filter(color => color.isFavorite);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Palette className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    DevPalette
                  </h1>
                  <p className="text-sm text-gray-400">Professional Color Tool for Developers</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={exportColors}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <label className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importColors}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { key: 'colors', label: 'My Colors', count: colors.length },
              { key: 'generator', label: 'Generator', count: null },
              { key: 'palettes', label: 'Palettes', count: palettes.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'colors' && (
          <div className="space-y-8">
            {/* Add New Color */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Color</span>
              </h2>
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Enter color name..."
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addColor()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color Value
                  </label>
                  <ColorPicker 
                    color={newColorValue}
                    onChange={setNewColorValue}
                  />
                </div>
                <button
                  onClick={addColor}
                  disabled={!newColorName.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Add Color
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-purple-500 focus:outline-none w-64"
                  />
                </div>
                
                <button
                  onClick={() => setFilterFavorites(!filterFavorites)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    filterFavorites
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${filterFavorites ? 'fill-current' : ''}`} />
                  <span>Favorites</span>
                  {favoriteColors.length > 0 && (
                    <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                      {favoriteColors.length}
                    </span>
                  )}
                </button>
              </div>

              {colors.length > 0 && (
                <button
                  onClick={clearAllColors}
                  className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Colors Grid */}
            {filteredColors.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {filteredColors.map((color) => (
                  <ColorCard
                    key={color.id}
                    color={color}
                    onToggleFavorite={toggleFavorite}
                    onDelete={deleteColor}
                    onRename={renameColor}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Palette className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {colors.length === 0 ? 'No colors yet' : 'No colors found'}
                </h3>
                <p className="text-gray-500">
                  {colors.length === 0 
                    ? 'Add your first color to get started'
                    : 'Try adjusting your search or filters'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'generator' && (
          <ColorGenerator onAddColors={addGeneratedColors} />
        )}

        {activeTab === 'palettes' && (
          <div className="max-w-lg mx-auto py-16 bg-gray-800 rounded-xl border border-gray-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2 justify-center">
              <Palette className="w-6 h-6" />
              <span>Color Combination</span>
            </h2>
            <div className="flex flex-col space-y-6">
              <div className="flex flex-row space-x-4 justify-center">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-center">Color 1</label>
                  <ColorPicker color={color1} onChange={setColor1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-center">Color 2</label>
                  <ColorPicker color={color2} onChange={setColor2} />
                </div>
              </div>
              <button
                onClick={handleCombineColors}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Combinar Colores
              </button>
              {combinedColor && (
                <div className="mt-8 text-center">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Color Combinado</label>
                  <div className="w-24 h-24 mx-auto rounded-full border-2 border-gray-600" style={{ backgroundColor: combinedColor }} />
                  <div className="mt-2 font-mono text-white">{combinedColor.toUpperCase()}</div>
                </div>
              )}
            </div>
            {combinationHistory.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Historial de Combinaciones</h3>
                <div className="flex flex-col space-y-4">
                  {combinationHistory.map((combo, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-4 w-full">
                        <div className="flex flex-col items-center w-1/3">
                          <span className="text-xs text-gray-300 mb-1">Color 1</span>
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: combo.color1 }} />
                          <span className="text-xs font-mono text-gray-400 mt-1">{combo.color1.toUpperCase()}</span>
                        </div>
                        <span className="text-white">+</span>
                        <div className="flex flex-col items-center w-1/3">
                          <span className="text-xs text-gray-300 mb-1">Color 2</span>
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: combo.color2 }} />
                          <span className="text-xs font-mono text-gray-400 mt-1">{combo.color2.toUpperCase()}</span>
                        </div>
                        <span className="text-white">=</span>
                        <div className="flex flex-col items-center w-1/3">
                          <span className="text-xs text-gray-300 mb-1">Resultado</span>
                          <div className="w-8 h-8 rounded border-2 border-white" style={{ backgroundColor: combo.result }} />
                          <span className="text-xs font-mono text-gray-400 mt-1">{combo.result.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        {/* Editar/agregar nombre */}
                        {editingIdx === idx ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={e => setEditingName(e.target.value)}
                              onBlur={() => handleSaveName(idx)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(idx); }}
                              className="w-32 p-1 text-gray-900 rounded bg-gray-100 text-xs focus:outline-none focus:ring"
                              autoFocus
                            />
                            <button onClick={() => handleSaveName(idx)} className="text-purple-300 hover:text-white text-lg">✔</button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-purple-200">
                              {combo.name ? combo.name : <span className="italic text-gray-400">Sin nombre</span>}
                            </span>
                            <button onClick={() => handleStartEditName(idx)} className="text-gray-300 hover:text-white text-lg">✎</button>
                          </div>
                        )}
                        {/* Borrar */}
                        <button
                          className="mt-2 px-2 py-1 text-xs text-red-400 hover:text-red-300 rounded"
                          title="Eliminar esta combinación"
                          onClick={() => handleDeleteCombination(idx)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;