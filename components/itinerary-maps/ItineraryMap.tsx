import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { IPlace } from '@/dto/places/place.dto';
import { calculateTimeAndDistance } from '@/endpoints/places/endpoints';
import {
  CoordinatesDto,
  TravelMode,
} from '@/dto/places/calculate-distance.dto';
import SSMaps, { Marker } from '../SSMaps';
import ItineraryMapMarker from './ItineraryMapMarker';

export default function ItineraryMap({
  itineraryPlaces,
}: {
  itineraryPlaces: IItineraryPlace[];
}) {
  const places = itineraryPlaces
    .map((place) => place.place)
    .filter(Boolean) as IPlace[];

  const placeMarkers: Marker[] = itineraryPlaces.map(
    (ip) =>
      ip.place && {
        element: <ItineraryMapMarker itineraryPlace={ip} />,
        latitude: parseFloat(ip.place.latitude),
        longitude: parseFloat(ip.place.longitude),
      }
  ) as Marker[];

  const coordinatePairs = places
    .map((place, index) => {
      const latitude = parseFloat(place.latitude);
      const longitude = parseFloat(place.longitude);

      if (isNaN(latitude) || isNaN(longitude)) return null;

      return {
        origin: { latitude, longitude },
        destination:
          index < places.length - 1
            ? {
                latitude: parseFloat(places[index + 1].latitude),
                longitude: parseFloat(places[index + 1].longitude),
              }
            : null,
      };
    })
    .filter((pair) => pair?.destination !== null) as {
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
  }[];

  const [routeSegments, setRouteSegments] = React.useState<
    { coordinates: CoordinatesDto[] }[]
  >([]);

  useEffect(() => {
    async function fetchRoutes() {
      if (coordinatePairs.length === 0) return;
      const routeSegments = await Promise.all(
        coordinatePairs.map(({ origin, destination }) =>
          calculateTimeAndDistance({
            origin,
            destination,
            travelMode: TravelMode.DRIVE,
          })
        )
      );
      setRouteSegments(
        routeSegments.map((segment) => ({
          coordinates: segment.data?.coordinates || [],
        }))
      );
    }
    fetchRoutes();
  }, [coordinatePairs.length]);

  const mergedCoordinates = routeSegments.map((segment) => segment.coordinates);

  return (
    <View>
      <SSMaps
        segments={mergedCoordinates}
        height={800}
        markers={placeMarkers}
      />
    </View>
  );
}
