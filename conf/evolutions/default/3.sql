-- !Ups

alter table if exists Bookmark
    add column if not exists userprofile_id bigint references userprofile (id),
    add column if not exists location       varchar,
    add column if not exists quantity       varchar,
    add column if not exists aspectSet      varchar,
    add column if not exists interval       varchar,
    add column if not exists startTime      varchar,
    add column if not exists endTime        varchar;


alter table if exists bookmark
    drop column if exists gebruiker_email,
    drop column if exists userprofile_email;
