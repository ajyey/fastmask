import { MaskedEmail } from '@src/model/MaskedEmail';

export interface MethodResponse {
    accountId: string;
    state: string;
    notFound: any[];
    list: MaskedEmail[];
}
