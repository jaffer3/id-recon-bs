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

export type precedence = 'primary' | 'secondary'

export type emailOrPhone = 'email' | 'phoneNumber'