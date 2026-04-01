create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  contact_channel text check (contact_channel in ('email', 'phone', 'whatsapp', 'linkedin', 'other')),
  status text not null default 'new' check (status in ('new', 'contacted', 'in_conversation', 'proposal_sent', 'won', 'lost')),
  notes text,
  next_action text,
  follow_up_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  type text not null check (type in ('follow_up', 'summary', 'next_action')),
  prompt_context text,
  output text not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.ai_generations enable row level security;

create policy "users can read own leads"
  on public.leads
  for select
  using (auth.uid() = user_id);

create policy "users can insert own leads"
  on public.leads
  for insert
  with check (auth.uid() = user_id);

create policy "users can update own leads"
  on public.leads
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own leads"
  on public.leads
  for delete
  using (auth.uid() = user_id);

create policy "users can read own ai_generations"
  on public.ai_generations
  for select
  using (auth.uid() = user_id);

create policy "users can insert own ai_generations"
  on public.ai_generations
  for insert
  with check (auth.uid() = user_id);
