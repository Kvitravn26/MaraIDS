-- =========================================================
-- MARA DESIGN STUDIO: FINANCES, INVOICES & MILESTONES SCHEMA
-- =========================================================

-- 1. Таблиця invoices (Рахунки-фактури)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_project_requests(id) on delete cascade,
  invoice_number text not null unique,
  client_id uuid not null references auth.users(id) on delete cascade,
  currency text not null default 'USD' check (currency in ('UAH', 'USD', 'EUR')),
  total_amount numeric not null,
  paid_amount numeric not null default 0,
  payment_model text not null default 'FULL' check (payment_model in ('FULL', 'ADVANCE_50_50', 'MILESTONES')),
  status text not null default 'UNPAID' check (status in ('UNPAID', 'PARTIALLY_PAID', 'PAID')),
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Таблиця milestones (Етапи для поетапної оплати)
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  title text not null,
  amount numeric not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID')),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Row Level Security (RLS)
alter table public.invoices enable row level security;
alter table public.milestones enable row level security;

grant select, insert, update, delete on public.invoices to authenticated;
grant select, insert, update, delete on public.milestones to authenticated;

-- Policies for invoices
drop policy if exists "Invoices select policy" on public.invoices;
create policy "Invoices select policy"
on public.invoices for select to authenticated
using (
  client_id = auth.uid()
  or exists (
    select 1 from public.client_project_requests
    where id = project_id and (client_id = auth.uid() or designer_id = auth.uid())
  )
  or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "Invoices insert/update policy" on public.invoices;
create policy "Invoices insert/update policy"
on public.invoices for all to authenticated
using (
  client_id = auth.uid()
  or exists (
    select 1 from public.client_project_requests
    where id = project_id and (client_id = auth.uid() or designer_id = auth.uid())
  )
  or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
)
with check (
  client_id = auth.uid()
  or exists (
    select 1 from public.client_project_requests
    where id = project_id and (client_id = auth.uid() or designer_id = auth.uid())
  )
  or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
);

-- Policies for milestones
drop policy if exists "Milestones all policy" on public.milestones;
create policy "Milestones all policy"
on public.milestones for all to authenticated
using (
  exists (
    select 1 from public.invoices
    where invoices.id = invoice_id
    and (
      invoices.client_id = auth.uid()
      or exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
      )
      or exists (
        select 1 from public.client_project_requests
        where id = invoices.project_id and (client_id = auth.uid() or designer_id = auth.uid())
      )
    )
  )
)
with check (
  exists (
    select 1 from public.invoices
    where invoices.id = invoice_id
    and (
      invoices.client_id = auth.uid()
      or exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
      )
      or exists (
        select 1 from public.client_project_requests
        where id = invoices.project_id and (client_id = auth.uid() or designer_id = auth.uid())
      )
    )
  )
);
