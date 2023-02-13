import { QueryResult } from 'pg';

export interface IProjectsRequest {
  name: string
  description: string
  estimatedTime: string
  repository: string
  startDate: Date
  endDate: Date
  developerId: string
}

export interface IProjects extends IProjectsRequest {
  id: number
}

export interface IProjectsTechRequest {
  'addedIn': Date
}

export interface IProjectsTechs extends IProjectsTechRequest {
  id: number
}

export type ProjectsResult = QueryResult<IProjects>

export type ProjectsTechResult = QueryResult<IProjectsTechs>

export enum technologies {
  'JavaScript' = 'JavaScript',
  'Python' = 'Python',
  'React' = 'React',
  'Express.js' = 'Express.js',
  'HTML' = 'HTML',
  'CSS' = 'CSS',
  'Django' = 'Django',
  'PostgreSQL' = 'PostgreSQL',
  'MongoDB' = 'MongoDB'

}
