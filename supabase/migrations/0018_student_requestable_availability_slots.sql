create policy availability_slots_select_associated_student_requestable
  on public.availability_slots
  for select
  to authenticated
  using (
    status = 'available'
    and deleted_at is null
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'eleve'
    )
    and exists (
      select 1
      from public.student_coach_relationships
      where student_coach_relationships.student_id = (select auth.uid())
        and student_coach_relationships.coach_id = availability_slots.coach_id
        and student_coach_relationships.status = 'active'
    )
  );
