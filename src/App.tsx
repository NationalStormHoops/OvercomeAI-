import React, { useState, useEffect, useMemo } from "react";
import { CompanyData, SupplyChainNode, SupplyChainStage, SupplyChainAlert } from "./types";
import { SEED_COMPANIES, SEED_ALERTS } from "./data/seedData";
import WorldMap from "./components/WorldMap";
import SupplyChainTable from "./components/SupplyChainTable";
import { 
  Building2, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Search, 
  TrendingUp, 
  CheckCircle, 
  ShieldAlert, 
  RefreshCw, 
  Sliders, 
  Compass, 
  ArrowUpRight, 
  VolumeX, 
  FileCheck,
  Send,
  HelpCircle,
  Globe
} from "lucide-react";

export default function App() {
  // Main Data States with dynamic formula calculation
  const [companies, setCompanies] = useState<CompanyData[]>(() => {
    return SEED_COMPANIES.map(company => {
      const updatedNodes = company.nodes.map(node => {
        const calculatedScore = Math.max(1, Math.min(100, Math.round(
          (node.eventSeverity * node.supplierCriticality * node.proximity) / (node.recency * 10)
        )));
        return { ...node, riskScore: calculatedScore };
      });
      const avgScore = Math.round(
        updatedNodes.reduce((acc, n) => acc + n.riskScore, 0) / updatedNodes.length
      );
      return {
        ...company,
        nodes: updatedNodes,
        globalRiskScore: avgScore,
      };
    });
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("apple");
  const [alerts, setAlerts] = useState<SupplyChainAlert[]>(SEED_ALERTS);
  
  // Interaction States
  const [selectedNode, setSelectedNode] = useState<SupplyChainNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SupplyChainNode | null>(null);
  const [activeTab, setActiveTab ] = useState<"map" | "table" | "alerts" | "modeling">("table");

  // Telemetry fluctuation state to represent "real-time" streams
  const [telemetryTick, setTelemetryTick] = useState<number>(0);
  const [currentMacroNews, setCurrentMacroNews] = useState<string>(
    "GLOBAL SHIFT: Panama Canal daily transit slots restricted due to low water levels; shipping costs fluctuate."
  );
  const [activeTelemetryLog, setActiveTelemetryLog] = useState<string[]>([]);

  // Form states for custom company generation
  const [topMode, setTopMode] = useState<"public" | "custom">("public");
  const [customSimilarId, setCustomSimilarId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customSector, setCustomSector] = useState("");
  const [customFocus, setCustomFocus] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);

  // Server credentials state
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  // Fetch API configurations on boot
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setHasGeminiKey(data.hasGeminiKey);
      })
      .catch((err) => console.log("Config read error:", err));
  }, []);

  // Periodic risk simulation generator representing live telemetry streams
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick((prev) => prev + 1);
      
      // Randomly change an underlying metric parameter to trigger micro-shifts
      setCompanies((prevCompanies) => {
        return prevCompanies.map((c) => {
          const updatedNodes = c.nodes.map((node) => {
            // Pick a random node or simulate occasional micro shifts
            if (Math.random() > 0.6) {
              const metricToFluctuate = Math.random() > 0.5 ? "eventSeverity" : "proximity";
              const delta = Math.random() > 0.5 ? 1 : -1;
              const currentVal = node[metricToFluctuate];
              const newVal = Math.max(1, Math.min(10, currentVal + delta));
              
              const updatedNode = { ...node, [metricToFluctuate]: newVal };
              const newScore = Math.max(1, Math.min(100, Math.round(
                (updatedNode.eventSeverity * updatedNode.supplierCriticality * updatedNode.proximity) / (updatedNode.recency * 10)
              )));
              
              return { ...updatedNode, riskScore: newScore };
            }
            return node;
          });
          
          // Re-calculate average score
          const avgScore = Math.round(
            updatedNodes.reduce((acc, n) => acc + n.riskScore, 0) / updatedNodes.length
          );

          return {
            ...c,
            nodes: updatedNodes,
            globalRiskScore: avgScore,
          };
        });
      });

      // Generate simulated macro news events impacting all global companies
      const newsEvents = [
        "GLOBAL SHORTAGE: Severe lithium supply deficit expected to raise battery pack sourcing prices by 12%.",
        "INTEREST RATES: Federal Reserve holds benchmark rates steady; currency volatility impacts cross-border invoicing.",
        "MACRO DISRUPTION: Panama Canal authority cuts daily traffic by 20% due to persistent meteorological drought.",
        "ENERGY SUPPLY: European natural gas indices surge 6%, raising operating costs across automated assembly lines.",
        "LABOR DISRUPTION: Threat of labor strikes grows at major West Coast ports, shifting maritime logistics strategies.",
        "TRADE TARIFFS: New global semiconductor manufacturing tariffs announced; companies accelerate dual-sourcing.",
        "CHOKEPOINT ALERT: Extreme weather over Southeast Asian maritime straits delays liquid cargo flow vectors.",
        "INFRASTRUCTURE: Port of Shanghai introduces high-efficiency container stacking cranes, reducing turn times by 5%.",
        "RAW MATERIALS: Global bauxite export caps introduced, threatening primary aerospace aluminum supply chains.",
        "REGULATORY SHIFT: New strict scope carbon tracking rules enacted globally, driving high-green compliance efforts."
      ];
      
      const randomNews = newsEvents[Math.floor(Math.random() * newsEvents.length)];
      setCurrentMacroNews(randomNews);

      setActiveTelemetryLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ${randomNews}`,
        ...prev.slice(0, 4)
      ]);
      
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  // Set the current selected company object
  const activeCompany = useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  // Combine alerts dynamically
  const activeCompanyAlerts = useMemo(() => {
    return alerts.filter(
      (a) => a.companyName.toLowerCase() === activeCompany.name.toLowerCase()
    );
  }, [alerts, activeCompany]);

  // Filters companies based on active mode (public browse vs custom simulation)
  const filteredCompanies = useMemo(() => {
    if (topMode === "public") {
      return companies.filter(c => !c.id.startsWith("custom") && !c.id.includes("custom"));
    } else {
      return companies.filter(c => c.id.startsWith("custom") || c.id.includes("custom"));
    }
  }, [companies, topMode]);

  const hasCustomCompanies = useMemo(() => {
    return companies.some(c => c.id.startsWith("custom") || c.id.includes("custom"));
  }, [companies]);

  // Reset selected node when switching companies
  useEffect(() => {
    if (activeCompany.nodes.length > 0) {
      setSelectedNode(activeCompany.nodes[0]);
    } else {
      setSelectedNode(null);
    }
  }, [selectedCompanyId]);

  // Synchronize selectedNode with state updates in companies
  useEffect(() => {
    if (selectedNode) {
      const activeCo = companies.find(c => c.id === selectedCompanyId);
      if (activeCo) {
        const matchedNode = activeCo.nodes.find(n => n.id === selectedNode.id);
        if (matchedNode && (
          matchedNode.riskScore !== selectedNode.riskScore ||
          matchedNode.eventSeverity !== selectedNode.eventSeverity ||
          matchedNode.supplierCriticality !== selectedNode.supplierCriticality ||
          matchedNode.proximity !== selectedNode.proximity ||
          matchedNode.recency !== selectedNode.recency
        )) {
          setSelectedNode(matchedNode);
        }
      }
    }
  }, [companies, selectedCompanyId, selectedNode?.id]);

  const handleUpdateNodeMetric = (nodeId: string, metric: 'eventSeverity' | 'supplierCriticality' | 'proximity' | 'recency', value: number) => {
    setCompanies((prevCompanies) => {
      return prevCompanies.map((c) => {
        if (!c.nodes.some(n => n.id === nodeId)) return c;
        
        const updatedNodes = c.nodes.map((node) => {
          if (node.id === nodeId) {
            const updatedNode = { ...node, [metric]: value };
            const newScore = Math.max(1, Math.min(100, Math.round(
              (updatedNode.eventSeverity * updatedNode.supplierCriticality * updatedNode.proximity) / (updatedNode.recency * 10)
            )));
            return { ...updatedNode, riskScore: newScore };
          }
          return node;
        });
        
        const avgScore = Math.round(
          updatedNodes.reduce((acc, n) => acc + n.riskScore, 0) / updatedNodes.length
        );
        
        return {
          ...c,
          nodes: updatedNodes,
          globalRiskScore: avgScore
        };
      });
    });
  };

  // Triggered on user submission of raw supply chain info
  const handleCustomCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setAnalysisError("Please provide a valid company name.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisSuccess(false);

    try {
      const response = await fetch("/api/analyze-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: customName,
          sector: customSector,
          description: customFocus,
          similarCompany: companies.find(c => c.id === customSimilarId)?.name || ""
        }),
      });

      if (!response.ok) {
        throw new Error("Logistics server failure during calculation.");
      }

      const rawResult = await response.json();
      
      // Build proper ID from response
      const serverId = rawResult.id || customName.toLowerCase().replace(/\s+/g, "-");

      const newCompanyObj: CompanyData = {
        id: serverId,
        name: rawResult.name || customName,
        sector: rawResult.sector || customSector || "Technology",
        headquarters: rawResult.headquarters || "Global Division",
        description: rawResult.description || customFocus,
        globalRiskScore: rawResult.globalRiskScore || 45,
        nodes: (rawResult.nodes || []).map((node: any, idx: number) => ({
          ...node,
          stage: Object.values(SupplyChainStage).includes(node.stage) 
            ? (node.stage as SupplyChainStage)
            : SupplyChainStage.SOURCING,
          id: node.id || `${serverId}-node-${idx}`,
        }))
      };

      // Add to companies list
      setCompanies((prev) => {
        // Ensure we don't have duplicate IDs
        const filtered = prev.filter((c) => c.id !== serverId);
        return [...filtered, newCompanyObj];
      });

      // Add their specific alerts as well
      if (rawResult.alerts && Array.isArray(rawResult.alerts)) {
        const parsedAlerts: SupplyChainAlert[] = rawResult.alerts.map((al: any, idx: number) => ({
          ...al,
          id: al.id || `${serverId}-alert-${idx}`,
          companyName: newCompanyObj.name,
          stage: Object.values(SupplyChainStage).includes(al.stage) 
            ? (al.stage as SupplyChainStage)
            : SupplyChainStage.SOURCING,
          timestamp: al.timestamp || "Just Now"
        }));
        setAlerts((prev) => [...parsedAlerts, ...prev]);
      }

      // Switch selection
      setSelectedCompanyId(serverId);
      setAnalysisSuccess(true);
      setActiveTab("table");
      
      // Clear inputs
      setCustomName("");
      setCustomSector("");
      setCustomFocus("");
      setCustomSimilarId("");

      // Alert user politely about simulation fallback if key was empty
      if (rawResult.isSimulated) {
        setAnalysisError(
          rawResult.errorMessage || "Mapped successfully using high-fidelity local modeling engine (No Gemini key defined in secrets)."
        );
      }

    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Unable to generate supply chain index. Verify network configurations.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper for company risk badge colors
  const getGlobalRiskLevel = (score: number) => {
    if (score >= 60) return { label: "CRITICAL SHELF VULNERABILITY", color: "text-red-600 bg-red-50 border-red-200" };
    if (score >= 40) return { label: "ELEVATED CONGESTION RISK", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { label: "RESILIENT OPERATION CAPABILITY", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 antialiased">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md flex items-center justify-center">
              <ShieldAlert className="h-5.5 w-5.5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight whitespace-nowrap bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  RESILIENT RISK ANALYTICS
                </span>
                <span className="text-[9px] bg-blue-500/15 border border-blue-500/35 text-blue-400 font-extrabold px-1.5 py-0.5 rounded tracking-widest uppercase">
                  V4.2 LIVE
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400">Forensic Bottleneck Sourcing & Disruption Predictive Index</p>
            </div>
          </div>

          {/* Top Level Mode Menu Toggle Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 shadow-inner select-none shrink-0" id="top-level-menu">
            <button
              onClick={() => {
                setTopMode("public");
                if (activeTab === "modeling") {
                  setActiveTab("table");
                }
                const firstPublic = companies.find(c => !c.id.startsWith("custom") && !c.id.includes("custom"));
                if (firstPublic && (selectedCompanyId.startsWith("custom") || selectedCompanyId.includes("custom"))) {
                  setSelectedCompanyId(firstPublic.id);
                }
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                topMode === "public"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Browse Public Data
            </button>
            <button
              onClick={() => {
                setTopMode("custom");
                const customCos = companies.filter(c => c.id.startsWith("custom") || c.id.includes("custom"));
                if (customCos.length > 0) {
                  setSelectedCompanyId(customCos[0].id);
                  setActiveTab("table");
                } else {
                  setActiveTab("modeling");
                }
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                topMode === "custom"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" /> Enter Your Company Data
            </button>
          </div>

          {/* Core Telemetry Feed Indicator */}
          <div className="hidden xl:flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 max-w-sm">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
              <span className="text-emerald-400 font-semibold uppercase">NEWS:</span>{" "}
              {currentMacroNews}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col gap-6">
        
        {topMode === "custom" && !hasCustomCompanies ? (
          /* ONBOARDING STATE: Show highly polished, centered Resilience Modeling Lab */
          <div className="rounded-2xl border border-gray-150 bg-white p-6 md:p-8 shadow-xs flex flex-col lg:flex-row gap-8 items-stretch" id="custom-onboarding-panel">
            <div className="flex-1 flex flex-col justify-between gap-6 pr-0 lg:pr-6">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600 shadow-xs">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 text-lg">
                      Resilience Modeling Lab
                    </h3>
                    <p className="text-xs text-gray-500">
                      Simulate custom facility chains & correlate with standard global pipelines.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Model how micro-disruptions, shipping bottlenecks, or transit shortages propagate through custom coordinates. Enter your parameters below or select an enterprise archetype that your supply chain resembles to pre-populate.
                </p>

                <div className="space-y-3.5 p-4.5 rounded-xl bg-slate-50 border border-slate-150 mb-4">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> Custom Architecture Benefits
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-normal">
                    <li><strong>Template Matching:</strong> Align your custom facilities against key regional semiconductor foundries or metallurgical mills.</li>
                    <li><strong>Automated Routing Maps:</strong> Instantly plot calculated transshipment routes on the interactive risk map.</li>
                    <li><strong>Telemetrical Feeds:</strong> Audits risk factors based on real-time simulated global conditions.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10.5px] text-gray-400 italic">
                <HelpCircle className="h-4 w-4 shrink-0 text-gray-300" />
                * Coordinates and custom safety index metrics will update dynamically.
              </div>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-center shadow-md">
              <form onSubmit={handleCustomCompanySubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Similar Enterprise Template (Optional)
                  </label>
                  <select
                    value={customSimilarId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomSimilarId(val);
                      if (val) {
                        const found = companies.find(c => c.id === val);
                        if (found) {
                          setCustomSector(found.sector);
                          setCustomFocus(`Adaptation modeled after ${found.name}'s global sourcing network. Description: ${found.description}`);
                          if (!customName) {
                            setCustomName(`Custom ${found.name.replace(/\s*Inc\.?\s*|\s*Motors\s*|\s*Corporation\s*/gi, '')} Operations`);
                          }
                        }
                      } else {
                        setCustomSector("");
                        setCustomFocus("");
                        setCustomName("");
                      }
                    }}
                    disabled={isAnalyzing}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">-- Clean Canvas (Build From Scratch) --</option>
                    {companies.filter(c => !c.id.startsWith("custom") && !c.id.includes("custom")).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.sector})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-450 mb-1">Company / Facility Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lockheed Aviation, BYD Cars, BioMed Corp"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    disabled={isAnalyzing}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-700 transition-all font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-450 mb-1">Sector Segment</label>
                  <input
                    type="text"
                    placeholder="e.g. Next-Gen Aviation, Solar Cell Foundries"
                    value={customSector}
                    onChange={(e) => setCustomSector(e.target.value)}
                    disabled={isAnalyzing}
                    className="w-full text-xs rounded-xl bg-slate-955 border border-slate-800 text-slate-100 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-700 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-450 mb-1">Sourcing Constraints & Key Suppliers</label>
                  <textarea
                    placeholder="e.g. Cobalt from Central Africa, processors from Hsinchu Taiwan, assembly in Berlin Germany"
                    rows={3}
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                    disabled={isAnalyzing}
                    className="w-full text-xs rounded-xl bg-slate-955 border border-slate-800 text-slate-100 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-700 resize-none transition-all leading-relaxed font-medium"
                  />
                </div>

                {analysisError && (
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-400 leading-normal font-medium">
                    {analysisError}
                  </div>
                )}

                {analysisSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
                    Resiliency metrics mapped successfully! Loading simulated structures...
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3 text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      AUDITING SUPPLY ECOSYSTEM...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      GENERATE RESILIENCE MAPPING
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* STANDARD VIEWS ARCHITECTURE: Active public or active simulated company */
          <>
            {/* ROW 1: ENTERPRISE LEVEL CONTEXT HEADER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* MANUFACTURER FILTER PANEL (1. Select Global Enterprise) */}
              <section className="lg:col-span-4" id="left-select-panel">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <div className="mb-4">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        {topMode === "public" ? <Building2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-blue-500" />}
                        {topMode === "public" ? "1. Select Global Enterprise" : "1. Select Custom Enterprise"}
                      </h2>
                      <p className="text-[11px] text-gray-500">
                        {topMode === "public" 
                          ? "Compare default manufacturers or view custom enterprise models." 
                          : "Audit live metrics of your simulated custom facility chains."}
                      </p>
                    </div>

                    {topMode === "custom" && (
                      <button
                        onClick={() => setActiveTab("modeling")}
                        className="w-full mb-3 rounded-xl bg-blue-50 border border-blue-250/50 hover:bg-blue-100 text-blue-700 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 animate-pulse" /> Model New Facility
                      </button>
                    )}

                    <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                      {filteredCompanies.map((company) => {
                        const isSelected = company.id === selectedCompanyId;
                    
                    return (
                      <button
                        key={company.id}
                        onClick={() => {
                          setSelectedCompanyId(company.id);
                          setAnalysisSuccess(false);
                        }}
                        className={`text-left rounded-xl p-3 border transition-all relative overflow-hidden ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white shadow-md transform translate-x-1"
                            : "bg-gray-50/50 border-gray-100 text-gray-700 hover:bg-gray-100/70"
                        }`}
                      >
                        {/* Background Accent glow for high-impact scores */}
                        {isSelected && (
                          <span className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500" />
                        )}
                        
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm tracking-tight">{company.name}</h3>
                            <p className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${isSelected ? "text-slate-300" : "text-gray-400"}`}>
                              Sector: {company.sector}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-sm ${
                              company.globalRiskScore >= 60 
                                ? "bg-red-500/10 text-red-500" 
                                : company.globalRiskScore >= 40 
                                  ? "bg-amber-500/10 text-amber-500" 
                                  : "bg-emerald-500/10 text-emerald-500"
                            }`}>
                              Risk: {company.globalRiskScore}
                            </span>
                            <span className="block text-[8px] text-gray-400 mt-0.5 font-mono">AVG INDEX</span>
                          </div>
                        </div>

                        <p className={`text-[11px] mt-2 line-clamp-2 leading-relaxed ${isSelected ? "text-slate-300" : "text-gray-500"}`}>
                          {company.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ACTIVE COMPANY CONTEXT HEADER PANEL (HQ, description, sequence path) */}
          <section className="lg:col-span-8" id="enterprise-context-panel">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50/70 to-transparent pointer-events-none" />
              
              <div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-gray-950">{activeCompany.name}</h1>
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border border-slate-200 text-gray-600 bg-gray-50 font-mono">
                        HQ: {activeCompany.headquarters}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-1 mr-4 max-w-2xl leading-normal">
                      {activeCompany.description}
                    </p>
                  </div>

                  {/* Company Risk Level Widget */}
                  <div className="shrink-0 flex items-center gap-3 border-l border-gray-100 pl-4">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className={`text-4xl font-extrabold tracking-tight ${
                          activeCompany.globalRiskScore >= 60 ? "text-red-600" : activeCompany.globalRiskScore >= 40 ? "text-amber-500" : "text-emerald-500"
                        }`}>
                          {activeCompany.globalRiskScore}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">/100</span>
                      </div>
                      <span className="block text-[8px] font-mono text-gray-400 uppercase mt-0.5 tracking-wider">RESILIENCE QUOTIENT</span>
                    </div>
                    
                    <div className={`p-2 rounded-xl text-center flex flex-col justify-center items-center ${
                      activeCompany.globalRiskScore >= 60 ? "bg-red-50 text-red-600" : activeCompany.globalRiskScore >= 40 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                    }`}>
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-[10px] font-bold mt-1">
                        {activeCompany.globalRiskScore >= 60 ? "CRIT" : activeCompany.globalRiskScore >= 40 ? "MOD" : "LOW"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage Path Progress Indicator */}
                <div className="mt-5 border-t border-gray-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Sequential Sourcing Path:</span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    {Object.values(SupplyChainStage).map((stage, i) => {
                      const nodeForStage = activeCompany.nodes.find(n => n.stage === stage);
                      return (
                        <div key={stage} className="flex items-center gap-1">
                          {i > 0 && <span className="text-gray-300 font-normal">→</span>}
                          <span 
                            onClick={() => nodeForStage && setSelectedNode(nodeForStage)}
                            className={`px-2 py-1 rounded cursor-pointer transition-all ${
                              nodeForStage 
                                ? isSelectedNodeStage(stage) 
                                  ? "bg-slate-900 border border-slate-900 text-white shadow-xs" 
                                  : "bg-gray-100 hover:bg-gray-200 border border-transparent text-gray-700"
                                : "bg-gray-50 text-gray-300 line-through decoration-gray-200 cursor-not-allowed"
                            }`}
                          >
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ROW 2: MAJESTIC FULL-WIDTH INTERACTIVE RISK MAP (Positioned elegantly before Section 2 analytics details!) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs relative">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Compass className="h-4.5 w-4.5 text-blue-600" /> Interactive Global Sourcing & Risk Map
              </h2>
              <p className="text-[11px] text-gray-500">
                Visualize sequential transport tracks, global ocean lane markers, and active transit hubs. Click any marker to audit calculations.
              </p>
            </div>
            
            {/* Stage Legend indicators info */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-gray-150">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Sourcing</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Processing</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Assembly</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-500" /> Logistics</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Distribution</span>
            </div>
          </div>
          
          <WorldMap
            nodes={activeCompany.nodes}
            selectedNode={selectedNode}
            onSelectNode={(node) => setSelectedNode(node)}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
          />
        </div>

        {/* ROW 3: BOTTOM SPLIT LAYOUT (Section 2 on the left, supplementary tabs on the right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 1/3: 2. Real-Time Risk Analytics (Metrics Audit) */}
          <section className="lg:col-span-4 flex flex-col gap-6" id="left-telemetry-panel">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs h-full">
              <div className="mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-blue-500 animate-pulse" /> 2. Real-Time Risk Analytics
                </h2>
                <p className="text-[11px] text-gray-500">
                  Live telemetry analysis. Metrics fluctuate dynamically representing current real-time global conditions.
                </p>
              </div>

              {selectedNode ? (
                <div className="space-y-4">
                  {/* Active Hub Description Header */}
                  <div className="p-3 bg-slate-900 text-white rounded-xl">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {selectedNode.stage}
                      </span>
                      <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        selectedNode.riskScore >= 60 ? "bg-red-500/10 text-red-400" : selectedNode.riskScore >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                        Live: {selectedNode.riskScore}/100
                      </span>
                    </div>
                    <h4 className="text-xs font-bold mt-2 font-sans text-slate-100">{selectedNode.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{selectedNode.locationName}</p>
                  </div>

                  {/* 4 Read-only real-time progress indicator groups */}
                  <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-gray-100">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-2">Live Parameter Feeds (Read-Only)</span>

                    {/* Meter 1: Event Severity */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1">
                          💥 Event Severity
                        </span>
                        <span className="font-mono text-gray-800 font-bold text-xs">
                          {selectedNode.eventSeverity} / 10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-50 transition-all duration-300 bg-emerald-500" 
                          style={{ width: `${(selectedNode.eventSeverity || 5) * 10}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">Disruption event magnitude (weather issues, lockdowns, friction).</p>
                    </div>

                    {/* Meter 2: Supplier Criticality */}
                    <div className="pt-1 border-t border-gray-100">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1">
                          🎯 Supplier Criticality
                        </span>
                        <span className="font-mono text-gray-800 font-bold text-xs">
                          {selectedNode.supplierCriticality || 5} / 10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-50 transition-all duration-300 bg-blue-500" 
                          style={{ width: `${(selectedNode.supplierCriticality || 5) * 10}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">Sourcing structural dependency index of this node.</p>
                    </div>

                    {/* Meter 3: Proximity */}
                    <div className="pt-1 border-t border-gray-100">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1">
                          📍 Flow Proximity
                        </span>
                        <span className="font-mono text-gray-800 font-bold text-xs">
                          {selectedNode.proximity || 5} / 10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-50 transition-all duration-300 bg-indigo-500" 
                          style={{ width: `${(selectedNode.proximity || 5) * 10}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">Operational pipeline closeness / transit corridor hazard proximity.</p>
                    </div>

                    {/* Meter 4: Recency */}
                    <div className="pt-1 border-t border-gray-100">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1">
                          ⏳ Recency Weight
                        </span>
                        <span className="font-mono text-blue-600 font-bold text-xs">
                          {selectedNode.recency || 1} / 10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-purple-50 transition-all duration-300 bg-purple-500" 
                          style={{ width: `${(selectedNode.recency || 1) * 10}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">Older threats have heavier denominators, reducing current risk levels.</p>
                    </div>
                  </div>

                  {/* Mathematical Formula Back-Test Output visualization */}
                  <div className="mt-4 p-3.5 bg-slate-50 border border-gray-100 rounded-xl space-y-2">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Audit Verification Formula:
                    </span>
                    <div className="flex items-center justify-center p-2 bg-slate-950 font-mono text-[10px] text-emerald-400 rounded-lg border border-slate-800">
                      <div className="text-center space-y-1.5">
                        <div className="border-b border-white/20 pb-1 px-4">
                          <span className="font-semibold text-[10.5px]">Severity ({selectedNode.eventSeverity})</span> 
                          <span className="text-white/60"> × </span>
                          <span className="font-semibold text-[10.5px]">Criticality ({selectedNode.supplierCriticality})</span>
                          <span className="text-white/60"> × </span>
                          <span className="font-semibold text-[10.5px]">Proximity ({selectedNode.proximity})</span>
                        </div>
                        <div className="pt-0.5 font-bold text-white">
                          Recency ({selectedNode.recency}) × 10
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-dashed border-gray-200 font-mono">
                      <span className="font-medium text-slate-500 font-sans">Formula Float Outcome:</span>
                      <span className="font-bold text-slate-850">
                        {((selectedNode.eventSeverity * selectedNode.supplierCriticality * selectedNode.proximity) / (selectedNode.recency * 10)).toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] items-center">
                      <span className="font-semibold text-slate-950">Recalculated Risk Score:</span>
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[11.5px] ${
                        selectedNode.riskScore >= 60 ? "bg-red-100 border border-red-200 text-red-700" : selectedNode.riskScore >= 40 ? "bg-amber-100 border border-amber-200 text-amber-700" : "bg-emerald-100 border border-emerald-200 text-emerald-700"
                      }`}>
                        {selectedNode.riskScore} / 100
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 text-center rounded-xl border border-dashed border-gray-200">
                  <p className="text-[11px] text-gray-500 font-medium">No logistics hub actively focused.</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Click any supply chain track marker on the map above or matrix table to audit calculations on its real-time telemetry inputs.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT 2/3: DATA GRID MATRIX, WARNING bulletins & MODELING LAB */}
          <section className="lg:col-span-8 flex flex-col gap-6" id="right-view-container">
            
            {/* Tab Selector buttons */}
            <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl self-start w-fit border border-gray-200/50 gap-1">
              <button
                onClick={() => setActiveTab("table")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "table"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Dependency Matrix Table
              </button>
              <button
                onClick={() => setActiveTab("alerts")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                  activeTab === "alerts"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Warning Alerts Center
                {activeCompanyAlerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                    {activeCompanyAlerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("modeling")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "modeling"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" /> Enter Your Company's Data
              </button>
            </div>

            {/* TAB CONTENT (Table, Alerts, or Modeling) */}
            <div className="flex flex-col gap-6">
              {activeTab === "table" && (
                <SupplyChainTable
                  nodes={activeCompany.nodes}
                  onSelectNode={(node) => {
                    setSelectedNode(node);
                  }}
                  selectedNode={selectedNode}
                />
              )}

              {activeTab === "alerts" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs" id="alerts-matrix-card">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Urgent Risk Incident Registry
                    </h3>
                    <p className="text-xs text-gray-500">Live intelligence bulletins impacting {activeCompany.name}'s specific global sourcing steps.</p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {activeCompanyAlerts.length === 0 ? (
                      <div className="py-12 text-center text-gray-400">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <span className="text-sm font-semibold block">Clean operational dashboard</span>
                        No active cargo blockades computed for {activeCompany.name} this cycle.
                      </div>
                    ) : (
                      activeCompanyAlerts.map((alert) => {
                        const isCritical = alert.severity === "critical";
                        const parentNode = activeCompany.nodes.find(n => n.name === alert.affectedNodeName);
                        
                        return (
                          <div key={alert.id} className="py-3.5 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className={`p-2 rounded-xl mt-1 shrink-0 ${
                                isCritical ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                              }`}>
                                <AlertTriangle className="h-4 w-4" />
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
                                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                                    isCritical ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"
                                  }`}>
                                    {alert.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 leading-normal">{alert.description}</p>
                                
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 font-semibold uppercase">
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-300" /> {alert.affectedNodeName}</span>
                                  <span>• Stage: {alert.stage}</span>
                                  <span>• Recieved: {alert.timestamp}</span>
                                </div>
                              </div>
                            </div>

                            {parentNode && (
                              <button
                                onClick={() => {
                                  setSelectedNode(parentNode);
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-0.5 transition-all shrink-0"
                              >
                                Spotlight Hub <ArrowUpRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === "modeling" && (
                <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs flex flex-col md:flex-row gap-6 items-stretch" id="model-generator-panel">
                  <div className="flex-1 flex flex-col justify-between gap-5">
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                          <Sparkles className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">
                            Resilience Modeling Lab
                          </h3>
                          <p className="text-xs text-gray-500">
                            Map raw custom dependencies & back-test multi-point vulnerabilities.
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed mb-4">
                        Simulate how global shortages, tariff announcements, or major maritime blockades impact custom shipping footprints. Enter your variables below to compute updated safety stock parameters.
                      </p>

                      <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-150 mb-4">
                        <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Integrated Analytics Framework
                        </h4>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-normal">
                          <li><strong>Live Sourcing Audit:</strong> Back-tests material sourcing points against active raw commodity indices.</li>
                          <li><strong>Geographical Mapping:</strong> Automatically queries and plots coordinates to calculate total transshipment distance.</li>
                          <li><strong>Intermodal Warnings:</strong> Automatically binds corresponding warnings based on sector and locations.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-400 italic">
                      * Mapped coordinates and logistics safety buffers will automatically propagate to the Interactive Risk Map.
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-center">
                    <form onSubmit={handleCustomCompanySubmit} className="space-y-4">
                      <div>
                        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Similar Enterprise Template (Optional)
                        </label>
                        <select
                          value={customSimilarId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomSimilarId(val);
                            if (val) {
                              const found = companies.find(c => c.id === val);
                              if (found) {
                                setCustomSector(found.sector);
                                setCustomFocus(`Adaptation modeled after ${found.name}'s global sourcing network. Description: ${found.description}`);
                                if (!customName) {
                                  setCustomName(`Custom ${found.name.replace(/\s*Inc\.?\s*|\s*Motors\s*|\s*Corporation\s*/gi, '')} Operations`);
                                }
                              }
                            } else {
                              setCustomSector("");
                              setCustomFocus("");
                              setCustomName("");
                            }
                          }}
                          disabled={isAnalyzing}
                          className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                        >
                          <option value="">-- Clean Canvas (Build From Scratch) --</option>
                          {companies.filter(c => !c.id.startsWith("custom") && !c.id.includes("custom")).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.sector})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-300 mb-1">Company / Facility Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Lockheed Aviation, BYD Cars, BioMed Corp"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          disabled={isAnalyzing}
                          className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition-all font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-300 mb-1">Sector Segment</label>
                        <input
                          type="text"
                          placeholder="e.g. Next-Gen Aviation, Solar Cell Foundries"
                          value={customSector}
                          onChange={(e) => setCustomSector(e.target.value)}
                          disabled={isAnalyzing}
                          className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-300 mb-1">Sourcing Constraints & Key Suppliers</label>
                        <textarea
                          placeholder="e.g. Cobalt from Central Africa, processors from Hsinchu Taiwan, assembly in Berlin Germany"
                          rows={3}
                          value={customFocus}
                          onChange={(e) => setCustomFocus(e.target.value)}
                          disabled={isAnalyzing}
                          className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 resize-none transition-all leading-relaxed font-medium"
                        />
                      </div>

                      {analysisError && (
                        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-400 leading-normal font-medium">
                          {analysisError}
                        </div>
                      )}

                      {analysisSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
                          Resiliency metrics mapped successfully! Switching dataset to active custom view...
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3 text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            AUDITING SUPPLY ECOSYSTEM...
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            GENERATE RESILIENCE MAPPING
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

          </section>

        </div>
      </>
    )}
  </main>

      {/* FOOTER DIAGNOSTIC LOGS PANEL */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-400" />
              <span className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                Consolidated Sourcing Resiliency Audit Server
              </span>
            </div>
            <p className="text-[11px] mt-1 text-slate-400 max-w-md leading-relaxed">
              Analyzing real-time shipping logs, trans-pacific maritime congestion indices, and raw industrial output trends. Built sequentially to optimize emergency dual-sourcing options.
            </p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-300 block mb-1">
              Active Network Telemetry Logs:
            </span>
            <div className="bg-slate-950 rounded-lg p-2.5 max-h-[85px] overflow-y-auto border border-slate-800 font-mono text-[9px] text-green-400/90 leading-normal select-none">
              {activeTelemetryLog.length === 0 ? (
                <div className="text-slate-600 font-semibold">[Waiting for fresh telemetry network package... Sync interval: 6s]</div>
              ) : (
                activeTelemetryLog.map((log, i) => (
                  <div key={i} className="truncate">{log}</div>
                ))
              )}
            </div>
          </div>

        </div>
        <div className="border-t border-slate-800/60 mt-4 pt-4 text-center text-[10px] text-slate-500">
          Resilient Supply Chain Risk Index. Designed for global logistics transparency. UTC Time: 2026-05-31.
        </div>
      </footer>

    </div>
  );

  // Helper routine to see if active node matches active stage path
  function isSelectedNodeStage(stage: SupplyChainStage) {
    return selectedNode && selectedNode.stage === stage;
  }
}
