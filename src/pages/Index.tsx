import { useState } from 'react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ImageUpload';
import GridCanvas from '@/components/GridCanvas';
import ControlPanel from '@/components/ControlPanel';
import Manual from '@/components/Manual';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Brush, Sparkles } from 'lucide-react';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [gridSize, setGridSize] = useState(8);
  const [gridColor, setGridColor] = useState('#ffffff');
  const [gridWidth, setGridWidth] = useState(2);
  const [aspectRatio, setAspectRatio] = useState<string>('original');

  const handleImageUpload = (file: File) => {
    const img = new Image();
    img.onload = () => {
      setUploadedImage(img);
      toast.success('Image uploaded successfully!');
    };
    img.onerror = () => {
      toast.error('Failed to load image. Please try another file.');
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="py-12 px-4 text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-strong hover-scale">
              <Brush className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gradient">
              Artist Grid Tool
            </h1>
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-sm bg-white/5 border-white/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-primary" />
              Pro Reference
            </Badge>
          </div>
          <p className="text-muted-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Perfect your proportions with a professional grid overlay. Upload any image, customize your grid, 
            and create accurate drawings with the time-tested grid method.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel - Upload & Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ImageUpload 
              onImageUpload={handleImageUpload} 
              hasImage={!!uploadedImage}
            />
            <ControlPanel
              isGrayscale={isGrayscale}
              onGrayscaleToggle={setIsGrayscale}
              gridSize={gridSize}
              onGridSizeChange={setGridSize}
              gridColor={gridColor}
              onGridColorChange={setGridColor}
              gridWidth={gridWidth}
              onGridWidthChange={setGridWidth}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
            />
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3">
            <GridCanvas
              image={uploadedImage}
              isGrayscale={isGrayscale}
              gridSize={gridSize}
              gridColor={gridColor}
              gridWidth={gridWidth}
              aspectRatio={aspectRatio}
            />
          </div>
        </div>

        {/* Manual Section */}
        <div className="mt-16">
          <Separator className="mb-8" />
          <Manual />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center border-t border-border/50 mt-16">
        <p className="text-sm text-muted-foreground">
          Copyright owned by Xe54z 2025
        </p>
      </footer>
    </div>
  );
};

export default Index;