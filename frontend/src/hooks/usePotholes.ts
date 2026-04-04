import { useState, useEffect, useRef, useCallback } from 'react';
import { getPotholes, type PotholeData } from '@/services/api';

/**
 * Polls GET /potholes every pollInterval ms.
 * On error, keeps last known good data. Never returns empty after first successful fetch.
 */
export function usePotholes(pollInterval = 5000) {
  const [potholes, setPotholes] = useState<PotholeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastGoodData = useRef<PotholeData[]>([]);

  const fetchPotholes = useCallback(async () => {
    try {
      const data = await getPotholes();
      setPotholes(data);
      lastGoodData.current = data;
      setError(null);
    } catch (err) {
      console.warn('Pothole fetch failed, using cached data:', err);
      if (lastGoodData.current.length > 0) {
        setPotholes(lastGoodData.current);
      }
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPotholes();
    const interval = setInterval(fetchPotholes, pollInterval);
    return () => clearInterval(interval);
  }, [fetchPotholes, pollInterval]);

  return { potholes, loading, error, refetch: fetchPotholes };
}
