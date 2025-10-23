import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { CoordinatesDto } from '@/dto/places/calculate-distance.dto';

let MapNative: any, MarkerNative: any, PolylineNative: any, PROVIDER_GOOGLE: any;
// if (Platform.OS === 'ios' || Platform.OS === 'android') {
//   const RNMaps = require('react-native-maps');
//   MapNative = RNMaps.default;
//   MarkerNative = RNMaps.Marker;
//   PolylineNative = RNMaps.Polyline;
//   PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
// }

import {
  APIProvider,
  Map as GMap,
  Marker as GMarker,
  useMap,
} from '@vis.gl/react-google-maps';

type Marker = CoordinatesDto & {
  element?: React.ReactNode;
}

type SSMapsProps = {
  path?: CoordinatesDto[];
  segments?: CoordinatesDto[][];
  markers?: Marker[];
  autoFit?: boolean;
  initialCenter?: CoordinatesDto;
  webApiKey?: string;
  height?: number;
  borderRadius?: number;
  strokeWidth?: number;
  strokeColor?: string;
};

function WebInner({
  path,
  segments,
  markers,
  autoFit,
  strokeWidth,
  strokeColor,
}: Pick<
  SSMapsProps,
  'path' | 'segments' | 'markers' | 'autoFit' | 'strokeWidth' | 'strokeColor'
>) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  const allCoords = useMemo<CoordinatesDto[]>(() => {
    const arr: CoordinatesDto[] = [];
    if (path?.length) arr.push(...path);
    if (segments?.length) segments.forEach((seg) => arr.push(...seg));
    if (markers?.length) arr.push(...markers);
    return arr;
  }, [path, segments, markers]);

  useEffect(() => {
    if (!map || !(window as any).google) return;

    // cleanup previous polylines
    polylinesRef.current.forEach((pl) => pl.setMap(null));
    polylinesRef.current = [];

    const g = (window as any).google as typeof google;

    const toGPath = (pts: CoordinatesDto[]) =>
      pts.map((p) => ({ lat: p.latitude, lng: p.longitude }));

    if (path?.length) {
      const pl = new g.maps.Polyline({
        path: toGPath(path),
        strokeWeight: strokeWidth ?? 5,
        ...(strokeColor ? { strokeColor } : {}),
      });
      pl.setMap(map);
      polylinesRef.current.push(pl);
    }

    if (segments?.length) {
      segments.forEach((seg) => {
        if (!seg.length) return;
        const pl = new g.maps.Polyline({
          path: toGPath(seg),
          strokeWeight: strokeWidth ?? 5,
          ...(strokeColor ? { strokeColor } : {}),
        });
        pl.setMap(map);
        polylinesRef.current.push(pl);
      });
    }

    return () => {
      polylinesRef.current.forEach((pl) => pl.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, path, segments, strokeWidth, strokeColor]);

  useEffect(() => {
    if (!map || !autoFit || !allCoords.length || !(window as any).google) return;
    const g = (window as any).google as typeof google;
    const bounds = new g.maps.LatLngBounds();
    allCoords.forEach((c) => bounds.extend({ lat: c.latitude, lng: c.longitude }));
    map.fitBounds(bounds, 48);
  }, [map, autoFit, allCoords]);

  return (
    <>
      {markers?.map((m, i) => (
        <GMarker key={`m-${i}`} position={{ lat: m.latitude, lng: m.longitude }} />
      ))}
    </>
  );
}

export default function SSMaps({
  path,
  segments,
  markers,
  autoFit = true,
  initialCenter = { latitude: -37.8136, longitude: 144.9631 },
  webApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY,
  height = 360,
  borderRadius = 16,
  strokeWidth = 5,
  strokeColor = '#f97316',
}: SSMapsProps) {
  if (Platform.OS === 'web') {
    return (
      <APIProvider apiKey={webApiKey!}>
        <div style={{ height, borderRadius, overflow: 'hidden' }}>
          <GMap
            defaultCenter={{ lat: initialCenter.latitude, lng: initialCenter.longitude }}
            defaultZoom={12}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            <WebInner
              path={path}
              segments={segments}
              markers={markers}
              autoFit={autoFit}
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
            />
          </GMap>
        </div>
      </APIProvider>
    );
  }

  // NATIVE
  const mapRef = useRef<any>(null);

  const allCoords = useMemo<CoordinatesDto[]>(() => {
    const arr: CoordinatesDto[] = [];
    if (path?.length) arr.push(...path);
    if (segments?.length) segments.forEach((seg) => arr.push(...seg));
    if (markers?.length) arr.push(...markers);
    return arr;
  }, [path, segments, markers]);

  useEffect(() => {
    if (!autoFit || !mapRef.current || !allCoords.length) return;
    mapRef.current.fitToCoordinates(allCoords, {
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      animated: true,
    });
  }, [autoFit, allCoords]);

  return (
    <View style={[styles.container, { height, borderRadius }]}>
      <MapNative
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: initialCenter.latitude,
          longitude: initialCenter.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {markers?.map((m, i) => (
          <MarkerNative key={`m-${i}`} coordinate={m} />
        ))}

        {path?.length ? (
          <PolylineNative
            coordinates={path}
            strokeWidth={strokeWidth}
            {...(strokeColor ? { strokeColor } : {})}
          />
        ) : null}

        {segments?.map((seg, i) => (
          <PolylineNative
            key={`seg-${i}`}
            coordinates={seg}
            strokeWidth={strokeWidth}
            {...(strokeColor ? { strokeColor } : {})}
          />
        ))}
      </MapNative>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden' },
});