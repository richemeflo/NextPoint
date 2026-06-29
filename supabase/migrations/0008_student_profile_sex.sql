create type public.student_sex as enum (
  'female',
  'male',
  'other',
  'not_specified'
);

alter table public.student_profiles
  add column sex public.student_sex not null default 'not_specified';

comment on column public.student_profiles.sex is
  'Student-provided sex value used for private coach filtering.';
