import { useState, useCallback, useEffect, useRef } from "react";

const MARKETS = [
  { id: "uk", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", baseRent: 7.5, capRate: 4.8, demand: 0.85 },
  { id: "de", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}", baseRent: 5.2, capRate: 4.2, demand: 0.80 },
  { id: "fr", name: "France", flag: "\u{1F1EB}\u{1F1F7}", baseRent: 5.8, capRate: 4.5, demand: 0.75 },
  { id: "pl", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}", baseRent: 4.2, capRate: 6.5, demand: 0.90 },
  { id: "nl", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", baseRent: 6.8, capRate: 4.0, demand: 0.82 },
  { id: "cz", name: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}", baseRent: 4.8, capRate: 5.8, demand: 0.78 },
  { id: "es", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}", baseRent: 5.0, capRate: 5.2, demand: 0.72 },
  { id: "se", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}", baseRent: 6.2, capRate: 4.3, demand: 0.70 },
];

const ASSET_CLASSES = [
  { id: "bigbox", name: "Big Box / Distribution", icon: "\u{1F4E6}", rentMult: 1.0, capRateMult: 1.0, riskFactor: 0.05, demandMult: 1.0, desc: "Core logistics \u2014 stable, institutional favourite" },
  { id: "lastmile", name: "Last Mile / Urban", icon: "\u{1F3D9}\uFE0F", rentMult: 1.35, capRateMult: 0.85, riskFactor: 0.08, demandMult: 1.1, desc: "Smaller urban units, premium rents" },
  { id: "fulfilment", name: "Fulfilment Centre", icon: "\u{1F6D2}", rentMult: 1.15, capRateMult: 0.95, riskFactor: 0.07, demandMult: 1.05, desc: "Mid-risk, e-commerce driven" },
  { id: "datactr", name: "Data Centre", icon: "\u{1F5A5}\uFE0F", rentMult: 2.2, capRateMult: 0.7, riskFactor: 0.15, demandMult: 0.7, desc: "High yield, volatile tech demand" },
  { id: "coldstor", name: "Cold Storage", icon: "\u2744\uFE0F", rentMult: 1.5, capRateMult: 0.9, riskFactor: 0.10, demandMult: 0.75, desc: "Specialist niche, limited tenant pool" },
];

const ASSET_NAMES = ["Gateway Park","CrossDock Hub","Horizon Centre","Apex Park","Keystone DC","Matrix Campus","Pinnacle Park","Velocity DC","Summit Estate","Nexus Centre","Meridian Park","Atlas Hub","Eclipse DC","Vanguard Park","Quantum Hub","Sterling Complex","Northgate Industrial","Riverside Park","Centrepoint DC","Orbital Park"];

const TENANT_POOL = {
  bigbox: ["Amazon","DHL","DB Schenker","XPO","GXO","DSV Panalpina","Kuehne+Nagel","Lidl Distribution"],
  lastmile: ["Amazon Logistics","DPD","Evri","Royal Mail","GLS","InPost"],
  fulfilment: ["Amazon","ASOS Fulfilment","Zalando","Decathlon","Ocado","Boohoo"],
  datactr: ["Equinix","Digital Realty","AWS","Microsoft Azure","Google Cloud","NTT"],
  coldstor: ["Lineage Logistics","Americold","Tesco Distribution","HelloFresh","Sysco"],
};

const TEAM_ROLES = [
  { id: "transactions", name: "Transactions", icon: "\u{1F91D}", salaryCost: 120000, desc: "Better deal discovery, lower asking prices" },
  { id: "assetMgmt", name: "Asset Management", icon: "\u{1F527}", salaryCost: 100000, desc: "Better occupancy, faster lease-up, proactive maintenance" },
  { id: "portfolioMgmt", name: "Portfolio Management", icon: "\u{1F4CA}", salaryCost: 130000, desc: "Strategic oversight, market timing, risk monitoring" },
];

const MAINTENANCE_TYPES = [
  { id: "rm", name: "R&M", costPerSqm: 3, gradeUp: false, esgBoost: false, occBoost: 0 },
  { id: "esg", name: "ESG Upgrade", costPerSqm: 18, gradeUp: false, esgBoost: true, occBoost: 0.05 },
  { id: "refurb", name: "Refurbishment", costPerSqm: 35, gradeUp: true, esgBoost: false, occBoost: 0.08 },
];

const URGENT_ISSUES = [
  { name: "Roof leak reported", severity: 0.08, fixCostPerSqm: 8 },
  { name: "Dock door mechanism failure", severity: 0.05, fixCostPerSqm: 4 },
  { name: "Fire suppression needs replacement", severity: 0.10, fixCostPerSqm: 12 },
  { name: "HVAC failure in temp-controlled unit", severity: 0.12, fixCostPerSqm: 10 },
  { name: "Yard surfacing deterioration", severity: 0.04, fixCostPerSqm: 6 },
  { name: "EPC rating below regulatory minimum", severity: 0.06, fixCostPerSqm: 15 },
  { name: "Structural crack in load-bearing wall", severity: 0.15, fixCostPerSqm: 25 },
];

const randomFrom = (a) => a[Math.floor(Math.random() * a.length)];
const randomBetween = (a, b) => a + Math.random() * (b - a);
const formatM = (n) => "\u20AC" + (n / 1e6).toFixed(1) + "m";
const formatK = (n) => "\u20AC" + (n / 1e3).toFixed(0) + "k";
const pct = (n) => (n * 100).toFixed(1) + "%";

const GLOSSARY = {
  "Portfolio GAV": "Gross Asset Value \u2014 total market value of all assets",
  "Assets": "Number of properties (including developments)",
  "Total GLA": "Gross Lettable Area \u2014 total floor space in sqm",
  "Avg Occupancy": "Weighted average % leased (by GLA)",
  "GRI p.a.": "Gross Rental Income per annum",
  "NOI p.a.": "Net Operating Income \u2014 rent minus opex & team costs",
  "NOI Yield": "NOI as % of GAV",
  "Avg WALT": "Weighted Average Lease Term in years",
  "GLA": "Gross Lettable Area in sqm",
  "Occupancy": "% of GLA currently leased",
  "GAV": "Gross Asset Value",
  "Rent p.a.": "Annual rental income for this asset",
  "Rent/sqm": "Headline rent per square metre",
  "WALT": "Years remaining on current lease",
  "Asking": "Seller's asking price",
  "NIY": "Net Initial Yield \u2014 NOI / purchase price",
  "Dev Cost": "Total development cost",
  "Timeline": "Quarters until completion",
  "Est. Rent/sqm": "Estimated rent once complete",
  "Est. YOC": "Estimated Yield on Cost",
  "Cost": "Total committed development cost",
  "Completion": "Quarters remaining",
  "Team Cost": "Quarterly salary cost for your team",
};

// ---- THEME ----
const theme = {
  bg: "#0a0f1a", card: "#111827", border: "#1e2a3a", accent: "#3b82f6", accentDim: "#1e3a5f",
  green: "#10b981", greenDim: "#064e3b", red: "#ef4444", redDim: "#7f1d1d", amber: "#f59e0b", amberDim: "#78350f",
  text: "#e2e8f0", textDim: "#94a3b8", textMuted: "#7c8ba3", white: "#ffffff",
};

// ---- COMPONENTS ----
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onE = (e) => { const r = e.currentTarget.getBoundingClientRect(); setPos({ x: r.left + r.width / 2, y: r.bottom + 6 }); setShow(true); };
  return (
    <span onMouseEnter={onE} onMouseLeave={() => setShow(false)} style={{ cursor: "help", borderBottom: "1px dotted " + theme.textMuted, position: "relative" }}>
      {children}
      {show && <span style={{ position: "fixed", left: Math.min(pos.x, (typeof window !== "undefined" ? window.innerWidth : 800) - 240), top: pos.y, transform: "translateX(-50%)", background: "#1e293b", color: "#e2e8f0", padding: "8px 12px", borderRadius: "6px", fontSize: "11px", lineHeight: 1.5, maxWidth: "240px", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.5)", border: "1px solid #2d3f56", pointerEvents: "none", whiteSpace: "normal", letterSpacing: "0", textTransform: "none" }}>{text}</span>}
    </span>
  );
}
function TipLabel({ label, style: s }) { const t = GLOSSARY[label]; return t ? <div style={s}><Tooltip text={t}>{label}</Tooltip></div> : <div style={s}>{label}</div>; }

function LogoSVG({ size = 28 }) {
  return (<svg viewBox="0 0 40 40" style={{ width: size, height: size, flexShrink: 0 }}>
    <rect x="4" y="20" width="24" height="16" rx="1" fill="#3b82f6" opacity="0.8" />
    <rect x="4" y="20" width="24" height="3" rx="0.5" fill="#60a5fa" opacity="0.6" />
    <rect x="7" y="28" width="5" height="8" rx="0.5" fill="#1e3a5f" />
    <rect x="14" y="28" width="5" height="8" rx="0.5" fill="#1e3a5f" />
    <rect x="21" y="28" width="5" height="8" rx="0.5" fill="#1e3a5f" />
    <rect x="30" y="4" width="2.5" height="32" rx="0.5" fill="#64748b" />
    <rect x="14" y="4" width="22" height="2" rx="0.5" fill="#94a3b8" />
    <line x1="18" y1="6" x2="18" y2="16" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2,1.5" />
    <path d="M16 15 L18 16 L20 15" stroke="#60a5fa" strokeWidth="1" fill="none" strokeLinecap="round" />
    <rect x="33" y="4" width="4" height="4" rx="0.5" fill="#475569" />
    <line x1="29" y1="36" x2="34" y2="36" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
  </svg>);
}

function Sparkline({ data, color = "#3b82f6", height = 40 }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1, w = 200, h = height, p = 2;
  const pts = data.map((v, i) => (p + (i / (data.length - 1)) * (w - p * 2)) + "," + (h - p - ((v - mn) / rng) * (h - p * 2)));
  const lp = pts[pts.length - 1].split(",");
  return (<svg viewBox={"0 0 " + w + " " + h} style={{ width: "100%", height, display: "block" }}>
    <defs><linearGradient id={"sp" + color.replace("#","")} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    <polygon points={[...pts, (p + (w - p * 2)) + "," + h, p + "," + h].join(" ")} fill={"url(#sp" + color.replace("#","") + ")"} />
    <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx={lp[0]} cy={lp[1]} r="3" fill={color} />
  </svg>);
}

function WarehouseSVG({ condition, gla, developing, assetClass, seed = 0 }) {
  const w = 120, h = 80, sr = Math.min(1, Math.max(0.5, gla / 50000));
  const bW = 60 + sr * 30, bH = 30 + sr * 15, bx = (w - bW) / 2, by = h - bH - 10, v = seed % 3;
  const isD = assetClass === "datactr", isC = assetClass === "coldstor";
  const c = developing ? { wall: "#1e3a5f", roof: "#2563eb", acc: "#3b82f6", gnd: "#0f172a", door: "#1e40af", win: "#60a5fa" }
    : condition === "A" ? { wall: isD ? "#1a1a2e" : isC ? "#1a2e3a" : "#1a2e44", roof: isD ? "#7c3aed" : isC ? "#06b6d4" : "#0ea5e9", acc: isD ? "#a78bfa" : isC ? "#22d3ee" : "#38bdf8", gnd: "#0f1a28", door: isD ? "#5b21b6" : "#0284c7", win: isD ? "#c4b5fd" : "#7dd3fc" }
    : condition === "B" ? { wall: "#2a2520", roof: "#b45309", acc: "#d97706", gnd: "#1a1510", door: "#92400e", win: "#fbbf24" }
    : { wall: "#2a2020", roof: "#991b1b", acc: "#dc2626", gnd: "#1a1010", door: "#7f1d1d", win: "#f87171" };
  const dk = condition === "A" ? 4 : condition === "B" ? 3 : 2, dW = (bW - 10) / dk;
  return (<svg viewBox={"0 0 " + w + " " + h} style={{ width: "100%", height: "100%", borderRadius: "6px" }}>
    <rect width={w} height={h} fill={c.gnd} />
    {[...Array(5)].map((_, i) => <circle key={i} cx={(seed * 17 + i * 29) % w} cy={3 + (i * 7) % 18} r="0.5" fill="#fff" opacity="0.2" />)}
    <rect x="0" y={h - 10} width={w} height="10" fill={c.gnd} />
    {developing ? <>
      <line x1={w / 2} y1={by - 20} x2={w / 2} y2={by + bH} stroke={c.acc} strokeWidth="1.5" />
      <line x1={w / 2 - 20} y1={by - 18} x2={w / 2 + 25} y2={by - 18} stroke={c.acc} strokeWidth="1" />
      <rect x={bx} y={by + bH * 0.4} width={bW} height={bH * 0.6} fill={c.wall} stroke={c.acc} strokeWidth="0.5" opacity="0.6" strokeDasharray="3,2" />
    </> : <>
      <rect x={bx} y={by} width={bW} height={bH} fill={c.wall} stroke={c.acc} strokeWidth="0.4" />
      {v === 0 && <polygon points={bx + "," + by + " " + (bx + bW / 2) + "," + (by - 6) + " " + (bx + bW) + "," + by} fill={c.roof} opacity="0.8" />}
      {v === 1 && <rect x={bx} y={by - 3} width={bW} height="3" fill={c.roof} opacity="0.8" />}
      {v === 2 && <><rect x={bx} y={by - 2} width={bW} height="2" fill={c.roof} opacity="0.8" /><rect x={bx + bW * 0.6} y={by - 10} width={bW * 0.25} height="10" fill={c.wall} stroke={c.acc} strokeWidth="0.3" /></>}
      {[...Array(dk)].map((_, i) => <rect key={i} x={bx + 5 + i * dW} y={by + bH - 10} width={dW - 3} height="10" fill={c.door} opacity="0.7" rx="1" />)}
      {condition !== "C" && [...Array(Math.floor(bW / 15))].map((_, i) => <rect key={i} x={bx + 8 + i * 15} y={by + 5} width={6} height={4} fill={c.win} opacity={condition === "A" ? "0.5" : "0.25"} rx="0.5" />)}
    </>}
  </svg>);
}

// ---- GAME ENGINE ----
let assetCounter = 0, usedNames = new Set();

function generateAsset(market, acId) {
  assetCounter++;
  const ac = ASSET_CLASSES.find(a => a.id === acId) || ASSET_CLASSES[0];
  let name; do { name = randomFrom(ASSET_NAMES); } while (usedNames.has(market.id + name) && usedNames.size < 160);
  usedNames.add(market.id + name);
  const gla = ac.id === "lastmile" ? Math.round(randomBetween(3, 15)) * 1000 : ac.id === "datactr" ? Math.round(randomBetween(5, 20)) * 1000 : Math.round(randomBetween(10, 60)) * 1000;
  const rentPsm = market.baseRent * ac.rentMult * randomBetween(0.88, 1.15);
  const occ = Math.min(1, Math.max(0, market.demand * ac.demandMult * randomBetween(0.75, 1.1)));
  const tenant = occ > 0.5 ? randomFrom(TENANT_POOL[ac.id] || TENANT_POOL.bigbox) : null;
  const walt = occ > 0.5 ? Math.round(randomBetween(1, 8)) : 0;
  const gri = gla * rentPsm * occ;
  const val = gri / (market.capRate * ac.capRateMult / 100);
  const age = Math.round(randomBetween(2, 25));
  const cond = age < 5 ? "A" : age < 12 ? "B" : "C";
  const epc = cond === "A" ? randomFrom(["A", "B"]) : cond === "B" ? randomFrom(["B", "C"]) : randomFrom(["C", "D", "E"]);
  return { id: "a" + assetCounter, name, market: market.id, marketName: market.name, flag: market.flag, assetClass: ac.id, assetClassName: ac.name, assetClassIcon: ac.icon, gla, rentPsm, occupancy: occ, tenant, leaseRemaining: walt, gri, value: val, age, condition: cond, epcRating: epc, capexSpent: 0, acquired: true, developing: false, devQuartersLeft: 0, visualSeed: assetCounter, urgentIssue: null, lastRM: 0 };
}

function generateMarketAsset(market, txBonus) {
  const a = generateAsset(market, randomFrom(ASSET_CLASSES).id);
  a.acquired = false;
  const disc = Math.min(0.12, (txBonus || 0) * 0.02);
  a.askPrice = a.value * randomBetween(0.95 - disc, 1.15 - disc);
  return a;
}

function generateDevSite(market) {
  const ac = randomFrom(ASSET_CLASSES); assetCounter++;
  let name; do { name = randomFrom(ASSET_NAMES); } while (usedNames.has("d" + market.id + name)); usedNames.add("d" + market.id + name);
  const gla = ac.id === "lastmile" ? Math.round(randomBetween(3, 12)) * 1000 : Math.round(randomBetween(15, 50)) * 1000;
  return { id: "d" + assetCounter, name: name + " (Dev)", market: market.id, marketName: market.name, flag: market.flag, assetClass: ac.id, assetClassName: ac.name, assetClassIcon: ac.icon, gla, devCost: gla * randomBetween(400, 700) * ac.rentMult, estRentPsm: market.baseRent * ac.rentMult * randomBetween(1.0, 1.3), estYield: market.capRate * ac.capRateMult * randomBetween(1.05, 1.25), quartersToComplete: Math.round(randomBetween(3, 6)) };
}

function initGame(cfg = {}) {
  const { companyName = "NewCo", cash = 150e6, startMarkets: sm = ["uk", "de", "pl"], difficulty = "guided" } = cfg;
  usedNames = new Set(); assetCounter = 0;
  const portfolio = [];
  if (difficulty === "guided") { const cls = ["bigbox", "fulfilment", "lastmile"]; sm.forEach((mId, i) => { const m = MARKETS.find(x => x.id === mId); if (m) portfolio.push(generateAsset(m, cls[i % cls.length])); }); }
  const team = { transactions: 1, assetMgmt: 1, portfolioMgmt: 1 };
  return { companyName, quarter: 1, year: 2025, cash, portfolio, team, acquisitions: MARKETS.slice(0, 5).map(m => generateMarketAsset(m, 1)), devSites: [MARKETS[0], MARKETS[3]].map(m => generateDevSite(m)), history: [], events: [] };
}

function getQuarterLabel(q, y) { return "Q" + (((q - 1) % 4) + 1) + " " + (y + Math.floor((q - 1) / 4)); }
function getTeamQCost(t) { return TEAM_ROLES.reduce((s, r) => s + (t[r.id] || 0) * r.salaryCost / 4, 0); }

function computeMetrics(state) {
  const { portfolio, team } = state;
  if (!portfolio.length) return { totalGAV: 0, totalGRI: 0, avgOcc: 0, avgWALT: 0, noi: 0, noiYield: 0, assetCount: 0, totalGLA: 0 };
  const op = portfolio.filter(a => !a.developing);
  const totalGAV = portfolio.reduce((s, a) => s + (a.developing ? a.devCostSoFar || 0 : a.value), 0);
  const totalGRI = op.reduce((s, a) => s + a.gri, 0);
  const totalGLA = portfolio.reduce((s, a) => s + a.gla, 0);
  const glaSumOp = op.reduce((s, a) => s + a.gla, 0);
  const avgOcc = glaSumOp > 0 ? op.reduce((s, a) => s + a.occupancy * a.gla, 0) / glaSumOp : 0;
  const griWithWalt = op.reduce((s, a) => s + (a.leaseRemaining > 0 ? a.gri : 0), 0);
  const avgWALT = griWithWalt > 0 ? op.reduce((s, a) => s + a.leaseRemaining * a.gri, 0) / griWithWalt : 0;
  const noi = totalGRI * 0.85 - getTeamQCost(team || {}) * 4;
  const noiYield = totalGAV > 0 ? noi / totalGAV : 0;
  return { totalGAV, totalGRI, avgOcc, avgWALT, noi, noiYield, assetCount: portfolio.length, totalGLA };
}

function advanceQuarter(state) {
  let { quarter, year, cash, portfolio, acquisitions, devSites, history, team } = state;
  const ev = []; quarter++;
  const ql = getQuarterLabel(quarter, year);
  const tc = getTeamQCost(team); cash -= tc;
  if (tc > 0) ev.push(ql + ": Team salaries (" + formatK(tc) + ")");
  const op = portfolio.filter(a => !a.developing);
  const qr = op.reduce((s, a) => s + a.gri / 4, 0), qo = qr * 0.15;
  cash += qr - qo;
  ev.push(ql + ": Rent " + formatK(qr) + ", opex " + formatK(qo));
  const am = Math.min(5, team.assetMgmt || 0), tx = Math.min(5, team.transactions || 0);

  portfolio.forEach(a => {
    if (a.developing) {
      a.devQuartersLeft--; a.devCostSoFar = (a.devCostSoFar || 0) + (a.totalDevCost || 0) / (a.totalDevQuarters || 4);
      if (a.devQuartersLeft <= 0) {
        a.developing = false; a.occupancy = 0; a.condition = "A"; a.age = 0; a.epcRating = "A";
        const m = MARKETS.find(x => x.id === a.market), ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0];
        a.gri = 0; a.value = a.gla * a.rentPsm / ((m?.capRate || 5) * (ac?.capRateMult || 1) / 100);
        ev.push("\u{1F3D7}\uFE0F " + a.flag + " " + a.name + " completed!");
      }
      return;
    }
    const mkt = MARKETS.find(m => m.id === a.market), ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0];
    if (!a.urgentIssue && Math.random() < (0.06 + ac.riskFactor * 0.3)) { a.urgentIssue = { ...randomFrom(URGENT_ISSUES) }; ev.push("\u{1F6A8} " + a.flag + " " + a.name + ": " + a.urgentIssue.name); }
    if (a.urgentIssue) a.occupancy = Math.max(0, a.occupancy - a.urgentIssue.severity * 0.3);
    const dr = 0.08 - am * 0.008;
    a.occupancy = Math.min(1, Math.max(0, a.occupancy + randomBetween(-dr, dr + am * 0.005)));
    if (a.leaseRemaining > 0) { a.leaseRemaining -= 0.25; if (a.leaseRemaining <= 0) { if (Math.random() < 0.45 + am * 0.05) { a.leaseRemaining = Math.round(randomBetween(3, 7)); a.rentPsm *= randomBetween(1.0, 1.08); ev.push("\u2705 " + a.flag + " " + a.name + ": " + a.tenant + " renewed"); } else { a.occupancy = Math.max(0, a.occupancy - randomBetween(0.2, 0.5)); a.tenant = null; ev.push("\u26A0\uFE0F " + a.flag + " " + a.name + ": Tenant vacated"); } } }
    else if (a.occupancy < 0.7 && Math.random() < 0.2 + am * 0.04) { a.occupancy = Math.min(1, a.occupancy + randomBetween(0.15, 0.4)); a.tenant = randomFrom(TENANT_POOL[a.assetClass] || TENANT_POOL.bigbox); a.leaseRemaining = Math.round(randomBetween(3, 7)); ev.push("\u{1F91D} " + a.flag + " " + a.name + ": New lease with " + a.tenant); }
    const rmGap = quarter - (a.lastRM || 0);
    if (rmGap > 4 && Math.random() < 0.08 && a.condition !== "C") { a.condition = a.condition === "A" ? "B" : "C"; a.rentPsm *= 0.95; ev.push("\u{1F527} " + a.flag + " " + a.name + ": Degraded to Grade " + a.condition); }
    const ecr = (mkt?.capRate || 5) * (ac?.capRateMult || 1);
    a.gri = a.gla * a.rentPsm * a.occupancy;
    a.value = a.gri > 0 ? a.gri / (ecr / 100) : a.gla * (mkt?.baseRent || 5) * 0.3 / (ecr / 100);
  });
  if (quarter % 2 === 0) {
    acquisitions = MARKETS.slice(0, Math.min(8, 4 + tx)).map(m => generateMarketAsset(m, tx));
    devSites = [randomFrom(MARKETS.slice(0, 4)), randomFrom(MARKETS.slice(2))].map(m => generateDevSite(m));
  }
  const metrics = computeMetrics({ portfolio, team });
  history.push({ quarter, ...metrics, cash });
  return { ...state, quarter, cash, portfolio: [...portfolio], acquisitions, devSites, history, events: ev };
}

// ---- SENTIMENT ----
function generateSentiment(metrics, history) {
  const s = [], bc = [], prev = history.length >= 2 ? history[history.length - 2] : null;
  s.push(metrics.totalGAV > 5e8 ? { metric: "GAV", mood: "positive", label: "Strong", comment: "Portfolio scale is where we need it." } : metrics.totalGAV > 2e8 ? { metric: "GAV", mood: "neutral", label: "Growing", comment: "Decent but need to deploy more capital." } : { metric: "GAV", mood: "negative", label: "Thin", comment: "Under-scaled. Board expects faster deployment." });
  s.push(metrics.avgOcc > 0.9 ? { metric: "Occupancy", mood: "positive", label: "Excellent", comment: "Best-in-class. Protect these tenants." } : metrics.avgOcc > 0.75 ? { metric: "Occupancy", mood: "neutral", label: "Acceptable", comment: "Leaving income on the table." } : { metric: "Occupancy", mood: "negative", label: "Concerning", comment: "Too much vacancy." });
  s.push(metrics.noiYield > 0.05 ? { metric: "NOI Yield", mood: "positive", label: "Outperforming", comment: "Ahead of benchmark." } : metrics.noiYield > 0.035 ? { metric: "NOI Yield", mood: "neutral", label: "In-line", comment: "Not exciting. Push rents." } : { metric: "NOI Yield", mood: "negative", label: "Below Target", comment: "Are we overpaying?" });
  if (prev) {
    if (metrics.totalGAV > prev.totalGAV * 1.05) bc.push({ member: "CIO", text: "GAV growth this quarter is strong." });
    if (metrics.avgOcc < prev.avgOcc - 0.05) bc.push({ member: "COO", text: "Occupancy slipped. I want a recovery plan." });
    if (metrics.noi > prev.noi * 1.03) bc.push({ member: "CFO", text: "NOI trending well." });
  }
  if (!bc.length) bc.push({ member: history.length <= 1 ? "Board Chair" : "CFO", text: history.length <= 1 ? "Welcome. Show us what you can build." : "Steady quarter. We need growth." });
  return { sentiments: s, boardComments: bc };
}

function SentimentBadge({ mood, label }) {
  const c = { positive: { bg: "#064e3b", b: "#10b981", t: "#10b981", i: "\u25B2" }, neutral: { bg: "#78350f", b: "#f59e0b", t: "#f59e0b", i: "\u25CF" }, negative: { bg: "#7f1d1d", b: "#ef4444", t: "#ef4444", i: "\u25BC" } }[mood] || {};
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, background: c.bg, color: c.t, border: "1px solid " + c.b }}>{c.i} {label}</span>;
}

