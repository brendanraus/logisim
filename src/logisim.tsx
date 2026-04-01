import { useState, useCallback, useEffect, useRef } from "react";

/* ===== DATA ===== */
const MARKETS = [
  { id:"uk",name:"United Kingdom",flag:"",city:"London",baseRent:75,capRate:4.8,demand:0.85 },
  { id:"de",name:"Germany",flag:"",city:"Frankfurt",baseRent:52,capRate:4.2,demand:0.80 },
  { id:"fr",name:"France",flag:"",city:"Paris",baseRent:58,capRate:4.5,demand:0.75 },
  { id:"pl",name:"Poland",flag:"",city:"Warsaw",baseRent:42,capRate:6.5,demand:0.90 },
  { id:"nl",name:"Netherlands",flag:"",city:"Amsterdam",baseRent:68,capRate:4.0,demand:0.82 },
  { id:"cz",name:"Czech Republic",flag:"",city:"Prague",baseRent:48,capRate:5.8,demand:0.78 },
  { id:"es",name:"Spain",flag:"",city:"Madrid",baseRent:50,capRate:5.2,demand:0.72 },
  { id:"se",name:"Sweden",flag:"",city:"Stockholm",baseRent:62,capRate:4.3,demand:0.70 },
  { id:"it",name:"Italy",flag:"",city:"Milan",baseRent:46,capRate:5.5,demand:0.68 },
  { id:"be",name:"Belgium",flag:"",city:"Brussels",baseRent:55,capRate:4.6,demand:0.76 },
  { id:"at",name:"Austria",flag:"",city:"Vienna",baseRent:50,capRate:4.9,demand:0.74 },
  { id:"dk",name:"Denmark",flag:"",city:"Copenhagen",baseRent:64,capRate:4.1,demand:0.72 },
  { id:"tr",name:"Turkey",flag:"",city:"Istanbul",baseRent:28,capRate:8.5,demand:0.92 },
  { id:"ro",name:"Romania",flag:"",city:"Bucharest",baseRent:34,capRate:7.8,demand:0.88 },
  { id:"hu",name:"Hungary",flag:"",city:"Budapest",baseRent:38,capRate:7.0,demand:0.86 },
  { id:"gr",name:"Greece",flag:"",city:"Athens",baseRent:32,capRate:7.2,demand:0.65 },
  { id:"pt",name:"Portugal",flag:"",city:"Lisbon",baseRent:40,capRate:5.9,demand:0.70 },
  { id:"ie",name:"Ireland",flag:"",city:"Dublin",baseRent:60,capRate:4.4,demand:0.78 },
  { id:"sk",name:"Slovakia",flag:"",city:"Bratislava",baseRent:36,capRate:6.8,demand:0.82 },
  { id:"hr",name:"Croatia",flag:"",city:"Zagreb",baseRent:30,capRate:7.5,demand:0.60 },
  { id:"bg",name:"Bulgaria",flag:"",city:"Sofia",baseRent:26,capRate:8.2,demand:0.72 },
  { id:"fi",name:"Finland",flag:"",city:"Helsinki",baseRent:54,capRate:4.7,demand:0.68 },
  { id:"no",name:"Norway",flag:"",city:"Oslo",baseRent:70,capRate:4.0,demand:0.66 },
  { id:"rs",name:"Serbia",flag:"",city:"Belgrade",baseRent:24,capRate:8.8,demand:0.74 },
];

const ASSET_CLASSES = [
  { id:"bigbox",name:"Big Box / Distribution",icon:"",tileColor:"#8a7a20",tileDark:"#3a3008",rentMult:1.0,capRateMult:1.0,riskFactor:0.05,demandMult:1.0,scPerSqm:18,insurancePerSqm:3,ratesPerSqm:12,maintPerSqm:5 },
  { id:"lastmile",name:"Last Mile / Urban",icon:"",tileColor:"#6b4f10",tileDark:"#2a1e05",rentMult:1.35,capRateMult:0.85,riskFactor:0.08,demandMult:1.1,scPerSqm:24,insurancePerSqm:4,ratesPerSqm:18,maintPerSqm:7 },
  { id:"fulfilment",name:"Fulfilment Centre",icon:"",tileColor:"#1a6b3a",tileDark:"#0a2e16",rentMult:1.15,capRateMult:0.95,riskFactor:0.07,demandMult:1.05,scPerSqm:22,insurancePerSqm:3.5,ratesPerSqm:14,maintPerSqm:6 },
  { id:"datactr",name:"Data Centre",icon:"",tileColor:"#8a2050",tileDark:"#3a0820",rentMult:2.2,capRateMult:0.7,riskFactor:0.15,demandMult:0.7,scPerSqm:45,insurancePerSqm:8,ratesPerSqm:20,maintPerSqm:15 },
  { id:"coldstor",name:"Cold Storage",icon:"",tileColor:"#1a6080",tileDark:"#082838",rentMult:1.5,capRateMult:0.9,riskFactor:0.10,demandMult:0.75,scPerSqm:35,insurancePerSqm:5,ratesPerSqm:14,maintPerSqm:12 },
  { id:"multilet",name:"Multi-Let Industrial",icon:"",tileColor:"#8a2020",tileDark:"#380808",rentMult:0.9,capRateMult:1.1,riskFactor:0.04,demandMult:0.95,scPerSqm:15,insurancePerSqm:2.5,ratesPerSqm:10,maintPerSqm:4 },
  { id:"crossdock",name:"Cross-Dock Terminal",icon:"",tileColor:"#8a4010",tileDark:"#381a08",rentMult:1.1,capRateMult:0.92,riskFactor:0.06,demandMult:1.02,scPerSqm:20,insurancePerSqm:3,ratesPerSqm:12,maintPerSqm:6 },
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
  "Nova Distribution","Citadel Park","Pegasus Hub","Beacon Logistics",
  "Trident Estate","Falcon Park","Olympus Hub","Sapphire DC","Granite Yard",
  "Platinum Park","Corsair Hub","Diamond Centre","Polaris DC","Helios Park",
  "Ironside Estate","Voyager Hub","Nebula Park","Tempest DC","Cobalt Yard",
  "Obsidian Park","Valiant Hub","Mirage DC","Torrent Estate","Cascade Park",
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
  "Trendyol":{credit:"BB",revenue:"\u20AC5bn",employees:"30k",sector:"E-commerce",insolvencyRisk:0.10},
  "Getir":{credit:"B+",revenue:"\u20AC1bn",employees:"8k",sector:"Quick Commerce",insolvencyRisk:0.20},
  "Hepsiburada":{credit:"BB-",revenue:"\u20AC1.5bn",employees:"5k",sector:"E-commerce",insolvencyRisk:0.14},
  "eMAG":{credit:"BB",revenue:"\u20AC2bn",employees:"8k",sector:"E-commerce",insolvencyRisk:0.11},
  "Allegro":{credit:"BBB-",revenue:"\u20AC1.8bn",employees:"4k",sector:"E-commerce",insolvencyRisk:0.07},
};

const TENANT_POOL = {
  bigbox:["Amazon","DHL","DB Schenker","XPO","GXO","DSV Panalpina","Kuehne+Nagel","Lidl Distribution","Maersk Logistics","FedEx Supply Chain"],
  lastmile:["Amazon Logistics","DPD","Evri","Royal Mail","GLS","InPost","Yodel","UPS Express","Trendyol","Getir"],
  fulfilment:["Amazon","ASOS Fulfilment","Zalando","Decathlon","Ocado","Boohoo","Zara Logistics","H&M Distribution","Hepsiburada","eMAG","Allegro"],
  datactr:["Equinix","Digital Realty","AWS","Microsoft Azure","Google Cloud","NTT","CyrusOne","Iron Mountain"],
  coldstor:["Lineage Logistics","Americold","Tesco Distribution","HelloFresh","Sysco","Musgrave","Brake Bros"],
  multilet:["SME Tenants","Mixed Industrial","Local Manufacturers","Trade Counter Ops","Regional Distributors"],
  crossdock:["DHL Express","FedEx","UPS","TNT Express","DPD","Hermes","Amazon Flex"],
};

const TEAM_ROLES = [
  { id:"transactions",name:"Transactions",salaryCost:120000,desc:"Better deal discovery, lower asking prices" },
  { id:"assetMgmt",name:"Asset Management",salaryCost:100000,desc:"Better occupancy, faster lease-up" },
  { id:"portfolioMgmt",name:"Portfolio Management",salaryCost:130000,desc:"Strategic oversight, risk monitoring" },
  { id:"bi",name:"Business Intelligence",salaryCost:110000,desc:"Each analyst hired unlocks one additional data view" },
  { id:"treasury",name:"Treasury",salaryCost:140000,desc:"Reduces financing costs; first hire unlocks debt markets" },
  { id:"esg",name:"ESG & Sustainability",salaryCost:105000,desc:"Improves EPC rating speed, attracts premium tenants" },
];

const DEBT_TYPES = [
  { id:"senior",name:"Senior Secured",spread:1.5,ltv:0.60,desc:"Standard institutional senior lending against portfolio GAV" },
  { id:"green",name:"Green Bond",spread:1.0,ltv:0.55,desc:"ESG-linked green finance — lower spread, requires EPC B+ average" },
  { id:"mezz",name:"Mezzanine",spread:3.5,ltv:0.75,desc:"Higher leverage tranche — expensive but unlocks more capital" },
  { id:"sovereign",name:"Sovereign / EIB",fixedRate:3.2,ltv:0.50,desc:"Fixed-rate European sovereign debt — cheapest, conservative LTV" },
];
const BASE_RATE = 3.0;

const MEGA_ASSET_DEFS = [
  { name:"Tesla Gigafactory Hub",assetClass:"bigbox",glaRange:[280000,420000],rentMultBonus:1.4,desc:"EV mega-campus logistics" },
  { name:"Amazon Prime Central",assetClass:"fulfilment",glaRange:[350000,500000],rentMultBonus:1.3,desc:"Hyper-scale fulfilment" },
  { name:"IKEA Mega Distribution",assetClass:"bigbox",glaRange:[200000,320000],rentMultBonus:1.2,desc:"Big-box retail logistics" },
  { name:"Microsoft Azure Campus",assetClass:"datactr",glaRange:[60000,120000],rentMultBonus:2.5,desc:"Hyperscale data centre" },
  { name:"DHL SuperHub Gateway",assetClass:"crossdock",glaRange:[180000,300000],rentMultBonus:1.35,desc:"International air-freight gateway" },
  { name:"Maersk Global Port DC",assetClass:"fulfilment",glaRange:[250000,380000],rentMultBonus:1.25,desc:"Port-side mega distribution" },
  { name:"Lidl Cold Mega Hub",assetClass:"coldstor",glaRange:[120000,200000],rentMultBonus:1.5,desc:"National cold-chain backbone" },
  { name:"Trendyol Eurasia Hub",assetClass:"fulfilment",glaRange:[200000,350000],rentMultBonus:1.3,desc:"Cross-border e-commerce mega hub" },
  { name:"Google DC Nordics",assetClass:"datactr",glaRange:[80000,150000],rentMultBonus:2.3,desc:"Nordic hyperscale data centre" },
];

const MAINT = [
  { id:"rm",name:"R&M",costPerSqm:8,gradeUp:false,esgBoost:false,occBoost:0 },
  { id:"esg",name:"ESG Upgrade",costPerSqm:50,gradeUp:false,esgBoost:true,occBoost:0.05 },
  { id:"refurb",name:"Refurbishment",costPerSqm:120,gradeUp:true,esgBoost:false,occBoost:0.08 },
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
const fmtM = (n) => n < 0 ? "(\u20AC" + (Math.abs(n) / 1e6).toFixed(1) + "m)" : "\u20AC" + (n / 1e6).toFixed(1) + "m";
const fmtK = (n) => n < 0 ? "(\u20AC" + (Math.abs(n) / 1e3).toFixed(0) + "k)" : "\u20AC" + (n / 1e3).toFixed(0) + "k";
const fmtP = (n) => (n * 100).toFixed(1) + "%";
const getTI = (n) => TENANT_DB[n] || { credit:"NR",revenue:"N/A",employees:"N/A",sector:"Unknown",insolvencyRisk:0.10 };
const credCol = (c) => (c.startsWith("AA")||c==="A+"||c==="A") ? "#5a9a6a" : (c.startsWith("BBB")||c==="A-") ? "#a08840" : "#a04040";

/* ===== PROPERTY COST MODEL ===== */
function calcAssetCosts(asset, ac) {
  if (!ac) ac = ASSET_CLASSES.find(x => x.id === asset.assetClass) || ASSET_CLASSES[0];
  const gla = asset.gla;
  const occ = asset.occupancy;
  const vacantGla = gla * (1 - occ);
  const totalSC = ac.scPerSqm * gla;
  const recoveredSC = totalSC * occ;
  const irrecoverableSC = totalSC - recoveredSC;
  const insurance = ac.insurancePerSqm * gla;
  const voidRates = ac.ratesPerSqm * vacantGla;
  const condMult = asset.condition === "A" ? 0.6 : asset.condition === "B" ? 1.0 : 1.5;
  const issueMult = asset.urgentIssue ? 1.4 : 1.0;
  const maintDrag = ac.maintPerSqm * gla * condMult * issueMult;
  const mgmtFee = asset.gri * 0.03;
  const totalIrrecoverable = irrecoverableSC + insurance + voidRates + maintDrag + mgmtFee;
  return {
    totalSC, recoveredSC, irrecoverableSC, insurance, voidRates, maintDrag, mgmtFee,
    totalRecoverable: recoveredSC, totalIrrecoverable,
    netPropertyIncome: asset.gri - totalIrrecoverable,
  };
}

/* ===== THEME ===== */
const T = {
  bg:"#0c0e12",card:"#12151a",bdr:"#1e2228",acc:"#7a8a9a",accD:"#1a1e28",
  grn:"#5a9a6a",grnD:"#0e1a12",red:"#a04040",redD:"#1a0e0e",amb:"#6a8a9a",ambD:"#0e1618",
  txt:"#e4e8f0",txtD:"#8a92a4",txtM:"#6a7488",wht:"#f0f2f6",
  hiAcc:"#8a9aaa",
};

const GLOSS = {
  "Portfolio GAV":"Gross Asset Value","Assets":"Number of properties","Total GLA":"Gross Lettable Area (sqm)",
  "Avg Occupancy":"Weighted avg % leased","GRI p.a.":"Gross Rental Income p.a.","NOI p.a.":"Net Operating Income = GRI minus property costs minus G&A. Can go negative if portfolio is neglected.",
  "NOI Yield":"NOI as % of GAV — negative means portfolio is cash-burning","Avg WALT":"Weighted Avg Lease Term","GLA":"Gross Lettable Area",
  "Occupancy":"% leased","GAV":"Market value","Rent p.a.":"Annual rental income","Rent/sqm":"Rent per sqm",
  "WALT":"Lease years remaining","Asking":"Asking price","NIY":"Net Initial Yield",
  "Dev Cost":"Development cost","Timeline":"Quarters to complete",
  "Est. Rent/sqm":"Est. rent on completion","Est. YOC":"Est. Yield on Cost",
  "Prop Costs":"Irrecoverable property costs: void SC, insurance, rates, maintenance, mgmt fee",
  "NPI":"Net Property Income = GRI minus irrecoverable property costs",
  "Void Cost":"Rates + irrecoverable SC on vacant space — the cost of empty buildings",
};

/* ===== SAVE ===== */
let _save = null;
const saveGame = (s) => { _save = s; };
const loadGame = () => _save;
const hasSave = () => !!_save;
const delSave = () => { _save = null; };

/* ===== SMALL COMPONENTS ===== */
function Tip({ text, children }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (show && ref.current) {
      const r = ref.current.getBoundingClientRect();
      const vw = window.innerWidth || 360;
      const vh = window.innerHeight || 640;
      const tipW = 220;
      let left = r.left + r.width / 2;
      let top = r.bottom + 6;
      left = Math.max(tipW / 2 + 8, Math.min(left, vw - tipW / 2 - 8));
      if (top + 60 > vh) top = r.top - 40;
      setStyle({ position:"fixed", left, top, transform:"translateX(-50%)" });
    }
  }, [show]);
  return (
    <span ref={ref} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onTouchStart={() => setShow(s => !s)} style={{ cursor:"help",borderBottom:"1px dotted "+T.txtM,position:"relative" }}>
      {children}
      {show && <span style={{ ...style, background:"#181c24",color:T.txt,padding:"8px 12px",borderRadius:"4px",fontSize:"11px",lineHeight:1.5,maxWidth:"220px",zIndex:99999,boxShadow:"0 4px 16px rgba(0,0,0,0.7)",border:"1px solid #2a2e38",pointerEvents:"none",whiteSpace:"normal",letterSpacing:"0",textTransform:"none" }}>{text}</span>}
    </span>
  );
}

function TipLbl({ label, style: st }) {
  const g = GLOSS[label];
  if (g) return <div style={st}><Tip text={g}>{label}</Tip></div>;
  return <div style={st}>{label}</div>;
}

function Logo({ size = 28 }) {
  const s = size / 28;
  return (
    <svg viewBox="0 0 120 28" style={{ width: 120 * s, height: 28 * s, flexShrink: 0 }}>
      <defs>
        <filter id="logoGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#4ade80" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <text x="60" y="21" textAnchor="middle" fontSize="22" fontWeight="800" fontFamily="'Inter',system-ui,sans-serif" letterSpacing="0.14em" fill="#f0f2f6" filter="url(#logoGlow)">LOGISIM</text>
    </svg>
  );
}

