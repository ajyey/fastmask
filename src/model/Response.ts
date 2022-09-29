import { MethodResponse } from '@src/model/MethodResponse';

export interface Response {
    sessionState: string;
    latestClientVersion: string;
    methodResponses: Array<Array<MethodResponse | string>>;
}
