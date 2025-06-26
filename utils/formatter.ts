export const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    const km = meters / 1000;
    return km % 1 === 0 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
  }

  return `${Math.round(meters)} m`;
};