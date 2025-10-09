export interface IAppFeedback {
    id: string;
    userId?: string | null;
    notes: string;
    // occurredAt?: string | null; // Uncomment if you add this field to the schema
    createdAt: string;
    updatedAt: string;

    user?: {
        username: string;
        avatarUrl?: string;
    };
    isOwner?: boolean;
}