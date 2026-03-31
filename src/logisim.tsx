import { useState, useCallback, useEffect, useRef } from "react";

/* ===== DATA ===== */
const MARKETS = [
  { id:"uk",name:"United Kingdom",flag:"\u{1F1EC}\u{1F1E7}",city:"London",baseRent:75,capRate:4.8,demand:0.85 },
  { id:"de",name:"Germany",flag:"\u{1F1E9}\u{1F1EA}",city:"Frankfurt",baseRent:52,capRate:4.2,demand:0.80 },
  { id:"fr",name:"France",flag:"\u{1F1EB}\u{1F1F7}",city:"Paris",baseRent:58,capRate:4.5,demand:0.75 },
  { id:"pl",name:"Poland",flag:"\u{1F1F5}\u{1F1F1}",city:"Warsaw",baseRent:42,capRate:6.5,demand:0.90 },
  { id:"nl",name:"Netherlands",flag:"\u{1F1F3}\u{1F1F1}",city:"Amsterdam",baseRent:68,capRate:4.0,demand:0.82 },
  { id:"cz",name:"Czech Republic",flag:"\u{1F1E8}\u{1F1FF}",city:"Prague",baseRent:48,capRate:5.8,demand:0.78 },
  { id:"es",name:"Spain",flag:"\u{1F1EA}\u{1F1F8}",city:"Madrid",baseRent:50,capRate:5.2,demand:0.72 },
  { id:"se",name:"Sweden",flag:"\u{1F1F8}\u{1F1EA}",city:"Stockholm",baseRent:62,capRate:4.3,demand:0.70 },
  { id:"it",name:"Italy",flag:"\u{1F1EE}\u{1F1F9}",city:"Milan",baseRent:46,capRate:5.5,demand:0.68 },
  { id:"be",name:"Belgium",flag:"\u{1F1E7}\u{1F1EA}",city:"Brussels",baseRent:55,capRate:4.6,demand:0.76 },
  { id:"at",name:"Austria",flag:"\u{1F1E6}\u{1F1F9}",city:"Vienna",baseRent:50,capRate:4.9,demand:0.74 },
  { id:"dk",name:"Denmark",flag:"\u{1F1E9}\u{1F1F0}",city:"Copenhagen",baseRent:64,capRate:4.1,demand:0.72 },
  { id:"tr",name:"Turkey",flag:"\u{1F1F9}\u{1F1F7}",city:"Istanbul",baseRent:28,capRate:8.5,demand:0.92 },
  { id:"ro",name:"Romania",flag:"\u{1F1F7}\u{1F1F4}",city:"Bucharest",baseRent:34,capRate:7.8,demand:0.88 },
  { id:"hu",name:"Hungary",flag:"\u{1F1ED}\u{1F1FA}",city:"Budapest",baseRent:38,capRate:7.0,demand:0.86 },
  { id:"gr",name:"Greece",flag:"\u{1F1EC}\u{1F1F7}",city:"Athens",baseRent:32,capRate:7.2,demand:0.65 },
  { id:"pt",name:"Portugal",flag:"\u{1F1F5}\u{1F1F9}",city:"Lisbon",baseRent:40,capRate:5.9,demand:0.70 },
  { id:"ie",name:"Ireland",flag:"\u{1F1EE}\u{1F1EA}",city:"Dublin",baseRent:60,capRate:4.4,demand:0.78 },
  { id:"sk",name:"Slovakia",flag:"\u{1F1F8}\u{1F1F0}",city:"Bratislava",baseRent:36,capRate:6.8,demand:0.82 },
  { id:"hr",name:"Croatia",flag:"\u{1F1ED}\u{1F1F7}",city:"Zagreb",baseRent:30,capRate:7.5,demand:0.60 },
  { id:"bg",name:"Bulgaria",flag:"\u{1F1E7}\u{1F1EC}",city:"Sofia",baseRent:26,capRate:8.2,demand:0.72 },
  { id:"fi",name:"Finland",flag:"\u{1F1EB}\u{1F1EE}",city:"Helsinki",baseRent:54,capRate:4.7,demand:0.68 },
  { id:"no",name:"Norway",flag:"\u{1F1F3}\u{1F1F4}",city:"Oslo",baseRent:70,capRate:4.0,demand:0.66 },
  { id:"rs",name:"Serbia",flag:"\u{1F1F7}\u{1F1F8}",city:"Belgrade",baseRent:24,capRate:8.8,demand:0.74 },
];

const ASSET_CLASSES = [
  { id:"bigbox",    name:"Big Box / Distribution", icon:"\u{1F4E6}", tileColor:"#eab308", tileDark:"#713f12", rentMult:1.0, capRateMult:1.0, riskFactor:0.05, demandMult:1.0, scPerSqm:18, insurancePerSqm:3, ratesPerSqm:12, maintPerSqm:5 },
  { id:"lastmile",  name:"Last Mile / Urban",       icon:"\u{1F3D9}\uFE0F", tileColor:"#a16207", tileDark:"#451a03", rentMult:1.35,capRateMult:0.85,riskFactor:0.08,demandMult:1.1, scPerSqm:24, insurancePerSqm:4, ratesPerSqm:18, maintPerSqm:7 },
  { id:"fulfilment",name:"Fulfilment Centre",        icon:"\u{1F6D2}", tileColor:"#16a34a", tileDark:"#052e16", rentMult:1.15,capRateMult:0.95,riskFactor:0.07,demandMult:1.05, scPerSqm:22, insurancePerSqm:3.5, ratesPerSqm:14, maintPerSqm:6 },
  { id:"datactr",   name:"Data Centre",              icon:"\u{1F5A5}\uFE0F", tileColor:"#db2777", tileDark:"#500724", rentMult:2.2, capRateMult:0.7, riskFactor:0.15,demandMult:0.7, scPerSqm:45, insurancePerSqm:8, ratesPerSqm:20, maintPerSqm:15 },
  { id:"coldstor",  name:"Cold Storage",             icon:"\u2744\uFE0F", tileColor:"#0ea5e9", tileDark:"#082f49", rentMult:1.5, capRateMult:0.9, riskFactor:0.10,demandMult:0.75, scPerSqm:35, insurancePerSqm:5, ratesPerSqm:14, maintPerSqm:12 },
  { id:"multilet",  name:"Multi-Let Industrial",     icon:"\u{1F3ED}", tileColor:"#dc2626", tileDark:"#450a0a", rentMult:0.9, capRateMult:1.1, riskFactor:0.04,demandMult:0.95, scPerSqm:15, insurancePerSqm:2.5, ratesPerSqm:10, maintPerSqm:4 },
  { id:"crossdock", name:"Cross-Dock Terminal",      icon:"\u{1F69B}", tileColor:"#ea580c", tileDark:"#431407", rentMult:1.1, capRateMult:0.92,riskFactor:0.06,demandMult:1.02, scPerSqm:20, insurancePerSqm:3, ratesPerSqm:12, maintPerSqm:6 },
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
  { id:"transactions",name:"Transactions",icon:"\u{1F91D}",salaryCost:120000,desc:"Better deal discovery, lower asking prices" },
  { id:"assetMgmt",name:"Asset Management",icon:"\u{1F527}",salaryCost:100000,desc:"Better occupancy, faster lease-up" },
  { id:"portfolioMgmt",name:"Portfolio Management",icon:"\u{1F4CA}",salaryCost:130000,desc:"Strategic oversight, risk monitoring" },
  { id:"bi",name:"Business Intelligence",icon:"\u{1F4C8}",salaryCost:110000,desc:"Each analyst hired unlocks one additional data view" },
  { id:"treasury",name:"Treasury",icon:"\u{1F3E6}",salaryCost:140000,desc:"Reduces financing costs; first hire unlocks debt markets" },
  { id:"esg",name:"ESG & Sustainability",icon:"\u{1F33F}",salaryCost:105000,desc:"Improves EPC rating speed, attracts premium tenants" },
];

const DEBT_TYPES = [
  { id:"senior",name:"Senior Secured",icon:"\u{1F3DB}\uFE0F",spread:1.5,ltv:0.60,desc:"Standard institutional senior lending against portfolio GAV" },
  { id:"green",name:"Green Bond",icon:"\u{1F331}",spread:1.0,ltv:0.55,desc:"ESG-linked green finance — lower spread, requires EPC B+ average" },
  { id:"mezz",name:"Mezzanine",icon:"\u{1F4CA}",spread:3.5,ltv:0.75,desc:"Higher leverage tranche — expensive but unlocks more capital" },
  { id:"sovereign",name:"Sovereign / EIB",icon:"\u{1F1EA}\u{1F1FA}",fixedRate:3.2,ltv:0.50,desc:"Fixed-rate European sovereign debt — cheapest, conservative LTV" },
];
const BASE_RATE = 3.0;

