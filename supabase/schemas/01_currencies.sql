create table if not exists "currencies" (
    id serial primary key,
    entity varchar(100) not null,
    currency varchar(100) not null,
    code varchar(10) not null,
    numeric varchar(10),
    minor_unit varchar(10),
    withdrawal_date varchar(50)
);

create index currencies_code_idx on public.currencies (code);

create policy "Users can only read the currencies" on public.currencies
    for select
    using (true);