import { useState, useCallback, useEffect, useRef } from "react";

/* ===== DATA ===== */
const MARKETS = [
  { id:"uk",name:"United Kingdom",flag:"\u{1F1EC}\u{1F1E7}",baseRent:75,capRate:4.8,demand:0.85 },
  { id:"de",name:"Germany",flag:"\u{1F1E9}\u{1F1EA}",baseRent:52,capRate:4.2,demand:0.80 },
  { id:"fr",name:"France",flag:"\u{1F1EB}\u{1F1F7}",baseRent:58,capRate:4.5,demand:0.75 },
  { id:"pl",name:"Poland",flag:"\u{1F1F5}\u{1F1F1}",baseRent:42,capRate:6.5,demand:0.90 },
  { id:"nl",name:"Netherlands",flag:"\u{1F1F3}\u{1F1F1}",baseRent:68,capRate:4.0,demand:0.82 },
  { id:"cz",name:"Czech Republic",flag:"\u{1F1E8}\u{1F1FF}",baseRent:48,capRate:5.8,demand:0.78 },
  { id:"es",name:"Spain",flag:"\u{1F1EA}\u{1F1F8}",baseRent:50,capRate:5.2,demand:0.72 },
  { id:"se",name:"Sweden",flag:"\u{1F1F8}\u{1F1EA}",baseRent:62,capRate:4.3,demand:0.70 },
  { id:"it",name:"Italy",flag:"\u{1F1EE}\u{1F1F9}",baseRent:46,capRate:5.5,demand:0.68 },
  { id:"be",name:"Belgium",flag:"\u{1F1E7}\u{1F1EA}",baseRent:55,capRate:4.6,demand:0.76 },
  { id:"at",name:"Austria",flag:"\u{1F1E6}\u{1F1F9}",baseRent:50,capRate:4.9,demand:0.74 },
  { id:"dk",name:"Denmark",flag:"\u{1F1E9}\u{1F1F0}",baseRent:64,capRate:4.1,demand:0.72 },
];

const ASSET_CLASSES = [
  { id:"bigbox",name:"Big Box / Distribution",icon:"\u{1F4E6}",rentMult:1.0,capRateMult:1.0,riskFactor:0.05,demandMult:1.0 },
  { id:"lastmile",name:"Last Mile / Urban",icon:"\u{1F3D9}\uFE0F",rentMult:1.35,capRateMult:0.85,riskFactor:0.08,demandMult:1.1 },
  { id:"fulfilment",name:"Fulfilment Centre",icon:"\u{1F6D2}",rentMult:1.15,capRateMult:0.95,riskFactor:0.07,demandMult:1.05 },
  { id:"datactr",name:"Data Centre",icon:"\u{1F5A5}\uFE0F",rentMult:2.2,capRateMult:0.7,riskFactor:0.15,demandMult:0.7 },
  { id:"coldstor",name:"Cold Storage",icon:"\u2744\uFE0F",rentMult:1.5,capRateMult:0.9,riskFactor:0.10,demandMult:0.75 },
  { id:"multilet",name:"Multi-Let Industrial",icon:"\u{1F3ED}",rentMult:0.9,capRateMult:1.1,riskFactor:0.04,demandMult:0.95 },
  { id:"crossdock",name:"Cross-Dock Terminal",icon:"\u{1F69B}",rentMult:1.1,capRateMult:0.92,riskFactor:0.06,demandMult:1.02 },
];

const ASSET_NAMES = [
  "Gateway Park","CrossDock Hub","Horizon Centre","Apex Park","Keystone DC",
  "Matrix Campus","Pinnacle Park","Velocity DC","Summit Estate","Nexus Centre",
  "Meridian Park","Atlas Hub","Eclipse DC","Vanguard Park","Quantum Hub",
  "Sterling Complex","Northgate Industrial","Riverside Park","Centrepoint DC",
  "Orbital Park","Titan Logistics","Phoenix Distribution","Albion Estate",
  "Imperial Yard","Sovereign Park","Catalyst Hub","Longitude DC","Prism Logistics",
  "Spectrum Park","Endeavour Centre","Crown Business Park","Zenith Hub",
  "Aurora Distribution","Paladin Yard","Liberty Park","Forge Industrial",
  "Nova Distribution","Citadel Park","Pegasus Hub","Beacon Logistics"
];

const TENANT_DB = {
  "Amazon":{credit:"AA",revenue:"\u20AC574bn",employees:"1.5m",sector:"E-commerce",insolvencyRisk:0.01},
  "DHL":{credit:"A+",revenue:"\u20AC94bn",employees:"590k",sector:"Logistics",insolvencyRisk:0.02},
  "DB Schenker":{credit:"A",revenue:"\u20AC23bn",employees:"76k",sector:"Logistics",insolvencyRisk:0.03},
  "XPO":{credit:"BBB",revenue:"\u20AC7.7bn",employees:"38k",sector:"Logistics",insolvencyRisk:0.05},
  "GXO":{credit:"BBB",revenue:"\u20AC9.8bn",employees:"44k",sector:"Logistics",insolvencyRisk:0.05},
  "DSV Panalpina":{credit:"A-",revenue:"\u20AC23bn",employees:"75k",sector:"Freight",insolvencyRisk:0.03},
  "Kuehne+Nagel":{credit:"A",revenue:"\u20AC25bn",employees:"78k",sector:"Freight",insolvencyRisk:0.02},
  "Lidl Distribution":{credit:"A+",revenue:"\u20AC120bn",employees:"376k",sector:"Retail",insolvencyRisk:0.01},
  "Maersk Logistics":{credit:"A-",revenue:"\u20AC51bn",employees:"110k",sector:"Shipping",insolvencyRisk:0.03},
  "FedEx Supply Chain":{credit:"BBB+",revenue:"\u20AC87bn",employees:"518k",sector:"Logistics",insolvencyRisk:0.04},
  "Amazon Logistics":{credit:"AA",revenue:"\u20AC574bn",employees:"1.5m",sector:"E-commerce",insolvencyRisk:0.01},
  "DPD":{credit:"BBB+",revenue:"\u20AC8.5bn",employees:"49k",sector:"Parcels",insolvencyRisk:0.04},
  "Evri":{credit:"BB",revenue:"\u20AC1.8bn",employees:"15k",sector:"Parcels",insolvencyRisk:0.12},
  "Royal Mail":{credit:"BBB-",revenue:"\u20AC12bn",employees:"140k",sector:"Postal",insolvencyRisk:0.06},
  "GLS":{credit:"BBB",revenue:"\u20AC4.5bn",employees:"20k",sector:"Parcels",insolvencyRisk:0.05},
  "InPost":{credit:"BB+",revenue:"\u20AC1.6bn",employees:"5k",sector:"Parcels",insolvencyRisk:0.09},
  "Yodel":{credit:"B+",revenue:"\u20AC0.6bn",employees:"8k",sector:"Parcels",insolvencyRisk:0.18},
  "UPS Express":{credit:"A",revenue:"\u20AC91bn",employees:"500k",sector:"Logistics",insolvencyRisk:0.02},
  "ASOS Fulfilment":{credit:"BB-",revenue:"\u20AC3.9bn",employees:"12k",sector:"Fashion",insolvencyRisk:0.15},
  "Zalando":{credit:"BB+",revenue:"\u20AC10bn",employees:"17k",sector:"Fashion",insolvencyRisk:0.08},
  "Decathlon":{credit:"A-",revenue:"\u20AC15bn",employees:"105k",sector:"Retail",insolvencyRisk:0.03},
  "Ocado":{credit:"B+",revenue:"\u20AC2.8bn",employees:"17k",sector:"Grocery Tech",insolvencyRisk:0.16},
  "Boohoo":{credit:"B",revenue:"\u20AC1.5bn",employees:"6k",sector:"Fashion",insolvencyRisk:0.22},
  "Zara Logistics":{credit:"A",revenue:"\u20AC32bn",employees:"165k",sector:"Fashion",insolvencyRisk:0.02},
  "H&M Distribution":{credit:"BBB+",revenue:"\u20AC22bn",employees:"148k",sector:"Fashion",insolvencyRisk:0.04},
  "Equinix":{credit:"A-",revenue:"\u20AC7.8bn",employees:"13k",sector:"Data Centres",insolvencyRisk:0.02},
  "Digital Realty":{credit:"BBB",revenue:"\u20AC5.3bn",employees:"4k",sector:"Data Centres",insolvencyRisk:0.04},
  "AWS":{credit:"AA+",revenue:"\u20AC90bn",employees:"N/A",sector:"Cloud",insolvencyRisk:0.005},
  "Microsoft Azure":{credit:"AAA",revenue:"\u20AC236bn",employees:"221k",sector:"Cloud",insolvencyRisk:0.003},
  "Google Cloud":{credit:"AA+",revenue:"\u20AC37bn",employees:"182k",sector:"Cloud",insolvencyRisk:0.005},
  "NTT":{credit:"A",revenue:"\u20AC95bn",employees:"330k",sector:"Telecoms",insolvencyRisk:0.02},
  "CyrusOne":{credit:"BBB-",revenue:"\u20AC1.1bn",employees:"500",sector:"Data Centres",insolvencyRisk:0.06},
  "Iron Mountain":{credit:"BBB-",revenue:"\u20AC5.5bn",employees:"26k",sector:"Storage",insolvencyRisk:0.05},
  "Lineage Logistics":{credit:"BBB",revenue:"\u20AC5.2bn",employees:"26k",sector:"Cold Chain",insolvencyRisk:0.05},
  "Americold":{credit:"BBB-",revenue:"\u20AC2.7bn",employees:"14k",sector:"Cold Chain",insolvencyRisk:0.06},
  "Tesco Distribution":{credit:"A-",revenue:"\u20AC68bn",employees:"330k",sector:"Grocery",insolvencyRisk:0.02},
  "HelloFresh":{credit:"BB-",revenue:"\u20AC7.6bn",employees:"18k",sector:"Meal Kits",insolvencyRisk:0.14},
  "Sysco":{credit:"A-",revenue:"\u20AC72bn",employees:"72k",sector:"Food Service",insolvencyRisk:0.02},
  "Musgrave":{credit:"BBB",revenue:"\u20AC3.8bn",employees:"11k",sector:"Wholesale",insolvencyRisk:0.05},
  "Brake Bros":{credit:"BB+",revenue:"\u20AC1.2bn",employees:"4k",sector:"Food Service",insolvencyRisk:0.09},
  "SME Tenants":{credit:"BB-",revenue:"\u20AC2-20m",employees:"20-200",sector:"Mixed",insolvencyRisk:0.15},
  "Mixed Industrial":{credit:"BB",revenue:"\u20AC5-50m",employees:"50-500",sector:"Industrial",insolvencyRisk:0.12},
  "Local Manufacturers":{credit:"BB-",revenue:"\u20AC1-15m",employees:"10-100",sector:"Manufacturing",insolvencyRisk:0.16},
  "Trade Counter Ops":{credit:"BB",revenue:"\u20AC3-30m",employees:"15-150",sector:"Trade",insolvencyRisk:0.13},
  "Regional Distributors":{credit:"BB+",revenue:"\u20AC10-80m",employees:"50-400",sector:"Distribution",insolvencyRisk:0.10},
  "DHL Express":{credit:"A+",revenue:"\u20AC94bn",employees:"590k",sector:"Express",insolvencyRisk:0.02},
  "FedEx":{credit:"BBB+",revenue:"\u20AC87bn",employees:"518k",sector:"Express",insolvencyRisk:0.03},
  "UPS":{credit:"A",revenue:"\u20AC91bn",employees:"500k",sector:"Express",insolvencyRisk:0.02},
  "TNT Express":{credit:"BBB",revenue:"\u20AC7bn",employees:"56k",sector:"Express",insolvencyRisk:0.05},
  "Hermes":{credit:"BB+",revenue:"\u20AC3.2bn",employees:"18k",sector:"Parcels",insolvencyRisk:0.09},
  "Amazon Flex":{credit:"AA",revenue:"\u20AC574bn",employees:"1.5m",sector:"Last Mile",insolvencyRisk:0.01},
};

