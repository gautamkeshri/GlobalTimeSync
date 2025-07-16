import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTimezones } from "@/contexts/TimezoneContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddTimezoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timezoneOptions = [
  // United States
  { value: "America/Los_Angeles", label: "Los Angeles", city: "Los Angeles", country: "United States", offset: "GMT-8" },
  { value: "America/New_York", label: "New York", city: "New York", country: "United States", offset: "GMT-5" },
  { value: "America/Chicago", label: "Chicago", city: "Chicago", country: "United States", offset: "GMT-6" },
  { value: "America/Denver", label: "Denver", city: "Denver", country: "United States", offset: "GMT-7" },
  { value: "America/Phoenix", label: "Phoenix", city: "Phoenix", country: "United States", offset: "GMT-7" },
  { value: "America/Detroit", label: "Detroit", city: "Detroit", country: "United States", offset: "GMT-5" },
  { value: "America/Anchorage", label: "Anchorage", city: "Anchorage", country: "United States", offset: "GMT-9" },
  { value: "Pacific/Honolulu", label: "Honolulu", city: "Honolulu", country: "United States", offset: "GMT-10" },
  
  // United Kingdom
  { value: "Europe/London", label: "London", city: "London", country: "United Kingdom", offset: "GMT+0" },
  { value: "Europe/Edinburgh", label: "Edinburgh", city: "Edinburgh", country: "United Kingdom", offset: "GMT+0" },
  { value: "Europe/Cardiff", label: "Cardiff", city: "Cardiff", country: "United Kingdom", offset: "GMT+0" },
  { value: "Europe/Belfast", label: "Belfast", city: "Belfast", country: "United Kingdom", offset: "GMT+0" },
  
  // Canada
  { value: "America/Toronto", label: "Toronto", city: "Toronto", country: "Canada", offset: "GMT-5" },
  { value: "America/Vancouver", label: "Vancouver", city: "Vancouver", country: "Canada", offset: "GMT-8" },
  { value: "America/Montreal", label: "Montreal", city: "Montreal", country: "Canada", offset: "GMT-5" },
  { value: "America/Calgary", label: "Calgary", city: "Calgary", country: "Canada", offset: "GMT-7" },
  
  // Europe
  { value: "Europe/Paris", label: "Paris", city: "Paris", country: "France", offset: "GMT+1" },
  { value: "Europe/Berlin", label: "Berlin", city: "Berlin", country: "Germany", offset: "GMT+1" },
  { value: "Europe/Rome", label: "Rome", city: "Rome", country: "Italy", offset: "GMT+1" },
  { value: "Europe/Madrid", label: "Madrid", city: "Madrid", country: "Spain", offset: "GMT+1" },
  { value: "Europe/Amsterdam", label: "Amsterdam", city: "Amsterdam", country: "Netherlands", offset: "GMT+1" },
  { value: "Europe/Brussels", label: "Brussels", city: "Brussels", country: "Belgium", offset: "GMT+1" },
  { value: "Europe/Vienna", label: "Vienna", city: "Vienna", country: "Austria", offset: "GMT+1" },
  { value: "Europe/Zurich", label: "Zurich", city: "Zurich", country: "Switzerland", offset: "GMT+1" },
  { value: "Europe/Stockholm", label: "Stockholm", city: "Stockholm", country: "Sweden", offset: "GMT+1" },
  { value: "Europe/Copenhagen", label: "Copenhagen", city: "Copenhagen", country: "Denmark", offset: "GMT+1" },
  { value: "Europe/Oslo", label: "Oslo", city: "Oslo", country: "Norway", offset: "GMT+1" },
  { value: "Europe/Helsinki", label: "Helsinki", city: "Helsinki", country: "Finland", offset: "GMT+2" },
  { value: "Europe/Warsaw", label: "Warsaw", city: "Warsaw", country: "Poland", offset: "GMT+1" },
  { value: "Europe/Prague", label: "Prague", city: "Prague", country: "Czech Republic", offset: "GMT+1" },
  { value: "Europe/Budapest", label: "Budapest", city: "Budapest", country: "Hungary", offset: "GMT+1" },
  { value: "Europe/Bucharest", label: "Bucharest", city: "Bucharest", country: "Romania", offset: "GMT+2" },
  { value: "Europe/Athens", label: "Athens", city: "Athens", country: "Greece", offset: "GMT+2" },
  { value: "Europe/Istanbul", label: "Istanbul", city: "Istanbul", country: "Turkey", offset: "GMT+3" },
  { value: "Europe/Moscow", label: "Moscow", city: "Moscow", country: "Russia", offset: "GMT+3" },
  
  // Asia
  { value: "Asia/Tokyo", label: "Tokyo", city: "Tokyo", country: "Japan", offset: "GMT+9" },
  { value: "Asia/Seoul", label: "Seoul", city: "Seoul", country: "South Korea", offset: "GMT+9" },
  { value: "Asia/Shanghai", label: "Shanghai", city: "Shanghai", country: "China", offset: "GMT+8" },
  { value: "Asia/Beijing", label: "Beijing", city: "Beijing", country: "China", offset: "GMT+8" },
  { value: "Asia/Hong_Kong", label: "Hong Kong", city: "Hong Kong", country: "Hong Kong", offset: "GMT+8" },
  { value: "Asia/Singapore", label: "Singapore", city: "Singapore", country: "Singapore", offset: "GMT+8" },
  { value: "Asia/Dubai", label: "Dubai", city: "Dubai", country: "United Arab Emirates", offset: "GMT+4" },
  { value: "Asia/Mumbai", label: "Mumbai", city: "Mumbai", country: "India", offset: "GMT+5:30" },
  { value: "Asia/Delhi", label: "Delhi", city: "Delhi", country: "India", offset: "GMT+5:30" },
  { value: "Asia/Kolkata", label: "Kolkata", city: "Kolkata", country: "India", offset: "GMT+5:30" },
  { value: "Asia/Bangkok", label: "Bangkok", city: "Bangkok", country: "Thailand", offset: "GMT+7" },
  { value: "Asia/Manila", label: "Manila", city: "Manila", country: "Philippines", offset: "GMT+8" },
  { value: "Asia/Jakarta", label: "Jakarta", city: "Jakarta", country: "Indonesia", offset: "GMT+7" },
  { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur", city: "Kuala Lumpur", country: "Malaysia", offset: "GMT+8" },
  { value: "Asia/Taipei", label: "Taipei", city: "Taipei", country: "Taiwan", offset: "GMT+8" },
  { value: "Asia/Tel_Aviv", label: "Tel Aviv", city: "Tel Aviv", country: "Israel", offset: "GMT+2" },
  { value: "Asia/Riyadh", label: "Riyadh", city: "Riyadh", country: "Saudi Arabia", offset: "GMT+3" },
  
  // Australia & Oceania
  { value: "Australia/Sydney", label: "Sydney", city: "Sydney", country: "Australia", offset: "GMT+10" },
  { value: "Australia/Melbourne", label: "Melbourne", city: "Melbourne", country: "Australia", offset: "GMT+10" },
  { value: "Australia/Brisbane", label: "Brisbane", city: "Brisbane", country: "Australia", offset: "GMT+10" },
  { value: "Australia/Perth", label: "Perth", city: "Perth", country: "Australia", offset: "GMT+8" },
  { value: "Australia/Adelaide", label: "Adelaide", city: "Adelaide", country: "Australia", offset: "GMT+10:30" },
  { value: "Pacific/Auckland", label: "Auckland", city: "Auckland", country: "New Zealand", offset: "GMT+12" },
  
  // South America
  { value: "America/Sao_Paulo", label: "São Paulo", city: "São Paulo", country: "Brazil", offset: "GMT-3" },
  { value: "America/Buenos_Aires", label: "Buenos Aires", city: "Buenos Aires", country: "Argentina", offset: "GMT-3" },
  { value: "America/Santiago", label: "Santiago", city: "Santiago", country: "Chile", offset: "GMT-3" },
  { value: "America/Lima", label: "Lima", city: "Lima", country: "Peru", offset: "GMT-5" },
  { value: "America/Bogota", label: "Bogotá", city: "Bogotá", country: "Colombia", offset: "GMT-5" },
  { value: "America/Caracas", label: "Caracas", city: "Caracas", country: "Venezuela", offset: "GMT-4" },
  
  // Africa
  { value: "Africa/Cairo", label: "Cairo", city: "Cairo", country: "Egypt", offset: "GMT+2" },
  { value: "Africa/Lagos", label: "Lagos", city: "Lagos", country: "Nigeria", offset: "GMT+1" },
  { value: "Africa/Johannesburg", label: "Johannesburg", city: "Johannesburg", country: "South Africa", offset: "GMT+2" },
  { value: "Africa/Nairobi", label: "Nairobi", city: "Nairobi", country: "Kenya", offset: "GMT+3" },
  { value: "Africa/Casablanca", label: "Casablanca", city: "Casablanca", country: "Morocco", offset: "GMT+1" },
  
  // Mexico
  { value: "America/Mexico_City", label: "Mexico City", city: "Mexico City", country: "Mexico", offset: "GMT-6" },
  { value: "America/Tijuana", label: "Tijuana", city: "Tijuana", country: "Mexico", offset: "GMT-8" },
];

