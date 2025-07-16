import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useTimezones } from "@/contexts/TimezoneContext";
import { useToast } from "@/hooks/use-toast";

interface AddTimezoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timezoneOptions = [
  { value: "America/Los_Angeles", label: "Los Angeles", city: "Los Angeles", country: "United States", offset: "GMT-8" },
  { value: "America/New_York", label: "New York", city: "New York", country: "United States", offset: "GMT-5" },
  { value: "America/Chicago", label: "Chicago", city: "Chicago", country: "United States", offset: "GMT-6" },
  { value: "America/Denver", label: "Denver", city: "Denver", country: "United States", offset: "GMT-7" },
  { value: "Europe/London", label: "London", city: "London", country: "United Kingdom", offset: "GMT+0" },
  { value: "Europe/Paris", label: "Paris", city: "Paris", country: "France", offset: "GMT+1" },
  { value: "Europe/Berlin", label: "Berlin", city: "Berlin", country: "Germany", offset: "GMT+1" },
  { value: "Europe/Rome", label: "Rome", city: "Rome", country: "Italy", offset: "GMT+1" },
  { value: "Asia/Tokyo", label: "Tokyo", city: "Tokyo", country: "Japan", offset: "GMT+9" },
  { value: "Asia/Seoul", label: "Seoul", city: "Seoul", country: "South Korea", offset: "GMT+9" },
  { value: "Asia/Shanghai", label: "Shanghai", city: "Shanghai", country: "China", offset: "GMT+8" },
  { value: "Asia/Hong_Kong", label: "Hong Kong", city: "Hong Kong", country: "Hong Kong", offset: "GMT+8" },
  { value: "Asia/Singapore", label: "Singapore", city: "Singapore", country: "Singapore", offset: "GMT+8" },
  { value: "Asia/Dubai", label: "Dubai", city: "Dubai", country: "United Arab Emirates", offset: "GMT+4" },
  { value: "Australia/Sydney", label: "Sydney", city: "Sydney", country: "Australia", offset: "GMT+10" },
  { value: "Australia/Melbourne", label: "Melbourne", city: "Melbourne", country: "Australia", offset: "GMT+10" },
  { value: "Pacific/Auckland", label: "Auckland", city: "Auckland", country: "New Zealand", offset: "GMT+12" },
];

export function AddTimezoneModal({ open, onOpenChange }: AddTimezoneModalProps) {
  const [search, setSearch] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const { addTimezone } = useTimezones();
  const { toast } = useToast();

  const filteredTimezones = timezoneOptions.filter(tz =>
    tz.label.toLowerCase().includes(search.toLowerCase()) ||
    tz.city.toLowerCase().includes(search.toLowerCase()) ||
    tz.country.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Timezone</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Location</Label>
            <Input
              id="search"
              placeholder="Enter city or country name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Select Timezone</Label>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a timezone" />
              </SelectTrigger>
              <SelectContent>
                {filteredTimezones.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label} ({timezone.offset})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
