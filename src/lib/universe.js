// Loads the real strategy universe from Supabase and maps it into the shape the
// screens already speak. Everything here traces back to an APMI or SEBI filing.
//
// Sharpe, volatility and max drawdown are computed in the database from the
// monthly return series (see ingest/sql/api_views.sql) — the regulator publishes
// none of the three. Upside and downside capture are absent on purpose: they
// need a benchmark monthly series, which is not yet ingested.

import { supabase } from './supabase.js'

const num = (v) => (v === null || v === undefined ? null : Number(v))

// One leaderboard row. `asOn` rides along so a stale approach can be rendered as
// stale rather than passed off as current.
function toStrategy(row) {
  return {
    id: row.approach_id,
    name: row.strategy,
    firm: row.firm,
    managerId: row.manager_id,
    regNo: row.sebi_reg_no,
    domain: row.website_domain ?? null,
    assetClass: row.asset_class,
    serviceType: row.service_type,
    benchmark: row.benchmark_label || row.benchmark,
    trackBreak: row.is_track_break === true,
    asOn: row.as_on,
    aum: num(row.aum_cr),
    sharpe: num(row.sharpe_3y),
    maxDD: num(row.max_dd_pct),
    vol: num(row.ann_vol_pct),
    months: row.n_months ?? 0,
    returns: {
      '1M': num(row.ret_1m),
      '1Y': num(row.ret_1y),
      '3Y': num(row.ret_3y),
      '5Y': num(row.ret_5y),
    },
    // The index's own return for the same windows, and the gap. Present only
    // where the strategy's benchmark has been captured from a SEBI filing.
    benchAsOn: row.bench_as_on ?? null,
    benchReturns: {
      '1M': null,
      '1Y': num(row.bench_ret_1y),
      '3Y': num(row.bench_ret_3y),
      '5Y': num(row.bench_ret_5y),
    },
    excess: {
      '1M': null,
      '1Y': num(row.excess_1y),
      '3Y': num(row.excess_3y),
      '5Y': num(row.excess_5y),
    },
  }
}

/**
 * The rankable universe: approaches that reported in the most recent month and
 * have enough history for a Sharpe. Anything thinner is excluded rather than
 * shown with a blank risk column — a leaderboard row implies comparability.
 */
export async function loadUniverse({ assetClass = 'Equity', minAum = 25 } = {}) {
  const { data: latest, error: latestErr } = await supabase
    .from('v_strategy')
    .select('as_on')
    .order('as_on', { ascending: false })
    .limit(1)

  if (latestErr) throw latestErr
  if (!latest?.length) return { asOn: null, strategies: [] }

  const asOn = latest[0].as_on

  let q = supabase
    .from('v_strategy')
    .select('*')
    .eq('as_on', asOn)
    .not('sharpe_3y', 'is', null)
    .order('aum_cr', { ascending: false, nullsFirst: false })
    .limit(500)

  if (assetClass) q = q.eq('asset_class', assetClass)
  if (minAum != null) q = q.gte('aum_cr', minAum)

  const { data, error } = await q
  if (error) throw error

  return { asOn, strategies: (data ?? []).map(toStrategy) }
}

/** The monthly series behind one approach, oldest first — for the detail chart. */
export async function loadSeries(approachId) {
  const { data, error } = await supabase
    .from('v_approach_monthly')
    .select('as_on, ret_1m, aum_cr')
    .eq('approach_id', approachId)
    .order('as_on', { ascending: true })

  if (error) throw error
  return (data ?? []).map((r) => ({
    asOn: r.as_on,
    ret: num(r.ret_1m),
    aum: num(r.aum_cr),
  }))
}

// The latest reported month, fetched once and shared. Every screen filters on it,
// and re-asking per query would put a round trip in front of each one.
let latestPromise = null

export function latestAsOn() {
  if (!latestPromise) {
    latestPromise = supabase
      .from('v_strategy')
      .select('as_on')
      .order('as_on', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          // A failed lookup must not be cached, or every later call inherits it.
          latestPromise = null
          throw error
        }
        return data?.[0]?.as_on ?? null
      })
  }
  return latestPromise
}

/**
 * Typeahead over the live universe. Searches the whole month, not just the
 * leaderboard slice, so a debt or small book can still be pulled into a
 * comparison even though it never appears in the equity ranking.
 */
