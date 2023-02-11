create type preferred_os as enum ('Windows', 'Linux', 'MacOS');

create table if not exists developers
(
    id    serial
    primary key,
    name  varchar(50) not null,
    email varchar(50) not null
    unique
    );

alter table developer_infos
drop constraint "developer_infos_developerId_fkey";

alter table developer_infos
    add foreign key ("developerId") references developers
        on delete cascade;




create table if not exists developer_infos
(
    id               serial
    primary key,
    "developerSince" date         not null,
    "preferredOS"    preferred_os not null,
    "developerId"    integer
    unique
    references developers
);

create table if not exists projects
(
    id              serial
    primary key,
    name            varchar(50)  not null,
    description     text         not null,
    "estimatedTime" varchar(20)  not null,
    repository      varchar(120) not null,
    "startDate"     date         not null,
    "endDate"       date
    );

create table if not exists technologies
(
    id   serial
    primary key,
    name varchar(30) not null
    );

create table if not exists projects_technologies
(
    id        serial
    primary key,
    "addedIn" date not null
);

