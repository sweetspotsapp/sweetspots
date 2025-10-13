import { syncPlace } from "@/endpoints/places/endpoints";

const syncingPlaces = new Set<string>();

export async function syncPlaceOnce(placeId: string): Promise<void> {
  if (syncingPlaces.has(placeId)) {
    console.log(`Skipping sync for ${placeId} (already in progress)`);
    return;
  }

  syncingPlaces.add(placeId);
  try {
    await syncPlace(placeId);
    console.log(`Synced place ${placeId}`);
  } catch (err) {
    console.error(`Failed to sync place ${placeId}`, err);
  } finally {
    syncingPlaces.delete(placeId);
  }
}