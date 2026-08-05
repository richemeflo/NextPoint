alter table public.student_history_events
  drop constraint student_history_events_description_check;

alter table public.student_history_events
  add constraint student_history_events_description_check check (
    description is null
    or char_length(trim(description)) between 1 and 500
  );
