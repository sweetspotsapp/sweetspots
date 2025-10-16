export interface CollabItineraryRoomDto {
    id: string;
    itineraryId: string;
    userId: string;
    isOnline: boolean;
    editingField?: string | null;
    updatedAt: string; // ISO date string
}