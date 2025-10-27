import React, { useMemo } from 'react';
import { SectionList, View, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';
import { SSText } from '../ui/SSText';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import ItineraryPlaceCard from './ItineraryPlaceCard';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { IPlace } from '@/dto/places/place.dto';
import moment from 'moment';

// --- helpers ---
const formatDay = (d: string | Date) => {
  const date = moment(d);
  return date.format('dddd, DD MMM');
};

const normalizeTime = (t?: string | null) => {
  // your schema uses text("visit_time"), e.g. "08:00"
  if (!t) return '';
  // keep as-is; if you store "8:0" you could pad here.
  return t;
};

export function ItineraryTimeline({
  itinerary,
  tappedInItineraryPlaces,
  handleSelectPlace,
}: {
  itinerary: IItinerary;
  tappedInItineraryPlaces: { id: string }[];
  handleSelectPlace: (p: IPlace) => void;
}) {
  const tappedIds = useMemo(
    () => new Set(tappedInItineraryPlaces.map((ip) => ip.id)),
    [tappedInItineraryPlaces]
  );

  // Group by visitDate; fall back to createdAt date if visitDate missing
  const sections = useMemo(() => {
    const groups = new Map<string, IItineraryPlace[]>();

    (itinerary.itineraryPlaces ?? []).forEach((p) => {
      const dayKey = p.visitDate
        ? new Date(p.visitDate).toISOString().slice(0, 10)
        : new Date(p.createdAt ?? Date.now()).toISOString().slice(0, 10);

      if (!groups.has(dayKey)) groups.set(dayKey, []);
      groups.get(dayKey)!.push(p);
    });

    // sort days ascending; you can flip for descending
    const dayKeys = Array.from(groups.keys()).sort();

    // sort items within a day by visitTime (then orderIndex)
    return dayKeys.map((k) => {
      const items = groups
        .get(k)!
        .slice()
        .sort((a, b) => {
          const ta = normalizeTime(a.visitTime);
          const tb = normalizeTime(b.visitTime);
          if (ta && tb && ta !== tb) return ta.localeCompare(tb);
          return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        });
      return { title: formatDay(k), key: k, data: items };
    });
  }, [itinerary.itineraryPlaces]);

  console.log('ItineraryTimeline sections', sections);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      renderSectionHeader={({ section }) => (
        <View className="mt-4 mb-2">
          <SSText variant="semibold" className="text-lg">
            {section.title}
          </SSText>
        </View>
      )}
      renderItem={({ item, index, section }) => {
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;
        const isVeryLast = index === section.data.length - 1;
        const time = normalizeTime(item.visitTime) || '';
        const tappedIn = tappedIds.has(item.id);

        return (
          <View className="flex-row gap-3">
            {/* Left time column */}

            {/* Timeline column */}
            <View className="w-6 items-center relative">
              {/* vertical line */}
              {!isLast && (
                <View
                  className={cn(
                    'absolute top-0 bottom-0 w-[2px] bg-foreground',
                    isFirst && 'top-3' // start below the first dot
                  )}
                />
              )}
              {/* dot */}
              <View className="w-4 h-4 rounded-full bg-foreground" />
            </View>

            {/* Card column */}
            <View className="flex-1 mb-4">
              <View className="mb-2">
                <SSText className="text-sm">{time}</SSText>
              </View>
              <TouchableOpacity
                onPress={() => item.place && handleSelectPlace(item.place)}
                activeOpacity={0.8}
              >
                <ItineraryPlaceCard
                  index={index}
                  place={item}
                  tappedIn={tappedIn}
                />
              </TouchableOpacity>

              {/* travel gap / change row (optional placeholder) */}
              {/* {!isLast && (
                <View className="mt-2 ml-[-22px] pl-6 pr-3">
                  <View className="flex-row items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                    <SSText className="text-xs">5 minutes</SSText>
                    <SSText className="text-xs underline">Change</SSText>
                  </View>
                </View>
              )} */}
            </View>
          </View>
        );
      }}
      ListFooterComponent={<View className="h-4" />}
    />
  );
}
