import { useState, useEffect } from 'react';
import { TimeRemaining } from '../types';
import { calculateTimeRemaining } from '../utils/dateUtils';
import { APP_CONFIG } from '../utils/constants';

/**
 * Hook that manages countdown logic with real-time updates
 */
export const useCountdown = (targetDate: string): TimeRemaining => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => 
    calculateTimeRemaining(targetDate)
  );

  useEffect(() => {
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining(targetDate));

    // Update every second
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining(targetDate);
      setTimeRemaining(newTime);

      // Clear interval if event is finished
      if (newTime.isFinished) {
        clearInterval(interval);
      }
    }, APP_CONFIG.refreshInterval);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeRemaining;
};

