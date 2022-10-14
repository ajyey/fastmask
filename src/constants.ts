export const JMAP_CORE = 'urn:ietf:params:jmap:core';
export const JMAP_MAIL = 'urn:ietf:params:jmap:mail';
export const JMAP_SUBMISSION = 'urn:ietf:params:jmap:submission';

export const MASKED_EMAIL_CALLS = {
    // Standard /get method. The ids argument may be null to fetch all at once.
    get: 'MaskedEmail/get',
    // Standard /set method. Only Masked Email addresses that have not received email may be destroyed.
    set: 'MaskedEmail/set',
};

export const MASKED_EMAIL_CAPABILITY =
    'https://www.fastmail.com/dev/maskedemail';

export const GET = 'GET';
export const POST = 'POST';
