import { Zap, FileImage, Sparkles, Shield, Clock, Download } from 'lucide-react';
import ImageCompressor from '@/components/ImageCompressor';
import heroImage from '@/assets/hero-compression.jpg';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">CompressX</h1>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Image compression visualization" 
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl animate-float"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-2xl" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold">
              <span className="gradient-text">Compress</span>
              <br />
              <span className="text-foreground">Images Instantly</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Reduce image file sizes by up to 90% without losing quality. 
              Fast, secure, and completely free image compression tool.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Sparkles className="w-8 h-8" />,
              title: "Smart Compression",
              description: "Advanced algorithms preserve image quality while maximizing compression."
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "100% Secure",
              description: "All processing happens in your browser. Your images never leave your device."
            },
            {
              icon: <Clock className="w-8 h-8" />,
              title: "Lightning Fast",
              description: "Compress multiple images in seconds with our optimized processing."
            }
          ].map((feature, index) => (
            <div key={index} className="glass-card p-8 rounded-2xl text-center animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Main Compressor */}
        <ImageCompressor />

        {/* Supported Formats */}
        <section className="mt-24 text-center">
          <h3 className="text-2xl font-semibold mb-8">Supported Formats</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['JPG', 'PNG', 'WebP', 'GIF', 'AVIF'].map((format) => (
              <div key={format} className="glass-card px-6 py-3 rounded-full">
                <span className="font-medium">{format}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-24 glass-card p-12 rounded-3xl text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">1M+</div>
              <p className="text-muted-foreground">Images Compressed</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">90%</div>
              <p className="text-muted-foreground">Average Size Reduction</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <p className="text-muted-foreground">Free Forever</p>
            </div>
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-24 border-t border-border/20">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">CompressX</span>
          </div>
          <p className="text-muted-foreground">
            The fastest way to compress images without losing quality.
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 CompressX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;