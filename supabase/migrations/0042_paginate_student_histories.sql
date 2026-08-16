drop index if exists public.idx_student_history_events_student_occurred;
create index idx_student_history_events_student_occurred
  on public.student_history_events (student_id, occurred_at desc, id desc);

create index idx_student_history_events_student_status_occurred
  on public.student_history_events (
    student_id,
    status,
    occurred_at desc,
    id desc
  );

drop index if exists public.idx_lesson_packs_student_created;
create index idx_lesson_packs_student_created
  on public.lesson_packs (student_id, created_at desc, id desc);
