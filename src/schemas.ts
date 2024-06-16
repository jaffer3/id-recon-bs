export interface User {
    'email'?: string,
    'phoneNumber'?: number
}

export interface ConsolidatedContact {
    primaryContatctId: number,
    emails: string[],
    phoneNumbers: string[],
    secondaryContactIds: number[],
}