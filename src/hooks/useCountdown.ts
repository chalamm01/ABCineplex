import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownOptions {
  deadline: Date | string;
  onExpire?: () => void;
}

export function useCountdown({ deadline, onExpire }: UseCountdownOptions) {
  const calculateTimeLeft = useCallback(() => {
    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }, [deadline]);

  const [timeLeft, setTimeLeft] = useState<number>(() => calculateTimeLeft());
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    hasExpiredRef.current = false;
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isExpired = timeLeft <= 0;
  const isWarning = timeLeft <= 60 && timeLeft > 0;

  return {
    timeLeft,
    minutes,
    seconds,
    formatted,
    isExpired,
    isWarning,
  };
}
