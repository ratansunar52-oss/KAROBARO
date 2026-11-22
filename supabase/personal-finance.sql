-- HamroKarobar Personal Finance only
-- Run this file once in Supabase SQL Editor. No Business Management tables are touched.
create extension if not exists pgcrypto;

create table if not exists public.personal_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null default 'cash' check (account_type in ('cash','bank','esewa','khalti','wallet','custom')),
  opening_balance numeric(14,2) not null default 0,
  is_savings boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.personal_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.personal_accounts(id) on delete restrict,
  kind text not null check (kind in ('income','expense','transfer_in','transfer_out','loan_principal_in','loan_principal_out','loan_interest_income','loan_interest_expense')),
  amount numeric(14,2) not null check (amount > 0),
  occurred_on date not null default current_date,
  category text not null default 'Other',
  description text not null,
  note text,
  transfer_id uuid,
  source_ref uuid,
  created_at timestamptz not null default now()
);
create unique index if not exists personal_transactions_source_ref_uq
  on public.personal_transactions(user_id, source_ref, kind) where source_ref is not null;
create index if not exists personal_transactions_user_date_idx
  on public.personal_transactions(user_id, occurred_on desc);
create index if not exists personal_transactions_user_account_idx
  on public.personal_transactions(user_id, account_id);

create table if not exists public.personal_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income','expense')),
  name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, kind, name)
);

create table if not exists public.personal_savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  goal_type text not null default 'general',
  target_amount numeric(14,2) not null check (target_amount > 0),
  saved_amount numeric(14,2) not null default 0 check (saved_amount >= 0),
  due_date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.personal_savings_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.personal_savings_goals(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  contributed_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.personal_loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_type text not null check (loan_type in ('borrowed','lent')),
  party_name text not null,
  principal numeric(14,2) not null check (principal > 0),
  interest_rate numeric(7,3) not null default 0,
  due_date date,
  account_id uuid not null references public.personal_accounts(id) on delete restrict,
  note text,
  created_at timestamptz not null default now()
);
create table if not exists public.personal_loan_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_id uuid not null references public.personal_loans(id) on delete cascade,
  account_id uuid not null references public.personal_accounts(id) on delete restrict,
  principal_amount numeric(14,2) not null default 0 check (principal_amount >= 0),
  interest_amount numeric(14,2) not null default 0 check (interest_amount >= 0),
  paid_on date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  check (principal_amount + interest_amount > 0)
);

-- Keep loan principal/interest movements in the same personal account ledger.
create or replace function public.hk_personal_loan_ledger_sync()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_type text;
  v_party text;
  v_account uuid;
  v_user uuid;
  v_principal numeric;
  v_interest numeric;
  v_date date;
  v_note text;
begin
  if tg_table_name = 'personal_loans' then
    if tg_op = 'DELETE' then
      delete from public.personal_transactions where user_id = old.user_id and source_ref = old.id;
      return old;
    end if;
    if tg_op = 'INSERT' then
      insert into public.personal_transactions(user_id,account_id,kind,amount,occurred_on,category,description,source_ref)
      values(new.user_id,new.account_id,
        case when new.loan_type='borrowed' then 'loan_principal_in' else 'loan_principal_out' end,
        new.principal,current_date,'Loan',case when new.loan_type='borrowed' then 'Money borrowed: ' else 'Money lent: ' end || new.party_name,new.id);
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    delete from public.personal_transactions where user_id=old.user_id and source_ref=old.id;
    return old;
  end if;

  select loan_type, party_name into v_type, v_party
    from public.personal_loans where id=new.loan_id and user_id=new.user_id;
  delete from public.personal_transactions where user_id=new.user_id and source_ref=new.id;
  if new.principal_amount > 0 then
    insert into public.personal_transactions(user_id,account_id,kind,amount,occurred_on,category,description,source_ref)
    values(new.user_id,new.account_id,
      case when v_type='borrowed' then 'loan_principal_out' else 'loan_principal_in' end,
      new.principal_amount,new.paid_on,'Loan repayment',
      case when v_type='borrowed' then 'Principal repaid: ' else 'Principal received: ' end || v_party,new.id);
  end if;
  if new.interest_amount > 0 then
    insert into public.personal_transactions(user_id,account_id,kind,amount,occurred_on,category,description,source_ref)
    values(new.user_id,new.account_id,
      case when v_type='borrowed' then 'loan_interest_expense' else 'loan_interest_income' end,
      new.interest_amount,new.paid_on,'Loan interest',
      case when v_type='borrowed' then 'Interest paid: ' else 'Interest received: ' end || v_party,new.id);
  end if;
  return new;
end $$;

drop trigger if exists hk_personal_loan_ledger on public.personal_loans;
create trigger hk_personal_loan_ledger
after insert or delete on public.personal_loans
for each row execute function public.hk_personal_loan_ledger_sync();

drop trigger if exists hk_personal_loan_payment_ledger on public.personal_loan_payments;
create trigger hk_personal_loan_payment_ledger
after insert or update or delete on public.personal_loan_payments
for each row execute function public.hk_personal_loan_ledger_sync();

-- Recalculate savings goal totals from contribution history.
create or replace function public.hk_personal_savings_total_sync()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_goal uuid; v_user uuid;
begin
  v_goal := case when tg_op='DELETE' then old.goal_id else new.goal_id end;
  v_user := case when tg_op='DELETE' then old.user_id else new.user_id end;
  update public.personal_savings_goals
    set saved_amount = coalesce((select sum(amount) from public.personal_savings_contributions where goal_id=v_goal and user_id=v_user),0),
        updated_at = now()
    where id=v_goal and user_id=v_user;
  if tg_op='DELETE' then return old; else return new; end if;
end $$;
drop trigger if exists hk_personal_savings_total on public.personal_savings_contributions;
create trigger hk_personal_savings_total
after insert or update or delete on public.personal_savings_contributions
for each row execute function public.hk_personal_savings_total_sync();

alter table public.personal_accounts enable row level security;
alter table public.personal_transactions enable row level security;
alter table public.personal_categories enable row level security;
alter table public.personal_savings_goals enable row level security;
alter table public.personal_savings_contributions enable row level security;
alter table public.personal_loans enable row level security;
alter table public.personal_loan_payments enable row level security;

do $$
declare t text;
begin
  foreach t in array array['personal_accounts','personal_transactions','personal_categories','personal_savings_goals','personal_savings_contributions','personal_loans','personal_loan_payments'] loop
    execute format('drop policy if exists %I on public.%I', t || '_own_rows', t);
    execute format('create policy %I on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_own_rows', t);
  end loop;
end $$;

grant select, insert, update, delete on public.personal_accounts to authenticated;
grant select, insert, update, delete on public.personal_transactions to authenticated;
grant select, insert, update, delete on public.personal_categories to authenticated;
grant select, insert, update, delete on public.personal_savings_goals to authenticated;
grant select, insert, update, delete on public.personal_savings_contributions to authenticated;
grant select, insert, update, delete on public.personal_loans to authenticated;
grant select, insert, update, delete on public.personal_loan_payments to authenticated;