function Spark({ data, color = "#6a7a8a", height = 40 }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const w = 200, h = height, p = 2;
  const pts = data.map((v, i) => { const x = p + (i / (data.length - 1)) * (w - p * 2); const y = h - p - ((v - mn) / rng) * (h - p * 2); return x + "," + y; });
  const last = pts[pts.length - 1].split(",");
  const hasNeg = data.some(v => v < 0);
  const gId = "g" + color.replace("#", "") + (hasNeg ? "n" : "");
  return (
    <svg viewBox={"0 0 " + w + " " + h} style={{ width:"100%",height,display:"block" }}>
      <defs><linearGradient id={gId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {hasNeg && (() => { const zeroY = h - p - ((0 - mn) / rng) * (h - p * 2); return <line x1={p} y1={zeroY} x2={w-p} y2={zeroY} stroke="#a04040" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.5" />; })()}
      <polygon points={[...pts, (p + (w - p * 2)) + "," + h, p + "," + h].join(" ")} fill={"url(#" + gId + ")"} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

function WHouse({ condition, gla, developing, assetClass, seed = 0 }) {
  const w = 120, h = 80;
  const ac = ASSET_CLASSES.find(a => a.id === assetClass) || ASSET_CLASSES[0];
  const tileCol = developing ? "#4a5a6a" : ac.tileColor || "#3a4050";
  const tileDark = developing ? "#1a2028" : ac.tileDark || "#0e1218";
  const wallCol = condition === "A" ? "#141820" : condition === "B" ? "#18160e" : "#1a1010";
  const wallBorder = condition === "A" ? "#2a2e38" : condition === "B" ? "#2a280e" : "#2a1818";
  const winOpacity = condition === "A" ? 0.4 : condition === "B" ? 0.25 : 0.1;
  const stripH = 22;
  const sr = Math.min(1, Math.max(0.5, gla / 50000));
  const bW = 56 + sr * 28, bH = 26 + sr * 10;
  const bx = (w - bW) / 2, by = h - bH - 6;
  const v = seed % 3;
  const dk = condition === "A" ? 4 : condition === "B" ? 3 : 2;
  const dW = (bW - 8) / dk;
  const stars = [0,1,2,3].map(i => ({ cx:(seed*13+i*31)%w, cy:4+(i*5)%(stripH-8) }));
  return (
    <svg viewBox={"0 0 "+w+" "+h} style={{ width:"100%",height:"100%",borderRadius:"4px" }}>
      <rect width={w} height={h} fill="#0a0c10" />
      <rect width={w} height={stripH} fill={tileCol} opacity="0.6" />
      {stars.map((s,i) => <circle key={i} cx={s.cx} cy={s.cy} r="0.8" fill="#fff" opacity="0.08" />)}
      {developing ? (
        <>
          <line x1={bx+4} y1={stripH+2} x2={bx+4} y2={h-5} stroke="#a08040" strokeWidth="1.2" opacity="0.7" />
          <line x1={bx+bW-4} y1={stripH+2} x2={bx+bW-4} y2={h-5} stroke="#a08040" strokeWidth="1.2" opacity="0.7" />
          <line x1={bx} y1={stripH+8} x2={bx+bW} y2={stripH+8} stroke="#a08040" strokeWidth="0.8" opacity="0.5" />
          <line x1={bx} y1={stripH+16} x2={bx+bW} y2={stripH+16} stroke="#a08040" strokeWidth="0.8" opacity="0.5" />
          <rect x={bx} y={by+bH*0.5} width={bW} height={bH*0.5} fill={tileDark} stroke={tileCol} strokeWidth="0.6" strokeDasharray="3,2" opacity="0.5" />
          <text x={w/2} y={h-10} textAnchor="middle" fontSize="7" fill="#a08040" fontFamily="Inter,sans-serif" fontWeight="700">UNDER CONSTRUCTION</text>
        </>
      ) : (
        <>
          <rect x={bx} y={by} width={bW} height={bH} fill={wallCol} stroke={wallBorder} strokeWidth="0.6" rx="1" />
          {v===0 && <polygon points={`${bx},${by} ${bx+bW/2},${by-8} ${bx+bW},${by}`} fill={tileCol} opacity="0.6" />}
          {v===1 && <rect x={bx} y={by-4} width={bW} height="4" fill={tileCol} opacity="0.6" />}
          {v===2 && (<><rect x={bx} y={by-3} width={bW} height="3" fill={tileCol} opacity="0.6" /><rect x={bx+bW*0.2} y={by-7} width={bW*0.6} height="4" fill={tileCol} opacity="0.5" /></>)}
          {Array.from({length:dk}).map((_,i) => <rect key={i} x={bx+4+i*dW} y={by+bH-11} width={dW-3} height="11" fill={tileCol} opacity="0.5" rx="1" />)}
          {condition!=="C" && Array.from({length:Math.max(1,Math.floor(bW/18))}).map((_,i) => <rect key={i} x={bx+6+i*18} y={by+5} width={7} height={4} fill={tileCol} opacity={winOpacity} rx="0.8" />)}
          {condition==="A" && <circle cx={bx+bW-5} cy={by+5} r="2.5" fill="#5a9a6a" opacity="0.7" />}
          {condition==="B" && <circle cx={bx+bW-5} cy={by+5} r="2.5" fill="#a08840" opacity="0.7" />}
          {condition==="C" && (<><line x1={bx+bW-8} y1={by+3} x2={bx+bW-5} y2={by+9} stroke="#a04040" strokeWidth="0.8" opacity="0.6" /><line x1={bx+bW-5} y1={by+3} x2={bx+bW-8} y2={by+9} stroke="#a04040" strokeWidth="0.8" opacity="0.6" /></>)}
        </>
      )}
    </svg>
  );
}

/* ===== EUROPE MAP ===== */
const MAP_CITY_POS = {
  uk:{x:95,y:115},de:{x:185,y:140},fr:{x:140,y:175},pl:{x:240,y:125},nl:{x:170,y:118},
  cz:{x:215,y:145},es:{x:105,y:225},se:{x:225,y:65},it:{x:200,y:200},be:{x:165,y:135},
  at:{x:210,y:160},dk:{x:185,y:95},tr:{x:340,y:210},ro:{x:290,y:170},hu:{x:250,y:165},
  gr:{x:280,y:220},pt:{x:80,y:225},ie:{x:75,y:115},sk:{x:245,y:150},hr:{x:230,y:180},
  bg:{x:295,y:190},fi:{x:270,y:50},no:{x:200,y:45},rs:{x:265,y:185},
};

function EuropeMap({ portfolio }) {
  const assetsByMkt = {};
  portfolio.forEach(a => { if (a.developing) return; if (!assetsByMkt[a.market]) assetsByMkt[a.market] = []; assetsByMkt[a.market].push(a); });
  const hexPts = (cx, cy, r) => { const pts = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 6; pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1)); } return pts.join(" "); };

  // Simplified but recognisable European country outlines
  const countries = [
    // Norway - long coastline
    { d:"M188,18 L183,28 L180,42 L178,58 L176,72 L180,82 L186,78 L190,68 L194,55 L198,40 L202,28 L198,18 Z", id:"no" },
    // Sweden
    { d:"M198,18 L194,30 L192,45 L190,58 L192,68 L196,78 L202,82 L210,76 L214,65 L216,52 L214,38 L210,25 L204,18 Z", id:"se" },
    // Finland
    { d:"M220,20 L216,32 L214,45 L216,58 L220,68 L228,72 L236,65 L238,52 L236,38 L232,26 L226,20 Z", id:"fi" },
    // Denmark
    { d:"M172,82 L168,86 L170,92 L175,96 L182,94 L185,88 L182,82 Z", id:"dk" },
    // UK - Great Britain shape
    { d:"M108,80 L104,86 L100,95 L96,105 L94,115 L96,122 L100,130 L106,136 L112,134 L116,126 L118,118 L120,110 L118,100 L115,92 L112,84 Z", id:"uk" },
    // Ireland
    { d:"M82,96 L78,104 L80,114 L84,120 L90,118 L92,110 L90,102 L86,96 Z", id:"ie" },
    // Netherlands
    { d:"M156,98 L152,102 L154,108 L160,110 L164,106 L162,100 Z", id:"nl" },
    // Belgium
    { d:"M150,110 L146,114 L148,120 L154,122 L160,118 L158,112 Z", id:"be" },
    // Germany
    { d:"M162,90 L156,98 L152,108 L154,120 L158,132 L164,142 L172,148 L182,146 L190,140 L194,130 L192,118 L188,106 L182,96 L174,90 Z", id:"de" },
    // Poland
    { d:"M194,94 L190,104 L190,116 L194,128 L200,138 L210,142 L222,140 L230,132 L232,120 L228,108 L222,98 L212,94 L202,92 Z", id:"pl" },
    // Czech Republic
    { d:"M182,132 L178,138 L182,144 L190,148 L198,146 L202,140 L198,134 L190,130 Z", id:"cz" },
    // Slovakia
    { d:"M202,134 L198,140 L202,146 L212,148 L220,144 L218,138 L210,134 Z", id:"sk" },
    // Austria
    { d:"M172,148 L168,154 L172,162 L182,166 L194,164 L200,158 L196,150 L186,148 Z", id:"at" },
    // Hungary
    { d:"M200,150 L196,156 L200,164 L210,168 L222,166 L226,158 L222,150 L212,148 Z", id:"hu" },
    // France
    { d:"M110,124 L106,136 L104,150 L106,168 L112,182 L122,192 L136,196 L150,190 L158,178 L160,164 L158,148 L154,134 L146,124 L130,120 Z", id:"fr" },
    // Spain
    { d:"M88,196 L84,208 L88,222 L98,234 L114,238 L130,234 L142,224 L144,212 L140,200 L130,194 L116,192 L100,194 Z", id:"es" },
    // Portugal
    { d:"M76,200 L74,212 L76,226 L82,232 L88,228 L88,214 L86,202 L80,198 Z", id:"pt" },
    // Italy - boot shape
    { d:"M168,166 L164,178 L166,192 L172,204 L178,216 L184,224 L188,218 L186,208 L184,196 L186,184 L184,174 L178,166 Z M180,226 L176,232 L180,236 L186,234 L184,228 Z", id:"it" },
    // Croatia
    { d:"M192,164 L188,170 L190,178 L196,182 L204,178 L206,172 L202,166 Z", id:"hr" },
    // Serbia
    { d:"M216,168 L212,174 L214,182 L220,188 L228,186 L230,178 L226,172 Z", id:"rs" },
    // Romania
    { d:"M232,148 L228,158 L230,170 L236,180 L248,182 L258,178 L262,168 L258,156 L250,148 L240,146 Z", id:"ro" },
    // Bulgaria
    { d:"M240,182 L236,190 L240,198 L250,202 L260,198 L262,190 L258,184 L248,182 Z", id:"bg" },
    // Greece
    { d:"M232,200 L228,210 L232,222 L240,230 L250,228 L254,218 L250,208 L244,200 Z M244,232 L240,236 L244,240 L250,238 L248,234 Z", id:"gr" },
    // Turkey (European + Anatolian)
    { d:"M262,190 L258,198 L262,208 L272,214 L290,216 L310,212 L328,208 L340,200 L338,192 L326,190 L310,192 L294,194 L278,192 L268,190 Z", id:"tr" },
    // Romania extension / Moldova area fills gap
    // Switzerland (small)
    { d:"M156,150 L152,154 L156,160 L164,160 L168,156 L164,150 Z", id:"ch" },
  ];

  const CITY_POS = {
    uk:{x:108,y:110},de:{x:174,y:120},fr:{x:130,y:160},pl:{x:212,y:118},nl:{x:158,y:104},
    cz:{x:190,y:140},es:{x:114,y:216},se:{x:204,y:50},it:{x:178,y:196},be:{x:154,y:116},
    at:{x:184,y:158},dk:{x:178,y:88},tr:{x:300,y:202},ro:{x:248,y:166},hu:{x:212,y:158},
    gr:{x:242,y:216},pt:{x:82,y:216},ie:{x:86,y:108},sk:{x:212,y:142},hr:{x:198,y:174},
    bg:{x:250,y:192},fi:{x:228,y:46},no:{x:188,y:50},rs:{x:222,y:178},
  };

  return (
    <div style={{ background:"#06080a",border:"1px solid #1a1d24",borderRadius:"4px",overflow:"hidden" }}>
      <div style={{ padding:"5px 8px 2px",fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>Portfolio Map</div>
      <svg viewBox="60 5 300 250" style={{ display:"block",width:"100%" }}>
        <rect x="60" y="5" width="300" height="250" fill="#06080a" />
        {/* Sea hint */}
        <ellipse cx="200" cy="140" rx="140" ry="110" fill="rgba(40,60,80,0.06)" />
        {countries.map(c => (
          <path key={c.id} d={c.d} fill="#111816" stroke="#1e2a22" strokeWidth="0.8" opacity="0.9" />
        ))}
        {MARKETS.map((mkt) => {
          const pos = CITY_POS[mkt.id];
          if (!pos) return null;
          const assets = assetsByMkt[mkt.id] || [];
          const hasAssets = assets.length > 0;
          const r = hasAssets ? 8 : 3.5;
          const ac = hasAssets ? "#8a9aaa" : "#2a3040";
          return (
            <g key={mkt.id}>
              {hasAssets && <circle cx={pos.x} cy={pos.y} r={r+4} fill={ac+"10"} stroke={ac+"25"} strokeWidth="0.5" />}
              <circle cx={pos.x} cy={pos.y} r={r} fill={hasAssets ? ac+"25" : "#10141a"} stroke={hasAssets ? ac : "#2a3040"} strokeWidth={hasAssets ? 1.2 : 0.5} />
              {hasAssets ? (
                <text x={pos.x} y={pos.y+3} textAnchor="middle" fontSize="7" fill="#f0f2f6" fontWeight="800" fontFamily="'Inter',sans-serif">{assets.length}</text>
              ) : (
                <circle cx={pos.x} cy={pos.y} r="1.5" fill="#3a4050" />
              )}
              <text x={pos.x} y={pos.y + r + 7} textAnchor="middle" fontSize="4.5" fill={hasAssets ? "#c0c8d4" : "#3a4050"} fontFamily="'Inter',sans-serif" fontWeight="500">{mkt.city}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ===== NEWS FEED ===== */
function NewsFeed({ items }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [items.length]);
  if (!items || !items.length) {
    return (
      <div style={{ flex:1,minWidth:0,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"4px",padding:"8px 12px",display:"flex",alignItems:"center",minHeight:"80px" }}>
        <div style={{ fontSize:"10px",color:T.txtD,lineHeight:1.7 }}>
          <div style={{ fontWeight:700,color:T.hiAcc,marginBottom:"4px" }}>Getting started</div>
          <div><b>Acquire</b> assets to build your portfolio</div>
          <div><b>Maintain</b> assets to protect occupancy</div>
          <div>Vacant space <b>costs money</b> — rates, SC, insurance</div>
          <div>Press <b>Simulate to next qtr</b> to advance time</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex:1,minWidth:0,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"4px",overflow:"hidden",maxHeight:"96px" }}>
      <div style={{ padding:"5px 10px 3px",display:"flex",alignItems:"center",gap:"5px",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <span style={{ fontSize:"9px",fontWeight:700,color:T.txtD,letterSpacing:"0.1em" }}>NEWS</span>
        <span style={{ fontSize:"8px",color:T.txtM }}>{items.length}</span>
      </div>
      <div ref={ref} style={{ overflowY:"auto",maxHeight:"70px",padding:"3px 10px" }}>
        {items.slice(-8).reverse().map((n, i) => (
          <div key={i} style={{ fontSize:"10px",color:n.color||T.txtD,lineHeight:1.6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"flex",alignItems:"center",gap:"5px" }}>
            <span style={{ width:"5px",height:"5px",borderRadius:"50%",background:n.color||T.txtD,flexShrink:0,boxShadow:"0 0 4px "+(n.color||T.txtD)+"60" }} />
            {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== TENANT NEGOTIATION MODAL ===== */
function TenantModal({ candidates, assetName, assetGla, onSelect, onClose }) {
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("list");
  const [counter, setCounter] = useState({ rent:"", term:"", rentFree:"", capContr:"" });
  const [result, setResult] = useState(null);

  const startNegotiate = (c) => {
    setSelected(c);
    setCounter({ rent:c.rentPsm.toFixed(1), term:String(c.term), rentFree:String(c.rentFreeMonths), capContr:String(c.capContribution) });
    setMode("negotiate");
  };

  const submitCounter = () => {
    const c = selected;
    const offeredRent = parseFloat(counter.rent) || c.rentPsm;
    const offeredTerm = parseInt(counter.term) || c.term;
    const offeredRF = parseInt(counter.rentFree) || 0;
    const offeredCap = parseInt(counter.capContr) || 0;
    const rentDelta = (offeredRent - c.rentPsm) / c.rentPsm;
    const termDelta = (offeredTerm - c.term) / Math.max(1, c.term);
    const rfDelta = c.rentFreeMonths > 0 ? (offeredRF - c.rentFreeMonths) / c.rentFreeMonths : (offeredRF > 0 ? 1 : 0);
    const capDelta = c.capContribution > 0 ? (offeredCap - c.capContribution) / c.capContribution : (offeredCap > 0 ? 1 : 0);
    const favorability = rentDelta * 2.0 + termDelta * 0.5 - rfDelta * 0.3 - capDelta * 0.3;
    let outcome;
    if (favorability <= c.flexOnRent * 0.5) { outcome = "accepted"; }
    else if (favorability <= c.flexOnRent * 1.5 && Math.random() < c.patience) {
      const meetRent = c.rentPsm + (offeredRent - c.rentPsm) * rBetween(0.4, 0.7);
      const meetTerm = Math.round(c.term + (offeredTerm - c.term) * rBetween(0.3, 0.6));
      const meetRF = Math.max(0, Math.round(c.rentFreeMonths + (offeredRF - c.rentFreeMonths) * rBetween(0.3, 0.6)));
      outcome = "compromise";
      setSelected({ ...c, rentPsm: meetRent, term: Math.max(1, meetTerm), rentFreeMonths: meetRF, capContribution: offeredCap > 0 ? Math.round(c.capContribution + (offeredCap - c.capContribution) * 0.5) : 0, _compromised: true });
    } else { outcome = "rejected"; }
    setResult(outcome);
    if (outcome === "accepted") { setSelected({ ...c, rentPsm: offeredRent, term: offeredTerm, rentFreeMonths: offeredRF, capContribution: offeredCap }); }
    setMode("result");
  };

  const acceptDeal = () => {
    onSelect({ name: selected.name, term: selected.term, rentPsm: selected.rentPsm, rentFreeMonths: selected.rentFreeMonths || 0, capContribution: (selected.capContribution || 0) * (assetGla || 0) });
  };

  const gla = assetGla || 10000;
  const ti = selected ? getTI(selected.name) : null;

  return (
    <div className="logi-modal" style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter', sans-serif" }}>
      <div style={{ background:"#0a0c10",border:"1px solid #1a1d24",borderRadius:"2px",padding:"0",maxWidth:"580px",width:"94%",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.9)" }}>
        <div style={{ background:"#0e1014",padding:"6px 20px",borderBottom:"1px solid #1a1d24",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontSize:"8px",color:T.txtM,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase" }}>Lease Negotiation</span>
          <span style={{ fontSize:"8px",color:T.txtM }}>{assetName}</span>
        </div>
        <div style={{ padding:"16px 20px" }}>
          {mode === "list" && (
            <>
              <div style={{ fontSize:"11px",color:T.txtD,marginBottom:"14px",lineHeight:1.5 }}>
                {candidates.length} prospective tenant{candidates.length !== 1 ? "s" : ""} have expressed interest.
              </div>
              {candidates.map((c, i) => {
                const info = getTI(c.name);
                const annualRent = c.rentPsm * gla;
                const rfCost = c.rentFreeMonths > 0 ? (annualRent / 12) * c.rentFreeMonths : 0;
                const effectiveRent = annualRent > 0 ? (annualRent * c.term - rfCost) / c.term : 0;
                return (
                  <div key={i} style={{ background:"#0e1014",border:"1px solid #1a1d24",borderRadius:"4px",padding:"12px 14px",marginBottom:"8px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px" }}>
                      <div>
                        <span style={{ fontSize:"13px",fontWeight:700,color:T.txt }}>{c.name}</span>
                        <span style={{ marginLeft:"8px",fontSize:"9px",fontWeight:700,color:credCol(info.credit),background:"rgba(0,0,0,0.4)",padding:"2px 6px",borderRadius:"2px",boxShadow:"inset 0 0 6px "+credCol(info.credit)+"40" }}>{info.credit}</span>
                      </div>
                      <span style={{ fontSize:"9px",color:T.txtM }}>{info.sector}</span>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"1px",background:"#1a1d24",borderRadius:"3px",overflow:"hidden",marginBottom:"8px" }}>
                      {[{l:"Rent /sqm",v:"\u20AC"+c.rentPsm.toFixed(1)},{l:"Term",v:c.term+"yr"},{l:"Rent Free",v:c.rentFreeMonths>0?c.rentFreeMonths+"mo":"\u2014"},{l:"Cap Contr",v:c.capContribution>0?"\u20AC"+c.capContribution+"/sqm":"\u2014"}].map((x,j)=>(
                        <div key={j} style={{ background:"#0a0c10",padding:"6px 8px",textAlign:"center" }}>
                          <div style={{ fontSize:"8px",color:T.txtM,fontWeight:600,textTransform:"uppercase",marginBottom:"2px" }}>{x.l}</div>
                          <div style={{ fontSize:"13px",fontWeight:800,color:T.txt }}>{x.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:"9px",color:T.txtM,marginBottom:"8px",padding:"0 2px" }}>
                      <span>Annual: {fmtM(annualRent)}</span>
                      <span>Effective: {fmtM(effectiveRent)}/yr</span>
                    </div>
                    <div style={{ display:"flex",gap:"6px" }}>
                      <button onClick={() => { setSelected(c); setResult(null); setMode("result"); setResult("accepted"); setSelected({ ...c }); }} style={{ flex:1,padding:"7px",background:T.grnD,color:T.grn,border:"1px solid "+T.grn,borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontWeight:700,fontFamily:"inherit" }}>Accept Terms</button>
                      <button onClick={() => startNegotiate(c)} style={{ flex:1,padding:"7px",background:T.accD,color:T.hiAcc,border:"1px solid "+T.acc,borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontWeight:700,fontFamily:"inherit" }}>Counter-Offer</button>
                    </div>
                  </div>
                );
              })}
              <button onClick={onClose} style={{ marginTop:"4px",padding:"8px 16px",background:"transparent",border:"1px solid #1a1d24",borderRadius:"3px",color:T.txtM,cursor:"pointer",fontSize:"10px",fontWeight:600,fontFamily:"inherit",width:"100%" }}>Decline All Offers</button>
            </>
          )}
          {mode === "negotiate" && selected && (
            <>
              <div style={{ marginBottom:"14px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px" }}>
                  <div>
                    <span style={{ fontSize:"14px",fontWeight:700,color:T.txt }}>{selected.name}</span>
                    <span style={{ marginLeft:"8px",fontSize:"9px",fontWeight:700,color:credCol(ti.credit),background:"rgba(0,0,0,0.4)",padding:"2px 6px",borderRadius:"2px",boxShadow:"inset 0 0 6px "+credCol(ti.credit)+"40" }}>{ti.credit}</span>
                  </div>
                  <button onClick={() => setMode("list")} style={{ padding:"3px 8px",background:"transparent",border:"1px solid #1a1d24",borderRadius:"3px",color:T.txtM,cursor:"pointer",fontSize:"9px",fontFamily:"inherit" }}>Back</button>
                </div>
                <div style={{ fontSize:"10px",color:T.txtM,lineHeight:1.5 }}>
                  {ti.sector} | Revenue {ti.revenue} | {ti.employees} employees
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"#1a1d24",borderRadius:"4px",overflow:"hidden",marginBottom:"14px" }}>
                <div style={{ background:"#0e1014",padding:"10px 12px" }}>
                  <div style={{ fontSize:"8px",color:T.txtM,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Their Offer</div>
                  <div style={{ fontSize:"10px",color:T.txtD,marginBottom:"4px" }}>Rent: <span style={{ color:T.txt,fontWeight:700 }}>{"\u20AC"}{selected.rentPsm.toFixed(1)}/sqm</span></div>
                  <div style={{ fontSize:"10px",color:T.txtD,marginBottom:"4px" }}>Term: <span style={{ color:T.txt,fontWeight:700 }}>{selected.term} years</span></div>
                  <div style={{ fontSize:"10px",color:T.txtD,marginBottom:"4px" }}>Rent free: <span style={{ color:selected.rentFreeMonths>0?"#a08840":T.txtM,fontWeight:700 }}>{selected.rentFreeMonths>0?selected.rentFreeMonths+" months":"None"}</span></div>
                  <div style={{ fontSize:"10px",color:T.txtD }}>Cap contribution: <span style={{ color:selected.capContribution>0?"#a08840":T.txtM,fontWeight:700 }}>{selected.capContribution>0?"\u20AC"+selected.capContribution+"/sqm":"None"}</span></div>
                </div>
                <div style={{ background:"#0a0e14",padding:"10px 12px" }}>
                  <div style={{ fontSize:"8px",color:T.hiAcc,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Your Counter</div>
                  {[{label:"Rent (\u20AC/sqm)",key:"rent",type:"number",step:"0.1"},{label:"Term (years)",key:"term",type:"number",step:"1"},{label:"Rent free (months)",key:"rentFree",type:"number",step:"1"},{label:"Cap contribution (\u20AC/sqm)",key:"capContr",type:"number",step:"1"}].map(f => (
                    <div key={f.key} style={{ marginBottom:"6px" }}>
                      <div style={{ fontSize:"9px",color:T.txtM,marginBottom:"2px" }}>{f.label}</div>
                      <input type={f.type} step={f.step} value={counter[f.key]} onChange={e => setCounter(p => ({...p, [f.key]: e.target.value}))} style={{ width:"100%",padding:"4px 6px",background:"#06080a",border:"1px solid #1a1d24",borderRadius:"3px",color:T.txt,fontSize:"11px",fontFamily:"inherit",boxSizing:"border-box" }} />
                    </div>
                  ))}
                </div>
              </div>
              {(() => {
                const theirAnnual = selected.rentPsm * gla;
                const theirRFCost = selected.rentFreeMonths > 0 ? (theirAnnual / 12) * selected.rentFreeMonths : 0;
                const theirEffective = selected.term > 0 ? (theirAnnual * selected.term - theirRFCost) / selected.term : 0;
                const yourRent = (parseFloat(counter.rent) || 0) * gla;
                const yourRF = parseInt(counter.rentFree) || 0;
                const yourRFCost = yourRF > 0 ? (yourRent / 12) * yourRF : 0;
                const yourTerm = parseInt(counter.term) || 1;
                const yourEffective = yourTerm > 0 ? (yourRent * yourTerm - yourRFCost) / yourTerm : 0;
                const delta = yourEffective - theirEffective;
                return (
                  <div style={{ background:"#0e1014",borderRadius:"4px",padding:"10px 12px",marginBottom:"14px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",textAlign:"center" }}>
                    <div><div style={{ fontSize:"8px",color:T.txtM,fontWeight:600,textTransform:"uppercase",marginBottom:"2px" }}>Their Effective</div><div style={{ fontSize:"12px",fontWeight:700,color:T.txt }}>{fmtM(theirEffective)}/yr</div></div>
                    <div><div style={{ fontSize:"8px",color:T.txtM,fontWeight:600,textTransform:"uppercase",marginBottom:"2px" }}>Your Counter</div><div style={{ fontSize:"12px",fontWeight:700,color:T.hiAcc }}>{fmtM(yourEffective)}/yr</div></div>
                    <div><div style={{ fontSize:"8px",color:T.txtM,fontWeight:600,textTransform:"uppercase",marginBottom:"2px" }}>Delta</div><div style={{ fontSize:"12px",fontWeight:700,color:delta>0?T.grn:delta<0?T.red:T.txtM }}>{delta>=0?"+":""}{fmtK(delta)}</div></div>
                  </div>
                );
              })()}
              <button onClick={submitCounter} style={{ width:"100%",padding:"10px",background:T.accD,color:T.txt,border:"1px solid "+T.acc,borderRadius:"3px",cursor:"pointer",fontSize:"11px",fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em",textTransform:"uppercase" }}>Submit Counter-Offer</button>
              <div style={{ textAlign:"center",marginTop:"6px",fontSize:"8px",color:T.txtM }}>The tenant may accept, reject, or propose a compromise.</div>
            </>
          )}
          {mode === "result" && selected && (
            <>
              {result === "accepted" && (
                <div style={{ textAlign:"center",padding:"12px 0 16px" }}>
                  <div style={{ fontSize:"9px",color:T.grn,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Terms Accepted</div>
                  <div style={{ fontSize:"16px",fontWeight:800,color:T.txt,marginBottom:"4px" }}>{selected.name}</div>
                  <div style={{ fontSize:"10px",color:T.txtM,marginBottom:"14px" }}>has accepted the proposed lease terms.</div>
                  <div style={{ background:"#0e1014",borderRadius:"4px",padding:"12px",textAlign:"left",marginBottom:"14px" }}>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",fontSize:"10px" }}>
                      <div><span style={{ color:T.txtM }}>Headline rent:</span> <span style={{ color:T.txt,fontWeight:700 }}>{"\u20AC"}{selected.rentPsm.toFixed(1)}/sqm</span></div>
                      <div><span style={{ color:T.txtM }}>Term:</span> <span style={{ color:T.txt,fontWeight:700 }}>{selected.term} years</span></div>
                      <div><span style={{ color:T.txtM }}>Rent free:</span> <span style={{ color:selected.rentFreeMonths>0?"#a08840":T.txtM,fontWeight:700 }}>{selected.rentFreeMonths>0?selected.rentFreeMonths+" months":"None"}</span></div>
                      <div><span style={{ color:T.txtM }}>Annual rent:</span> <span style={{ color:T.grn,fontWeight:700 }}>{fmtM(selected.rentPsm * gla)}</span></div>
                    </div>
                  </div>
                  <button onClick={acceptDeal} style={{ width:"100%",padding:"10px",background:T.grnD,color:T.grn,border:"1px solid "+T.grn,borderRadius:"3px",cursor:"pointer",fontSize:"11px",fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em",textTransform:"uppercase" }}>Execute Lease</button>
                </div>
              )}
              {result === "compromise" && (
                <div style={{ textAlign:"center",padding:"12px 0 16px" }}>
                  <div style={{ fontSize:"9px",color:"#a08840",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Compromise Proposed</div>
                  <div style={{ fontSize:"16px",fontWeight:800,color:T.txt,marginBottom:"4px" }}>{selected.name}</div>
                  <div style={{ fontSize:"10px",color:T.txtM,marginBottom:"14px" }}>has come back with revised terms. This is their final position.</div>
                  <div style={{ background:"#0e1014",borderRadius:"4px",padding:"12px",textAlign:"left",marginBottom:"14px" }}>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",fontSize:"10px" }}>
                      <div><span style={{ color:T.txtM }}>Headline rent:</span> <span style={{ color:T.txt,fontWeight:700 }}>{"\u20AC"}{selected.rentPsm.toFixed(1)}/sqm</span></div>
                      <div><span style={{ color:T.txtM }}>Term:</span> <span style={{ color:T.txt,fontWeight:700 }}>{selected.term} years</span></div>
                      <div><span style={{ color:T.txtM }}>Rent free:</span> <span style={{ color:selected.rentFreeMonths>0?"#a08840":T.txtM,fontWeight:700 }}>{selected.rentFreeMonths>0?selected.rentFreeMonths+" months":"None"}</span></div>
                      <div><span style={{ color:T.txtM }}>Annual rent:</span> <span style={{ color:T.grn,fontWeight:700 }}>{fmtM(selected.rentPsm * gla)}</span></div>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:"6px" }}>
                    <button onClick={acceptDeal} style={{ flex:1,padding:"10px",background:T.grnD,color:T.grn,border:"1px solid "+T.grn,borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontWeight:700,fontFamily:"inherit",textTransform:"uppercase" }}>Accept Compromise</button>
                    <button onClick={() => setMode("list")} style={{ flex:1,padding:"10px",background:"transparent",color:T.txtM,border:"1px solid #1a1d24",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontWeight:700,fontFamily:"inherit",textTransform:"uppercase" }}>Back to Offers</button>
                  </div>
                </div>
              )}
              {result === "rejected" && (
                <div style={{ textAlign:"center",padding:"12px 0 16px" }}>
                  <div style={{ fontSize:"9px",color:T.red,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Counter-Offer Rejected</div>
                  <div style={{ fontSize:"16px",fontWeight:800,color:T.txt,marginBottom:"4px" }}>{selected.name}</div>
                  <div style={{ fontSize:"10px",color:T.txtM,marginBottom:"14px",lineHeight:1.6 }}>has rejected your counter-offer.</div>
                  <button onClick={() => { setMode("list"); setSelected(null); setResult(null); }} style={{ width:"100%",padding:"10px",background:"transparent",color:T.txtM,border:"1px solid #1a1d24",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontWeight:700,fontFamily:"inherit",textTransform:"uppercase" }}>Back to Offers</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== WELCOME MODAL ===== */
function WelcomeModal({ companyName, cash, startMarkets, difficulty, portfolio, onClose }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const mktNames = startMarkets.map(id => MARKETS.find(m => m.id === id)).filter(Boolean);
  const seedAssets = portfolio.length;
  const seedGAV = portfolio.reduce((a, x) => a + (x.value || 0), 0);
  const seedGRI = portfolio.reduce((a, x) => a + (x.gri || 0), 0);
  const avgOcc = seedAssets > 0 ? portfolio.reduce((a, x) => a + x.occupancy, 0) / seedAssets : 0;
  const dateStr = new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" });
  return (
    <div className="logi-modal" style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter', sans-serif" }}>
      <div style={{ background:"#0a0c10",border:"1px solid #1a1d24",borderRadius:"2px",padding:"0",maxWidth:"580px",width:"94%",overflow:"hidden",boxShadow:"0 24px 64px rgba(0,0,0,0.9)" }}>
        <div style={{ background:"#0e1014",padding:"6px 28px",borderBottom:"1px solid #1a1d24",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontSize:"8px",color:T.txtM,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase" }}>Confidential — Board Use Only</span>
          <span style={{ fontSize:"8px",color:T.txtM,fontWeight:500 }}>{dateStr}</span>
        </div>
        <div style={{ padding:"32px 28px 20px",borderBottom:"1px solid #1a1d24" }}>
          <div style={{ display:"flex",alignItems:"flex-start",gap:"16px" }}>
            <Logo size={28} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"9px",color:T.txtM,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"6px" }}>Investment Committee Briefing</div>
              <div style={{ fontSize:"24px",fontWeight:800,color:T.wht,letterSpacing:"0.02em",lineHeight:1.15,marginBottom:"4px" }}>{companyName}</div>
              <div style={{ fontSize:"11px",color:T.txtD,lineHeight:1.5 }}>
                European logistics real estate platform. You have been appointed CEO with a mandate to deploy {fmtM(cash)} of committed equity across {mktNames.length} target market{mktNames.length !== 1 ? "s" : ""}.
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding:"20px 28px" }}>
          <div style={{ opacity:phase>=1?1:0, transform:phase>=1?"translateY(0)":"translateY(8px)", transition:"all 0.4s ease", marginBottom:"18px" }}>
            <div style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px",paddingBottom:"4px",borderBottom:"1px solid #1a1d24" }}>LP Return Targets</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"1px",background:"#1a1d24",borderRadius:"4px",overflow:"hidden" }}>
              {[{label:"Net IRR",value:"10\u201312%",sub:"5-year horizon"},{label:"Portfolio GAV",value:"\u20AC500m+",sub:"Institutional scale"},{label:"Occupancy",value:">90%",sub:"Weighted by GLA"},{label:"NOI Yield",value:">5.0%",sub:"On portfolio GAV"}].map((t, i) => (
                <div key={i} style={{ background:"#0e1014",padding:"12px 10px",textAlign:"center" }}>
                  <div style={{ fontSize:"8px",color:T.txtM,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"5px" }}>{t.label}</div>
                  <div style={{ fontSize:"18px",fontWeight:800,color:T.txt,lineHeight:1 }}>{t.value}</div>
                  <div style={{ fontSize:"8px",color:T.txtM,marginTop:"4px" }}>{t.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ opacity:phase>=2?1:0, transform:phase>=2?"translateY(0)":"translateY(8px)", transition:"all 0.4s ease", marginBottom:"18px" }}>
            <div style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px",paddingBottom:"4px",borderBottom:"1px solid #1a1d24" }}>Opening Position</div>
            <div style={{ background:"#0e1014",borderRadius:"4px",padding:"14px 16px" }}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}><tbody>
                {[["Committed Equity",fmtM(cash)],["Target Markets",mktNames.map(m => m.name).join(", ")],...(seedAssets > 0 ? [["Seed Assets",seedAssets+" properties"],["Opening GAV",fmtM(seedGAV)],["Gross Rental Income",fmtM(seedGRI)+" p.a."],["Avg Occupancy",fmtP(avgOcc)]] : [["Strategy","Blank slate — no seed portfolio"]])].map(([l, v], i) => (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}><td style={{ padding:"5px 0",fontSize:"10px",color:T.txtM,fontWeight:500 }}>{l}</td><td style={{ padding:"5px 0",fontSize:"10px",color:T.txt,fontWeight:700,textAlign:"right" }}>{v}</td></tr>
                ))}
              </tbody></table>
            </div>
          </div>
          <div style={{ opacity:phase>=3?1:0, transform:phase>=3?"translateY(0)":"translateY(8px)", transition:"all 0.4s ease", marginBottom:"22px" }}>
            <div style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px",paddingBottom:"4px",borderBottom:"1px solid #1a1d24" }}>Key Risk Factors</div>
            <div style={{ background:"#0e1014",borderRadius:"4px",padding:"14px 16px",borderLeft:"3px solid #6a5020" }}>
              {[["Void cost exposure","Empty space incurs rates, insurance, and irrecoverable service charge."],["Condition deterioration","Assets not maintained will degrade, increasing costs by up to 1.5x."],["Negative NOI risk","If costs exceed rental income, the platform burns cash every quarter."],["Quarterly board review","Persistent underperformance will result in a strategic review."]].map(([title, desc], i) => (
                <div key={i} style={{ marginBottom:i < 3 ? "10px" : 0 }}>
                  <div style={{ fontSize:"10px",color:T.txt,fontWeight:700,marginBottom:"2px" }}>{title}</div>
                  <div style={{ fontSize:"9px",color:T.txtM,lineHeight:1.55 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ width:"100%",padding:"13px",background:T.accD,color:T.txt,border:"1px solid "+T.acc,borderRadius:"4px",cursor:"pointer",fontSize:"12px",fontWeight:700,fontFamily:"inherit",letterSpacing:"0.06em",textTransform:"uppercase",opacity:phase>=3?1:0.3,transition:"all 0.4s ease" }}>
            Acknowledge & Proceed
          </button>
          <div style={{ textAlign:"center",marginTop:"8px",fontSize:"8px",color:T.txtM,letterSpacing:"0.06em" }}>By proceeding you accept the terms of the Investment Committee mandate.</div>
        </div>
      </div>
    </div>
  );
}

/* ===== GAME ENGINE ===== */
let aCtr = 0, usedN = new Set();

function genAsset(mkt, acId, opts) {
  const { isSeed = false } = opts || {};
  aCtr++;
  const ac = ASSET_CLASSES.find(a => a.id === acId) || ASSET_CLASSES[0];
  let name; do { name = rFrom(ASSET_NAMES); } while (usedN.has(mkt.id + name) && usedN.size < 800);
  usedN.add(mkt.id + name);
  const gla = ac.id === "lastmile" ? Math.round(rBetween(5,25))*1000 : ac.id === "datactr" ? Math.round(rBetween(8,30))*1000 : Math.round(rBetween(15,80))*1000;
  const rentPsm = mkt.baseRent * ac.rentMult * rBetween(0.85, 1.2);
  const occ = Math.min(1, Math.max(0, mkt.demand * ac.demandMult * rBetween(0.7, 1.1)));
  const tenant = occ > 0.5 ? rFrom(TENANT_POOL[ac.id] || TENANT_POOL.bigbox) : null;
  const walt = isSeed ? (occ > 0.5 ? rFrom([0.25, 0.5, 0.75, 1.0]) : 0) : (occ > 0.5 ? Math.round(rBetween(1, 12)) : 0);
  const gri = gla * rentPsm * occ;
  const val = gri / (mkt.capRate * ac.capRateMult / 100);
  const age = Math.round(rBetween(2, 25));
  const cond = age < 5 ? "A" : age < 12 ? "B" : "C";
  const epc = cond === "A" ? rFrom(["A","B"]) : cond === "B" ? rFrom(["B","C"]) : rFrom(["C","D","E"]);
  return { id:"a"+aCtr, name, market:mkt.id, marketName:mkt.name, flag:"", assetClass:ac.id, assetClassName:ac.name, assetClassIcon:"", gla, rentPsm, occupancy:occ, tenant, leaseRemaining:walt, gri, value:val, age, condition:cond, epcRating:epc, capexSpent:0, acquired:true, developing:false, devQuartersLeft:0, visualSeed:aCtr, urgentIssue:null, lastRM:0, histOcc:[occ], histRent:[rentPsm], histVal:[val] };
}

function genMktAsset(mkt, tx) {
  const a = genAsset(mkt, rFrom(ASSET_CLASSES).id);
  a.acquired = false;
  a.askPrice = a.value * rBetween(0.92 - Math.min(0.12, (tx||0)*0.02), 1.18 - Math.min(0.12, (tx||0)*0.02));
  return a;
}

function genDev(mkt) {
  const ac = rFrom(ASSET_CLASSES); aCtr++;
  let name; do { name = rFrom(ASSET_NAMES); } while (usedN.has("d"+mkt.id+name));
  usedN.add("d"+mkt.id+name);
  const gla = ac.id === "lastmile" ? Math.round(rBetween(5,20))*1000 : Math.round(rBetween(20,70))*1000;
  return { id:"d"+aCtr, name:name+" (Dev)", market:mkt.id, marketName:mkt.name, flag:"", assetClass:ac.id, assetClassName:ac.name, assetClassIcon:"", gla, devCost:gla*rBetween(400,800)*ac.rentMult, estRentPsm:mkt.baseRent*ac.rentMult*rBetween(1.0,1.3), estYield:mkt.capRate*ac.capRateMult*rBetween(1.05,1.25), quartersToComplete:Math.round(rBetween(3,8)) };
}

const GREEN_TENANT_BOOST = {
  bigbox:["Amazon","Kuehne+Nagel","DSV Panalpina","Lidl Distribution"],
  lastmile:["Amazon Logistics","UPS Express","DHL Express"],
  fulfilment:["Amazon","Zalando","Zara Logistics","Decathlon"],
  datactr:["AWS","Microsoft Azure","Google Cloud","Equinix"],
  coldstor:["Lineage Logistics","Americold","Tesco Distribution"],
  multilet:["Regional Distributors"],
  crossdock:["DHL Express","UPS","FedEx"],
};

function genTenantCandidates(acId, rentPsm, epcRating, esgCount, marketNER) {
  const pool = [...(TENANT_POOL[acId] || TENANT_POOL.bigbox)];
  const isGreen = (esgCount || 0) > 0 && (epcRating === "A" || epcRating === "B");
  if (isGreen) { const prems = GREEN_TENANT_BOOST[acId] || GREEN_TENANT_BOOST.bigbox; const pick = [...prems].sort(() => Math.random()-0.5).slice(0, 2); pick.forEach(t => { if (!pool.includes(t)) pool.unshift(t); }); }
  const count = 2 + Math.floor(Math.random() * 2);
  const candidates = pool.sort(() => Math.random()-0.5).slice(0, count);
  const baseRef = marketNER || rentPsm;
  return candidates.map(name => {
    const ti = getTI(name);
    const creditMult = ti.insolvencyRisk < 0.03 ? 0.95 : ti.insolvencyRisk < 0.08 ? 1.0 : 1.06;
    const offerRent = baseRef * creditMult * rBetween(isGreen ? 0.96 : 0.88, isGreen ? 1.12 : 1.06);
    const termYrs = Math.round(rBetween(isGreen ? 5 : 3, isGreen ? 12 : 10));
    const wantsRentFree = Math.random() < (ti.insolvencyRisk > 0.08 ? 0.6 : 0.25);
    const wantsCapContr = Math.random() < (ti.insolvencyRisk > 0.08 ? 0.15 : 0.35);
    return { name, term: termYrs, rentPsm: offerRent, rentFreeMonths: wantsRentFree ? Math.round(rBetween(2, 6)) : 0, capContribution: wantsCapContr ? Math.round(rBetween(8, 25)) : 0, breakOption: termYrs > 5 && Math.random() < 0.4 ? Math.round(termYrs * rBetween(0.4, 0.6)) : 0, flexOnRent: rBetween(0.03, 0.10), flexOnTerm: Math.round(rBetween(0, 2)), maxRentFreeAccept: Math.round(rBetween(3, 9)), patience: rBetween(0.3, 0.9) };
  });
}

function initMarketData() {
  const data = {};
  MARKETS.forEach(m => { const ner = m.baseRent * rBetween(0.92, 1.12); data[m.id] = { ner, nerPrev:ner, primeYield:m.capRate+rBetween(-0.2,0.2), marketVacancy:rBetween(0.04,0.12), demandIndex:Math.round(m.demand*75+rBetween(0,20)), rentalGrowthQoQ:0, absorptionKsqm:Math.round(rBetween(30,250)), supplyPipelineKsqm:Math.round(rBetween(50,400)) }; });
  return data;
}

function updateMarketData(data, quarter, newsOut) {
  const updated = {};
  MARKETS.forEach(m => {
    const prev = data[m.id] || {};
    const nerShock = rBetween(-0.03, 0.04);
    const ner = Math.max(m.baseRent * 0.6, (prev.ner || m.baseRent) * (1 + nerShock));
    const growth = prev.ner > 0 ? (ner - prev.ner) / prev.ner : 0;
    const yShock = rBetween(-0.08, 0.08);
    const primeYield = Math.max(2.5, Math.min(9, (prev.primeYield || m.capRate) + yShock));
    const vac = Math.max(0.01, Math.min(0.30, (prev.marketVacancy || 0.07) + rBetween(-0.008, 0.008)));
    const dem = Math.max(0, Math.min(100, (prev.demandIndex || 60) + Math.round(rBetween(-4, 4))));
    const absorption = Math.max(10, Math.round((prev.absorptionKsqm || 100) * rBetween(0.85, 1.18)));
    const supply = Math.max(20, Math.round((prev.supplyPipelineKsqm || 200) * rBetween(0.90, 1.12)));
    if (Math.abs(growth) > 0.025) { const dir = growth > 0 ? "UP" : "DOWN"; newsOut.push({ text:m.name+" rents "+dir.toLowerCase()+" "+(Math.abs(growth)*100).toFixed(1)+"% to \u20AC"+ner.toFixed(0)+"/sqm", color:growth>0?"#5aaa6a":"#c05050" }); }
    if (Math.abs(yShock) > 0.05) { newsOut.push({ text:m.name+" prime yield "+(yShock>0?"expanded":"compressed")+" to "+primeYield.toFixed(2)+"%", color:yShock>0?"#c07030":"#5aaa6a" }); }
    updated[m.id] = { ner, nerPrev:prev.ner||ner, primeYield, marketVacancy:vac, demandIndex:dem, rentalGrowthQoQ:growth, absorptionKsqm:absorption, supplyPipelineKsqm:supply };
  });
  return updated;
}

function calcBoardScore(m, state) {
  let score = 0;
  const irr = calcIRR(state.initialCash||state.cash, m.totalGAV, state.cash, state.quarter);
  if (irr !== null) score += Math.min(28, Math.max(-10, (irr / 0.12) * 28)); else score += 10;
  score += Math.min(24, m.avgOcc * 24);
  if (m.noiYield < 0) score += Math.max(-20, m.noiYield / 0.02 * 10);
  else score += Math.min(20, (m.noiYield / 0.05) * 20);
  const esg = calcESG(state.portfolio||[]);
  score += Math.min(14, (esg / 100) * 14);
  score += Math.min(8, (m.totalGAV / 500e6) * 8);
  const totalDebt = (state.debtDrawdowns||[]).reduce((a, d) => a + d.amount, 0);
  const ltv = m.totalGAV > 0 ? totalDebt / m.totalGAV : 0;
  if (ltv > 0.7) score -= 10; else if (ltv > 0.55) score -= 4;
  if (m.noi < 0) score -= 15;
  return Math.round(Math.min(100, Math.max(0, score)));
}

function genMegaAcquisition(mkt, tx) {
  const def = rFrom(MEGA_ASSET_DEFS);
  const ac = ASSET_CLASSES.find(a => a.id === def.assetClass) || ASSET_CLASSES[0];
  aCtr++;
  const gla = Math.round(rBetween(def.glaRange[0], def.glaRange[1]));
  const rentPsm = mkt.baseRent * ac.rentMult * def.rentMultBonus * rBetween(0.9, 1.1);
  const occ = rBetween(0.8, 0.98);
  const tenant = rFrom(TENANT_POOL[ac.id] || TENANT_POOL.bigbox);
  const gri = gla * rentPsm * occ;
  const capRate = mkt.capRate * ac.capRateMult;
  const val = gri / (capRate / 100);
  const askPrice = val * rBetween(0.95 - Math.min(0.08, (tx||0)*0.015), 1.12);
  return { id:"mg"+aCtr, name:def.name, market:mkt.id, marketName:mkt.name, flag:"", assetClass:ac.id, assetClassName:ac.name, assetClassIcon:"", gla, rentPsm, occupancy:occ, tenant, leaseRemaining:Math.round(rBetween(5,15)), gri, value:val, age:Math.round(rBetween(2,10)), condition:"A", epcRating:"A", capexSpent:0, acquired:false, askPrice, developing:false, isMega:true, visualSeed:aCtr, urgentIssue:null, lastRM:0, megaDesc:def.desc };
}

function initGame(cfg = {}) {
  const { companyName="NewCo", cash=150e6, startMarkets:sm=["uk","de","pl"], difficulty="guided" } = cfg;
  usedN = new Set(); aCtr = 0;
  const portfolio = [];
  if (difficulty === "guided") { const cls = ["bigbox","fulfilment","lastmile"]; sm.forEach((mId, i) => { const m = MARKETS.find(x => x.id === mId); if (m) portfolio.push(genAsset(m, cls[i % cls.length], { isSeed: true })); }); }
  const team = { transactions:1, assetMgmt:1, portfolioMgmt:1, bi:0, treasury:0, esg:0 };
  const acqM = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 16);
  const devM = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 8);
  const megaMkts = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 3);
  const megaAcq = megaMkts.map(m => genMegaAcquisition(m, 1));
  const marketData = initMarketData();
  return { companyName, quarter:1, year:2026, cash, portfolio, team, acquisitions:[...acqM.map(m => genMktAsset(m, 1)), ...megaAcq], devSites:devM.map(m => genDev(m)), history:[], events:[], newsLog:[], initialCash:cash, tenantSelection:null, marketData, debtDrawdowns:[], _startMarkets:sm, _difficulty:difficulty };
}

function getQL(q, y) { return "Q" + (((q-1)%4)+1) + " " + (y + Math.floor((q-1)/4)); }
function teamQCost(t) { return TEAM_ROLES.reduce((acc, r) => acc + (t[r.id]||0)*r.salaryCost/4, 0); }

function calcMetrics(st) {
  const { portfolio, team } = st;
  if (!portfolio.length) return { totalGAV:0, totalGRI:0, avgOcc:0, avgWALT:0, noi:0, noiYield:0, assetCount:0, totalGLA:0, totalPropCosts:0, totalNPI:0, totalVoidCost:0, totalInsurance:0, totalMaintDrag:0, totalMgmtFee:0, totalOtherIncome:0, scRecoveryIncome:0, sundryIncome:0, grossRevenue:0, gaExp:0, depreciation:0, ebitda:0, debtInterest:0, ebt:0, tax:0, netIncome:0, totalRecoveredSC:0 };
  const op = portfolio.filter(a => !a.developing);
  const totalGAV = portfolio.reduce((acc, a) => acc + (a.developing ? a.devCostSoFar||0 : a.value), 0);
  const totalGRI = op.reduce((acc, a) => acc + a.gri, 0);
  const totalGLA = portfolio.reduce((acc, a) => acc + a.gla, 0);
  const glaOp = op.reduce((acc, a) => acc + a.gla, 0);
  const avgOcc = glaOp > 0 ? op.reduce((acc, a) => acc + a.occupancy * a.gla, 0) / glaOp : 0;
  const griWalt = op.reduce((acc, a) => acc + (a.leaseRemaining > 0 ? a.gri : 0), 0);
  const avgWALT = griWalt > 0 ? op.reduce((acc, a) => acc + a.leaseRemaining * a.gri, 0) / griWalt : 0;
  let totalPropCosts = 0, totalNPI = 0, totalVoidCost = 0, totalInsurance = 0, totalMaintDrag = 0, totalMgmtFee = 0, totalRecoveredSC = 0;
  op.forEach(a => { const costs = calcAssetCosts(a); totalPropCosts += costs.totalIrrecoverable; totalNPI += costs.netPropertyIncome; totalVoidCost += costs.voidRates + costs.irrecoverableSC; totalInsurance += costs.insurance; totalMaintDrag += costs.maintDrag; totalMgmtFee += costs.mgmtFee; totalRecoveredSC += costs.recoveredSC; });
  const scRecoveryIncome = totalRecoveredSC;
  const sundryIncome = totalGRI * 0.008;
  const totalOtherIncome = scRecoveryIncome + sundryIncome;
  const grossRevenue = totalGRI + totalOtherIncome;
  const gaExp = teamQCost(team||{}) * 4;
  const buildingValue = totalGAV * 0.60;
  const depreciation = buildingValue * 0.02;
  const noi = totalNPI - gaExp;
  const ebitdaCalc = grossRevenue - totalPropCosts - gaExp;
  const debtInt = (st.debtDrawdowns||[]).reduce((acc, d) => acc + d.amount * d.rate / 100, 0);
  const ebt = ebitdaCalc - depreciation - debtInt;
  const tax = ebt > 0 ? ebt * 0.20 : 0;
  const netIncome = ebt - tax;
  const noiYield = totalGAV > 0 ? noi / totalGAV : 0;
  return { totalGAV, totalGRI, avgOcc, avgWALT, noi, noiYield, assetCount:portfolio.length, totalGLA, totalPropCosts, totalNPI, totalVoidCost, totalInsurance, totalMaintDrag, totalMgmtFee, totalOtherIncome, scRecoveryIncome, sundryIncome, grossRevenue, gaExp, depreciation, ebitda:ebitdaCalc, debtInterest:debtInt, ebt, tax, netIncome, totalRecoveredSC };
}

function calcESG(portfolio) { const op = portfolio.filter(a => !a.developing); if (!op.length) return 0; const sc = { A:100, B:75, C:50, D:25, E:10 }; return op.reduce((acc, a) => acc + (sc[a.epcRating]||30), 0) / op.length; }
function calcIRR(init, gav, cash, q) { if (q < 4) return null; const yrs = q / 4; const mult = (gav + cash) / init; if (mult <= 0) return 0; return Math.pow(mult, 1/yrs) - 1; }

function advanceQ(state) {
  let { quarter, year, cash, portfolio, acquisitions, devSites, history, team, newsLog, marketData, debtDrawdowns } = state;
  const ev = [], news = [];
  quarter++;
  const ql = getQL(quarter, year);
  const tc = teamQCost(team);
  cash -= tc;
  if (tc > 0) ev.push(ql + ": Team salaries (" + fmtK(tc) + ")");
  const debtInt = (debtDrawdowns||[]).reduce((acc, d) => acc + d.amount * d.rate / 4 / 100, 0);
  if (debtInt > 0) { cash -= debtInt; ev.push(ql + ": Debt interest (" + fmtK(debtInt) + ")"); }
  const op = portfolio.filter(a => !a.developing);
  let qRent = 0, qPropCosts = 0, qVoidCost = 0;
  op.forEach(a => { const ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0]; const costs = calcAssetCosts(a, ac); qRent += a.gri / 4; qPropCosts += costs.totalIrrecoverable / 4; qVoidCost += (costs.voidRates + costs.irrecoverableSC) / 4; });
  const qNetPropIncome = qRent - qPropCosts;
  cash += qNetPropIncome;
  ev.push(ql + ": Rent " + fmtK(qRent) + ", prop costs " + fmtK(qPropCosts) + ", net " + fmtK(qNetPropIncome));
      if (qVoidCost > 50000) news.push({ text:"Void costs: "+fmtK(qVoidCost)+" this quarter", color:"#c06040" });
  if (qNetPropIncome < 0) news.push({ text:"NET PROPERTY INCOME NEGATIVE: "+fmtK(qNetPropIncome), color:"#d04040" });
  const am = Math.min(5, team.assetMgmt||0);
  const tx = Math.min(5, team.transactions||0);
  const opAssetsCount = portfolio.filter(a => !a.developing).length;
  const amRatio = am > 0 ? opAssetsCount / am : (opAssetsCount > 0 ? 99 : 0);
  const amStrained = amRatio > 4;
  const amPenalty = amStrained ? Math.min(0.25, (amRatio - 4) * 0.04) : 0;
  const amIssueMult = amStrained ? Math.min(3.0, 1 + (amRatio - 4) * 0.25) : 1.0;
  if (amStrained) news.push({ text:"Asset Mgmt overstretched ("+amRatio.toFixed(1)+" assets/AM)", color:"#c0903a" });
  let pendTS = null;

  portfolio.forEach(a => {
    if (a.developing) {
      a.devQuartersLeft--;
      a.devCostSoFar = (a.devCostSoFar||0) + (a.totalDevCost||0)/(a.totalDevQuarters||4);
      if (a.devQuartersLeft <= 0) {
        a.developing = false; a.occupancy = 0; a.condition = "A"; a.age = 0; a.epcRating = "A";
        const m = MARKETS.find(x => x.id === a.market);
        const ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0];
        a.gri = 0; a.value = a.gla * a.rentPsm / ((m?.capRate||5) * (ac?.capRateMult||1) / 100);
        ev.push(a.name + " completed!");
        news.push({ text:a.name + " completed — now costing void rates until leased", color:"#c0903a" });
      }
      return;
    }
    const mkt = MARKETS.find(m => m.id === a.market);
    const ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0];
    if (a.tenant && a.leaseRemaining > 0) { const ti = getTI(a.tenant); if (Math.random() < ti.insolvencyRisk * 0.15) { ev.push(a.name+": "+a.tenant+" INSOLVENT"); news.push({ text:a.tenant+" insolvent at "+a.name, color:"#d04040" }); a.occupancy = Math.max(0, a.occupancy - rBetween(0.4, 0.7)); a.tenant = null; a.leaseRemaining = 0; } }
    if (!a.urgentIssue && Math.random() < (0.06 + ac.riskFactor * 0.3) * amIssueMult) { a.urgentIssue = { ...rFrom(ISSUES) }; ev.push(a.name+": "+a.urgentIssue.name); news.push({ text:a.name+": "+a.urgentIssue.name, color:"#c05050" }); }
    if (a.urgentIssue) a.occupancy = Math.max(0, a.occupancy - a.urgentIssue.severity * 0.3);
    const dr = 0.08 - am * 0.008 + amPenalty;
    a.occupancy = Math.min(1, Math.max(0, a.occupancy + rBetween(-dr, dr + am*0.005)));
    const mktD = (marketData||{})[a.market] || {};
    const marketNER = mktD.ner || a.rentPsm;
    if (a.leaseRemaining > 0) {
      a.leaseRemaining -= 0.25;
      if (a.leaseRemaining <= 0) {
        if (Math.random() < 0.45 + am * 0.05) {
          a.leaseRemaining = Math.round(rBetween(3,7));
          const reversion = marketNER * rBetween(0.97, 1.08);
          a.rentPsm = Math.max(a.rentPsm * 0.96, Math.min(reversion, a.rentPsm * 1.12));
          ev.push(a.name+": "+a.tenant+" renewed");
          news.push({ text:a.tenant+" renewed at "+a.name, color:"#5aaa6a" });
        } else {
          a.occupancy = Math.max(0, a.occupancy - rBetween(0.2, 0.5));
          ev.push(a.name+": "+a.tenant+" vacated");
          news.push({ text:a.tenant+" vacated "+a.name, color:"#c0903a" });
          a.tenant = null;
        }
      }
    } else if (a.occupancy < 0.7 && Math.random() < 0.25 + am * 0.05 + (quarter <= 4 ? 0.15 : 0)) {
      const ds = (mkt?.demand||0.5) * (ac?.demandMult||1);
      if ((ds > 0.85 || quarter <= 4) && !pendTS) {
        pendTS = { assetId:a.id, assetName:a.name, assetGla:a.gla, candidates:genTenantCandidates(a.assetClass, a.rentPsm, a.epcRating, team.esg||0, marketNER) };
        news.push({ text:"Tenant offers for " + a.name, color:"#6a9ac0" });
      } else {
        a.occupancy = Math.min(1, a.occupancy + rBetween(0.15, 0.4));
        a.tenant = rFrom(TENANT_POOL[a.assetClass]||TENANT_POOL.bigbox);
        a.leaseRemaining = Math.round(rBetween(3,7));
        ev.push(a.name+": Lease with "+a.tenant);
        news.push({ text:a.tenant+" signed at "+a.name, color:"#5aaa6a" });
      }
    }
    const rmGap = quarter - (a.lastRM||0);
    if (rmGap > 4 && Math.random() < 0.08 && a.condition !== "C") { a.condition = a.condition === "A" ? "B" : "C"; a.rentPsm *= 0.95; ev.push(a.name+": Degraded to "+a.condition); news.push({ text:a.name+" degraded to Grade "+a.condition, color:"#c07030" }); }
    const marketYield = mktD.primeYield || (mkt?.capRate||5);
    const ecr = marketYield * (ac?.capRateMult||1);
    a.gri = a.gla * a.rentPsm * a.occupancy;
    a.value = a.gri > 0 ? a.gri / (ecr/100) : a.gla * (mkt?.baseRent||5) * 0.3 / (ecr/100);
    if (!a.histOcc) a.histOcc = [];
    if (!a.histRent) a.histRent = [];
    if (!a.histVal) a.histVal = [];
    a.histOcc.push(a.occupancy);
    a.histRent.push(a.rentPsm);
    a.histVal.push(a.value);
    if (a.histOcc.length > 20) { a.histOcc.shift(); a.histRent.shift(); a.histVal.shift(); }
  });

  const updatedMarketData = updateMarketData(marketData||{}, quarter, news);
  const nAcq = Math.min(18, 8 + tx + Math.floor(Math.random()*4));
  acquisitions = [...MARKETS].sort(() => Math.random()-0.5).slice(0, nAcq).map(m => genMktAsset(m, tx));
  if (quarter % 2 === 0 || Math.random() < 0.5) { const megaMkts = [...MARKETS].sort(() => Math.random()-0.5).slice(0, Math.random() < 0.4 ? 2 : 3); megaMkts.forEach(m => acquisitions.push(genMegaAcquisition(m, tx))); }
  devSites = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 5+Math.floor(Math.random()*5)).map(m => genDev(m));
  const postMetrics = calcMetrics({ portfolio, team });
  if (postMetrics.noi < 0) news.push({ text:"NOI IS NEGATIVE: "+fmtM(postMetrics.noi)+" p.a.", color:"#c04040" });
  if (!news.length) news.push({ text:"Board reviewed quarterly pack", color:T.txtD });
  const metrics = calcMetrics({ portfolio, team });
  history.push({ quarter, ...metrics, cash });
  return { ...state, quarter, cash, portfolio:[...portfolio], acquisitions, devSites, history, events:ev, newsLog:[...(newsLog||[]),...news], tenantSelection:pendTS, marketData:updatedMarketData, debtDrawdowns:debtDrawdowns||[] };
}

/* ===== SENTIMENT ===== */
function genSentiment(met, hist, state) {
  const sArr = [], bc = [];
  const prev = hist.length >= 2 ? hist[hist.length-2] : null;
  const quarter = state?.quarter || 1;
  const yearEnd = quarter > 1 && ((quarter-1)%4 === 0);
  sArr.push(met.totalGAV > 5e8 ? { metric:"GAV",mood:"positive",label:"Strong",comment:"Institutional-grade scale." } : met.totalGAV > 2e8 ? { metric:"GAV",mood:"neutral",label:"Growing",comment:"Need faster deployment." } : { metric:"GAV",mood:"negative",label:"Thin",comment:"Under-scaled. Accelerate acquisitions." });
  sArr.push(met.avgOcc > 0.9 ? { metric:"Occupancy",mood:"positive",label:"Excellent",comment:"Best-in-class. Push rents on reversions." } : met.avgOcc > 0.75 ? { metric:"Occupancy",mood:"neutral",label:"Acceptable",comment:"Vacancy costing "+fmtM(met.totalVoidCost)+" p.a." } : { metric:"Occupancy",mood:"negative",label:"Concerning",comment:"Void costs at "+fmtM(met.totalVoidCost)+" p.a." });
  if (met.noi < 0) sArr.push({ metric:"NOI",mood:"negative",label:"NEGATIVE",comment:"Portfolio cash-negative at "+fmtM(met.noi)+" p.a." });
  else if (met.noiYield > 0.05) sArr.push({ metric:"NOI Yield",mood:"positive",label:"Outperforming",comment:"Ahead of 5% at "+fmtP(met.noiYield)+"." });
  else if (met.noiYield > 0.035) sArr.push({ metric:"NOI Yield",mood:"neutral",label:"In-line",comment:"NOI yield "+fmtP(met.noiYield)+"." });
  else sArr.push({ metric:"NOI Yield",mood:"negative",label:"Below Target",comment:"NOI yield only "+fmtP(met.noiYield)+"." });
  const esg = calcESG(state?.portfolio || []);
  sArr.push(esg > 80 ? { metric:"ESG / EPC",mood:"positive",label:"Leader",comment:"Score "+esg.toFixed(0)+"/100." } : esg > 50 ? { metric:"ESG / EPC",mood:"neutral",label:"Compliant",comment:"Score "+esg.toFixed(0)+"/100." } : { metric:"ESG / EPC",mood:"negative",label:"At Risk",comment:"Score "+esg.toFixed(0)+"/100." });
  const gaExp = TEAM_ROLES.reduce((acc, r) => acc + ((state?.team||{})[r.id]||0)*r.salaryCost, 0);
  const gaR = met.totalGRI > 0 ? gaExp / met.totalGRI : 0;
  sArr.push(gaR < 0.05 ? { metric:"G&A",mood:"positive",label:"Lean",comment:"G&A at "+fmtP(gaR)+" of GRI." } : gaR < 0.12 ? { metric:"G&A",mood:"neutral",label:"Manageable",comment:"G&A at "+fmtP(gaR)+" of GRI." } : { metric:"G&A",mood:"negative",label:"Elevated",comment:"G&A at "+fmtP(gaR)+" of GRI." });
  sArr.push(met.avgWALT > 5 ? { metric:"Lease Duration",mood:"positive",label:"Secure",comment:"WALT "+met.avgWALT.toFixed(1)+"yr." } : met.avgWALT > 2.5 ? { metric:"Lease Duration",mood:"neutral",label:"Adequate",comment:"WALT "+met.avgWALT.toFixed(1)+"yr." } : { metric:"Lease Duration",mood:"negative",label:"Short",comment:"WALT "+met.avgWALT.toFixed(1)+"yr." });
  if (prev) {
    const gavG = prev.totalGAV > 0 ? (met.totalGAV - prev.totalGAV)/prev.totalGAV : 0;
    if (gavG > 0.08) bc.push({ member:"CIO", text:"Exceptional "+fmtP(gavG)+" GAV growth." });
    else if (gavG > 0.03) bc.push({ member:"CIO", text:fmtP(gavG)+" GAV growth. Target higher-yield CEE markets." });
    else if (gavG < -0.02) bc.push({ member:"CIO", text:"GAV contracted "+fmtP(Math.abs(gavG))+"." });
    if (met.avgOcc < prev.avgOcc - 0.05) bc.push({ member:"COO", text:"Occupancy dropped "+fmtP(prev.avgOcc-met.avgOcc)+". Void costs will spike." });
    if (met.noi < 0 && (prev.noi >= 0)) bc.push({ member:"CFO", text:"NOI has turned NEGATIVE. Cash-burning. Crisis." });
    else if (met.noi < 0) bc.push({ member:"CFO", text:"NOI still negative at "+fmtM(met.noi)+"." });
    else if (met.noi > prev.noi * 1.05) bc.push({ member:"CFO", text:"NOI up. Deploy surplus into pipeline." });
  }
  if (yearEnd && state) {
    const irr = calcIRR(state.initialCash||state.cash, met.totalGAV, state.cash, quarter);
    const yr = Math.round(quarter/4);
    if (irr !== null) {
      if (irr > 0.12) bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+" exceeds target." });
      else if (irr > 0.08) bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+". Solid." });
      else bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+" below expectations." });
    }
  }
  if (!bc.length) bc.push({ member: hist.length <= 1 ? "Board Chair" : "CFO", text: hist.length <= 1 ? "Welcome. LPs expect 10-12% net IRR over 5 years." : "Steady quarter. Maintain pricing discipline." });
  return { sentiments: sArr, boardComments: bc };
}

function SentBadge({ mood, label }) {
  const m = { positive:{bg:T.grnD,b:T.grn,t:T.grn}, neutral:{bg:T.ambD,b:T.amb,t:T.amb}, negative:{bg:T.redD,b:T.red,t:T.red} };
  const c = m[mood] || m.neutral;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:"4px",padding:"2px 8px",borderRadius:"3px",fontSize:"10px",fontWeight:700,background:c.bg,color:c.t,border:"1px solid "+c.b }}>{label}</span>;
}

function InvestorGauge({ score, color, label }) {
  const [display, setDisplay] = useState(0);
  const [arcPct, setArcPct] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    setDisplay(0);
    setArcPct(0);
    startRef.current = null;
    const dur = 800;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(score * ease));
      setArcPct(score * ease);
      if (p < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [score]);

  const r = 50, cx = 60, cy = 58, sw = 7;
  const halfCirc = Math.PI * r;
  const arcLen = (arcPct / 100) * halfCirc;
  const gap = halfCirc - arcLen;

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ position:"relative", width:"120px", height:"72px", margin:"0 auto" }}>
        <svg viewBox="0 0 120 72" style={{ width:"120px",height:"72px",overflow:"visible" }}>
          <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} strokeLinecap="round" />
          <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${arcLen} ${gap}`}
            style={{ filter:`drop-shadow(0 0 4px ${color}50)`, transition:"stroke 0.3s" }} />
        </svg>
        <div style={{ position:"absolute",bottom:"2px",left:0,right:0,textAlign:"center" }}>
          <div style={{ fontSize:"32px",fontWeight:900,color,lineHeight:1 }}>{display}</div>
          <div style={{ fontSize:"9px",color:color,opacity:0.5,fontWeight:700,marginTop:"1px" }}>/100</div>
        </div>
      </div>
      <div style={{ fontSize:"12px",fontWeight:800,color,letterSpacing:"0.08em",marginTop:"4px" }}>{label}</div>
      <div style={{ fontSize:"9px",color:"#9098a8",marginTop:"4px" }}>Based on IRR, occupancy, NOI yield, ESG & scale</div>
    </div>
  );
}

/* ===== STYLES ===== */
const S = {
  app:{ minHeight:"100vh",background:"radial-gradient(ellipse at 50% 30%, #141820 0%, #0c0e12 60%, #08090c 100%)",color:T.txt,fontFamily:"'Inter', sans-serif",fontSize:"13px",lineHeight:1.5 },
  hdr:{ padding:"10px 18px",borderBottom:"none",display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap",position:"relative" },
  logo:{ display:"flex",alignItems:"center",gap:"10px",flexShrink:0 },
  mBar:{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:"1px",background:"#1a1d24",borderBottom:"1px solid #2a2e38" },
  mCell:{ background:"#0a0c10",padding:"14px 16px",textAlign:"center" },
  mLbl:{ fontSize:"10px",color:T.txtD,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px" },
  mVal:{ fontSize:"20px",fontWeight:800,color:T.txt },
  main:{ display:"grid",gridTemplateColumns:"1fr 380px",minHeight:"calc(100vh - 160px)" },
  lp:{ padding:"14px 18px",overflowY:"auto",borderRight:"1px solid "+T.bdr },
  rp:{ padding:"14px 18px",overflowY:"auto",background:"#0e1014" },
  tabs:{ display:"flex",gap:"2px",marginBottom:"14px",background:"rgba(255,255,255,0.04)",borderRadius:"4px",padding:"2px",border:"1px solid rgba(255,255,255,0.06)" },
  card:{ background:T.card,border:"1px solid "+T.bdr,borderRadius:"4px",padding:"12px 14px",marginBottom:"8px",transition:"transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease" },
  grid:{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginTop:"8px" },
  stat:{ fontSize:"10px",color:T.txtD,letterSpacing:"0.04em",textTransform:"uppercase" },
  val:{ fontSize:"14px",fontWeight:700,color:T.txt },
  row:{ display:"flex",gap:"4px",marginTop:"7px",flexWrap:"wrap" },
  sec:{ fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.txtD,marginBottom:"8px",marginTop:"4px" },
  evLog:{ fontSize:"11px",lineHeight:1.7,color:T.txtD },
  evItem:{ padding:"4px 0",borderBottom:"1px solid "+T.bdr },
  empty:{ padding:"18px",textAlign:"center",color:T.txtD,fontSize:"12px" },
};

function tabSt(active, accent) { const ac = accent || "rgba(138,154,170,0.6)"; return { flex:1,padding:"8px 10px",background:active?"rgba(138,154,170,0.10)":"rgba(255,255,255,0.03)",color:active?"#f0f2f6":"#8a92a4",border:active?"1px solid rgba(138,154,170,0.25)":"1px solid transparent",borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",fontFamily:"inherit",position:"relative",borderBottom:active?"2px solid "+ac:"2px solid transparent",transition:"all 0.15s ease" }; }
function btnSt(v) { const colors = { green:{b:T.grn,bg:T.grnD,c:T.grn}, red:{b:T.red,bg:T.redD,c:T.red}, amber:{b:"#a08840",bg:"#1a1808",c:"#a08840"} }; const d = colors[v] || { b:T.acc, bg:T.accD, c:T.hiAcc }; return { padding:"5px 10px",border:"1px solid "+d.b,background:d.bg,color:d.c,borderRadius:"3px",cursor:"pointer",fontSize:"10px",fontWeight:600,fontFamily:"inherit" }; }
function condSt(c) { return { display:"inline-block",padding:"2px 6px",borderRadius:"3px",fontSize:"9px",fontWeight:700,background:c==="A"?T.grnD:c==="B"?T.ambD:T.redD, color:c==="A"?T.grn:c==="B"?T.amb:T.red, ...(c==="C" ? { animation:"gradeC_pulse 2s ease-in-out infinite" } : {}) }; }
function assetHealthCol(a) { if (a.developing) return "#6a8a9a"; if (a.urgentIssue) return "#c04040"; const npi = calcAssetCosts(a).netPropertyIncome; if (npi < 0) return "#c04040"; if (a.occupancy < 0.5 || a.condition === "C") return "#c06040"; if (a.occupancy < 0.75 || a.condition === "B") return "#a08840"; return "#5a9a6a"; }

/* ===== CARD COMPONENTS ===== */
function MetricCell({ label, value, color, sparkData, sparkColor }) {
  return (
    <div style={{ ...S.mCell, position:"relative", overflow:"hidden" }}>
      {sparkData && sparkData.length >= 2 && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"100%", opacity:0.12, pointerEvents:"none" }}>
          <Spark data={sparkData} color={sparkColor || "#6a7a8a"} height={60} />
        </div>
      )}
      <div style={{ position:"relative", zIndex:1 }}>
        <div style={S.mLbl}><TipLbl label={label} style={{ fontSize:"10px",color:T.txtD,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase" }} /></div>
        <div style={{ ...S.mVal, color: color || T.txt }}>{value}</div>
      </div>
    </div>
  );
}

function AssetCard({ asset, onMaint, onDispose, onFix }) {
  const ac = ASSET_CLASSES.find(x => x.id === asset.assetClass);
  const tInfo = asset.tenant ? getTI(asset.tenant) : null;
  const mktCity = MARKETS.find(m => m.id === asset.market)?.city || "";
  const mktName = MARKETS.find(m => m.id === asset.market)?.name || "";
  const costs = !asset.developing ? calcAssetCosts(asset, ac) : null;
  const thumb = <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"4px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)" }}><WHouse condition={asset.condition} gla={asset.gla} developing={asset.developing} assetClass={asset.assetClass} seed={asset.visualSeed||0} /></div>;
  if (asset.developing) {
    const pD = ((asset.totalDevQuarters||4) - asset.devQuartersLeft) / (asset.totalDevQuarters||4) * 100;
    return (<div className="logi-card" style={{ ...S.card, borderLeft:"3px solid "+assetHealthCol(asset) }}><div style={{ display:"flex",gap:"12px" }}>{thumb}<div style={{ flex:1 }}><div style={{ display:"flex",justifyContent:"space-between" }}><div><div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{asset.name}</div><div style={{ fontSize:"11px",color:T.txtD }}>{asset.assetClassName} · {mktName} · Dev</div></div><span style={condSt("A")}>DEV</span></div></div></div><div style={S.grid}><div><TipLbl label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla/1000).toFixed(0)}k</div></div><div><TipLbl label="Dev Cost" style={S.stat} /><div style={S.val}>{fmtM(asset.totalDevCost||0)}</div></div><div><TipLbl label="Completion" style={S.stat} /><div style={S.val}>{asset.devQuartersLeft}Q</div></div></div><div style={{ height:"4px",background:T.bdr,borderRadius:"2px",marginTop:"6px" }}><div style={{ height:"100%",width:pD+"%",background:T.acc,borderRadius:"2px" }} /></div></div>);
  }
  const npi = costs ? costs.netPropertyIncome : 0;
  const npiNeg = npi < 0;
  return (
    <div className="logi-card" style={{ ...S.card, borderLeft:"3px solid "+assetHealthCol(asset) }}>
      <div style={{ display:"flex",gap:"12px" }}>
        {thumb}
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{asset.name}{asset.urgentIssue && <span style={{ display:"inline-block",padding:"2px 6px",borderRadius:"3px",fontSize:"9px",fontWeight:700,background:T.redD,color:T.red,marginLeft:"5px" }}>ISSUE</span>}{npiNeg && <span style={{ display:"inline-block",padding:"2px 6px",borderRadius:"3px",fontSize:"9px",fontWeight:700,background:"#1a0808",color:"#c04040",marginLeft:"5px" }}>NPI NEG</span>}</div>
              <div style={{ fontSize:"11px",color:T.txtD }}>{asset.assetClassName} · {mktName}{mktCity ? <span style={{ color:T.txtM }}>, {mktCity}</span> : ""}{asset.tenant && <>{" · "}<span style={{ color:T.hiAcc }}>{asset.tenant}</span>{tInfo && <span style={{ marginLeft:"4px",fontSize:"9px",color:credCol(tInfo.credit),background:"rgba(0,0,0,0.3)",padding:"1px 4px",borderRadius:"3px",boxShadow:"inset 0 0 6px "+credCol(tInfo.credit)+"40" }}>{tInfo.credit}</span>}</>}</div>
            </div>
            <div style={{ display:"flex",gap:"3px" }}><span style={{ fontSize:"9px",color:T.txtD,padding:"2px 5px",background:T.accD,borderRadius:"3px" }}>EPC {asset.epcRating}</span><span style={condSt(asset.condition)}>Gr {asset.condition}</span></div>
          </div>
        </div>
      </div>
      {asset.urgentIssue && <div style={{ margin:"6px 0",padding:"6px 10px",background:T.redD,border:"1px solid "+T.red,borderRadius:"4px",fontSize:"10px",color:T.red }}>{asset.urgentIssue.name} <button style={{ ...btnSt("red"),marginLeft:"6px",padding:"2px 6px",fontSize:"9px" }} onClick={() => onFix(asset.id)}>Fix ({fmtK(asset.gla * asset.urgentIssue.fixCost)})</button></div>}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"6px",marginTop:"8px" }}>
        <div><TipLbl label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla/1000).toFixed(0)}k</div></div>
        <div><TipLbl label="Occupancy" style={S.stat} /><div style={{ ...S.val, color:asset.occupancy>0.85?T.grn:asset.occupancy>0.6?T.amb:T.red }}>{fmtP(asset.occupancy)}</div></div>
        <div><TipLbl label="GAV" style={S.stat} /><div style={S.val}>{fmtM(asset.value)}</div></div>
        <div><TipLbl label="Rent p.a." style={S.stat} /><div style={S.val}>{fmtM(asset.gri)}</div></div>
        <div><TipLbl label="Prop Costs" style={S.stat} /><div style={{ ...S.val, color:T.red }}>{fmtK(costs?.totalIrrecoverable||0)}</div></div>
        <div><TipLbl label="NPI" style={S.stat} /><div style={{ ...S.val, color:npiNeg?"#c04040":T.grn }}>{fmtM(npi)}</div></div>
        <div><TipLbl label="Rent/sqm" style={S.stat} /><div style={S.val}>{"\u20AC"}{asset.rentPsm.toFixed(1)}</div></div>
        <div><TipLbl label="WALT" style={S.stat} /><div style={S.val}>{asset.leaseRemaining > 0 ? asset.leaseRemaining.toFixed(1)+"yr" : "Vacant"}</div></div>
      </div>
      {costs && (asset.occupancy < 0.8) && (
        <div style={{ marginTop:"6px",padding:"5px 8px",background:"rgba(160,64,64,0.06)",border:"1px solid rgba(160,64,64,0.15)",borderRadius:"3px",fontSize:"9px",color:T.red,lineHeight:1.5 }}>
          Void Cost {fmtK(costs.voidRates + costs.irrecoverableSC)}/yr · Insurance {fmtK(costs.insurance)}/yr · Maint {fmtK(costs.maintDrag)}/yr
        </div>
      )}
      {(asset.histOcc && asset.histOcc.length >= 2) && (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginTop:"6px" }}>
          <div style={{ background:"rgba(255,255,255,0.02)",borderRadius:"3px",padding:"4px 6px" }}>
            <div style={{ fontSize:"7px",color:T.txtM,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"1px" }}>Occupancy</div>
            <div style={{ height:"20px" }}><Spark data={asset.histOcc} color={asset.occupancy>0.85?T.grn:asset.occupancy>0.6?T.amb:T.red} height={20} /></div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.02)",borderRadius:"3px",padding:"4px 6px" }}>
            <div style={{ fontSize:"7px",color:T.txtM,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"1px" }}>Rent/sqm</div>
            <div style={{ height:"20px" }}><Spark data={asset.histRent||[]} color={T.hiAcc} height={20} /></div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.02)",borderRadius:"3px",padding:"4px 6px" }}>
            <div style={{ fontSize:"7px",color:T.txtM,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"1px" }}>GAV</div>
            <div style={{ height:"20px" }}><Spark data={asset.histVal||[]} color={T.acc} height={20} /></div>
          </div>
        </div>
      )}
      <div style={{ display:"flex",alignItems:"center",gap:"6px",marginTop:"6px" }}>
        <span style={{ fontSize:"8px",color:T.txtM,flexShrink:0,width:"52px" }}>Occupancy</span>
        <div style={{ width:"140px",height:"3px",background:T.bdr,borderRadius:"2px",flexShrink:0 }}><div className="logi-occ-bar" style={{ height:"100%",width:(asset.occupancy*100)+"%",background:asset.occupancy>0.85?T.grn:asset.occupancy>0.6?T.amb:T.red,borderRadius:"2px" }} /></div>
        <span style={{ fontSize:"8px",color:asset.occupancy>0.85?T.grn:asset.occupancy>0.6?T.amb:T.red,fontWeight:700 }}>{fmtP(asset.occupancy)}</span>
      </div>
      <div style={S.row}>
        {MAINT.map(mt => <button key={mt.id} style={btnSt(mt.id==="refurb"?"amber":mt.id==="esg"?"green":"default")} onClick={() => onMaint(asset.id, mt.id)}>{mt.name} ({fmtK(asset.gla * mt.costPerSqm)})</button>)}
        <button style={btnSt("red")} onClick={() => onDispose(asset.id)}>Dispose</button>
      </div>
    </div>
  );
}

function AcqCard({ asset, onAcquire, ok }) {
  const ac = ASSET_CLASSES.find(x => x.id === asset.assetClass);
  const mktName = MARKETS.find(m => m.id === asset.market)?.name || "";
  const mktCity = MARKETS.find(m => m.id === asset.market)?.city || "";
  return (
    <div className="logi-card" style={{ ...S.card, opacity:ok?1:0.5 }}>
      <div style={{ display:"flex",gap:"12px" }}>
        <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"4px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)" }}><WHouse condition={asset.condition} gla={asset.gla} assetClass={asset.assetClass} seed={asset.visualSeed||0} /></div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <div><div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{asset.name}</div><div style={{ fontSize:"11px",color:T.txtD }}>{asset.assetClassName} · {mktName}{mktCity ? <span style={{ color:T.txtM }}>, {mktCity}</span> : ""}{asset.tenant && <>{" · "}<span style={{ color:T.hiAcc }}>{asset.tenant}</span></>}</div></div>
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
        <div><TipLbl label="WALT" style={S.stat} /><div style={S.val}>{asset.leaseRemaining > 0 ? asset.leaseRemaining+"yr" : "Vacant"}</div></div>
      </div>
      <div style={S.row}><button style={btnSt("green")} onClick={() => onAcquire(asset.id)} disabled={!ok}>Acquire</button></div>
    </div>
  );
}

function DevCard({ site, onDev, ok }) {
  const ac = ASSET_CLASSES.find(x => x.id === site.assetClass);
  const mktName = MARKETS.find(m => m.id === site.market)?.name || "";
  return (
    <div className="logi-card" style={{ ...S.card, opacity:ok?1:0.5 }}>
      <div style={{ display:"flex",gap:"12px" }}>
        <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"4px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)" }}><WHouse condition="A" gla={site.gla} developing={true} assetClass={site.assetClass} seed={parseInt(site.id.replace(/\D/g,""))||0} /></div>
        <div style={{ flex:1 }}><div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{site.name}</div><div style={{ fontSize:"11px",color:T.txtD }}>{ac?.name} · {mktName}</div></div>
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
      <div style={{ ...S.card, background:T.accD, border:"1px solid "+T.acc, marginBottom:"8px" }}><div style={{ fontSize:"12px",color:T.hiAcc,fontWeight:700 }}>Quarterly Team Cost: {fmtK(teamQCost(team))}</div></div>
      {TEAM_ROLES.map(r => { const n = team[r.id] || 0; return (
        <div key={r.id} style={{ ...S.card, marginBottom:"5px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px" }}><span style={{ fontSize:"12px",fontWeight:700,color:T.wht }}>{r.name}</span><span style={{ fontSize:"16px",fontWeight:700,color:T.hiAcc }}>{n}</span></div>
          <div style={{ fontSize:"10px",color:T.txtD,marginBottom:"4px" }}>{r.desc}</div>
          <div style={{ fontSize:"10px",color:T.txtM,marginBottom:"5px" }}>Salary: {fmtK(r.salaryCost)}/yr</div>
          <div style={S.row}><button style={btnSt("green")} onClick={() => onHire(r.id)}>+ Hire</button>{n > 0 && <button style={btnSt("red")} onClick={() => onFire(r.id)}>- Remove</button>}</div>
        </div>
      ); })}
    </div>
  );
}

function MarketIntelPanel({ marketData }) {
  const [selMkt, setSelMkt] = useState(null);
  const md = marketData || {};
  return (
    <div>
      <div style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px" }}>Live Market Intelligence</div>
      <div style={{ overflowX:"auto",marginBottom:"10px" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:"10px" }}>
          <thead><tr style={{ borderBottom:"1px solid "+T.bdr }}>{["Market","NER \u20AC/sqm","\u0394 QoQ","Prime Yield","Vacancy","Demand"].map(h => <th key={h} style={{ padding:"4px 6px",color:T.txtM,fontWeight:600,textAlign:"left",whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>
            {MARKETS.map((mkt,i) => {
              const d = md[mkt.id] || {};
              const growth = d.rentalGrowthQoQ || 0;
              const growthColor = growth > 0.02 ? T.grn : growth < -0.02 ? T.red : T.txtD;
              const isSelected = selMkt === mkt.id;
              return (
                <tr key={mkt.id} onClick={() => setSelMkt(isSelected ? null : mkt.id)} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)",cursor:"pointer",background:isSelected?"rgba(138,154,170,0.06)":i%2===0?"rgba(255,255,255,0.01)":"transparent" }}>
                  <td style={{ padding:"5px 6px",color:T.txt,fontWeight:600,whiteSpace:"nowrap" }}>{mkt.name}</td>
                  <td style={{ padding:"5px 6px",color:T.wht,fontWeight:700 }}>{"\u20AC"}{(d.ner||mkt.baseRent).toFixed(0)}</td>
                  <td style={{ padding:"5px 6px",color:growthColor,fontWeight:700 }}>{growth>=0?"+":""}{(growth*100).toFixed(1)}%</td>
                  <td style={{ padding:"5px 6px",color:T.txtD }}>{(d.primeYield||mkt.capRate).toFixed(2)}%</td>
                  <td style={{ padding:"5px 6px",color:(d.marketVacancy||0.07)>0.10?T.red:T.grn,fontWeight:600 }}>{fmtP(d.marketVacancy||0.07)}</td>
                  <td style={{ padding:"5px 6px" }}><div style={{ display:"flex",alignItems:"center",gap:"4px" }}><div style={{ width:"40px",height:"3px",background:T.bdr,borderRadius:"2px" }}><div style={{ height:"100%",width:((d.demandIndex||60)+"%"),background:(d.demandIndex||60)>70?T.grn:(d.demandIndex||60)>45?T.amb:T.red,borderRadius:"2px" }} /></div><span style={{ color:T.txtD,fontSize:"9px" }}>{d.demandIndex||60}</span></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selMkt && (() => {
        const mkt = MARKETS.find(m => m.id === selMkt);
        const d = md[selMkt] || {};
        return (
          <div style={{ ...S.card,background:"rgba(138,154,170,0.04)",border:"1px solid rgba(138,154,170,0.15)" }}>
            <div style={{ fontSize:"13px",fontWeight:700,color:T.wht,marginBottom:"8px" }}>{mkt.name} — {mkt.city}</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",fontSize:"10px" }}>
              <div><div style={{ color:T.txtM }}>Net Effective Rent</div><div style={{ color:T.wht,fontWeight:700,fontSize:"14px" }}>{"\u20AC"}{(d.ner||mkt.baseRent).toFixed(1)}/sqm</div></div>
              <div><div style={{ color:T.txtM }}>QoQ Rental Growth</div><div style={{ color:(d.rentalGrowthQoQ||0)>0?T.grn:T.red,fontWeight:700,fontSize:"14px" }}>{(d.rentalGrowthQoQ||0)>=0?"+":""}{((d.rentalGrowthQoQ||0)*100).toFixed(2)}%</div></div>
              <div><div style={{ color:T.txtM }}>Prime Cap Rate</div><div style={{ color:T.wht,fontWeight:700,fontSize:"14px" }}>{(d.primeYield||mkt.capRate).toFixed(2)}%</div></div>
              <div><div style={{ color:T.txtM }}>Market Vacancy</div><div style={{ color:(d.marketVacancy||0.07)>0.10?T.red:T.grn,fontWeight:700,fontSize:"14px" }}>{fmtP(d.marketVacancy||0.07)}</div></div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function FinancingPanel({ state, onDrawDebt, onRepayDebt }) {
  const [selDebt, setSelDebt] = useState(null);
  const [drawAmt, setDrawAmt] = useState("");
  const totalDebt = (state.debtDrawdowns||[]).reduce((a, d) => a + d.amount, 0);
  const m = calcMetrics(state);
  const ltv = m.totalGAV > 0 ? totalDebt / m.totalGAV : 0;
  const treasuryCount = state.team?.treasury || 0;
  const spreadReduction = Math.min(0.5, treasuryCount * 0.1);
  const esg = calcESG(state.portfolio||[]);
  return (
    <div>
      <div style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Debt Financing</div>
      <div style={{ ...S.card,background:"rgba(138,154,170,0.04)",border:"1px solid rgba(138,154,170,0.15)",marginBottom:"10px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",fontSize:"10px" }}>
          <div><div style={{ color:T.txtM }}>Total Debt</div><div style={{ color:T.wht,fontWeight:800,fontSize:"14px" }}>{fmtM(totalDebt)}</div></div>
          <div><div style={{ color:T.txtM }}>Portfolio LTV</div><div style={{ color:ltv>0.65?T.red:ltv>0.50?T.amb:T.grn,fontWeight:800,fontSize:"14px" }}>{fmtP(ltv)}</div></div>
          <div><div style={{ color:T.txtM }}>Annual Interest</div><div style={{ color:T.red,fontWeight:800,fontSize:"14px" }}>{fmtM((state.debtDrawdowns||[]).reduce((a,d)=>a+d.amount*d.rate/100,0))}</div></div>
        </div>
        <div style={{ marginTop:"7px",height:"3px",background:T.bdr,borderRadius:"2px" }}><div style={{ height:"100%",width:Math.min(100,ltv*100)+"%",background:ltv>0.65?T.red:ltv>0.50?T.amb:T.grn,borderRadius:"2px",transition:"width 0.4s" }} /></div>
        <div style={{ fontSize:"8px",color:T.txtM,marginTop:"2px" }}>Covenant limit: 70% LTV</div>
      </div>
      {(state.debtDrawdowns||[]).length > 0 && (
        <div style={{ marginBottom:"10px" }}>
          <div style={{ fontSize:"9px",color:T.txtM,fontWeight:600,marginBottom:"5px",textTransform:"uppercase" }}>Outstanding Facilities</div>
          {state.debtDrawdowns.map(d => { const dt = DEBT_TYPES.find(x => x.id === d.type) || DEBT_TYPES[0]; return (
            <div key={d.id} style={{ ...S.card,padding:"7px 10px",marginBottom:"5px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div><div style={{ fontSize:"10px",fontWeight:700,color:T.txt }}>{dt.name}</div><div style={{ fontSize:"9px",color:T.txtM }}>{fmtM(d.amount)} @ {d.rate.toFixed(2)}% p.a.</div></div>
              <button style={{ ...btnSt("red"),fontSize:"9px",padding:"3px 7px" }} onClick={() => onRepayDebt(d.id)}>Repay</button>
            </div>
          ); })}
        </div>
      )}
      <div style={{ fontSize:"9px",color:T.txtM,fontWeight:600,marginBottom:"6px",textTransform:"uppercase" }}>Available Facilities</div>
      {DEBT_TYPES.map(dt => {
        const effectiveRate = dt.fixedRate ? dt.fixedRate : (BASE_RATE + dt.spread - spreadReduction);
        const maxDraw = Math.max(0, m.totalGAV * dt.ltv - totalDebt);
        const greenLocked = dt.id === "green" && esg < 65;
        return (
          <div key={dt.id} onClick={() => !greenLocked && setSelDebt(selDebt===dt.id?null:dt.id)} style={{ ...S.card,marginBottom:"6px",cursor:greenLocked?"not-allowed":"pointer",opacity:greenLocked?0.5:1,border:"1px solid "+(selDebt===dt.id?T.acc:T.bdr),background:selDebt===dt.id?"rgba(138,154,170,0.06)":T.card }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div><div style={{ fontSize:"11px",fontWeight:700,color:T.wht }}>{dt.name}</div><div style={{ fontSize:"9px",color:T.txtD,marginTop:"1px" }}>{dt.desc}{greenLocked?" — requires ESG score >= 65":""}</div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:"13px",fontWeight:800,color:T.hiAcc }}>{effectiveRate.toFixed(2)}%</div><div style={{ fontSize:"8px",color:T.txtM }}>LTV {(dt.ltv*100).toFixed(0)}% max</div></div>
            </div>
            {selDebt === dt.id && (
              <div style={{ marginTop:"8px",paddingTop:"8px",borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:"9px",color:T.txtM,marginBottom:"4px" }}>Drawdown amount (max {fmtM(maxDraw)})</div>
                <div style={{ display:"flex",gap:"5px",alignItems:"center" }}>
                  <input type="number" placeholder="e.g. 50000000" value={drawAmt} onChange={e => setDrawAmt(e.target.value)} style={{ flex:1,padding:"5px 8px",background:"#06080a",border:"1px solid "+T.bdr,borderRadius:"3px",color:T.txt,fontSize:"10px",fontFamily:"inherit" }} />
                  <button style={{ ...btnSt("green"),padding:"5px 10px" }} onClick={() => { const amt = Number(drawAmt); if (amt > 0 && amt <= maxDraw) { onDrawDebt(dt.id, amt, effectiveRate); setDrawAmt(""); setSelDebt(null); } }}>Drawdown</button>
                </div>
              </div>
            )}
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
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const prevStep = useRef(0);
  const [stepAnim, setStepAnim] = useState(false);
  const toggle = (id) => setSm(p => p.includes(id) ? p.filter(m => m !== id) : p.length < 4 ? [...p, id] : p);
  const ok = step === 0 ? cn.trim().length > 0 : step === 1 ? true : sm.length > 0;
  const next = () => { if (step < 2) { prevStep.current = step; setStepAnim(true); setTimeout(() => { setStep(step + 1); setTimeout(() => setStepAnim(false), 30); }, 150); } else onStart({ companyName:cn.trim(), cash:cap, startMarkets:sm, difficulty:diff }); };
  const saved = hasSave() ? loadGame() : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.width = Math.max(window.innerWidth, 1200);
    let h = canvas.height = Math.max(window.innerHeight, 800);
    const onResize = () => { w = canvas.width = Math.max(window.innerWidth, 1200); h = canvas.height = Math.max(window.innerHeight, 800); };
    window.addEventListener("resize", onResize);
    const onMouseMove = (e) => { mouseRef.current = { x: e.clientX / w, y: e.clientY / h }; };
    window.addEventListener("mousemove", onMouseMove);

    // Grid
    const gridSpacing = 60;
    let gridOffset = 0;

    // Trucks moving along routes
    const trucks = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 0.6,
      size: 3 + Math.random() * 3, alpha: 0.15 + Math.random() * 0.2,
    }));

    // Warehouse nodes
    const nodes = Array.from({ length: 14 }, () => ({
      x: 80 + Math.random() * (w - 160), y: 80 + Math.random() * (h - 160),
      size: 10 + Math.random() * 16, pulse: Math.random() * Math.PI * 2,
    }));

    // Connection lines between nodes
    const connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx*dx + dy*dy) < 400) connections.push([i, j]);
      }
    }

    // Parcels flowing along connections
    const parcels = connections.slice(0, 10).map((c, idx) => ({
      conn: c, t: Math.random(), speed: 0.002 + Math.random() * 0.003,
      dir: idx % 2 === 0 ? 1 : -1, size: 2 + Math.random() * 2,
    }));

    const draw = (time) => {
      ctx.clearRect(0, 0, w, h);

      // Moving grid
      gridOffset = (time * 0.008) % gridSpacing;
      ctx.strokeStyle = "rgba(74, 138, 191, 0.04)";
      ctx.lineWidth = 0.5;
      for (let x = -gridSpacing + gridOffset; x < w + gridSpacing; x += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = -gridSpacing + (gridOffset * 0.5); y < h + gridSpacing; y += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Connection routes (dashed)
      connections.forEach(([i, j]) => {
        const a = nodes[i], b = nodes[j];
        ctx.save();
        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = "rgba(74, 138, 191, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.restore();
      });

      // Parcels flowing along routes
      parcels.forEach(p => {
        p.t += p.speed * p.dir;
        if (p.t > 1) { p.t = 1; p.dir = -1; }
        if (p.t < 0) { p.t = 0; p.dir = 1; }
        const a = nodes[p.conn[0]], b = nodes[p.conn[1]];
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;
        ctx.fillStyle = "rgba(74, 138, 191, 0.35)";
        ctx.fillRect(px - p.size/2, py - p.size/2, p.size, p.size);
      });

      // Warehouse nodes (pulsing with parallax)
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      nodes.forEach(n => {
        n.pulse += 0.015;
        const pulseR = n.size + Math.sin(n.pulse) * 4;
        const depth = 0.5 + (n.size / 26) * 0.5;
        const px = n.x + (mx - 0.5) * 30 * depth;
        const py = n.y + (my - 0.5) * 20 * depth;
        // Outer glow
        ctx.beginPath(); ctx.arc(px, py, pulseR + 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(90, 154, 106, 0.03)"; ctx.fill();
        // Building shape
        ctx.fillStyle = "rgba(90, 154, 106, 0.07)";
        ctx.fillRect(px - n.size * 0.7, py - n.size * 0.4, n.size * 1.4, n.size * 0.8);
        // Roof
        ctx.beginPath();
        ctx.moveTo(px - n.size * 0.8, py - n.size * 0.4);
        ctx.lineTo(px, py - n.size * 0.7);
        ctx.lineTo(px + n.size * 0.8, py - n.size * 0.4);
        ctx.fillStyle = "rgba(90, 154, 106, 0.10)"; ctx.fill();
        // Dock doors
        const doors = Math.max(2, Math.floor(n.size / 6));
        const dw = (n.size * 1.2) / doors;
        for (let d = 0; d < doors; d++) {
          ctx.fillStyle = "rgba(90, 154, 106, 0.12)";
          ctx.fillRect(px - n.size * 0.55 + d * dw, py + n.size * 0.1, dw * 0.7, n.size * 0.3);
        }
      });

      // Trucks
      trucks.forEach(t => {
        t.x += t.vx; t.y += t.vy;
        if (t.x < -20) t.x = w + 20; if (t.x > w + 20) t.x = -20;
        if (t.y < -20) t.y = h + 20; if (t.y > h + 20) t.y = -20;
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(Math.atan2(t.vy, t.vx));
        // Cab
        ctx.fillStyle = `rgba(74, 138, 191, ${t.alpha})`;
        ctx.fillRect(-t.size * 0.4, -t.size * 0.3, t.size * 0.5, t.size * 0.6);
        // Trailer
        ctx.fillStyle = `rgba(74, 138, 191, ${t.alpha * 0.7})`;
        ctx.fillRect(-t.size * 1.5, -t.size * 0.35, t.size * 1.1, t.size * 0.7);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMouseMove); };
  }, []);

  const wrap = { minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Inter', sans-serif",color:T.txt,padding:"20px",position:"relative",overflow:"hidden" };
  const cont = { maxWidth:"540px",width:"100%",position:"relative",zIndex:2 };
  const opt = (sel) => ({ padding:"11px 12px",background:sel?T.accD:T.card,border:"1px solid "+(sel?T.acc:T.bdr),borderRadius:"4px",cursor:"pointer",marginBottom:"6px" });
  const mktSt = (sel) => ({ padding:"9px 10px",background:sel?T.accD:T.card,border:"1px solid "+(sel?T.acc:T.bdr),borderRadius:"4px",cursor:"pointer",textAlign:"center" });

  function MktTile({ m, sel, onToggle }) {
    const [hov, setHov] = useState(false);
    const ref = useRef(null);
    return (
      <div ref={ref} style={{ padding:"9px 10px", background:sel?T.accD:hov?"rgba(138,154,170,0.06)":T.card, border:"1px solid "+(sel?T.acc:hov?"rgba(138,154,170,0.25)":T.bdr), borderRadius:"4px", cursor:"pointer", textAlign:"center", position:"relative", transition:"all 0.2s ease", boxShadow:hov&&!sel?"0 0 12px rgba(138,154,170,0.08)":"none", transform:hov?"translateY(-1px)":"translateY(0)" }} onClick={onToggle} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        <div style={{ fontSize:"11px",fontWeight:600,color:sel?T.hiAcc:hov?T.wht:T.txt }}>{m.name}</div>
        <div style={{ fontSize:"9px",color:T.txtD }}>Cap {m.capRate}% · {"\u20AC"}{m.baseRent}/sqm</div>
        {hov && (
          <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:"#181c24", border:"1px solid #2a2e38", borderRadius:"4px", padding:"8px 10px", fontSize:"9px", color:T.txt, whiteSpace:"nowrap", zIndex:10, boxShadow:"0 4px 16px rgba(0,0,0,0.7)", lineHeight:1.6, pointerEvents:"none", textAlign:"left" }}>
            <div style={{ fontWeight:700, color:T.wht, marginBottom:"2px" }}>{m.name} — {m.city}</div>
            <div>Base rent: <span style={{ color:T.hiAcc, fontWeight:700 }}>{"\u20AC"}{m.baseRent}/sqm</span></div>
            <div>Prime yield: <span style={{ color:T.hiAcc, fontWeight:700 }}>{m.capRate}%</span></div>
            <div>Demand index: <span style={{ color:m.demand>0.8?T.grn:m.demand>0.7?T.amb:T.red, fontWeight:700 }}>{Math.round(m.demand*100)}/100</span></div>
            <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"5px solid #2a2e38" }} />
          </div>
        )}
      </div>
    );
  }
  const nxtSt = (en) => ({ flex:1,padding:"11px 18px",background:en?T.accD:T.card,color:en?T.wht:T.txtM,border:en?"1px solid "+T.acc:"1px solid "+T.bdr,borderRadius:"4px",cursor:en?"pointer":"default",fontSize:"12px",fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em",textTransform:"uppercase" });
  const CAPS = [{l:"\u20AC100m",v:100e6,d:"Scrappy challenger"},{l:"\u20AC150m",v:150e6,d:"Mid-market platform"},{l:"\u20AC250m",v:250e6,d:"Institutional player"},{l:"\u20AC500m",v:500e6,d:"Mega fund"}];
  const DIFFS = [{l:"Guided",v:"guided",d:"Start with 3 seed assets"},{l:"Blank Slate",v:"blank",d:"Cash only"}];
  return (
    <div style={wrap}>
      <canvas ref={canvasRef} style={{ position:"absolute",inset:0,width:"100%",height:"100%",zIndex:1 }} />
      <div style={{ position:"absolute",inset:0,zIndex:1,background:"radial-gradient(ellipse at center, rgba(12,14,18,0.4) 0%, rgba(12,14,18,0.85) 70%, rgba(12,14,18,0.97) 100%)",pointerEvents:"none" }} />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .logi-card:hover { transform: translateY(-2px); border-color: rgba(138,154,170,0.35) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .logi-modal { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .logi-occ-bar { animation: occGrow 0.6s cubic-bezier(0.4,0,0.2,1) forwards; }
        @keyframes occGrow { from { width: 0%; } }
        @keyframes gradeC_pulse { 0%,100%{ box-shadow: 0 0 0px rgba(160,64,64,0); } 50%{ box-shadow: 0 0 6px rgba(160,64,64,0.5); } }
      `}</style>
      <div style={cont}>
        <div style={{ textAlign:"center",marginBottom:"36px" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",marginBottom:"4px" }}><div style={{ position:"relative" }}><Logo size={36} /><span style={{ position:"absolute",inset:0,background:"linear-gradient(90deg, transparent 0%, rgba(138,154,170,0.15) 50%, transparent 100%)",backgroundSize:"200% 100%",animation:"titleSweep 3s ease-in-out infinite",pointerEvents:"none",mixBlendMode:"screen",opacity:0.5,borderRadius:"4px" }} /></div></div>
          <div style={{ fontSize:"10px",color:T.txtD,letterSpacing:"0.12em",textTransform:"uppercase" }}>European Logistics Real Estate Simulator</div>
          <style>{`
            @keyframes titleSweep { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
          `}</style>
        </div>
        {saved && step === 0 && (
          <div style={{ marginBottom:"16px" }}>
            <div style={{ ...opt(false),background:T.grnD,border:"1px solid "+T.grn,cursor:"pointer",textAlign:"center" }} onClick={() => onStart("__load__")}>
              <div style={{ fontSize:"13px",fontWeight:700,color:T.grn,marginBottom:"2px" }}>Continue: {saved.companyName}</div>
              <div style={{ fontSize:"10px",color:T.txtD }}>{getQL(saved.quarter,saved.year)} · {saved.portfolio?.length||0} assets · {fmtM(saved.cash)}</div>
            </div>
            <div style={{ textAlign:"center",fontSize:"9px",color:T.txtM,margin:"10px 0 4px",letterSpacing:"0.08em",textTransform:"uppercase" }}>— or start fresh —</div>
          </div>
        )}
        <div style={{ display:"flex",gap:"5px",justifyContent:"center",marginBottom:"20px" }}>{[0,1,2].map(i => <div key={i} style={{ width:"7px",height:"7px",borderRadius:"50%",background:step>=i?T.acc:T.bdr }} />)}</div>
        {step === 0 && (<div style={{ opacity:stepAnim?0:1, transform:stepAnim?"translateY(12px)":"translateY(0)", transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)" }}><div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 1 of 3</div><div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Name your platform</div><div style={{ fontSize:"12px",color:T.txtD,marginBottom:"16px",lineHeight:1.5 }}>You are the CEO of a European logistics real estate platform. Empty buildings cost money — rates, insurance, service charge.</div><input style={{ width:"100%",padding:"11px 12px",background:T.card,border:"1px solid "+T.bdr,borderRadius:"4px",color:T.wht,fontSize:"14px",fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} placeholder="e.g. Apex Logistics" value={cn} onChange={e => setCn(e.target.value)} onKeyDown={e => e.key==="Enter"&&ok&&next()} autoFocus /></div>)}
        {step === 1 && (<div style={{ opacity:stepAnim?0:1, transform:stepAnim?"translateY(12px)":"translateY(0)", transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)" }}><div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 2 of 3</div><div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Capital and mode</div><div style={{ fontSize:"12px",color:T.txtD,marginBottom:"14px" }}>How much equity?</div>{CAPS.map(o => <div key={o.v} style={opt(cap===o.v)} onClick={() => setCap(o.v)}><div style={{ fontSize:"13px",fontWeight:600,color:cap===o.v?T.hiAcc:T.wht }}>{o.l}</div><div style={{ fontSize:"10px",color:T.txtD }}>{o.d}</div></div>)}<div style={{ marginTop:"10px" }}>{DIFFS.map(o => <div key={o.v} style={opt(diff===o.v)} onClick={() => setDiff(o.v)}><div style={{ fontSize:"13px",fontWeight:600,color:diff===o.v?T.hiAcc:T.wht }}>{o.l}</div><div style={{ fontSize:"10px",color:T.txtD }}>{o.d}</div></div>)}</div></div>)}
        {step === 2 && (<div style={{ opacity:stepAnim?0:1, transform:stepAnim?"translateY(12px)":"translateY(0)", transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)" }}><div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 3 of 3</div><div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Starting markets</div><div style={{ fontSize:"12px",color:T.txtD,marginBottom:"12px" }}>Pick up to 4.</div><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px" }}>{MARKETS.map(m => (<MktTile key={m.id} m={m} sel={sm.includes(m.id)} onToggle={() => toggle(m.id)} />))}</div><div style={{ fontSize:"9px",color:T.txtM,marginTop:"5px",textAlign:"center" }}>{sm.length}/4 selected</div></div>)}
        <div style={{ display:"flex",gap:"6px",marginTop:"24px" }}>
          {step > 0 && <button style={{ padding:"11px 16px",background:"transparent",color:T.txtD,border:"1px solid "+T.bdr,borderRadius:"4px",cursor:"pointer",fontSize:"11px",fontWeight:600,fontFamily:"inherit" }} onClick={() => setStep(step-1)}>Back</button>}
          <button style={nxtSt(ok)} onClick={() => ok && next()}>{step < 2 ? "Continue" : "Launch Simulator"}</button>
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
  const [portSort, setPortSort] = useState("distressed");
  const [acqFilter, setAcqFilter] = useState({ market:"all", assetClass:"all" });
  const [devFilter, setDevFilter] = useState({ market:"all", assetClass:"all" });
  const [showWelcome, setShowWelcome] = useState(false);
  const [qtrModal, setQtrModal] = useState(null);

  useEffect(() => { if (state && started) saveGame(state); }, [state, started]);

  const onStart = useCallback((cfg) => {
    if (cfg === "__load__") { const s = loadGame(); if (s) { setState(s); setStarted(true); setShowWelcome(false); } }
    else { delSave(); const newState = initGame(cfg); setState(newState); setStarted(true); setShowWelcome(true); }
  }, []);
  const onAdvance = useCallback(() => {
    setState(p => {
      if (!p) return p;
      const prevM = calcMetrics(p);
      const next = advanceQ(p);
      const nextM = calcMetrics(next);
      const prevDebt = (p.debtDrawdowns||[]).reduce((a,d)=>a+d.amount*d.rate/4/100,0);
      setQtrModal({ quarter: getQL(next.quarter, next.year), rent: next.portfolio.filter(a=>!a.developing).reduce((a,x)=>a+x.gri/4,0), propCosts: nextM.totalPropCosts/4, ga: teamQCost(next.team), debtInt: prevDebt, netCashFlow: next.cash - p.cash, cashBefore: p.cash, cashAfter: next.cash, gavBefore: prevM.totalGAV, gavAfter: nextM.totalGAV, occBefore: prevM.avgOcc, occAfter: nextM.avgOcc, noiBefore: prevM.noi, noiAfter: nextM.noi, issues: next.portfolio.filter(a=>a.urgentIssue && !a.developing).length, newEvents: next.events.slice(p.events.length) });
      return next;
    });
  }, []);
  const onAcquire = useCallback((id) => setState(p => { if (!p) return p; const a = p.acquisitions.find(x => x.id === id); if (!a || p.cash < a.askPrice) return p; const q = { ...a, acquired:true, value:a.askPrice }; delete q.askPrice; return { ...p, cash:p.cash-a.askPrice, portfolio:[...p.portfolio,q], acquisitions:p.acquisitions.filter(x => x.id !== id), events:[...p.events, "Acquired "+a.name+" for "+fmtM(a.askPrice)], newsLog:[...(p.newsLog||[]), {text:"Acquired "+a.name+" for "+fmtM(a.askPrice),color:T.hiAcc}] }; }), []);
  const onDispose = useCallback((id) => setState(p => { if (!p) return p; const a = p.portfolio.find(x => x.id === id); if (!a) return p; const pr = a.value * 0.97; return { ...p, cash:p.cash+pr, portfolio:p.portfolio.filter(x => x.id !== id), events:[...p.events, "Disposed "+a.name+" for "+fmtM(pr)], newsLog:[...(p.newsLog||[]), {text:"Disposed "+a.name+" at "+fmtM(pr),color:T.amb}] }; }), []);
  const onMaint = useCallback((aid, mid) => setState(p => { if (!p) return p; const mt = MAINT.find(m => m.id === mid); const a = p.portfolio.find(x => x.id === aid); if (!mt || !a) return p; const cost = a.gla * mt.costPerSqm; if (p.cash < cost) return p; const up = p.portfolio.map(x => { if (x.id !== aid) return x; const n = { ...x, capexSpent:x.capexSpent+cost }; if (mid === "rm") n.lastRM = p.quarter; if (mt.gradeUp && n.condition !== "A") { n.condition = n.condition==="C"?"B":"A"; n.rentPsm *= 1.08; } if (mt.esgBoost) { n.epcRating = n.epcRating==="E"?"D":n.epcRating==="D"?"C":n.epcRating==="C"?"B":"A"; n.occupancy = Math.min(1, n.occupancy+mt.occBoost); } if (mt.occBoost && !mt.esgBoost) n.occupancy = Math.min(1, n.occupancy+mt.occBoost); const mk = MARKETS.find(m => m.id === n.market); const ac = ASSET_CLASSES.find(c => c.id === n.assetClass) || ASSET_CLASSES[0]; n.gri = n.gla * n.rentPsm * n.occupancy; n.value = n.gri > 0 ? n.gri / ((mk?.capRate||5)*(ac?.capRateMult||1)/100) : n.value; return n; }); return { ...p, cash:p.cash-cost, portfolio:up, events:[...p.events, mt.name+" on "+a.name+" ("+fmtK(cost)+")"] }; }), []);
  const onFix = useCallback((aid) => setState(p => { if (!p) return p; const a = p.portfolio.find(x => x.id === aid); if (!a || !a.urgentIssue) return p; const cost = a.gla * a.urgentIssue.fixCost; if (p.cash < cost) return p; return { ...p, cash:p.cash-cost, portfolio:p.portfolio.map(x => x.id !== aid ? x : { ...x, urgentIssue:null, capexSpent:x.capexSpent+cost }), events:[...p.events, "Fixed "+a.name+" ("+fmtK(cost)+")"] }; }), []);
  const onDev = useCallback((id) => setState(p => { if (!p) return p; const s = p.devSites.find(x => x.id === id); if (!s || p.cash < s.devCost) return p; aCtr++; const d = { id:s.id, name:s.name.replace(" (Dev)",""), market:s.market, marketName:s.marketName, flag:"", assetClass:s.assetClass, assetClassName:s.assetClassName, assetClassIcon:"", gla:s.gla, rentPsm:s.estRentPsm, occupancy:0, tenant:null, leaseRemaining:0, gri:0, value:0, age:0, condition:"A", epcRating:"A", capexSpent:0, acquired:true, developing:true, devQuartersLeft:s.quartersToComplete, totalDevQuarters:s.quartersToComplete, totalDevCost:s.devCost, devCostSoFar:0, visualSeed:aCtr, urgentIssue:null, lastRM:0 }; return { ...p, cash:p.cash-s.devCost, portfolio:[...p.portfolio,d], devSites:p.devSites.filter(x => x.id !== id), events:[...p.events, "Started "+s.name+" ("+fmtM(s.devCost)+")"], newsLog:[...(p.newsLog||[]), {text:"Development: "+s.name,color:T.hiAcc}] }; }), []);
  const onHire = useCallback((r) => setState(p => p ? { ...p, team:{ ...p.team, [r]:(p.team[r]||0)+1 } } : p), []);
  const onFire = useCallback((r) => setState(p => p && (p.team[r]||0) > 0 ? { ...p, team:{ ...p.team, [r]:p.team[r]-1 } } : p), []);
  const onReset = useCallback(() => { delSave(); setStarted(false); setState(null); setTab("portfolio"); setRTab("sentiment"); setShowWelcome(false); }, []);
  const onSave = useCallback(() => { if (state) { saveGame(state); setSaved(true); setTimeout(() => setSaved(false), 2000); } }, [state]);
  const onSelectTenant = useCallback((cand) => { setState(p => { if (!p || !p.tenantSelection) return p; const { assetId } = p.tenantSelection; const rfCost = cand.rentFreeMonths > 0 ? (cand.rentPsm * (p.portfolio.find(a=>a.id===assetId)?.gla||0) / 12) * cand.rentFreeMonths : 0; const capCost = cand.capContribution || 0; const cashHit = rfCost + capCost; const updated = p.portfolio.map(a => { if (a.id !== assetId) return a; const n = { ...a, tenant:cand.name, leaseRemaining:cand.term, rentPsm:cand.rentPsm, occupancy:Math.min(1, a.occupancy+rBetween(0.2,0.45)) }; const mkt = MARKETS.find(m => m.id === n.market); const ac = ASSET_CLASSES.find(c => c.id === n.assetClass) || ASSET_CLASSES[0]; n.gri = n.gla * n.rentPsm * n.occupancy; n.value = n.gri > 0 ? n.gri / ((mkt?.capRate||5)*(ac?.capRateMult||1)/100) : n.value; return n; }); return { ...p, cash:p.cash - cashHit, portfolio:updated, tenantSelection:null, events:[...p.events, cand.name+" signed "+cand.term+"yr lease @ \u20AC"+cand.rentPsm.toFixed(1)+"/sqm"], newsLog:[...(p.newsLog||[]), {text:cand.name+" signed "+cand.term+"yr lease",color:T.grn}] }; }); }, []);
  const onDecline = useCallback(() => setState(p => p ? { ...p, tenantSelection:null } : p), []);
  const onDrawDebt = useCallback((typeId, amount, rate) => setState(p => { if (!p) return p; const id = "debt_" + Date.now(); return { ...p, cash: p.cash + amount, debtDrawdowns: [...(p.debtDrawdowns||[]), { id, type:typeId, amount, rate, drawQuarter:p.quarter }], newsLog:[...(p.newsLog||[]), {text:"Drew "+fmtM(amount)+" "+typeId+" @ "+rate.toFixed(2)+"%",color:T.hiAcc}] }; }), []);
  const onRepayDebt = useCallback((debtId) => setState(p => { if (!p) return p; const d = (p.debtDrawdowns||[]).find(x => x.id === debtId); if (!d || p.cash < d.amount) return p; return { ...p, cash: p.cash - d.amount, debtDrawdowns: (p.debtDrawdowns||[]).filter(x => x.id !== debtId), newsLog:[...(p.newsLog||[]), {text:"Repaid "+fmtM(d.amount)+" "+d.type,color:T.red}] }; }), []);

  if (!started || !state) return <StartScreen onStart={onStart} />;

  const m = calcMetrics(state);
  const ql = getQL(state.quarter, state.year);
  const irr = calcIRR(state.initialCash||state.cash, m.totalGAV, state.cash, state.quarter);
  const noiNegative = m.noi < 0;

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      {showWelcome && <WelcomeModal companyName={state.companyName} cash={state.initialCash || state.cash} startMarkets={state._startMarkets || ["uk","de","pl"]} difficulty={state._difficulty || "guided"} portfolio={state.portfolio} onClose={() => setShowWelcome(false)} />}
      {state.tenantSelection && !showWelcome && <TenantModal candidates={state.tenantSelection.candidates} assetName={state.tenantSelection.assetName} assetGla={state.tenantSelection.assetGla} onSelect={onSelectTenant} onClose={onDecline} />}
      {qtrModal && !showWelcome && (() => {
        const q = qtrModal;
        const gavDelta = q.gavAfter - q.gavBefore;
        const occDelta = q.occAfter - q.occBefore;
        const noiDelta = q.noiAfter - q.noiBefore;
        const deltaCol = (v) => v > 0 ? T.grn : v < 0 ? T.red : T.txtD;
        const deltaStr = (v, fmt) => (v >= 0 ? "+" : "") + fmt(v);
        return (
          <div className="logi-modal" style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.70)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter', sans-serif" }}>
            <div style={{ background:"#0a0c10",border:"1px solid #2a2e38",borderRadius:"4px",padding:"24px",maxWidth:"480px",width:"92%",boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }}>
              <div style={{ textAlign:"center",marginBottom:"16px" }}>
                <div style={{ fontSize:"10px",color:T.hiAcc,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px" }}>Quarter Complete</div>
                <div style={{ fontSize:"24px",fontWeight:900,color:T.wht }}>{q.quarter}</div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"4px",padding:"12px",marginBottom:"12px" }}>
                <div style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Quarterly Cash Flow</div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"3px" }}><span style={{ fontSize:"10px",color:T.txtD }}>Rental income</span><span style={{ fontSize:"10px",fontWeight:700,color:T.grn }}>{fmtK(q.rent)}</span></div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"3px" }}><span style={{ fontSize:"10px",color:T.txtD }}>Property costs</span><span style={{ fontSize:"10px",fontWeight:700,color:T.red }}>({fmtK(q.propCosts)})</span></div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"3px" }}><span style={{ fontSize:"10px",color:T.txtD }}>Team G&A</span><span style={{ fontSize:"10px",fontWeight:700,color:T.red }}>({fmtK(q.ga)})</span></div>
                {q.debtInt > 0 && <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"3px" }}><span style={{ fontSize:"10px",color:T.txtD }}>Debt interest</span><span style={{ fontSize:"10px",fontWeight:700,color:T.red }}>({fmtK(q.debtInt)})</span></div>}
                <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"5px",marginTop:"5px" }}><span style={{ fontSize:"11px",fontWeight:800,color:T.wht }}>Net Cash Flow</span><span style={{ fontSize:"13px",fontWeight:900,color:q.netCashFlow >= 0 ? T.grn : "#c04040" }}>{q.netCashFlow >= 0 ? "+" : ""}{fmtK(q.netCashFlow)}</span></div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px" }}>
                {[{l:"GAV",v:fmtM(q.gavAfter),d:deltaStr(gavDelta, fmtM),dc:deltaCol(gavDelta)},{l:"Occupancy",v:fmtP(q.occAfter),d:(occDelta>=0?"+":"")+(occDelta*100).toFixed(1)+"pp",dc:deltaCol(occDelta),vc:q.occAfter>0.85?T.grn:q.occAfter>0.6?T.amb:T.red},{l:"NOI p.a.",v:fmtM(q.noiAfter),d:deltaStr(noiDelta, fmtM),dc:deltaCol(noiDelta),vc:q.noiAfter<0?"#c04040":T.grn}].map((x,i)=>(
                  <div key={i} style={{ background:"rgba(255,255,255,0.02)",borderRadius:"4px",padding:"8px",textAlign:"center" }}>
                    <div style={{ fontSize:"9px",color:T.txtM,fontWeight:600,marginBottom:"2px" }}>{x.l}</div>
                    <div style={{ fontSize:"14px",fontWeight:800,color:x.vc||T.wht }}>{x.v}</div>
                    <div style={{ fontSize:"10px",fontWeight:700,color:x.dc }}>{x.d}</div>
                  </div>
                ))}
              </div>
              {q.issues > 0 && <div style={{ background:"rgba(160,64,64,0.06)",border:"1px solid rgba(160,64,64,0.2)",borderRadius:"4px",padding:"8px 10px",marginBottom:"12px",fontSize:"10px",color:T.red }}>{q.issues} asset{q.issues > 1 ? "s" : ""} with unresolved issues</div>}
              {q.newEvents.length > 0 && <div style={{ maxHeight:"100px",overflowY:"auto",marginBottom:"12px" }}>{q.newEvents.slice(0, 6).map((e, i) => (<div key={i} style={{ fontSize:"10px",color:T.txtD,lineHeight:1.6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{e}</div>))}{q.newEvents.length > 6 && <div style={{ fontSize:"9px",color:T.txtM }}>+{q.newEvents.length - 6} more</div>}</div>}
              <button onClick={() => setQtrModal(null)} style={{ width:"100%",padding:"10px",background:T.accD,color:T.wht,border:"1px solid "+T.acc,borderRadius:"4px",cursor:"pointer",fontSize:"12px",fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em" }}>Continue</button>
            </div>
          </div>
        );
      })()}

      {(() => {
        const healthCol = m.noi < 0 ? "#a04040" : m.avgOcc > 0.85 ? "#5a9a6a" : m.avgOcc > 0.6 ? "#6a8a9a" : "#a08840";
        return (
          <div style={{ position:"relative" }}>
            <div style={S.hdr}>
        <div style={S.logo}><div><div style={{ fontSize:"15px",fontWeight:800,color:T.wht,letterSpacing:"0.05em",position:"relative",paddingBottom:"3px" }}>{state.companyName.toUpperCase()}<span style={{ position:"absolute",bottom:0,left:0,right:0,height:"1.5px",background:`linear-gradient(90deg, ${m.noi < 0 ? "#a04040" : m.avgOcc > 0.85 ? "#5a9a6a" : "#6a8a9a"}90, transparent)`,borderRadius:"1px" }} /></div><div style={{ marginTop:"2px" }}><Logo size={16} /></div></div></div>
        <NewsFeed items={state.newsLog || []} />
        <div style={{ display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",flexShrink:0 }}>
          <div style={{ padding:"5px 12px",background:T.grnD,border:"1px solid rgba(90,154,106,0.3)",borderRadius:"4px" }}><div style={{ fontSize:"9px",color:T.grn,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>CASH</div><div style={{ fontSize:"17px",fontWeight:800,color:T.grn }}>{fmtM(state.cash)}</div></div>
          <div style={{ padding:"5px 12px",background:T.accD,border:"1px solid rgba(138,154,170,0.3)",borderRadius:"4px" }}><div style={{ fontSize:"9px",color:T.hiAcc,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>PERIOD</div><div style={{ fontSize:"15px",fontWeight:800,color:T.wht }}>{ql}</div></div>
          <button style={{ padding:"9px 18px",background:"#2a1010",color:"#c04040",border:"1px solid #5a2020",borderRadius:"4px",cursor:"pointer",fontSize:"11px",fontWeight:800,fontFamily:"inherit",letterSpacing:"0.05em",textTransform:"uppercase" }} onClick={onAdvance}>Next Quarter</button>
          <button style={{ ...btnSt("green"),padding:"5px 9px",fontSize:"9px" }} onClick={onSave}>{saved ? "Saved" : "Save"}</button>
          <button style={{ ...btnSt("default"),padding:"5px 9px",fontSize:"9px" }} onClick={onReset}>Reset</button>
        </div>
      </div>
            <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg, transparent 0%, ${healthCol}40 20%, ${healthCol}80 50%, ${healthCol}40 80%, transparent 100%)` }} />
          </div>
        );
      })()}

      {noiNegative && (
        <div style={{ background:"#1a0808",padding:"8px 18px",display:"flex",alignItems:"center",gap:"10px",borderBottom:"1px solid #5a2020" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"11px",fontWeight:800,color:"#c04040",letterSpacing:"0.05em" }}>NOI IS NEGATIVE: {fmtM(m.noi)} p.a.</div>
            <div style={{ fontSize:"9px",color:"#8a4040" }}>Property costs ({fmtM(m.totalPropCosts)}) + G&A exceed rental income. Void costs: {fmtM(m.totalVoidCost)} p.a.</div>
          </div>
        </div>
      )}

      <div style={S.mBar}>
        <MetricCell label="Portfolio GAV" value={fmtM(m.totalGAV)} sparkData={state.history.map(h=>h.totalGAV)} sparkColor={T.acc} />
        <MetricCell label="Assets" value={m.assetCount} />
        <MetricCell label="Total GLA" value={(m.totalGLA/1000).toFixed(0)+"k sqm"} />
        <MetricCell label="Avg Occupancy" value={fmtP(m.avgOcc)} color={m.avgOcc>0.85?T.grn:m.avgOcc>0.6?T.amb:T.red} sparkData={state.history.map(h=>h.avgOcc)} sparkColor={m.avgOcc>0.85?T.grn:T.amb} />
        <MetricCell label="GRI p.a." value={fmtM(m.totalGRI)} sparkData={state.history.map(h=>h.totalGRI)} sparkColor={T.grn} />
        <MetricCell label="NOI p.a." value={fmtM(m.noi)} color={m.noi < 0 ? "#c04040" : T.grn} sparkData={state.history.map(h=>h.noi)} sparkColor={m.noi<0?T.red:T.grn} />
        <MetricCell label="NOI Yield" value={fmtP(m.noiYield)} color={m.noiYield < 0 ? "#c04040" : undefined} sparkData={state.history.map(h=>h.noiYield)} sparkColor={m.noiYield<0?T.red:T.acc} />
        <MetricCell label="Avg WALT" value={m.avgWALT.toFixed(1)+"yr"} sparkData={state.history.map(h=>h.avgWALT)} sparkColor={T.amb} />
      </div>

      <div style={S.main}>
        <div style={S.lp}>
          <div style={S.tabs}>
            {[
              {id:"portfolio",label:"Portfolio ("+state.portfolio.length+")",accent:"#8a9aaa"},
              {id:"acquire",label:"Acquire ("+state.acquisitions.length+")",accent:"#5a9a6a"},
              {id:"develop",label:"Develop ("+state.devSites.length+")",accent:"#6a8a9a"},
              {id:"team",label:"Team",accent:"#a08840"},
              {id:"markets",label:"Markets",accent:"#7a8abf"}
            ].map(t => (
              <button key={t.id} style={tabSt(tab===t.id, t.accent)} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "portfolio" && (
            <>
              <div style={{ display:"flex",gap:"10px",marginBottom:"10px",alignItems:"stretch" }}>
                <div style={{ flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:"4px",padding:"12px 14px",display:"flex",flexDirection:"column",justifyContent:"center",gap:"8px" }}>
                  <div style={{ fontSize:"10px",fontWeight:800,color:T.wht,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px" }}>Portfolio P&L</div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"10px",color:"#b0b8c4",fontWeight:600 }}>Gross Rental Income</span><span style={{ fontSize:"11px",fontWeight:700,color:T.grn }}>{fmtM(m.totalGRI)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"10px",color:"#b0b8c4",fontWeight:600 }}>Property Opex (irrecoverable)</span><span style={{ fontSize:"11px",fontWeight:700,color:"#c06060" }}>({fmtM(m.totalPropCosts)})</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:"10px" }}><span style={{ fontSize:"9px",color:"#8a90a0" }}>Void rates + SC shortfall</span><span style={{ fontSize:"10px",fontWeight:600,color:"#c09050" }}>{fmtK(m.totalVoidCost)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:"10px" }}><span style={{ fontSize:"9px",color:"#8a90a0" }}>Maintenance drag</span><span style={{ fontSize:"10px",fontWeight:600,color:"#9098a8" }}>{fmtK(m.totalMaintDrag||0)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"4px",marginTop:"4px" }}><span style={{ fontSize:"10px",color:T.wht,fontWeight:700 }}>Net Property Income</span><span style={{ fontSize:"11px",fontWeight:800,color:m.totalNPI < 0 ? "#d05050" : "#6aba7a" }}>{fmtM(m.totalNPI)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"10px",color:"#b0b8c4",fontWeight:600 }}>G&A (team salaries)</span><span style={{ fontSize:"11px",fontWeight:700,color:"#c06060" }}>({fmtK(m.gaExp||0)})</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.10)",paddingTop:"4px",marginTop:"4px",background:"rgba(255,255,255,0.03)",margin:"4px -6px 0",padding:"5px 6px",borderRadius:"3px" }}><span style={{ fontSize:"10px",color:T.wht,fontWeight:800 }}>NOI</span><span style={{ fontSize:"12px",fontWeight:900,color:m.noi < 0 ? "#d05050" : "#6aba7a" }}>{fmtM(m.ebitda||0)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:"5px" }}><span style={{ fontSize:"10px",color:"#b0b8c4",fontWeight:600 }}>Depreciation</span><span style={{ fontSize:"10px",fontWeight:600,color:"#c06060" }}>({fmtK(m.depreciation||0)})</span></div>
                  {m.debtInterest > 0 && <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"10px",color:"#b0b8c4",fontWeight:600 }}>Debt interest</span><span style={{ fontSize:"10px",fontWeight:600,color:"#c06060" }}>({fmtK(m.debtInterest)})</span></div>}
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"3px",marginTop:"3px" }}><span style={{ fontSize:"10px",color:"#c0c8d4",fontWeight:700 }}>Earnings Before Tax</span><span style={{ fontSize:"11px",fontWeight:800,color:(m.ebt||0) < 0 ? "#d05050" : "#d0d8e0" }}>{fmtM(m.ebt||0)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"10px",color:"#b0b8c4",fontWeight:600 }}>Tax (20%)</span><span style={{ fontSize:"10px",fontWeight:600,color:"#9098a8" }}>({fmtK(m.tax||0)})</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.10)",paddingTop:"4px",marginTop:"4px",background:"rgba(255,255,255,0.03)",margin:"4px -6px 0",padding:"6px 6px",borderRadius:"3px" }}><span style={{ fontSize:"10px",color:T.wht,fontWeight:900 }}>Net Income</span><span style={{ fontSize:"13px",fontWeight:900,color:(m.netIncome||0) < 0 ? "#d05050" : "#6aba7a" }}>{fmtM(m.netIncome||0)}</span></div>
                  <div style={{ marginTop:"8px" }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><span style={{ fontSize:"10px",color:"#b0b8c4",fontWeight:600 }}>Avg Occupancy</span><span style={{ fontSize:"13px",fontWeight:800,color:m.avgOcc>0.85?T.grn:m.avgOcc>0.6?T.amb:T.red }}>{fmtP(m.avgOcc)}</span></div><div style={{ width:"100%",height:"4px",background:T.bdr,borderRadius:"2px",marginTop:"3px" }}><div style={{ height:"100%",width:(m.avgOcc*100)+"%",background:m.avgOcc>0.85?T.grn:m.avgOcc>0.6?T.amb:T.red,borderRadius:"2px",transition:"width 0.4s" }} /></div></div>
                </div>
                <div style={{ width:"220px",flexShrink:0,display:"flex",flexDirection:"column",gap:"6px" }}><EuropeMap portfolio={state.portfolio} />
                  {(() => {
                    const opAssets = state.portfolio.filter(a => !a.developing).length;
                    const amCount = state.team?.assetMgmt || 0;
                    const ratio = amCount > 0 ? opAssets / amCount : opAssets > 0 ? Infinity : 0;
                    const isStrained = ratio > 4;
                    const roles = TEAM_ROLES.map(r => ({ ...r, count: state.team?.[r.id] || 0 })).filter(r => r.count > 0);
                    const totalHC = roles.reduce((a, r) => a + r.count, 0);
                    return (
                      <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid "+(isStrained?"rgba(160,64,64,0.25)":"rgba(255,255,255,0.06)"),borderRadius:"4px",padding:"6px 8px" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px" }}>
                          <span style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase" }}>Team ({totalHC})</span>
                          <span style={{ fontSize:"9px",fontWeight:700,color:isStrained?T.red:T.grn }}>{amCount} AM : {opAssets} assets</span>
                        </div>
                        {roles.map(r => (
                          <div key={r.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1px 0" }}>
                            <span style={{ fontSize:"9px",color:T.txtD }}>{r.name}</span>
                            <span style={{ fontSize:"10px",fontWeight:700,color:T.txt }}>{r.count}</span>
                          </div>
                        ))}
                        {totalHC === 0 && <div style={{ fontSize:"9px",color:T.red,textAlign:"center",padding:"2px 0" }}>No team — hire via Team tab</div>}
                        {isStrained && <div style={{ marginTop:"4px",padding:"3px 6px",background:"rgba(160,64,64,0.06)",border:"1px solid rgba(160,64,64,0.15)",borderRadius:"3px",fontSize:"8px",color:T.red,lineHeight:1.4 }}>AMs overstretched ({ratio === Infinity ? "no AMs" : ratio.toFixed(1)+" assets/AM"})</div>}
                      </div>
                    );
                  })()}
                </div>
              </div>
              {!state.portfolio.length && <div style={S.empty}>No assets yet. Go to Acquire.</div>}
              {state.portfolio.length > 0 && (
                <>
                  <div style={{ display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px",flexWrap:"wrap" }}>
                    <span style={{ fontSize:"9px",color:T.txtM,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>Sort by</span>
                    {[{id:"distressed",label:"Distressed first"},{id:"npi",label:"NPI"},{id:"occupancy",label:"Occupancy"},{id:"walt",label:"WALT"},{id:"gav",label:"GAV"},{id:"condition",label:"Condition"}].map(s => (
                      <button key={s.id} onClick={() => setPortSort(s.id)} style={{ padding:"3px 8px",fontSize:"9px",fontWeight:600,fontFamily:"inherit",borderRadius:"3px",cursor:"pointer",border:portSort===s.id?"1px solid "+T.acc:"1px solid rgba(255,255,255,0.08)",background:portSort===s.id?"rgba(138,154,170,0.08)":"transparent",color:portSort===s.id?T.hiAcc:T.txtD }}>{s.label}</button>
                    ))}
                  </div>
                  {(() => {
                    const sorted = [...state.portfolio];
                    const condVal = c => c==="C"?0:c==="B"?1:2;
                    if (portSort === "distressed") { sorted.sort((a,b) => { const aS = (a.developing?100:0)+(a.urgentIssue?-50:0)+(a.occupancy<0.5?-40:0)+(a.condition==="C"?-30:0)+(a.leaseRemaining<=0&&!a.developing?-20:0); const bS = (b.developing?100:0)+(b.urgentIssue?-50:0)+(b.occupancy<0.5?-40:0)+(b.condition==="C"?-30:0)+(b.leaseRemaining<=0&&!b.developing?-20:0); return aS - bS; }); }
                    else if (portSort === "npi") { sorted.sort((a,b) => { if (a.developing&&!b.developing) return 1; if (!a.developing&&b.developing) return -1; return (a.developing?0:calcAssetCosts(a).netPropertyIncome) - (b.developing?0:calcAssetCosts(b).netPropertyIncome); }); }
                    else if (portSort === "occupancy") { sorted.sort((a,b) => { if (a.developing&&!b.developing) return 1; if (!a.developing&&b.developing) return -1; return a.occupancy - b.occupancy; }); }
                    else if (portSort === "walt") { sorted.sort((a,b) => { if (a.developing&&!b.developing) return 1; if (!a.developing&&b.developing) return -1; return a.leaseRemaining - b.leaseRemaining; }); }
                    else if (portSort === "gav") { sorted.sort((a,b) => (b.developing?b.devCostSoFar||0:b.value) - (a.developing?a.devCostSoFar||0:a.value)); }
                    else if (portSort === "condition") { sorted.sort((a,b) => { if (a.developing&&!b.developing) return 1; if (!a.developing&&b.developing) return -1; return condVal(a.condition) - condVal(b.condition); }); }
                    return sorted.map(a => <AssetCard key={a.id} asset={a} onMaint={onMaint} onDispose={onDispose} onFix={onFix} />);
                  })()}
                </>
              )}
            </>
          )}
          {tab === "acquire" && (() => {
            const filtered = state.acquisitions.filter(a => { if (acqFilter.market !== "all" && a.market !== acqFilter.market) return false; if (acqFilter.assetClass !== "all" && a.assetClass !== acqFilter.assetClass) return false; return true; });
            const acqMarkets = [...new Set(state.acquisitions.map(a => a.market))];
            const acqACs = [...new Set(state.acquisitions.map(a => a.assetClass))];
            const selSt = { padding:"4px 6px",fontSize:"9px",fontFamily:"inherit",background:"#06080a",color:T.txt,border:"1px solid rgba(255,255,255,0.1)",borderRadius:"3px",cursor:"pointer" };
            return (<>
              <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px",flexWrap:"wrap" }}>
                <span style={{ fontSize:"9px",color:T.txtM,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>Filter</span>
                <select value={acqFilter.market} onChange={e => setAcqFilter(p => ({...p, market:e.target.value}))} style={selSt}><option value="all">All Markets ({state.acquisitions.length})</option>{acqMarkets.map(mId => { const mk = MARKETS.find(x=>x.id===mId); return <option key={mId} value={mId}>{mk?.name} ({state.acquisitions.filter(a=>a.market===mId).length})</option>; })}</select>
                <select value={acqFilter.assetClass} onChange={e => setAcqFilter(p => ({...p, assetClass:e.target.value}))} style={selSt}><option value="all">All Types</option>{acqACs.map(acId => { const ac = ASSET_CLASSES.find(x=>x.id===acId); return <option key={acId} value={acId}>{ac?.name} ({state.acquisitions.filter(a=>a.assetClass===acId).length})</option>; })}</select>
                {(acqFilter.market !== "all" || acqFilter.assetClass !== "all") && <button onClick={() => setAcqFilter({market:"all",assetClass:"all"})} style={{ padding:"3px 8px",fontSize:"9px",fontFamily:"inherit",background:"transparent",color:T.txtD,border:"1px solid rgba(255,255,255,0.08)",borderRadius:"3px",cursor:"pointer" }}>Clear</button>}
                <span style={{ fontSize:"9px",color:T.txtM,marginLeft:"auto" }}>{filtered.length} of {state.acquisitions.length}</span>
              </div>
              {!filtered.length && <div style={S.empty}>No assets match filters.</div>}
              {filtered.map(a => <AcqCard key={a.id} asset={a} onAcquire={onAcquire} ok={state.cash >= a.askPrice} />)}
            </>);
          })()}
          {tab === "develop" && (() => {
            const filtered = state.devSites.filter(s => { if (devFilter.market !== "all" && s.market !== devFilter.market) return false; if (devFilter.assetClass !== "all" && s.assetClass !== devFilter.assetClass) return false; return true; });
            const devMarkets = [...new Set(state.devSites.map(s => s.market))];
            const devACs = [...new Set(state.devSites.map(s => s.assetClass))];
            const selSt = { padding:"4px 6px",fontSize:"9px",fontFamily:"inherit",background:"#06080a",color:T.txt,border:"1px solid rgba(255,255,255,0.1)",borderRadius:"3px",cursor:"pointer" };
            return (<>
              <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px",flexWrap:"wrap" }}>
                <span style={{ fontSize:"9px",color:T.txtM,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>Filter</span>
                <select value={devFilter.market} onChange={e => setDevFilter(p => ({...p, market:e.target.value}))} style={selSt}><option value="all">All Markets ({state.devSites.length})</option>{devMarkets.map(mId => { const mk = MARKETS.find(x=>x.id===mId); return <option key={mId} value={mId}>{mk?.name} ({state.devSites.filter(s=>s.market===mId).length})</option>; })}</select>
                <select value={devFilter.assetClass} onChange={e => setDevFilter(p => ({...p, assetClass:e.target.value}))} style={selSt}><option value="all">All Types</option>{devACs.map(acId => { const ac = ASSET_CLASSES.find(x=>x.id===acId); return <option key={acId} value={acId}>{ac?.name} ({state.devSites.filter(s=>s.assetClass===acId).length})</option>; })}</select>
                {(devFilter.market !== "all" || devFilter.assetClass !== "all") && <button onClick={() => setDevFilter({market:"all",assetClass:"all"})} style={{ padding:"3px 8px",fontSize:"9px",fontFamily:"inherit",background:"transparent",color:T.txtD,border:"1px solid rgba(255,255,255,0.08)",borderRadius:"3px",cursor:"pointer" }}>Clear</button>}
                <span style={{ fontSize:"9px",color:T.txtM,marginLeft:"auto" }}>{filtered.length} of {state.devSites.length}</span>
              </div>
              {!filtered.length && <div style={S.empty}>No sites match filters.</div>}
              {filtered.map(s => <DevCard key={s.id} site={s} onDev={onDev} ok={state.cash >= s.devCost} />)}
            </>);
          })()}
          {tab === "team" && (<><TeamPanel team={state.team} onHire={onHire} onFire={onFire} />{(state.team?.treasury||0) >= 1 && <div style={{ marginTop:"12px" }}><div style={S.sec}>Debt Financing</div><FinancingPanel state={state} onDrawDebt={onDrawDebt} onRepayDebt={onRepayDebt} /></div>}</>)}
          {tab === "markets" && <MarketIntelPanel marketData={state.marketData} />}
        </div>

        <div style={S.rp}>
          <div style={S.tabs}>
            {[
              {id:"sentiment",accent:"#a08840"},
              {id:"charts",accent:"#5a9a6a"},
              {id:"events",accent:"#7a8abf"}
            ].map(t => {
              const biCount = state.team?.bi || 0;
              const label = t.id==="sentiment" ? "Board" : t.id==="charts" ? (biCount > 0 ? "Charts ("+biCount+")" : "Charts [locked]") : "Events";
              return <button key={t.id} style={tabSt(rTab===t.id, t.accent)} onClick={() => setRTab(t.id)}>{label}</button>;
            })}
          </div>

          {rTab === "sentiment" && (() => {
            const { sentiments, boardComments } = genSentiment(m, state.history, state);
            const bScore = calcBoardScore(m, state);
            const scoreColor = bScore >= 65 ? T.grn : bScore >= 35 ? T.amb : T.red;
            const scoreLabel = bScore >= 75 ? "EXCELLENT" : bScore >= 60 ? "STRONG" : bScore >= 45 ? "DEVELOPING" : bScore >= 25 ? "WEAK" : "CRITICAL";
            return (
              <div>
                <div style={{ ...S.card, marginBottom:"10px", padding:"18px 14px", background:scoreColor+"10", border:"1px solid "+scoreColor+"30" }}>
                  <InvestorGauge score={bScore} color={scoreColor} label={scoreLabel} />
                </div>
                {irr !== null && (
                  <div style={{ ...S.card, background:irr>0.10?T.grnD:irr>0.05?T.ambD:T.redD, border:"1px solid "+(irr>0.10?T.grn:irr>0.05?T.amb:T.red), marginBottom:"10px", textAlign:"center" }}>
                    <div style={{ fontSize:"9px",color:irr>0.10?T.grn:irr>0.05?T.amb:T.red,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>Portfolio IRR</div>
                    <div style={{ fontSize:"22px",fontWeight:800,color:irr>0.10?T.grn:irr>0.05?T.amb:T.red }}>{fmtP(irr)}</div>
                    <div style={{ fontSize:"9px",color:T.txtD }}>Target: 10-12% net · {(state.quarter/4).toFixed(1)}yr</div>
                  </div>
                )}
                <div style={S.sec}>Investor Sentiment</div>
                {sentiments.map((s, i) => (
                  <div key={i} style={{ ...S.card, padding:"8px 12px", marginBottom:"6px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px" }}><span style={{ fontSize:"11px",fontWeight:700,color:T.txt }}>{s.metric}</span><SentBadge mood={s.mood} label={s.label} /></div>
                    <div style={{ fontSize:"10px",color:T.txtD,lineHeight:1.4 }}>{s.comment}</div>
                  </div>
                ))}
                <div style={{ ...S.sec, marginTop:"14px" }}>Board Commentary</div>
                {boardComments.map((b, i) => (
                  <div key={i} style={{ ...S.card, padding:"8px 12px", marginBottom:"6px", borderLeft:"3px solid "+T.acc }}>
                    <div style={{ fontSize:"9px",color:T.hiAcc,fontWeight:600,marginBottom:"3px",textTransform:"uppercase",letterSpacing:"0.05em" }}>{b.member}</div>
                    <div style={{ fontSize:"10px",color:T.txt,lineHeight:1.5,fontStyle:"italic" }}>{b.text}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {rTab === "charts" && (() => {
            const biCount = state.team?.bi || 0;
            const allCharts = [{l:"Portfolio GAV",k:"totalGAV",c:T.acc,f:fmtM},{l:"Occupancy",k:"avgOcc",c:T.grn,f:fmtP},{l:"NOI p.a.",k:"noi",c:T.grn,f:fmtM},{l:"Cash",k:"cash",c:T.amb,f:fmtM}];
            if (biCount === 0) return (<div style={{ textAlign:"center",padding:"32px 20px" }}><div style={{ fontSize:"14px",fontWeight:700,color:T.wht,marginBottom:"6px" }}>Charts Locked</div><div style={{ fontSize:"11px",color:T.txtD,lineHeight:1.6,marginBottom:"16px" }}>Hire a <span style={{ color:T.hiAcc,fontWeight:700 }}>Business Intelligence</span> analyst to unlock data views.</div><div style={{ fontSize:"10px",color:T.txtM }}>Team tab → Business Intelligence</div></div>);
            const visibleCharts = allCharts.slice(0, biCount);
            const lockedCount = allCharts.length - biCount;
            return (
              <div>
                {state.history.length < 2 ? <div style={S.empty}>Advance a few quarters to see data.</div> : visibleCharts.map(ch => {
                  const latestVal = state.history[state.history.length-1]?.[ch.k]||0;
                  const isNegative = latestVal < 0;
                  return (<div key={ch.k}><div style={S.sec}>{ch.l}</div><div style={{ ...S.card, padding:"8px 12px", marginBottom:"7px", border:isNegative?"1px solid rgba(160,64,64,0.3)":"1px solid "+T.bdr }}><div style={{ display:"flex",justifyContent:"space-between",marginBottom:"4px" }}><span style={{ fontSize:"10px",color:T.txtD }}>{ch.l}</span><span style={{ fontSize:"14px",fontWeight:800,color:isNegative?"#c04040":T.wht }}>{ch.f(latestVal)}</span></div><Spark data={state.history.map(h => h[ch.k])} color={isNegative?T.red:ch.c} height={48} /></div></div>);
                })}
                {lockedCount > 0 && <div style={{ ...S.card, textAlign:"center",padding:"12px",opacity:0.5,borderStyle:"dashed" }}><span style={{ fontSize:"10px",color:T.txtM }}>{lockedCount} more chart{lockedCount>1?"s":""} locked — hire more BI analysts</span></div>}
              </div>
            );
          })()}

          {rTab === "events" && (<div style={S.evLog}>{!state.events.length && <div style={S.empty}>Advance to begin.</div>}{[...state.events].reverse().map((e, i) => <div key={i} style={S.evItem}>{e}</div>)}</div>)}
        </div>
      </div>
    </div>
  );
}
