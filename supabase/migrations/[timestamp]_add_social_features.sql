
-- Create likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  dare_id uuid references public.dares not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, dare_id)
);

-- Create comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  dare_id uuid references public.dares not null,
  parent_id uuid references public.comments,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reposts table
create table public.reposts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  dare_id uuid references public.dares not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, dare_id)
);

-- Add RLS policies
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.reposts enable row level security;

create policy "Users can insert their own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

create policy "Everyone can view likes"
  on public.likes for select
  using (true);

create policy "Users can insert their own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

create policy "Everyone can view comments"
  on public.comments for select
  using (true);

create policy "Users can insert their own reposts"
  on public.reposts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reposts"
  on public.reposts for delete
  using (auth.uid() = user_id);

create policy "Everyone can view reposts"
  on public.reposts for select
  using (true);
