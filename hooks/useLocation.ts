import { useLocationStore } from '@/store/useLocationStore';
import { getCurrentCoordinates } from '@/utils/location';
import React, { useEffect } from 'react';

export default function useLocation() {
  const { setLocation, location } = useLocationStore();
  useEffect(() => {
    const init = async () => {
      const coords = await getCurrentCoordinates();
      if (coords) {
        setLocation(coords);
      }
    };

    init();
  }, []);

  return { location, setLocation };
}