const TENANT_POOL = {
  bigbox:["Amazon","DHL","DB Schenker","XPO","GXO","DSV Panalpina","Kuehne+Nagel","Lidl Distribution","Maersk Logistics","FedEx Supply Chain"],
  lastmile:["Amazon Logistics","DPD","Evri","Royal Mail","GLS","InPost","Yodel","UPS Express"],
  fulfilment:["Amazon","ASOS Fulfilment","Zalando","Decathlon","Ocado","Boohoo","Zara Logistics","H&M Distribution"],
  datactr:["Equinix","Digital Realty","AWS","Microsoft Azure","Google Cloud","NTT","CyrusOne","Iron Mountain"],
  coldstor:["Lineage Logistics","Americold","Tesco Distribution","HelloFresh","Sysco","Musgrave","Brake Bros"],
  multilet:["SME Tenants","Mixed Industrial","Local Manufacturers","Trade Counter Ops","Regional Distributors"],
  crossdock:["DHL Express","FedEx","UPS","TNT Express","DPD","Hermes","Amazon Flex"],
};

const TEAM_ROLES = [
  { id:"transactions",name:"Transactions",icon:"\u{1F91D}",salaryCost:120000,desc:"Better deal discovery, lower asking prices" },
  { id:"assetMgmt",name:"Asset Management",icon:"\u{1F527}",salaryCost:100000,desc:"Better occupancy, faster lease-up" },
  { id:"portfolioMgmt",name:"Portfolio Management",icon:"\u{1F4CA}",salaryCost:130000,desc:"Strategic oversight, risk monitoring" },
];

const MAINT = [
  { id:"rm",name:"R&M",costPerSqm:30,gradeUp:false,esgBoost:false,occBoost:0 },
  { id:"esg",name:"ESG Upgrade",costPerSqm:180,gradeUp:false,esgBoost:true,occBoost:0.05 },
  { id:"refurb",name:"Refurbishment",costPerSqm:350,gradeUp:true,esgBoost:false,occBoost:0.08 },
];

const ISSUES = [
  { name:"Roof leak reported",severity:0.08,fixCost:80 },
  { name:"Dock door failure",severity:0.05,fixCost:40 },
  { name:"Fire suppression replacement",severity:0.10,fixCost:120 },
  { name:"HVAC failure",severity:0.12,fixCost:100 },
  { name:"Yard surfacing deterioration",severity:0.04,fixCost:60 },
  { name:"EPC below minimum",severity:0.06,fixCost:150 },
  { name:"Structural crack",severity:0.15,fixCost:250 },
  { name:"Electrical board failure",severity:0.09,fixCost:90 },
];

/* ===== UTILS ===== */
const rFrom = (a) => a[Math.floor(Math.random() * a.length)];
const rBetween = (a, b) => a + Math.random() * (b - a);
const fmtM = (n) => "\u20AC" + (n / 1e6).toFixed(1) + "m";
const fmtK = (n) => "\u20AC" + (n / 1e3).toFixed(0) + "k";
const fmtP = (n) => (n * 100).toFixed(1) + "%";
const getTI = (n) => TENANT_DB[n] || { credit:"NR",revenue:"N/A",employees:"N/A",sector:"Unknown",insolvencyRisk:0.10 };
const credCol = (c) => (c.startsWith("AA")||c==="A+"||c==="A") ? "#10b981" : (c.startsWith("BBB")||c==="A-") ? "#f59e0b" : "#ef4444";

/* ===== THEME ===== */
const T = {
  bg:"#0a0f1a",card:"#111827",bdr:"#1e2a3a",acc:"#3b82f6",accD:"#1e3a5f",
  grn:"#10b981",grnD:"#064e3b",red:"#ef4444",redD:"#7f1d1d",amb:"#f59e0b",ambD:"#78350f",
  txt:"#e2e8f0",txtD:"#94a3b8",txtM:"#7c8ba3",wht:"#ffffff",
};

const GLOSS = {
  "Portfolio GAV":"Gross Asset Value","Assets":"Number of properties","Total GLA":"Gross Lettable Area (sqm)",
  "Avg Occupancy":"Weighted avg % leased","GRI p.a.":"Gross Rental Income p.a.","NOI p.a.":"Net Operating Income",
  "NOI Yield":"NOI as % of GAV","Avg WALT":"Weighted Avg Lease Term","GLA":"Gross Lettable Area",
  "Occupancy":"% leased","GAV":"Market value","Rent p.a.":"Annual rental income","Rent/sqm":"Rent per sqm",
  "WALT":"Lease years remaining","Asking":"Asking price","NIY":"Net Initial Yield",
  "Dev Cost":"Development cost","Timeline":"Quarters to complete",
  "Est. Rent/sqm":"Est. rent on completion","Est. YOC":"Est. Yield on Cost",
};

/* ===== SAVE (memory only) ===== */
let _save = null;
const saveGame = (s) => { _save = s; };
const loadGame = () => _save;
const hasSave = () => !!_save;
const delSave = () => { _save = null; };

/* ===== SMALL COMPONENTS ===== */
function Tip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <span
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: r.left + r.width / 2, y: r.bottom + 6 });
        setShow(true);
      }}
      onMouseLeave={() => setShow(false)}
      style={{ cursor: "help", borderBottom: "1px dotted " + T.txtM, position: "relative" }}
    >
      {children}
      {show && (
        <span style={{
          position:"fixed", left: Math.min(pos.x, 600), top: pos.y, transform:"translateX(-50%)",
          background:"#1e293b", color:"#e2e8f0", padding:"8px 12px", borderRadius:"6px",
          fontSize:"11px", lineHeight:1.5, maxWidth:"220px", zIndex:9999,
          boxShadow:"0 4px 16px rgba(0,0,0,0.5)", border:"1px solid #2d3f56",
          pointerEvents:"none", whiteSpace:"normal", letterSpacing:"0", textTransform:"none"
        }}>{text}</span>
      )}
    </span>
  );
}

function TipLbl({ label, style: st }) {
  const g = GLOSS[label];
  if (g) return <div style={st}><Tip text={g}>{label}</Tip></div>;
  return <div style={st}>{label}</div>;
}

