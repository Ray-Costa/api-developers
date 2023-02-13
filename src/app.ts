import express, { Application } from 'express';
import { startDatabase } from './database';
import {
  createDevelopers,
  createDevelopersInfos,
  deleteDeveloper,
  listDeveloperProjects,
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
import {
  createProjects,
  createProjectTechnology,
  deleteProjects, deleteTechnologyByName,
  listProjects,
  listProjectsAll,
  updateProject
} from './logics/projects.logic';
import {
  projectsExists,
  validateBodyProjectsMiddleware,
  validateProjectsMiddleware,
  validateTechnology
} from './middlewares/projects.middlewares';

process.on('uncaughtException', function (err) {
  console.error('Caught exception: ' + err);
  process.exit(1);
});

const app: Application = express();
app.use(express.json());

app.post('/developers', createDevelopers)
app.get('/developers/:id', developersExists, listDevelopers)
app.get('/developers/:id/projects', developersExists, listDeveloperProjects)
app.get('/developers', listDevelopersAll)
app.patch('/developers/:id', developersExists, validateBodyMiddleware, updateDevelopers)
app.delete('/developers/:id', deleteDeveloper)
app.post('/developers/:id/info', developersExists, createDevelopersInfos)
app.patch('/developers/:id/infos', developersExists, validateBodyInfosMiddleware, updateDevelopersInfo)

app.post('/projects', validateBodyProjectsMiddleware, createProjects)
app.get('/projects/:id', projectsExists, listProjects)
app.get('/projects', listProjectsAll)
app.patch('/projects/:id', projectsExists, validateProjectsMiddleware, updateProject)
app.delete('/projects/:id', projectsExists, deleteProjects)
app.post('/projects/:id/technologies', validateTechnology, projectsExists, createProjectTechnology)
app.delete('/projects/:id/technologies/:name', validateTechnology, projectsExists, deleteTechnologyByName)

const PORT: number = 3000;
const runningMsg: string = `Server running on http://localhost:${PORT}`;

app.listen(PORT, async () => {
  await startDatabase()
  console.log(runningMsg)
})
