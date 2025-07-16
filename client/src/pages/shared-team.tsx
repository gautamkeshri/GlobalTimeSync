import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { DateTime } from "luxon";
import { useState, useEffect } from "react";

export default function SharedTeam() {
  const { shareId } = useParams<{ shareId: string }>();
  const [currentTime, setCurrentTime] = useState(DateTime.now());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: team, isLoading, error } = useQuery({
    queryKey: ["/api/teams/shared", shareId],
    enabled: !!shareId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Team Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The shared team link you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTimeOfDay = (hour: number) => {
    if (hour < 6) return "Late Night";
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    if (hour < 21) return "Evening";
    return "Night";
  };

  const getProgressPercentage = (hour: number) => {
    return (hour / 24) * 100;
  };

  const getProgressColor = (hour: number) => {
    if (hour < 6 || hour >= 22) return "bg-blue-500";
    if (hour < 12) return "bg-yellow-500";
    if (hour < 17) return "bg-green-500";
    if (hour < 21) return "bg-orange-500";
    return "bg-purple-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold">TimeSync</h1>
                  <p className="text-sm text-muted-foreground">Shared Team View</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                <Users className="mr-2 h-4 w-4" />
                {team.name}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{team.name} Timezones</h2>
          <p className="text-muted-foreground">
            Real-time view of {team.name}'s timezone configuration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.timezones.map((timezone: any) => {
            const localTime = currentTime.setZone(timezone.timezone);
            const timeString = localTime.toFormat("HH:mm");
            const dateString = localTime.toFormat("ccc, MMM d");
            const offsetString = localTime.toFormat("ZZZZ");

            return (
              <Card 
                key={timezone.id}
                className={timezone.isPrimary ? "ring-2 ring-blue-500" : ""}
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className={`h-4 w-4 ${timezone.isPrimary ? "text-blue-500" : "text-muted-foreground"}`} />
                      <h3 className="text-lg font-semibold">
                        {timezone.city}, {timezone.country}
                      </h3>
                      {timezone.isPrimary && (
                        <Badge variant="secondary">Primary</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {offsetString} • {dateString}
                    </p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-4xl font-mono font-bold mb-2">
                      {timeString}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTimeOfDay(localTime.hour)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time of day</span>
                      <span className="font-medium">
                        {getTimeOfDay(localTime.hour)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(localTime.hour)}`}
                        style={{ width: `${getProgressPercentage(localTime.hour)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Want to create your own?</h3>
            <p className="text-muted-foreground mb-4">
              Start managing your own timezones and share them with your team
            </p>
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
