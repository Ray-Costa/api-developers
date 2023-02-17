import { NextFunction, Request, Response } from 'express';
import { QueryConfig } from 'pg';
import { cliente } from '../database';
import { DevelopersRequiredKeys, supportedOS } from '../interfaces/interface';

export const developersExists = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const developersId: number = parseInt(request.params.id || request.body.developerId)

  const queryString: string = `
      SELECT COUNT(*)
      FROM developers
      WHERE id = $1;
  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developersId]
  }
  const queryResult = await cliente.query(queryConfig)

  queryResult.rows[0].count

  if (Number(queryResult.rows[0].count) > 0) {
    return next()
  }
  return response.status(404).json({ message: 'Developer not found' })
}

export const validateBodyMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const keys: Array<string> = Object.keys(request.body);

  const requiredKeys: Array<DevelopersRequiredKeys> = ['name', 'email'];

  const validatedKeys: boolean = requiredKeys.every(
    (key: string) => keys.includes(key) && keys.length === requiredKeys.length
  );

  if (!validatedKeys) {
    return response.status(400).json({ message: `At least one of those keys must be send.Keys: ${requiredKeys}` });
  }

  return next()
}

export const validateBodyInfosMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  if (!request.body.preferredOS && !request.body.developerSince) {
    return response.status(400).json({
      message: `At least one of those keys must be send`,
      keys: ['developerSince', 'preferredOS']
    });
  }
  return next()
}

export const validateBodyDeveMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  if (!request.body.name && !request.body.email) {
    return response.status(400).json({
      message: `At least one of those keys must be send`,
      keys: ['name', 'email']
    })
  }
  return next()
}

export const validateDeveloperInfoPreferredOS = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  let supportedOSList = Object.values(supportedOS);
  if (request.body.preferredOS && !supportedOSList.includes(request.body.preferredOS)) {
    return response.status(400).json({
      message: 'OS not supported.',
      options: supportedOSList
    })
  }

  next();
}


