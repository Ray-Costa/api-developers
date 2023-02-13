create type preferred_os as enum ('Windows', 'Linux', 'MacOS');

create type technologies_enum as enum ('JavaScript', 'Python', 'React', 'Express.js', 'HTML', 'CSS', 'Django', 'PostgreSQL', 'MongoDB');

create table if not exists developer_infos
(
    id               serial
        primary key,
    "developerSince" date         not null,
    "preferredOS"    preferred_os not null
);

create table if not exists developers
(
    id                serial
        primary key,
    name              varchar(50) not null,
    email             varchar(50) not null
        unique,
    "developerInfoId" integer references developer_infos on delete cascade
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
    "endDate"       date,
    "developerId"   integer references developers on update cascade on delete cascade
);

create table if not exists technologies
(
    id   serial
        primary key,
    name technologies_enum not null unique
);

create table if not exists projects_technologies
(
    "addedIn"   date    not null,
    "projectId" integer not null
        constraint projects_technologies_projects_id_fk
            references projects,
    "techId"    integer not null
        constraint projects_technologies_technologies_id_fk
            references technologies,
    PRIMARY KEY ("projectId", "techId")
);

