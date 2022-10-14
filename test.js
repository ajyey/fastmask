#!/usr/bin/env node
import * as dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
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

const getSession = async () => {
    const response = await fetch(authUrl, {
        method: 'GET',
        headers,
    });
    return response.json();
};

const mailboxQuery = async (apiUrl, accountId) => {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            using: ['urn:ietf:params:jmap:core'],
            methodCalls: [['MaskedEmail/get', { ids: null }]],
        }),
    });
    const data = await response.json();
    console.log(data);

    // return await data["methodResponses"][0][1].ids[0];
};

const identityQuery = async (apiUrl, accountId) => {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            using: [
                'urn:ietf:params:jmap:core',
                'urn:ietf:params:jmap:mail',
                'urn:ietf:params:jmap:submission',
            ],
            methodCalls: [['Identity/get', { accountId, ids: null }, 'a']],
        }),
    });
    const data = await response.json();

    return await data['methodResponses'][0][1].list.filter(
        (identity) => identity.email === username,
    )[0].id;
};

const draftResponse = async (apiUrl, accountId, draftId, identityId) => {
    const messageBody =
        'Hi! \n\n' +
        'This email may not look like much, but I sent it with JMAP, a protocol \n' +
        'designed to make it easier to manage email, contacts, calendars, and more of \n' +
        'your digital life in general. \n\n' +
        'Pretty cool, right? \n\n' +
        '-- \n' +
        'This email sent from my next-generation email system at Fastmail. \n';

    const draftObject = {
        from: [{ email: username }],
        to: [{ email: username }],
        subject: 'Hello, world!',
        keywords: { $draft: true },
        mailboxIds: { [draftId]: true },
        bodyValues: { body: { value: messageBody, charset: 'utf-8' } },
        textBody: [{ partId: 'body', type: 'text/plain' }],
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            using: [
                'urn:ietf:params:jmap:core',
                'urn:ietf:params:jmap:mail',
                'urn:ietf:params:jmap:submission',
            ],
            methodCalls: [
                [
                    'Email/set',
                    { accountId, create: { draft: draftObject } },
                    'a',
                ],
                [
                    'EmailSubmission/set',
                    {
                        accountId,
                        onSuccessDestroyEmail: ['#sendIt'],
                        create: { sendIt: { emailId: '#draft', identityId } },
                    },
                    'b',
                ],
            ],
        }),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
};

const getMaskedEmails = async (session, apiUrl, accountId) => {
    // time how long the request takes
    const start = new Date();

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            using: [
                'urn:ietf:params:jmap:core',
                'https://www.fastmail.com/dev/maskedemail',
            ],
            methodCalls: [['MaskedEmail/get', { accountId, ids: null }, 'a']],
        }),
    });

    const data = await response.json();
    const end = new Date();
    const time = end - start;
    console.log(`Request took ${time}ms`);
    console.log(JSON.stringify(data, null, 2));
};

const run = async () => {
    const session = await getSession();
    const accountId = session.primaryAccounts['urn:ietf:params:jmap:core'];
    const apiUrl = session.apiUrl;
    const start = new Date();
    const maskedEmails = await getMaskedEmails(session, apiUrl, accountId);
    const end = new Date();
    const time = end - start;
    console.log(`Request took ${time}ms`);
    console.log(maskedEmails);
};

run();
