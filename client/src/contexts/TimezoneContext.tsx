import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DateTime } from "luxon";
import { Timezone } from "@shared/schema";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TimezoneContextType {
  timezones: Timezone[];
  currentTime: DateTime;
  referenceTime: DateTime;
  adjustedTime: DateTime;
  addTimezone: (timezone: Omit<Timezone, "id" | "userId" | "createdAt">) => void;
  removeTimezone: (id: number) => void;
  updateTime: (time: DateTime) => void;
  resetTime: () => void;
  setPrimaryTimezone: (id: number) => void;
  isLoading: boolean;
  isManuallyAdjusted: boolean;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const useTimezones = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error("useTimezones must be used within a TimezoneProvider");
  }
  return context;
};

export const TimezoneProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [adjustedTime, setAdjustedTime] = useState<DateTime>(DateTime.now());
  const [referenceTime] = useState<DateTime>(DateTime.now());
  const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
  const [isManuallyAdjusted, setIsManuallyAdjusted] = useState<boolean>(false);

  // Update current time every second with precise timing
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(DateTime.now());
    };
    
    // Update immediately
    updateTime();
    
    // Then update every second
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-sync adjusted time with current time when not manually adjusted
  useEffect(() => {
    if (!isManuallyAdjusted) {
      setAdjustedTime(currentTime);
    }
  }, [currentTime, isManuallyAdjusted]);

  // Fetch user timezones
  const { data: timezones = [], isLoading } = useQuery({
    queryKey: ["/api/timezones"],
    enabled: !!user,
  });

  // Add timezone mutation
  const addTimezoneMutation = useMutation({
    mutationFn: (timezone: Omit<Timezone, "id" | "userId" | "createdAt">) =>
      apiRequest("POST", "/api/timezones", timezone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timezones"] });
    },
  });

  // Remove timezone mutation
  const removeTimezoneMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/timezones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timezones"] });
    },
  });

  // Update primary timezone mutation
  const setPrimaryMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/timezones/${id}/primary`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timezones"] });
    },
  });

  const addTimezone = (timezone: Omit<Timezone, "id" | "userId" | "createdAt">) => {
    addTimezoneMutation.mutate(timezone);
  };

  const removeTimezone = (id: number) => {
    removeTimezoneMutation.mutate(id);
  };

  const updateTime = (time: DateTime) => {
    setAdjustedTime(time);
    setIsManuallyAdjusted(true);
  };

  const resetTime = () => {
    setAdjustedTime(DateTime.now());
    setIsManuallyAdjusted(false);
  };

  const setPrimaryTimezone = (id: number) => {
    setPrimaryMutation.mutate(id);
  };

  return (
    <TimezoneContext.Provider
      value={{
        timezones,
        currentTime,
        referenceTime,
        adjustedTime,
        addTimezone,
        removeTimezone,
        updateTime,
        resetTime,
        setPrimaryTimezone,
        isLoading,
        isManuallyAdjusted,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
};
