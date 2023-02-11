import { QueryResult } from 'pg';

export interface IDevelopersRequest {
  name: string
  email: string
}

export interface IDevelopers extends IDevelopersRequest {
  id: number
}

export interface IDevelopersInfoRequest {
  'developerSince': Date,
  'preferredOS': string
}

export interface IDevelopersInfo extends IDevelopersInfoRequest {
  id: number
}

export  type DevelopersInfos = IDevelopers & IDevelopersRequest

export type DevelopersInfosResult = QueryResult<DevelopersInfos>

export type DevelopersResult = QueryResult<IDevelopers>

export type DevelopersInfoResult = QueryResult<IDevelopersInfo>

export type DevelopersRequiredKeys = "name" | "email";

export type DevelopersInfoRequiredKeys = "developerSince" | "preferredOS";
