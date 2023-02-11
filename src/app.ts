import express, { Application } from 'express';
import { startDatabase } from './database';
import {
  createDevelopers,
  createDevelopersInfos,
  deleteDeveloper,
  listDevelopers,
  listDevelopersAll,
  updateDevelopers,
  updateDevelopersInfo
} from './logics/developers.logic';
import {
  developersExists,
  validateBodyInfosMiddleware,
  validateBodyMiddleware
} from './middlewares/developers.middlewares';

const app: Application = express();
app.use(express.json());

app.post('/developers', createDevelopers)
app.post('/developers/:id/info', developersExists, createDevelopersInfos)

app.get('/developers/:id', developersExists, listDevelopers)
app.get('/developers', listDevelopersAll)

app.patch('/developers/:id', developersExists, validateBodyMiddleware, updateDevelopers)
app.delete('/developers/:id', deleteDeveloper);
app.patch('/developers/:id/infos', developersExists, validateBodyInfosMiddleware, updateDevelopersInfo)


const PORT: number = 3000;
const runningMsg: string = `Server running on http://localhost:${PORT}`;

app.listen(PORT, async () => {
  await startDatabase()
  console.log(runningMsg)
})
