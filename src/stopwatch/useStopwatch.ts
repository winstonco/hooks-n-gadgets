import { useState, useEffect, useCallback } from 'react';

type StartStopFunction = () => void;
type StartFunction = () => void;
type StopFunction = () => void;
type ResetFunction = () => void;
type SplitFunction = () => number;

interface StopwatchReturn {
  stopwatch: number;
  isRunning: boolean;
  start: StartFunction;
  stop: StopFunction;
  both: StartStopFunction;
  reset: ResetFunction;
  split: SplitFunction;
}

/**
 * A hook for a stopwatch component.
 *
 * @param onStop
 * A callback function with the current stopwatch value as its only argument.
 *
 * @returns
 * An object containing:
 * - `stopwatch` — The current value.
 * - `isRunning` — Whether the stopwatch is running.
 * - `start` — A function that starts the stopwatch if it is stopped.
 * - `stop` — A function that stops the stopwatch if it is running. It also calls `onStop` with the current value.
 * - `both` — A function that starts and stops the stopwatch.
 * - `reset` — A function that stops the stopwatch and resets it back to 0.
 * - `split` — A function that returns the current value.
 */
export function useStopwatch(onStop: (time: number) => any): StopwatchReturn {
  const [stopwatch, setStopwatch] = useState<number>(0);
  const [runtime, setRuntime] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  /**
   * Returns the time when the split function was called. Does not stop the stopwatch.
   */
  const split: SplitFunction = useCallback(() => {
    let totalTime = 0;
    for (let i = 0; i < runtime.length; i += 2) {
      const curr = runtime[i];
      const next = runtime[i + 1];
      if (next) {
        totalTime += next - curr;
      } else {
        totalTime += Date.now() - curr;
      }
    }
    return totalTime;
  }, [runtime]);

  const startStop: StartStopFunction = useCallback(() => {
    setRuntime([...runtime, Date.now()]);
    setIsRunning(!isRunning);
  }, [runtime, isRunning]);

  const start: StartFunction = useCallback(() => {
    if (!isRunning) {
      setRuntime([...runtime, Date.now()]);
      setIsRunning(true);
    }
  }, [isRunning, runtime]);

  const stop: StopFunction = useCallback(() => {
    if (isRunning) {
      onStop(split());
      setIsRunning(false);
    }
  }, [isRunning, split]);

  const reset: ResetFunction = useCallback(() => {
    setStopwatch(0);
    setRuntime([]);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (isRunning) {
        setStopwatch(split());
      }
    }, 0);

    return () => {
      clearInterval(timerInterval);
    };
  }, [isRunning, split]);

  return {
    stopwatch,
    isRunning,
    start,
    stop,
    both: startStop,
    reset,
    split,
  };
}
