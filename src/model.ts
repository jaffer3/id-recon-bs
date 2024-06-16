import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Association, NonAttribute, ForeignKey } from 'sequelize';
import db from './db';
import { precedence } from './schemas';

class Contact extends Model<
    InferAttributes<Contact, { omit: 'secondary_contacts' | 'primary_contact' }>, 
    InferCreationAttributes<Contact, { omit: 'secondary_contacts' | 'primary_contact' }>
> {
    declare id: CreationOptional<number>;

    declare phoneNumber: string | null;
    declare email: string | null;

    declare linkPrecedence: precedence;
    declare linkedId: ForeignKey<Contact['id']>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date>;

    declare secondary_contacts?: NonAttribute<Contact[]>;
    declare primary_contact?: NonAttribute<Contact>;

    declare static associations: {
        secondary_contacts: Association<Contact, Contact>;
        primary_contact: Association<Contact, Contact>;
    };
}

Contact.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        phoneNumber: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        linkedId: {
            type: DataTypes.INTEGER,
        },
        linkPrecedence: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize: db,
        modelName: 'Contact'
    }
);

Contact.belongsTo(Contact, {
    foreignKey: 'linkedId',
    as: 'primary_contact'
});
Contact.hasMany(Contact, {
    foreignKey: 'linkedId',
    as: 'secondary_contacts'
});

export default Contact