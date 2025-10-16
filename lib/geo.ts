export type Coordinate = { lat: number; lon: number };

/**
 * Compute the geographic center (mean position) of multiple coordinates.
 * Handles wrap-around at the International Date Line.
 */
export function getCentralCoordinate(coords: Coordinate[]): Coordinate | null {
  if (!coords.length) return null;

  let x = 0, y = 0, z = 0;

  for (const { lat, lon } of coords) {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    x += Math.cos(latRad) * Math.cos(lonRad);
    y += Math.cos(latRad) * Math.sin(lonRad);
    z += Math.sin(latRad);
  }

  const total = coords.length;
  x /= total;
  y /= total;
  z /= total;

  // Convert back to lat/lon
  const lonRad = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const latRad = Math.atan2(z, hyp);

  return {
    lat: (latRad * 180) / Math.PI,
    lon: (lonRad * 180) / Math.PI,
  };
}