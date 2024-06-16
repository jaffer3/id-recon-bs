import { Request, Response } from "express";
import { ConsolidatedContact, User } from './schemas';

export const identify = async (req: Request, res: Response) => {
    const user: User = req.body;

    const consolidatedContact: ConsolidatedContact = {
        primaryContatctId: 0, // dummy id, should be replaced
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    }
    
    res.status(200).send({
        contact : consolidatedContact
    });
}