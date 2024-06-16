import { Request, Response } from "express";
import { ConsolidatedContact, User, emailOrPhone, precedence } from './schemas';
import Contact from "./model";

const findByEmailOrPhone = async (field: emailOrPhone, value: string) => {
    const user =  await Contact.findOne({
        where: {
            [field] : value
        },
        include: [Contact.associations.primary_contact],
    });
    return user
}

export const identify = async (req: Request, res: Response) => {
    const user: User = req.body;

    const emailContact = (user.email) ? await findByEmailOrPhone('email', user.email) : null;
    const phoneContact = (user.phoneNumber) ? await findByEmailOrPhone('phoneNumber', user.phoneNumber.toString()) : null;

    const consolidatedContact: ConsolidatedContact = {
        primaryContatctId: 0, // dummy id, should be replaced
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    }

    let primaryContactWWWW: Contact | undefined;
    let precedence: precedence = 'primary';

    if (emailContact && phoneContact) {
        // no new information, so no need to create contact
        if (emailContact.getPrimaryId == phoneContact.getPrimaryId) {
            primaryContactWWWW = emailContact.primary_contact!
        } else {
            const emailPrimaryContact = emailContact.linkPrecedence == 'primary' ? emailContact : emailContact.primary_contact!
            const PhonePrimaryContact = phoneContact.linkPrecedence == 'primary' ? phoneContact : phoneContact.primary_contact!
            const isEmailPrimary = emailPrimaryContact.createdAt < PhonePrimaryContact.createdAt

            primaryContactWWWW = isEmailPrimary ? emailPrimaryContact : PhonePrimaryContact

            const contactToModify = isEmailPrimary ? PhonePrimaryContact : emailPrimaryContact
            const secondaryId = contactToModify.id
            contactToModify.set({
                linkPrecedence: 'secondary',
                linkedId: primaryContactWWWW.id
            });
            await contactToModify.save();
            await Contact.update(
                { linkedId: primaryContactWWWW.id },
                {
                  where: {
                    linkedId: secondaryId,
                  },
                },
            );
        }
    } else if (
        (emailContact && !user.phoneNumber) || 
        (phoneContact && !user.email)
    ) {
        // no new information, so no need to create contact
        primaryContactWWWW = emailContact ? 
            (emailContact.linkPrecedence == 'primary' ? emailContact : emailContact.primary_contact!) :
            (phoneContact?.linkPrecedence == 'primary' ? phoneContact : phoneContact?.primary_contact!)
    } else {
        // create new contact
        if (emailContact || phoneContact) {
            // get Primary Contact for secondary contact
            precedence = 'secondary'
            primaryContactWWWW = emailContact ? 
                (emailContact.linkPrecedence == 'primary' ? emailContact : emailContact.primary_contact!) :
                (phoneContact?.linkPrecedence == 'primary' ? phoneContact : phoneContact?.primary_contact!)
        }
        const newContact = Contact.build({ linkPrecedence: precedence });
        if (user.email) {
            newContact.email = user.email
        }
        if (user.phoneNumber) {
            newContact.phoneNumber = user.phoneNumber.toString()
        }
        if (primaryContactWWWW) {
            // secondary contact with Primary Id
            newContact.linkedId = primaryContactWWWW.id
        }
        await newContact.save();
        if (!primaryContactWWWW) {
            // new primary contact
            primaryContactWWWW = newContact
        }
    }

    // update consolidatedContact ID
    consolidatedContact.primaryContatctId = primaryContactWWWW.id

    // get all secondary contacts
    const secondaryEmails = new Set<string>();
    const secondaryPhoneNumbers = new Set<string>();
    if (emailContact || phoneContact) {
        const secondaryContacts = await Contact.findAll({
            attributes: ['id', 'email', 'phoneNumber'],
            where: {
                linkedId: consolidatedContact.primaryContatctId
            }
        });
        secondaryContacts.forEach((contact) => {
            if (contact.email) {
                secondaryEmails.add(contact.email)
            }
            if (contact.phoneNumber) {
                secondaryPhoneNumbers.add(contact.phoneNumber)
            }
            consolidatedContact.secondaryContactIds.push(contact.id)
        });
    }

    // update consolidatedContact Email & phoneNumbers
    if (primaryContactWWWW.email) {
        secondaryEmails.delete(primaryContactWWWW.email)
        consolidatedContact.emails.push(primaryContactWWWW.email)
    }
    if (primaryContactWWWW.phoneNumber) {
        secondaryPhoneNumbers.delete(primaryContactWWWW.phoneNumber)
        consolidatedContact.phoneNumbers.push(primaryContactWWWW.phoneNumber)
    }
    consolidatedContact.emails = [ ...consolidatedContact.emails, ...secondaryEmails ]
    consolidatedContact.phoneNumbers = [ ...consolidatedContact.phoneNumbers, ...secondaryPhoneNumbers ]
    
    res.status(200).send({
        contact : consolidatedContact
    });
}