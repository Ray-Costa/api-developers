import { NextFunction, Request, Response } from 'express';
import { QueryConfig } from 'pg';
import { cliente } from '../database';
import { technologies } from '../interfaces/projects.interface';


export const validateBodyProjectsMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  if (!request.body.name && !request.body.description && !request.body.estimatedTime && !request.body.repository && !request.body.startDate) {
    return response.status(400).json({
      message: 'Missing required keys: name,description,estimatedTime,repository,startDate.'
    })

  }
  return next()
}
export const validateBodyProjMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  if (!request.body.developerId ||!request.body.description || !request.body.estimatedTime || !request.body.repository || !request.body.startDate) {
    return response.status(400).json({
      message: 'Missing required keys: developerId,description,estimatedTime,repository,startDate.'
    })

  }
  return next()
}

export const projectsExists = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const projectsId: number = parseInt(request.params.id)

  const queryString: string = `
      SELECT COUNT(*)
      FROM projects
      WHERE id = $1;
  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectsId]
  }
  const queryResult = await cliente.query(queryConfig)

  queryResult.rows[0].count

  if (Number(queryResult.rows[0].count) > 0) {
    return next()
  }
  return response.status(404).json({ message: 'Project not found.' })
}

export const validateProjectsMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  if (!request.body.name && !request.body.description && !request.body.estimatedTime && !request.body.repository && !request.body.startDate && !request.body.endDate) {
    return response.status(400).json({
      message: `At least one of those keys must be send`,
      keys: ['name', 'description', 'estimatedTime', 'repository', 'startDate', 'endDate']
    });
  }
  return next()
}

export const validateTechnology = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  let supportedTechnologies = Object.values(technologies);
  if (!supportedTechnologies.includes(request.body.name)) {
    return response.status(400).json({
      message: 'Technology not supported.',
      options: supportedTechnologies
    })
  }

  return next();
}

