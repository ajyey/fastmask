import * as dotenv from 'dotenv';
import fetch, { RequestInfo } from 'node-fetch';
import path from 'path';
import {
    GET,
    JMAP_CORE,
    MASKED_EMAIL_CALLS,
    MASKED_EMAIL_CAPABILITY,
    POST,
} from '../constants';
import { MaskedEmail, MaskedEmailState } from '@src/model/MaskedEmail';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// bail if we don't have our ENV set:
if (!process.env.JMAP_USERNAME || !process.env.JMAP_TOKEN) {
    console.log('Please set your JMAP_USERNAME and JMAP_TOKEN');
    process.exit(1);
}

const hostname = process.env.JMAP_HOSTNAME;
const username = process.env.JMAP_USERNAME;
const token = process.env.JMAP_TOKEN;

const authUrl = `https://${hostname}/.well-known/jmap`;
const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
};

export const getSession = async (): Promise<any> => {
    const response = await fetch(authUrl, {
        method: GET,
        headers,
    });
    return response.json();
};
/**
 * Get a masked email by id
 * @param id The id of the masked email address.
 * @param apiUrl The apiUrl from the session object.
 * @param accountId The accountId from the session object.
 */
export const getMaskedEmailById = async (
    id: string,
    apiUrl: RequestInfo,
    accountId: string,
): Promise<MaskedEmail> => {
    const response = await fetch(apiUrl, {
        method: POST,
        headers,
        body: JSON.stringify({
            using: [JMAP_CORE, MASKED_EMAIL_CAPABILITY],
            methodCalls: [
                [MASKED_EMAIL_CALLS.get, { accountId, ids: [id] }, 'a'],
            ],
        }),
    });
    const data = await response.json();
    return data.methodResponses[0][1].list[0];
};

/**
 * Sets the description of a masked email
 * @param id The id of the masked email address.
 * @param description The new description to set
 * @param apiUrl The apiUrl from the session object.
 * @param accountId The accountId from the session object.
 */
const setEmailDescription = async (
    id: string | undefined,
    description: string,
    apiUrl: RequestInfo,
    accountId: string,
): Promise<MaskedEmail> => {
    if (!id) {
        throw new Error('No id provided');
    }
    const response = await fetch(apiUrl, {
        method: POST,
        headers,
        body: JSON.stringify({
            using: [JMAP_CORE, MASKED_EMAIL_CAPABILITY],
            methodCalls: [
                [
                    MASKED_EMAIL_CALLS.set,
                    { accountId, update: { [id]: { description } } },
                    'a',
                ],
            ],
        }),
    });
    const data = await response.json();
    return data.methodResponses[0][1].updated[id];
};

/**
 * Gets a masked email by email address from the full list of masked emails
 * @param email The email to find
 * @param list The list of masked emails
 */
const getEmailByAddress = async (
    email: string,
    list: MaskedEmail[],
): Promise<MaskedEmail | undefined> => {
    return list.find((me) => me.email === email);
};

/**
 * Gets a masked email by id from the full list of masked emails
 * @param id The id of the masked email address.
 * @param list The list of masked emails
 */
const findEmailById = async (id: string, list: MaskedEmail[]) => {
    return list.find((me) => me.id === id);
};

/**
 * Filters emails by state
 * @param state The state to filter by
 * @param list The list of masked emails
 */
const filterEmailsByState = async (state: string, list: MaskedEmail[]) => {
    return list.filter((me) => me.state === state);
};

/**
 * Set the state of a masked email
 * @param id The id of the masked email address.
 * @param state The state to set
 * @param apiUrl The apiUrl from the session object.
 * @param accountId The accountId from the session object.
 */
const setEmailState = async (
    id: string | undefined,
    state: MaskedEmailState,
    apiUrl: RequestInfo,
    accountId: string,
) => {
    if (!id) {
        throw new Error('No id provided');
    }
    const response = await fetch(apiUrl, {
        method: POST,
        headers,
        body: JSON.stringify({
            using: [JMAP_CORE, MASKED_EMAIL_CAPABILITY],
            methodCalls: [
                [
                    MASKED_EMAIL_CALLS.set,
                    { accountId, update: { [id]: { state } } },
                    'a',
                ],
            ],
        }),
    });
    const data = await response.json();
    return data.methodResponses[0][1].updated[id];
};

/**
 * Get all masked emails
 * @param apiUrl The apiUrl from the session
 * @param accountId The accountId from the session
 */
const getMaskedEmails = async (
    apiUrl: RequestInfo,
    accountId: any,
): Promise<MaskedEmail[]> => {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            using: [JMAP_CORE, MASKED_EMAIL_CAPABILITY],
            methodCalls: [
                [MASKED_EMAIL_CALLS.get, { accountId, ids: null }, 'a'],
            ],
        }),
    });
    const data = await response.json();
    return data.methodResponses[0][1].list;
};

const run = async () => {
    const session = await getSession();
    const accountId = session.primaryAccounts[JMAP_CORE];
    const { apiUrl } = session;
    const start = new Date().getTime();
    const maskedEmails = await getMaskedEmails(apiUrl, accountId);
    const end = new Date().getTime();
    console.log(`Got ${maskedEmails.length} masked emails in ${end - start}ms`);
};

run();
