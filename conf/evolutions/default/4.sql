-- !Ups

alter table if exists Bookmark
    add column if not exists name varchar;
