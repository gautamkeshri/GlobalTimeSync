import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Share2, Settings, Download, Moon, Sun } from "lucide-react";
import { Header } from "@/components/Header";
import { TimezoneCard } from "@/components/TimezoneCard";
import { AddTimezoneModal } from "@/components/AddTimezoneModal";
import { TeamShareModal } from "@/components/TeamShareModal";
import { TimeSlider } from "@/components/ui/time-slider";
import { useTimezones } from "@/contexts/TimezoneContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DateTime } from "luxon";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { timezones, currentTime, adjustedTime, updateTime, resetTime, isLoading, isManuallyAdjusted } = useTimezones();
  const { theme, toggleTheme } = useTheme();

  const primaryTimezone = timezones.find(tz => tz.isPrimary);
  const secondaryTimezones = timezones.filter(tz => !tz.isPrimary);

  const handleTimeChange = (minutes: number) => {
    const newTime = DateTime.now().startOf('day').plus({ minutes });
    updateTime(newTime);
  };

  const getMinutesFromTime = (time: DateTime) => {
    return time.hour * 60 + time.minute;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Panel */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Timezones</h2>
              <p className="text-muted-foreground">Manage and synchronize time across multiple locations</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Timezone
              </Button>
              <Button variant="outline" onClick={() => setShowShareModal(true)}>
                <Users className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </div>
          </div>
          
          {/* Time Sync Controls */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Time Synchronization</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {isManuallyAdjusted ? "Manual mode" : "Live sync"}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    isManuallyAdjusted ? "bg-amber-500" : "bg-green-500 animate-pulse"
                  }`}></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <TimeSlider
                    value={getMinutesFromTime(adjustedTime)}
                    onChange={handleTimeChange}
                    className="w-full"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={resetTime}>
                  Reset to Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timezone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {primaryTimezone && (
            <TimezoneCard
              timezone={primaryTimezone}
              currentTime={adjustedTime}
              isPrimary={true}
            />
          )}
          
          {secondaryTimezones.map((timezone) => (
            <TimezoneCard
              key={timezone.id}
              timezone={timezone}
              currentTime={adjustedTime}
            />
          ))}
          
          {/* Add Timezone Card */}
          <Card 
            className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onClick={() => setShowAddModal(true)}
          >
            <CardContent className="flex flex-col items-center justify-center min-h-[280px] p-6">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Add Timezone</h3>
              <p className="text-sm text-muted-foreground text-center">
                Click to add a new timezone to your dashboard
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground">Share your timezone setup with team members</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={() => setShowShareModal(true)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Setup
                </Button>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Team
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Active Teams</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Development Team</p>
                          <p className="text-sm text-muted-foreground">5 members</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Marketing Team</p>
                          <p className="text-sm text-muted-foreground">3 members</p>
                        </div>
                      </div>
                      <Badge variant="outline">Offline</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Meeting Planner</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Best meeting time</span>
                      <span className="text-blue-600 font-medium">2:00 PM - 4:00 PM</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Los Angeles</span>
                        <span className="text-green-600">2:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Tokyo</span>
                        <span className="text-orange-600">6:00 AM (+1)</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Paris</span>
                        <span className="text-green-600">11:00 PM</span>
                      </div>
                    </div>
                    <Button className="w-full">
                      Schedule Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Export Setup</h4>
                  <p className="text-sm text-muted-foreground">Save as PDF or image</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Export
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-white" />
                  ) : (
                    <Moon className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Theme Toggle</h4>
                  <p className="text-sm text-muted-foreground">
                    Switch to {theme === "dark" ? "light" : "dark"} mode
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={toggleTheme}>
                Switch Theme
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Settings</h4>
                  <p className="text-sm text-muted-foreground">Manage preferences</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <AddTimezoneModal open={showAddModal} onOpenChange={setShowAddModal} />
      <TeamShareModal open={showShareModal} onOpenChange={setShowShareModal} />
    </div>
  );
}
