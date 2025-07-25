enum TravelMode {
  DRIVE = 'DRIVE',
  WALK = 'WALK',
  BICYCLE = 'BICYCLE',
  TRANSIT = 'TRANSIT',
}

interface CoordinatesDto {
  latitude: number;
  longitude: number;
}

export interface CalculateDistanceDto {
  origin: CoordinatesDto;
  destination: CoordinatesDto;
  travelMode?: TravelMode;
}
