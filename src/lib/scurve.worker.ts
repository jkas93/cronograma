import { calculateSCurve } from './scurve';

self.onmessage = (e: MessageEvent) => {
  const { startDate, endDate, activities, dailyProgress } = e.data;
  try {
    const result = calculateSCurve(startDate, endDate, activities, dailyProgress);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};