// ---- STYLES ----
const S = {
  app: { minHeight: "100vh", background: "linear-gradient(180deg, " + theme.bg + " 0%, #0d1321 100%)", color: theme.text, fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: 1.5 },
  hdr: { padding: "14px 18px", borderBottom: "1px solid " + theme.border, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  mBar: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1px", background: "#cbd5e1", borderBottom: "1px solid " + theme.border },
  mCell: { background: "#f1f5f9", padding: "10px 12px", textAlign: "center" },
  mLbl: { fontSize: "9px", color: "#1e3a5f", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" },
  mVal: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  main: { display: "grid", gridTemplateColumns: "1fr 330px", minHeight: "calc(100vh - 130px)" },
  lp: { padding: "12px 16px", overflowY: "auto", borderRight: "1px solid " + theme.border },
  rp: { padding: "12px 16px", overflowY: "auto", background: "#0c1120" },
  tabs: { display: "flex", gap: "2px", marginBottom: "12px", background: theme.border, borderRadius: "7px", padding: "2px" },
  tab: (a) => ({ flex: 1, padding: "6px 8px", background: a ? theme.card : "transparent", color: a ? theme.white : theme.textDim, border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "inherit" }),
  card: { background: theme.card, border: "1px solid " + theme.border, borderRadius: "7px", padding: "10px 12px", marginBottom: "7px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", marginTop: "6px" },
  stat: { fontSize: "10px", color: theme.textDim, letterSpacing: "0.04em", textTransform: "uppercase" },
  val: { fontSize: "13px", fontWeight: 600, color: theme.text },
  btn: (v) => ({ padding: "5px 10px", border: "1px solid " + (v === "green" ? theme.green : v === "red" ? theme.red : v === "amber" ? theme.amber : theme.accent), background: v === "green" ? theme.greenDim : v === "red" ? theme.redDim : v === "amber" ? theme.amberDim : theme.accentDim, color: v === "green" ? theme.green : v === "red" ? theme.red : v === "amber" ? theme.amber : theme.accent, borderRadius: "4px", cursor: "pointer", fontSize: "10px", fontWeight: 600, fontFamily: "inherit" }),
  row: { display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" },
  sec: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textDim, marginBottom: "8px", marginTop: "4px" },
  evLog: { fontSize: "11px", lineHeight: 1.7, color: theme.textDim },
  evItem: { padding: "4px 0", borderBottom: "1px solid " + theme.border },
  empty: { padding: "18px", textAlign: "center", color: theme.textDim, fontSize: "12px" },
  cond: (c) => ({ display: "inline-block", padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 700, background: c === "A" ? theme.greenDim : c === "B" ? theme.amberDim : theme.redDim, color: c === "A" ? theme.green : c === "B" ? theme.amber : theme.red }),
  urgent: { display: "inline-block", padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 700, background: theme.redDim, color: theme.red, marginLeft: "5px" },
};

// ---- CARD COMPONENTS ----
function MetricCell({ label, value, color }) {
  const dm = { [theme.green]: "#047857", [theme.amber]: "#b45309", [theme.red]: "#dc2626" };
  return <div style={S.mCell}><TipLabel label={label} style={S.mLbl} /><div style={{ ...S.mVal, color: color ? (dm[color] || color) : "#0f172a" }}>{value}</div></div>;
}

function AssetCard({ asset, onMaintenance, onDispose, onFixIssue }) {
  const ac = ASSET_CLASSES.find(x => x.id === asset.assetClass);
  const thumb = <div style={{ width: "85px", minWidth: "85px", height: "56px", borderRadius: "5px", overflow: "hidden" }}><WarehouseSVG condition={asset.condition} gla={asset.gla} developing={asset.developing} assetClass={asset.assetClass} seed={asset.visualSeed || 0} /></div>;
  if (asset.developing) {
    const pD = ((asset.totalDevQuarters || 4) - asset.devQuartersLeft) / (asset.totalDevQuarters || 4) * 100;
    return (<div style={S.card}><div style={{ display: "flex", gap: "10px" }}>{thumb}<div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: "13px", fontWeight: 700, color: theme.white }}>{asset.flag} {asset.name}</div><div style={{ fontSize: "11px", color: theme.textDim }}>{ac?.icon} {asset.assetClassName} \u00B7 {asset.marketName} \u00B7 Dev</div></div><span style={S.cond("A")}>DEV</span></div></div></div>
      <div style={S.grid}><div><TipLabel label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla / 1000).toFixed(0)}k</div></div><div><TipLabel label="Cost" style={S.stat} /><div style={S.val}>{formatM(asset.totalDevCost || 0)}</div></div><div><TipLabel label="Completion" style={S.stat} /><div style={S.val}>{asset.devQuartersLeft}Q</div></div></div>
      <div style={{ height: "3px", background: theme.border, borderRadius: "2px", marginTop: "4px" }}><div style={{ height: "100%", width: pD + "%", background: theme.accent, borderRadius: "2px" }} /></div></div>);
  }
  return (<div style={S.card}><div style={{ display: "flex", gap: "10px" }}>{thumb}<div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div><div style={{ fontSize: "13px", fontWeight: 700, color: theme.white }}>{asset.flag} {asset.name}{asset.urgentIssue && <span style={S.urgent}>{"\u26A0"} ISSUE</span>}</div><div style={{ fontSize: "11px", color: theme.textDim }}>{ac?.icon} {asset.assetClassName} \u00B7 {asset.marketName}{asset.tenant && <> \u00B7 <span style={{ color: theme.accent }}>{asset.tenant}</span></>}</div></div><div style={{ display: "flex", gap: "3px" }}><span style={{ fontSize: "9px", color: theme.textDim, padding: "2px 5px", background: theme.accentDim, borderRadius: "3px" }}>EPC {asset.epcRating}</span><span style={S.cond(asset.condition)}>Gr {asset.condition}</span></div></div></div></div>
    {asset.urgentIssue && <div style={{ margin: "5px 0", padding: "5px 8px", background: theme.redDim, border: "1px solid " + theme.red, borderRadius: "4px", fontSize: "10px", color: theme.red }}>{"\u{1F6A8}"} {asset.urgentIssue.name} <button style={{ ...S.btn("red"), marginLeft: "6px", padding: "2px 6px", fontSize: "9px" }} onClick={() => onFixIssue(asset.id)}>Fix ({formatK(asset.gla * asset.urgentIssue.fixCostPerSqm)})</button></div>}
    <div style={S.grid}>
      <div><TipLabel label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla / 1000).toFixed(0)}k</div></div>
      <div><TipLabel label="Occupancy" style={S.stat} /><div style={{ ...S.val, color: asset.occupancy > 0.85 ? theme.green : asset.occupancy > 0.6 ? theme.amber : theme.red }}>{pct(asset.occupancy)}</div></div>
      <div><TipLabel label="GAV" style={S.stat} /><div style={S.val}>{formatM(asset.value)}</div></div>
      <div><TipLabel label="Rent p.a." style={S.stat} /><div style={S.val}>{formatK(asset.gri)}</div></div>
      <div><TipLabel label="Rent/sqm" style={S.stat} /><div style={S.val}>{"\u20AC"}{asset.rentPsm.toFixed(1)}</div></div>
      <div><TipLabel label="WALT" style={S.stat} /><div style={S.val}>{asset.leaseRemaining > 0 ? asset.leaseRemaining.toFixed(1) + "yr" : "Vacant"}</div></div>
    </div>
    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", marginTop: "4px" }}><div style={{ height: "100%", width: (asset.occupancy * 100) + "%", background: asset.occupancy > 0.85 ? theme.green : asset.occupancy > 0.6 ? theme.amber : theme.red, borderRadius: "2px" }} /></div>
    <div style={S.row}>
      {MAINTENANCE_TYPES.map(mt => <button key={mt.id} style={S.btn(mt.id === "refurb" ? "amber" : mt.id === "esg" ? "green" : "default")} onClick={() => onMaintenance(asset.id, mt.id)}>{mt.name} ({formatK(asset.gla * mt.costPerSqm)})</button>)}
      <button style={S.btn("red")} onClick={() => onDispose(asset.id)}>Dispose</button>
    </div></div>);
}

function AcqCard({ asset, onAcquire, ok }) {
  const ac = ASSET_CLASSES.find(x => x.id === asset.assetClass);
  return (<div style={{ ...S.card, opacity: ok ? 1 : 0.5 }}><div style={{ display: "flex", gap: "10px" }}><div style={{ width: "85px", minWidth: "85px", height: "56px", borderRadius: "5px", overflow: "hidden" }}><WarehouseSVG condition={asset.condition} gla={asset.gla} assetClass={asset.assetClass} seed={asset.visualSeed || 0} /></div><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: "13px", fontWeight: 700, color: theme.white }}>{asset.flag} {asset.name}</div><div style={{ fontSize: "11px", color: theme.textDim }}>{ac?.icon} {asset.assetClassName} \u00B7 {asset.marketName}{asset.tenant && <> \u00B7 <span style={{ color: theme.accent }}>{asset.tenant}</span></>}</div></div><span style={S.cond(asset.condition)}>Gr {asset.condition}</span></div></div></div>
    <div style={S.grid}><div><TipLabel label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla / 1000).toFixed(0)}k</div></div><div><TipLabel label="Occupancy" style={S.stat} /><div style={{ ...S.val, color: asset.occupancy > 0.85 ? theme.green : theme.amber }}>{pct(asset.occupancy)}</div></div><div><TipLabel label="Asking" style={S.stat} /><div style={S.val}>{formatM(asset.askPrice)}</div></div><div><TipLabel label="Rent p.a." style={S.stat} /><div style={S.val}>{formatK(asset.gri)}</div></div><div><TipLabel label="NIY" style={S.stat} /><div style={S.val}>{pct((asset.gri * 0.85) / asset.askPrice)}</div></div><div><TipLabel label="WALT" style={S.stat} /><div style={S.val}>{asset.leaseRemaining > 0 ? asset.leaseRemaining + "yr" : "Vacant"}</div></div></div>
    <div style={S.row}><button style={S.btn("green")} onClick={() => onAcquire(asset.id)} disabled={!ok}>Acquire</button></div></div>);
}

function DevCardC({ site, onDevelop, ok }) {
  const ac = ASSET_CLASSES.find(x => x.id === site.assetClass);
  return (<div style={{ ...S.card, opacity: ok ? 1 : 0.5 }}><div style={{ display: "flex", gap: "10px" }}><div style={{ width: "85px", minWidth: "85px", height: "56px", borderRadius: "5px", overflow: "hidden" }}><WarehouseSVG condition="A" gla={site.gla} developing={true} assetClass={site.assetClass} seed={parseInt(site.id.replace(/\D/g, "")) || 0} /></div><div style={{ flex: 1 }}><div><div style={{ fontSize: "13px", fontWeight: 700, color: theme.white }}>{site.flag} {site.name}</div><div style={{ fontSize: "11px", color: theme.textDim }}>{ac?.icon} {ac?.name} \u00B7 {site.marketName}</div></div></div></div>
    <div style={S.grid}><div><TipLabel label="GLA" style={S.stat} /><div style={S.val}>{(site.gla / 1000).toFixed(0)}k</div></div><div><TipLabel label="Dev Cost" style={S.stat} /><div style={S.val}>{formatM(site.devCost)}</div></div><div><TipLabel label="Timeline" style={S.stat} /><div style={S.val}>{site.quartersToComplete}Q</div></div><div><TipLabel label="Est. Rent/sqm" style={S.stat} /><div style={S.val}>{"\u20AC"}{site.estRentPsm.toFixed(1)}</div></div><div><TipLabel label="Est. YOC" style={S.stat} /><div style={S.val}>{pct(site.estYield / 100)}</div></div></div>
    <div style={S.row}><button style={S.btn("default")} onClick={() => onDevelop(site.id)} disabled={!ok}>Develop</button></div></div>);
}