function Logo({ size = 28 }) {
  return (
    <svg viewBox="0 0 40 40" style={{ width: size, height: size, flexShrink: 0 }}>
      <rect x="4" y="20" width="24" height="16" rx="1" fill="#3b82f6" opacity="0.8" />
      <rect x="4" y="20" width="24" height="3" rx="0.5" fill="#60a5fa" opacity="0.6" />
      <rect x="7" y="28" width="5" height="8" rx="0.5" fill="#1e3a5f" />
      <rect x="14" y="28" width="5" height="8" rx="0.5" fill="#1e3a5f" />
      <rect x="21" y="28" width="5" height="8" rx="0.5" fill="#1e3a5f" />
      <rect x="30" y="4" width="2.5" height="32" rx="0.5" fill="#f97316" />
      <rect x="14" y="4" width="22" height="2" rx="0.5" fill="#fb923c" />
      <line x1="18" y1="6" x2="18" y2="16" stroke="#f97316" strokeWidth="0.8" strokeDasharray="2,1.5" />
      <path d="M16 15 L18 16 L20 15" stroke="#f97316" strokeWidth="1" fill="none" strokeLinecap="round" />
      <rect x="33" y="4" width="4" height="4" rx="0.5" fill="#ea580c" />
      <line x1="29" y1="36" x2="34" y2="36" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Spark({ data, color = "#3b82f6", height = 40 }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const w = 200, h = height, p = 2;
  const pts = data.map((v, i) => {
    const x = p + (i / (data.length - 1)) * (w - p * 2);
    const y = h - p - ((v - mn) / rng) * (h - p * 2);
    return x + "," + y;
  });
  const last = pts[pts.length - 1].split(",");
  const gId = "g" + color.replace("#", "");
  return (
    <svg viewBox={"0 0 " + w + " " + h} style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={[...pts, (p + (w - p * 2)) + "," + h, p + "," + h].join(" ")} fill={"url(#" + gId + ")"} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

function WHouse({ condition, gla, developing, assetClass, seed = 0 }) {
  const w = 120, h = 80;
  const sr = Math.min(1, Math.max(0.5, gla / 50000));
  const bW = 60 + sr * 30, bH = 30 + sr * 15;
  const bx = (w - bW) / 2, by = h - bH - 10;
  const v = seed % 3;
  const isD = assetClass === "datactr", isC = assetClass === "coldstor";
  let c;
  if (developing) {
    c = { wall:"#1e4a7f",roof:"#3b82f6",acc:"#60a5fa",gnd:"#0f1e33",door:"#2563eb",win:"#93c5fd" };
  } else if (condition === "A") {
    c = { wall:isD?"#2a2a4e":isC?"#1e3e5a":"#1e3e64", roof:isD?"#8b5cf6":isC?"#22d3ee":"#38bdf8", acc:isD?"#c4b5fd":isC?"#67e8f9":"#7dd3fc", gnd:"#111e33", door:isD?"#7c3aed":"#0ea5e9", win:isD?"#ddd6fe":"#bae6fd" };
  } else if (condition === "B") {
    c = { wall:"#3a3520",roof:"#d97706",acc:"#f59e0b",gnd:"#1e1a10",door:"#b45309",win:"#fcd34d" };
  } else {
    c = { wall:"#3a2828",roof:"#dc2626",acc:"#f87171",gnd:"#1e1414",door:"#b91c1c",win:"#fca5a5" };
  }
  const dk = condition === "A" ? 4 : condition === "B" ? 3 : 2;
  const dW = (bW - 10) / dk;
  return (
    <svg viewBox={"0 0 " + w + " " + h} style={{ width:"100%",height:"100%",borderRadius:"6px" }}>
      <rect width={w} height={h} fill={c.gnd} />
      {[0,1,2,3,4,5,6].map(i => <circle key={i} cx={(seed*17+i*29)%w} cy={3+(i*7)%18} r="0.7" fill="#fff" opacity="0.35" />)}
      <rect x="0" y={h-10} width={w} height="10" fill={c.gnd} />
      {developing ? (
        <>
          <line x1={w/2} y1={by-20} x2={w/2} y2={by+bH} stroke="#f97316" strokeWidth="1.5" />
          <line x1={w/2-20} y1={by-18} x2={w/2+25} y2={by-18} stroke="#f97316" strokeWidth="1" />
          <rect x={bx} y={by+bH*0.4} width={bW} height={bH*0.6} fill={c.wall} stroke={c.acc} strokeWidth="0.5" opacity="0.7" strokeDasharray="3,2" />
        </>
      ) : (
        <>
          <rect x={bx} y={by} width={bW} height={bH} fill={c.wall} stroke={c.acc} strokeWidth="0.5" />
          {v===0 && <polygon points={bx+","+by+" "+(bx+bW/2)+","+(by-6)+" "+(bx+bW)+","+by} fill={c.roof} opacity="0.9" />}
          {v===1 && <rect x={bx} y={by-3} width={bW} height="3" fill={c.roof} opacity="0.9" />}
          {v===2 && <rect x={bx} y={by-2} width={bW} height="2" fill={c.roof} opacity="0.9" />}
          {Array.from({length:dk}).map((_,i) => <rect key={i} x={bx+5+i*dW} y={by+bH-10} width={dW-3} height="10" fill={c.door} opacity="0.8" rx="1" />)}
          {condition!=="C" && Array.from({length:Math.floor(bW/15)}).map((_,i) => <rect key={i} x={bx+8+i*15} y={by+5} width={6} height={4} fill={c.win} opacity={condition==="A"?"0.6":"0.35"} rx="0.5" />)}
        </>
      )}
    </svg>
  );
}

/* ===== NEWS FEED ===== */
function NewsFeed({ items }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [items.length]);
  if (!items || !items.length) {
    return (
      <div style={{ flex:1,minWidth:0,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"7px",padding:"8px 12px",display:"flex",alignItems:"center" }}>
        <span style={{ fontSize:"10px",color:T.txtM }}>{"\u{1F4F0}"} No news yet</span>
      </div>
    );
  }
  return (
    <div style={{ flex:1,minWidth:0,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"7px",overflow:"hidden",maxHeight:"68px" }}>
      <div style={{ padding:"5px 10px 3px",display:"flex",alignItems:"center",gap:"5px",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize:"9px",fontWeight:700,color:T.amb,letterSpacing:"0.1em" }}>{"\u{1F4F0}"} NEWS</span>
        <span style={{ fontSize:"8px",color:T.txtM }}>{items.length}</span>
      </div>
      <div ref={ref} style={{ overflowY:"auto",maxHeight:"42px",padding:"3px 10px" }}>
        {items.slice(-8).reverse().map((n, i) => (
          <div key={i} style={{ fontSize:"10px",color:n.color||T.txtD,lineHeight:1.6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
            <span style={{ marginRight:"4px" }}>{n.icon}</span>{n.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== TENANT SELECTION MODAL ===== */
function TenantModal({ candidates, assetName, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono', monospace" }}>
      <div style={{ background:"#111827",border:"1px solid #3b82f6",borderRadius:"10px",padding:"20px",maxWidth:"520px",width:"92%",maxHeight:"80vh",overflowY:"auto" }}>
        <div style={{ fontSize:"15px",fontWeight:800,color:"#fff",marginBottom:"4px" }}>{"\u{1F3E2}"} Tenant Interest - {assetName}</div>
        <div style={{ fontSize:"10px",color:"#94a3b8",marginBottom:"16px" }}>Multiple tenants interested. Choose based on credit quality and risk.</div>
        {candidates.map((c, i) => {
          const info = getTI(c.name);
          return (
            <div key={i} onClick={() => onSelect(c)} style={{ background:"#1a2234",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"7px",padding:"11px 13px",marginBottom:"7px",cursor:"pointer" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px" }}>
                <span style={{ fontSize:"13px",fontWeight:700,color:"#fff" }}>{c.name}</span>
                <span style={{ fontSize:"11px",fontWeight:700,color:credCol(info.credit),background:"rgba(0,0,0,0.3)",padding:"2px 8px",borderRadius:"4px" }}>{info.credit}</span>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"5px",fontSize:"9px" }}>
                <div><div style={{ color:"#64748b" }}>Sector</div><div style={{ color:"#e2e8f0",fontWeight:600 }}>{info.sector}</div></div>
                <div><div style={{ color:"#64748b" }}>Revenue</div><div style={{ color:"#e2e8f0",fontWeight:600 }}>{info.revenue}</div></div>
                <div><div style={{ color:"#64748b" }}>Lease</div><div style={{ color:"#e2e8f0",fontWeight:600 }}>{c.term}yr</div></div>
                <div><div style={{ color:"#64748b" }}>Risk</div><div style={{ color:info.insolvencyRisk > 0.10 ? "#ef4444" : info.insolvencyRisk > 0.05 ? "#f59e0b" : "#10b981",fontWeight:700 }}>{info.insolvencyRisk > 0.10 ? "HIGH" : info.insolvencyRisk > 0.05 ? "MED" : "LOW"}</div></div>
              </div>
              <div style={{ marginTop:"5px",fontSize:"9px",color:"#7c8ba3" }}>{"\u20AC"}{c.rentPsm.toFixed(1)}/sqm | {info.employees} staff</div>
            </div>
          );
        })}
        <button onClick={onClose} style={{ marginTop:"8px",padding:"8px 16px",background:"transparent",border:"1px solid #334155",borderRadius:"5px",color:"#94a3b8",cursor:"pointer",fontSize:"10px",fontWeight:600,fontFamily:"inherit" }}>Decline All</button>
      </div>
    </div>
  );
}

/* ===== GAME ENGINE ===== */
let aCtr = 0, usedN = new Set();

function genAsset(mkt, acId) {
  aCtr++;
  const ac = ASSET_CLASSES.find(a => a.id === acId) || ASSET_CLASSES[0];
  let name;
  do { name = rFrom(ASSET_NAMES); } while (usedN.has(mkt.id + name) && usedN.size < 400);
  usedN.add(mkt.id + name);
  const gla = ac.id === "lastmile" ? Math.round(rBetween(5,25))*1000 : ac.id === "datactr" ? Math.round(rBetween(8,30))*1000 : Math.round(rBetween(15,80))*1000;
  const rentPsm = mkt.baseRent * ac.rentMult * rBetween(0.85, 1.2);
  const occ = Math.min(1, Math.max(0, mkt.demand * ac.demandMult * rBetween(0.7, 1.1)));
  const tenant = occ > 0.5 ? rFrom(TENANT_POOL[ac.id] || TENANT_POOL.bigbox) : null;
  const walt = occ > 0.5 ? Math.round(rBetween(1, 12)) : 0;
  const gri = gla * rentPsm * occ;
  const val = gri / (mkt.capRate * ac.capRateMult / 100);
  const age = Math.round(rBetween(2, 25));
  const cond = age < 5 ? "A" : age < 12 ? "B" : "C";
  const epc = cond === "A" ? rFrom(["A","B"]) : cond === "B" ? rFrom(["B","C"]) : rFrom(["C","D","E"]);
  return { id:"a"+aCtr, name, market:mkt.id, marketName:mkt.name, flag:mkt.flag, assetClass:ac.id, assetClassName:ac.name, assetClassIcon:ac.icon, gla, rentPsm, occupancy:occ, tenant, leaseRemaining:walt, gri, value:val, age, condition:cond, epcRating:epc, capexSpent:0, acquired:true, developing:false, devQuartersLeft:0, visualSeed:aCtr, urgentIssue:null, lastRM:0 };
}

function genMktAsset(mkt, tx) {
  const a = genAsset(mkt, rFrom(ASSET_CLASSES).id);
  a.acquired = false;
  a.askPrice = a.value * rBetween(0.92 - Math.min(0.12, (tx||0)*0.02), 1.18 - Math.min(0.12, (tx||0)*0.02));
  return a;
}

function genDev(mkt) {
  const ac = rFrom(ASSET_CLASSES); aCtr++;
  let name;
  do { name = rFrom(ASSET_NAMES); } while (usedN.has("d"+mkt.id+name));
  usedN.add("d"+mkt.id+name);
  const gla = ac.id === "lastmile" ? Math.round(rBetween(5,20))*1000 : Math.round(rBetween(20,70))*1000;
  return { id:"d"+aCtr, name:name+" (Dev)", market:mkt.id, marketName:mkt.name, flag:mkt.flag, assetClass:ac.id, assetClassName:ac.name, assetClassIcon:ac.icon, gla, devCost:gla*rBetween(400,800)*ac.rentMult, estRentPsm:mkt.baseRent*ac.rentMult*rBetween(1.0,1.3), estYield:mkt.capRate*ac.capRateMult*rBetween(1.05,1.25), quartersToComplete:Math.round(rBetween(3,8)) };
}

function genTenantCandidates(acId, rentPsm) {
  const pool = TENANT_POOL[acId] || TENANT_POOL.bigbox;
  return [...pool].sort(() => Math.random()-0.5).slice(0, 2+Math.floor(Math.random()*2)).map(name => ({
    name, term: Math.round(rBetween(3,10)), rentPsm: rentPsm * rBetween(0.92, 1.12)
  }));
}

function initGame(cfg = {}) {
  const { companyName="NewCo", cash=150e6, startMarkets:sm=["uk","de","pl"], difficulty="guided" } = cfg;
  usedN = new Set(); aCtr = 0;
  const portfolio = [];
  if (difficulty === "guided") {
    const cls = ["bigbox","fulfilment","lastmile"];
    sm.forEach((mId, i) => { const m = MARKETS.find(x => x.id === mId); if (m) portfolio.push(genAsset(m, cls[i % cls.length])); });
  }
  const team = { transactions:1, assetMgmt:1, portfolioMgmt:1 };
  const acqM = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 10);
  const devM = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 5);
  return {
    companyName, quarter:1, year:2026, cash, portfolio, team,
    acquisitions: acqM.map(m => genMktAsset(m, 1)),
    devSites: devM.map(m => genDev(m)),
    history:[], events:[], newsLog:[], initialCash:cash, tenantSelection:null
  };
}

function getQL(q, y) { return "Q" + (((q-1)%4)+1) + " " + (y + Math.floor((q-1)/4)); }
function teamQCost(t) { return TEAM_ROLES.reduce((acc, r) => acc + (t[r.id]||0)*r.salaryCost/4, 0); }

function calcMetrics(st) {
  const { portfolio, team } = st;
  if (!portfolio.length) return { totalGAV:0, totalGRI:0, avgOcc:0, avgWALT:0, noi:0, noiYield:0, assetCount:0, totalGLA:0 };
  const op = portfolio.filter(a => !a.developing);
  const totalGAV = portfolio.reduce((acc, a) => acc + (a.developing ? a.devCostSoFar||0 : a.value), 0);
  const totalGRI = op.reduce((acc, a) => acc + a.gri, 0);
  const totalGLA = portfolio.reduce((acc, a) => acc + a.gla, 0);
  const glaOp = op.reduce((acc, a) => acc + a.gla, 0);
  const avgOcc = glaOp > 0 ? op.reduce((acc, a) => acc + a.occupancy * a.gla, 0) / glaOp : 0;
  const griWalt = op.reduce((acc, a) => acc + (a.leaseRemaining > 0 ? a.gri : 0), 0);
  const avgWALT = griWalt > 0 ? op.reduce((acc, a) => acc + a.leaseRemaining * a.gri, 0) / griWalt : 0;
  const noi = totalGRI * 0.85 - teamQCost(team||{}) * 4;
  const noiYield = totalGAV > 0 ? noi / totalGAV : 0;
  return { totalGAV, totalGRI, avgOcc, avgWALT, noi, noiYield, assetCount:portfolio.length, totalGLA };
}

function calcESG(portfolio) {
  const op = portfolio.filter(a => !a.developing);
  if (!op.length) return 0;
  const sc = { A:100, B:75, C:50, D:25, E:10 };
  return op.reduce((acc, a) => acc + (sc[a.epcRating]||30), 0) / op.length;
}

function calcIRR(init, gav, cash, q) {
  if (q < 4) return null;
  const yrs = q / 4;
  const mult = (gav + cash) / init;
  if (mult <= 0) return 0;
  return Math.pow(mult, 1/yrs) - 1;
}

function advanceQ(state) {
  let { quarter, year, cash, portfolio, acquisitions, devSites, history, team, newsLog } = state;
  const ev = [], news = [];
  quarter++;
  const ql = getQL(quarter, year);
  const tc = teamQCost(team);
  cash -= tc;
  if (tc > 0) ev.push(ql + ": Team salaries (" + fmtK(tc) + ")");
  const op = portfolio.filter(a => !a.developing);
  const qr = op.reduce((acc, a) => acc + a.gri/4, 0);
  const qo = qr * 0.15;
  cash += qr - qo;
  ev.push(ql + ": Rent " + fmtK(qr) + ", opex " + fmtK(qo));
  const am = Math.min(5, team.assetMgmt||0);
  const tx = Math.min(5, team.transactions||0);
  let pendTS = null;

  portfolio.forEach(a => {
    if (a.developing) {
      a.devQuartersLeft--;
      a.devCostSoFar = (a.devCostSoFar||0) + (a.totalDevCost||0)/(a.totalDevQuarters||4);
      if (a.devQuartersLeft <= 0) {
        a.developing = false; a.occupancy = 0; a.condition = "A"; a.age = 0; a.epcRating = "A";
        const m = MARKETS.find(x => x.id === a.market);
        const ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0];
        a.gri = 0;
        a.value = a.gla * a.rentPsm / ((m?.capRate||5) * (ac?.capRateMult||1) / 100);
        ev.push("\u{1F3D7}\uFE0F " + a.flag + " " + a.name + " completed!");
        news.push({ icon:"\u{1F3D7}\uFE0F", text:a.name + " completed - seeking tenants", color:T.acc });
      }
      return;
    }
    const mkt = MARKETS.find(m => m.id === a.market);
    const ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0];

    // Insolvency
    if (a.tenant && a.leaseRemaining > 0) {
      const ti = getTI(a.tenant);
      if (Math.random() < ti.insolvencyRisk * 0.15) {
        ev.push("\u{1F480} " + a.flag + " " + a.name + ": " + a.tenant + " INSOLVENT");
        news.push({ icon:"\u{1F480}", text:a.tenant + " insolvent at " + a.name, color:T.red });
        a.occupancy = Math.max(0, a.occupancy - rBetween(0.4, 0.7));
        a.tenant = null; a.leaseRemaining = 0;
      }
    }
    // Urgent issues
    if (!a.urgentIssue && Math.random() < (0.06 + ac.riskFactor * 0.3)) {
      a.urgentIssue = { ...rFrom(ISSUES) };
      ev.push("\u{1F6A8} " + a.flag + " " + a.name + ": " + a.urgentIssue.name);
      news.push({ icon:"\u{1F6A8}", text:a.name + ": " + a.urgentIssue.name, color:T.red });
    }
    if (a.urgentIssue) a.occupancy = Math.max(0, a.occupancy - a.urgentIssue.severity * 0.3);
    const dr = 0.08 - am * 0.008;
    a.occupancy = Math.min(1, Math.max(0, a.occupancy + rBetween(-dr, dr + am*0.005)));

    // Lease events
    if (a.leaseRemaining > 0) {
      a.leaseRemaining -= 0.25;
      if (a.leaseRemaining <= 0) {
        if (Math.random() < 0.45 + am * 0.05) {
          a.leaseRemaining = Math.round(rBetween(3,7));
          a.rentPsm *= rBetween(1.0, 1.08);
          ev.push("\u2705 " + a.flag + " " + a.name + ": " + a.tenant + " renewed");
          news.push({ icon:"\u2705", text:a.tenant + " renewed at " + a.name, color:T.grn });
        } else {
          a.occupancy = Math.max(0, a.occupancy - rBetween(0.2, 0.5));
          ev.push("\u26A0\uFE0F " + a.flag + " " + a.name + ": " + a.tenant + " vacated");
          news.push({ icon:"\u{1F6AA}", text:a.tenant + " vacated " + a.name, color:T.amb });
          a.tenant = null;
        }
      }
    } else if (a.occupancy < 0.7 && Math.random() < 0.25 + am * 0.05) {
      const ds = (mkt?.demand||0.5) * (ac?.demandMult||1);
      if (ds > 0.85 && !pendTS) {
        pendTS = { assetId:a.id, assetName:a.flag+" "+a.name, candidates:genTenantCandidates(a.assetClass, a.rentPsm) };
        news.push({ icon:"\u{1F4CB}", text:"Tenant offers for " + a.name, color:T.acc });
      } else {
        a.occupancy = Math.min(1, a.occupancy + rBetween(0.15, 0.4));
        a.tenant = rFrom(TENANT_POOL[a.assetClass]||TENANT_POOL.bigbox);
        a.leaseRemaining = Math.round(rBetween(3,7));
        ev.push("\u{1F91D} " + a.flag + " " + a.name + ": Lease with " + a.tenant);
        news.push({ icon:"\u{1F91D}", text:a.tenant + " signed at " + a.name, color:T.grn });
      }
    }
    // Degradation
    const rmGap = quarter - (a.lastRM||0);
    if (rmGap > 4 && Math.random() < 0.08 && a.condition !== "C") {
      a.condition = a.condition === "A" ? "B" : "C";
      a.rentPsm *= 0.95;
      ev.push("\u{1F527} " + a.flag + " " + a.name + ": Degraded to " + a.condition);
      news.push({ icon:"\u{1F4C9}", text:a.name + " degraded to Grade " + a.condition, color:T.amb });
    }
    const ecr = (mkt?.capRate||5) * (ac?.capRateMult||1);
    a.gri = a.gla * a.rentPsm * a.occupancy;
    a.value = a.gri > 0 ? a.gri / (ecr/100) : a.gla * (mkt?.baseRent||5) * 0.3 / (ecr/100);
  });

  const nAcq = Math.min(12, 6 + tx + Math.floor(Math.random()*4));
  acquisitions = [...MARKETS].sort(() => Math.random()-0.5).slice(0, nAcq).map(m => genMktAsset(m, tx));
  devSites = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 3+Math.floor(Math.random()*4)).map(m => genDev(m));
  if (!news.length) news.push({ icon:"\u{1F4CA}", text:"Quiet quarter", color:T.txtD });
  const metrics = calcMetrics({ portfolio, team });
  history.push({ quarter, ...metrics, cash });
  return { ...state, quarter, cash, portfolio:[...portfolio], acquisitions, devSites, history, events:ev, newsLog:[...(newsLog||[]),...news], tenantSelection:pendTS };
}

/* ===== SENTIMENT ===== */
function genSentiment(met, hist, state) {
  const sArr = [];
  const bc = [];
  const prev = hist.length >= 2 ? hist[hist.length-2] : null;
  const quarter = state?.quarter || 1;
  const yearEnd = quarter > 1 && ((quarter-1)%4 === 0);

  sArr.push(met.totalGAV > 5e8 ? { metric:"GAV",mood:"positive",label:"Strong",comment:"Institutional-grade scale." } : met.totalGAV > 2e8 ? { metric:"GAV",mood:"neutral",label:"Growing",comment:"Need faster deployment." } : { metric:"GAV",mood:"negative",label:"Thin",comment:"Under-scaled. Accelerate acquisitions." });
  sArr.push(met.avgOcc > 0.9 ? { metric:"Occupancy",mood:"positive",label:"Excellent",comment:"Best-in-class. Push rents on reversions." } : met.avgOcc > 0.75 ? { metric:"Occupancy",mood:"neutral",label:"Acceptable",comment:"Vacancy leaving "+fmtM(((1-met.avgOcc)*met.totalGRI))+" p.a. on the table." } : { metric:"Occupancy",mood:"negative",label:"Concerning",comment:"Present a lease-up plan next quarter." });
  sArr.push(met.noiYield > 0.05 ? { metric:"NOI Yield",mood:"positive",label:"Outperforming",comment:"Ahead of 5% benchmark." } : met.noiYield > 0.035 ? { metric:"NOI Yield",mood:"neutral",label:"In-line",comment:"Look for rental reversion opportunities." } : { metric:"NOI Yield",mood:"negative",label:"Below Target",comment:"Are we overpaying for assets?" });

  const esg = calcESG(state?.portfolio || []);
  sArr.push(esg > 80 ? { metric:"ESG / EPC",mood:"positive",label:"Leader",comment:"Score "+esg.toFixed(0)+"/100. Green financing advantage." } : esg > 50 ? { metric:"ESG / EPC",mood:"neutral",label:"Compliant",comment:"Score "+esg.toFixed(0)+"/100. Need net-zero pathways." } : { metric:"ESG / EPC",mood:"negative",label:"At Risk",comment:"Score "+esg.toFixed(0)+"/100. Stranding risk. Upgrade EPCs." });

  const gaExp = TEAM_ROLES.reduce((acc, r) => acc + ((state?.team||{})[r.id]||0)*r.salaryCost, 0);
  const gaR = met.totalGRI > 0 ? gaExp / met.totalGRI : 0;
  sArr.push(gaR < 0.05 ? { metric:"Recurring G&A",mood:"positive",label:"Lean",comment:"G&A at "+fmtP(gaR)+" of GRI. Efficient." } : gaR < 0.12 ? { metric:"Recurring G&A",mood:"neutral",label:"Manageable",comment:"G&A at "+fmtP(gaR)+" of GRI. Monitor." } : { metric:"Recurring G&A",mood:"negative",label:"Elevated",comment:"G&A at "+fmtP(gaR)+" of GRI. Scale or cut." });

  sArr.push(met.avgWALT > 5 ? { metric:"Lease Duration",mood:"positive",label:"Secure",comment:"WALT "+met.avgWALT.toFixed(1)+"yr. Strong visibility." } : met.avgWALT > 2.5 ? { metric:"Lease Duration",mood:"neutral",label:"Adequate",comment:"WALT "+met.avgWALT.toFixed(1)+"yr. Push for longer terms." } : { metric:"Lease Duration",mood:"negative",label:"Short",comment:"WALT "+met.avgWALT.toFixed(1)+"yr. High rollover risk." });

  if (prev) {
    const gavG = prev.totalGAV > 0 ? (met.totalGAV - prev.totalGAV)/prev.totalGAV : 0;
    if (gavG > 0.08) bc.push({ member:"CIO", text:"Exceptional "+fmtP(gavG)+" GAV growth. Maintain underwriting standards." });
    else if (gavG > 0.03) bc.push({ member:"CIO", text:fmtP(gavG)+" GAV growth. Target higher-yield CEE markets." });
    else if (gavG < -0.02) bc.push({ member:"CIO", text:"GAV contracted "+fmtP(Math.abs(gavG))+". Stress-test the portfolio." });
    if (met.avgOcc < prev.avgOcc - 0.05) bc.push({ member:"COO", text:"Occupancy dropped "+fmtP(prev.avgOcc-met.avgOcc)+". Need per-asset recovery plan." });
    else if (met.avgOcc > prev.avgOcc + 0.03) bc.push({ member:"COO", text:"Strong lease-up. Review rental reversion opportunities." });
    if (met.noi > prev.noi * 1.05) bc.push({ member:"CFO", text:"NOI up. Deploy surplus into development pipeline." });
    else if (met.noi < prev.noi * 0.97) bc.push({ member:"CFO", text:"NOI softened. Prepare detailed bridge for LP reporting." });
  }

  if (yearEnd && state) {
    const irr = calcIRR(state.initialCash||state.cash, met.totalGAV, state.cash, quarter);
    const yr = Math.round(quarter/4);
    if (irr !== null) {
      if (irr > 0.12) bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+" exceeds 10-12% target. LPs very pleased." });
      else if (irr > 0.08) bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+". Solid, maintain momentum." });
      else if (irr > 0.04) bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+" below 10% floor. Recovery plan needed." });
      else bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+" unacceptable. Full strategic review." });
    }
  }

  if (esg < 50) bc.push({ member:"Head of ESG", text:"Multiple assets below EPC minimums. Budget for remediation." });
  if (!bc.length) bc.push({ member: hist.length <= 1 ? "Board Chair" : "CFO", text: hist.length <= 1 ? "Welcome. LPs expect 10-12% net IRR over 5 years. Build a diversified logistics portfolio." : "Steady quarter. Maintain pricing discipline." });
  return { sentiments: sArr, boardComments: bc };
}

