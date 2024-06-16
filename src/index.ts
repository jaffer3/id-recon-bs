import express, { Request, Response } from "express";
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

import { identify } from './controller';
import db from './db';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('B i t e   S p e e d   I d e n t i t y   S e r v e r');
});

app.post('/identify', identify);

const start = async(): Promise<void> => {
  await db.sync(
    // { alter: true }
  );
}

void start();

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});