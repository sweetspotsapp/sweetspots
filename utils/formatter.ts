type DurationInput = {
  seconds?: number; // can be float
  minutes?: number; // can be float
  hours?: number;   // can be float
  hideMinutes?: boolean; // if true, hide minutes when duration > 1 hour
  hideSeconds?: boolean; // if true, hide seconds when duration > 1 minute
};

export const formatDuration = ({
  seconds = 0,
  minutes = 0,
  hours = 0,
  hideMinutes = false,
  hideSeconds = false,
}: DurationInput): string => {
  const totalSeconds = Math.round(seconds + minutes * 60 + hours * 3600);

  const finalHours = Math.floor(totalSeconds / 3600);
  const finalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const finalSeconds = totalSeconds % 60;

  const parts = [];

  if (finalHours > 0) {
    parts.push(`${finalHours} hour${finalHours !== 1 ? 's' : ''}`);
  }

  const showMinutes = !(hideMinutes && totalSeconds >= 3600);
  if (finalMinutes > 0 && showMinutes) {
    parts.push(`${finalMinutes} minute${finalMinutes !== 1 ? 's' : ''}`);
  }

  const showSeconds = !(hideSeconds && totalSeconds >= 60);
  if ((finalSeconds > 0 && showSeconds) || parts.length === 0) {
    if (showSeconds) {
      parts.push(`${finalSeconds} second${finalSeconds !== 1 ? 's' : ''}`);
    }
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

export const formatCurrency = (amount: number | string = 0, currency: string = '$'): string => {
  return `${currency}${Number(amount || 0).toFixed(0)}`;
}