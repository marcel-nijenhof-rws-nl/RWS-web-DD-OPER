-- !Ups

create table if not exists Bookmark
(
    id              bigint primary key,
    gebruiker_email varchar references UserProfile(email)
);
