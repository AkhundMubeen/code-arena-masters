import { useEffect, useState } from 'react';

interface TimerState {
  timeLeft: number;
  isExpired: boolean;
  isUrgent: boolean;
  formatted: string;
}

export function useCompetitionTimer(startTime: string | undefined, durationMinutes: number | undefined): TimerState {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!startTime || !durationMinutes) return;

    const endTime = new Date(startTime).getTime() + durationMinutes * 60 * 1000;

    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
      return remaining;
    };

    tick();
    const interval = setInterval(() => {
      if (tick() === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationMinutes]);

  const isExpired = timeLeft === 0 && !!startTime;
  const isUrgent = timeLeft > 0 && timeLeft < 300000; // < 5 min

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isExpired,
    isUrgent,
    formatted: isExpired ? '00:00' : formatTime(timeLeft),
  };
}
