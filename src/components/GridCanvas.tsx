import { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ruler, Download } from 'lucide-react';

interface GridCanvasProps {
  image: HTMLImageElement | null;
  isGrayscale: boolean;
  gridSize: number;
  gridColor: string;
  gridWidth: number;
  aspectRatio: string;
}

const GridCanvas = ({ image, isGrayscale, gridSize, gridColor, gridWidth, aspectRatio }: GridCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [gridDimensions, setGridDimensions] = useState({ cellWidth: 0, cellHeight: 0, displayWidth: 0, displayHeight: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      // Calculate dimensions based on selected aspect ratio
      const containerWidth = 800;
      const containerHeight = 600;
      
      let targetAspectRatio = image.width / image.height; // Default to original
      
      // Parse custom aspect ratio
      if (aspectRatio !== 'original') {
        const [width, height] = aspectRatio.split(':').map(Number);
        targetAspectRatio = width / height;
      }
      
      const containerAspectRatio = containerWidth / containerHeight;

      let drawWidth, drawHeight;

      if (targetAspectRatio > containerAspectRatio) {
        drawWidth = containerWidth;
        drawHeight = containerWidth / targetAspectRatio;
      } else {
        drawHeight = containerHeight;
        drawWidth = containerHeight * targetAspectRatio;
      }

      const baseOffsetX = (containerWidth - drawWidth) / 2;
      const baseOffsetY = (containerHeight - drawHeight) / 2;
      const offsetX = baseOffsetX;
      const offsetY = baseOffsetY;

      // Calculate grid cell dimensions
      const cellWidth = drawWidth / gridSize;
      const cellHeight = drawHeight / gridSize;
      
      // Convert pixels to centimeters (96 DPI standard: 1 pixel = 0.0264583 cm)
      const pixelToCm = 0.0264583;
      const cellWidthCm = (cellWidth * pixelToCm);
      const cellHeightCm = (cellHeight * pixelToCm);
      const displayWidthCm = (drawWidth * pixelToCm);
      const displayHeightCm = (drawHeight * pixelToCm);
      
      // Update grid dimensions state
      setGridDimensions({
        cellWidth: Math.round(cellWidthCm * 10) / 10, // Round to 1 decimal place
        cellHeight: Math.round(cellHeightCm * 10) / 10,
        displayWidth: Math.round(displayWidthCm * 10) / 10,
        displayHeight: Math.round(displayHeightCm * 10) / 10
      });

      // Draw image
      if (isGrayscale) {
        ctx.filter = 'grayscale(100%)';
      } else {
        ctx.filter = 'none';
      }

      // Calculate source dimensions for cropping based on aspect ratio
      let sourceX = 0, sourceY = 0, sourceWidth = image.width, sourceHeight = image.height;
      
      if (aspectRatio !== 'original') {
        const imageAspectRatio = image.width / image.height;
        
        if (targetAspectRatio > imageAspectRatio) {
          // Image is taller than target ratio, crop height
          sourceHeight = image.width / targetAspectRatio;
          sourceY = (image.height - sourceHeight) / 2;
        } else if (targetAspectRatio < imageAspectRatio) {
          // Image is wider than target ratio, crop width
          sourceWidth = image.height * targetAspectRatio;
          sourceX = (image.width - sourceWidth) / 2;
        }
      }

      // Apply drag offset to source coordinates for panning
      const panSensitivity = 2; // Adjust panning sensitivity
      const panX = -imageOffset.x * panSensitivity;
      const panY = -imageOffset.y * panSensitivity;
      
      // Constrain panning to stay within image bounds
      const maxPanX = Math.max(0, sourceWidth * 0.3); // Allow 30% pan range
      const maxPanY = Math.max(0, sourceHeight * 0.3);
      
      const constrainedPanX = Math.max(-maxPanX, Math.min(maxPanX, panX));
      const constrainedPanY = Math.max(-maxPanY, Math.min(maxPanY, panY));
      
      sourceX = Math.max(0, Math.min(image.width - sourceWidth, sourceX + constrainedPanX));
      sourceY = Math.max(0, Math.min(image.height - sourceHeight, sourceY + constrainedPanY));

      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, offsetX, offsetY, drawWidth, drawHeight);
      
      // Reset filter for grid
      ctx.filter = 'none';

      // Draw grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = gridWidth;
      ctx.globalAlpha = 0.8;

      // Vertical lines
      for (let i = 0; i <= gridSize; i++) {
        const x = offsetX + i * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, offsetY + drawHeight);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 0; i <= gridSize; i++) {
        const y = offsetY + i * cellHeight;
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + drawWidth, y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    } else {
      // Reset grid dimensions when no image
      setGridDimensions({ cellWidth: 0, cellHeight: 0, displayWidth: 0, displayHeight: 0 });
      
      // Draw placeholder
      ctx.fillStyle = 'hsl(var(--muted))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '18px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload an image to start', canvas.width / 2, canvas.height / 2);
    }
  }, [image, isGrayscale, gridSize, gridColor, gridWidth, aspectRatio, imageOffset]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    // Create download link
    const link = document.createElement('a');
    link.download = `grid-drawing-${gridSize}x${gridSize}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x: x - imageOffset.x, y: y - imageOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newOffsetX = x - dragStart.x;
    const newOffsetY = y - dragStart.y;

    // Constrain the offset for smooth panning
    const maxOffset = 150; // pixels
    const constrainedX = Math.max(-maxOffset, Math.min(maxOffset, newOffsetX));
    const constrainedY = Math.max(-maxOffset, Math.min(maxOffset, newOffsetY));

    setImageOffset({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Reset image offset when aspect ratio changes
  const resetImagePosition = () => {
    setImageOffset({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-8 glass-panel border-white/5 relative group">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={`max-w-full h-auto rounded-xl shadow-strong ring-1 ring-white/10 group-hover:shadow-neon transition-all duration-700 max-h-[70vh] object-contain ${
              image ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          />
        </div>
        {/* Reset Position Button */}
        {image && (imageOffset.x !== 0 || imageOffset.y !== 0) && (
          <div className="flex justify-center mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetImagePosition}
              className="text-xs"
            >
              Reset Position
            </Button>
          </div>
        )}
      </Card>

      {/* Grid Dimensions Info */}
      {image && gridDimensions.cellWidth > 0 && (
        <Card className="p-6 glass-panel border-white/5 hover-scale">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Ruler className="w-4 h-4 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-card-foreground">Grid Measurements</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Cell Width (X-axis)</p>
              <Badge variant="outline" className="w-full justify-center font-mono">
                {gridDimensions.cellWidth} cm
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Cell Height (Y-axis)</p>
              <Badge variant="outline" className="w-full justify-center font-mono">
                {gridDimensions.cellHeight} cm
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Width</p>
              <Badge variant="secondary" className="w-full justify-center font-mono">
                {gridDimensions.displayWidth} cm
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Height</p>
              <Badge variant="secondary" className="w-full justify-center font-mono">
                {gridDimensions.displayHeight} cm
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-card-foreground">💡 Pro Tip:</span> Use these measurements to create a matching {gridSize}×{gridSize} grid on your drawing paper. 
              Each cell should be approximately {gridDimensions.cellWidth}×{gridDimensions.cellHeight} cm when drawn.
            </p>
          </div>
        </Card>
      )}

      {/* Download Button */}
      {image && (
        <Card className="p-6 glass-panel border-white/5 hover-scale">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Download className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Export Grid Image</h3>
                <p className="text-sm text-muted-foreground">Download the image with grid overlay</p>
              </div>
            </div>
            <Button 
              onClick={handleDownload}
              className="bg-gradient-primary hover:opacity-100 shadow-medium hover:shadow-neon transition-all text-primary-foreground hover-scale rounded-xl px-6"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Canvas
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GridCanvas;