import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Palette, Grid3X3, Minus, Plus, RectangleHorizontal, Sun, Moon, Maximize2, Hash, Percent } from 'lucide-react';

interface ControlPanelProps {
  isGrayscale: boolean;
  onGrayscaleToggle: (value: boolean) => void;
  gridSize: number;
  onGridSizeChange: (value: number) => void;
  gridColor: string;
  onGridColorChange: (color: string) => void;
  gridWidth: number;
  onGridWidthChange: (value: number) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  hasDiagonals: boolean;
  onDiagonalsToggle: (value: boolean) => void;
  showLabels: boolean;
  onLabelsToggle: (value: boolean) => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
  contrast: number;
  onContrastChange: (value: number) => void;
  physicalWidth: string;
  onPhysicalWidthChange: (value: string) => void;
  physicalHeight: string;
  onPhysicalHeightChange: (value: string) => void;
  physicalUnit: string;
  onPhysicalUnitChange: (value: string) => void;
}

const ControlPanel = ({
  isGrayscale,
  onGrayscaleToggle,
  gridSize,
  onGridSizeChange,
  gridColor,
  onGridColorChange,
  gridWidth,
  onGridWidthChange,
  aspectRatio,
  onAspectRatioChange,
  hasDiagonals,
  onDiagonalsToggle,
  showLabels,
  onLabelsToggle,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  physicalWidth,
  onPhysicalWidthChange,
  physicalHeight,
  onPhysicalHeightChange,
  physicalUnit,
  onPhysicalUnitChange,
}: ControlPanelProps) => {
  const colorOptions = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const aspectRatioOptions = [
    { name: 'Original', value: 'original' },
    { name: 'Square (1:1)', value: '1:1' },
    { name: 'Portrait (3:4)', value: '3:4' },
    { name: 'Landscape (4:3)', value: '4:3' },
    { name: 'Wide (5:4)', value: '5:4' },
    { name: 'Photo (3:2)', value: '3:2' },
    { name: 'Widescreen (16:9)', value: '16:9' },
    { name: 'Ultra Wide (21:9)', value: '21:9' },
  ];

  return (
    <Card className="p-6 glass-panel border-white/5 space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
          <Grid3X3 className="w-4 h-4 text-accent-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">Grid Controls</h2>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <RectangleHorizontal className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-card-foreground">
            Aspect Ratio
          </Label>
        </div>
        <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent>
            {aspectRatioOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Crop image to specific proportions for better composition
        </p>
      </div>

      {/* Grayscale Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="grayscale" className="text-sm font-medium text-card-foreground">
            Black & White Mode
          </Label>
          <Switch
            id="grayscale"
            checked={isGrayscale}
            onCheckedChange={onGrayscaleToggle}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Convert to grayscale or adjust brightness and contrast
        </p>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.2">
                <Sun className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Brightness</span>
              </div>
              <span className="font-mono">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              onValueChange={(v) => onBrightnessChange(v[0])}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.2">
                <Percent className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Contrast</span>
              </div>
              <span className="font-mono">{contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              onValueChange={(v) => onContrastChange(v[0])}
              min={0}
              max={200}
              step={1}
            />
          </div>
        </div>
      </div>

      {/* Grid Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-card-foreground">
            Grid Size: {gridSize}×{gridSize}
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGridSizeChange(Math.max(2, gridSize - 1))}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGridSizeChange(Math.min(20, gridSize + 1))}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <Slider
          value={[gridSize]}
          onValueChange={(value) => onGridSizeChange(value[0])}
          min={2}
          max={40}
          step={1}
          className="w-full"
        />
      </div>

      {/* Grid Appearance: Diagonals & Labels */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
          <Label htmlFor="diagonals" className="text-xs font-medium cursor-pointer">Diagonals</Label>
          <Switch id="diagonals" checked={hasDiagonals} onCheckedChange={onDiagonalsToggle} />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
          <Label htmlFor="labels" className="text-xs font-medium cursor-pointer">Labels</Label>
          <Switch id="labels" checked={showLabels} onCheckedChange={onLabelsToggle} />
        </div>
      </div>

      {/* Grid Width */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-card-foreground">
          Grid Line Width: {gridWidth}px
        </Label>
        <Slider
          value={[gridWidth]}
          onValueChange={(value) => onGridWidthChange(value[0])}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>

      {/* Grid Color */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-card-foreground">
            Grid Color
          </Label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color) => (
            <Button
              key={color.value}
              variant="outline"
              className={`h-12 w-full border-2 transition-all hover-scale rounded-xl ${
                gridColor === color.value
                  ? 'border-primary ring-2 ring-primary/20 shadow-neon'
                  : 'border-white/10 hover:border-white/30'
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => onGridColorChange(color.value)}
              title={color.name}
            >
              {gridColor === color.value && (
                <div className="w-2 h-2 rounded-full bg-primary shadow-lg" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Physical Dimensions */}
      <div className="space-y-4 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-card-foreground">Physical Canvas Size</Label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">Width</Label>
            <Input 
              type="text" 
              placeholder="0" 
              value={physicalWidth} 
              onChange={(e) => onPhysicalWidthChange(e.target.value)}
              className="h-8 text-xs bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">Height</Label>
            <Input 
              type="text" 
              placeholder="0" 
              value={physicalHeight} 
              onChange={(e) => onPhysicalHeightChange(e.target.value)}
              className="h-8 text-xs bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">Unit</Label>
            <Select value={physicalUnit} onValueChange={onPhysicalUnitChange}>
              <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="in">in</SelectItem>
                <SelectItem value="mm">mm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          Enter your paper size to get exact grid measurements
        </p>
      </div>
    </Card>
  );
};

export default ControlPanel;