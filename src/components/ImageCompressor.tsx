import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Zap, ArrowRight, Settings2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { useToast } from '@/hooks/use-toast';
import CompressorSettings from './CompressorSettings';
import ComparisonSlider from './ComparisonSlider';

interface CompressedImage {
  file: File;
  url: string;
  originalSize: number;
  compressedSize: number;
  format: string;
}

const ImageCompressor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null);
  const [quality, setQuality] = useState([80]);
  const [format, setFormat] = useState<string>('webp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      
      // Get original dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setDimensions({ width: img.width, height: img.height });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    setCompressedImage(null);
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const compressImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing with progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Use specified dimensions or original
        let { width, height } = dimensions.width && dimensions.height 
          ? dimensions 
          : { width: img.width, height: img.height };

        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], `compressed.${format}`, {
              type: `image/${format}`,
            });
            
            setCompressedImage({
              file: compressedFile,
              url: URL.createObjectURL(blob),
              originalSize: selectedImage.size,
              compressedSize: blob.size,
              format: format,
            });

            clearInterval(progressInterval);
            setProgress(100);
            setIsProcessing(false);

            toast({
              title: "Compression complete!",
              description: `Reduced file size by ${Math.round(((selectedImage.size - blob.size) / selectedImage.size) * 100)}%`,
            });
          }
        }, `image/${format}`, quality[0] / 100);
      };
      
      img.src = imagePreview;
    } catch (error) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      toast({
        title: "Compression failed",
        description: "An error occurred while compressing the image.",
        variant: "destructive",
      });
    }
  };

  const downloadImage = () => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage.url;
    link.download = `compressed-image.${compressedImage.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your compressed image is being downloaded.",
    });
  };

  const handlePresetSelect = (presetName: string) => {
    const presets = {
      'Web Optimized': { quality: [85], format: 'webp', maxWidth: 1920 },
      'Social Media': { quality: [80], format: 'jpeg', maxWidth: 1080 },
      'Email Friendly': { quality: [75], format: 'jpeg', maxWidth: 800 },
      'Thumbnail': { quality: [70], format: 'webp', maxWidth: 300 },
      'Maximum Quality': { quality: [95], format: 'png', maxWidth: null },
      'Maximum Compression': { quality: [50], format: 'webp', maxWidth: 1200 },
    };

    const preset = presets[presetName as keyof typeof presets];
    if (preset) {
      setQuality(preset.quality);
      setFormat(preset.format);
      if (preset.maxWidth && originalDimensions.width) {
        const aspectRatio = originalDimensions.width / originalDimensions.height;
        const newWidth = Math.min(preset.maxWidth, originalDimensions.width);
        const newHeight = Math.round(newWidth / aspectRatio);
        setDimensions({ width: newWidth, height: newHeight });
      }

      toast({
        title: "Preset Applied",
        description: `${presetName} settings have been applied.`,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="glass-card p-8 animate-slide-up">
        <div
          className={`upload-zone rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragActive ? 'border-primary scale-105' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleFileInputClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])}
            className="hidden"
          />
          
          {imagePreview ? (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <p className="text-muted-foreground">
                {selectedImage?.name} • {formatFileSize(selectedImage?.size || 0)}
              </p>
              {originalDimensions.width && (
                <p className="text-sm text-muted-foreground">
                  {originalDimensions.width} × {originalDimensions.height} pixels
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="animate-float">
                <Upload className="w-16 h-16 mx-auto text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Drop your image here</h3>
                <p className="text-muted-foreground">
                  or <span className="text-primary font-medium">click to browse</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Mode Toggle */}
      {selectedImage && (
        <Card className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-primary" />
              <span className="font-medium">Compression Mode</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!advancedMode ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Simple
              </span>
              <Switch
                checked={advancedMode}
                onCheckedChange={setAdvancedMode}
              />
              <span className={`text-sm ${advancedMode ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Advanced
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Settings Section */}
      {selectedImage && (
        <>
          <CompressorSettings
            format={format}
            setFormat={setFormat}
            quality={quality}
            setQuality={setQuality}
            dimensions={dimensions}
            setDimensions={setDimensions}
            maintainAspectRatio={maintainAspectRatio}
            setMaintainAspectRatio={setMaintainAspectRatio}
            originalDimensions={originalDimensions}
            advancedMode={advancedMode}
            onPresetSelect={handlePresetSelect}
          />

          <div className="text-center">
            <Button
              onClick={compressImage}
              disabled={isProcessing}
              className="btn-primary px-12 py-6 text-lg font-semibold"
            >
              {isProcessing ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-pulse-glow" />
                  Compressing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Compress Image
                </>
              )}
            </Button>

            {isProcessing && (
              <div className="mt-6 space-y-2 max-w-md mx-auto">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Processing... {progress}%
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Comparison Results */}
      {compressedImage && (
        <>
          <ComparisonSlider
            originalImage={imagePreview}
            compressedImage={compressedImage.url}
            originalSize={compressedImage.originalSize}
            compressedSize={compressedImage.compressedSize}
          />

          <Card className="glass-card p-8 animate-slide-up">
            <div className="flex items-center justify-center">
              <Button
                onClick={downloadImage}
                className="btn-primary px-12 py-6 text-lg font-semibold"
              >
                <Download className="w-6 h-6 mr-3" />
                Download Compressed Image
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ImageCompressor;