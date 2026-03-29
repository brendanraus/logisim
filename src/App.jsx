import { useState, useCallback, useEffect, useRef } from "react";

const MARKETS = [
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", baseRent: 7.5, capRate: 4.8, demand: 0.85, currency: "GBP" },
  { id: "de", name: "Germany", flag: "🇩🇪", baseRent: 5.2, capRate: 4.2, demand: 0.80, currency: "EUR" },
  { id: "fr", name: "France", flag: "🇫🇷", baseRent: 5.8, capRate: 4.5, demand: 0.75, currency: "EUR" },
  { id: "pl", name: "Poland", flag: "🇵🇱", baseRent: 4.2, capRate: 6.5, demand: 0.90, currency: "EUR" },
  { id: "nl", name: "Netherlands", flag: "🇳🇱", baseRent: 6.8, capRate: 4.0, demand: 0.82, currency: "EUR" },
  { id: "cz", name: "Czech Republic", flag: "🇨🇿", baseRent: 4.8, capRate: 5.8, demand: 0.78, currency: "EUR" },
  { id: "es", name: "Spain", flag: "🇪🇸", baseRent: 5.0, capRate: 5.2, demand: 0.72, currency: "EUR" },
  { id: "se", name: "Sweden", flag: "🇸🇪", baseRent: 6.2, capRate: 4.3, demand: 0.70, currency: "EUR" },
];

const ASSET_NAMES = [
  "Gateway Park", "CrossDock Hub", "Horizon Logistics Centre", "Apex Distribution Park",
  "Keystone Warehouse", "Matrix Logistics Campus", "Pinnacle Trade Park", "Velocity DC",
  "Summit Industrial Estate", "Nexus Fulfilment Centre", "Meridian Park", "Atlas Cargo Hub",
  "Eclipse Distribution Centre", "Vanguard Logistics Park", "Quantum Trade Hub",
  "Sterling Warehouse Complex", "Northgate Industrial", "Riverside Logistics",
  "Centrepoint DC", "Orbital Business Park"
];