function SentBadge({ mood, label }) {
  const m = { positive:{bg:"#064e3b",b:"#10b981",t:"#10b981",i:"\u25B2"}, neutral:{bg:"#78350f",b:"#f59e0b",t:"#f59e0b",i:"\u25CF"}, negative:{bg:"#7f1d1d",b:"#ef4444",t:"#ef4444",i:"\u25BC"} };
  const c = m[mood] || m.neutral;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:"4px",padding:"2px 8px",borderRadius:"4px",fontSize:"10px",fontWeight:700,background:c.bg,color:c.t,border:"1px solid "+c.b }}>{c.i} {label}</span>;
}

/* ===== STYLES ===== */
const tabGlow = "0 0 20px rgba(59,130,246,0.3), inset 0 0 20px rgba(59,130,246,0.1)";
const S = {
  app:{ minHeight:"100vh",background:"linear-gradient(180deg,"+T.bg+",#0d1321)",color:T.txt,fontFamily:"'JetBrains Mono', monospace",fontSize:"13px",lineHeight:1.5 },
  hdr:{ padding:"10px 18px",borderBottom:"1px solid "+T.bdr,display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap" },
  logo:{ display:"flex",alignItems:"center",gap:"10px",flexShrink:0 },
  mBar:{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:"1px",background:"#334155",borderBottom:"2px solid "+T.acc },
  mCell:{ background:"#0f172a",padding:"14px 16px",textAlign:"center" },
  mLbl:{ fontSize:"10px",color:"#64748b",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px" },
  mVal:{ fontSize:"20px",fontWeight:800,color:"#ffffff" },
  main:{ display:"grid",gridTemplateColumns:"1fr 380px",minHeight:"calc(100vh - 160px)" },
  lp:{ padding:"14px 18px",overflowY:"auto",borderRight:"1px solid "+T.bdr },
  rp:{ padding:"14px 18px",overflowY:"auto",background:"#0c1120" },
  tabs:{ display:"flex",gap:"2px",marginBottom:"14px",background:T.bdr,borderRadius:"7px",padding:"2px" },
  card:{ background:T.card,border:"1px solid rgba(255,255,255,0.25)",borderRadius:"8px",padding:"12px 14px",marginBottom:"8px" },
  grid:{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginTop:"8px" },
  stat:{ fontSize:"10px",color:T.txtD,letterSpacing:"0.04em",textTransform:"uppercase" },
  val:{ fontSize:"14px",fontWeight:700,color:T.txt },
  row:{ display:"flex",gap:"4px",marginTop:"7px",flexWrap:"wrap" },
  sec:{ fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.txtD,marginBottom:"8px",marginTop:"4px" },
  evLog:{ fontSize:"11px",lineHeight:1.7,color:T.txtD },
  evItem:{ padding:"4px 0",borderBottom:"1px solid "+T.bdr },
  empty:{ padding:"18px",textAlign:"center",color:T.txtD,fontSize:"12px" },
};

function tabSt(active) {
  return {
    flex:1, padding:"8px 10px",
    background: active ? "rgba(59,130,246,0.15)" : "transparent",
    color: active ? "#60a5fa" : T.txtD,
    border: active ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent",
    borderRadius:"5px", cursor:"pointer", fontSize:"10px", fontWeight:700,
    letterSpacing:"0.04em", textTransform:"uppercase", fontFamily:"inherit",
    boxShadow: active ? tabGlow : "none",
  };
}

function btnSt(v) {
  const colors = { green:{b:T.grn,bg:T.grnD,c:T.grn}, red:{b:T.red,bg:T.redD,c:T.red}, amber:{b:T.amb,bg:T.ambD,c:T.amb} };
  const d = colors[v] || { b:T.acc, bg:T.accD, c:T.acc };
  return { padding:"5px 10px",border:"1px solid "+d.b,background:d.bg,color:d.c,borderRadius:"4px",cursor:"pointer",fontSize:"10px",fontWeight:600,fontFamily:"inherit" };
}

function condSt(c) {
  return { display:"inline-block",padding:"2px 6px",borderRadius:"4px",fontSize:"9px",fontWeight:700,
    background:c==="A"?T.grnD:c==="B"?T.ambD:T.redD, color:c==="A"?T.grn:c==="B"?T.amb:T.red };
}

/* ===== CARD COMPONENTS ===== */
function MetricCell({ label, value, color, icon }) {
  return (
    <div style={S.mCell}>
      <div style={S.mLbl}>{icon && <span style={{ fontSize:"12px" }}>{icon}</span>}<TipLbl label={label} style={{ fontSize:"10px",color:"#64748b",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase" }} /></div>
      <div style={{ ...S.mVal, color: color || "#ffffff" }}>{value}</div>
    </div>
  );
}

function AssetCard({ asset, onMaint, onDispose, onFix }) {
  const ac = ASSET_CLASSES.find(x => x.id === asset.assetClass);
  const tInfo = asset.tenant ? getTI(asset.tenant) : null;
  const thumb = (
    <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"6px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)" }}>
      <WHouse condition={asset.condition} gla={asset.gla} developing={asset.developing} assetClass={asset.assetClass} seed={asset.visualSeed||0} />
    </div>
  );

  if (asset.developing) {
    const pD = ((asset.totalDevQuarters||4) - asset.devQuartersLeft) / (asset.totalDevQuarters||4) * 100;
    return (
      <div style={S.card}>
        <div style={{ display:"flex",gap:"12px" }}>
          {thumb}
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{asset.flag} {asset.name}</div>
                <div style={{ fontSize:"11px",color:T.txtD }}>{ac?.icon} {asset.assetClassName} {"\u00B7"} {asset.marketName} {"\u00B7"} Dev</div>
              </div>
              <span style={condSt("A")}>DEV</span>
            </div>
          </div>
        </div>
        <div style={S.grid}>
          <div><TipLbl label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla/1000).toFixed(0)}k</div></div>
          <div><TipLbl label="Dev Cost" style={S.stat} /><div style={S.val}>{fmtM(asset.totalDevCost||0)}</div></div>
          <div><TipLbl label="Completion" style={S.stat} /><div style={S.val}>{asset.devQuartersLeft}Q</div></div>
        </div>
        <div style={{ height:"4px",background:T.bdr,borderRadius:"2px",marginTop:"6px" }}>
          <div style={{ height:"100%",width:pD+"%",background:T.acc,borderRadius:"2px" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={S.card}>
      <div style={{ display:"flex",gap:"12px" }}>
        {thumb}
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>
                {asset.flag} {asset.name}
                {asset.urgentIssue && <span style={{ display:"inline-block",padding:"2px 6px",borderRadius:"4px",fontSize:"9px",fontWeight:700,background:T.redD,color:T.red,marginLeft:"5px" }}>{"\u26A0"} ISSUE</span>}
              </div>
              <div style={{ fontSize:"11px",color:T.txtD }}>
                {ac?.icon} {asset.assetClassName} {"\u00B7"} {asset.marketName}
                {asset.tenant && (
                  <>{" \u00B7 "}<span style={{ color:T.acc }}>{asset.tenant}</span>
                  {tInfo && <span style={{ marginLeft:"4px",fontSize:"9px",color:credCol(tInfo.credit),background:"rgba(0,0,0,0.3)",padding:"1px 4px",borderRadius:"3px" }}>{tInfo.credit}</span>}</>
                )}
              </div>
            </div>
            <div style={{ display:"flex",gap:"3px" }}>
              <span style={{ fontSize:"9px",color:T.txtD,padding:"2px 5px",background:T.accD,borderRadius:"3px" }}>EPC {asset.epcRating}</span>
              <span style={condSt(asset.condition)}>Gr {asset.condition}</span>
            </div>
          </div>
        </div>
      </div>
      {asset.urgentIssue && (
        <div style={{ margin:"6px 0",padding:"6px 10px",background:T.redD,border:"1px solid "+T.red,borderRadius:"5px",fontSize:"10px",color:T.red }}>
          {"\u{1F6A8}"} {asset.urgentIssue.name}{" "}
          <button style={{ ...btnSt("red"),marginLeft:"6px",padding:"2px 6px",fontSize:"9px" }} onClick={() => onFix(asset.id)}>Fix ({fmtK(asset.gla * asset.urgentIssue.fixCost)})</button>
        </div>
      )}
      <div style={S.grid}>
        <div><TipLbl label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla/1000).toFixed(0)}k</div></div>
        <div><TipLbl label="Occupancy" style={S.stat} /><div style={{ ...S.val, color:asset.occupancy>0.85?T.grn:asset.occupancy>0.6?T.amb:T.red }}>{fmtP(asset.occupancy)}</div></div>
        <div><TipLbl label="GAV" style={S.stat} /><div style={S.val}>{fmtM(asset.value)}</div></div>
        <div><TipLbl label="Rent p.a." style={S.stat} /><div style={S.val}>{fmtM(asset.gri)}</div></div>
        <div><TipLbl label="Rent/sqm" style={S.stat} /><div style={S.val}>{"\u20AC"}{asset.rentPsm.toFixed(1)}</div></div>
        <div><TipLbl label="WALT" style={S.stat} /><div style={S.val}>{asset.leaseRemaining > 0 ? asset.leaseRemaining.toFixed(1) + "yr" : "Vacant"}</div></div>
      </div>
      <div style={{ height:"4px",background:T.bdr,borderRadius:"2px",marginTop:"6px" }}>
        <div style={{ height:"100%",width:(asset.occupancy*100)+"%",background:asset.occupancy>0.85?T.grn:asset.occupancy>0.6?T.amb:T.red,borderRadius:"2px" }} />
      </div>
      <div style={S.row}>
        {MAINT.map(mt => (
          <button key={mt.id} style={btnSt(mt.id==="refurb"?"amber":mt.id==="esg"?"green":"default")} onClick={() => onMaint(asset.id, mt.id)}>
            {mt.name} ({fmtK(asset.gla * mt.costPerSqm)})
          </button>
        ))}
        <button style={btnSt("red")} onClick={() => onDispose(asset.id)}>Dispose</button>
      </div>
    </div>
  );
}

function AcqCard({ asset, onAcquire, ok }) {
  const ac = ASSET_CLASSES.find(x => x.id === asset.assetClass);
  return (
    <div style={{ ...S.card, opacity:ok?1:0.5 }}>
      <div style={{ display:"flex",gap:"12px" }}>
        <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"6px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)" }}>
          <WHouse condition={asset.condition} gla={asset.gla} assetClass={asset.assetClass} seed={asset.visualSeed||0} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{asset.flag} {asset.name}</div>
              <div style={{ fontSize:"11px",color:T.txtD }}>{ac?.icon} {asset.assetClassName} {"\u00B7"} {asset.marketName}{asset.tenant && <>{" \u00B7 "}<span style={{ color:T.acc }}>{asset.tenant}</span></>}</div>
            </div>
            <span style={condSt(asset.condition)}>Gr {asset.condition}</span>
          </div>
        </div>
      </div>
      <div style={S.grid}>
        <div><TipLbl label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla/1000).toFixed(0)}k</div></div>
        <div><TipLbl label="Occupancy" style={S.stat} /><div style={{ ...S.val, color:asset.occupancy>0.85?T.grn:T.amb }}>{fmtP(asset.occupancy)}</div></div>
        <div><TipLbl label="Asking" style={S.stat} /><div style={{ ...S.val, color:T.wht }}>{fmtM(asset.askPrice)}</div></div>
        <div><TipLbl label="Rent p.a." style={S.stat} /><div style={S.val}>{fmtM(asset.gri)}</div></div>
        <div><TipLbl label="NIY" style={S.stat} /><div style={S.val}>{fmtP((asset.gri*0.85)/asset.askPrice)}</div></div>
        <div><TipLbl label="WALT" style={S.stat} /><div style={S.val}>{asset.leaseRemaining > 0 ? asset.leaseRemaining + "yr" : "Vacant"}</div></div>
      </div>
      <div style={S.row}><button style={btnSt("green")} onClick={() => onAcquire(asset.id)} disabled={!ok}>Acquire</button></div>
    </div>
  );
}