function TeamPanel({ team, onHire, onFire }) {
  return (<div><div style={S.sec}>Team Structure</div>
    <div style={{ ...S.card, background: theme.accentDim, border: "1px solid " + theme.accent, marginBottom: "8px" }}><div style={{ fontSize: "11px", color: theme.accent, fontWeight: 600 }}>Quarterly Team Cost: {formatK(getTeamQCost(team))}</div></div>
    {TEAM_ROLES.map(r => { const n = team[r.id] || 0; return (<div key={r.id} style={{ ...S.card, marginBottom: "5px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}><div><span style={{ fontSize: "13px" }}>{r.icon}</span> <span style={{ fontSize: "12px", fontWeight: 700, color: theme.white }}>{r.name}</span></div><span style={{ fontSize: "14px", fontWeight: 700, color: theme.accent }}>{n}</span></div><div style={{ fontSize: "10px", color: theme.textDim, marginBottom: "4px" }}>{r.desc}</div><div style={{ fontSize: "10px", color: theme.textMuted, marginBottom: "5px" }}>Salary: {formatK(r.salaryCost)}/yr per head</div><div style={S.row}><button style={S.btn("green")} onClick={() => onHire(r.id)}>+ Hire</button>{n > 0 && <button style={S.btn("red")} onClick={() => onFire(r.id)}>- Remove</button>}</div></div>); })}</div>);
}

// ---- SAVE/LOAD ----
const SK = "logisim_save";
function saveGame(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} }
function loadGame() { try { const d = localStorage.getItem(SK); return d ? JSON.parse(d) : null; } catch { return null; } }
function hasSavedGame() { try { return !!localStorage.getItem(SK); } catch { return false; } }
function deleteSave() { try { localStorage.removeItem(SK); } catch {} }

// ---- START SCREEN ----
function StartScreen({ onStart }) {
  const [cn, setCn] = useState(""); const [cap, setCap] = useState(150e6); const [diff, setDiff] = useState("guided"); const [sm, setSm] = useState(["uk", "de", "pl"]); const [step, setStep] = useState(0);
  const toggle = (id) => setSm(p => p.includes(id) ? p.filter(m => m !== id) : p.length < 4 ? [...p, id] : p);
  const ok = step === 0 ? cn.trim().length > 0 : step === 1 ? true : sm.length > 0;
  const next = () => { if (step < 2) setStep(step + 1); else onStart({ companyName: cn.trim(), cash: cap, startMarkets: sm, difficulty: diff }); };
  const saved = hasSavedGame() ? loadGame() : null;
  const is = {
    wrap: { minHeight: "100vh", background: "linear-gradient(180deg, " + theme.bg + " 0%, #0d1321 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", color: theme.text, padding: "20px" },
    cont: { maxWidth: "500px", width: "100%" },
    opt: (s) => ({ padding: "11px 12px", background: s ? theme.accentDim : theme.card, border: "1px solid " + (s ? theme.accent : theme.border), borderRadius: "6px", cursor: "pointer", marginBottom: "6px" }),
    mkt: (s) => ({ padding: "9px 10px", background: s ? theme.accentDim : theme.card, border: "1px solid " + (s ? theme.accent : theme.border), borderRadius: "6px", cursor: "pointer", textAlign: "center" }),
    nxt: (e) => ({ flex: 1, padding: "11px 18px", background: e ? "linear-gradient(135deg, " + theme.accent + ", #2563eb)" : theme.card, color: e ? theme.white : theme.textMuted, border: e ? "none" : "1px solid " + theme.border, borderRadius: "6px", cursor: e ? "pointer" : "default", fontSize: "12px", fontWeight: 700, fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase", boxShadow: e ? "0 2px 12px rgba(59,130,246,0.3)" : "none" }),
  };
  const CAPS = [{ l: "\u20AC100m", v: 100e6, d: "Scrappy challenger" }, { l: "\u20AC150m", v: 150e6, d: "Mid-market platform" }, { l: "\u20AC250m", v: 250e6, d: "Institutional player" }];
  const DIFFS = [{ l: "Guided", v: "guided", d: "Start with 3 seed assets" }, { l: "Blank Slate", v: "blank", d: "Cash only \u2014 acquire everything" }];
  return (<div style={is.wrap}><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" /><div style={is.cont}>
    <div style={{ textAlign: "center", marginBottom: "36px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "4px" }}><LogoSVG size={36} /><div style={{ fontSize: "26px", fontWeight: 700, color: theme.white, letterSpacing: "0.06em" }}>LOGISIM</div></div><div style={{ fontSize: "10px", color: theme.textDim, letterSpacing: "0.12em", textTransform: "uppercase" }}>European Logistics Real Estate Simulator</div></div>
    {saved && step === 0 && <div style={{ marginBottom: "16px" }}><div style={{ ...is.opt(false), background: theme.greenDim, border: "1px solid " + theme.green, cursor: "pointer", textAlign: "center" }} onClick={() => onStart("__load__")}><div style={{ fontSize: "13px", fontWeight: 700, color: theme.green, marginBottom: "2px" }}>{"\u25B6"} Continue: {saved.companyName}</div><div style={{ fontSize: "10px", color: theme.textDim }}>{getQuarterLabel(saved.quarter, saved.year)} \u00B7 {saved.portfolio?.length || 0} assets \u00B7 {formatM(saved.cash)}</div></div><div style={{ textAlign: "center", fontSize: "9px", color: theme.textMuted, margin: "10px 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>\u2014 or start fresh \u2014</div></div>}
    <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginBottom: "20px" }}>{[0, 1, 2].map(i => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: step >= i ? theme.accent : theme.border }} />)}</div>
    {step === 0 && <div><div style={{ fontSize: "10px", color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Step 1 of 3</div><div style={{ fontSize: "16px", fontWeight: 700, color: theme.white, marginBottom: "3px" }}>Name your platform</div><div style={{ fontSize: "12px", color: theme.textDim, marginBottom: "16px", lineHeight: 1.5 }}>You're the CEO of a European logistics real estate platform.</div><input style={{ width: "100%", padding: "11px 12px", background: theme.card, border: "1px solid " + theme.border, borderRadius: "6px", color: theme.white, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} placeholder="e.g. Apex Logistics Properties" value={cn} onChange={e => setCn(e.target.value)} onKeyDown={e => e.key === "Enter" && ok && next()} autoFocus /></div>}
    {step === 1 && <div><div style={{ fontSize: "10px", color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Step 2 of 3</div><div style={{ fontSize: "16px", fontWeight: 700, color: theme.white, marginBottom: "3px" }}>Capital & mode</div><div style={{ fontSize: "12px", color: theme.textDim, marginBottom: "14px" }}>How much equity?</div>{CAPS.map(o => <div key={o.v} style={is.opt(cap === o.v)} onClick={() => setCap(o.v)}><div style={{ fontSize: "13px", fontWeight: 600, color: cap === o.v ? theme.accent : theme.white }}>{o.l}</div><div style={{ fontSize: "10px", color: theme.textDim }}>{o.d}</div></div>)}<div style={{ marginTop: "10px" }}>{DIFFS.map(o => <div key={o.v} style={is.opt(diff === o.v)} onClick={() => setDiff(o.v)}><div style={{ fontSize: "13px", fontWeight: 600, color: diff === o.v ? theme.accent : theme.white }}>{o.l}</div><div style={{ fontSize: "10px", color: theme.textDim }}>{o.d}</div></div>)}</div></div>}
    {step === 2 && <div><div style={{ fontSize: "10px", color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Step 3 of 3</div><div style={{ fontSize: "16px", fontWeight: 700, color: theme.white, marginBottom: "3px" }}>Starting markets</div><div style={{ fontSize: "12px", color: theme.textDim, marginBottom: "12px" }}>Pick up to 4.</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>{MARKETS.map(m => <div key={m.id} style={is.mkt(sm.includes(m.id))} onClick={() => toggle(m.id)}><div style={{ fontSize: "17px", marginBottom: "1px" }}>{m.flag}</div><div style={{ fontSize: "11px", fontWeight: 600, color: sm.includes(m.id) ? theme.accent : theme.text }}>{m.name}</div><div style={{ fontSize: "9px", color: theme.textDim }}>Cap {m.capRate}% \u00B7 \u20AC{m.baseRent}/sqm</div></div>)}</div><div style={{ fontSize: "9px", color: theme.textMuted, marginTop: "5px", textAlign: "center" }}>{sm.length}/4 selected</div></div>}
    <div style={{ display: "flex", gap: "6px", marginTop: "24px" }}>{step > 0 && <button style={{ padding: "11px 16px", background: "transparent", color: theme.textDim, border: "1px solid " + theme.border, borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 600, fontFamily: "inherit" }} onClick={() => setStep(step - 1)}>{"\u2190"} Back</button>}<button style={is.nxt(ok)} onClick={() => ok && next()}>{step < 2 ? "Continue \u2192" : "Launch Simulator \u2192"}</button></div>
  </div></div>);
}

// ---- MAIN APP ----
export default function LogisticsRESimulator() {
  const [started, setStarted] = useState(false);
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("portfolio");
  const [rTab, setRTab] = useState("sentiment");
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (state && started) saveGame(state); }, [state, started]);

  const onStart = useCallback((cfg) => { if (cfg === "__load__") { const s = loadGame(); if (s) { setState(s); setStarted(true); } } else { deleteSave(); setState(initGame(cfg)); setStarted(true); } }, []);
  const onAdvance = useCallback(() => setState(p => p ? advanceQuarter(p) : p), []);
  const onAcquire = useCallback((id) => setState(p => { if (!p) return p; const a = p.acquisitions.find(x => x.id === id); if (!a || p.cash < a.askPrice) return p; const q = { ...a, acquired: true, value: a.askPrice }; delete q.askPrice; return { ...p, cash: p.cash - a.askPrice, portfolio: [...p.portfolio, q], acquisitions: p.acquisitions.filter(x => x.id !== id), events: [...p.events, "\u{1F3E2} Acquired " + a.flag + " " + a.name + " for " + formatM(a.askPrice)] }; }), []);
  const onDispose = useCallback((id) => setState(p => { if (!p) return p; const a = p.portfolio.find(x => x.id === id); if (!a) return p; const pr = a.value * 0.97; return { ...p, cash: p.cash + pr, portfolio: p.portfolio.filter(x => x.id !== id), events: [...p.events, "\u{1F4B0} Disposed " + a.flag + " " + a.name + " for " + formatM(pr)] }; }), []);
  const onMaint = useCallback((aid, mid) => setState(p => { if (!p) return p; const mt = MAINTENANCE_TYPES.find(m => m.id === mid); const a = p.portfolio.find(x => x.id === aid); if (!mt || !a) return p; const cost = a.gla * mt.costPerSqm; if (p.cash < cost) return p; const up = p.portfolio.map(x => { if (x.id !== aid) return x; const n = { ...x, capexSpent: x.capexSpent + cost }; if (mid === "rm") n.lastRM = p.quarter; if (mt.gradeUp && n.condition !== "A") { n.condition = n.condition === "C" ? "B" : "A"; n.rentPsm *= 1.08; } if (mt.esgBoost) { n.epcRating = n.epcRating === "E" ? "D" : n.epcRating === "D" ? "C" : n.epcRating === "C" ? "B" : "A"; n.occupancy = Math.min(1, n.occupancy + mt.occBoost); } if (mt.occBoost && !mt.esgBoost) n.occupancy = Math.min(1, n.occupancy + mt.occBoost); const mk = MARKETS.find(m => m.id === n.market), ac = ASSET_CLASSES.find(c => c.id === n.assetClass) || ASSET_CLASSES[0]; n.gri = n.gla * n.rentPsm * n.occupancy; n.value = n.gri > 0 ? n.gri / ((mk?.capRate || 5) * (ac?.capRateMult || 1) / 100) : n.value; return n; }); return { ...p, cash: p.cash - cost, portfolio: up, events: [...p.events, "\u{1F527} " + mt.name + " on " + a.flag + " " + a.name + " (" + formatK(cost) + ")"] }; }), []);
  const onFix = useCallback((aid) => setState(p => { if (!p) return p; const a = p.portfolio.find(x => x.id === aid); if (!a || !a.urgentIssue) return p; const cost = a.gla * a.urgentIssue.fixCostPerSqm; if (p.cash < cost) return p; return { ...p, cash: p.cash - cost, portfolio: p.portfolio.map(x => x.id !== aid ? x : { ...x, urgentIssue: null, capexSpent: x.capexSpent + cost }), events: [...p.events, "\u2705 Fixed " + a.flag + " " + a.name + " (" + formatK(cost) + ")"] }; }), []);
  const onDev = useCallback((id) => setState(p => { if (!p) return p; const s = p.devSites.find(x => x.id === id); if (!s || p.cash < s.devCost) return p; assetCounter++; const d = { id: s.id, name: s.name.replace(" (Dev)", ""), market: s.market, marketName: s.marketName, flag: s.flag, assetClass: s.assetClass, assetClassName: s.assetClassName, assetClassIcon: s.assetClassIcon, gla: s.gla, rentPsm: s.estRentPsm, occupancy: 0, tenant: null, leaseRemaining: 0, gri: 0, value: 0, age: 0, condition: "A", epcRating: "A", capexSpent: 0, acquired: true, developing: true, devQuartersLeft: s.quartersToComplete, totalDevQuarters: s.quartersToComplete, totalDevCost: s.devCost, devCostSoFar: 0, visualSeed: assetCounter, urgentIssue: null, lastRM: 0 }; return { ...p, cash: p.cash - s.devCost, portfolio: [...p.portfolio, d], devSites: p.devSites.filter(x => x.id !== id), events: [...p.events, "\u{1F3D7}\uFE0F Started " + s.flag + " " + s.name + " (" + formatM(s.devCost) + ")"] }; }), []);
  const onHire = useCallback((r) => setState(p => p ? { ...p, team: { ...p.team, [r]: (p.team[r] || 0) + 1 } } : p), []);
  const onFire = useCallback((r) => setState(p => p && (p.team[r] || 0) > 0 ? { ...p, team: { ...p.team, [r]: p.team[r] - 1 } } : p), []);
  const onReset = useCallback(() => { deleteSave(); setStarted(false); setState(null); setTab("portfolio"); setRTab("sentiment"); }, []);
  const onSave = useCallback(() => { if (state) { saveGame(state); setSaved(true); setTimeout(() => setSaved(false), 2000); } }, [state]);

  if (!started || !state) return <StartScreen onStart={onStart} />;
  const m = computeMetrics(state), ql = getQuarterLabel(state.quarter, state.year);

  return (<div style={S.app}><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <div style={S.hdr}><div style={S.logo}><LogoSVG size={28} /><div><div style={{ fontSize: "15px", fontWeight: 700, color: theme.white, letterSpacing: "0.04em" }}>{state.companyName.toUpperCase()}</div><div style={{ fontSize: "9px", color: theme.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>LOGISIM</div></div></div>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}><div style={{ fontSize: "11px", color: theme.green, fontWeight: 600 }}>CASH: {formatM(state.cash)}</div><div style={{ padding: "4px 10px", background: theme.accentDim, border: "1px solid " + theme.accent, borderRadius: "5px", fontSize: "11px", fontWeight: 600, color: theme.accent }}>{ql}</div><button style={{ padding: "7px 18px", background: "linear-gradient(135deg, " + theme.accent + ", #2563eb)", color: theme.white, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 700, fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase", boxShadow: "0 2px 10px rgba(59,130,246,0.3)" }} onClick={onAdvance}>Next Quarter {"\u2192"}</button><button style={{ ...S.btn("green"), padding: "5px 9px", fontSize: "9px" }} onClick={onSave}>{saved ? "\u2713 Saved" : "Save"}</button><button style={{ ...S.btn("default"), padding: "5px 9px", fontSize: "9px" }} onClick={onReset}>Reset</button></div></div>
    <div style={S.mBar}>
      <MetricCell label="Portfolio GAV" value={formatM(m.totalGAV)} />
      <MetricCell label="Assets" value={m.assetCount} />
      <MetricCell label="Total GLA" value={(m.totalGLA / 1000).toFixed(0) + "k sqm"} />
      <MetricCell label="Avg Occupancy" value={pct(m.avgOcc)} color={m.avgOcc > 0.85 ? theme.green : m.avgOcc > 0.6 ? theme.amber : theme.red} />
      <MetricCell label="GRI p.a." value={formatM(m.totalGRI)} />
      <MetricCell label="NOI p.a." value={formatM(m.noi)} color={theme.green} />
      <MetricCell label="NOI Yield" value={pct(m.noiYield)} />
      <MetricCell label="Avg WALT" value={m.avgWALT.toFixed(1) + "yr"} />
    </div>
    <div style={S.main}><div style={S.lp}>
      <div style={S.tabs}>{["portfolio", "acquire", "develop", "team"].map(t => <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t === "portfolio" ? "Portfolio (" + state.portfolio.length + ")" : t === "acquire" ? "Acquire (" + state.acquisitions.length + ")" : t === "develop" ? "Develop (" + state.devSites.length + ")" : "Team"}</button>)}</div>
      {tab === "portfolio" && <>{!state.portfolio.length && <div style={S.empty}>No assets. Head to Acquire.</div>}{state.portfolio.map(a => <AssetCard key={a.id} asset={a} onMaintenance={onMaint} onDispose={onDispose} onFixIssue={onFix} />)}</>}
      {tab === "acquire" && <><div style={S.sec}>Available Acquisitions</div>{!state.acquisitions.length && <div style={S.empty}>No assets on market.</div>}{state.acquisitions.map(a => <AcqCard key={a.id} asset={a} onAcquire={onAcquire} ok={state.cash >= a.askPrice} />)}</>}
      {tab === "develop" && <><div style={S.sec}>Development Opportunities</div>{!state.devSites.length && <div style={S.empty}>No sites available.</div>}{state.devSites.map(s => <DevCardC key={s.id} site={s} onDevelop={onDev} ok={state.cash >= s.devCost} />)}</>}
      {tab === "team" && <TeamPanel team={state.team} onHire={onHire} onFire={onFire} />}
    </div><div style={S.rp}>
      <div style={S.tabs}>{["sentiment", "charts", "events"].map(t => <button key={t} style={S.tab(rTab === t)} onClick={() => setRTab(t)}>{t === "sentiment" ? "Board" : t === "charts" ? "Charts" : "Events"}</button>)}</div>
      {rTab === "sentiment" && (() => { const { sentiments, boardComments } = generateSentiment(m, state.history); return (<div><div style={S.sec}>Investor Sentiment</div>{sentiments.map((s, i) => <div key={i} style={{ ...S.card, padding: "7px 10px", marginBottom: "5px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}><span style={{ fontSize: "11px", fontWeight: 700, color: theme.text }}>{s.metric}</span><SentimentBadge mood={s.mood} label={s.label} /></div><div style={{ fontSize: "10px", color: theme.textDim, lineHeight: 1.4 }}>{s.comment}</div></div>)}<div style={{ ...S.sec, marginTop: "12px" }}>Board Commentary</div>{boardComments.map((b, i) => <div key={i} style={{ ...S.card, padding: "7px 10px", marginBottom: "5px", borderLeft: "3px solid " + theme.accent }}><div style={{ fontSize: "9px", color: theme.accent, fontWeight: 600, marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{b.member}</div><div style={{ fontSize: "11px", color: theme.text, lineHeight: 1.4, fontStyle: "italic" }}>"{b.text}"</div></div>)}</div>); })()}
      {rTab === "charts" && <div>{state.history.length < 2 ? <div style={S.empty}>Advance a few quarters.</div> : [{l: "Portfolio GAV", k: "totalGAV", c: theme.accent, f: formatM}, {l: "Occupancy", k: "avgOcc", c: theme.green, f: pct}, {l: "NOI p.a.", k: "noi", c: "#10b981", f: formatM}, {l: "Cash", k: "cash", c: theme.amber, f: formatM}].map(ch => <div key={ch.k}><div style={S.sec}>{ch.l}</div><div style={{ ...S.card, padding: "7px 10px", marginBottom: "6px" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}><span style={{ fontSize: "10px", color: theme.textDim }}>{ch.l}</span><span style={{ fontSize: "12px", fontWeight: 700, color: theme.white }}>{ch.f(state.history[state.history.length - 1]?.[ch.k] || 0)}</span></div><Sparkline data={state.history.map(h => h[ch.k])} color={ch.c} height={42} /></div></div>)}</div>}
      {rTab === "events" && <div style={S.evLog}>{!state.events.length && <div style={S.empty}>Advance to begin.</div>}{[...state.events].reverse().map((e, i) => <div key={i} style={S.evItem}>{e}</div>)}</div>}
    </div></div></div>);
}
