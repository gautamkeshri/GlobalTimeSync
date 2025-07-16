import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, MapPin, Trash2, Star } from "lucide-react";
import { DateTime } from "luxon";
import { Timezone } from "@shared/schema";
import { useTimezones } from "@/contexts/TimezoneContext";
import { cn } from "@/lib/utils";

interface TimezoneCardProps {
  timezone: Timezone;
  currentTime: DateTime;
  isPrimary?: boolean;
}

export function TimezoneCard({ timezone, currentTime, isPrimary = false }: TimezoneCardProps) {
  const { removeTimezone, setPrimaryTimezone } = useTimezones();

  const localTime = currentTime.setZone(timezone.timezone);
  const timeString = localTime.toFormat("HH:mm");
  const dateString = localTime.toFormat("ccc, MMM d");
  const offsetString = localTime.toFormat("ZZZZ");
  
  // Split time for blinking colon
  const [hours, minutes] = timeString.split(':');
  
  const getTimeOfDay = (hour: number) => {
    if (hour < 6) return "Late Night";
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    if (hour < 21) return "Evening";
    return "Night";
  };

  const getOffsetFromReference = (referenceTime: DateTime) => {
    const reference = referenceTime.setZone("UTC");
    const target = localTime.setZone("UTC");
    const diff = target.offset - reference.offset;
    const hours = Math.floor(Math.abs(diff) / 60);
    const sign = diff >= 0 ? "+" : "-";
    return `${sign}${hours} hours`;
  };

  const getProgressPercentage = () => {
    const hour = localTime.hour;
    return (hour / 24) * 100;
  };

  const getProgressColor = () => {
    const hour = localTime.hour;
    if (hour < 6 || hour >= 22) return "bg-blue-500";
    if (hour < 12) return "bg-yellow-500";
    if (hour < 17) return "bg-green-500";
    if (hour < 21) return "bg-orange-500";
    return "bg-purple-500";
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
      isPrimary ? "ring-2 ring-blue-500" : "border-border"
    )}>
      <CardContent className="p-6">
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPrimaryTimezone(timezone.id)}>
                <Star className="mr-2 h-4 w-4" />
                Set as Primary
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => removeTimezone(timezone.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className={cn("h-4 w-4", isPrimary ? "text-blue-500" : "text-gray-400")} />
            <h3 className="text-lg font-semibold">{timezone.city}, {timezone.country}</h3>
            {isPrimary && <Badge variant="secondary">Primary</Badge>}
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-muted-foreground">{offsetString} • {dateString}</p>
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold mb-2 flex items-center justify-center transition-all duration-300">
            <span>{hours}</span>
            <span className="blink mx-1">:</span>
            <span>{minutes}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {getTimeOfDay(localTime.hour)}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Offset from reference</span>
            <span className={cn(
              "font-medium",
              isPrimary ? "text-blue-500" : "text-green-500"
            )}>
              {getOffsetFromReference(currentTime)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={cn("h-2 rounded-full transition-all duration-500", getProgressColor())}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
