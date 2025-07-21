'use client';

import { useState } from 'react';

interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
  label?: string;
}

export function ColorPicker({ 
  colors, 
  onChange, 
  maxColors = 5, 
  label = "Paleta de Cores" 
}: ColorPickerProps) {
  const handleColorChange = (index: number, newColor: string) => {
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    onChange(updatedColors);
  };

  const addColor = () => {
    if (colors.length < maxColors) {
      onChange([...colors, '#000000']);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 1) {
      const updatedColors = colors.filter((_, i) => i !== index);
      onChange(updatedColors);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {colors.map((color, index) => (
          <div key={index} className="relative">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              className="h-12 w-full border-2 border-gray-300 rounded-lg cursor-pointer"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">
                {color.toUpperCase()}
              </span>
              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        
        {colors.length < maxColors && (
          <button
            type="button"
            onClick={addColor}
            className="h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <span className="text-gray-500 text-xl">+</span>
          </button>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        {colors.length} de {maxColors} cores
      </p>
    </div>
  );
}
