create or replace function public.delete_notification(p_notification_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_notification_id uuid;
begin
  delete from public.notifications
  where id = p_notification_id
    and recipient_id = auth.uid()
  returning id into deleted_notification_id;

  if deleted_notification_id is null then
    raise exception 'notification not found' using errcode = '42501';
  end if;

  return deleted_notification_id;
end;
$$;

revoke all on function public.delete_notification(uuid) from public;
grant execute on function public.delete_notification(uuid) to authenticated;
