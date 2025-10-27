import { View, Text } from 'react-native';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import SavedPlaces from '../SavedPlaces';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SSText } from '../ui/SSText';
import DiscoverPlaces from '../discoverPlaces/DiscoverPlaces';

export default function ChoosePlaces({
  selectedPlaceIds,
  onSelectSavedPlace,
  onSelectDiscoverPlace,
  tab,
  lat,
  lon,
  onChangeTab,
  selectedDiscoverCount,
  selectedSavedCount,
}: {
  selectedPlaceIds: string[];
  onSelectSavedPlace: (placeId: string) => void;
  onSelectDiscoverPlace: (placeId: string) => void;
  tab: 'saved' | 'discover';
  onChangeTab: (tab: 'saved' | 'discover') => void;
  lat?: number | null;
  lon?: number | null;
  selectedDiscoverCount?: number;
  selectedSavedCount?: number;
}) {
  return (
    <ScrollView className="flex-1">
      <Tabs
        value={tab}
        onValueChange={(tab) =>
          onChangeTab(tab !== 'saved' ? 'discover' : 'saved')
        }
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="saved">
            <SSText>
              Saved Places
              {selectedSavedCount ? ' (' + selectedSavedCount + ')' : null}
            </SSText>
          </TabsTrigger>
          <TabsTrigger value="discover">
            <SSText>
              Discover
              {selectedDiscoverCount
                ? ' (' + selectedDiscoverCount + ')'
                : null}
            </SSText>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="saved">
          <SavedPlaces
            isSelectionMode
            onSelectPlace={(placeId) => onSelectSavedPlace(placeId)}
            selectedPlaceIds={selectedPlaceIds}
            coords={
              lat && lon
                ? {
                    lat,
                    lon,
                  }
                : undefined
            }
          />
        </TabsContent>
        <TabsContent value="discover">
          <DiscoverPlaces
            isSelectionMode
            onSelectPlace={(placeId) => onSelectDiscoverPlace(placeId)}
            selectedPlaceIds={selectedPlaceIds}
            coords={
              lat && lon
                ? {
                    lat,
                    lon,
                  }
                : undefined
            }
          />
        </TabsContent>
      </Tabs>
    </ScrollView>
  );
}
