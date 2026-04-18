import { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ruler, Download, ZoomIn, ZoomOut, RefreshCcw, Eye, EyeOff } from 'lucide-react';

interface GridCanvasProps {
  image: HTMLImageElement | null;
  isGrayscale: boolean;
  gridSize: number;
  gridColor: string;
  gridWidth: number;
  aspectRatio: string;
  hasDiagonals: boolean;
  showLabels: boolean;
  brightness: number;
  contrast: number;
  physicalWidth: string;
  physicalHeight: string;
  physicalUnit: string;
}

const GridCanvas = ({ 
  image, 
  isGrayscale, 
  gridSize, 
  gridColor, 
  gridWidth, 
  aspectRatio,
  hasDiagonals,
  showLabels,
  brightness,
  contrast,
  physicalWidth,
  physicalHeight,
  physicalUnit
}: GridCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [gridDimensions, setGridDimensions] = useState({ 
    cellWidth: 0, 
    cellHeight: 0, 
    displayWidth: 0, 
    displayHeight: 0,
    realCellWidth: 0,
    realCellHeight: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [isPeeking, setIsPeeking] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPeeking(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPeeking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      const containerWidth = 800;
      const containerHeight = 600;
      const labelPadding = showLabels && !isPeeking ? 30 : 0;
      
      const availableWidth = containerWidth - labelPadding;
      const availableHeight = containerHeight - labelPadding;
      
      let targetAspectRatio = image.width / image.height;
      if (aspectRatio !== 'original') {
        const [w, h] = aspectRatio.split(':').map(Number);
        targetAspectRatio = w / h;
      }
      
      const containerAspectRatio = availableWidth / availableHeight;
      let drawWidth, drawHeight;

      if (targetAspectRatio > containerAspectRatio) {
        drawWidth = availableWidth;
        drawHeight = availableWidth / targetAspectRatio;
      } else {
        drawHeight = availableHeight;
        drawWidth = availableHeight * targetAspectRatio;
      }

      // Apply zoom
      drawWidth *= zoom;
      drawHeight *= zoom;

      const offsetX = (containerWidth - drawWidth) / 2 + labelPadding / 2;
      const offsetY = (containerHeight - drawHeight) / 2 + labelPadding / 2;

      // Grid cell dimensions for calculations
      const cellWidth = drawWidth / gridSize;
      const cellHeight = drawHeight / gridSize;
      
      // Physical measurements calculation
      const pWidth = parseFloat(physicalWidth);
      const pHeight = parseFloat(physicalHeight);
      let realCellW = 0, realCellH = 0, realDispW = 0, realDispH = 0;
      
      if (!isNaN(pWidth) && pWidth > 0) {
        realCellW = pWidth / gridSize;
        realDispW = pWidth;
      }
      if (!isNaN(pHeight) && pHeight > 0) {
        realCellH = pHeight / gridSize;
        realDispH = pHeight;
      } else if (realCellW > 0) {
        // Inherit from width if aspect ratio maintained
        realCellH = realCellW;
        realDispH = realCellH * gridSize;
      }

      setGridDimensions({
        cellWidth: Math.round((cellWidth * 0.0264583) * 10) / 10,
        cellHeight: Math.round((cellHeight * 0.0264583) * 10) / 10,
        displayWidth: Math.round((drawWidth * 0.0264583) * 10) / 10,
        displayHeight: Math.round((drawHeight * 0.0264583) * 10) / 10,
        realCellWidth: Math.round(realCellW * 100) / 100,
        realCellHeight: Math.round(realCellH * 100) / 100
      });

      // Filters
      if (isPeeking) {
        ctx.filter = 'none';
      } else {
        const grayscaleVal = isGrayscale ? 100 : 0;
        ctx.filter = `grayscale(${grayscaleVal}%) brightness(${brightness}%) contrast(${contrast}%)`;
      }

      // Source dimensions for cropping & panning
      let sourceX = 0, sourceY = 0, sourceWidth = image.width, sourceHeight = image.height;
      if (aspectRatio !== 'original') {
        const imgRatio = image.width / image.height;
        if (targetAspectRatio > imgRatio) {
          sourceHeight = image.width / targetAspectRatio;
          sourceY = (image.height - sourceHeight) / 2;
        } else {
          sourceWidth = image.height * targetAspectRatio;
          sourceX = (image.width - sourceWidth) / 2;
        }
      }

      const panSensitivity = 2 / zoom;
      sourceX = Math.max(0, Math.min(image.width - sourceWidth, sourceX - imageOffset.x * panSensitivity));
      sourceY = Math.max(0, Math.min(image.height - sourceHeight, sourceY - imageOffset.y * panSensitivity));

      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, offsetX, offsetY, drawWidth, drawHeight);
      
      if (!isPeeking) {
        ctx.filter = 'none';
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = gridWidth;
        ctx.globalAlpha = 0.8;

        // Draw labels if enabled
        if (showLabels) {
          ctx.fillStyle = gridColor;
          ctx.font = '12px Inter, sans-serif';
          ctx.textAlign = 'center';
        }

        // Vertical lines
        for (let i = 0; i <= gridSize; i++) {
          const x = offsetX + i * cellWidth;
          ctx.beginPath();
          ctx.moveTo(x, offsetY);
          ctx.lineTo(x, offsetY + drawHeight);
          ctx.stroke();

          if (showLabels && i < gridSize) {
            const labelX = String.fromCharCode(65 + (i % 26));
            ctx.fillText(labelX, x + cellWidth/2, offsetY - 10);
          }
        }

        // Horizontal lines
        for (let i = 0; i <= gridSize; i++) {
          const y = offsetY + i * cellHeight;
          ctx.beginPath();
          ctx.moveTo(offsetX, y);
          ctx.lineTo(offsetX + drawWidth, y);
          ctx.stroke();

          if (showLabels && i < gridSize) {
            ctx.fillText((i + 1).toString(), offsetX - 15, y + cellHeight/2 + 5);
          }
        }

        // Diagonals
        if (hasDiagonals) {
          ctx.lineWidth = gridWidth / 2;
          ctx.globalAlpha = 0.5;
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const x = offsetX + col * cellWidth;
              const y = offsetY + row * cellHeight;
              
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + cellWidth, y + cellHeight);
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(x + cellWidth, y);
              ctx.lineTo(x, y + cellHeight);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }
    } else {
      setGridDimensions({ cellWidth: 0, cellHeight: 0, displayWidth: 0, displayHeight: 0, realCellWidth: 0, realCellHeight: 0 });
      ctx.fillStyle = 'hsl(var(--muted))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload an image to start', canvas.width / 2, canvas.height / 2);
    }
  }, [image, isGrayscale, gridSize, gridColor, gridWidth, aspectRatio, imageOffset, hasDiagonals, showLabels, brightness, contrast, physicalWidth, physicalHeight, isPeeking, zoom]);

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
      <Card className="p-4 sm:p-8 glass-panel border-white/5 relative group overflow-hidden">
        {/* Zoom Controls */}
        {image && (
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(prev => Math.min(prev + 0.5, 5))}
              className="bg-background/50 backdrop-blur-md border-white/10 hover:bg-primary/20"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.5))}
              className="bg-background/50 backdrop-blur-md border-white/10 hover:bg-primary/20"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setZoom(1); setImageOffset({ x: 0, y: 0 }); }}
              className="bg-background/50 backdrop-blur-md border-white/10 hover:bg-primary/20"
              title="Reset View"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
            <Button
              variant={isPeeking ? "default" : "outline"}
              size="icon"
              onMouseDown={() => setIsPeeking(true)}
              onMouseUp={() => setIsPeeking(false)}
              onMouseLeave={() => setIsPeeking(false)}
              className={`${isPeeking ? 'bg-primary shadow-neon' : 'bg-background/50 backdrop-blur-md'} border-white/10`}
              title="Hold to Peek (Space)"
            >
              {isPeeking ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        )}

        <div className="flex justify-center relative touch-none">
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
        
        {image && (
          <div className="mt-4 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest px-2">
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <span>Hold Space to Peek</span>
            <span>Pan: Drag to Move</span>
          </div>
        )}
      </Card>

      {/* Grid Dimensions Info */}
      {image && (
        <Card className="p-6 glass-panel border-white/5 hover-scale">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
              <Ruler className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-card-foreground">Grid Measurements</h3>
              <p className="text-xs text-muted-foreground">Reference info for your drawing paper</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider text-center">Cell Width</p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="font-mono text-lg font-bold">
                  {gridDimensions.realCellWidth > 0 ? gridDimensions.realCellWidth : gridDimensions.cellWidth}
                </span>
                <span className="text-xs ml-1 text-muted-foreground">
                  {gridDimensions.realCellWidth > 0 ? physicalUnit : 'cm'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider text-center">Cell Height</p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="font-mono text-lg font-bold">
                  {gridDimensions.realCellHeight > 0 ? gridDimensions.realCellHeight : gridDimensions.cellHeight}
                </span>
                <span className="text-xs ml-1 text-muted-foreground">
                  {gridDimensions.realCellHeight > 0 ? physicalUnit : 'cm'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider text-center">Total Width</p>
              <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                <span className="font-mono text-lg font-bold">
                  {physicalWidth ? physicalWidth : gridDimensions.displayWidth}
                </span>
                <span className="text-xs ml-1 text-muted-foreground">
                  {physicalWidth ? physicalUnit : 'cm'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider text-center">Total Height</p>
              <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                <span className="font-mono text-lg font-bold">
                  {physicalHeight ? physicalHeight : gridDimensions.displayHeight}
                </span>
                <span className="text-xs ml-1 text-muted-foreground">
                  {physicalHeight ? physicalUnit : 'cm'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 animate-pulse">
              <span className="text-[10px] font-bold">Pro</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-primary font-bold uppercase mr-1">Recommended:</span> 
              Create a matching grid on your drawing paper using these measurements. 
              Focus on one cell at a time to maintain perfect proportions! ✍️
            </p>
          </div>
        </Card>
      )}

      {/* Download Button */}
      {image && (
        <Card className="p-6 glass-panel border-white/5 hover-scale">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/20">
                <Download className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-card-foreground">Export Grid Reference</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">High Quality PNG Output</p>
              </div>
            </div>
            <Button 
              onClick={handleDownload}
              className="bg-gradient-primary hover:opacity-100 shadow-medium hover:shadow-neon transition-all text-primary-foreground hover-scale rounded-xl px-10 py-6"
            >
              <Download className="w-5 h-5 mr-3" />
              Download Reference
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GridCanvas;