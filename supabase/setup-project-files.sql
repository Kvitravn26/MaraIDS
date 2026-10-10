create table if not exists public.client_project_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  client_name text not null,
  client_email text not null,
  status text not null default 'PENDING_APPROVAL',
  area numeric not null,
  property_type text not null,
  description text not null default '',
  designer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  files jsonb not null default '[]'::jsonb,
  versions jsonb not null default '[]'::jsonb,
  constraint client_project_requests_status_check check (
    status in ('PENDING_APPROVAL', 'AWAITING_DESIGNER', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'AWAITING_PAYMENT')
  )
);

alter table public.client_project_requests enable row level security;
grant select, insert, update on public.client_project_requests to authenticated;

drop policy if exists "Clients and admins read project requests" on public.client_project_requests;
create policy "Clients and admins read project requests"
on public.client_project_requests
for select
to authenticated
using (
  client_id = auth.uid()
  or designer_id = auth.uid()
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create table if not exists public.client_project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_project_requests(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint client_project_messages_content_check check (
    length(trim(body)) > 0 or jsonb_array_length(attachments) > 0
  )
);

alter table public.client_project_messages enable row level security;
grant select, insert on public.client_project_messages to authenticated;

drop policy if exists "Project participants read messages" on public.client_project_messages;
create policy "Project participants read messages"
on public.client_project_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.client_project_requests
    where id = project_id
      and (
        client_id = auth.uid()
        or designer_id = auth.uid()
        or exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
      )
  )
);

drop policy if exists "Project participants send messages" on public.client_project_messages;
create policy "Project participants send messages"
on public.client_project_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and (
    length(trim(body)) > 0
    or jsonb_array_length(attachments) > 0
  )
  and exists (
    select 1
    from public.client_project_requests
    where id = project_id
      and (
        client_id = auth.uid()
        or designer_id = auth.uid()
        or exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
      )
  )
);

drop policy if exists "Clients create own pending project requests" on public.client_project_requests;
create policy "Clients create own pending project requests"
on public.client_project_requests
for insert
to authenticated
with check (
  client_id = auth.uid()
  and client_email = (select auth.jwt() ->> 'email')
  and status = 'PENDING_APPROVAL'
);

drop policy if exists "Admins update project requests" on public.client_project_requests;
create policy "Admins update project requests"
on public.client_project_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 52428800)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Project owners upload their files" on storage.objects;
create policy "Project owners upload their files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Project owners delete their files" on storage.objects;
create policy "Project owners delete their files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Project owners and admins read project files" on storage.objects;
create policy "Project owners and admins read project files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-files'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
    or exists (
      select 1
      from public.client_project_requests
      where id::text = (storage.foldername(name))[2]
        and (client_id = auth.uid() or designer_id = auth.uid())
    )
  )
);
