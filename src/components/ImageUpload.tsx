import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  hasImage: boolean;
}

const ImageUpload = ({ onImageUpload, hasImage }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6 glass-panel border-white/5 hover:border-primary/30 transition-smooth group cursor-pointer relative" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) { onImageUpload(e.dataTransfer.files[0]); } }}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="text-center space-y-5 relative z-10">
        {!hasImage ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-bounce shadow-neon">
              <ImageIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
                Upload Reference Image
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                Drag and drop or click to choose an image
              </p>
            </div>
          </>
        ) : (
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center border border-white/10 group-hover:scale-105 transition-smooth">
            <Upload className="w-6 h-6 text-secondary-foreground" />
          </div>
        )}
        
        <Button 
          onClick={handleButtonClick}
          className="bg-gradient-primary hover:opacity-100 text-primary-foreground font-medium px-8 py-2.5 transition-all shadow-medium hover:shadow-neon hover-scale rounded-xl"
        >
          <Upload className="w-4 h-4 mr-2" />
          {hasImage ? 'Change Image' : 'Select Image'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <p className="text-xs text-muted-foreground/60 font-medium">
          Supports JPG, PNG, GIF, WebP
        </p>
      </div>
    </Card>
  );
};

export default ImageUpload;