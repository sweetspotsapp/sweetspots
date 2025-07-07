type DurationInput = {
  seconds?: number; // can be float
  minutes?: number; // can be float
  hours?: number;   // can be float
};

export const formatDuration = ({ seconds = 0, minutes = 0, hours = 0 }: DurationInput): string => {
  const totalSeconds = Math.round(seconds + minutes * 60 + hours * 3600);

  const finalHours = Math.floor(totalSeconds / 3600);
  const finalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const finalSeconds = totalSeconds % 60;

  const parts = [];
  if (finalHours > 0) {
    parts.push(`${finalHours} hour${finalHours !== 1 ? 's' : ''}`);
  }
  if (finalMinutes > 0) {
    parts.push(`${finalMinutes} minute${finalMinutes !== 1 ? 's' : ''}`);
  }
  if (finalSeconds > 0 || parts.length === 0) {
    parts.push(`${finalSeconds} second${finalSeconds !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    const km = meters / 1000;
    return km % 1 === 0 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
  }

  return `${Math.round(meters)} m`;
};