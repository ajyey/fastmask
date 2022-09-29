/**
 * Represents a masked email address.
 */
export interface MaskedEmail {
    email: string;
    id: string;
    url: string | null;
    state: MaskedEmailState;
    forDomain: string;
    description: string;
    createdAt: string;
    lastMessageAt: string;
    createdBy: string;
}

type MaskedEmailState = 'enabled' | 'disabled' | 'pending' | 'deleted';
