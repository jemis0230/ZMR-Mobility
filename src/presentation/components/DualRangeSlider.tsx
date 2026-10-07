"use client";

import React, { useState, useEffect, useRef } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  initialMin?: number;
  initialMax?: number;
  onChangeComplete?: (min: number, max: number) => void;
  formatLabel?: (val: number) => string;
  /** Accessible names for the two thumbs */
  labels?: [string, string];
}

export default function DualRangeSlider({
  min,
  max,
  step = 1,
  initialMin,
  initialMax,
  onChangeComplete,
  formatLabel = (v) => v.toString(),
  labels = ["Minimum", "Maximum"],
}: DualRangeSliderProps) {
  const [minVal, setMinVal] = useState(initialMin ?? min);
  const [maxVal, setMaxVal] = useState(initialMax ?? max);

  // Sync state if props change (useful when filters clear)
  useEffect(() => {
    setMinVal(initialMin ?? min);
  }, [initialMin, min]);

  useEffect(() => {
    setMaxVal(initialMax ?? max);
  }, [initialMax, max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(value);
  };

  const handleMouseUp = () => {
    if (onChangeComplete) {
      onChangeComplete(minVal, maxVal);
    }
  };

  // Calculate percentage for highlighting the track
  const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-4">
        <span className="text-xs font-bold text-forest">{formatLabel(minVal)}</span>
        <span className="text-xs font-bold text-forest">{formatLabel(maxVal)}</span>
      </div>

      <div className="relative w-full h-6 flex items-center group">
        {/* Track Background */}
        <div className="absolute w-full h-1.5 bg-ink/10 rounded-lg" />

        {/* Track Highlight */}
        <div
          className="absolute h-1.5 bg-primary rounded-lg"
          style={{
            left: `${getPercent(minVal)}%`,
            width: `${getPercent(maxVal) - getPercent(minVal)}%`,
          }}
        />

        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          onKeyUp={handleMouseUp}
          aria-label={labels[0]}
          aria-valuetext={formatLabel(minVal)}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20 
          [&::-webkit-slider-thumb]:pointer-events-auto 
          [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
          
          [&::-moz-range-thumb]:pointer-events-auto 
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
          [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary 
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:transition-transform
          [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing
          "
          style={{ zIndex: minVal > max - 100 ? 30 : 20 }}
        />

        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          onKeyUp={handleMouseUp}
          aria-label={labels[1]}
          aria-valuetext={formatLabel(maxVal)}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20 
          [&::-webkit-slider-thumb]:pointer-events-auto 
          [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
          
          [&::-moz-range-thumb]:pointer-events-auto 
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
          [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary 
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:transition-transform
          [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing
          "
        />
      </div>

      <div className="flex justify-between mt-1 text-[10px] text-ink/70 font-medium">
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}</span>
      </div>
    </div>
  );
}
