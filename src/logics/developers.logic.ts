import { NextFunction, Request, Response } from 'express';
import {
  DevelopersInfoResult,
  DevelopersInfosResult,
  DevelopersResult,
  IDevelopers,
  IDevelopersInfo,
  IDevelopersInfoRequest,
  IDevelopersRequest
} from '../interfaces/interface';
import format from 'pg-format';
import { cliente } from '../database';
import { QueryConfig } from 'pg';

export const createDevelopers = async (request: Request, response: Response): Promise<Response> => {
  try {
    const developersData: IDevelopersRequest = request.body

    const queryString: string = format(
      `
          INSERT INTO developers(%I)
          VALUES (%L)
          RETURNING *;
      `,
      Object.keys(developersData),
      Object.values(developersData)
    )

    const queryResult: DevelopersResult = await cliente.query(queryString)

    return response.status(201).json(queryResult.rows[0])

  } catch (error: any) {
    if (error.message.includes('null value in column "name" of relation')) {
      return response.status((400)).json({ message: 'Missing requires keys: name' })

    } else if (error.message.includes('duplicate key value violates unique constraint')) {
      return response.status(409).json({ message: 'Email already exists' })

    } else if (error.message.includes('null value in column "email" of relation')) {
      return response.status((400)).json({ message: 'Missing requires keys: email' })
    }
    console.log(error)
    return response.status(500).json({ message: 'Internal server error' })

  }
}

export const createDevelopersInfos = async (request: Request, response: Response): Promise<Response> => {
  try {
    const developersId: number = parseInt(request.params.id)
    const developersInfoData: IDevelopersInfoRequest = request.body

    let queryString: string =
      `
          INSERT INTO developer_infos ("developerSince", "preferredOS", "developerId")
          VALUES ($1, $2, $3)
          RETURNING *;
      `
    let queryResult: DevelopersInfoResult = await cliente.query(queryString, [developersInfoData.developerSince, developersInfoData.preferredOS, developersId])

    return response.status(201).json(queryResult.rows[0])

  } catch (error: any) {
    if (error.message.includes('null value in column "developerSince" of relation')) {
      return response.status(400).json({ message: 'developerSince, preferredOS' })
    } else if (error.message.includes('null value in column "preferredOS" of relation')) {
      return response.status(400).json({ message: 'developerSince, preferredOS' })
    }
    console.log(error)
    return response.status(500).json({ message: 'Internal server error' })
  }
}

export const listDevelopers = async (request: Request, response: Response): Promise<Response> => {

  const developersId: number = parseInt(request.params.id)

  const queryString: string = `
      SELECT dev.*,
             info.id               as "infoId",
             info."developerSince" as "developerSince",
             info."preferredOS"    as "preferredOS"
      FROM developers dev
               JOIN
           developer_infos info ON dev."id" = info."developerId"
      WHERE dev.id = $1;

  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developersId]
  }
  const queryResult: DevelopersInfosResult = await cliente.query(queryConfig)

  return response.status(200).json(queryResult.rows[0])

}

export const listDevelopersAll = async (request: Request, response: Response): Promise<Response> => {
  const queryString: string = `
      SELECT dev.*,
             info.id               as "infoId",
             info."developerSince" as "developerSince",
             info."preferredOS"    as "preferredOS"
      FROM developers dev
               LEFT JOIN
           developer_infos info ON dev."id" = info."developerId"
  `
  const queryConfig: QueryConfig = {
    text: queryString
  }

  const queryResult: DevelopersInfosResult = await cliente.query(queryConfig)

  return response.status(200).json(queryResult.rows)
}

export const updateDevelopers = async (request: Request, response: Response): Promise<Response> => {

  const newDeveloperData: IDevelopers = request.body;

  const idDevelopers: number = parseInt(request.params.id);

  const getDevelopresQuery = `
      SELECT *
      FROM developers
      WHERE id = $1`;

  const developersResponse = await cliente.query(getDevelopresQuery, [idDevelopers]);
  const developer = developersResponse.rows[0];

  const valuesDevelopers: IDevelopersRequest = { ...developer, ...newDeveloperData };

  const queryString: string = `
      UPDATE developers
      SET name  = $1,
          email = $2
      WHERE id = $3
      RETURNING *;

  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [valuesDevelopers.name, valuesDevelopers.email, idDevelopers]
  }
  const queryResult = await cliente.query(queryConfig)

  return response.status(200).json(queryResult.rows[0])

}

export const updateDevelopersInfo = async (request: Request, response: Response): Promise<Response | void> => {

  const newDeveloperInfoData: IDevelopersInfo = request.body;

  const idDeveloper: number = parseInt(request.params.id);

  const getDevelopresInfoQuery = `
      SELECT info.id               as "infoId",
             info."developerSince" as "developerSince",
             info."preferredOS"    as "preferredOS"
      FROM developers dev
               JOIN
           developer_infos info ON dev."id" = info."developerId"
      WHERE dev.id = $1`;

  const developersInfoResponse = await cliente.query(getDevelopresInfoQuery, [idDeveloper]);
  const developerInfo = developersInfoResponse.rows[0];

  const valuesDevelopersInfo: IDevelopersInfoRequest = { ...developerInfo, ...newDeveloperInfoData };

  const queryString: string = `
      UPDATE developer_infos
      SET "developerSince" = $1,
          "preferredOS"    = $2
      WHERE id = $3
      RETURNING *;
  `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [valuesDevelopersInfo.developerSince, valuesDevelopersInfo.preferredOS, developerInfo.infoId]
  }

  const queryResult = await cliente.query(queryConfig)

  return response.status(200).json(queryResult.rows[0])
}

export const deleteDeveloper = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const idDeleteDeveloper: string = request.params.id
  const queryString: string = `
      DELETE
      FROM developers
      WHERE id = $1
  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [idDeleteDeveloper]
  }

  await cliente.query(queryConfig)

  return response.status(200).json();
}
