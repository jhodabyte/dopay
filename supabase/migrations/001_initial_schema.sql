-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles: mirrors auth.users, populated via trigger
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- trigger to create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- tenants
create table if not exists tenants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists tenants_owner_id_idx on tenants(owner_id);

alter table tenants enable row level security;

create policy "Owners can manage own tenants"
  on tenants for all
  using (auth.uid() = owner_id);

-- properties
create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  address text not null,
  city text not null default 'Bogotá',
  type text not null check (type in ('apartment', 'house', 'commercial', 'warehouse')),
  monthly_rent numeric(14, 2) not null default 0,
  contract_start date not null,
  contract_end date not null,
  status text not null default 'vacant' check (status in ('active', 'vacant', 'overdue')),
  tenant_id uuid references tenants(id) on delete set null,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists properties_owner_id_idx on properties(owner_id);
create index if not exists properties_tenant_id_idx on properties(tenant_id);

alter table properties enable row level security;

create policy "Owners can manage own properties"
  on properties for all
  using (auth.uid() = owner_id);

-- payments
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  concept text not null check (concept in ('rent', 'admin', 'utilities', 'other')),
  amount numeric(14, 2) not null default 0,
  due_date date not null,
  paid_date date,
  method text check (method in ('transfer', 'pse', 'cash', 'nequi', 'daviplata')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists payments_property_id_idx on payments(property_id);
create index if not exists payments_tenant_id_idx on payments(tenant_id);
create index if not exists payments_status_idx on payments(status);
create index if not exists payments_due_date_idx on payments(due_date);

alter table payments enable row level security;

create policy "Owners can manage payments for own properties"
  on payments for all
  using (
    exists (
      select 1 from properties
      where properties.id = payments.property_id
      and properties.owner_id = auth.uid()
    )
  );

-- subscriptions
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan text not null check (plan in ('basic', 'intermediate', 'premium')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual')),
  start_date date not null default current_date,
  trial_end_date date not null,
  status text not null default 'trial' check (status in ('active', 'trial', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);

alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- notification_settings
create table if not exists notification_settings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade unique,
  days_before integer not null default 3,
  channels text[] not null default array['email'],
  overdue_alert_enabled boolean not null default true,
  overdue_threshold_days integer not null default 5,
  message_template text,
  created_at timestamptz not null default now()
);

alter table notification_settings enable row level security;

create policy "Owners can manage own notification settings"
  on notification_settings for all
  using (auth.uid() = owner_id);

-- notification_logs
create table if not exists notification_logs (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  payment_id uuid references payments(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  sent_at timestamptz not null default now(),
  recipient text not null,
  success boolean not null default true
);

create index if not exists notification_logs_owner_id_idx on notification_logs(owner_id);
create index if not exists notification_logs_payment_id_idx on notification_logs(payment_id);

alter table notification_logs enable row level security;

create policy "Owners can view own notification logs"
  on notification_logs for select
  using (auth.uid() = owner_id);
