import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface TimeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function TimeSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 1440, 
  step = 15,
  className 
}: TimeSliderProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Time: {formatTime(value)}</span>
        <span className="text-muted-foreground">{formatTime(max)}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}
