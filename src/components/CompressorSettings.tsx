import React from 'react';
import { Settings } from 'lucide-react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Button } from './ui/button';

interface CompressorSettingsProps {
  format: string;
  setFormat: (format: string) => void;
  quality: number[];
  setQuality: (quality: number[]) => void;
  dimensions: { width: number; height: number };
  setDimensions: (dimensions: { width: number; height: number }) => void;
  maintainAspectRatio: boolean;
  setMaintainAspectRatio: (maintain: boolean) => void;
  originalDimensions: { width: number; height: number };
  advancedMode: boolean;
  onPresetSelect: (preset: string) => void;
}

const PRESETS = [
  { name: 'Web Optimized', quality: 85, format: 'webp', maxWidth: 1920 },
  { name: 'Social Media', quality: 80, format: 'jpeg', maxWidth: 1080 },
  { name: 'Email Friendly', quality: 75, format: 'jpeg', maxWidth: 800 },
  { name: 'Thumbnail', quality: 70, format: 'webp', maxWidth: 300 },
  { name: 'Maximum Quality', quality: 95, format: 'png', maxWidth: null },
  { name: 'Maximum Compression', quality: 50, format: 'webp', maxWidth: 1200 },
];

const CompressorSettings: React.FC<CompressorSettingsProps> = ({
  format,
  setFormat,
  quality,
  setQuality,
  dimensions,
  setDimensions,
  maintainAspectRatio,
  setMaintainAspectRatio,
  originalDimensions,
  advancedMode,
  onPresetSelect,
}) => {
  const handleDimensionChange = (type: 'width' | 'height', value: number) => {
    if (maintainAspectRatio && originalDimensions.width && originalDimensions.height) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      if (type === 'width') {
        setDimensions({ width: value, height: Math.round(value / aspectRatio) });
      } else {
        setDimensions({ width: Math.round(value * aspectRatio), height: value });
      }
    } else {
      setDimensions({ ...dimensions, [type]: value });
    }
  };

  return (
    <Card className="glass-card p-8 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Compression Settings</h3>
      </div>

      {/* Quick Presets */}
      {!advancedMode && (
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3">Quick Presets</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="glass-card text-sm"
                onClick={() => onPresetSelect(preset.name)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Output Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="glass-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webp">WebP (Best compression)</SelectItem>
                <SelectItem value="jpeg">JPEG (Universal)</SelectItem>
                <SelectItem value="png">PNG (Lossless)</SelectItem>
                {advancedMode && <SelectItem value="avif">AVIF (Modern)</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {advancedMode && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Dimensions</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Width"
                      value={dimensions.width || ''}
                      onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                      className="glass-card"
                    />
                  </div>
                  <span className="text-muted-foreground">×</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Height"
                      value={dimensions.height || ''}
                      onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                      className="glass-card"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Switch
                    checked={maintainAspectRatio}
                    onCheckedChange={setMaintainAspectRatio}
                  />
                  <label className="text-sm text-muted-foreground">Maintain aspect ratio</label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              Quality: {quality[0]}%
            </label>
            <Slider
              value={quality}
              onValueChange={setQuality}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
          </div>

          {advancedMode && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Original: {originalDimensions.width}×{originalDimensions.height}px</p>
              <p>Output: {dimensions.width}×{dimensions.height}px</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CompressorSettings;