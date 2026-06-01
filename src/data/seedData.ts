import { CompanyData, SupplyChainStage, SupplyChainAlert } from "../types";

export const SEED_COMPANIES: CompanyData[] = [
  {
    id: "apple",
    name: "Apple Inc.",
    sector: "Consumer Electronics",
    headquarters: "Cupertino, California, USA",
    globalRiskScore: 42,
    description: "Multinational technology company famous for hardware and complex dual-source global manufacturing cycles.",
    nodes: [
      {
        id: "apple-node-1",
        name: "Democratic Republic of the Congo (Cobalt Mines)",
        stage: SupplyChainStage.SOURCING,
        lat: -10.72,
        lng: 25.47,
        riskScore: 78,
        riskReason: "High geopolitical instability risks, regulatory compliance challenges on artisanal mining, and logistics bottlenecks via African transit corridors.",
        locationName: "Katanga Province, DRC",
        dependentCompanies: ["Apple Inc.", "Tesla", "Samsung"],
        sources: [
          { title: "Reuters DRC Mining Policy Update", url: "https://www.reuters.com/markets/commodities/" },
          { title: "Bloomberg Cobalt Sourcing Report", url: "https://www.bloomberg.com/news/articles/" }
        ],
        eventSeverity: 9,
        supplierCriticality: 10,
        proximity: 9,
        recency: 1
      },
      {
        id: "apple-node-2",
        name: "TSMC Semiconductor Foundries (Hsinchu)",
        stage: SupplyChainStage.PROCESSING,
        lat: 24.78,
        lng: 121.0,
        riskScore: 65,
        riskReason: "Extreme concentration of cutting-edge silicon wafers (3nm/5nm). Susceptibility to regional seismic events and geopolitical cross-strait trade tensions.",
        locationName: "Hsinchu Science Park, Taiwan",
        dependentCompanies: ["Apple Inc.", "Nvidia", "Samsung"],
        sources: [
          { title: "Nikkei Asia Semiconductor Track", url: "https://asia.nikkei.com/Business/Tech/Semiconductors" },
          { title: "Wall Street Journal TSMC Strategy", url: "https://www.wsj.com/news/technology" }
        ],
        eventSeverity: 8,
        supplierCriticality: 10,
        proximity: 8,
        recency: 1
      },
      {
        id: "apple-node-3",
        name: "Foxconn Zhengzhou Assembly Hub (iPhone City)",
        stage: SupplyChainStage.ASSEMBLY,
        lat: 34.74,
        lng: 113.62,
        riskScore: 45,
        riskReason: "High dependence on localized assembly labor pools, localized power grid caps, and strict inland cargo clearance protocols.",
        locationName: "Zhengzhou, Henan, China",
        dependentCompanies: ["Apple Inc."],
        sources: [
          { title: "Bloomberg Zhengzhou Factory Output Analysis", url: "https://www.bloomberg.com/" },
          { title: "Financial Times Technology Sourcing", url: "https://www.ft.com/companies/technology" }
        ],
        eventSeverity: 5,
        supplierCriticality: 9,
        proximity: 9,
        recency: 1
      },
      {
        id: "apple-node-4",
        name: "Port of Shanghai Logistics Gateway",
        stage: SupplyChainStage.LOGISTICS,
        lat: 31.23,
        lng: 121.47,
        riskScore: 35,
        riskReason: "Seasonal typhoon threats, container ship queues, and customs backlog during peak shipment cycles prior to product launch schedules.",
        locationName: "Shanghai Port, China",
        dependentCompanies: ["Apple Inc.", "Tesla", "Nvidia", "Toyota", "Samsung"],
        sources: [
          { title: "Maritime Bulletin上海 Port Scheds", url: "https://www.maritimebulletin.net" },
          { title: "Lloyds List Global Shipping Congestion", url: "https://lloydslist.maritimeintelligence.informa.com/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 8,
        proximity: 9,
        recency: 1
      },
      {
        id: "apple-node-5",
        name: "North America Distribution Hub",
        stage: SupplyChainStage.DISTRIBUTION,
        lat: 33.74,
        lng: -118.26,
        riskScore: 28,
        riskReason: "Intermodal rail capacity shortages and labor contract negotiation frictions, causing mild unloading delays.",
        locationName: "Port of Long Beach, Los Angeles, USA",
        dependentCompanies: ["Apple Inc.", "Tesla", "Nvidia", "Toyota", "Samsung"],
        sources: [
          { title: "CNBC Logistics Report Long Beach", url: "https://www.cnbc.com/transportation/" }
        ],
        eventSeverity: 4,
        supplierCriticality: 8,
        proximity: 8,
        recency: 1
      }
    ]
  },
  {
    id: "tesla",
    name: "Tesla",
    sector: "Automotive / Clean Energy",
    headquarters: "Austin, Texas, USA",
    globalRiskScore: 55,
    description: "Electric vehicle and battery innovator reliant on immediate raw material inputs and high-output Gigafactories worldwide.",
    nodes: [
      {
        id: "tesla-node-1",
        name: "Western Australia Lithium Mines",
        stage: SupplyChainStage.SOURCING,
        lat: -31.95,
        lng: 115.86,
        riskScore: 32,
        riskReason: "Stable operations but prone to severe tropical weather (cyclones) interrupting railway lines to shipping ports.",
        locationName: "Pilbara Region, Western Australia",
        dependentCompanies: ["Tesla", "Samsung", "Toyota"],
        sources: [
          { title: "Mining Technology Lithium Supply Index", url: "https://www.mining-technology.com/" }
        ],
        eventSeverity: 4,
        supplierCriticality: 8,
        proximity: 10,
        recency: 1
      },
      {
        id: "tesla-node-2",
        name: "Sino-German Chemical Refining Hub",
        stage: SupplyChainStage.PROCESSING,
        lat: 51.5,
        lng: 11.5,
        riskScore: 50,
        riskReason: "Energy transition supply squeezes and critical shortages in high-purity chemical processing components.",
        locationName: "Halle-Leipzig Hub, Germany",
        dependentCompanies: ["Tesla", "Toyota"],
        sources: [
          { title: "Energy Intelligence European Chemical Energy Crisis", url: "https://www.energyintel.com/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 10,
        proximity: 10,
        recency: 1
      },
      {
        id: "tesla-node-3",
        name: "Gigafactory Texas (Final Assembly)",
        stage: SupplyChainStage.ASSEMBLY,
        lat: 30.26,
        lng: -97.74,
        riskScore: 25,
        riskReason: "Regional extreme weather threats (grid instability due to winter freezes/heatwaves) and skilled workforce bottlenecks.",
        locationName: "Austin, Texas, USA",
        dependentCompanies: ["Tesla"],
        sources: [
          { title: "Houston Chronicle ERCOT Grid Tracker", url: "https://www.chron.com/" }
        ],
        eventSeverity: 3,
        supplierCriticality: 9,
        proximity: 9,
        recency: 1
      },
      {
        id: "tesla-node-4",
        name: "Port of Rotterdam Deep Sea Logistics Hub",
        stage: SupplyChainStage.LOGISTICS,
        lat: 51.92,
        lng: 4.47,
        riskScore: 38,
        riskReason: "Recent labor wage strikes and container handling delay spikes due to diversion of vessels around the Cape of Good Hope.",
        locationName: "Rotterdam, Netherlands",
        dependentCompanies: ["Tesla", "Toyota", "Samsung"],
        sources: [
          { title: "Reuters Rotterdam Terminal Status", url: "https://www.reuters.com/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 8,
        proximity: 9,
        recency: 1
      }
    ]
  },
  {
    id: "nvidia",
    name: "Nvidia",
    sector: "Semiconductors",
    headquarters: "Santa Clara, California, USA",
    globalRiskScore: 68,
    description: "GPU designer with extreme supply concentration for specialized advanced packaging and silicon foundry services.",
    nodes: [
      {
        id: "nvidia-node-1",
        name: "Sourcing of High-Purity Silicon",
        stage: SupplyChainStage.SOURCING,
        lat: 35.67,
        lng: 139.65,
        riskScore: 30,
        riskReason: "Relatively stable supplier network but highly dependent on Japanese chemical firms that operate in earthquake-prone zones.",
        locationName: "Kanto Region, Japan",
        dependentCompanies: ["Nvidia", "Samsung", "Apple Inc."],
        sources: [
          { title: "Nikkei Silicon Sourcing Status Map", url: "https://asia.nikkei.com/" }
        ],
        eventSeverity: 4,
        supplierCriticality: 8,
        proximity: 9,
        recency: 1
      },
      {
        id: "nvidia-node-2",
        name: "Advanced Packaging Fab (CoWoS Taiwan)",
        stage: SupplyChainStage.PROCESSING,
        lat: 22.62,
        lng: 120.3,
        riskScore: 82,
        riskReason: "Critical single-source bottleneck for CoWoS packaging. Substantial lead times exceeding 9 months due to overwhelming AI chip demand.",
        locationName: "Kaohsiung Science Park, Taiwan",
        dependentCompanies: ["Nvidia"],
        sources: [
          { title: "Bloomberg Taiwan Silicon Sourcing Delays", url: "https://www.bloomberg.com/" },
          { title: "Semiconduter Digest CoWoS Capacity", url: "https://www.semiconductor-digest.com" }
        ],
        eventSeverity: 9,
        supplierCriticality: 10,
        proximity: 9,
        recency: 1
      },
      {
        id: "nvidia-node-3",
        name: "US West Coast AI Assembly & Validation",
        stage: SupplyChainStage.ASSEMBLY,
        lat: 37.35,
        lng: -121.95,
        riskScore: 20,
        riskReason: "Highly modern, rapid validation but exposed to California regulatory overheads and expensive engineering resources.",
        locationName: "Santa Clara, California, USA",
        dependentCompanies: ["Nvidia"],
        sources: [
          { title: "VentureBeat NVIDIA AI Logistics", url: "https://venturebeat.com/" }
        ],
        eventSeverity: 3,
        supplierCriticality: 8,
        proximity: 8,
        recency: 1
      },
      {
        id: "nvidia-node-4",
        name: "Port of Singapore Transshipment Gateway",
        stage: SupplyChainStage.LOGISTICS,
        lat: 1.35,
        lng: 103.82,
        riskScore: 40,
        riskReason: "Increased bunkering traffic and minor vessel stack-ups due to rerouted Indo-Pacific trade lanes.",
        locationName: "Singapore Harbor, Singapore",
        dependentCompanies: ["Nvidia", "Samsung", "Apple Inc.", "Toyota"],
        sources: [
          { title: "Singapore Port Authority Live Feed", url: "https://www.mpa.gov.sg/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 8,
        proximity: 10,
        recency: 1
      }
    ]
  },
  {
    id: "toyota",
    name: "Toyota Motor Corp.",
    sector: "Automotive Manufacturing",
    headquarters: "Toyota City, Aichi, Japan",
    globalRiskScore: 48,
    description: "Renowned 'Just-In-Time' pioneer deeply sensitive to micro-ingredient latency and global transport blockages.",
    nodes: [
      {
        id: "toyota-node-1",
        name: "Indonesian Rubber & Steel Sourcing",
        stage: SupplyChainStage.SOURCING,
        lat: -6.2,
        lng: 106.81,
        riskScore: 45,
        riskReason: "Deforestation regulations causing export certification holdups, and local wet season flash-flooding of iron mining sites.",
        locationName: "Jakarta / Kalimantan, Indonesia",
        dependentCompanies: ["Toyota"],
        sources: [
          { title: "Antara News Borneo Mining Interruptions", url: "https://www.antaranews.com/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 9,
        proximity: 10,
        recency: 1
      },
      {
        id: "toyota-node-2",
        name: "Aichi Automotive Component Plants",
        stage: SupplyChainStage.PROCESSING,
        lat: 35.08,
        lng: 137.15,
        riskScore: 40,
        riskReason: "Highly consolidated electronic component inventory making operations fragile to cyberattacks blockading EDI networks.",
        locationName: "Aichi Prefecture, Japan",
        dependentCompanies: ["Toyota"],
        sources: [
          { title: "Yomiuri Shimbun Toyota EDI Cyber Attack", url: "https://www.yomiuri.co.jp/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 8,
        proximity: 10,
        recency: 1
      },
      {
        id: "toyota-node-3",
        name: "Samut Prakan Assembly Facility",
        stage: SupplyChainStage.ASSEMBLY,
        lat: 13.6,
        lng: 100.6,
        riskScore: 35,
        riskReason: "Severe climate vulnerability (monsoon rain floods) and potential labor pool gaps under revised wage legislation.",
        locationName: "Samut Prakan, Thailand",
        dependentCompanies: ["Toyota"],
        sources: [
          { title: "Bangkok Post Industrial Estate Flooding", url: "https://www.bangkokpost.com/" }
        ],
        eventSeverity: 4,
        supplierCriticality: 9,
        proximity: 9,
        recency: 1
      },
      {
        id: "toyota-node-4",
        name: "Port of Nagoya Strategic Automobile Hub",
        stage: SupplyChainStage.LOGISTICS,
        lat: 35.05,
        lng: 136.88,
        riskScore: 30,
        riskReason: "High cyber resilience but operates near 100% capacity; any docking delay rapidly halts Just-In-Time pipelines in neighboring assembly lines.",
        locationName: "Nagoya, Aichi, Japan",
        dependentCompanies: ["Toyota"],
        sources: [
          { title: "Port Technology Nagoya Port Automation", url: "https://www.porttechnology.org/" }
        ],
        eventSeverity: 4,
        supplierCriticality: 8,
        proximity: 9,
        recency: 1
      }
    ]
  },
  {
    id: "samsung",
    name: "Samsung Electronics",
    sector: "Consumer Tech & Foundry",
    headquarters: "Suwon, Gyeonggi Province, South Korea",
    globalRiskScore: 39,
    description: "Vertically integrated giant with major production capacities in South Korea, Vietnam, and global components sourcing.",
    nodes: [
      {
        id: "samsung-node-1",
        name: "South American Lithium & Rare Earth Mines",
        stage: SupplyChainStage.SOURCING,
        lat: -23.86,
        lng: -68.13,
        riskScore: 60,
        riskReason: "Water scarcity issues for lithium extraction in Atacama basin and potential nationalization policies within South American lithium triangle.",
        locationName: "Atacama Salt Flat, Chile",
        dependentCompanies: ["Samsung", "Tesla", "Apple Inc."],
        sources: [
          { title: "La Tercera Chile Lithium Policy Tracker", url: "https://www.latercera.com/" }
        ],
        eventSeverity: 6,
        supplierCriticality: 10,
        proximity: 10,
        recency: 1
      },
      {
        id: "samsung-node-2",
        name: "Giga-Foundry Memory Fabrication (Pyeongtaek)",
        stage: SupplyChainStage.PROCESSING,
        lat: 36.99,
        lng: 127.08,
        riskScore: 40,
        riskReason: "Complex industrial facility demanding uninterrupted liquid nitrogen and ultra-high pure gas supply which are subject to ocean freight delays.",
        locationName: "Pyeongtaek, South Korea",
        dependentCompanies: ["Samsung", "Apple Inc.", "Nvidia"],
        sources: [
          { title: "Pulse News Samsung Pyeongtaek Fab Expansion", url: "https://pulsenews.co.kr/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 8,
        proximity: 10,
        recency: 1
      },
      {
        id: "samsung-node-3",
        name: "Thai Nguyen Intelligent Assembly Park",
        stage: SupplyChainStage.ASSEMBLY,
        lat: 21.59,
        lng: 105.84,
        riskScore: 38,
        riskReason: "High-density device assembly susceptible to seasonal tropical storms and localized freight delays to Hanoi cargo hubs.",
        locationName: "Thai Nguyen, Vietnam",
        dependentCompanies: ["Samsung"],
        sources: [
          { title: "Vietnam Investment Review Samsung Viet Update", url: "https://vir.com.vn/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 8,
        proximity: 9,
        recency: 1
      },
      {
        id: "samsung-node-4",
        name: "Port of Busan Logistic Nexus",
        stage: SupplyChainStage.LOGISTICS,
        lat: 35.17,
        lng: 129.07,
        riskScore: 28,
        riskReason: "Excellent container efficiency but highly congested with regional East Asian sea transit, facing moderate weather interruptions during winter storms.",
        locationName: "Busan, South Korea",
        dependentCompanies: ["Samsung", "Apple Inc.", "Nvidia", "Toyota"],
        sources: [
          { title: "Korea Herald Busan Port Logistical Flux", url: "https://www.koreaherald.com/" }
        ],
        eventSeverity: 4,
        supplierCriticality: 7,
        proximity: 10,
        recency: 1
      }
    ]
  }
];

export const SEED_ALERTS: SupplyChainAlert[] = [
  {
    id: "alert-1",
    companyName: "Apple Inc.",
    severity: "critical",
    title: "Cobalt Corridor Labor Lockout",
    description: "A sudden rail cargo strike in Katanga transit pathways has halted exports of critical battery-grade raw cobalt, potentially triggering battery manufacturing backlogs within 14 business days.",
    stage: SupplyChainStage.SOURCING,
    timestamp: "18 minutes ago",
    affectedNodeName: "Democratic Republic of the Congo (Cobalt Mines)"
  },
  {
    id: "alert-2",
    companyName: "Nvidia",
    severity: "critical",
    title: "CoWoS Packaging Backlogs Spike",
    description: "An unexpected machinery recalibration cycle has prolonged chip packaging times. Lead times for high-density AI accelerators jumped to an all-time high of 280 days, disrupting commercial shipment commitments.",
    stage: SupplyChainStage.PROCESSING,
    timestamp: "1 hour ago",
    affectedNodeName: "Advanced Packaging Fab (CoWoS Taiwan)"
  },
  {
    id: "alert-3",
    companyName: "Tesla",
    severity: "high",
    title: "Houston Heavy Rainfall Grid Squeeze",
    description: "Intense local storms near Austin have activated emergency grid backups. Energy authorities are calling for industrial demand response, leading to a temporary reduction of multi-shift battery assembly throughput at Giga Texas.",
    stage: SupplyChainStage.ASSEMBLY,
    timestamp: "3 hours ago",
    affectedNodeName: "Gigafactory Texas (Final Assembly)"
  },
  {
    id: "alert-4",
    companyName: "Toyota",
    severity: "high",
    title: "Port of Nagoya EDI Outage Alert",
    description: "A cyber-ransomware threat targetted an international shipping service provider, causing the Nagoya port EDI scheduling server to revert to manual safety overrides and inducing 18-hour vessel docking queues.",
    stage: SupplyChainStage.LOGISTICS,
    timestamp: "6 hours ago",
    affectedNodeName: "Port of Nagoya Strategic Automobile Hub"
  },
  {
    id: "alert-5",
    companyName: "Samsung Electronics",
    severity: "medium",
    title: "Chilean Lithium Plain Water Regulatory Cap",
    description: "Local environmental regulators have voted to cap high-temperature water pumping rates around the Atacama Basin, leading to a projected 5% raw lithium brine extraction volume reduction over the next quarter.",
    stage: SupplyChainStage.SOURCING,
    timestamp: "12 hours ago",
    affectedNodeName: "South American Lithium & Rare Earth Mines"
  }
];
