-- PMS leaderboard ingestion — time series, not snapshots.
-- Sources: APMI (strategy returns) + SEBI PMR (AUM, clients, flows, returns).
--
-- UNITS, fixed and global (see unit_note): all *_cr are INR crore; all ret_* are
-- percent; ret_1m/3m/6m are CUMULATIVE over the window; ret_1y and longer are
-- ANNUALISED (CAGR); ret_si is annualised since inception. Never mix them.

create extension if not exists btree_gist;

create schema if not exists pms;
set search_path to pms, public;

-- ---------------------------------------------------------------- dimensions

create table if not exists manager (
    manager_id      bigserial primary key,
    sebi_reg_no     text unique,                 -- INP000009959
    name            text not null,
    registered_on   date,
    principal_officer   text,
    compliance_officer  text,
    address         text,
    first_seen      date not null,
    last_seen       date not null
);

-- Aliases are VALIDITY-WINDOWED, not global. A name that resolved to one manager
-- in 2023 can resolve elsewhere after a business transfer / APRN change, so the
-- window is part of the key and lookups must pass the reporting month.
create table if not exists manager_alias (
    alias_id        bigserial primary key,
    manager_id      bigint not null references manager(manager_id) on delete cascade,
    source          text not null check (source in ('apmi','sebi')),
    source_key      text,
    name_raw        text not null,
    name_norm       text not null,
    valid_from      date not null,
    valid_to        date,                        -- null = still current
    match_method    text not null
                        check (match_method in ('exact','norm','fuzzy','manual')),
    match_score     numeric(5,4) not null default 1.0,
    confirmed       boolean not null default false,
    constraint manager_alias_window check (valid_to is null or valid_to > valid_from),
    -- One source-name maps to at most one manager at any instant.
    exclude using gist (source with =, name_norm with =,
                        daterange(valid_from, valid_to, '[)') with &&)
);

-- An investment approach. This is the real unit of analysis; it churns far more
-- than the manager does, which is why it gets the same provenance treatment.
create table if not exists approach (
    approach_id     bigserial primary key,
    manager_id      bigint not null references manager(manager_id) on delete cascade,
    name            text not null,
    name_norm       text not null,
    inception       date,
    first_seen      date not null,
    last_seen       date not null,
    -- Lifecycle: 'closed' is only ever set from evidence, never from absence.
    -- 'dormant' = still filed but zero AUM; 'missing' = absent from a snapshot in
    -- which its manager DID file (the only case where absence means anything).
    status          text not null default 'active'
                        check (status in ('active','dormant','missing','closed')),
    status_since    date,
    missing_streak  int not null default 0
);
-- Deliberately NOT unique on name alone: "Abakkus All Cap Approach" and
-- "Abakkus All Cap Approach - 2" are distinct products (Rs 7,775 Cr vs Rs 0).
create unique index if not exists ux_approach_ident
    on approach (manager_id, name_norm);
-- Lets approach_alias carry manager_id with a composite FK, so the denormalised
-- manager_id can never disagree with the approach it points at.
alter table approach drop constraint if exists ux_approach_id_mgr;
alter table approach add constraint ux_approach_id_mgr unique (approach_id, manager_id);

create table if not exists approach_alias (
    alias_id        bigserial primary key,
    approach_id     bigint not null references approach(approach_id) on delete cascade,
    -- Denormalised ONLY to scope the exclusion constraint below. Approach names
    -- are unique within a manager, never globally: three unrelated firms each
    -- file an approach called "GROWTH".
    manager_id      bigint not null,
    source          text not null check (source in ('apmi','sebi')),
    source_key      text,
    name_raw        text not null,
    name_norm       text not null,
    valid_from      date not null,
    valid_to        date,
    match_method    text not null
                        check (match_method in ('exact','norm','fuzzy','manual')),
    match_score     numeric(5,4) not null default 1.0,
    confirmed       boolean not null default false,
    constraint approach_alias_window check (valid_to is null or valid_to > valid_from),
    foreign key (approach_id, manager_id)
        references approach (approach_id, manager_id) on delete cascade,
    -- One source-name maps to at most one approach PER MANAGER at any instant.
    exclude using gist (source with =, manager_id with =, name_norm with =,
                        daterange(valid_from, valid_to, '[)') with &&)
);
create index if not exists ix_approach_alias_lookup
    on approach_alias (source, manager_id, name_norm, valid_from);

-- Two different approaches whose names collapsed to the same norm in one snapshot.
-- A duplicate key is a PARSE ALARM, never a silent revision — park it here and
-- keep both rows out of the leaderboard until a human rules.
create table if not exists approach_collision (
    collision_id    bigserial primary key,
    as_on           date not null,
    source          text not null,
    manager_id      bigint references manager(manager_id),
    name_norm       text not null,
    name_variants   text[] not null,
    row_payloads    jsonb not null,
    resolved        boolean not null default false,
    resolution      text,
    observed_at     timestamptz not null default now()
);

-- ------------------------------------------------- tagging as a dated dimension

-- Strategy / service type / benchmark are MUTABLE, and SEBI treats a re-tag as
-- invalidating the prior track record. So tagging is slowly-changing, and a
-- change is a track-record break the UI must render, not a silent attribute edit.
create table if not exists approach_tagging (
    tagging_id      bigserial primary key,
    approach_id     bigint not null references approach(approach_id) on delete cascade,
    asset_class     text check (asset_class in ('Equity','Debt','Hybrid','Multi Asset')),
    service_type    text check (service_type in ('D','N')),  -- Discretionary / Non-disc.
    benchmark       text,
    benchmark_norm  text,                        -- 'BSE500TRI' (SEBI) = 'BSE 500 TRI' (APMI)
    valid_from      date not null,
    valid_to        date,
    -- True when this change breaks comparability with the prior window.
    is_track_break  boolean not null default false,
    break_reason    text,
    observed_run_id bigint,
    constraint approach_tagging_window check (valid_to is null or valid_to > valid_from),
    -- An approach has exactly one tagging in force at a time.
    exclude using gist (approach_id with =,
                        daterange(valid_from, valid_to, '[)') with &&)
);
create index if not exists ix_tagging_current on approach_tagging (approach_id, valid_from desc);

-- ------------------------------------------------------------------- lineage

create table if not exists ingest_run (
    run_id          bigserial primary key,
    source          text not null check (source in ('apmi','sebi')),
    as_on           date not null,               -- last calendar day of reported month
    params          jsonb not null default '{}',
    started_at      timestamptz not null default now(),
    finished_at     timestamptz,
    status          text not null default 'running'
                        check (status in ('running','ok','partial','failed')),
    http_status     int,
    rows_parsed     int,
    rows_changed    int,
    raw_path        text,
    raw_sha256      text,
    -- Parse-time assertions: column count, canary row, header text. Loud failure.
    assertions      jsonb not null default '{}',
    error           text
);
create index if not exists ix_ingest_run_src_month on ingest_run (source, as_on desc);

-- ---------------------------------------------------------------- APMI facts

-- ret_* are percent; null means "no history" (APMI 'NA', or SEBI 0-with-0-benchmark).
create table if not exists apmi_performance (
    as_on           date not null,
    approach_id     bigint not null references approach(approach_id),
    aum_cr          numeric(16,2),
    ret_1m numeric(9,4), ret_3m numeric(9,4), ret_6m numeric(9,4),
    ret_1y numeric(9,4), ret_2y numeric(9,4), ret_3y numeric(9,4), ret_4y numeric(9,4),
    ret_5y numeric(9,4), ret_si numeric(9,4),
    run_id          bigint not null references ingest_run(run_id),
    first_ingested  timestamptz not null default now(),
    last_ingested   timestamptz not null default now(),
    primary key (as_on, approach_id)
);
create index if not exists ix_apmi_perf_approach on apmi_performance (approach_id, as_on desc);

-- Benchmarks as their own monthly series. Captured from the benchmark rows that
-- sit beside every approach, and the ONLY way to tell SEBI's 0-as-null apart from
-- a real zero: if the benchmark is also 0 for that window, there is no history.
create table if not exists benchmark_return (
    as_on           date not null,
    benchmark_norm  text not null,
    benchmark_raw   text not null,
    source          text not null check (source in ('apmi','sebi')),
    ret_1m numeric(9,4), ret_3m numeric(9,4), ret_6m numeric(9,4),
    ret_1y numeric(9,4), ret_2y numeric(9,4), ret_3y numeric(9,4), ret_4y numeric(9,4),
    ret_5y numeric(9,4), ret_si numeric(9,4),
    run_id          bigint not null references ingest_run(run_id),
    primary key (as_on, benchmark_norm, source)
);

-- ---------------------------------------------------------------- SEBI facts

create table if not exists sebi_manager_monthly (
    as_on               date not null,
    manager_id          bigint not null references manager(manager_id),
    clients_total int, clients_pf_epfo int, clients_corp int, clients_noncorp int,
    clients_nri int, clients_fpi int, clients_other int,
    aum_cr_total numeric(16,2), aum_cr_pf_epfo numeric(16,2), aum_cr_corp numeric(16,2),
    aum_cr_noncorp numeric(16,2), aum_cr_nri numeric(16,2), aum_cr_fpi numeric(16,2),
    aum_cr_other numeric(16,2),
    aum_cr_discretionary numeric(16,2), aum_cr_non_discretionary numeric(16,2),
    aum_cr_advisory numeric(16,2), aum_cr_co_investment numeric(16,2),
    offers_discretionary boolean, offers_non_discretionary boolean,
    offers_advisory boolean, offers_co_investment boolean,
    sales_cr numeric(16,2), purchase_cr numeric(16,2), turnover_ratio_1m numeric(9,4),
    complaints_open int, complaints_received int,
    complaints_resolved int, complaints_pending int,
    run_id          bigint not null references ingest_run(run_id),
    first_ingested  timestamptz not null default now(),
    last_ingested   timestamptz not null default now(),
    primary key (as_on, manager_id)
);

-- Per-approach AUM, flows AND returns — all three from one filing, so the
-- flow-vs-returns signal needs no cross-source join.
create table if not exists sebi_approach_monthly (
    as_on           date not null,
    approach_id     bigint not null references approach(approach_id),
    aum_cr          numeric(16,2),
    aum_cr_equity_listed numeric(16,2), aum_cr_equity_unlisted numeric(16,2),
    aum_cr_debt_plain numeric(16,2), aum_cr_debt_structured numeric(16,2),
    aum_cr_derivatives numeric(16,2), aum_cr_mutual_funds numeric(16,2),
    aum_cr_others numeric(16,2),
    inflow_cr numeric(16,2), outflow_cr numeric(16,2), net_flow_cr numeric(16,2),
    inflow_fytd_cr numeric(16,2), outflow_fytd_cr numeric(16,2),
    net_flow_fytd_cr numeric(16,2),
    ret_1m numeric(9,4), ret_3m numeric(9,4), ret_6m numeric(9,4), ret_1y numeric(9,4),
    ret_2y numeric(9,4), ret_3y numeric(9,4), ret_4y numeric(9,4), ret_5y numeric(9,4),
    ret_si numeric(9,4),
    benchmark_norm  text,
    turnover_1m numeric(9,4), turnover_1y numeric(9,4),
    -- Set when AUM is 0 and every return equals its benchmark's 0: report-but-dead.
    is_dormant      boolean not null default false,
    run_id          bigint not null references ingest_run(run_id),
    first_ingested  timestamptz not null default now(),
    last_ingested   timestamptz not null default now(),
    primary key (as_on, approach_id)
);
create index if not exists ix_sebi_appr_flows
    on sebi_approach_monthly (as_on, net_flow_cr desc) where not is_dormant;

-- --------------------------------------------------------------- restatements

create table if not exists fact_revision (
    revision_id     bigserial primary key,
    table_name      text not null,
    as_on           date not null,
    entity_id       bigint not null,
    column_name     text not null,
    old_value       text,
    new_value       text,
    old_run_id      bigint references ingest_run(run_id),
    new_run_id      bigint references ingest_run(run_id),
    observed_at     timestamptz not null default now()
);
create index if not exists ix_fact_revision_lookup
    on fact_revision (table_name, as_on, entity_id);

-- ------------------------------------------------------------ publish gating

-- Minimum match confidence for a cross-source (APMI<->SEBI) reconciliation to be
-- shown. Below this we show nothing rather than a wrong join.
create table if not exists publish_rule (
    rule            text primary key,
    threshold       numeric(5,4) not null,
    note            text
);
insert into publish_rule (rule, threshold, note) values
    ('xsource_match_min', 0.9500,
     'Below this an APMI<->SEBI approach match is unconfirmed: suppress the reconciliation, never guess.'),
    ('flow_signal_min_aum_cr', 1.0000,
     'Do not emit a flow signal for approaches below this AUM; percentage flows on tiny books are noise.')
on conflict (rule) do nothing;

comment on schema pms is
  'All *_cr are INR crore. ret_1m/3m/6m are cumulative; ret_1y and longer are annualised (CAGR). Null return = no history; never coerce to zero.';