const MEGA_ASSET_DEFS = [
  { name:"Tesla Gigafactory Hub",assetClass:"bigbox",glaRange:[280000,420000],rentMultBonus:1.4,icon:"\u26A1",desc:"EV mega-campus logistics" },
  { name:"Amazon Prime Central",assetClass:"fulfilment",glaRange:[350000,500000],rentMultBonus:1.3,icon:"\u{1F4E6}",desc:"Hyper-scale fulfilment" },
  { name:"IKEA Mega Distribution",assetClass:"bigbox",glaRange:[200000,320000],rentMultBonus:1.2,icon:"\u{1F6CD}\uFE0F",desc:"Big-box retail logistics" },
  { name:"Microsoft Azure Campus",assetClass:"datactr",glaRange:[60000,120000],rentMultBonus:2.5,icon:"\u{1F9CA}",desc:"Hyperscale data centre" },
  { name:"DHL SuperHub Gateway",assetClass:"crossdock",glaRange:[180000,300000],rentMultBonus:1.35,icon:"\u2708\uFE0F",desc:"International air-freight gateway" },
  { name:"Maersk Global Port DC",assetClass:"fulfilment",glaRange:[250000,380000],rentMultBonus:1.25,icon:"\u{1F6A2}",desc:"Port-side mega distribution" },
  { name:"Lidl Cold Mega Hub",assetClass:"coldstor",glaRange:[120000,200000],rentMultBonus:1.5,icon:"\u2744\uFE0F",desc:"National cold-chain backbone" },
  { name:"Trendyol Eurasia Hub",assetClass:"fulfilment",glaRange:[200000,350000],rentMultBonus:1.3,icon:"\u{1F30D}",desc:"Cross-border e-commerce mega hub" },
  { name:"Google DC Nordics",assetClass:"datactr",glaRange:[80000,150000],rentMultBonus:2.3,icon:"\u{1F5A5}\uFE0F",desc:"Nordic hyperscale data centre" },
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
const fmtM = (n) => (n < 0 ? "-" : "") + "\u20AC" + (Math.abs(n) / 1e6).toFixed(1) + "m";
const fmtK = (n) => (n < 0 ? "-" : "") + "\u20AC" + (Math.abs(n) / 1e3).toFixed(0) + "k";
const fmtP = (n) => (n * 100).toFixed(1) + "%";
const getTI = (n) => TENANT_DB[n] || { credit:"NR",revenue:"N/A",employees:"N/A",sector:"Unknown",insolvencyRisk:0.10 };
const credCol = (c) => (c.startsWith("AA")||c==="A+"||c==="A") ? "#10b981" : (c.startsWith("BBB")||c==="A-") ? "#f59e0b" : "#ef4444";

/* ===== PROPERTY COST MODEL ===== */
/*
  Per asset, per annum:
  - Service Charge (SC): scPerSqm * totalGLA — recoverable from tenants pro rata occupancy
  - Insurance: insurancePerSqm * totalGLA — landlord pays on whole building
  - Rates (empty): ratesPerSqm * vacantGLA — landlord liable on void units (after 3-month grace)
  - Maintenance drag: maintPerSqm * totalGLA — scales with condition (A=0.6x, B=1x, C=1.5x)
  - Management fee: 3% of GRI (property manager)
  
  Recoverable = SC * occupancy (tenants pay their share)
  Irrecoverable = SC * (1 - occupancy) + Insurance + Void Rates + Maint drag + Mgmt fee
  
  NOI = GRI - Irrecoverable costs - G&A (team salaries)
*/

function calcAssetCosts(asset, ac) {
  if (!ac) ac = ASSET_CLASSES.find(x => x.id === asset.assetClass) || ASSET_CLASSES[0];
  const gla = asset.gla;
  const occ = asset.occupancy;
  const vacantGla = gla * (1 - occ);
  
  // Service charge — tenants pay their share, landlord eats the void portion
  const totalSC = ac.scPerSqm * gla;
  const recoveredSC = totalSC * occ;
  const irrecoverableSC = totalSC - recoveredSC;
  
  // Insurance — landlord pays on whole building regardless
  const insurance = ac.insurancePerSqm * gla;
  
  // Void rates — landlord pays rates on empty space
  const voidRates = ac.ratesPerSqm * vacantGla;
  
  // Maintenance drag — condition-dependent
  const condMult = asset.condition === "A" ? 0.6 : asset.condition === "B" ? 1.0 : 1.5;
  const issueMult = asset.urgentIssue ? 1.4 : 1.0;
  const maintDrag = ac.maintPerSqm * gla * condMult * issueMult;
  
  // Property management fee — % of rent collected
  const mgmtFee = asset.gri * 0.03;
  
  const totalRecoverable = recoveredSC;
  const totalIrrecoverable = irrecoverableSC + insurance + voidRates + maintDrag + mgmtFee;
  
  return {
    totalSC,
    recoveredSC,
    irrecoverableSC,
    insurance,
    voidRates,
    maintDrag,
    mgmtFee,
    totalRecoverable,
    totalIrrecoverable,
    netPropertyIncome: asset.gri - totalIrrecoverable,
  };
}

/* ===== THEME ===== */
const T = {
  bg:"#0a0f1a",card:"#111827",bdr:"#1e2a3a",acc:"#3b82f6",accD:"#1e3a5f",
  grn:"#10b981",grnD:"#064e3b",red:"#ef4444",redD:"#7f1d1d",amb:"#f59e0b",ambD:"#78350f",
  txt:"#e2e8f0",txtD:"#94a3b8",txtM:"#7c8ba3",wht:"#ffffff",
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
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <span onMouseEnter={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos({ x: r.left + r.width / 2, y: r.bottom + 6 }); setShow(true); }} onMouseLeave={() => setShow(false)} style={{ cursor:"help",borderBottom:"1px dotted "+T.txtM,position:"relative" }}>
      {children}
      {show && <span style={{ position:"fixed",left:Math.max(115,Math.min(pos.x,(typeof window!=="undefined"?window.innerWidth:1400)-115)),top:pos.y,transform:"translateX(-50%)",background:"#1e293b",color:"#e2e8f0",padding:"8px 12px",borderRadius:"6px",fontSize:"11px",lineHeight:1.5,maxWidth:"220px",zIndex:99999,boxShadow:"0 4px 16px rgba(0,0,0,0.6)",border:"1px solid #3b82f6",pointerEvents:"none",whiteSpace:"normal",letterSpacing:"0",textTransform:"none" }}>{text}</span>}
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
  const pts = data.map((v, i) => { const x = p + (i / (data.length - 1)) * (w - p * 2); const y = h - p - ((v - mn) / rng) * (h - p * 2); return x + "," + y; });
  const last = pts[pts.length - 1].split(",");
  const hasNeg = data.some(v => v < 0);
  const gId = "g" + color.replace("#", "") + (hasNeg ? "n" : "");
  return (
    <svg viewBox={"0 0 " + w + " " + h} style={{ width:"100%",height,display:"block" }}>
      <defs><linearGradient id={gId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {hasNeg && (() => { const zeroY = h - p - ((0 - mn) / rng) * (h - p * 2); return <line x1={p} y1={zeroY} x2={w-p} y2={zeroY} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.6" />; })()}
      <polygon points={[...pts, (p + (w - p * 2)) + "," + h, p + "," + h].join(" ")} fill={"url(#" + gId + ")"} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

function WHouse({ condition, gla, developing, assetClass, seed = 0 }) {
  const w = 120, h = 80;
  const ac = ASSET_CLASSES.find(a => a.id === assetClass) || ASSET_CLASSES[0];
  const tileCol = developing ? "#3b82f6" : ac.tileColor || "#64748b";
  const tileDark = developing ? "#1e3a6e" : ac.tileDark || "#1e293b";
  const wallCol = condition === "A" ? "#1e293b" : condition === "B" ? "#1c1a10" : "#1a1010";
  const wallBorder = condition === "A" ? "#334155" : condition === "B" ? "#44400a" : "#3a2020";
  const winOpacity = condition === "A" ? 0.55 : condition === "B" ? 0.3 : 0.1;
  const stripH = 22;
  const sr = Math.min(1, Math.max(0.5, gla / 50000));
  const bW = 56 + sr * 28, bH = 26 + sr * 10;
  const bx = (w - bW) / 2, by = h - bH - 6;
  const v = seed % 3;
  const dk = condition === "A" ? 4 : condition === "B" ? 3 : 2;
  const dW = (bW - 8) / dk;
  const stars = [0,1,2,3].map(i => ({ cx:(seed*13+i*31)%w, cy:4+(i*5)%(stripH-8) }));
  return (
    <svg viewBox={"0 0 "+w+" "+h} style={{ width:"100%",height:"100%",borderRadius:"6px" }}>
      <rect width={w} height={h} fill="#0d1829" />
      <rect width={w} height={stripH} fill={tileCol} />
      {stars.map((s,i) => <circle key={i} cx={s.cx} cy={s.cy} r="0.8" fill="#fff" opacity="0.18" />)}
      <text x={w/2} y={stripH-5} textAnchor="middle" fontSize="11" fontFamily="sans-serif">{ac.icon}</text>
      {developing ? (
        <>
          <line x1={bx+4} y1={stripH+2} x2={bx+4} y2={h-5} stroke="#f97316" strokeWidth="1.2" opacity="0.9" />
          <line x1={bx+bW-4} y1={stripH+2} x2={bx+bW-4} y2={h-5} stroke="#f97316" strokeWidth="1.2" opacity="0.9" />
          <line x1={bx} y1={stripH+8} x2={bx+bW} y2={stripH+8} stroke="#f97316" strokeWidth="0.8" opacity="0.7" />
          <line x1={bx} y1={stripH+16} x2={bx+bW} y2={stripH+16} stroke="#f97316" strokeWidth="0.8" opacity="0.7" />
          <rect x={bx} y={by+bH*0.5} width={bW} height={bH*0.5} fill={tileDark} stroke={tileCol} strokeWidth="0.6" strokeDasharray="3,2" opacity="0.7" />
          <text x={w/2} y={h-10} textAnchor="middle" fontSize="7" fill="#f97316" fontFamily="Inter,sans-serif" fontWeight="700">UNDER CONSTRUCTION</text>
        </>
      ) : (
        <>
          <rect x={bx} y={by} width={bW} height={bH} fill={wallCol} stroke={wallBorder} strokeWidth="0.6" rx="1" />
          {v===0 && <polygon points={`${bx},${by} ${bx+bW/2},${by-8} ${bx+bW},${by}`} fill={tileCol} opacity="0.85" />}
          {v===1 && <rect x={bx} y={by-4} width={bW} height="4" fill={tileCol} opacity="0.85" />}
          {v===2 && (<><rect x={bx} y={by-3} width={bW} height="3" fill={tileCol} opacity="0.85" /><rect x={bx+bW*0.2} y={by-7} width={bW*0.6} height="4" fill={tileCol} opacity="0.7" /></>)}
          {Array.from({length:dk}).map((_,i) => <rect key={i} x={bx+4+i*dW} y={by+bH-11} width={dW-3} height="11" fill={tileCol} opacity="0.75" rx="1" />)}
          {condition!=="C" && Array.from({length:Math.max(1,Math.floor(bW/18))}).map((_,i) => <rect key={i} x={bx+6+i*18} y={by+5} width={7} height={4} fill={tileCol} opacity={winOpacity} rx="0.8" />)}
          {condition==="A" && <circle cx={bx+bW-5} cy={by+5} r="2.5" fill="#34d399" opacity="0.9" />}
          {condition==="B" && <circle cx={bx+bW-5} cy={by+5} r="2.5" fill="#fbbf24" opacity="0.9" />}
          {condition==="C" && (<><line x1={bx+bW-8} y1={by+3} x2={bx+bW-5} y2={by+9} stroke="#f87171" strokeWidth="0.8" opacity="0.8" /><line x1={bx+bW-5} y1={by+3} x2={bx+bW-8} y2={by+9} stroke="#f87171" strokeWidth="0.8" opacity="0.8" /></>)}
        </>
      )}
    </svg>
  );
}

/* ===== EUROPE MAP ===== */
const MAP_CITY_POS = {
  uk:{x:62,y:80},de:{x:140,y:90},fr:{x:88,y:103},pl:{x:190,y:78},nl:{x:108,y:74},
  cz:{x:158,y:95},es:{x:55,y:138},se:{x:172,y:46},it:{x:144,y:119},be:{x:120,y:83},
  at:{x:172,y:106},dk:{x:148,y:63},tr:{x:248,y:130},ro:{x:210,y:112},hu:{x:186,y:104},
  gr:{x:198,y:140},pt:{x:35,y:135},ie:{x:42,y:78},sk:{x:178,y:97},hr:{x:170,y:115},
  bg:{x:215,y:122},fi:{x:195,y:32},no:{x:158,y:30},rs:{x:195,y:118},
};

function EuropeMap({ portfolio }) {
  const assetsByMkt = {};
  portfolio.forEach(a => { if (a.developing) return; if (!assetsByMkt[a.market]) assetsByMkt[a.market] = []; assetsByMkt[a.market].push(a); });
  const hexPts = (cx, cy, r) => { const pts = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 6; pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1)); } return pts.join(" "); };
  return (
    <div style={{ background:"#060e1c",border:"1px solid #1e2a3a",borderRadius:"7px",overflow:"hidden" }}>
      <div style={{ padding:"5px 8px 2px",fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{"\u{1F5FA}\uFE0F"} Portfolio Map</div>
      <svg viewBox="0 0 280 172" style={{ display:"block",width:"100%" }}>
        <rect width="280" height="172" fill="#060e1c" />
        <polygon points="22,118 24,150 55,160 78,163 108,152 140,149 158,163 175,158 198,160 228,145 240,108 222,78 245,28 200,5 175,5 140,20 115,55 135,62 148,68 112,73 92,84 70,95 65,128 45,125 Z" fill="#1a2a18" stroke="#2d4028" strokeWidth="0.8" />
        <polygon points="42,95 44,72 52,55 62,58 60,70 72,95 68,106 50,106 Z" fill="#1a2a18" stroke="#2d4028" strokeWidth="0.8" />
        <polygon points="115,55 130,20 155,5 200,5 210,25 195,50 175,60 155,65 140,70 Z" fill="#1a2a18" stroke="#2d4028" strokeWidth="0.8" />
        <polygon points="220,120 235,115 260,120 270,135 255,145 235,148 215,140 210,130 Z" fill="#1a2a18" stroke="#2d4028" strokeWidth="0.8" />
        <polygon points="30,72 38,68 46,74 44,84 36,88 28,82 Z" fill="#1a2a18" stroke="#2d4028" strokeWidth="0.8" />
        {MARKETS.map((mkt, mktIdx) => {
          const pos = MAP_CITY_POS[mkt.id];
          if (!pos) return null;
          const assets = assetsByMkt[mkt.id] || [];
          const hasAssets = assets.length > 0;
          const r = hasAssets ? 10 : 6;
          const activeColors = ["#22d3ee","#34d399","#fbbf24","#a78bfa","#f472b6","#60a5fa","#fb923c","#4ade80","#f87171","#e879f9","#38bdf8","#facc15","#f97316","#a3e635","#c084fc","#fb7185","#67e8f9","#86efac","#fde047","#d946ef","#2dd4bf","#818cf8","#f43f5e","#84cc16"];
          const ac = activeColors[mktIdx % activeColors.length];
          return (
            <g key={mkt.id}>
              {hasAssets && <polygon points={hexPts(pos.x, pos.y, r + 5)} fill={ac + "22"} stroke={ac + "55"} strokeWidth="0.5" />}
              <polygon points={hexPts(pos.x, pos.y, r)} fill={hasAssets ? ac + "33" : "#1a2030"} stroke={hasAssets ? ac : "#3a4a5a"} strokeWidth={hasAssets ? 2 : 0.5} />
              <text x={pos.x} y={pos.y + 2.8} textAnchor="middle" fontSize={hasAssets ? 7 : 5.5} fill={hasAssets ? ac : "#4a5a6a"} fontWeight="800" fontFamily="'Inter', sans-serif">{mkt.id.toUpperCase()}</text>
              {hasAssets && (
                <>
                  <circle cx={pos.x} cy={pos.y - r - 6} r="5" fill={ac} />
                  <line x1={pos.x} y1={pos.y - r - 1} x2={pos.x} y2={pos.y - r - 5} stroke={ac} strokeWidth="2" />
                  <text x={pos.x} y={pos.y - r - 3.8} textAnchor="middle" fontSize="5.5" fill="#000" fontWeight="800">{assets.length}</text>
                  <text x={pos.x} y={pos.y + r + 8} textAnchor="middle" fontSize="5" fill={ac} fontFamily="'Inter', sans-serif" fontWeight="600">{mkt.city}</text>
                </>
              )}
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
      <div style={{ flex:1,minWidth:0,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"7px",padding:"8px 12px",display:"flex",alignItems:"center",minHeight:"80px" }}>
        <div style={{ fontSize:"10px",color:T.txtD,lineHeight:1.7 }}>
          <div style={{ fontWeight:700,color:T.acc,marginBottom:"4px" }}>{"\u{1F4CB}"} Getting started</div>
          <div>{"\u{1F3E2}"} <b>Acquire</b> assets to build your portfolio</div>
          <div>{"\u{1F527}"} <b>Maintain</b> assets to protect occupancy</div>
          <div>{"\u26A0\uFE0F"} Vacant space <b>costs money</b> — rates, SC, insurance</div>
          <div>{"\u25B6\uFE0F"} Press <b>Simulate to next qtr</b> to advance time</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex:1,minWidth:0,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"7px",overflow:"hidden",maxHeight:"96px" }}>
      <div style={{ padding:"5px 10px 3px",display:"flex",alignItems:"center",gap:"5px",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize:"9px",fontWeight:700,color:T.amb,letterSpacing:"0.1em" }}>{"\u{1F4F0}"} NEWS</span>
        <span style={{ fontSize:"8px",color:T.txtM }}>{items.length}</span>
      </div>
      <div ref={ref} style={{ overflowY:"auto",maxHeight:"70px",padding:"3px 10px" }}>
        {items.slice(-8).reverse().map((n, i) => (
          <div key={i} style={{ fontSize:"10px",color:n.color||T.txtD,lineHeight:1.6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
            <span style={{ marginRight:"4px" }}>{n.icon}</span>{n.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== TENANT MODAL ===== */
function TenantModal({ candidates, assetName, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter', sans-serif" }}>
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
  let name; do { name = rFrom(ASSET_NAMES); } while (usedN.has(mkt.id + name) && usedN.size < 800);
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
  let name; do { name = rFrom(ASSET_NAMES); } while (usedN.has("d"+mkt.id+name));
  usedN.add("d"+mkt.id+name);
  const gla = ac.id === "lastmile" ? Math.round(rBetween(5,20))*1000 : Math.round(rBetween(20,70))*1000;
  return { id:"d"+aCtr, name:name+" (Dev)", market:mkt.id, marketName:mkt.name, flag:mkt.flag, assetClass:ac.id, assetClassName:ac.name, assetClassIcon:ac.icon, gla, devCost:gla*rBetween(400,800)*ac.rentMult, estRentPsm:mkt.baseRent*ac.rentMult*rBetween(1.0,1.3), estYield:mkt.capRate*ac.capRateMult*rBetween(1.05,1.25), quartersToComplete:Math.round(rBetween(3,8)) };
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

function genTenantCandidates(acId, rentPsm, epcRating, esgCount) {
  const pool = [...(TENANT_POOL[acId] || TENANT_POOL.bigbox)];
  const isGreen = (esgCount || 0) > 0 && (epcRating === "A" || epcRating === "B");
  if (isGreen) { const prems = GREEN_TENANT_BOOST[acId] || GREEN_TENANT_BOOST.bigbox; const pick = [...prems].sort(() => Math.random()-0.5).slice(0, 2); pick.forEach(t => { if (!pool.includes(t)) pool.unshift(t); }); }
  const count = 2 + Math.floor(Math.random() * 2);
  const candidates = pool.sort(() => Math.random()-0.5).slice(0, count);
  return candidates.map(name => ({ name, term: Math.round(rBetween(isGreen ? 5 : 3, isGreen ? 12 : 10)), rentPsm: rentPsm * rBetween(isGreen ? 1.0 : 0.92, isGreen ? 1.18 : 1.12) }));
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
    if (Math.abs(growth) > 0.025) { const dir = growth > 0 ? "\u2B06\uFE0F" : "\u2B07\uFE0F"; newsOut.push({ icon:dir, text:m.name+" rents "+(growth>0?"up":"down")+" "+(Math.abs(growth)*100).toFixed(1)+"% to \u20AC"+ner.toFixed(0)+"/sqm", color:growth>0?"#34d399":"#f87171" }); }
    if (Math.abs(yShock) > 0.05) { newsOut.push({ icon:"\u{1F3AF}", text:m.name+" prime yield "+(yShock>0?"expanded":"compressed")+" to "+primeYield.toFixed(2)+"%", color:yShock>0?"#f87171":"#34d399" }); }
    updated[m.id] = { ner, nerPrev:prev.ner||ner, primeYield, marketVacancy:vac, demandIndex:dem, rentalGrowthQoQ:growth, absorptionKsqm:absorption, supplyPipelineKsqm:supply };
  });
  return updated;
}

function calcBoardScore(m, state) {
  let score = 0;
  const irr = calcIRR(state.initialCash||state.cash, m.totalGAV, state.cash, state.quarter);
  if (irr !== null) score += Math.min(28, Math.max(-10, (irr / 0.12) * 28)); else score += 10;
  score += Math.min(24, m.avgOcc * 24);
  // NOI yield can be negative — punish hard
  if (m.noiYield < 0) score += Math.max(-20, m.noiYield / 0.02 * 10);
  else score += Math.min(20, (m.noiYield / 0.05) * 20);
  const esg = calcESG(state.portfolio||[]);
  score += Math.min(14, (esg / 100) * 14);
  score += Math.min(8, (m.totalGAV / 500e6) * 8);
  const totalDebt = (state.debtDrawdowns||[]).reduce((a, d) => a + d.amount, 0);
  const ltv = m.totalGAV > 0 ? totalDebt / m.totalGAV : 0;
  if (ltv > 0.7) score -= 10; else if (ltv > 0.55) score -= 4;
  // Extra penalty if NOI is negative
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
  return { id:"mg"+aCtr, name:def.name+" \u2605", market:mkt.id, marketName:mkt.name, flag:mkt.flag, assetClass:ac.id, assetClassName:ac.name, assetClassIcon:ac.icon, gla, rentPsm, occupancy:occ, tenant, leaseRemaining:Math.round(rBetween(5,15)), gri, value:val, age:Math.round(rBetween(2,10)), condition:"A", epcRating:"A", capexSpent:0, acquired:false, askPrice, developing:false, isMega:true, visualSeed:aCtr, urgentIssue:null, lastRM:0, megaIcon:def.icon, megaDesc:def.desc };
}

function initGame(cfg = {}) {
  const { companyName="NewCo", cash=150e6, startMarkets:sm=["uk","de","pl"], difficulty="guided" } = cfg;
  usedN = new Set(); aCtr = 0;
  const portfolio = [];
  if (difficulty === "guided") { const cls = ["bigbox","fulfilment","lastmile"]; sm.forEach((mId, i) => { const m = MARKETS.find(x => x.id === mId); if (m) portfolio.push(genAsset(m, cls[i % cls.length])); }); }
  const team = { transactions:1, assetMgmt:1, portfolioMgmt:1, bi:0, treasury:0, esg:0 };
  const acqM = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 16);
  const devM = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 8);
  const megaMkts = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 3);
  const megaAcq = megaMkts.map(m => genMegaAcquisition(m, 1));
  const marketData = initMarketData();
  return { companyName, quarter:1, year:2026, cash, portfolio, team, acquisitions:[...acqM.map(m => genMktAsset(m, 1)), ...megaAcq], devSites:devM.map(m => genDev(m)), history:[], events:[], newsLog:[], initialCash:cash, tenantSelection:null, marketData, debtDrawdowns:[] };
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
  
  // Proper property cost calculation
  let totalPropCosts = 0;
  let totalNPI = 0;
  let totalVoidCost = 0;
  let totalInsurance = 0;
  let totalMaintDrag = 0;
  let totalMgmtFee = 0;
  let totalRecoveredSC = 0;
  op.forEach(a => {
    const costs = calcAssetCosts(a);
    totalPropCosts += costs.totalIrrecoverable;
    totalNPI += costs.netPropertyIncome;
    totalVoidCost += costs.voidRates + costs.irrecoverableSC;
    totalInsurance += costs.insurance;
    totalMaintDrag += costs.maintDrag;
    totalMgmtFee += costs.mgmtFee;
    totalRecoveredSC += costs.recoveredSC;
  });
  
  // Other income: recovered service charge, surrender premiums (small random), dilapidations
  const scRecoveryIncome = totalRecoveredSC;
  const sundryIncome = totalGRI * 0.008; // signage, telecom masts, parking etc
  const totalOtherIncome = scRecoveryIncome + sundryIncome;
  const grossRevenue = totalGRI + totalOtherIncome;
  
  // Property operating expenses (recoverable + irrecoverable)
  const totalPropertyOpex = totalPropCosts + totalRecoveredSC; // gross SC + insurance + rates + maint + mgmt
  const netPropertyOpex = totalPropCosts; // irrecoverable portion only (net of SC recovery)
  
  const gaExp = teamQCost(team||{}) * 4;
  
  // Depreciation: ~2% of GAV p.a. for buildings (straight-line ~50yr life, excluding land ~40% of GAV)
  const buildingValue = totalGAV * 0.60; // assume 60% buildings, 40% land
  const depreciation = buildingValue * 0.02;
  
  const noi = totalNPI - gaExp; // NPI minus G&A
  const ebitda = noi + depreciation; // add back depreciation (NOI already deducts it implicitly via maint, but depreciation is non-cash)
  // Actually for RE: EBITDA = NOI (since NOI is already before depreciation and interest)
  // So: EBITDA = GRI + Other Income - Property Opex (irrecoverable) - G&A
  const ebitdaCalc = grossRevenue - netPropertyOpex - gaExp;
  
  const debtInt = (st.debtDrawdowns||[]).reduce((acc, d) => acc + d.amount * d.rate / 100, 0);
  const ebt = ebitdaCalc - depreciation - debtInt; // earnings before tax
  const taxRate = 0.20;
  const tax = ebt > 0 ? ebt * taxRate : 0;
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
  
  // Quarterly rent collection and property costs
  const op = portfolio.filter(a => !a.developing);
  let qRent = 0, qPropCosts = 0, qVoidCost = 0;
  op.forEach(a => {
    const ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0];
    const costs = calcAssetCosts(a, ac);
    qRent += a.gri / 4;
    qPropCosts += costs.totalIrrecoverable / 4;
    qVoidCost += (costs.voidRates + costs.irrecoverableSC) / 4;
  });
  const qNetPropIncome = qRent - qPropCosts;
  cash += qNetPropIncome;
  
  ev.push(ql + ": Rent " + fmtK(qRent) + ", prop costs " + fmtK(qPropCosts) + ", net " + fmtK(qNetPropIncome));
  if (qVoidCost > 50000) {
    news.push({ icon:"\u{1F4B8}", text:"Void costs: "+fmtK(qVoidCost)+" this quarter (rates + irrecoverable SC)", color:T.red });
  }
  if (qNetPropIncome < 0) {
    news.push({ icon:"\u{1F6A8}", text:"NET PROPERTY INCOME NEGATIVE this quarter: "+fmtK(qNetPropIncome), color:T.red });
  }
  
  const am = Math.min(5, team.assetMgmt||0);
  const tx = Math.min(5, team.transactions||0);
  const opAssetsCount = portfolio.filter(a => !a.developing).length;
  const amRatio = am > 0 ? opAssetsCount / am : (opAssetsCount > 0 ? 99 : 0);
  const amStrained = amRatio > 4;
  const amPenalty = amStrained ? Math.min(0.25, (amRatio - 4) * 0.04) : 0; // occupancy drift penalty
  const amIssueMult = amStrained ? Math.min(3.0, 1 + (amRatio - 4) * 0.25) : 1.0; // issue frequency multiplier
  if (amStrained) {
    news.push({ icon:"\u26A0\uFE0F", text:"Asset Mgmt overstretched ("+amRatio.toFixed(1)+" assets/AM) — occupancy & condition at risk", color:T.amb });
  }
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
        ev.push("\u{1F3D7}\uFE0F " + a.flag + " " + a.name + " completed!");
        news.push({ icon:"\u{1F3D7}\uFE0F", text:a.name + " completed — now costing you void rates until leased", color:T.amb });
      }
      return;
    }
    const mkt = MARKETS.find(m => m.id === a.market);
    const ac = ASSET_CLASSES.find(x => x.id === a.assetClass) || ASSET_CLASSES[0];
    if (a.tenant && a.leaseRemaining > 0) { const ti = getTI(a.tenant); if (Math.random() < ti.insolvencyRisk * 0.15) { ev.push("\u{1F480} "+a.flag+" "+a.name+": "+a.tenant+" INSOLVENT"); news.push({ icon:"\u{1F480}", text:a.tenant+" insolvent at "+a.name+" — void costs now accruing", color:T.red }); a.occupancy = Math.max(0, a.occupancy - rBetween(0.4, 0.7)); a.tenant = null; a.leaseRemaining = 0; } }
    if (!a.urgentIssue && Math.random() < (0.06 + ac.riskFactor * 0.3) * amIssueMult) { a.urgentIssue = { ...rFrom(ISSUES) }; ev.push("\u{1F6A8} "+a.flag+" "+a.name+": "+a.urgentIssue.name); news.push({ icon:"\u{1F6A8}", text:a.name+": "+a.urgentIssue.name+" — maint costs rising", color:T.red }); }
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
          ev.push("\u2705 "+a.flag+" "+a.name+": "+a.tenant+" renewed");
          news.push({ icon:"\u2705", text:a.tenant+" renewed at "+a.name, color:T.grn });
        } else {
          a.occupancy = Math.max(0, a.occupancy - rBetween(0.2, 0.5));
          ev.push("\u26A0\uFE0F "+a.flag+" "+a.name+": "+a.tenant+" vacated");
          news.push({ icon:"\u{1F6AA}", text:a.tenant+" vacated "+a.name+" — void costs starting", color:T.amb });
          a.tenant = null;
        }
      }
    } else if (a.occupancy < 0.7 && Math.random() < 0.25 + am * 0.05) {
      const ds = (mkt?.demand||0.5) * (ac?.demandMult||1);
      if (ds > 0.85 && !pendTS) {
        pendTS = { assetId:a.id, assetName:a.flag+" "+a.name, candidates:genTenantCandidates(a.assetClass, a.rentPsm, a.epcRating, team.esg||0) };
        news.push({ icon:"\u{1F4CB}", text:"Tenant offers for " + a.name, color:T.acc });
      } else {
        a.occupancy = Math.min(1, a.occupancy + rBetween(0.15, 0.4));
        a.tenant = rFrom(TENANT_POOL[a.assetClass]||TENANT_POOL.bigbox);
        a.leaseRemaining = Math.round(rBetween(3,7));
        ev.push("\u{1F91D} "+a.flag+" "+a.name+": Lease with "+a.tenant);
        news.push({ icon:"\u{1F91D}", text:a.tenant+" signed at "+a.name, color:T.grn });
      }
    }
    const rmGap = quarter - (a.lastRM||0);
    if (rmGap > 4 && Math.random() < 0.08 && a.condition !== "C") { a.condition = a.condition === "A" ? "B" : "C"; a.rentPsm *= 0.95; ev.push("\u{1F527} "+a.flag+" "+a.name+": Degraded to "+a.condition+" — higher maint costs"); news.push({ icon:"\u{1F4C9}", text:a.name+" degraded to Grade "+a.condition+" — maint costs up", color:T.amb }); }
    const marketYield = mktD.primeYield || (mkt?.capRate||5);
    const ecr = marketYield * (ac?.capRateMult||1);
    a.gri = a.gla * a.rentPsm * a.occupancy;
    a.value = a.gri > 0 ? a.gri / (ecr/100) : a.gla * (mkt?.baseRent||5) * 0.3 / (ecr/100);
  });

  const updatedMarketData = updateMarketData(marketData||{}, quarter, news);
  const nAcq = Math.min(18, 8 + tx + Math.floor(Math.random()*4));
  acquisitions = [...MARKETS].sort(() => Math.random()-0.5).slice(0, nAcq).map(m => genMktAsset(m, tx));
  if (quarter % 2 === 0 || Math.random() < 0.5) {
    const megaMkts = [...MARKETS].sort(() => Math.random()-0.5).slice(0, Math.random() < 0.4 ? 2 : 3);
    megaMkts.forEach(m => acquisitions.push(genMegaAcquisition(m, tx)));
  }
  devSites = [...MARKETS].sort(() => Math.random()-0.5).slice(0, 5+Math.floor(Math.random()*5)).map(m => genDev(m));
  
  // Check NOI for the quarter
  const postMetrics = calcMetrics({ portfolio, team });
  if (postMetrics.noi < 0) {
    news.push({ icon:"\u{1F534}", text:"NOI IS NEGATIVE: "+fmtM(postMetrics.noi)+" p.a. — portfolio burning cash", color:"#ff3333" });
  }
  
  if (!news.length) news.push({ icon:"\u{1F4CA}", text:"Board reviewed quarterly pack — check updated commentary", color:T.txtD });
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
  sArr.push(met.avgOcc > 0.9 ? { metric:"Occupancy",mood:"positive",label:"Excellent",comment:"Best-in-class. Push rents on reversions." } : met.avgOcc > 0.75 ? { metric:"Occupancy",mood:"neutral",label:"Acceptable",comment:"Vacancy costing "+fmtM(met.totalVoidCost)+" p.a. in void rates & SC." } : { metric:"Occupancy",mood:"negative",label:"Concerning",comment:"Void costs at "+fmtM(met.totalVoidCost)+" p.a. — bleeding cash on empty space." });
  
  // NOI sentiment — can now be negative
  if (met.noi < 0) {
    sArr.push({ metric:"NOI",mood:"negative",label:"NEGATIVE",comment:"Portfolio is cash-negative at "+fmtM(met.noi)+" p.a. Property costs exceed rental income. Immediate action required." });
  } else if (met.noiYield > 0.05) {
    sArr.push({ metric:"NOI Yield",mood:"positive",label:"Outperforming",comment:"Ahead of 5% benchmark at "+fmtP(met.noiYield)+"." });
  } else if (met.noiYield > 0.035) {
    sArr.push({ metric:"NOI Yield",mood:"neutral",label:"In-line",comment:"NOI yield "+fmtP(met.noiYield)+". Prop costs at "+fmtM(met.totalPropCosts)+" p.a." });
  } else {
    sArr.push({ metric:"NOI Yield",mood:"negative",label:"Below Target",comment:"NOI yield only "+fmtP(met.noiYield)+". Property costs "+fmtM(met.totalPropCosts)+" eating into returns." });
  }

  const esg = calcESG(state?.portfolio || []);
  sArr.push(esg > 80 ? { metric:"ESG / EPC",mood:"positive",label:"Leader",comment:"Score "+esg.toFixed(0)+"/100. Green financing advantage." } : esg > 50 ? { metric:"ESG / EPC",mood:"neutral",label:"Compliant",comment:"Score "+esg.toFixed(0)+"/100. Need net-zero pathways." } : { metric:"ESG / EPC",mood:"negative",label:"At Risk",comment:"Score "+esg.toFixed(0)+"/100. Stranding risk. Upgrade EPCs." });

  const gaExp = TEAM_ROLES.reduce((acc, r) => acc + ((state?.team||{})[r.id]||0)*r.salaryCost, 0);
  const gaR = met.totalGRI > 0 ? gaExp / met.totalGRI : 0;
  sArr.push(gaR < 0.05 ? { metric:"Recurring G&A",mood:"positive",label:"Lean",comment:"G&A at "+fmtP(gaR)+" of GRI." } : gaR < 0.12 ? { metric:"Recurring G&A",mood:"neutral",label:"Manageable",comment:"G&A at "+fmtP(gaR)+" of GRI." } : { metric:"Recurring G&A",mood:"negative",label:"Elevated",comment:"G&A at "+fmtP(gaR)+" of GRI. Scale or cut." });
  
  // Property cost ratio sentiment
  const costRatio = met.totalGRI > 0 ? met.totalPropCosts / met.totalGRI : 0;
  sArr.push(costRatio < 0.15 ? { metric:"Cost Ratio",mood:"positive",label:"Efficient",comment:"Prop costs at "+fmtP(costRatio)+" of GRI. Well-managed estate." } : costRatio < 0.30 ? { metric:"Cost Ratio",mood:"neutral",label:"Watchlist",comment:"Prop costs at "+fmtP(costRatio)+" of GRI. Vacancy driving irrecoverables." } : { metric:"Cost Ratio",mood:"negative",label:"Unsustainable",comment:"Prop costs at "+(costRatio > 1 ? ">100%" : fmtP(costRatio))+" of GRI. Void costs are destroying value." });
  
  sArr.push(met.avgWALT > 5 ? { metric:"Lease Duration",mood:"positive",label:"Secure",comment:"WALT "+met.avgWALT.toFixed(1)+"yr. Strong visibility." } : met.avgWALT > 2.5 ? { metric:"Lease Duration",mood:"neutral",label:"Adequate",comment:"WALT "+met.avgWALT.toFixed(1)+"yr." } : { metric:"Lease Duration",mood:"negative",label:"Short",comment:"WALT "+met.avgWALT.toFixed(1)+"yr. High rollover risk." });

  if (prev) {
    const gavG = prev.totalGAV > 0 ? (met.totalGAV - prev.totalGAV)/prev.totalGAV : 0;
    if (gavG > 0.08) bc.push({ member:"CIO", text:"Exceptional "+fmtP(gavG)+" GAV growth. Maintain underwriting standards." });
    else if (gavG > 0.03) bc.push({ member:"CIO", text:fmtP(gavG)+" GAV growth. Target higher-yield CEE markets." });
    else if (gavG < -0.02) bc.push({ member:"CIO", text:"GAV contracted "+fmtP(Math.abs(gavG))+". Stress-test the portfolio." });
    if (met.avgOcc < prev.avgOcc - 0.05) bc.push({ member:"COO", text:"Occupancy dropped "+fmtP(prev.avgOcc-met.avgOcc)+". Void costs will spike — need per-asset recovery plan." });
    else if (met.avgOcc > prev.avgOcc + 0.03) bc.push({ member:"COO", text:"Strong lease-up. Void cost savings flowing through to NOI." });
    if (met.noi < 0 && (prev.noi >= 0)) bc.push({ member:"CFO", text:"NOI has turned NEGATIVE. We are now cash-burning. This is a crisis — either fill vacancy or dispose of problem assets." });
    else if (met.noi < 0) bc.push({ member:"CFO", text:"NOI still negative at "+fmtM(met.noi)+". Cash runway shrinking every quarter. Board patience is limited." });
    else if (met.noi > prev.noi * 1.05) bc.push({ member:"CFO", text:"NOI up. Property cost control improving. Deploy surplus into pipeline." });
    else if (met.noi < prev.noi * 0.97) bc.push({ member:"CFO", text:"NOI softened. Check whether void costs or maintenance drag is the driver." });
  }

  if (yearEnd && state) {
    const irr = calcIRR(state.initialCash||state.cash, met.totalGAV, state.cash, quarter);
    const yr = Math.round(quarter/4);
    if (irr !== null) {
      if (irr > 0.12) bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+" exceeds target. LPs very pleased." });
      else if (irr > 0.08) bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+". Solid." });
      else if (irr > 0.04) bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+" below 10% floor." });
      else bc.push({ member:"Board Chair", text:"Year "+yr+": IRR "+fmtP(irr)+" unacceptable. Full strategic review." });
    }
  }

  if (esg < 50) bc.push({ member:"Head of ESG", text:"Multiple assets below EPC minimums. Budget for remediation." });
  const mktD = state?.marketData || {};
  const bullMkts = MARKETS.filter(m => (mktD[m.id]?.rentalGrowthQoQ||0) > 0.02).map(m => m.name);
  const bearMkts = MARKETS.filter(m => (mktD[m.id]?.rentalGrowthQoQ||0) < -0.02).map(m => m.name);
  if (bullMkts.length) bc.push({ member:"Head of Research", text:"Rental growth in "+bullMkts.slice(0,2).join(", ")+" — consider reversion opportunities." });
  if (bearMkts.length) bc.push({ member:"Head of Research", text:"Softening rents in "+bearMkts.slice(0,2).join(", ")+" — watch lease expiries." });

  const totalDebt = (state?.debtDrawdowns||[]).reduce((a, d) => a + d.amount, 0);
  const metGAV = state ? calcMetrics(state).totalGAV : 0;
  const ltv = metGAV > 0 ? totalDebt / metGAV : 0;
  if (ltv > 0.65) bc.push({ member:"CFO", text:"Portfolio LTV at "+fmtP(ltv)+" — approaching covenant limits." });
  else if (totalDebt > 0 && ltv < 0.4) bc.push({ member:"CFO", text:"Leverage at "+fmtP(ltv)+" LTV — headroom available." });
  if ((state?.team?.treasury||0) === 0 && metGAV > 100e6) bc.push({ member:"CFO", text:"Portfolio at "+fmtM(metGAV)+" with no treasury function — missing debt opportunity." });

  // Void cost specific commentary
  if (met.totalVoidCost > met.totalGRI * 0.20) bc.push({ member:"COO", text:"Void costs at "+fmtM(met.totalVoidCost)+" p.a. — that's "+fmtP(met.totalGRI > 0 ? met.totalVoidCost/met.totalGRI : 0)+" of GRI being lost to empty space. Lease up or dispose." });
  
  // Maintenance drag commentary
  const grCAssets = (state?.portfolio||[]).filter(a => !a.developing && a.condition === "C");
  if (grCAssets.length >= 2) bc.push({ member:"Head of Asset Mgmt", text:grCAssets.length+" assets at Grade C condition. Maintenance drag is 1.5x normal — refurbish or sell." });

  const esgTeam = state?.team?.esg || 0;
  if (esgTeam > 0 && esg > 75) bc.push({ member:"Head of ESG", text:"ESG score "+esg.toFixed(0)+"/100. Green credentials attracting institutional tenants." });
  else if (esgTeam > 0 && esg < 60) bc.push({ member:"Head of ESG", text:"ESG team in place but portfolio EPC below expectations. Prioritise upgrades." });
  else if (esgTeam === 0 && esg < 65) bc.push({ member:"Head of ESG", text:"No ESG function. Regulation risk rising. Hire ESG capability." });

  if (!bc.length) bc.push({ member: hist.length <= 1 ? "Board Chair" : "CFO", text: hist.length <= 1 ? "Welcome. LPs expect 10-12% net IRR over 5 years. Remember: empty buildings cost money." : "Steady quarter. Maintain pricing discipline." });
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
  app:{ minHeight:"100vh",background:"linear-gradient(180deg,"+T.bg+",#0d1321)",color:T.txt,fontFamily:"'Inter', sans-serif",fontSize:"13px",lineHeight:1.5 },
  hdr:{ padding:"10px 18px",borderBottom:"1px solid "+T.bdr,display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap" },
  logo:{ display:"flex",alignItems:"center",gap:"10px",flexShrink:0 },
  mBar:{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:"1px",background:"#334155",borderBottom:"2px solid "+T.acc },
  mCell:{ background:"#0f172a",padding:"14px 16px",textAlign:"center" },
  mLbl:{ fontSize:"10px",color:"#e2e8f0",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px" },
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

function tabSt(active) { return { flex:1,padding:"8px 10px",background:active?"rgba(59,130,246,0.15)":"transparent",color:active?"#60a5fa":T.txtD,border:active?"1px solid rgba(59,130,246,0.4)":"1px solid transparent",borderRadius:"5px",cursor:"pointer",fontSize:"10px",fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",fontFamily:"inherit",boxShadow:active?tabGlow:"none" }; }
function btnSt(v) { const colors = { green:{b:T.grn,bg:T.grnD,c:T.grn}, red:{b:T.red,bg:T.redD,c:T.red}, amber:{b:T.amb,bg:T.ambD,c:T.amb} }; const d = colors[v] || { b:T.acc, bg:T.accD, c:T.acc }; return { padding:"5px 10px",border:"1px solid "+d.b,background:d.bg,color:d.c,borderRadius:"4px",cursor:"pointer",fontSize:"10px",fontWeight:600,fontFamily:"inherit" }; }
function condSt(c) { return { display:"inline-block",padding:"2px 6px",borderRadius:"4px",fontSize:"9px",fontWeight:700,background:c==="A"?T.grnD:c==="B"?T.ambD:T.redD, color:c==="A"?T.grn:c==="B"?T.amb:T.red }; }

/* ===== CARD COMPONENTS ===== */
function MetricCell({ label, value, color, icon }) {
  return (
    <div style={S.mCell}>
      <div style={S.mLbl}>{icon && <span style={{ fontSize:"12px" }}>{icon}</span>}<TipLbl label={label} style={{ fontSize:"10px",color:"#e2e8f0",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase" }} /></div>
      <div style={{ ...S.mVal, color: color || "#ffffff" }}>{value}</div>
    </div>
  );
}

function AssetCard({ asset, onMaint, onDispose, onFix }) {
  const ac = ASSET_CLASSES.find(x => x.id === asset.assetClass);
  const tInfo = asset.tenant ? getTI(asset.tenant) : null;
  const mktCity = MARKETS.find(m => m.id === asset.market)?.city || "";
  const costs = !asset.developing ? calcAssetCosts(asset, ac) : null;
  const thumb = <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"6px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)" }}><WHouse condition={asset.condition} gla={asset.gla} developing={asset.developing} assetClass={asset.assetClass} seed={asset.visualSeed||0} /></div>;
  if (asset.developing) {
    const pD = ((asset.totalDevQuarters||4) - asset.devQuartersLeft) / (asset.totalDevQuarters||4) * 100;
    return (<div style={S.card}><div style={{ display:"flex",gap:"12px" }}>{thumb}<div style={{ flex:1 }}><div style={{ display:"flex",justifyContent:"space-between" }}><div><div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{asset.flag} {asset.name}</div><div style={{ fontSize:"11px",color:T.txtD }}>{ac?.icon} {asset.assetClassName} {"\u00B7"} {asset.marketName} {"\u00B7"} Dev</div></div><span style={condSt("A")}>DEV</span></div></div></div><div style={S.grid}><div><TipLbl label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla/1000).toFixed(0)}k</div></div><div><TipLbl label="Dev Cost" style={S.stat} /><div style={S.val}>{fmtM(asset.totalDevCost||0)}</div></div><div><TipLbl label="Completion" style={S.stat} /><div style={S.val}>{asset.devQuartersLeft}Q</div></div></div><div style={{ height:"4px",background:T.bdr,borderRadius:"2px",marginTop:"6px" }}><div style={{ height:"100%",width:pD+"%",background:T.acc,borderRadius:"2px" }} /></div></div>);
  }
  const npi = costs ? costs.netPropertyIncome : 0;
  const npiNeg = npi < 0;
  return (
    <div style={S.card}>
      <div style={{ display:"flex",gap:"12px" }}>
        {thumb}
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{asset.flag} {asset.name}{asset.urgentIssue && <span style={{ display:"inline-block",padding:"2px 6px",borderRadius:"4px",fontSize:"9px",fontWeight:700,background:T.redD,color:T.red,marginLeft:"5px" }}>{"\u26A0"} ISSUE</span>}{npiNeg && <span style={{ display:"inline-block",padding:"2px 6px",borderRadius:"4px",fontSize:"9px",fontWeight:700,background:"#450a0a",color:"#ff6b6b",marginLeft:"5px" }}>{"\u{1F534}"} NPI NEG</span>}</div>
              <div style={{ fontSize:"11px",color:T.txtD }}>{ac?.icon} {asset.assetClassName} {"\u00B7"} {asset.marketName}{mktCity ? <span style={{ color:T.txtM }}>, {mktCity}</span> : ""}{asset.tenant && <>{" \u00B7 "}<span style={{ color:T.acc }}>{asset.tenant}</span>{tInfo && <span style={{ marginLeft:"4px",fontSize:"9px",color:credCol(tInfo.credit),background:"rgba(0,0,0,0.3)",padding:"1px 4px",borderRadius:"3px" }}>{tInfo.credit}</span>}</>}</div>
            </div>
            <div style={{ display:"flex",gap:"3px" }}><span style={{ fontSize:"9px",color:T.txtD,padding:"2px 5px",background:T.accD,borderRadius:"3px" }}>EPC {asset.epcRating}</span><span style={condSt(asset.condition)}>Gr {asset.condition}</span></div>
          </div>
        </div>
      </div>
      {asset.urgentIssue && <div style={{ margin:"6px 0",padding:"6px 10px",background:T.redD,border:"1px solid "+T.red,borderRadius:"5px",fontSize:"10px",color:T.red }}>{"\u{1F6A8}"} {asset.urgentIssue.name} <button style={{ ...btnSt("red"),marginLeft:"6px",padding:"2px 6px",fontSize:"9px" }} onClick={() => onFix(asset.id)}>Fix ({fmtK(asset.gla * asset.urgentIssue.fixCost)})</button></div>}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"6px",marginTop:"8px" }}>
        <div><TipLbl label="GLA" style={S.stat} /><div style={S.val}>{(asset.gla/1000).toFixed(0)}k</div></div>
        <div><TipLbl label="Occupancy" style={S.stat} /><div style={{ ...S.val, color:asset.occupancy>0.85?T.grn:asset.occupancy>0.6?T.amb:T.red }}>{fmtP(asset.occupancy)}</div></div>
        <div><TipLbl label="GAV" style={S.stat} /><div style={S.val}>{fmtM(asset.value)}</div></div>
        <div><TipLbl label="Rent p.a." style={S.stat} /><div style={S.val}>{fmtM(asset.gri)}</div></div>
        <div><TipLbl label="Prop Costs" style={S.stat} /><div style={{ ...S.val, color:T.red }}>{fmtK(costs?.totalIrrecoverable||0)}</div></div>
        <div><TipLbl label="NPI" style={S.stat} /><div style={{ ...S.val, color:npiNeg?"#ff6b6b":T.grn }}>{fmtM(npi)}</div></div>
        <div><TipLbl label="Rent/sqm" style={S.stat} /><div style={S.val}>{"\u20AC"}{asset.rentPsm.toFixed(1)}</div></div>
        <div><TipLbl label="WALT" style={S.stat} /><div style={S.val}>{asset.leaseRemaining > 0 ? asset.leaseRemaining.toFixed(1)+"yr" : "Vacant"}</div></div>
      </div>
      {costs && (asset.occupancy < 0.8) && (
        <div style={{ marginTop:"6px",padding:"5px 8px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"4px",fontSize:"9px",color:"#f87171",lineHeight:1.5 }}>
          <TipLbl label="Void Cost" style={{ display:"inline",fontSize:"9px",color:"#f87171",fontWeight:700 }} /> {fmtK(costs.voidRates + costs.irrecoverableSC)}/yr {"\u00B7"} Insurance {fmtK(costs.insurance)}/yr {"\u00B7"} Maint {fmtK(costs.maintDrag)}/yr
        </div>
      )}
      <div style={{ display:"flex",alignItems:"center",gap:"6px",marginTop:"6px" }}>
        <span style={{ fontSize:"8px",color:T.txtM,flexShrink:0,width:"52px" }}>Occupancy</span>
        <div style={{ width:"140px",height:"4px",background:T.bdr,borderRadius:"2px",flexShrink:0 }}><div style={{ height:"100%",width:(asset.occupancy*100)+"%",background:asset.occupancy>0.85?T.grn:asset.occupancy>0.6?T.amb:T.red,borderRadius:"2px" }} /></div>
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
  const mktCity = MARKETS.find(m => m.id === asset.market)?.city || "";
  return (
    <div style={{ ...S.card, opacity:ok?1:0.5 }}>
      <div style={{ display:"flex",gap:"12px" }}>
        <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"6px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)" }}><WHouse condition={asset.condition} gla={asset.gla} assetClass={asset.assetClass} seed={asset.visualSeed||0} /></div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <div><div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{asset.flag} {asset.name}</div><div style={{ fontSize:"11px",color:T.txtD }}>{ac?.icon} {asset.assetClassName} {"\u00B7"} {asset.marketName}{mktCity ? <span style={{ color:T.txtM }}>, {mktCity}</span> : ""}{asset.tenant && <>{" \u00B7 "}<span style={{ color:T.acc }}>{asset.tenant}</span></>}</div></div>
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
  return (
    <div style={{ ...S.card, opacity:ok?1:0.5 }}>
      <div style={{ display:"flex",gap:"12px" }}>
        <div style={{ width:"100px",minWidth:"100px",height:"66px",borderRadius:"6px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)" }}><WHouse condition="A" gla={site.gla} developing={true} assetClass={site.assetClass} seed={parseInt(site.id.replace(/\D/g,""))||0} /></div>
        <div style={{ flex:1 }}><div style={{ fontSize:"14px",fontWeight:700,color:T.wht }}>{site.flag} {site.name}</div><div style={{ fontSize:"11px",color:T.txtD }}>{ac?.icon} {ac?.name} {"\u00B7"} {site.marketName}</div></div>
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
      <div style={{ ...S.card, background:T.accD, border:"1px solid "+T.acc, marginBottom:"8px" }}><div style={{ fontSize:"12px",color:T.acc,fontWeight:700 }}>Quarterly Team Cost: {fmtK(teamQCost(team))}</div></div>
      {TEAM_ROLES.map(r => { const n = team[r.id] || 0; return (
        <div key={r.id} style={{ ...S.card, marginBottom:"5px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px" }}><div><span style={{ fontSize:"13px" }}>{r.icon}</span> <span style={{ fontSize:"12px",fontWeight:700,color:T.wht }}>{r.name}</span></div><span style={{ fontSize:"16px",fontWeight:700,color:T.acc }}>{n}</span></div>
          <div style={{ fontSize:"10px",color:T.txtD,marginBottom:"4px" }}>{r.desc}</div>
          <div style={{ fontSize:"10px",color:T.txtM,marginBottom:"5px" }}>Salary: {fmtK(r.salaryCost)}/yr</div>
          <div style={S.row}><button style={btnSt("green")} onClick={() => onHire(r.id)}>+ Hire</button>{n > 0 && <button style={btnSt("red")} onClick={() => onFire(r.id)}>- Remove</button>}</div>
        </div>
      ); })}
    </div>
  );
}

/* ===== MARKET INTEL PANEL ===== */
function MarketIntelPanel({ marketData }) {
  const [selMkt, setSelMkt] = useState(null);
  const md = marketData || {};
  return (
    <div>
      <div style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px" }}>{"\u{1F4CA}"} Live Market Intelligence</div>
      <div style={{ overflowX:"auto",marginBottom:"10px" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:"10px" }}>
          <thead><tr style={{ borderBottom:"1px solid "+T.bdr }}>{["Market","NER \u20AC/sqm","\u0394 QoQ","Prime Yield","Mkt Vacancy","Demand"].map(h => <th key={h} style={{ padding:"4px 6px",color:T.txtM,fontWeight:600,textAlign:"left",whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>
            {MARKETS.map((mkt,i) => {
              const d = md[mkt.id] || {};
              const growth = d.rentalGrowthQoQ || 0;
              const growthColor = growth > 0.02 ? "#34d399" : growth < -0.02 ? "#f87171" : T.txtD;
              const isSelected = selMkt === mkt.id;
              return (
                <tr key={mkt.id} onClick={() => setSelMkt(isSelected ? null : mkt.id)} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",background:isSelected?"rgba(59,130,246,0.1)":i%2===0?"rgba(255,255,255,0.01)":"transparent" }}>
                  <td style={{ padding:"5px 6px",color:T.txt,fontWeight:600,whiteSpace:"nowrap" }}>{mkt.flag} {mkt.name}</td>
                  <td style={{ padding:"5px 6px",color:"#fff",fontWeight:700 }}>{"\u20AC"}{(d.ner||mkt.baseRent).toFixed(0)}</td>
                  <td style={{ padding:"5px 6px",color:growthColor,fontWeight:700 }}>{growth>=0?"+":""}{(growth*100).toFixed(1)}%</td>
                  <td style={{ padding:"5px 6px",color:T.txtD }}>{(d.primeYield||mkt.capRate).toFixed(2)}%</td>
                  <td style={{ padding:"5px 6px",color:d.marketVacancy>0.10?"#f87171":d.marketVacancy>0.07?"#fbbf24":"#34d399",fontWeight:600 }}>{fmtP(d.marketVacancy||0.07)}</td>
                  <td style={{ padding:"5px 6px" }}><div style={{ display:"flex",alignItems:"center",gap:"4px" }}><div style={{ width:"40px",height:"4px",background:"#1e2a3a",borderRadius:"2px" }}><div style={{ height:"100%",width:((d.demandIndex||60)+"%"),background:d.demandIndex>70?"#34d399":d.demandIndex>45?"#fbbf24":"#f87171",borderRadius:"2px" }} /></div><span style={{ color:T.txtD,fontSize:"9px" }}>{d.demandIndex||60}</span></div></td>
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
          <div style={{ ...S.card,background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.25)" }}>
            <div style={{ fontSize:"13px",fontWeight:700,color:T.wht,marginBottom:"8px" }}>{mkt.flag} {mkt.name} — {mkt.city}</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",fontSize:"10px" }}>
              <div><div style={{ color:T.txtM }}>Net Effective Rent</div><div style={{ color:"#fff",fontWeight:700,fontSize:"14px" }}>{"\u20AC"}{(d.ner||mkt.baseRent).toFixed(1)}/sqm</div></div>
              <div><div style={{ color:T.txtM }}>QoQ Rental Growth</div><div style={{ color:(d.rentalGrowthQoQ||0)>0?"#34d399":"#f87171",fontWeight:700,fontSize:"14px" }}>{(d.rentalGrowthQoQ||0)>=0?"+":""}{((d.rentalGrowthQoQ||0)*100).toFixed(2)}%</div></div>
              <div><div style={{ color:T.txtM }}>Prime Cap Rate</div><div style={{ color:"#fff",fontWeight:700,fontSize:"14px" }}>{(d.primeYield||mkt.capRate).toFixed(2)}%</div></div>
              <div><div style={{ color:T.txtM }}>Market Vacancy</div><div style={{ color:(d.marketVacancy||0.07)>0.10?"#f87171":"#34d399",fontWeight:700,fontSize:"14px" }}>{fmtP(d.marketVacancy||0.07)}</div></div>
              <div><div style={{ color:T.txtM }}>Demand Index</div><div style={{ color:"#fbbf24",fontWeight:700,fontSize:"14px" }}>{d.demandIndex||60}/100</div></div>
              <div><div style={{ color:T.txtM }}>Take-up</div><div style={{ color:"#fff",fontWeight:700,fontSize:"14px" }}>{d.absorptionKsqm||100}k sqm</div></div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ===== FINANCING PANEL ===== */
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
      <div style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>{"\u{1F3E6}"} Debt Financing</div>
      <div style={{ ...S.card,background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.25)",marginBottom:"10px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",fontSize:"10px" }}>
          <div><div style={{ color:T.txtM }}>Total Debt</div><div style={{ color:"#fff",fontWeight:800,fontSize:"14px" }}>{fmtM(totalDebt)}</div></div>
          <div><div style={{ color:T.txtM }}>Portfolio LTV</div><div style={{ color:ltv>0.65?"#f87171":ltv>0.50?"#fbbf24":"#34d399",fontWeight:800,fontSize:"14px" }}>{fmtP(ltv)}</div></div>
          <div><div style={{ color:T.txtM }}>Annual Interest</div><div style={{ color:"#f87171",fontWeight:800,fontSize:"14px" }}>{fmtM((state.debtDrawdowns||[]).reduce((a,d)=>a+d.amount*d.rate/100,0))}</div></div>
        </div>
        <div style={{ marginTop:"7px",height:"4px",background:"#1e2a3a",borderRadius:"2px" }}><div style={{ height:"100%",width:Math.min(100,ltv*100)+"%",background:ltv>0.65?"#f87171":ltv>0.50?"#fbbf24":"#34d399",borderRadius:"2px",transition:"width 0.4s" }} /></div>
        <div style={{ fontSize:"8px",color:T.txtM,marginTop:"2px" }}>Covenant limit: 70% LTV</div>
      </div>
      {(state.debtDrawdowns||[]).length > 0 && (
        <div style={{ marginBottom:"10px" }}>
          <div style={{ fontSize:"9px",color:T.txtM,fontWeight:600,marginBottom:"5px",textTransform:"uppercase" }}>Outstanding Facilities</div>
          {state.debtDrawdowns.map(d => { const dt = DEBT_TYPES.find(x => x.id === d.type) || DEBT_TYPES[0]; return (
            <div key={d.id} style={{ ...S.card,padding:"7px 10px",marginBottom:"5px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div><div style={{ fontSize:"10px",fontWeight:700,color:T.txt }}>{dt.icon} {dt.name}</div><div style={{ fontSize:"9px",color:T.txtM }}>{fmtM(d.amount)} @ {d.rate.toFixed(2)}% p.a.</div></div>
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
          <div key={dt.id} onClick={() => !greenLocked && setSelDebt(selDebt===dt.id?null:dt.id)} style={{ ...S.card,marginBottom:"6px",cursor:greenLocked?"not-allowed":"pointer",opacity:greenLocked?0.5:1,border:"1px solid "+(selDebt===dt.id?T.acc:"rgba(255,255,255,0.15)"),background:selDebt===dt.id?"rgba(59,130,246,0.1)":T.card }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div><div style={{ fontSize:"11px",fontWeight:700,color:T.wht }}>{dt.icon} {dt.name}</div><div style={{ fontSize:"9px",color:T.txtD,marginTop:"1px" }}>{dt.desc}{greenLocked?" — requires ESG score \u2265 65":""}</div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:"13px",fontWeight:800,color:"#60a5fa" }}>{effectiveRate.toFixed(2)}%</div><div style={{ fontSize:"8px",color:T.txtM }}>LTV {(dt.ltv*100).toFixed(0)}% max</div></div>
            </div>
            {selDebt === dt.id && (
              <div style={{ marginTop:"8px",paddingTop:"8px",borderTop:"1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize:"9px",color:T.txtM,marginBottom:"4px" }}>Drawdown amount (max {fmtM(maxDraw)})</div>
                <div style={{ display:"flex",gap:"5px",alignItems:"center" }}>
                  <input type="number" placeholder="\u20ACm e.g. 50000000" value={drawAmt} onChange={e => setDrawAmt(e.target.value)} style={{ flex:1,padding:"5px 8px",background:"#0a1020",border:"1px solid "+T.bdr,borderRadius:"4px",color:T.txt,fontSize:"10px",fontFamily:"inherit" }} />
                  <button style={{ ...btnSt("green"),padding:"5px 10px" }} onClick={() => { const amt = Number(drawAmt); if (amt > 0 && amt <= maxDraw) { onDrawDebt(dt.id, amt, effectiveRate); setDrawAmt(""); setSelDebt(null); } }}>Drawdown</button>
                </div>
                {spreadReduction > 0 && <div style={{ fontSize:"8px",color:"#34d399",marginTop:"3px" }}>Treasury discount: -{fmtP(spreadReduction/100)} spread</div>}
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
  const toggle = (id) => setSm(p => p.includes(id) ? p.filter(m => m !== id) : p.length < 4 ? [...p, id] : p);
  const ok = step === 0 ? cn.trim().length > 0 : step === 1 ? true : sm.length > 0;
  const next = () => { if (step < 2) setStep(step + 1); else onStart({ companyName:cn.trim(), cash:cap, startMarkets:sm, difficulty:diff }); };
  const saved = hasSave() ? loadGame() : null;
  const wrap = { minHeight:"100vh",background:"linear-gradient(180deg,"+T.bg+",#0d1321)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Inter', sans-serif",color:T.txt,padding:"20px" };
  const cont = { maxWidth:"540px",width:"100%" };
  const opt = (sel) => ({ padding:"11px 12px",background:sel?T.accD:T.card,border:"1px solid "+(sel?T.acc:T.bdr),borderRadius:"6px",cursor:"pointer",marginBottom:"6px" });
  const mktSt = (sel) => ({ padding:"9px 10px",background:sel?T.accD:T.card,border:"1px solid "+(sel?T.acc:T.bdr),borderRadius:"6px",cursor:"pointer",textAlign:"center" });
  const nxtSt = (en) => ({ flex:1,padding:"11px 18px",background:en?"linear-gradient(135deg,"+T.acc+",#2563eb)":T.card,color:en?T.wht:T.txtM,border:en?"none":"1px solid "+T.bdr,borderRadius:"6px",cursor:en?"pointer":"default",fontSize:"12px",fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em",textTransform:"uppercase",boxShadow:en?"0 2px 12px rgba(59,130,246,0.3)":"none" });
  const CAPS = [{l:"\u20AC100m",v:100e6,d:"Scrappy challenger"},{l:"\u20AC150m",v:150e6,d:"Mid-market platform"},{l:"\u20AC250m",v:250e6,d:"Institutional player"},{l:"\u20AC500m",v:500e6,d:"Mega fund"}];
  const DIFFS = [{l:"Guided",v:"guided",d:"Start with 3 seed assets"},{l:"Blank Slate",v:"blank",d:"Cash only"}];
  return (
    <div style={wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={cont}>
        <div style={{ textAlign:"center",marginBottom:"36px" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",marginBottom:"4px" }}><Logo size={36} /><div style={{ fontSize:"26px",fontWeight:700,color:T.wht,letterSpacing:"0.06em" }}>LOGISIM</div></div>
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
        <div style={{ display:"flex",gap:"5px",justifyContent:"center",marginBottom:"20px" }}>{[0,1,2].map(i => <div key={i} style={{ width:"7px",height:"7px",borderRadius:"50%",background:step>=i?T.acc:T.bdr }} />)}</div>
        {step === 0 && (<div><div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 1 of 3</div><div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Name your platform</div><div style={{ fontSize:"12px",color:T.txtD,marginBottom:"16px",lineHeight:1.5 }}>You are the CEO of a European logistics real estate platform. Empty buildings cost money — rates, insurance, service charge. Neglect your portfolio and NOI goes red.</div><input style={{ width:"100%",padding:"11px 12px",background:T.card,border:"1px solid "+T.bdr,borderRadius:"6px",color:T.wht,fontSize:"14px",fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} placeholder="e.g. Apex Logistics" value={cn} onChange={e => setCn(e.target.value)} onKeyDown={e => e.key==="Enter"&&ok&&next()} autoFocus /></div>)}
        {step === 1 && (<div><div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 2 of 3</div><div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Capital and mode</div><div style={{ fontSize:"12px",color:T.txtD,marginBottom:"14px" }}>How much equity?</div>{CAPS.map(o => <div key={o.v} style={opt(cap===o.v)} onClick={() => setCap(o.v)}><div style={{ fontSize:"13px",fontWeight:600,color:cap===o.v?T.acc:T.wht }}>{o.l}</div><div style={{ fontSize:"10px",color:T.txtD }}>{o.d}</div></div>)}<div style={{ marginTop:"10px" }}>{DIFFS.map(o => <div key={o.v} style={opt(diff===o.v)} onClick={() => setDiff(o.v)}><div style={{ fontSize:"13px",fontWeight:600,color:diff===o.v?T.acc:T.wht }}>{o.l}</div><div style={{ fontSize:"10px",color:T.txtD }}>{o.d}</div></div>)}</div></div>)}
        {step === 2 && (<div><div style={{ fontSize:"10px",color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"5px" }}>Step 3 of 3</div><div style={{ fontSize:"16px",fontWeight:700,color:T.wht,marginBottom:"3px" }}>Starting markets</div><div style={{ fontSize:"12px",color:T.txtD,marginBottom:"12px" }}>Pick up to 4.</div><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px" }}>{MARKETS.map(m => (<div key={m.id} style={mktSt(sm.includes(m.id))} onClick={() => toggle(m.id)}><div style={{ fontSize:"17px",marginBottom:"1px" }}>{m.flag}</div><div style={{ fontSize:"11px",fontWeight:600,color:sm.includes(m.id)?T.acc:T.txt }}>{m.name}</div><div style={{ fontSize:"9px",color:T.txtD }}>Cap {m.capRate}% {"\u00B7"} {"\u20AC"}{m.baseRent}/sqm</div></div>))}</div><div style={{ fontSize:"9px",color:T.txtM,marginTop:"5px",textAlign:"center" }}>{sm.length}/4 selected</div></div>)}
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

  const onStart = useCallback((cfg) => { if (cfg === "__load__") { const s = loadGame(); if (s) { setState(s); setStarted(true); } } else { delSave(); setState(initGame(cfg)); setStarted(true); } }, []);
  const onAdvance = useCallback(() => setState(p => p ? advanceQ(p) : p), []);
  const onAcquire = useCallback((id) => setState(p => { if (!p) return p; const a = p.acquisitions.find(x => x.id === id); if (!a || p.cash < a.askPrice) return p; const q = { ...a, acquired:true, value:a.askPrice }; delete q.askPrice; return { ...p, cash:p.cash-a.askPrice, portfolio:[...p.portfolio,q], acquisitions:p.acquisitions.filter(x => x.id !== id), events:[...p.events, "\u{1F3E2} Acquired "+a.flag+" "+a.name+" for "+fmtM(a.askPrice)], newsLog:[...(p.newsLog||[]), {icon:"\u{1F3E2}",text:"Acquired "+a.name+" for "+fmtM(a.askPrice),color:T.acc}] }; }), []);
  const onDispose = useCallback((id) => setState(p => { if (!p) return p; const a = p.portfolio.find(x => x.id === id); if (!a) return p; const pr = a.value * 0.97; return { ...p, cash:p.cash+pr, portfolio:p.portfolio.filter(x => x.id !== id), events:[...p.events, "\u{1F4B0} Disposed "+a.flag+" "+a.name+" for "+fmtM(pr)], newsLog:[...(p.newsLog||[]), {icon:"\u{1F4B0}",text:"Disposed "+a.name+" at "+fmtM(pr),color:T.amb}] }; }), []);
  const onMaint = useCallback((aid, mid) => setState(p => { if (!p) return p; const mt = MAINT.find(m => m.id === mid); const a = p.portfolio.find(x => x.id === aid); if (!mt || !a) return p; const cost = a.gla * mt.costPerSqm; if (p.cash < cost) return p; const up = p.portfolio.map(x => { if (x.id !== aid) return x; const n = { ...x, capexSpent:x.capexSpent+cost }; if (mid === "rm") n.lastRM = p.quarter; if (mt.gradeUp && n.condition !== "A") { n.condition = n.condition==="C"?"B":"A"; n.rentPsm *= 1.08; } if (mt.esgBoost) { n.epcRating = n.epcRating==="E"?"D":n.epcRating==="D"?"C":n.epcRating==="C"?"B":"A"; n.occupancy = Math.min(1, n.occupancy+mt.occBoost); } if (mt.occBoost && !mt.esgBoost) n.occupancy = Math.min(1, n.occupancy+mt.occBoost); const mk = MARKETS.find(m => m.id === n.market); const ac = ASSET_CLASSES.find(c => c.id === n.assetClass) || ASSET_CLASSES[0]; n.gri = n.gla * n.rentPsm * n.occupancy; n.value = n.gri > 0 ? n.gri / ((mk?.capRate||5)*(ac?.capRateMult||1)/100) : n.value; return n; }); return { ...p, cash:p.cash-cost, portfolio:up, events:[...p.events, "\u{1F527} "+mt.name+" on "+a.flag+" "+a.name+" ("+fmtK(cost)+")"] }; }), []);
  const onFix = useCallback((aid) => setState(p => { if (!p) return p; const a = p.portfolio.find(x => x.id === aid); if (!a || !a.urgentIssue) return p; const cost = a.gla * a.urgentIssue.fixCost; if (p.cash < cost) return p; return { ...p, cash:p.cash-cost, portfolio:p.portfolio.map(x => x.id !== aid ? x : { ...x, urgentIssue:null, capexSpent:x.capexSpent+cost }), events:[...p.events, "\u2705 Fixed "+a.flag+" "+a.name+" ("+fmtK(cost)+")"] }; }), []);
  const onDev = useCallback((id) => setState(p => { if (!p) return p; const s = p.devSites.find(x => x.id === id); if (!s || p.cash < s.devCost) return p; aCtr++; const d = { id:s.id, name:s.name.replace(" (Dev)",""), market:s.market, marketName:s.marketName, flag:s.flag, assetClass:s.assetClass, assetClassName:s.assetClassName, assetClassIcon:s.assetClassIcon, gla:s.gla, rentPsm:s.estRentPsm, occupancy:0, tenant:null, leaseRemaining:0, gri:0, value:0, age:0, condition:"A", epcRating:"A", capexSpent:0, acquired:true, developing:true, devQuartersLeft:s.quartersToComplete, totalDevQuarters:s.quartersToComplete, totalDevCost:s.devCost, devCostSoFar:0, visualSeed:aCtr, urgentIssue:null, lastRM:0 }; return { ...p, cash:p.cash-s.devCost, portfolio:[...p.portfolio,d], devSites:p.devSites.filter(x => x.id !== id), events:[...p.events, "\u{1F3D7}\uFE0F Started "+s.flag+" "+s.name+" ("+fmtM(s.devCost)+")"], newsLog:[...(p.newsLog||[]), {icon:"\u{1F3D7}\uFE0F",text:"Development: "+s.name,color:T.acc}] }; }), []);
  const onHire = useCallback((r) => setState(p => p ? { ...p, team:{ ...p.team, [r]:(p.team[r]||0)+1 } } : p), []);
  const onFire = useCallback((r) => setState(p => p && (p.team[r]||0) > 0 ? { ...p, team:{ ...p.team, [r]:p.team[r]-1 } } : p), []);
  const onReset = useCallback(() => { delSave(); setStarted(false); setState(null); setTab("portfolio"); setRTab("sentiment"); }, []);
  const onSave = useCallback(() => { if (state) { saveGame(state); setSaved(true); setTimeout(() => setSaved(false), 2000); } }, [state]);
  const onSelectTenant = useCallback((cand) => { setState(p => { if (!p || !p.tenantSelection) return p; const { assetId } = p.tenantSelection; const updated = p.portfolio.map(a => { if (a.id !== assetId) return a; const n = { ...a, tenant:cand.name, leaseRemaining:cand.term, rentPsm:cand.rentPsm, occupancy:Math.min(1, a.occupancy+rBetween(0.2,0.45)) }; const mkt = MARKETS.find(m => m.id === n.market); const ac = ASSET_CLASSES.find(c => c.id === n.assetClass) || ASSET_CLASSES[0]; n.gri = n.gla * n.rentPsm * n.occupancy; n.value = n.gri > 0 ? n.gri / ((mkt?.capRate||5)*(ac?.capRateMult||1)/100) : n.value; return n; }); return { ...p, portfolio:updated, tenantSelection:null, events:[...p.events, "\u{1F91D} Selected "+cand.name], newsLog:[...(p.newsLog||[]), {icon:"\u{1F91D}",text:cand.name+" signed "+cand.term+"yr lease",color:T.grn}] }; }); }, []);
  const onDecline = useCallback(() => setState(p => p ? { ...p, tenantSelection:null } : p), []);
  const onDrawDebt = useCallback((typeId, amount, rate) => setState(p => { if (!p) return p; const id = "debt_" + Date.now(); return { ...p, cash: p.cash + amount, debtDrawdowns: [...(p.debtDrawdowns||[]), { id, type:typeId, amount, rate, drawQuarter:p.quarter }], newsLog:[...(p.newsLog||[]), {icon:"\u{1F3E6}",text:"Drew "+fmtM(amount)+" "+typeId+" @ "+rate.toFixed(2)+"%",color:"#60a5fa"}] }; }), []);
  const onRepayDebt = useCallback((debtId) => setState(p => { if (!p) return p; const d = (p.debtDrawdowns||[]).find(x => x.id === debtId); if (!d || p.cash < d.amount) return p; return { ...p, cash: p.cash - d.amount, debtDrawdowns: (p.debtDrawdowns||[]).filter(x => x.id !== debtId), newsLog:[...(p.newsLog||[]), {icon:"\u{1F3E6}",text:"Repaid "+fmtM(d.amount)+" "+d.type,color:"#f87171"}] }; }), []);

  if (!started || !state) return <StartScreen onStart={onStart} />;

  const m = calcMetrics(state);
  const ql = getQL(state.quarter, state.year);
  const irr = calcIRR(state.initialCash||state.cash, m.totalGAV, state.cash, state.quarter);
  const noiNegative = m.noi < 0;

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      {state.tenantSelection && <TenantModal candidates={state.tenantSelection.candidates} assetName={state.tenantSelection.assetName} onSelect={onSelectTenant} onClose={onDecline} />}

      <div style={S.hdr}>
        <div style={S.logo}><Logo size={30} /><div><div style={{ fontSize:"15px",fontWeight:800,color:T.wht,letterSpacing:"0.05em" }}>{state.companyName.toUpperCase()}</div><div style={{ fontSize:"9px",color:T.txtD,letterSpacing:"0.1em",textTransform:"uppercase" }}>LOGISIM</div></div></div>
        <NewsFeed items={state.newsLog || []} />
        <div style={{ display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",flexShrink:0 }}>
          <div style={{ padding:"5px 12px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"6px" }}><div style={{ fontSize:"9px",color:T.grn,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>CASH</div><div style={{ fontSize:"17px",fontWeight:800,color:T.grn }}>{fmtM(state.cash)}</div></div>
          <div style={{ padding:"5px 12px",background:T.accD,border:"1px solid "+T.acc,borderRadius:"6px" }}><div style={{ fontSize:"9px",color:T.acc,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>PERIOD</div><div style={{ fontSize:"15px",fontWeight:800,color:"#ffffff" }}>{ql}</div></div>
          <button style={{ padding:"9px 18px",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:T.wht,border:"none",borderRadius:"6px",cursor:"pointer",fontSize:"11px",fontWeight:800,fontFamily:"inherit",letterSpacing:"0.05em",textTransform:"uppercase",boxShadow:"0 2px 16px rgba(239,68,68,0.4)" }} onClick={onAdvance}>Simulate to next qtr {"\u2192"}</button>
          <button style={{ ...btnSt("green"),padding:"5px 9px",fontSize:"9px" }} onClick={onSave}>{saved ? "\u2713" : "Save"}</button>
          <button style={{ ...btnSt("default"),padding:"5px 9px",fontSize:"9px" }} onClick={onReset}>Reset</button>
        </div>
      </div>

      {noiNegative && (
        <div style={{ background:"linear-gradient(90deg, #7f1d1d, #450a0a)",padding:"8px 18px",display:"flex",alignItems:"center",gap:"10px",borderBottom:"2px solid #ef4444" }}>
          <span style={{ fontSize:"16px" }}>{"\u{1F534}"}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"11px",fontWeight:800,color:"#ff6b6b",letterSpacing:"0.05em" }}>NOI IS NEGATIVE: {fmtM(m.noi)} p.a.</div>
            <div style={{ fontSize:"9px",color:"#fca5a5" }}>Property costs ({fmtM(m.totalPropCosts)}) + G&A exceed rental income. Void costs: {fmtM(m.totalVoidCost)} p.a. Fill vacancy or dispose problem assets.</div>
          </div>
        </div>
      )}

      <div style={S.mBar}>
        <MetricCell label="Portfolio GAV" value={fmtM(m.totalGAV)} icon={"\u{1F48E}"} />
        <MetricCell label="Assets" value={m.assetCount} icon={"\u{1F3E2}"} />
        <MetricCell label="Total GLA" value={(m.totalGLA/1000).toFixed(0)+"k sqm"} icon={"\u{1F4D0}"} />
        <MetricCell label="Avg Occupancy" value={fmtP(m.avgOcc)} color={m.avgOcc>0.85?T.grn:m.avgOcc>0.6?T.amb:T.red} icon={"\u{1F4CA}"} />
        <MetricCell label="GRI p.a." value={fmtM(m.totalGRI)} icon={"\u{1F4B6}"} />
        <MetricCell label="NOI p.a." value={fmtM(m.noi)} color={m.noi < 0 ? "#ff6b6b" : T.grn} icon={m.noi < 0 ? "\u{1F534}" : "\u{1F4C8}"} />
        <MetricCell label="NOI Yield" value={fmtP(m.noiYield)} color={m.noiYield < 0 ? "#ff6b6b" : undefined} icon={"\u{1F3AF}"} />
        <MetricCell label="Avg WALT" value={m.avgWALT.toFixed(1)+"yr"} icon={"\u{1F4C5}"} />
      </div>

      <div style={S.main}>
        <div style={S.lp}>
          <div style={S.tabs}>
            {["portfolio","acquire","develop","team","markets"].map(t => (
              <button key={t} style={tabSt(tab===t)} onClick={() => setTab(t)}>
                {t==="portfolio" ? "Portfolio ("+state.portfolio.length+")" : t==="acquire" ? "Acquire ("+state.acquisitions.length+")" : t==="develop" ? "Develop ("+state.devSites.length+")" : t==="markets" ? "\uD83C\uDF0D Markets" : "Team"}
              </button>
            ))}
          </div>

          {tab === "portfolio" && (
            <>
              <div style={{ display:"flex",gap:"10px",marginBottom:"10px",alignItems:"stretch" }}>
                <div style={{ flex:1,background:"rgba(255,255,255,0.07)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:"8px",padding:"10px 12px",display:"flex",flexDirection:"column",justifyContent:"center",gap:"8px" }}>
                  <div style={{ fontSize:"9px",fontWeight:700,color:"#ffffff",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px" }}>Portfolio P&L</div>
                  {/* Revenue */}
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.7)",fontWeight:600 }}>Gross Rental Income</span><span style={{ fontSize:"10px",fontWeight:700,color:"#34d399" }}>{fmtM(m.totalGRI)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:"8px" }}><span style={{ fontSize:"8px",color:"rgba(255,255,255,0.5)" }}>SC recovery</span><span style={{ fontSize:"9px",fontWeight:600,color:"rgba(255,255,255,0.5)" }}>{fmtK(m.scRecoveryIncome||0)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:"8px" }}><span style={{ fontSize:"8px",color:"rgba(255,255,255,0.5)" }}>Sundry / other</span><span style={{ fontSize:"9px",fontWeight:600,color:"rgba(255,255,255,0.5)" }}>{fmtK(m.sundryIncome||0)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"2px",marginTop:"2px" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.8)",fontWeight:700 }}>Gross Revenue</span><span style={{ fontSize:"10px",fontWeight:800,color:"#34d399" }}>{fmtM(m.grossRevenue||0)}</span></div>
                  {/* Property Opex */}
                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:"4px" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.7)",fontWeight:600 }}>Property Opex (irrecoverable)</span><span style={{ fontSize:"10px",fontWeight:700,color:"#f87171" }}>({fmtM(m.totalPropCosts)})</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:"8px" }}><span style={{ fontSize:"8px",color:"rgba(255,255,255,0.45)" }}>Void rates + SC shortfall</span><span style={{ fontSize:"9px",fontWeight:600,color:"#fbbf24" }}>{fmtK(m.totalVoidCost)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:"8px" }}><span style={{ fontSize:"8px",color:"rgba(255,255,255,0.45)" }}>Insurance</span><span style={{ fontSize:"9px",fontWeight:600,color:"rgba(255,255,255,0.5)" }}>{fmtK(m.totalInsurance||0)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:"8px" }}><span style={{ fontSize:"8px",color:"rgba(255,255,255,0.45)" }}>Maintenance drag</span><span style={{ fontSize:"9px",fontWeight:600,color:"rgba(255,255,255,0.5)" }}>{fmtK(m.totalMaintDrag||0)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:"8px" }}><span style={{ fontSize:"8px",color:"rgba(255,255,255,0.45)" }}>Property mgmt fee</span><span style={{ fontSize:"9px",fontWeight:600,color:"rgba(255,255,255,0.5)" }}>{fmtK(m.totalMgmtFee||0)}</span></div>
                  {/* NPI */}
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.12)",paddingTop:"3px",marginTop:"3px" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.8)",fontWeight:700 }}>Net Property Income</span><span style={{ fontSize:"10px",fontWeight:800,color:m.totalNPI < 0 ? "#ff6b6b" : "#34d399" }}>{fmtM(m.totalNPI)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.7)",fontWeight:600 }}>G&A (team salaries)</span><span style={{ fontSize:"10px",fontWeight:700,color:"#f87171" }}>({fmtK(m.gaExp||0)})</span></div>
                  {/* EBITDA / NOI */}
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.15)",paddingTop:"3px",marginTop:"3px",background:"rgba(255,255,255,0.03)",margin:"3px -4px 0",padding:"3px 4px",borderRadius:"3px" }}><span style={{ fontSize:"9px",color:"#ffffff",fontWeight:800 }}>EBITDA / NOI</span><span style={{ fontSize:"11px",fontWeight:900,color:m.noi < 0 ? "#ff6b6b" : "#34d399" }}>{fmtM(m.ebitda||0)}</span></div>
                  {/* Below the line */}
                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:"4px" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.6)",fontWeight:600 }}>Depreciation</span><span style={{ fontSize:"9px",fontWeight:600,color:"#f87171" }}>({fmtK(m.depreciation||0)})</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.6)",fontWeight:600 }}>Debt interest</span><span style={{ fontSize:"9px",fontWeight:600,color:m.debtInterest > 0 ? "#f87171" : "rgba(255,255,255,0.4)" }}>{m.debtInterest > 0 ? "("+fmtK(m.debtInterest)+")" : "—"}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.10)",paddingTop:"2px",marginTop:"2px" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.7)",fontWeight:700 }}>Earnings Before Tax</span><span style={{ fontSize:"10px",fontWeight:800,color:(m.ebt||0) < 0 ? "#ff6b6b" : "#e2e8f0" }}>{fmtM(m.ebt||0)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.6)",fontWeight:600 }}>Tax (20%)</span><span style={{ fontSize:"9px",fontWeight:600,color:"rgba(255,255,255,0.5)" }}>({fmtK(m.tax||0)})</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,0.18)",paddingTop:"3px",marginTop:"3px",background:"rgba(255,255,255,0.04)",margin:"3px -4px 0",padding:"4px 4px",borderRadius:"3px" }}><span style={{ fontSize:"9px",color:"#ffffff",fontWeight:900 }}>Net Income</span><span style={{ fontSize:"12px",fontWeight:900,color:(m.netIncome||0) < 0 ? "#ff6b6b" : "#34d399" }}>{fmtM(m.netIncome||0)}</span></div>
                  {/* Occupancy bar */}
                  <div style={{ marginTop:"6px" }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><span style={{ fontSize:"9px",color:"rgba(255,255,255,0.7)",fontWeight:600 }}>Avg Occupancy</span><span style={{ fontSize:"12px",fontWeight:800,color:m.avgOcc>0.85?"#34d399":m.avgOcc>0.6?"#fbbf24":"#f87171" }}>{fmtP(m.avgOcc)}</span></div><div style={{ width:"100%",height:"5px",background:"rgba(255,255,255,0.12)",borderRadius:"3px",marginTop:"2px" }}><div style={{ height:"100%",width:(m.avgOcc*100)+"%",background:m.avgOcc>0.85?"#34d399":m.avgOcc>0.6?"#fbbf24":"#f87171",borderRadius:"3px",transition:"width 0.4s" }} /></div></div>
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
                      <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid "+(isStrained?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.08)"),borderRadius:"7px",padding:"6px 8px" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px" }}>
                          <span style={{ fontSize:"9px",fontWeight:700,color:T.txtM,letterSpacing:"0.1em",textTransform:"uppercase" }}>Team ({totalHC})</span>
                          <span style={{ fontSize:"9px",fontWeight:700,color:isStrained?"#f87171":"#34d399" }}>{amCount} AM : {opAssets} assets</span>
                        </div>
                        {roles.map(r => (
                          <div key={r.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1px 0" }}>
                            <span style={{ fontSize:"9px",color:T.txtD }}>{r.icon} {r.name}</span>
                            <span style={{ fontSize:"10px",fontWeight:700,color:T.txt }}>{r.count}</span>
                          </div>
                        ))}
                        {totalHC === 0 && <div style={{ fontSize:"9px",color:T.txtM,textAlign:"center",padding:"2px 0" }}>No team hired</div>}
                        {isStrained && (
                          <div style={{ marginTop:"4px",padding:"3px 6px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:"4px",fontSize:"8px",color:"#f87171",lineHeight:1.4 }}>
                            {"\u26A0\uFE0F"} AMs overstretched ({ratio === Infinity ? "no AMs" : ratio.toFixed(1)+" assets/AM"}) — occupancy &amp; repairs at risk. Hire more AMs for 4:1 ratio.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
              {!state.portfolio.length && <div style={S.empty}>No assets yet. Go to Acquire.</div>}
              {state.portfolio.map(a => <AssetCard key={a.id} asset={a} onMaint={onMaint} onDispose={onDispose} onFix={onFix} />)}
            </>
          )}
          {tab === "acquire" && (<><div style={S.sec}>Available Acquisitions</div>{!state.acquisitions.length && <div style={S.empty}>No assets on market.</div>}{state.acquisitions.map(a => <AcqCard key={a.id} asset={a} onAcquire={onAcquire} ok={state.cash >= a.askPrice} />)}</>)}
          {tab === "develop" && (<><div style={S.sec}>Development Opportunities</div>{!state.devSites.length && <div style={S.empty}>No sites available.</div>}{state.devSites.map(s => <DevCard key={s.id} site={s} onDev={onDev} ok={state.cash >= s.devCost} />)}</>)}
          {tab === "team" && (<><TeamPanel team={state.team} onHire={onHire} onFire={onFire} />{(state.team?.treasury||0) >= 1 && <div style={{ marginTop:"12px" }}><div style={S.sec}>Debt Financing</div><FinancingPanel state={state} onDrawDebt={onDrawDebt} onRepayDebt={onRepayDebt} /></div>}</>)}
          {tab === "markets" && <MarketIntelPanel marketData={state.marketData} />}
        </div>

        <div style={S.rp}>
          <div style={S.tabs}>
            {["sentiment","charts","events"].map(t => {
              const biCount = state.team?.bi || 0;
              const label = t==="sentiment" ? "Board" : t==="charts" ? (biCount > 0 ? "Charts ("+biCount+")" : "\u{1F512} Charts") : "Events";
              return <button key={t} style={tabSt(rTab===t)} onClick={() => setRTab(t)}>{label}</button>;
            })}
          </div>

          {rTab === "sentiment" && (() => {
            const { sentiments, boardComments } = genSentiment(m, state.history, state);
            const bScore = calcBoardScore(m, state);
            const scoreColor = bScore >= 65 ? "#34d399" : bScore >= 35 ? "#fbbf24" : "#f87171";
            const scoreLabel = bScore >= 75 ? "EXCELLENT" : bScore >= 60 ? "STRONG" : bScore >= 45 ? "DEVELOPING" : bScore >= 25 ? "WEAK" : "CRITICAL";
            return (
              <div>
                <div style={{ ...S.card, marginBottom:"10px", textAlign:"center", padding:"16px 12px" }}>
                  <div style={{ fontSize:"9px",fontWeight:700,color:T.txtD,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Investor Satisfaction</div>
                  <div style={{ fontSize:"42px",fontWeight:900,color:scoreColor,lineHeight:1 }}>{bScore}<span style={{ fontSize:"18px",fontWeight:700,color:T.txtM }}>/100</span></div>
                  <div style={{ fontSize:"11px",fontWeight:800,color:scoreColor,letterSpacing:"0.08em",marginTop:"6px" }}>{scoreLabel}</div>
                  <div style={{ fontSize:"9px",color:T.txtD,marginTop:"4px" }}>Based on IRR, occupancy, NOI yield, ESG &amp; scale</div>
                </div>
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
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px" }}><span style={{ fontSize:"11px",fontWeight:700,color:T.txt }}>{s.metric}</span><SentBadge mood={s.mood} label={s.label} /></div>
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

          {rTab === "charts" && (() => {
            const biCount = state.team?.bi || 0;
            const allCharts = [{l:"Portfolio GAV",k:"totalGAV",c:T.acc,f:fmtM},{l:"Occupancy",k:"avgOcc",c:T.grn,f:fmtP},{l:"NOI p.a.",k:"noi",c:"#10b981",f:fmtM},{l:"Cash",k:"cash",c:T.amb,f:fmtM}];
            if (biCount === 0) return (<div style={{ textAlign:"center",padding:"32px 20px" }}><div style={{ fontSize:"40px",marginBottom:"12px" }}>{"\u{1F512}"}</div><div style={{ fontSize:"14px",fontWeight:700,color:T.wht,marginBottom:"6px" }}>Charts Locked</div><div style={{ fontSize:"11px",color:T.txtD,lineHeight:1.6,marginBottom:"16px" }}>Hire a <span style={{ color:T.acc,fontWeight:700 }}>Business Intelligence</span> analyst to unlock data views.</div><div style={{ fontSize:"10px",color:T.txtM }}>Team {"\u2192"} Business Intelligence</div></div>);
            const visibleCharts = allCharts.slice(0, biCount);
            const lockedCount = allCharts.length - biCount;
            return (
              <div>
                {state.history.length < 2 ? <div style={S.empty}>Advance a few quarters to see data.</div> : visibleCharts.map(ch => {
                  const latestVal = state.history[state.history.length-1]?.[ch.k]||0;
                  const isNegative = latestVal < 0;
                  return (<div key={ch.k}><div style={S.sec}>{ch.l}</div><div style={{ ...S.card, padding:"8px 12px", marginBottom:"7px", border:isNegative?"1px solid rgba(239,68,68,0.4)":"1px solid rgba(255,255,255,0.25)" }}><div style={{ display:"flex",justifyContent:"space-between",marginBottom:"4px" }}><span style={{ fontSize:"10px",color:T.txtD }}>{ch.l}</span><span style={{ fontSize:"14px",fontWeight:800,color:isNegative?"#ff6b6b":T.wht }}>{ch.f(latestVal)}</span></div><Spark data={state.history.map(h => h[ch.k])} color={isNegative?"#ef4444":ch.c} height={48} /></div></div>);
                })}
                {lockedCount > 0 && <div style={{ ...S.card, textAlign:"center",padding:"12px",opacity:0.5,borderStyle:"dashed" }}><span style={{ fontSize:"10px",color:T.txtM }}>{"\u{1F512}"} {lockedCount} more chart{lockedCount>1?"s":""} locked — hire more BI analysts</span></div>}
              </div>
            );
          })()}

          {rTab === "events" && (<div style={S.evLog}>{!state.events.length && <div style={S.empty}>Advance to begin.</div>}{[...state.events].reverse().map((e, i) => <div key={i} style={S.evItem}>{e}</div>)}</div>)}
        </div>
      </div>
    </div>
  );
}
