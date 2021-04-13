-- !Ups

create table if not exists BookmarkGroup
(
    id             bigint primary key not null unique,
    userprofile_id bigint references userprofile (id),
    name           varchar
);

alter table if exists bookmark
    drop column if exists starttime,
    drop column if exists endtime,
    drop column if exists name,
    drop column if exists userprofile_id,
    add column if not exists bookmarkgroup_id bigint references BookmarkGroup (id);