export async function searchStrategies(query, { limit = 6 } = {}) {
  const asOn = await latestAsOn()
  if (!asOn) return []

  const q = (query ?? '').trim()
  let req = supabase.from('v_strategy').select('*').eq('as_on', asOn)

  if (q) {
    // PostgREST `or` takes a comma-separated filter list; a comma inside the
    // pattern would split it into two broken filters, so it is stripped.
    const safe = q.replace(/[,()*]/g, ' ').trim()
    if (safe) req = req.or(`strategy.ilike.%${safe}%,firm.ilike.%${safe}%`)
  }

  const { data, error } = await req
    .order('aum_cr', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(toStrategy)
}

/** The full current row for each id in the comparison basket. */
export async function loadByIds(ids) {
  const wanted = (ids ?? []).filter((id) => Number.isFinite(Number(id)))
  if (wanted.length === 0) return []

  const asOn = await latestAsOn()
  const { data, error } = await supabase
    .from('v_strategy')
    .select('*')
    .eq('as_on', asOn)
    .in('approach_id', wanted)

  if (error) throw error
  const rows = (data ?? []).map(toStrategy)
  // Preserve the order the user picked them in, not whatever the server returned.
  return wanted.map((id) => rows.find((r) => r.id === Number(id))).filter(Boolean)
}

/** One strategy's current row, by approach id. Null when it did not report. */
export async function loadStrategy(id) {
  const asOn = await latestAsOn()
  const { data, error } = await supabase
    .from('v_strategy')
    .select('*')
    .eq('approach_id', Number(id))
    .eq('as_on', asOn)
    .maybeSingle()

  if (error) throw error
  return data ? toStrategy(data) : null
}

/** SEBI's own view of the same approach: flows and turnover, on its own date. */
export async function loadSebiDetail(id) {
  const { data, error } = await supabase
    .from('v_approach_sebi')
    .select('*')
    .eq('approach_id', Number(id))
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return {
    asOn: data.sebi_as_on,
    aum: num(data.sebi_aum_cr),
    inflow: num(data.inflow_cr),
    outflow: num(data.outflow_cr),
    netFlow: num(data.net_flow_cr),
    netFlowFytd: num(data.net_flow_fytd_cr),
    turnover1m: num(data.turnover_1m),
    turnover1y: num(data.turnover_1y),
    dormant: data.is_dormant === true,
  }
}

/**
 * The closest books on the numbers: same asset class, nearest 3-year CAGR.
 * Filtered in the database on a window around this strategy's own return, so
 * the whole asset class never has to come down the wire to find three peers.
 */
export async function loadPeers(strategy, { limit = 3 } = {}) {
  const base = strategy?.returns?.['3Y']
  if (base === null || base === undefined || !strategy.assetClass) return []

  const asOn = await latestAsOn()
  const { data, error } = await supabase
    .from('v_strategy')
    .select('*')
    .eq('as_on', asOn)
    .eq('asset_class', strategy.assetClass)
    .not('sharpe_3y', 'is', null)
    .gte('ret_3y', base - 3)
    .lte('ret_3y', base + 3)
    .neq('approach_id', strategy.id)
    .limit(40)

  if (error) throw error
  return (data ?? [])
    .map(toStrategy)
    .sort((a, b) => Math.abs(a.returns['3Y'] - base) - Math.abs(b.returns['3Y'] - base))
    .slice(0, limit)
}

// --------------------------------------------------------------- managers

function toManager(row) {
  return {
    id: row.manager_id,
    firm: row.firm,
    regNo: row.sebi_reg_no,
    domain: row.website_domain ?? null,
    registeredOn: row.registered_on,
    principalOfficer: row.principal_officer,
    complianceOfficer: row.compliance_officer,
    address: row.address,
    sebiAsOn: row.sebi_as_on,
    // Gross AUM includes EPFO and PF mandates, which for the largest AMCs are
    // most of the book and are not something an investor here can buy into.
    // `aum` is the ex-EPFO figure; `aumGross` is kept so the page can say so.
    aum: num(row.aum_cr_ex_epfo),
    aumGross: num(row.aum_cr_total),
    aumEpfo: num(row.aum_cr_pf_epfo),
    aumDiscretionary: num(row.aum_cr_discretionary),
    aumApproaches: num(row.aum_cr_approaches),
    clients: row.clients_total,
    clientsEpfo: row.clients_pf_epfo,
    clientsCorp: row.clients_corp,
    clientsNonCorp: row.clients_noncorp,
    clientsNri: row.clients_nri,
    strategies: row.n_strategies ?? 0,
    rated: row.n_rated ?? 0,
    awRet3y: num(row.aw_ret_3y),
    awSharpe: num(row.aw_sharpe),
    worstDd: num(row.worst_dd_pct),
    complaintsPending: row.complaints_pending,
    complaintsReceived: row.complaints_received,
    complaintsResolved: row.complaints_resolved,
    offersDiscretionary: row.offers_discretionary,
    offersAdvisory: row.offers_advisory,
  }
}

/** Firms that actually run something we can rank, biggest ex-EPFO book first. */
export async function loadManagers({ limit = 120 } = {}) {
  const { data, error } = await supabase
    .from('v_manager')
    .select('*')
    .gt('n_rated', 0)
    .order('aum_cr_ex_epfo', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(toManager)
}

export async function loadManager(id) {
  const { data, error } = await supabase
    .from('v_manager')
    .select('*')
    .eq('manager_id', Number(id))
    .maybeSingle()

  if (error) throw error
  return data ? toManager(data) : null
}

/** Every strategy the firm runs in the latest month, biggest book first. */
export async function loadManagerStrategies(id) {
  const asOn = await latestAsOn()
  const { data, error } = await supabase
    .from('v_strategy')
    .select('*')
    .eq('manager_id', Number(id))
    .eq('as_on', asOn)
    .order('aum_cr', { ascending: false, nullsFirst: false })

  if (error) throw error
  return (data ?? []).map(toStrategy)
}

// ---------------------------------------------------------------- discover

const RET_COL = { '1M': 'ret_1m', '1Y': 'ret_1y', '3Y': 'ret_3y', '5Y': 'ret_5y' }

export async function loadUniverseStats() {
  const { data, error } = await supabase.from('v_universe_stats').select('*').maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    asOn: data.as_on,
    strategies: data.n_strategies,
    firms: data.n_firms,
    rated: data.n_rated,
    aum: num(data.aum_cr_total),
    medianRet3y: num(data.median_ret_3y),
    medianSharpe: num(data.median_sharpe),
    medianMaxDd: num(data.median_max_dd),
  }
}

export async function loadUniverseHistogram() {
  const { data, error } = await supabase.from('v_universe_hist').select('*').order('bucket')
  if (error) throw error
  return (data ?? []).map((r) => ({ bucket: r.bucket, n: r.n, lo: num(r.lo), hi: num(r.hi) }))
}

/**
 * Best books over one window. A floor on AUM keeps the list readable: without
 * it the top is a run of sub-crore books whose percentage returns swing on
 * almost no money.
 */
export async function loadTopBy(period, { limit = 6, minAum = 100, assetClass = null } = {}) {
  const col = RET_COL[period]
  if (!col) return []
  const asOn = await latestAsOn()

  let q = supabase
    .from('v_strategy')
    .select('*')
    .eq('as_on', asOn)
    .gte('aum_cr', minAum)
    .not(col, 'is', null)
    .order(col, { ascending: false })
    .limit(limit)

  if (assetClass) q = q.eq('asset_class', assetClass)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toStrategy)
}

/**
 * Where the money actually moved. v_flows is already restricted to the ranked
 * universe, which keeps provident-fund and EPFO mandates out -- unrestricted,
 * this list is topped by a single Rs 644,490 Cr monthly inflow into a PF book.
 */
export async function loadTopFlows({ limit = 5 } = {}) {
  const { data, error } = await supabase
    .from('v_flows')
    .select('*')
    .order('net_flow_cr', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.approach_id,
    name: r.strategy,
    firm: r.firm,
    domain: r.website_domain ?? null,
    aum: num(r.aum_cr),
    netFlow: num(r.net_flow_cr),
    netFlowPct: num(r.net_flow_pct),
    flowAsOn: r.sebi_as_on,
  }))
}

/** Counts per asset class, for the screener facets. */
export async function loadAssetClassCounts() {
  const asOn = await latestAsOn()
  const { data, error } = await supabase
    .from('v_strategy')
    .select('asset_class')
    .eq('as_on', asOn)
    .not('asset_class', 'is', null)
    .limit(5000)

  if (error) throw error
  const counts = {}
  for (const r of data ?? []) counts[r.asset_class] = (counts[r.asset_class] ?? 0) + 1
  return counts
}
