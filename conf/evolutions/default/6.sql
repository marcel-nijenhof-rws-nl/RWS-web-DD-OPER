-- !Ups

alter table if exists userprofile
    add column if not exists databaseUrl varchar default 'https://ddapi.rws.nl';
