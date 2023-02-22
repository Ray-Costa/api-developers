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
          INSERT INTO developers("name", "email")
          VALUES ($1, $2)
          RETURNING *;

      `
    )

    const { rows }: DevelopersResult = await cliente.query(queryString, [developersData.name, developersData.email])

    return response.status(201).json(rows[0])

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

    let developerInfoQuery = `SELECT *
                              FROM developers
                              WHERE id = $1`;
    const { rows } = await cliente.query(developerInfoQuery, [developersId]);
    if (rows[0].developerInfoId) {
      return response.status(400).json({
        message: 'Developer infos already exists.'
      })
    }

    let queryString: string =
      `
          INSERT INTO developer_infos ("developerSince", "preferredOS")
          VALUES ($1, $2)
          RETURNING *;
      `
    let queryResult: DevelopersInfoResult = await cliente.query(queryString, [developersInfoData.developerSince, developersInfoData.preferredOS])

    let updateDeveloperQuery = `
        UPDATE developers
        SET "developerInfoId" = $1
        WHERE id = $2
    `

    await cliente.query(updateDeveloperQuery, [queryResult.rows[0].id, developersId])

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
      SELECT dev.id as "developerID",
             dev.name as "developerName",
             dev.email as "developerEmail",
             info.id               as "developerInfoID",
             info."developerSince" as "developerInfoDeveloperSince",
             info."preferredOS"    as "developerInfoPreferredOS"
      FROM developers dev
               LEFT JOIN
           developer_infos info ON dev."developerInfoId" = info."id"
      WHERE dev.id = $1;

  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developersId]
  }
  const queryResult: DevelopersInfosResult = await cliente.query(queryConfig)

  return response.status(200).json(queryResult.rows[0])

}

export const listDeveloperProjects = async (request: Request, response: Response): Promise<Response> => {

  const developersId: number = parseInt(request.params.id)

  const queryString: string = `
      SELECT dev.id as "developerID",
             dev.name as "developerName",
             dev.email as "developerEmail",
             info.id               as "developerInfoID",
             info."developerSince" as "developerInfoDeveloperSince",
             info."preferredOS"    as "developerInfoPreferredOS",
             proj.id               as "projectID",
             proj.name             as "projectName",
             proj.description      as "projectDescription",
             proj."estimatedTime"  as "projectEstimatedTime",
             proj.repository       as "projectRepository",
             proj."startDate"      as "projectStartDate",
             proj."endDate"        as "projectEndDate",
             tech."id"             as "technologyId",
             tech."name"           as "technologyName"
      FROM developers dev
               LEFT JOIN
           developer_infos info ON dev."developerInfoId" = info."id"
               INNER JOIN projects proj on dev.id = proj."developerId"
               LEFT JOIN projects_technologies proj_tech on proj.id = proj_tech."projectId"
               LEFT JOIN technologies tech on proj_tech."techId" = tech.id
      WHERE dev.id = $1;

  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developersId]
  }
  const queryResult: DevelopersInfosResult = await cliente.query(queryConfig)

  return response.status(200).json(queryResult.rows)

}

export const listDevelopersAll = async (request: Request, response: Response): Promise<Response> => {
  const queryString: string = `
      SELECT dev.id as "developerID" ,
             dev.name as "developerName",
             dev.email as "developerEmail",
             info.id               as "developerInfoID",
             info."developerSince" as "developerInfoDeveloperSince",
             info."preferredOS"    as "developerInfoPreferredOS"
      FROM developers dev
               LEFT JOIN
           developer_infos info ON dev."developerInfoId" = info."id"
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
           developer_infos info ON dev."developerInfoId" = info."id"
      WHERE dev.id = $1`;

  const developersInfoResponse = await cliente.query(getDevelopresInfoQuery, [idDeveloper]);
  const developerInfo = developersInfoResponse.rows[0];
  if (!developerInfo) {
    return response.status(400).json({ message: 'Developer info doesn\'t exists' })
  }
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

  return response.status(204).json();
}