export function AddTimezoneModal({ open, onOpenChange }: AddTimezoneModalProps) {
  const [search, setSearch] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { addTimezone } = useTimezones();
  const { toast } = useToast();

  const filteredTimezones = timezoneOptions.filter(tz =>
    tz.label.toLowerCase().includes(search.toLowerCase()) ||
    tz.city.toLowerCase().includes(search.toLowerCase()) ||
    tz.country.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTimezoneData = timezoneOptions.find(tz => tz.value === selectedTimezone);

  const handleSubmit = () => {
    if (!selectedTimezone) {
      toast({
        title: "Error",
        description: "Please select a timezone",
        variant: "destructive",
      });
      return;
    }

    const timezone = timezoneOptions.find(tz => tz.value === selectedTimezone);
    if (!timezone) return;

    addTimezone({
      name: timezone.label,
      timezone: timezone.value,
      city: timezone.city,
      country: timezone.country,
      isPrimary,
    });

    toast({
      title: "Success",
      description: "Timezone added successfully",
    });

    // Reset form
    setSearch("");
    setSelectedTimezone("");
    setIsPrimary(false);
    onOpenChange(false);
  };

  const handleReset = () => {
    setSearch("");
    setSelectedTimezone("");
    setIsPrimary(false);
    setCommandOpen(false);
  };

  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Timezone</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Search Timezone</Label>
            <Popover open={commandOpen} onOpenChange={setCommandOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={commandOpen}
                  className="w-full justify-between h-auto p-3"
                >
                  {selectedTimezoneData ? (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">
                          {selectedTimezoneData.country} — {selectedTimezoneData.city}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedTimezoneData.offset}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTimezone("");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Search and select timezone...</span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search timezone..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No timezone found.</CommandEmpty>
                    <CommandGroup>
                      {filteredTimezones.map((timezone) => (
                        <CommandItem
                          key={timezone.value}
                          value={timezone.value}
                          onSelect={(currentValue) => {
                            setSelectedTimezone(currentValue);
                            setCommandOpen(false);
                          }}
                          className="flex items-center justify-between p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {timezone.country} — {timezone.city}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {timezone.offset}
                              </div>
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4",
                              selectedTimezone === timezone.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="primary"
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
            />
            <Label htmlFor="primary" className="text-sm">
              Set as primary timezone
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Timezone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
