-- !Ups

create table if not exists UserProfile (
  id bigint primary key,
  email varchar,
  password varchar,
  firstname varchar,
  lastname varchar,
  unique (email)
);
