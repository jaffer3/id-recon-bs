import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.DB_URI || ''
const sequelize = new Sequelize(DB_URI, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
  }
);

export default sequelize;