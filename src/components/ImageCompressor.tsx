import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, FileImage, Settings, Zap, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';

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
      setImagePreview(e.target?.result as string);
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
        // Calculate new dimensions (simple compression by maintaining aspect ratio)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

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

      {/* Settings Section */}
      {selectedImage && (
        <Card className="glass-card p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Compression Settings</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
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
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
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
            </div>
          </div>

          <div className="mt-8">
            <Button
              onClick={compressImage}
              disabled={isProcessing}
              className="btn-primary w-full py-6 text-lg font-semibold"
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
          </div>

          {isProcessing && (
            <div className="mt-6 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Processing... {progress}%
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Results Section */}
      {compressedImage && (
        <Card className="glass-card p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <FileImage className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Compression Results</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-medium">Original</h4>
              <img
                src={imagePreview}
                alt="Original"
                className="w-full rounded-lg shadow-lg"
              />
              <p className="text-sm text-muted-foreground">
                Size: {formatFileSize(compressedImage.originalSize)}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Compressed</h4>
              <img
                src={compressedImage.url}
                alt="Compressed"
                className="w-full rounded-lg shadow-lg"
              />
              <p className="text-sm text-muted-foreground">
                Size: {formatFileSize(compressedImage.compressedSize)}
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 glass-card rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Compression Savings</p>
                <p className="text-2xl font-bold gradient-text">
                  {Math.round(((compressedImage.originalSize - compressedImage.compressedSize) / compressedImage.originalSize) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Saved {formatFileSize(compressedImage.originalSize - compressedImage.compressedSize)}
                </p>
              </div>
              
              <Button
                onClick={downloadImage}
                className="btn-primary px-8 py-4 text-lg font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Download
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageCompressor;