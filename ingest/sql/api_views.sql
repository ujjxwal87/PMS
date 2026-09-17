-- Read models for the frontend. Views live in `public` because that is the only
-- schema Supabase's REST layer exposes by default; every one of them is a
-- read-only projection over `pms`, granted to anon.
--
-- Sharpe and max drawdown are NOT published by APMI or SEBI -- they are computed
-- here from the monthly ret_1m series. Upside/downside capture are absent on
-- purpose: they need a benchmark monthly series, and benchmark_return is empty.

set search_path to pms, public;

-- Risk-free rate for Sharpe, tunable without editing the view.
-- publish_rule.threshold is numeric(5,4), so it holds rates but not counts.
-- The minimum-months floor is inlined in the view below instead.
insert into pms.publish_rule (rule, threshold, note) values
    ('risk_free_annual_pct', 0.0650,
     'Annual risk-free rate used for Sharpe. ~Indian 10Y G-sec. Decimal, not percent.')
on conflict (rule) do nothing;

-- ---------------------------------------------------------------- monthly series

-- One clean monthly return series per approach, APMI-sourced. Rows where the
-- month is missing or the return is null are simply absent -- never zero-filled.
create or replace view public.v_approach_monthly as
select p.approach_id,
       p.as_on,
       p.aum_cr,
       p.ret_1m, p.ret_3m, p.ret_6m, p.ret_1y,
       p.ret_2y, p.ret_3y, p.ret_5y, p.ret_si
from pms.apmi_performance p;

-- ---------------------------------------------------------------- risk stats

-- Sharpe over the trailing 36 months and max drawdown over the whole series.
-- Monthly returns are compounded into a NAV path; drawdown is the worst fall
-- from a running peak. A month of exactly -100% would break ln(), so it is
-- excluded rather than allowed to null the whole approach.
create or replace view public.v_approach_stats as
with r as (
    select approach_id, as_on, ret_1m / 100.0 as r
    from pms.apmi_performance
    where ret_1m is not null and ret_1m > -100
),
latest as (select max(as_on) as hi from pms.apmi_performance),
nav as (
    select approach_id, as_on,
           exp(sum(ln(1 + r)) over (partition by approach_id order by as_on)) as nav
    from r
),
peak as (
    select approach_id, as_on, nav,
           max(nav) over (partition by approach_id order by as_on) as running_peak
    from nav
),
dd as (
    select approach_id, min(nav / running_peak - 1) as max_dd
    from peak
    group by approach_id
),
win as (
    select r.approach_id,
           count(*) as n_months,
           avg(r.r) as mu,
           stddev_samp(r.r) as sd
    from r, latest
    where r.as_on > (latest.hi - interval '36 months')
    group by r.approach_id
)
select w.approach_id,
       w.n_months,
       round((w.mu * 12 * 100)::numeric, 2) as ann_return_pct,
       round((w.sd * sqrt(12) * 100)::numeric, 2) as ann_vol_pct,
       -- Under 24 monthly observations a Sharpe is noise, so it is withheld.
       case when w.sd > 0 and w.n_months >= 24
            then round((((w.mu * 12) - (select threshold from pms.publish_rule
                                        where rule = 'risk_free_annual_pct'))
                        / (w.sd * sqrt(12)))::numeric, 2)
       end as sharpe_3y,
       round((d.max_dd * 100)::numeric, 2) as max_dd_pct
from win w
left join dd d on d.approach_id = w.approach_id;

-- ---------------------------------------------------------------- leaderboard

-- One row per approach at its most recent reported month. `as_on` is exposed so
-- the UI can show a stale approach as stale rather than as current.
-- One display spelling per index. SEBI filings write the same benchmark four
-- ways ("BSE 500 - TRI", "BSE 500 TRI", "BSE500(TRI)", "BSE500TRI"), and
-- benchmark_norm already collapses those for matching -- but the UI renders the
-- raw string, so the same index appears several ways on one screen. The label
-- is the most common spelling actually filed, tie-broken toward the shortest,
-- rather than a hand-kept lookup that would drift from the data.
create or replace view public.v_benchmark_label as
select distinct on (benchmark_norm)
       benchmark_norm,
       benchmark as label
from pms.approach_tagging
where benchmark_norm is not null and benchmark is not null
group by benchmark_norm, benchmark
order by benchmark_norm, count(*) desc, length(benchmark), benchmark;

-- The index's own return for each window, latest month SEBI has filed.
-- Sourced from the benchmark rows beside every approach in a SEBI filing.
-- ret_si is absent by design: for a benchmark SEBI computes it from the
-- APPROACH's inception, so it is not a property of the index.
create or replace view public.v_benchmark_return as
select distinct on (benchmark_norm)
       benchmark_norm, benchmark_raw, as_on as bench_as_on,
       ret_1m as bench_ret_1m, ret_1y as bench_ret_1y,
       ret_3y as bench_ret_3y, ret_5y as bench_ret_5y
from pms.benchmark_return
order by benchmark_norm, as_on desc;

-- MATERIALIZED, not a plain view. Computed live it costs ~5s for a filtered
-- leaderboard query -- the planner re-derives the window functions in
-- v_approach_stats per candidate row -- and Supabase cancels an anon statement
-- long before that. Refreshed at the end of a backfill (cli: refresh-views).
-- Dropped in both forms so this file stays re-runnable when columns change.
drop materialized view if exists public.v_strategy cascade;
drop view if exists public.v_strategy cascade;
create materialized view public.v_strategy as
with last_perf as (
    select distinct on (approach_id)
           approach_id, as_on, aum_cr, ret_1m, ret_3m, ret_6m,
           ret_1y, ret_2y, ret_3y, ret_5y, ret_si
    from pms.apmi_performance
    order by approach_id, as_on desc
),
tag as (
    select distinct on (approach_id)
           approach_id, asset_class, service_type, benchmark, benchmark_norm, is_track_break
    from pms.approach_tagging
    order by approach_id, valid_from desc
)
select a.approach_id,
       a.name              as strategy,
       a.status,
       a.inception,
       m.manager_id,
       m.name              as firm,
       m.sebi_reg_no,
       m.website_domain,
       t.asset_class,
       t.service_type,
       t.benchmark,
       coalesce(bl.label, t.benchmark) as benchmark_label,
       t.benchmark_norm,
       t.is_track_break,
       lp.as_on,
       lp.aum_cr,
       lp.ret_1m, lp.ret_3m, lp.ret_6m, lp.ret_1y, lp.ret_2y, lp.ret_3y, lp.ret_5y, lp.ret_si,
       s.sharpe_3y,
       s.max_dd_pct,
       s.ann_vol_pct,
       s.n_months,
       br.bench_as_on,
       br.bench_ret_1y,
       br.bench_ret_3y,
       br.bench_ret_5y,
       -- Excess return over the benchmark, in percentage points. Only where
       -- both sides exist: a strategy with no matched index shows nothing
       -- rather than an excess computed against zero.
       case when lp.ret_1y is not null and br.bench_ret_1y is not null
            then round(lp.ret_1y - br.bench_ret_1y, 2) end as excess_1y,
       case when lp.ret_3y is not null and br.bench_ret_3y is not null
            then round(lp.ret_3y - br.bench_ret_3y, 2) end as excess_3y,
       case when lp.ret_5y is not null and br.bench_ret_5y is not null
            then round(lp.ret_5y - br.bench_ret_5y, 2) end as excess_5y
from pms.approach a
join pms.manager m using (manager_id)
join last_perf lp on lp.approach_id = a.approach_id
left join tag t on t.approach_id = a.approach_id
left join public.v_approach_stats s on s.approach_id = a.approach_id
left join public.v_benchmark_label bl on bl.benchmark_norm = t.benchmark_norm
left join public.v_benchmark_return br on br.benchmark_norm = t.benchmark_norm;

create unique index if not exists ux_v_strategy_approach on public.v_strategy (approach_id);
create index if not exists ix_v_strategy_month on public.v_strategy (as_on desc);
create index if not exists ix_v_strategy_screen on public.v_strategy (as_on, asset_class, aum_cr desc);
create index if not exists ix_v_strategy_firm on public.v_strategy (firm);

-- ---------------------------------------------------------------- managers

-- Firm-level, asset-weighted -- the /managers screen ranks on the whole book,
-- not the flagship. A firm's Sharpe is weighted by each approach's AUM, so a
-- tiny stellar book cannot carry a large mediocre one. SEBI columns are null
-- for any manager whose months are not yet backfilled.
drop view if exists public.v_manager cascade;
create or replace view public.v_manager as
with last_sebi as (
    select distinct on (manager_id) *
    from pms.sebi_manager_monthly
    order by manager_id, as_on desc
),
agg as (
    select manager_id,
           count(*)                                          as n_strategies,
           count(*) filter (where sharpe_3y is not null)      as n_rated,
           sum(aum_cr)                                        as aum_cr_approaches,
           max(as_on)                                         as apmi_as_on,
           -- Asset-weighted, and only over rows that have both the metric and a
           -- weight: a null AUM must not silently count as zero weight on one
           -- metric and full weight on another.
           sum(ret_3y * aum_cr) filter (where ret_3y is not null and aum_cr > 0)
             / nullif(sum(aum_cr) filter (where ret_3y is not null and aum_cr > 0), 0)  as aw_ret_3y,
           sum(sharpe_3y * aum_cr) filter (where sharpe_3y is not null and aum_cr > 0)
             / nullif(sum(aum_cr) filter (where sharpe_3y is not null and aum_cr > 0), 0) as aw_sharpe,
           min(max_dd_pct)                                    as worst_dd_pct
    from public.v_strategy
    group by manager_id
)
select m.manager_id,
       m.name as firm,
       m.sebi_reg_no,
       m.website_domain,
       m.registered_on,
       m.principal_officer,
       m.compliance_officer,
       m.address,
       s.as_on                as sebi_as_on,
       s.clients_total,
       s.aum_cr_total,
       s.aum_cr_discretionary,
       s.aum_cr_non_discretionary,
       s.aum_cr_advisory,
       s.offers_discretionary,
       s.offers_non_discretionary,
       s.offers_advisory,
       s.clients_corp, s.clients_noncorp, s.clients_nri, s.clients_fpi,
       s.clients_pf_epfo,
       s.aum_cr_pf_epfo,
       -- The number this marketplace actually cares about. EPFO and PF mandates
       -- are filed as discretionary PMS and legally are -- but they dwarf
       -- everything else (SBI: 11.4 of 12.9 lakh crore; HDFC: 6.78 of 6.85) and
       -- they are not a book an HNI investor can buy into. Ranking on the gross
       -- total just sorts firms by how much retirement money they administer.
       -- Null, not zero, when the firm has no SEBI filing loaded: "not known"
       -- and "runs nothing" are different claims and must not render alike.
       case when s.aum_cr_total is null then null
            else s.aum_cr_total - coalesce(s.aum_cr_pf_epfo, 0) end as aum_cr_ex_epfo,
       s.complaints_received, s.complaints_resolved, s.complaints_pending,
       s.turnover_ratio_1m,
       a.n_strategies,
       a.n_rated,
       a.apmi_as_on,
       -- SEBI's own total is the better number where it exists; the sum over
       -- APMI approaches is the fallback, and the two are not interchangeable.
       coalesce(s.aum_cr_total, a.aum_cr_approaches) as aum_cr,
       a.aum_cr_approaches,
       round(a.aw_ret_3y, 2)  as aw_ret_3y,
       round(a.aw_sharpe, 2)  as aw_sharpe,
       a.worst_dd_pct,
       (select count(*) from pms.approach ap where ap.manager_id = m.manager_id) as n_approaches
from pms.manager m
left join last_sebi s on s.manager_id = m.manager_id
left join agg a on a.manager_id = m.manager_id;

-- ---------------------------------------------------------------- exposure

-- Views are read-only to the anon key. The underlying pms tables are never
-- exposed: Supabase only serves `public`, and nothing here is grantable to write.
grant usage on schema public to anon, authenticated;
grant select on public.v_strategy, public.v_manager, public.v_benchmark_label,
                public.v_benchmark_return,
                public.v_approach_stats, public.v_approach_monthly
      to anon, authenticated;

-- ------------------------------------------------- per-approach SEBI detail

-- Latest SEBI filing per approach: flows and turnover, which APMI does not
-- publish. SEBI lags APMI (only 2026-07 is loaded against APMI's 2026-08), so
-- `sebi_as_on` is exposed and the UI must date these separately rather than
-- implying they belong to the same month as the returns.
create or replace view public.v_approach_sebi as
select distinct on (approach_id)
       approach_id,
       as_on          as sebi_as_on,
       aum_cr         as sebi_aum_cr,
       inflow_cr, outflow_cr, net_flow_cr,
       inflow_fytd_cr, outflow_fytd_cr, net_flow_fytd_cr,
       turnover_1m, turnover_1y,
       benchmark_norm,
       is_dormant
from pms.sebi_approach_monthly
order by approach_id, as_on desc;

grant select on public.v_approach_sebi to anon, authenticated;
