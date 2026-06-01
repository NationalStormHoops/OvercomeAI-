import React, { useState, useMemo } from "react";
import { SupplyChainNode, SupplyChainStage } from "../types";
import { Search, SlidersHorizontal, TriangleAlert, Building2, CheckCircle, HelpCircle } from "lucide-react";

interface SupplyChainTableProps {
  nodes: SupplyChainNode[];
  onSelectNode: (node: SupplyChainNode) => void;
  selectedNode: SupplyChainNode | null;
}

export default function SupplyChainTable({
  nodes,
  onSelectNode,
  selectedNode,
}: SupplyChainTableProps) {
  const [search, setSearch] = useState("");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"risk-desc" | "risk-asc" | "name">("risk-desc");

  // Filter & Sort Logic
  const processedNodes = useMemo(() => {
    let result = [...nodes];

    // Filter by search text
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.locationName.toLowerCase().includes(q) ||
          n.dependentCompanies.some((c) => c.toLowerCase().includes(q))
      );
    }

    // Filter by Stage
    if (selectedStageFilter !== "ALL") {
      result = result.filter((n) => n.stage === selectedStageFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "risk-desc") return b.riskScore - a.riskScore;
      if (sortBy === "risk-asc") return a.riskScore - b.riskScore;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [nodes, search, selectedStageFilter, sortBy]);

  // Helper for risk urgency badges
  const getRiskBadge = (score: number) => {
    if (score >= 70) {
      return {
        label: "Critical Risk",
        bgColor: "bg-red-50 text-red-700 border-red-200",
        indicatorColor: "bg-red-500",
      };
    }
    if (score >= 40) {
      return {
        label: "Moderate Risk",
        bgColor: "bg-amber-50 text-amber-700 border-amber-200",
        indicatorColor: "bg-amber-500",
      };
    }
    return {
      label: "Low Vulnerability",
      bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      indicatorColor: "bg-emerald-500",
    };
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs" id="vulnerability-table-card">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-950">Structural Dependency Matrix</h3>
          <p className="text-xs text-gray-500">
            A comprehensive mapping of physical supply chain steps, operational hubs, and dependents.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-1 text-center">
            <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total Hubs</span>
            <span className="text-sm font-semibold text-gray-800">{nodes.length}</span>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-1 text-center">
            <span className="block text-[10px] uppercase tracking-wider text-red-400 font-bold">Critical (70+)</span>
            <span className="text-sm font-semibold text-red-700">{nodes.filter(n => n.riskScore >= 70).length}</span>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-1 text-center">
            <span className="block text-[10px] uppercase tracking-wider text-amber-500 font-bold">Moderate (40+)</span>
            <span className="text-sm font-semibold text-amber-700">{nodes.filter(n => n.riskScore >= 40 && n.riskScore < 70).length}</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by hub, manufacturer, region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Stage selection filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Stage:
          </span>
          <button
            onClick={() => setSelectedStageFilter("ALL")}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
              selectedStageFilter === "ALL"
                ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100/70"
            }`}
          >
            All Stages
          </button>
          {Object.values(SupplyChainStage).map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStageFilter(stage)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
                selectedStageFilter === stage
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100/70"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        {/* Custom risk sort options */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sort:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-blue-500"
          >
            <option value="risk-desc">Risk Index: High-Low</option>
            <option value="risk-asc">Risk Index: Low-High</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100">
            <tr>
              <th className="px-5 py-4">Supply Chain step & Hub</th>
              <th className="px-5 py-4">Stage</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Risk Index</th>
              <th className="px-5 py-4">Dependent Manufacturers</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {processedNodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  <span className="text-lg block mb-1">No matching nodes found</span>
                  Verify spelling or clear active filter presets.
                </td>
              </tr>
            ) : (
              processedNodes.map((n) => {
                const colors = getRiskBadge(n.riskScore);
                const isSelected = selectedNode?.id === n.id;
                
                return (
                  <tr
                    key={n.id}
                    onClick={() => onSelectNode(n)}
                    className={`cursor-pointer transition-all hover:bg-blue-50/40 ${
                      isSelected ? "bg-blue-50/70" : ""
                    }`}
                  >
                    {/* Item Name */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {n.riskScore >= 70 && (
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        )}
                        {n.name}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5 truncate max-w-xs">{n.id}</div>
                    </td>

                    {/* Stage Label */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                        n.stage === SupplyChainStage.SOURCING ? 'bg-amber-50 text-amber-700' :
                        n.stage === SupplyChainStage.PROCESSING ? 'bg-purple-50 text-purple-700' :
                        n.stage === SupplyChainStage.ASSEMBLY ? 'bg-blue-50 text-blue-700' :
                        n.stage === SupplyChainStage.LOGISTICS ? 'bg-teal-50 text-teal-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {n.stage}
                      </span>
                    </td>

                    {/* Geolocation */}
                    <td className="px-5 py-4 text-gray-600 font-medium">
                      {n.locationName}
                      <span className="block text-[10px] text-gray-400 font-mono mt-0.5">({n.lat.toFixed(2)}, {n.lng.toFixed(2)})</span>
                    </td>

                    {/* Risk score dynamic tooltip & percentage */}
                    <td className="px-5 py-4">
                      <div className="relative group/tooltip inline-block w-full">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${colors.indicatorColor}`}
                              style={{ width: `${n.riskScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-800">{n.riskScore}</span>
                        </div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${colors.bgColor}`}>
                          {colors.label}
                        </span>

                        {/* Interactive Dynamic Calculation Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block z-50 w-72 p-3 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl text-left text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          <div className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 text-[10px] uppercase tracking-wider font-mono text-emerald-400 flex items-center justify-between">
                            <span>Risk Score Calculation</span>
                            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">Real-Time Mode</span>
                          </div>
                          
                          <div className="space-y-1 font-mono text-[10px] text-slate-300">
                            <div className="flex justify-between"><span>💥 Event Severity:</span> <span className="font-bold text-white">{n.eventSeverity || 5}/10</span></div>
                            <div className="flex justify-between"><span>🎯 Supplier Criticality:</span> <span className="font-bold text-white">{n.supplierCriticality || 5}/10</span></div>
                            <div className="flex justify-between"><span>📍 Flow Proximity:</span> <span className="font-bold text-white">{n.proximity || 5}/10</span></div>
                            <div className="flex justify-between"><span>⏳ Recency Factor:</span> <span className="font-bold text-blue-400">{n.recency || 1}/10</span></div>
                            
                            <div className="border-t border-dashed border-slate-800 my-2 pt-2 text-[10px] text-center bg-slate-950/60 p-2 rounded border border-slate-850/60">
                              <div className="text-slate-400 text-[9px] uppercase tracking-wide mb-1 font-sans">Formula Breakdown:</div>
                              <span className="text-white font-semibold">({n.eventSeverity || 5} × {n.supplierCriticality || 5} × {n.proximity || 5})</span>
                              <span className="text-slate-500"> / </span>
                              <span className="text-blue-300">({n.recency || 1} × 10)</span>
                              <div className="mt-1 text-[11px] font-bold text-emerald-400 text-center">
                                = {((n.eventSeverity || 5) * (n.supplierCriticality || 5) * (n.proximity || 5) / ((n.recency || 1) * 10)).toFixed(2)} → <span className="bg-emerald-500/20 px-1 py-0.2 rounded border border-emerald-500/30 text-emerald-300 text-xs">{n.riskScore}</span>
                              </div>
                            </div>
                          </div>
                          {/* Small speech bubble arrow pointing down */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 pointer-events-none" />
                        </div>
                      </div>
                    </td>

                    {/* Associated manufacturers dependent */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {n.dependentCompanies.map((c, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-sm bg-gray-100 border border-gray-200/60 px-2 py-0.5 text-xs font-semibold text-gray-700"
                          >
                            <Building2 className="h-3 w-3 text-gray-400" />
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action Select Hub */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(n);
                        }}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all border ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Inspect Core
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table Legend info */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
        Vulnerabilities are dynamically calculated using audit-certified formula: (Disruption Severity × Supplier Criticality × Flow Proximity) / (Recency Weight × 10).
      </div>
    </div>
  );
}
