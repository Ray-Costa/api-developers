import { NextFunction, Request, Response } from 'express';
import { cliente } from '../database';
import { QueryConfig } from 'pg';
import { IProjects, IProjectsRequest, ProjectsResult, ProjectsTechResult } from '../interfaces/projects.interface';

export const createProjects = async (request: Request, response: Response): Promise<Response> => {

  const projectsData: IProjectsRequest = request.body

  const queryString: string =
    `
        INSERT INTO projects ("name", "description", "estimatedTime", "repository", "startDate", "endDate",
                              "developerId")
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;

  console.log('here')
  const { rows }: ProjectsResult = await cliente.query(queryString, [projectsData.name, projectsData.description, projectsData.estimatedTime, projectsData.repository, projectsData.startDate, projectsData.endDate, projectsData.developerId])

  return response.status(201).json(rows[0])
}

export const listProjectsAll = async (request: Request, response: Response): Promise<Response> => {

  const queryString: string = `
      SELECT proj.id              as "projectID",
             proj.name            as "projectName",
             proj.description     as "projectDescription",
             proj."estimatedTime" as "projectEstimatedTime",
             proj.repository      as "projectRepository",
             proj."startDate"     as "projectStartDate",
             proj."endDate"       as "projectEndDate",
             proj."developerId"   as "developerId",
             proj_tech."addedIn"  as "addedIn",
             tech.id              as "technologyId",
             tech.name            as "technologyName"
      FROM projects proj
               LEFT JOIN
           projects_technologies proj_tech ON proj."id" = proj_tech."projectId"
               LEFT JOIN technologies tech on proj_tech."techId" = tech.id
  `
  const queryConfig: QueryConfig = {
    text: queryString
  }
  const { rows }: ProjectsTechResult = await cliente.query(queryConfig)

  return response.status(200).json(rows)
}

export const listProjects = async (request: Request, response: Response): Promise<Response> => {

  const projectsId: number = parseInt(request.params.id)

  const queryString: string = `
      SELECT
             proj.id              as "projectID",
             proj.name            as "projectName",
             proj.description     as "projectDescription",
             proj."estimatedTime" as "projectEstimatedTime",
             proj.repository      as "projectRepository",
             proj."startDate"     as "projectStartDate",
             proj."endDate"       as "projectEndDate",
             proj."developerId"   as "developerId",
             proj_tech."addedIn"  as "addedIn",
             tech.id              as "technologyId",
             tech.name            as "technologyName"
      FROM projects proj
               LEFT JOIN
           projects_technologies proj_tech ON proj."id" = proj_tech."projectId"
               LEFT JOIN technologies tech on proj_tech."techId" = tech.id
      WHERE proj.id = $1;

  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectsId]
  }
  const queryResult: ProjectsTechResult = await cliente.query(queryConfig)

  return response.status(200).json(queryResult.rows)
}

export const updateProject = async (request: Request, response: Response): Promise<Response> => {

  const newProjectsData: IProjects = request.body;

  const idProjects: number = parseInt(request.params.id);

  const getProjectsQuery = `
      SELECT *
      FROM projects
      WHERE id = $1`;

  const projectsResponse = await cliente.query(getProjectsQuery, [idProjects]);
  const projects = projectsResponse.rows[0];

  const valuesProjects: IProjectsRequest = { ...projects, ...newProjectsData };

  const queryString: string = `
      UPDATE projects
      SET name            = $1,
          description     = $2,
          "estimatedTime" = $3,
          repository      = $4,
          "startDate"     = $5,
          "endDate"       = $6,
          "developerId"   = $7
      WHERE id = $8 RETURNING *;

  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [valuesProjects.name, valuesProjects.description, valuesProjects.estimatedTime, valuesProjects.repository, valuesProjects.startDate, valuesProjects.endDate, valuesProjects.developerId, idProjects]
  }
  const { rows } = await cliente.query(queryConfig)

  return response.status(200).json(rows[0])

}

export const deleteProjects = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const idDeleteDeveloper: string = request.params.id
  const queryString: string = `
      DELETE
      FROM projects
      WHERE "developerId" = $1
  `
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [idDeleteDeveloper]
  }

  await cliente.query(queryConfig)

  return response.status(204).json();
}

export const deleteTechnologyByName = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const projectId: string = request.params.id
  const technologyName: string = request.params.name;

  const queryGetTechnologyId: string = `
      SELECT *
      FROM technologies
      WHERE name = $1 LIMIT 1
  `

  const queryConfig: QueryConfig = {
    text: queryGetTechnologyId,
    values: [technologyName]
  }

  const { rows: technology } = await cliente.query(queryConfig);

  const queryRemoveTechnologyProjectMapping: string = `
      DELETE
      FROM projects_technologies
      WHERE "projectId" = $1
        and "techId" = $2
  `

  const queryConfigRemoveTechnologyProject: QueryConfig = {
    text: queryRemoveTechnologyProjectMapping,
    values: [projectId, technology[0].id]
  }

  await cliente.query(queryConfigRemoveTechnologyProject);

  return response.status(204).json();
}

export const createProjectTechnology = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

  const idProject: string = request.params.id

  const queryString: string = `
      INSERT INTO technologies (name)
      VALUES ($1) ON CONFLICT("name") DO
      UPDATE SET
          name=EXCLUDED.name
          RETURNING *;
  `

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [request.body.name]
  }

  const { rows: technology } = await cliente.query(queryConfig)

  const queryMappingProjectTechnology = `
      INSERT INTO projects_technologies ("projectId", "techId", "addedIn")
      VALUES ($1, $2, now()) ON CONFLICT DO NOTHING;
  `

  const queryMappingConfig: QueryConfig = {
    text: queryMappingProjectTechnology,
    values: [idProject, technology[0].id]
  }

  await cliente.query(queryMappingConfig)

  const queryResponseString: string = `
      SELECT proj.id              as "projectID",
             proj.name            as "projectName",
             proj.description     as "projectDescription",
             proj."estimatedTime" as "projectEstimatedTime",
             proj.repository      as "projectRepository",
             proj."startDate"     as "projectStartDate",
             proj."endDate"       as "projectEndDate",
             proj."developerId"   as "developerId",
             proj_tech."addedIn"  as "addedIn",
             tech.id              as "technologyId",
             tech.name            as "technologyName"
      FROM projects proj
               LEFT JOIN
           projects_technologies proj_tech ON proj."id" = proj_tech."projectId"
               LEFT JOIN technologies tech on proj_tech."techId" = tech.id
      WHERE proj.id = $1
        and tech.id = $2;
  `;

  const queryResponseMappingConfig: QueryConfig = {
    text: queryResponseString,
    values: [idProject, technology[0].id]
  }

  const { rows } = await cliente.query(queryResponseMappingConfig)

  return response.status(201).json(rows[0]);
}
