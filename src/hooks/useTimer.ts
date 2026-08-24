import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  cancelRestNotification,
  ensureNotificationPermissions,
  scheduleRestEndNotification,
} from '../utils/notifications';

export const REST_DURATION_MS = 30_000;
export const ADD_REST_MS = 15_000;
const TICK_MS = 100;

interface UseTimerOptions {
  onRestComplete: () => void;
  getNextExerciseName: () => string;
}

export function useTimer({ onRestComplete, getNextExerciseName }: UseTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const targetTimeRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef(0);
  const notificationIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const isRestingRef = useRef(false);
  const onRestCompleteRef = useRef(onRestComplete);
  const getNextExerciseNameRef = useRef(getNextExerciseName);

  useEffect(() => {
    onRestCompleteRef.current = onRestComplete;
  }, [onRestComplete]);

  useEffect(() => {
    getNextExerciseNameRef.current = getNextExerciseName;
  }, [getNextExerciseName]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isRestingRef.current = isResting;
  }, [isResting]);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancelNotification = useCallback(async () => {
    await cancelRestNotification(notificationIdRef.current);
    notificationIdRef.current = null;
  }, []);

  const finishRest = useCallback(async () => {
    clearTick();
    await cancelNotification();
    targetTimeRef.current = null;
    setSecondsLeft(0);
    setIsResting(false);
    setIsPaused(false);
    isRestingRef.current = false;
    isPausedRef.current = false;
    onRestCompleteRef.current();
  }, [cancelNotification, clearTick]);

  const syncFromTarget = useCallback(async () => {
    const target = targetTimeRef.current;

    if (!target || isPausedRef.current) {
      return;
    }

    const remainingMs = target - Date.now();
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    if (remainingSeconds <= 0) {
      await finishRest();
      return;
    }

    setSecondsLeft(remainingSeconds);
  }, [finishRest]);

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      void syncFromTarget();
    }, TICK_MS);
  }, [clearTick, syncFromTarget]);

  const rescheduleNotification = useCallback(async (targetTime: number) => {
    await cancelNotification();
    const notificationId = await scheduleRestEndNotification(
      targetTime,
      getNextExerciseNameRef.current()
    );
    notificationIdRef.current = notificationId;
  }, [cancelNotification]);

  const startRest = useCallback(
    async (durationMs: number = REST_DURATION_MS) => {
      await ensureNotificationPermissions();

      const targetTime = Date.now() + durationMs;
      targetTimeRef.current = targetTime;
      pausedRemainingRef.current = 0;
      setIsPaused(false);
      setIsResting(true);
      isPausedRef.current = false;
      isRestingRef.current = true;

      await rescheduleNotification(targetTime);
      await syncFromTarget();
      startTick();
    },
    [rescheduleNotification, startTick, syncFromTarget]
  );

  const addTime = useCallback(async () => {
    if (!isRestingRef.current) {
      return;
    }

    if (isPausedRef.current) {
      pausedRemainingRef.current += ADD_REST_MS;
      setSecondsLeft(Math.ceil(pausedRemainingRef.current / 1000));
      return;
    }

    if (!targetTimeRef.current) {
      return;
    }

    targetTimeRef.current += ADD_REST_MS;
    await rescheduleNotification(targetTimeRef.current);
    await syncFromTarget();
  }, [rescheduleNotification, syncFromTarget]);

  const pause = useCallback(async () => {
    if (!isRestingRef.current || isPausedRef.current || !targetTimeRef.current) {
      return;
    }

    pausedRemainingRef.current = Math.max(0, targetTimeRef.current - Date.now());
    targetTimeRef.current = null;
    setIsPaused(true);
    isPausedRef.current = true;
    clearTick();
    await cancelNotification();
    setSecondsLeft(Math.ceil(pausedRemainingRef.current / 1000));
  }, [cancelNotification, clearTick]);

  const resume = useCallback(async () => {
    if (!isRestingRef.current || !isPausedRef.current) {
      return;
    }

    const targetTime = Date.now() + pausedRemainingRef.current;
    targetTimeRef.current = targetTime;
    setIsPaused(false);
    isPausedRef.current = false;

    await rescheduleNotification(targetTime);
    await syncFromTarget();
    startTick();
  }, [rescheduleNotification, startTick, syncFromTarget]);

  const skipRest = useCallback(async () => {
    if (!isRestingRef.current) {
      return;
    }

    clearTick();
    await cancelNotification();
    targetTimeRef.current = null;
    pausedRemainingRef.current = 0;
    setSecondsLeft(0);
    setIsResting(false);
    setIsPaused(false);
    isRestingRef.current = false;
    isPausedRef.current = false;
    onRestCompleteRef.current();
  }, [cancelNotification, clearTick]);

  const stop = useCallback(async () => {
    clearTick();
    await cancelNotification();
    targetTimeRef.current = null;
    pausedRemainingRef.current = 0;
    setSecondsLeft(0);
    setIsResting(false);
    setIsPaused(false);
    isRestingRef.current = false;
    isPausedRef.current = false;
  }, [cancelNotification, clearTick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active' && isRestingRef.current && !isPausedRef.current) {
        void syncFromTarget();
      }
    });

    return () => subscription.remove();
  }, [syncFromTarget]);

  useEffect(
    () => () => {
      clearTick();
      void cancelNotification();
    },
    [cancelNotification, clearTick]
  );

  return {
    secondsLeft,
    isResting,
    isPaused,
    startRest,
    addTime,
    pause,
    resume,
    skipRest,
    stop,
  };
}
