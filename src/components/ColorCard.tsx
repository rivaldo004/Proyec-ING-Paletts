import React, { useState } from 'react';
import { Heart, Copy, Check, Edit2, Trash2 } from 'lucide-react';
import { Color, ColorFormat } from '../types/color';
import { formatColorCode, getContrastColor } from '../utils/colorUtils';

interface ColorCardProps {
  color: Color;
  onToggleFavorite: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  showActions?: boolean;
}

export const ColorCard: React.FC<ColorCardProps> = ({ 
  color, 
  onToggleFavorite, 
  onDelete,
  onRename,
  showActions = true 
}) => {
  const [copiedFormat, setCopiedFormat] = useState<ColorFormat | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(color.name);

  const formats: { key: ColorFormat; label: string }[] = [
    { key: 'hex', label: 'HEX' },
    { key: 'rgb', label: 'RGB' },
    { key: 'hsl', label: 'HSL' },
    { key: 'css-var', label: 'CSS' }
  ];

  const copyToClipboard = async (format: ColorFormat) => {
    const code = formatColorCode(color, format);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRename = () => {
    if (onRename && editName.trim() !== color.name) {
      onRename(color.id, editName.trim());
    }
    setIsEditing(false);
  };

  const textColor = getContrastColor(color.hex);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300 group">
      {/* Color Preview */}
      <div 
        className="h-32 relative flex items-center justify-center"
        style={{ backgroundColor: color.hex }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {showActions && (
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleFavorite(color.id)}
              className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                color.isFavorite 
                  ? 'bg-red-500/80 text-white' 
                  : 'bg-black/20 text-white hover:bg-red-500/80'
              }`}
            >
              <Heart className={`w-4 h-4 ${color.isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            {onDelete && (
              <button
                onClick={() => onDelete(color.id)}
                className="p-2 rounded-lg bg-black/20 text-white hover:bg-red-500/80 backdrop-blur-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div 
          className="text-center font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: textColor }}
        >
          {color.hex.toUpperCase()}
        </div>
      </div>

      {/* Color Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditName(color.name);
                  setIsEditing(false);
                }
              }}
              className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-purple-500 focus:outline-none flex-1"
              autoFocus
            />
          ) : (
            <h3 className="font-semibold text-white text-sm truncate flex-1">
              {color.name}
            </h3>
          )}
          
          {onRename && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Color Codes */}
        <div className="space-y-2">
          {formats.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium w-8">
                {label}
              </span>
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <code className="text-xs font-mono text-gray-300 bg-gray-900 px-2 py-1 rounded flex-1 truncate">
                  {formatColorCode(color, key)}
                </code>
                <button
                  onClick={() => copyToClipboard(key)}
                  className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  title={`Copy ${label} code`}
                >
                  {copiedFormat === key ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RGB Values */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-400">R</div>
              <div className="text-red-400 font-mono">{color.rgb.r}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">G</div>
              <div className="text-green-400 font-mono">{color.rgb.g}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">B</div>
              <div className="text-blue-400 font-mono">{color.rgb.b}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};