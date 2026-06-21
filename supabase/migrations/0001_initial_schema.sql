create schema if not exists extensions;

create extension if not exists pgcrypto with schema extensions;

comment on schema public is
  'NextPoint application schema. Domain tables, RLS policies, and database tests are added by feature stories.';
