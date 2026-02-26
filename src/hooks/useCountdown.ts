import { useState, useEffect } from 'react';

interface UseCountdownProps {
  deadline: Date;
  onExpire?: () => void;
}

interface UseCountdownReturn {
  formatted: string;
  isExpired: boolean;
  secondsRemaining: number;
}

export function useCountdown({ deadline, onExpire }: UseCountdownProps): UseCountdownReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const deadlineTime = deadline.getTime();
      const remaining = Math.max(0, Math.floor((deadlineTime - now) / 1000));

      setSecondsRemaining(remaining);

      if (remaining === 0) {
        setIsExpired(true);
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return { formatted, isExpired, secondsRemaining };
}