function DevCard({ site, onDev, ok }) {
  const ac = ASSET_CLASSES.find(x => x.id === site.assetClass);
  return (
    <div style={{ ...S.card, opacity:ok?1:0.5 }}>
      <div style={{ display:"flex",gap:"12px" }}>
        <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"6px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)" }}>
          <WHouse condition="A" gla={site.gla} developing={true} assetClass={site.assetClass} seed={parseInt(site.id.replace(/\D/g,""))||0} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{site.flag} {site.name}</div>
          <div style={{ fontSize:"11px",color:T.txtD }}>{ac?.icon} {ac?.name} {"\u00B7"} {site.marketName}</div>
        </div>
      </div>
      <div style={S.grid}>
        <div><TipLbl label="GLA" style={S.stat} /><div style={S.val}>{(site.gla/1000).toFixed(0)}k</div></div>
        <div><TipLbl label="Dev Cost" style={S.stat} /><div style={S.val}>{fmtM(site.devCost)}</div></div>
        <div><TipLbl label="Timeline" style={S.stat} /><div style={S.val}>{site.quartersToComplete}Q</div></div>
        <div><TipLbl label="Est. Rent/sqm" style={S.stat} /><div style={S.val}>{"\u20AC"}{site.estRentPsm.toFixed(1)}</div></div>
        <div><TipLbl label="Est. YOC" style={S.stat} /><div style={S.val}>{fmtP(site.estYield/100)}</div></div>
      </div>
      <div style={S.row}><button style={btnSt("default")} onClick={() => onDev(site.id)} disabled={!ok}>Develop</button></div>
    </div>
  );
}