const TENANT_NAMES = [
  "Amazon", "DHL", "Maersk Logistics", "XPO", "DB Schenker",
  "Kuehne+Nagel", "GXO", "CEVA Logistics", "DSV Panalpina", "Geodis",
  "FedEx", "UPS Supply Chain", "Rhenus Logistics", "Dachser", "Hellmann",
  "Zalando", "ASOS Fulfilment", "Decathlon Logistics", "IKEA Supply", "Lidl Distribution"
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => min + Math.random() * (max - min);
const formatM = (n) => `€${(n / 1_000_000).toFixed(1)}m`;
const formatK = (n) => `€${(n / 1_000).toFixed(0)}k`;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

const GLOSSARY = {
  "Portfolio GAV": "Gross Asset Value — total market value of all assets in your portfolio",
  "Assets": "Number of properties in your portfolio (including developments)",
  "Total GLA": "Gross Lettable Area — total warehouse floor space across all assets, in square metres",
  "Avg Occupancy": "Weighted average % of your portfolio that is leased to tenants (by GLA)",
  "GRI p.a.": "Gross Rental Income per annum — total rent collected across the portfolio before costs",
  "NOI p.a.": "Net Operating Income per annum — rental income minus property operating expenses (15%)",
  "NOI Yield": "NOI as a % of GAV — measures the return your portfolio generates on its asset value",
  "Avg WALT": "Weighted Average Lease Term — average years remaining on tenant leases, weighted by rent",
  "GLA": "Gross Lettable Area — total lettable floor space in sqm",
  "Occupancy": "% of the asset's GLA that is currently leased to a tenant",
  "GAV": "Gross Asset Value — estimated market value based on rent and cap rate",
  "Rent p.a.": "Gross Rental Income per year for this asset (rent/sqm × GLA × occupancy)",
  "Rent/sqm": "Annual headline rent per square metre",
  "WALT": "Weighted Average Lease Term — years remaining on the current lease",
  "Asking": "The seller's asking price for this asset",
  "NIY": "Net Initial Yield — NOI (rent minus 15% opex) divided by purchase price",
  "Dev Cost": "Total development cost to build this asset",
  "Timeline": "Quarters until development completes and the asset is ready for leasing",
  "Est. Rent/sqm": "Estimated achievable headline rent per sqm once development completes",
  "Est. YOC": "Estimated Yield on Cost — projected NOI as a % of total development cost",
  "Cost": "Total committed development cost for this asset",
  "Completion": "Quarters remaining until development completes",
  "Grade": "Asset condition: A (prime), B (good, ageing), C (dated, needs capex)",
};

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 6 });
    setShow(true);
  };

  return (
    <span
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
      style={{ cursor: "help", borderBottom: `1px dotted ${theme.textMuted}`, position: "relative" }}
    >
      {children}
      {show && (
        <span style={{
          position: "fixed",
          left: Math.min(pos.x, window.innerWidth - 220),
          top: pos.y,
          transform: "translateX(-50%)",
          background: "#1e293b",
          color: theme.text,
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 400,
          lineHeight: 1.5,
          maxWidth: "220px",
          zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          border: `1px solid ${theme.border}`,
          pointerEvents: "none",
          whiteSpace: "normal",
          letterSpacing: "0",
          textTransform: "none",
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

function TipLabel({ label, style: s }) {
  const tip = GLOSSARY[label];
  if (!tip) return <div style={s}>{label}</div>;
  return <div style={s}><Tooltip text={tip}>{label}</Tooltip></div>;
}

let assetCounter = 0;
let usedNames = new Set();

function generateAsset(market) {
  assetCounter++;
  let name;
  do {
    name = randomFrom(ASSET_NAMES);
  } while (usedNames.has(`${market.id}-${name}`) && usedNames.size < ASSET_NAMES.length * MARKETS.length);
  usedNames.add(`${market.id}-${name}`);

  const gla = Math.round(randomBetween(8, 60)) * 1000;
  const rentPsm = market.baseRent * randomBetween(0.85, 1.2);
  const occupancy = Math.min(1, Math.max(0, market.demand * randomBetween(0.8, 1.15)));
  const tenant = occupancy > 0.5 ? randomFrom(TENANT_NAMES) : null;
  const leaseRemaining = occupancy > 0.5 ? Math.round(randomBetween(1, 8)) : 0;
  const gri = gla * rentPsm * occupancy;
  const value = gri / (market.capRate / 100);
  const age = Math.round(randomBetween(2, 25));
  const condition = age < 5 ? "A" : age < 12 ? "B" : "C";

  return {
    id: `asset-${assetCounter}`,
    name: `${name}`,
    market: market.id,
    marketName: market.name,
    flag: market.flag,
    gla,
    rentPsm,
    occupancy,
    tenant,
    leaseRemaining,
    gri,
    value,
    age,
    condition,
    capexSpent: 0,
    acquired: true,
    developing: false,
    devQuartersLeft: 0,
  };
}

function generateMarketAsset(market) {
  const asset = generateAsset(market);
  asset.acquired = false;
  asset.askPrice = asset.value * randomBetween(0.95, 1.15);
  return asset;
}

function generateDevSite(market) {
  const gla = Math.round(randomBetween(15, 50)) * 1000;
  const devCost = gla * randomBetween(400, 700);
  assetCounter++;
  let name;
  do {
    name = randomFrom(ASSET_NAMES);
  } while (usedNames.has(`dev-${market.id}-${name}`));
  usedNames.add(`dev-${market.id}-${name}`);

  return {
    id: `dev-${assetCounter}`,
    name: `${name} (Dev)`,
    market: market.id,
    marketName: market.name,
    flag: market.flag,
    gla,
    devCost,
    estRentPsm: market.baseRent * randomBetween(1.0, 1.3),
    estYield: market.capRate * randomBetween(1.05, 1.25),
    quartersToComplete: Math.round(randomBetween(3, 6)),
  };
}

const INITIAL_CASH = 150_000_000;

function initGame() {
  const portfolio = [];
  // Start with 3 assets
  const startMarkets = [MARKETS[0], MARKETS[1], MARKETS[3]]; // UK, DE, PL
  startMarkets.forEach(m => {
    const a = generateAsset(m);
    a.acquired = true;
    portfolio.push(a);
  });

  const acquisitions = MARKETS.slice(0, 5).map(m => generateMarketAsset(m));
  const devSites = [MARKETS[0], MARKETS[3]].map(m => generateDevSite(m));

  return {
    quarter: 1,
    year: 2025,
    cash: INITIAL_CASH,
    portfolio,
    acquisitions,
    devSites,
    developments: [],
    history: [],
    events: [],
    gameOver: false,
    totalInvested: portfolio.reduce((s, a) => s + a.value, 0),
  };
}

function getQuarterLabel(q, y) {
  return `Q${((q - 1) % 4) + 1} ${y + Math.floor((q - 1) / 4)}`;
}

function computeMetrics(state) {
  const { portfolio, cash } = state;
  if (portfolio.length === 0) return { totalGAV: 0, totalGRI: 0, avgOcc: 0, avgWALT: 0, noi: 0, noiYield: 0, assetCount: 0, totalGLA: 0 };
  const operating = portfolio.filter(a => !a.developing);
  const totalGAV = portfolio.reduce((s, a) => s + (a.developing ? a.devCostSoFar || 0 : a.value), 0);
  const totalGRI = operating.reduce((s, a) => s + a.gri, 0);
  const totalGLA = portfolio.reduce((s, a) => s + a.gla, 0);
  const avgOcc = operating.length > 0
    ? operating.reduce((s, a) => s + a.occupancy * a.gla, 0) / operating.reduce((s, a) => s + a.gla, 0)
    : 0;
  const avgWALT = operating.filter(a => a.leaseRemaining > 0).length > 0
    ? operating.reduce((s, a) => s + a.leaseRemaining * a.gri, 0) / Math.max(1, operating.reduce((s, a) => s + (a.leaseRemaining > 0 ? a.gri : 0), 0))
    : 0;
  const opex = totalGRI * 0.15;
  const noi = totalGRI - opex;
  const noiYield = totalGAV > 0 ? noi / totalGAV : 0;
  return { totalGAV, totalGRI, avgOcc, avgWALT, noi, noiYield, assetCount: portfolio.length, totalGLA };
}

function advanceQuarter(state) {
  let { quarter, year, cash, portfolio, acquisitions, devSites, developments, history, events: oldEvents } = state;
  const newEvents = [];
  quarter++;
  const qLabel = getQuarterLabel(quarter, year);

  // Collect rent
  const operating = portfolio.filter(a => !a.developing);
  const quarterlyRent = operating.reduce((s, a) => s + a.gri / 4, 0);
  const quarterlyOpex = quarterlyRent * 0.15;
  cash += quarterlyRent - quarterlyOpex;
  newEvents.push(`${qLabel}: Collected ${formatK(quarterlyRent)} rent, paid ${formatK(quarterlyOpex)} opex`);

  // Market shifts
  portfolio.forEach(a => {
    if (a.developing) {
      a.devQuartersLeft--;
      a.devCostSoFar = (a.devCostSoFar || 0) + (a.totalDevCost || 0) / (a.totalDevQuarters || 4);
      if (a.devQuartersLeft <= 0) {
        a.developing = false;
        a.occupancy = 0;
        a.condition = "A";
        a.age = 0;
        a.gri = a.gla * a.rentPsm * a.occupancy;
        a.value = a.gla * a.rentPsm / ((MARKETS.find(m => m.id === a.market)?.capRate || 5) / 100);
        newEvents.push(`🏗️ ${a.flag} ${a.name} development completed! Now seeking tenants.`);
      }
      return;
    }

    // Random occupancy drift
    const market = MARKETS.find(m => m.id === a.market);
    const drift = randomBetween(-0.08, 0.08);
    a.occupancy = Math.min(1, Math.max(0, a.occupancy + drift));

    // Lease events
    if (a.leaseRemaining > 0) {
      a.leaseRemaining -= 0.25;
      if (a.leaseRemaining <= 0) {
        if (Math.random() < 0.5) {
          a.occupancy = Math.max(0, a.occupancy - randomBetween(0.2, 0.5));
          a.tenant = null;
          newEvents.push(`⚠️ ${a.flag} ${a.name}: Tenant vacated at lease expiry`);
        } else {
          a.leaseRemaining = Math.round(randomBetween(3, 7));
          a.rentPsm *= randomBetween(1.0, 1.08);
          newEvents.push(`✅ ${a.flag} ${a.name}: ${a.tenant} renewed for ${a.leaseRemaining}yr`);
        }
      }
    } else {
      // Try to lease up vacant space
      if (a.occupancy < 0.7 && Math.random() < 0.3) {
        a.occupancy = Math.min(1, a.occupancy + randomBetween(0.15, 0.4));
        a.tenant = randomFrom(TENANT_NAMES);
        a.leaseRemaining = Math.round(randomBetween(3, 7));
        newEvents.push(`🤝 ${a.flag} ${a.name}: New lease signed with ${a.tenant}`);
      }
    }

    // Condition degradation
    if (Math.random() < 0.05 && a.condition !== "C") {
      a.condition = a.condition === "A" ? "B" : "C";
      a.rentPsm *= 0.95;
      newEvents.push(`🔧 ${a.flag} ${a.name} condition degraded to Grade ${a.condition}`);
    }

    // Recalc
    a.gri = a.gla * a.rentPsm * a.occupancy;
    a.value = a.gri > 0 ? a.gri / ((market?.capRate || 5) / 100) : a.gla * (market?.baseRent || 5) * 0.3 / ((market?.capRate || 5) / 100);
  });

  // Refresh market opportunities
  if (quarter % 2 === 0) {
    const newAcqs = MARKETS.slice(0, 6).map(m => generateMarketAsset(m));
    acquisitions = newAcqs;
    const newDevs = [randomFrom(MARKETS.slice(0, 4)), randomFrom(MARKETS.slice(4))].map(m => generateDevSite(m));
    devSites = newDevs;
  }

  const metrics = computeMetrics({ portfolio, cash });
  history.push({ quarter, ...metrics, cash });

  return {
    ...state,
    quarter,
    cash,
    portfolio: [...portfolio],
    acquisitions,
    devSites,
    history,
    events: newEvents,
  };
}

// ─── STYLES ─────────────────────────────────────────────

const theme = {
  bg: "#0a0f1a",
  card: "#111827",
  cardHover: "#1a2235",
  border: "#1e2a3a",
  accent: "#3b82f6",
  accentDim: "#1e3a5f",
  green: "#10b981",
  greenDim: "#064e3b",
  red: "#ef4444",
  redDim: "#7f1d1d",
  amber: "#f59e0b",
  amberDim: "#78350f",
  text: "#e2e8f0",
  textDim: "#64748b",
  textMuted: "#475569",
  white: "#ffffff",
};

const styles = {
  app: {
    minHeight: "100vh",
    background: `linear-gradient(180deg, ${theme.bg} 0%, #0d1321 100%)`,
    color: theme.text,
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  header: {
    padding: "20px 24px 16px",
    borderBottom: `1px solid ${theme.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: theme.white,
  },
  logoSub: {
    fontSize: "10px",
    color: theme.textDim,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },
  quarterBadge: {
    padding: "6px 16px",
    background: theme.accentDim,
    border: `1px solid ${theme.accent}`,
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: theme.accent,
  },
  metricsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "1px",
    background: theme.border,
    margin: "0",
    borderBottom: `1px solid ${theme.border}`,
  },
  metricCell: {
    background: theme.bg,
    padding: "12px 16px",
    textAlign: "center",
  },
  metricLabel: {
    fontSize: "9px",
    color: theme.textDim,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "4px",
  },
  metricValue: {
    fontSize: "16px",
    fontWeight: 700,
    color: theme.white,
  },
  main: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "0",
    minHeight: "calc(100vh - 160px)",
  },
  mainMobile: {
    display: "flex",
    flexDirection: "column",
  },
  leftPanel: {
    padding: "16px 20px",
    overflowY: "auto",
    borderRight: `1px solid ${theme.border}`,
  },
  rightPanel: {
    padding: "16px 20px",
    overflowY: "auto",
    background: "#0c1120",
  },
  tabs: {
    display: "flex",
    gap: "2px",
    marginBottom: "16px",
    background: theme.border,
    borderRadius: "8px",
    padding: "2px",
  },
  tab: (active) => ({
    flex: 1,
    padding: "8px 12px",
    background: active ? theme.card : "transparent",
    color: active ? theme.white : theme.textDim,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    transition: "all 0.15s",
  }),
  assetCard: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "8px",
    transition: "all 0.15s",
    cursor: "default",
  },
  assetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  assetName: {
    fontSize: "13px",
    fontWeight: 700,
    color: theme.white,
  },
  assetMarket: {
    fontSize: "11px",
    color: theme.textDim,
  },
  assetGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    marginTop: "8px",
  },
  assetStat: {
    fontSize: "10px",
    color: theme.textDim,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  assetStatVal: {
    fontSize: "14px",
    fontWeight: 600,
    color: theme.text,
  },
  occBar: (occ) => ({
    height: "3px",
    background: theme.border,
    borderRadius: "2px",
    marginTop: "4px",
    overflow: "hidden",
    position: "relative",
  }),
  occFill: (occ) => ({
    height: "100%",
    width: `${occ * 100}%`,
    background: occ > 0.85 ? theme.green : occ > 0.6 ? theme.amber : theme.red,
    borderRadius: "2px",
    transition: "width 0.5s ease",
  }),
  condBadge: (cond) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    background: cond === "A" ? theme.greenDim : cond === "B" ? theme.amberDim : theme.redDim,
    color: cond === "A" ? theme.green : cond === "B" ? theme.amber : theme.red,
  }),
  btn: (variant = "default") => ({
    padding: "7px 14px",
    border: `1px solid ${variant === "green" ? theme.green : variant === "red" ? theme.red : variant === "amber" ? theme.amber : theme.accent}`,
    background: variant === "green" ? theme.greenDim : variant === "red" ? theme.redDim : variant === "amber" ? theme.amberDim : theme.accentDim,
    color: variant === "green" ? theme.green : variant === "red" ? theme.red : variant === "amber" ? theme.amber : theme.accent,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    fontFamily: "inherit",
    letterSpacing: "0.03em",
    transition: "all 0.15s",
  }),
  btnRow: {
    display: "flex",
    gap: "6px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  eventLog: {
    fontSize: "11px",
    lineHeight: 1.8,
    color: theme.textDim,
  },
  eventItem: {
    padding: "6px 0",
    borderBottom: `1px solid ${theme.border}`,
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: theme.textDim,
    marginBottom: "12px",
    marginTop: "4px",
  },
  cashDisplay: {
    fontSize: "11px",
    color: theme.green,
    fontWeight: 600,
  },
  advanceBtn: {
    padding: "10px 24px",
    background: `linear-gradient(135deg, ${theme.accent}, #2563eb)`,
    color: theme.white,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    transition: "all 0.2s",
    boxShadow: "0 2px 12px rgba(59, 130, 246, 0.3)",
  },
  empty: {
    padding: "24px",
    textAlign: "center",
    color: theme.textDim,
    fontSize: "12px",
  },
  tenant: {
    fontSize: "11px",
    color: theme.accent,
    fontWeight: 500,
  },
  devProgress: {
    height: "3px",
    background: theme.border,
    borderRadius: "2px",
    marginTop: "4px",
  },
  devFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: theme.accent,
    borderRadius: "2px",
    transition: "width 0.5s",
  }),
};

function MetricCell({ label, value, color }) {
  return (
    <div style={styles.metricCell}>
      <TipLabel label={label} style={styles.metricLabel} />
      <div style={{ ...styles.metricValue, color: color || theme.white }}>{value}</div>
    </div>
  );
}

function AssetCard({ asset, onCapex, onDispose }) {
  if (asset.developing) {
    const totalQ = asset.totalDevQuarters || 4;
    const elapsed = totalQ - asset.devQuartersLeft;
    const pctDone = (elapsed / totalQ) * 100;
    return (
      <div style={styles.assetCard}>
        <div style={styles.assetHeader}>
          <div>
            <div style={styles.assetName}>{asset.flag} {asset.name}</div>
            <div style={styles.assetMarket}>{asset.marketName} · 🏗️ Under Development</div>
          </div>
          <span style={styles.condBadge("A")}>DEV</span>
        </div>
        <div style={styles.assetGrid}>
          <div><TipLabel label="GLA" style={styles.assetStat} /><div style={styles.assetStatVal}>{(asset.gla / 1000).toFixed(0)}k sqm</div></div>
          <div><TipLabel label="Cost" style={styles.assetStat} /><div style={styles.assetStatVal}>{formatM(asset.totalDevCost || 0)}</div></div>
          <div><TipLabel label="Completion" style={styles.assetStat} /><div style={styles.assetStatVal}>{asset.devQuartersLeft}Q left</div></div>
        </div>
        <div style={styles.devProgress}><div style={styles.devFill(pctDone)} /></div>
      </div>
    );
  }

  return (
    <div style={styles.assetCard}>
      <div style={styles.assetHeader}>
        <div>
          <div style={styles.assetName}>{asset.flag} {asset.name}</div>
          <div style={styles.assetMarket}>
            {asset.marketName}
            {asset.tenant && <> · <span style={styles.tenant}>{asset.tenant}</span></>}
          </div>
        </div>
        <span style={styles.condBadge(asset.condition)}>Grade {asset.condition}</span>
      </div>
      <div style={styles.assetGrid}>
        <div>
          <TipLabel label="GLA" style={styles.assetStat} />
          <div style={styles.assetStatVal}>{(asset.gla / 1000).toFixed(0)}k sqm</div>
        </div>
        <div>
          <TipLabel label="Occupancy" style={styles.assetStat} />
          <div style={{ ...styles.assetStatVal, color: asset.occupancy > 0.85 ? theme.green : asset.occupancy > 0.6 ? theme.amber : theme.red }}>
            {pct(asset.occupancy)}
          </div>
        </div>
        <div>
          <TipLabel label="GAV" style={styles.assetStat} />
          <div style={styles.assetStatVal}>{formatM(asset.value)}</div>
        </div>
        <div>
          <TipLabel label="Rent p.a." style={styles.assetStat} />
          <div style={styles.assetStatVal}>{formatK(asset.gri)}</div>
        </div>
        <div>
          <TipLabel label="Rent/sqm" style={styles.assetStat} />
          <div style={styles.assetStatVal}>€{asset.rentPsm.toFixed(1)}</div>
        </div>
        <div>
          <TipLabel label="WALT" style={styles.assetStat} />
          <div style={styles.assetStatVal}>{asset.leaseRemaining > 0 ? `${asset.leaseRemaining.toFixed(1)}yr` : "Vacant"}</div>
        </div>
      </div>
      <div style={styles.occBar(asset.occupancy)}>
        <div style={styles.occFill(asset.occupancy)} />
      </div>
      <div style={styles.btnRow}>
        {asset.condition !== "A" && (
          <button
            style={styles.btn("amber")}
            onClick={() => onCapex(asset.id)}
          >
            Capex Upgrade ({formatK(asset.gla * 25)})
          </button>
        )}
        <button
          style={styles.btn("red")}
          onClick={() => onDispose(asset.id)}
        >
          Dispose ({formatM(asset.value * 0.97)})
        </button>
      </div>
    </div>
  );
}

function AcquisitionCard({ asset, onAcquire, canAfford }) {
  return (
    <div style={{ ...styles.assetCard, opacity: canAfford ? 1 : 0.5 }}>
      <div style={styles.assetHeader}>
        <div>
          <div style={styles.assetName}>{asset.flag} {asset.name}</div>
          <div style={styles.assetMarket}>{asset.marketName} · {asset.tenant && <span style={styles.tenant}>{asset.tenant}</span>}</div>
        </div>
        <span style={styles.condBadge(asset.condition)}>Grade {asset.condition}</span>
      </div>
      <div style={styles.assetGrid}>
        <div><TipLabel label="GLA" style={styles.assetStat} /><div style={styles.assetStatVal}>{(asset.gla / 1000).toFixed(0)}k sqm</div></div>
        <div><TipLabel label="Occupancy" style={styles.assetStat} /><div style={{ ...styles.assetStatVal, color: asset.occupancy > 0.85 ? theme.green : theme.amber }}>{pct(asset.occupancy)}</div></div>
        <div><TipLabel label="Asking" style={styles.assetStat} /><div style={styles.assetStatVal}>{formatM(asset.askPrice)}</div></div>
        <div><TipLabel label="Rent p.a." style={styles.assetStat} /><div style={styles.assetStatVal}>{formatK(asset.gri)}</div></div>
        <div><TipLabel label="NIY" style={styles.assetStat} /><div style={styles.assetStatVal}>{pct((asset.gri * 0.85) / asset.askPrice)}</div></div>
        <div><TipLabel label="WALT" style={styles.assetStat} /><div style={styles.assetStatVal}>{asset.leaseRemaining > 0 ? `${asset.leaseRemaining}yr` : "Vacant"}</div></div>
      </div>
      <div style={styles.btnRow}>
        <button
          style={styles.btn("green")}
          onClick={() => onAcquire(asset.id)}
          disabled={!canAfford}
        >
          Acquire
        </button>
      </div>
    </div>
  );
}

function DevCard({ site, onDevelop, canAfford }) {
  return (
    <div style={{ ...styles.assetCard, opacity: canAfford ? 1 : 0.5 }}>
      <div style={styles.assetHeader}>
        <div>
          <div style={styles.assetName}>{site.flag} {site.name}</div>
          <div style={styles.assetMarket}>{site.marketName} · New Development</div>
        </div>
      </div>
      <div style={styles.assetGrid}>
        <div><TipLabel label="GLA" style={styles.assetStat} /><div style={styles.assetStatVal}>{(site.gla / 1000).toFixed(0)}k sqm</div></div>
        <div><TipLabel label="Dev Cost" style={styles.assetStat} /><div style={styles.assetStatVal}>{formatM(site.devCost)}</div></div>
        <div><TipLabel label="Timeline" style={styles.assetStat} /><div style={styles.assetStatVal}>{site.quartersToComplete}Q</div></div>
        <div><TipLabel label="Est. Rent/sqm" style={styles.assetStat} /><div style={styles.assetStatVal}>€{site.estRentPsm.toFixed(1)}</div></div>
        <div><TipLabel label="Est. YOC" style={styles.assetStat} /><div style={styles.assetStatVal}>{pct(site.estYield / 100)}</div></div>
      </div>
      <div style={styles.btnRow}>
        <button
          style={styles.btn("default")}
          onClick={() => onDevelop(site.id)}
          disabled={!canAfford}
        >
          Develop
        </button>
      </div>
    </div>
  );
}

export default function LogisticsRESimulator() {
  const [state, setState] = useState(initGame);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [rightTab, setRightTab] = useState("events");

  const metrics = computeMetrics(state);

  const handleAdvance = useCallback(() => {
    setState(prev => advanceQuarter(prev));
  }, []);

  const handleAcquire = useCallback((id) => {
    setState(prev => {
      const asset = prev.acquisitions.find(a => a.id === id);
      if (!asset || prev.cash < asset.askPrice) return prev;
      const acquired = { ...asset, acquired: true, value: asset.askPrice };
      delete acquired.askPrice;
      return {
        ...prev,
        cash: prev.cash - asset.askPrice,
        portfolio: [...prev.portfolio, acquired],
        acquisitions: prev.acquisitions.filter(a => a.id !== id),
        events: [...prev.events, `🏢 Acquired ${asset.flag} ${asset.name} for ${formatM(asset.askPrice)}`],
      };
    });
  }, []);

  const handleDispose = useCallback((id) => {
    setState(prev => {
      const asset = prev.portfolio.find(a => a.id === id);
      if (!asset) return prev;
      const proceeds = asset.value * 0.97;
      return {
        ...prev,
        cash: prev.cash + proceeds,
        portfolio: prev.portfolio.filter(a => a.id !== id),
        events: [...prev.events, `💰 Disposed ${asset.flag} ${asset.name} for ${formatM(proceeds)}`],
      };
    });
  }, []);

  const handleCapex = useCallback((id) => {
    setState(prev => {
      const asset = prev.portfolio.find(a => a.id === id);
      if (!asset) return prev;
      const cost = asset.gla * 25;
      if (prev.cash < cost) return prev;
      const updated = prev.portfolio.map(a => {
        if (a.id !== id) return a;
        const newCond = a.condition === "C" ? "B" : "A";
        const newRent = a.rentPsm * 1.1;
        const market = MARKETS.find(m => m.id === a.market);
        const newGri = a.gla * newRent * a.occupancy;
        const newVal = newGri > 0 ? newGri / ((market?.capRate || 5) / 100) : a.value;
        return { ...a, condition: newCond, rentPsm: newRent, gri: newGri, value: newVal, capexSpent: a.capexSpent + cost };
      });
      return {
        ...prev,
        cash: prev.cash - cost,
        portfolio: updated,
        events: [...prev.events, `🔧 Capex upgrade on ${asset.flag} ${asset.name} (${formatK(cost)})`],
      };
    });
  }, []);

  const handleDevelop = useCallback((id) => {
    setState(prev => {
      const site = prev.devSites.find(s => s.id === id);
      if (!site || prev.cash < site.devCost) return prev;
      const devAsset = {
        id: site.id,
        name: site.name.replace(" (Dev)", ""),
        market: site.market,
        marketName: site.marketName,
        flag: site.flag,
        gla: site.gla,
        rentPsm: site.estRentPsm,
        occupancy: 0,
        tenant: null,
        leaseRemaining: 0,
        gri: 0,
        value: 0,
        age: 0,
        condition: "A",
        capexSpent: 0,
        acquired: true,
        developing: true,
        devQuartersLeft: site.quartersToComplete,
        totalDevQuarters: site.quartersToComplete,
        totalDevCost: site.devCost,
        devCostSoFar: 0,
      };
      return {
        ...prev,
        cash: prev.cash - site.devCost,
        portfolio: [...prev.portfolio, devAsset],
        devSites: prev.devSites.filter(s => s.id !== id),
        events: [...prev.events, `🏗️ Started development: ${site.flag} ${site.name} (${formatM(site.devCost)}, ${site.quartersToComplete}Q)`],
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    usedNames = new Set();
    assetCounter = 0;
    setState(initGame());
  }, []);

  const qLabel = getQuarterLabel(state.quarter, state.year);

  return (
    <div style={styles.app}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <div>
            <div style={styles.logoText}>◼ LOGISIM</div>
            <div style={styles.logoSub}>European Logistics Real Estate Simulator</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={styles.cashDisplay}>CASH: {formatM(state.cash)}</div>
          <div style={styles.quarterBadge}>{qLabel}</div>
          <button style={styles.advanceBtn} onClick={handleAdvance}>
            Next Quarter →
          </button>
          <button style={{ ...styles.btn("default"), padding: "7px 10px", fontSize: "10px" }} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {/* METRICS BAR */}
      <div style={styles.metricsBar}>
        <MetricCell label="Portfolio GAV" value={formatM(metrics.totalGAV)} />
        <MetricCell label="Assets" value={metrics.assetCount} />
        <MetricCell label="Total GLA" value={`${(metrics.totalGLA / 1000).toFixed(0)}k sqm`} />
        <MetricCell label="Avg Occupancy" value={pct(metrics.avgOcc)} color={metrics.avgOcc > 0.85 ? theme.green : metrics.avgOcc > 0.6 ? theme.amber : theme.red} />
        <MetricCell label="GRI p.a." value={formatM(metrics.totalGRI)} />
        <MetricCell label="NOI p.a." value={formatM(metrics.noi)} color={theme.green} />
        <MetricCell label="NOI Yield" value={pct(metrics.noiYield)} />
        <MetricCell label="Avg WALT" value={`${metrics.avgWALT.toFixed(1)}yr`} />
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        {/* LEFT — PORTFOLIO / ACQUIRE / DEVELOP */}
        <div style={styles.leftPanel}>
          <div style={styles.tabs}>
            {["portfolio", "acquire", "develop"].map(t => (
              <button key={t} style={styles.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
                {t === "portfolio" ? `Portfolio (${state.portfolio.length})` : t === "acquire" ? `Acquire (${state.acquisitions.length})` : `Develop (${state.devSites.length})`}
              </button>
            ))}
          </div>

          {activeTab === "portfolio" && (
            <>
              {state.portfolio.length === 0 && <div style={styles.empty}>No assets. Start acquiring!</div>}
              {state.portfolio.map(a => (
                <AssetCard key={a.id} asset={a} onCapex={handleCapex} onDispose={handleDispose} />
              ))}
            </>
          )}

          {activeTab === "acquire" && (
            <>
              <div style={styles.sectionTitle}>Available Acquisitions</div>
              {state.acquisitions.length === 0 && <div style={styles.empty}>No assets on market. Advance to next quarter.</div>}
              {state.acquisitions.map(a => (
                <AcquisitionCard key={a.id} asset={a} onAcquire={handleAcquire} canAfford={state.cash >= a.askPrice} />
              ))}
            </>
          )}

          {activeTab === "develop" && (
            <>
              <div style={styles.sectionTitle}>Development Opportunities</div>
              {state.devSites.length === 0 && <div style={styles.empty}>No development sites. Advance to next quarter.</div>}
              {state.devSites.map(s => (
                <DevCard key={s.id} site={s} onDevelop={handleDevelop} canAfford={state.cash >= s.devCost} />
              ))}
            </>
          )}
        </div>

        {/* RIGHT — EVENTS / HISTORY */}
        <div style={styles.rightPanel}>
          <div style={styles.tabs}>
            {["events", "history"].map(t => (
              <button key={t} style={styles.tab(rightTab === t)} onClick={() => setRightTab(t)}>
                {t === "events" ? "Event Log" : "Performance"}
              </button>
            ))}
          </div>

          {rightTab === "events" && (
            <div style={styles.eventLog}>
              {state.events.length === 0 && <div style={styles.empty}>Game starts with 3 assets. Advance to begin.</div>}
              {[...state.events].reverse().map((e, i) => (
                <div key={i} style={styles.eventItem}>{e}</div>
              ))}
            </div>
          )}

          {rightTab === "history" && (
            <div style={styles.eventLog}>
              {state.history.length === 0 && <div style={styles.empty}>Advance quarters to see performance history.</div>}
              {[...state.history].reverse().map((h, i) => (
                <div key={i} style={{ ...styles.eventItem, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                  <div style={{ gridColumn: "1 / -1", fontWeight: 600, color: theme.text, marginBottom: "2px" }}>
                    {getQuarterLabel(h.quarter, state.year)}
                  </div>
                  <div>GAV: {formatM(h.totalGAV)}</div>
                  <div>Cash: {formatM(h.cash)}</div>
                  <div>Occ: {pct(h.avgOcc)}</div>
                  <div>NOI: {formatM(h.noi)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
