import React, { useState, useRef } from 'react';
import { Card } from './ui/card';
import { FileImage } from 'lucide-react';

interface ComparisonSliderProps {
  originalImage: string;
  compressedImage: string;
  originalSize: number;
  compressedSize: number;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalImage,
  compressedImage,
  originalSize,
  compressedSize,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionPercentage = Math.round(((originalSize - compressedSize) / originalSize) * 100);

  return (
    <Card className="glass-card p-8 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <FileImage className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Before vs After</h3>
      </div>

      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-lg cursor-ew-resize"
        onMouseMove={handleMouseMove}
        style={{ aspectRatio: '16/9', minHeight: '300px' }}
      >
        {/* Compressed Image (Background) */}
        <img
          src={compressedImage}
          alt="Compressed"
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {/* Original Image (Foreground with clip) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={originalImage}
            alt="Original"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Slider Line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1 h-4 bg-gray-400 rounded"></div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur">
          Original ({formatFileSize(originalSize)})
        </div>
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur">
          Compressed ({formatFileSize(compressedSize)})
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="glass-card p-4 rounded-lg">
          <div className="text-2xl font-bold gradient-text">{compressionPercentage}%</div>
          <div className="text-sm text-muted-foreground">Size Reduction</div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="text-2xl font-bold gradient-text">{formatFileSize(originalSize - compressedSize)}</div>
          <div className="text-sm text-muted-foreground">Space Saved</div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="text-2xl font-bold gradient-text">{formatFileSize(compressedSize)}</div>
          <div className="text-sm text-muted-foreground">Final Size</div>
        </div>
      </div>
    </Card>
  );
};

export default ComparisonSlider;