function TeamPanel({ team, onHire, onFire }) {
  return (
    <div>
      <div style={S.sec}>Team Structure</div>
      <div style={{ ...S.card, background:T.accD, border:"1px solid "+T.acc, marginBottom:"8px" }}>
        <div style={{ fontSize:"12px",color:T.acc,fontWeight:700 }}>Quarterly Team Cost: {fmtK(teamQCost(team))}</div>
      </div>
      {TEAM_ROLES.map(r => {
        const n = team[r.id] || 0;
        return (
          <div key={r.id} style={{ ...S.card, marginBottom:"5px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px" }}>
              <div><span style={{ fontSize:"13px" }}>{r.icon}</span> <span style={{ fontSize:"12px",fontWeight:700,color:T.wht }}>{r.name}</span></div>
              <span style={{ fontSize:"16px",fontWeight:700,color:T.acc }}>{n}</span>
            </div>
            <div style={{ fontSize:"10px",color:T.txtD,marginBottom:"4px" }}>{r.desc}</div>
            <div style={{ fontSize:"10px",color:T.txtM,marginBottom:"5px" }}>Salary: {fmtK(r.salaryCost)}/yr</div>
            <div style={S.row}>
              <button style={btnSt("green")} onClick={() => onHire(r.id)}>+ Hire</button>
              {n > 0 && <button style={btnSt("red")} onClick={() => onFire(r.id)}>- Remove</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== START SCREEN ===== */
function StartScreen({ onStart }) {
  const [cn, setCn] = useState("");
  const [cap, setCap] = useState(150e6);
  const [diff, setDiff] = useState("guided");
  const [sm, setSm] = useState(["uk","de","pl"]);
  const [step, setStep] = useState(0);

  const toggle = (id) => setSm(p => p.includes(id) ? p.filter(m => m !== id) : p.length < 4 ? [...p, id] : p);
  const ok = step === 0 ? cn.trim().length > 0 : step === 1 ? true : sm.length > 0;
  const next = () => { if (step < 2) setStep(step + 1); else onStart({ companyName:cn.trim(), cash:cap, startMarkets:sm, difficulty:diff }); };
  const saved = hasSave() ? loadGame() : null;

  const wrap = { minHeight:"100vh",background:"linear-gradient(180deg,"+T.bg+",#0d1321)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono', monospace",color:T.txt,padding:"20px" };
  const cont = { maxWidth:"500px",width:"100%" };
  const opt = (sel) => ({ padding:"11px 12px",background:sel?T.accD:T.card,border:"1px solid "+(sel?T.acc:T.bdr),borderRadius:"6px",cursor:"pointer",marginBottom:"6px" });
  const mktSt = (sel) => ({ padding:"9px 10px",background:sel?T.accD:T.card,border:"1px solid "+(sel?T.acc:T.bdr),borderRadius:"6px",cursor:"pointer",textAlign:"center" });
  const nxtSt = (en) => ({ flex:1,padding:"11px 18px",background:en?"linear-gradient(135deg,"+T.acc+",#2563eb)":T.card,color:en?T.wht:T.txtM,border:en?"none":"1px solid "+T.bdr,borderRadius:"6px",cursor:en?"pointer":"default",fontSize:"12px",fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em",textTransform:"uppercase",boxShadow:en?"0 2px 12px rgba(59,130,246,0.3)":"none" });

  const CAPS = [{l:"\u20AC100m",v:100e6,d:"Scrappy challenger"},{l:"\u20AC150m",v:150e6,d:"Mid-market platform"},{l:"\u20AC250m",v:250e6,d:"Institutional player"},{l:"\u20AC500m",v:500e6,d:"Mega fund"}];
  const DIFFS = [{l:"Guided",v:"guided",d:"Start with 3 seed assets"},{l:"Blank Slate",v:"blank",d:"Cash only"}];

  return (
    <div style={wrap}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={cont}>
        <div style={{ textAlign:"center",marginBottom:"36px" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",marginBottom:"4px" }}>
            <Logo size={36} />
            <div style={{ fontSize:"26px",fontWeight:700,color:T.wht,letterSpacing:"0.06em" }}>LOGISIM</div>
          </div>
          <div style={{ fontSize:"10px",color:T.txtD,letterSpacing:"0.12em",textTransform:"uppercase" }}>European Logistics Real Estate Simulator</div>
        </div>

        {saved && step === 0 && (
          <div style={{ marginBottom:"16px" }}>
            <div style={{ ...opt(false),background:T.grnD,border:"1px solid "+T.grn,cursor:"pointer",textAlign:"center" }} onClick={() => onStart("__load__")}>
              <div style={{ fontSize:"13px",fontWeight:700,color:T.grn,marginBottom:"2px" }}>{"\u25B6"} Continue: {saved.companyName}</div>
              <div style={{ fontSize:"10px",color:T.txtD }}>{getQL(saved.quarter,saved.year)} {"\u00B7"} {saved.portfolio?.length||0} assets {"\u00B7"} {fmtM(saved.cash)}</div>
            </div>
            <div style={{ textAlign:"center",fontSize:"9px",color:T.txtM,margin:"10px 0 4px",letterSpacing:"0.08em",textTransform:"uppercase" }}>{"\u2014"} or start fresh {"\u2014"}</div>
          </div>
        )}

        <div style={{ display:"flex",gap:"5px",justifyContent:"center",marginBottom:"20px" }}>
          {[0,1,2].map(i => <div key={i} style={{ width:"7px",height:"7px",borderRadius:"50%",background:step>=i?T.acc:T.bdr }} />)}
        </div>

        {step === 0 && (
          <div>
            <div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 1 of 3</div>
            <div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Name your platform</div>
            <div style={{ fontSize:"12px",color:T.txtD,marginBottom:"16px",lineHeight:1.5 }}>You are the CEO of a European logistics real estate platform.</div>
            <input style={{ width:"100%",padding:"11px 12px",background:T.card,border:"1px solid "+T.bdr,borderRadius:"6px",color:T.wht,fontSize:"14px",fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} placeholder="e.g. Apex Logistics" value={cn} onChange={e => setCn(e.target.value)} onKeyDown={e => e.key==="Enter"&&ok&&next()} autoFocus />
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 2 of 3</div>
            <div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Capital and mode</div>
            <div style={{ fontSize:"12px",color:T.txtD,marginBottom:"14px" }}>How much equity?</div>
            {CAPS.map(o => <div key={o.v} style={opt(cap===o.v)} onClick={() => setCap(o.v)}><div style={{ fontSize:"13px",fontWeight:600,color:cap===o.v?T.acc:T.wht }}>{o.l}</div><div style={{ fontSize:"10px",color:T.txtD }}>{o.d}</div></div>)}
            <div style={{ marginTop:"10px" }}>
              {DIFFS.map(o => <div key={o.v} style={opt(diff===o.v)} onClick={() => setDiff(o.v)}><div style={{ fontSize:"13px",fontWeight:600,color:diff===o.v?T.acc:T.wht }}>{o.l}</div><div style={{ fontSize:"10px",color:T.txtD }}>{o.d}</div></div>)}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 3 of 3</div>
            <div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Starting markets</div>
            <div style={{ fontSize:"12px",color:T.txtD,marginBottom:"12px" }}>Pick up to 4.</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px" }}>
              {MARKETS.map(m => (
                <div key={m.id} style={mktSt(sm.includes(m.id))} onClick={() => toggle(m.id)}>
                  <div style={{ fontSize:"17px",marginBottom:"1px" }}>{m.flag}</div>
                  <div style={{ fontSize:"11px",fontWeight:600,color:sm.includes(m.id)?T.acc:T.txt }}>{m.name}</div>
                  <div style={{ fontSize:"9px",color:T.txtD }}>Cap {m.capRate}% {"\u00B7"} {"\u20AC"}{m.baseRent}/sqm</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:"9px",color:T.txtM,marginTop:"5px",textAlign:"center" }}>{sm.length}/4 selected</div>
          </div>
        )}

        <div style={{ display:"flex",gap:"6px",marginTop:"24px" }}>
          {step > 0 && <button style={{ padding:"11px 16px",background:"transparent",color:T.txtD,border:"1px solid "+T.bdr,borderRadius:"6px",cursor:"pointer",fontSize:"11px",fontWeight:600,fontFamily:"inherit" }} onClick={() => setStep(step-1)}>{"\u2190"} Back</button>}
          <button style={nxtSt(ok)} onClick={() => ok && next()}>{step < 2 ? "Continue \u2192" : "Launch Simulator \u2192"}</button>
        </div>
      </div>
    </div>
  );
}

/* ===== MAIN APP ===== */
export default function LogisticsRESimulator() {
  const [started, setStarted] = useState(false);
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("portfolio");
  const [rTab, setRTab] = useState("sentiment");
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (state && started) saveGame(state); }, [state, started]);

  const onStart = useCallback((cfg) => {
    if (cfg === "__load__") { const s = loadGame(); if (s) { setState(s); setStarted(true); } }
    else { delSave(); setState(initGame(cfg)); setStarted(true); }
  }, []);

  const onAdvance = useCallback(() => setState(p => p ? advanceQ(p) : p), []);

  const onAcquire = useCallback((id) => setState(p => {
    if (!p) return p;
    const a = p.acquisitions.find(x => x.id === id);
    if (!a || p.cash < a.askPrice) return p;
    const q = { ...a, acquired:true, value:a.askPrice };
    delete q.askPrice;
    return { ...p, cash:p.cash-a.askPrice, portfolio:[...p.portfolio,q], acquisitions:p.acquisitions.filter(x => x.id !== id),
      events:[...p.events, "\u{1F3E2} Acquired "+a.flag+" "+a.name+" for "+fmtM(a.askPrice)],
      newsLog:[...(p.newsLog||[]), {icon:"\u{1F3E2}",text:"Acquired "+a.name+" for "+fmtM(a.askPrice),color:T.acc}] };
  }), []);

  const onDispose = useCallback((id) => setState(p => {
    if (!p) return p;
    const a = p.portfolio.find(x => x.id === id);
    if (!a) return p;
    const pr = a.value * 0.97;
    return { ...p, cash:p.cash+pr, portfolio:p.portfolio.filter(x => x.id !== id),
      events:[...p.events, "\u{1F4B0} Disposed "+a.flag+" "+a.name+" for "+fmtM(pr)],
      newsLog:[...(p.newsLog||[]), {icon:"\u{1F4B0}",text:"Disposed "+a.name+" at "+fmtM(pr),color:T.amb}] };
  }), []);

  const onMaint = useCallback((aid, mid) => setState(p => {
    if (!p) return p;
    const mt = MAINT.find(m => m.id === mid);
    const a = p.portfolio.find(x => x.id === aid);
    if (!mt || !a) return p;
    const cost = a.gla * mt.costPerSqm;
    if (p.cash < cost) return p;
    const up = p.portfolio.map(x => {
      if (x.id !== aid) return x;
      const n = { ...x, capexSpent:x.capexSpent+cost };
      if (mid === "rm") n.lastRM = p.quarter;
      if (mt.gradeUp && n.condition !== "A") { n.condition = n.condition==="C"?"B":"A"; n.rentPsm *= 1.08; }
      if (mt.esgBoost) { n.epcRating = n.epcRating==="E"?"D":n.epcRating==="D"?"C":n.epcRating==="C"?"B":"A"; n.occupancy = Math.min(1, n.occupancy+mt.occBoost); }
      if (mt.occBoost && !mt.esgBoost) n.occupancy = Math.min(1, n.occupancy+mt.occBoost);
      const mk = MARKETS.find(m => m.id === n.market);
      const ac = ASSET_CLASSES.find(c => c.id === n.assetClass) || ASSET_CLASSES[0];
      n.gri = n.gla * n.rentPsm * n.occupancy;
      n.value = n.gri > 0 ? n.gri / ((mk?.capRate||5)*(ac?.capRateMult||1)/100) : n.value;
      return n;
    });
    return { ...p, cash:p.cash-cost, portfolio:up, events:[...p.events, "\u{1F527} "+mt.name+" on "+a.flag+" "+a.name+" ("+fmtK(cost)+")"] };
  }), []);

  const onFix = useCallback((aid) => setState(p => {
    if (!p) return p;
    const a = p.portfolio.find(x => x.id === aid);
    if (!a || !a.urgentIssue) return p;
    const cost = a.gla * a.urgentIssue.fixCost;
    if (p.cash < cost) return p;
    return { ...p, cash:p.cash-cost,
      portfolio:p.portfolio.map(x => x.id !== aid ? x : { ...x, urgentIssue:null, capexSpent:x.capexSpent+cost }),
      events:[...p.events, "\u2705 Fixed "+a.flag+" "+a.name+" ("+fmtK(cost)+")"] };
  }), []);

  const onDev = useCallback((id) => setState(p => {
    if (!p) return p;
    const s = p.devSites.find(x => x.id === id);
    if (!s || p.cash < s.devCost) return p;
    aCtr++;
    const d = { id:s.id, name:s.name.replace(" (Dev)",""), market:s.market, marketName:s.marketName, flag:s.flag,
      assetClass:s.assetClass, assetClassName:s.assetClassName, assetClassIcon:s.assetClassIcon,
      gla:s.gla, rentPsm:s.estRentPsm, occupancy:0, tenant:null, leaseRemaining:0, gri:0, value:0,
      age:0, condition:"A", epcRating:"A", capexSpent:0, acquired:true, developing:true,
      devQuartersLeft:s.quartersToComplete, totalDevQuarters:s.quartersToComplete, totalDevCost:s.devCost,
      devCostSoFar:0, visualSeed:aCtr, urgentIssue:null, lastRM:0 };
    return { ...p, cash:p.cash-s.devCost, portfolio:[...p.portfolio,d], devSites:p.devSites.filter(x => x.id !== id),
      events:[...p.events, "\u{1F3D7}\uFE0F Started "+s.flag+" "+s.name+" ("+fmtM(s.devCost)+")"],
      newsLog:[...(p.newsLog||[]), {icon:"\u{1F3D7}\uFE0F",text:"Development: "+s.name,color:T.acc}] };
  }), []);

  const onHire = useCallback((r) => setState(p => p ? { ...p, team:{ ...p.team, [r]:(p.team[r]||0)+1 } } : p), []);
  const onFire = useCallback((r) => setState(p => p && (p.team[r]||0) > 0 ? { ...p, team:{ ...p.team, [r]:p.team[r]-1 } } : p), []);
  const onReset = useCallback(() => { delSave(); setStarted(false); setState(null); setTab("portfolio"); setRTab("sentiment"); }, []);
  const onSave = useCallback(() => { if (state) { saveGame(state); setSaved(true); setTimeout(() => setSaved(false), 2000); } }, [state]);

  const onSelectTenant = useCallback((cand) => {
    setState(p => {
      if (!p || !p.tenantSelection) return p;
      const { assetId } = p.tenantSelection;
      const updated = p.portfolio.map(a => {
        if (a.id !== assetId) return a;
        const n = { ...a, tenant:cand.name, leaseRemaining:cand.term, rentPsm:cand.rentPsm, occupancy:Math.min(1, a.occupancy+rBetween(0.2,0.45)) };
        const mkt = MARKETS.find(m => m.id === n.market);
        const ac = ASSET_CLASSES.find(c => c.id === n.assetClass) || ASSET_CLASSES[0];
        n.gri = n.gla * n.rentPsm * n.occupancy;
        n.value = n.gri > 0 ? n.gri / ((mkt?.capRate||5)*(ac?.capRateMult||1)/100) : n.value;
        return n;
      });
      return { ...p, portfolio:updated, tenantSelection:null,
        events:[...p.events, "\u{1F91D} Selected "+cand.name],
        newsLog:[...(p.newsLog||[]), {icon:"\u{1F91D}",text:cand.name+" signed "+cand.term+"yr lease",color:T.grn}] };
    });
  }, []);

  const onDecline = useCallback(() => setState(p => p ? { ...p, tenantSelection:null } : p), []);

  if (!started || !state) return <StartScreen onStart={onStart} />;

  const m = calcMetrics(state);
  const ql = getQL(state.quarter, state.year);
  const irr = calcIRR(state.initialCash||state.cash, m.totalGAV, state.cash, state.quarter);

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {state.tenantSelection && <TenantModal candidates={state.tenantSelection.candidates} assetName={state.tenantSelection.assetName} onSelect={onSelectTenant} onClose={onDecline} />}

      {/* HEADER */}
      <div style={S.hdr}>
        <div style={S.logo}>
          <Logo size={30} />
          <div>
            <div style={{ fontSize:"15px",fontWeight:800,color:T.wht,letterSpacing:"0.05em" }}>{state.companyName.toUpperCase()}</div>
            <div style={{ fontSize:"9px",color:T.txtD,letterSpacing:"0.1em",textTransform:"uppercase" }}>LOGISIM</div>
          </div>
        </div>
        <NewsFeed items={state.newsLog || []} />
        <div style={{ display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",flexShrink:0 }}>
          <div style={{ padding:"5px 12px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"6px" }}>
            <div style={{ fontSize:"9px",color:T.grn,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>CASH</div>
            <div style={{ fontSize:"17px",fontWeight:800,color:T.grn }}>{fmtM(state.cash)}</div>
          </div>
          <div style={{ padding:"5px 12px",background:T.accD,border:"1px solid "+T.acc,borderRadius:"6px" }}>
            <div style={{ fontSize:"9px",color:T.acc,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>PERIOD</div>
            <div style={{ fontSize:"15px",fontWeight:800,color:"#ffffff" }}>{ql}</div>
          </div>
          <button style={{ padding:"9px 18px",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:T.wht,border:"none",borderRadius:"6px",cursor:"pointer",fontSize:"11px",fontWeight:800,fontFamily:"inherit",letterSpacing:"0.05em",textTransform:"uppercase",boxShadow:"0 2px 16px rgba(239,68,68,0.4)" }} onClick={onAdvance}>Next Qtr {"\u2192"}</button>
          <button style={{ ...btnSt("green"),padding:"5px 9px",fontSize:"9px" }} onClick={onSave}>{saved ? "\u2713" : "Save"}</button>
          <button style={{ ...btnSt("default"),padding:"5px 9px",fontSize:"9px" }} onClick={onReset}>Reset</button>
        </div>
      </div>

      {/* METRICS BAR */}
      <div style={S.mBar}>
        <MetricCell label="Portfolio GAV" value={fmtM(m.totalGAV)} icon={"\u{1F48E}"} />
        <MetricCell label="Assets" value={m.assetCount} icon={"\u{1F3E2}"} />
        <MetricCell label="Total GLA" value={(m.totalGLA/1000).toFixed(0)+"k sqm"} icon={"\u{1F4D0}"} />
        <MetricCell label="Avg Occupancy" value={fmtP(m.avgOcc)} color={m.avgOcc>0.85?T.grn:m.avgOcc>0.6?T.amb:T.red} icon={"\u{1F4CA}"} />
        <MetricCell label="GRI p.a." value={fmtM(m.totalGRI)} icon={"\u{1F4B6}"} />
        <MetricCell label="NOI p.a." value={fmtM(m.noi)} color={T.grn} icon={"\u{1F4C8}"} />
        <MetricCell label="NOI Yield" value={fmtP(m.noiYield)} icon={"\u{1F3AF}"} />
        <MetricCell label="Avg WALT" value={m.avgWALT.toFixed(1)+"yr"} icon={"\u{1F4C5}"} />
      </div>

      {/* MAIN CONTENT */}
      <div style={S.main}>
        <div style={S.lp}>
          <div style={S.tabs}>
            {["portfolio","acquire","develop","team"].map(t => (
              <button key={t} style={tabSt(tab===t)} onClick={() => setTab(t)}>
                {t==="portfolio" ? "Portfolio ("+state.portfolio.length+")" : t==="acquire" ? "Acquire ("+state.acquisitions.length+")" : t==="develop" ? "Develop ("+state.devSites.length+")" : "Team"}
              </button>
            ))}
          </div>

          {tab === "portfolio" && (
            <>
              {!state.portfolio.length && <div style={S.empty}>No assets yet. Go to Acquire.</div>}
              {state.portfolio.map(a => <AssetCard key={a.id} asset={a} onMaint={onMaint} onDispose={onDispose} onFix={onFix} />)}
            </>
          )}
          {tab === "acquire" && (
            <>
              <div style={S.sec}>Available Acquisitions</div>
              {!state.acquisitions.length && <div style={S.empty}>No assets on market.</div>}
              {state.acquisitions.map(a => <AcqCard key={a.id} asset={a} onAcquire={onAcquire} ok={state.cash >= a.askPrice} />)}
            </>
          )}
          {tab === "develop" && (
            <>
              <div style={S.sec}>Development Opportunities</div>
              {!state.devSites.length && <div style={S.empty}>No sites available.</div>}
              {state.devSites.map(s => <DevCard key={s.id} site={s} onDev={onDev} ok={state.cash >= s.devCost} />)}
            </>
          )}
          {tab === "team" && <TeamPanel team={state.team} onHire={onHire} onFire={onFire} />}
        </div>

        <div style={S.rp}>
          <div style={S.tabs}>
            {["sentiment","charts","events"].map(t => (
              <button key={t} style={tabSt(rTab===t)} onClick={() => setRTab(t)}>
                {t==="sentiment" ? "Board" : t==="charts" ? "Charts" : "Events"}
              </button>
            ))}
          </div>

          {rTab === "sentiment" && (() => {
            const { sentiments, boardComments } = genSentiment(m, state.history, state);
            return (
              <div>
                {irr !== null && (
                  <div style={{ ...S.card, background:irr>0.10?T.grnD:irr>0.05?T.ambD:T.redD, border:"1px solid "+(irr>0.10?T.grn:irr>0.05?T.amb:T.red), marginBottom:"10px", textAlign:"center" }}>
                    <div style={{ fontSize:"9px",color:irr>0.10?T.grn:irr>0.05?T.amb:T.red,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>Portfolio IRR</div>
                    <div style={{ fontSize:"22px",fontWeight:800,color:irr>0.10?T.grn:irr>0.05?T.amb:T.red }}>{fmtP(irr)}</div>
                    <div style={{ fontSize:"9px",color:T.txtD }}>Target: 10-12% net {"\u00B7"} {(state.quarter/4).toFixed(1)}yr</div>
                  </div>
                )}
                <div style={S.sec}>Investor Sentiment</div>
                {sentiments.map((s, i) => (
                  <div key={i} style={{ ...S.card, padding:"8px 12px", marginBottom:"6px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px" }}>
                      <span style={{ fontSize:"11px",fontWeight:700,color:T.txt }}>{s.metric}</span>
                      <SentBadge mood={s.mood} label={s.label} />
                    </div>
                    <div style={{ fontSize:"10px",color:T.txtD,lineHeight:1.4 }}>{s.comment}</div>
                  </div>
                ))}
                <div style={{ ...S.sec, marginTop:"14px" }}>Board Commentary</div>
                {boardComments.map((b, i) => (
                  <div key={i} style={{ ...S.card, padding:"8px 12px", marginBottom:"6px", borderLeft:"3px solid "+T.acc }}>
                    <div style={{ fontSize:"9px",color:T.acc,fontWeight:600,marginBottom:"3px",textTransform:"uppercase",letterSpacing:"0.05em" }}>{b.member}</div>
                    <div style={{ fontSize:"10px",color:T.txt,lineHeight:1.5,fontStyle:"italic" }}>{b.text}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {rTab === "charts" && (
            <div>
              {state.history.length < 2 ? <div style={S.empty}>Advance a few quarters.</div> : (
                [{l:"Portfolio GAV",k:"totalGAV",c:T.acc,f:fmtM},{l:"Occupancy",k:"avgOcc",c:T.grn,f:fmtP},{l:"NOI p.a.",k:"noi",c:"#10b981",f:fmtM},{l:"Cash",k:"cash",c:T.amb,f:fmtM}].map(ch => (
                  <div key={ch.k}>
                    <div style={S.sec}>{ch.l}</div>
                    <div style={{ ...S.card, padding:"8px 12px", marginBottom:"7px" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"4px" }}>
                        <span style={{ fontSize:"10px",color:T.txtD }}>{ch.l}</span>
                        <span style={{ fontSize:"14px",fontWeight:800,color:T.wht }}>{ch.f(state.history[state.history.length-1]?.[ch.k]||0)}</span>
                      </div>
                      <Spark data={state.history.map(h => h[ch.k])} color={ch.c} height={48} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {rTab === "events" && (
            <div style={S.evLog}>
              {!state.events.length && <div style={S.empty}>Advance to begin.</div>}
              {[...state.events].reverse().map((e, i) => <div key={i} style={S.evItem}>{e}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
