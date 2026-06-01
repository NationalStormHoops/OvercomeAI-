import React, { useState, useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SupplyChainNode, SupplyChainStage } from "../types";
import { Info, MapPin, AlertTriangle, ExternalLink, Globe } from "lucide-react";

interface WorldMapProps {
  nodes: SupplyChainNode[];
  selectedNode: SupplyChainNode | null;
  onSelectNode: (node: SupplyChainNode) => void;
  hoveredNode: SupplyChainNode | null;
  setHoveredNode: (node: SupplyChainNode | null) => void;
}

// Color mapping per Supply Chain Stage
const getStageColor = (stage: SupplyChainStage) => {
  switch (stage) {
    case SupplyChainStage.SOURCING:
      return {
        fill: "bg-amber-500",
        stroke: "border-amber-400",
        glow: "shadow-amber-500/50",
        hex: "#f59e0b",
      };
    case SupplyChainStage.PROCESSING:
      return {
        fill: "bg-purple-500",
        stroke: "border-purple-400",
        glow: "shadow-purple-500/50",
        hex: "#a855f7",
      };
    case SupplyChainStage.ASSEMBLY:
      return {
        fill: "bg-blue-500",
        stroke: "border-blue-400",
        glow: "shadow-blue-500/50",
        hex: "#3b82f6",
      };
    case SupplyChainStage.LOGISTICS:
      return {
        fill: "bg-teal-500",
        stroke: "border-teal-400",
        glow: "shadow-teal-500/50",
        hex: "#14b8a6",
      };
    case SupplyChainStage.DISTRIBUTION:
      return {
        fill: "bg-emerald-500",
        stroke: "border-emerald-400",
        glow: "shadow-emerald-500/50",
        hex: "#10b981",
      };
    default:
      return {
        fill: "bg-gray-500",
        stroke: "border-gray-400",
        glow: "shadow-gray-500/50",
        hex: "#6b7280",
      };
  }
};

// Quadratic Bezier interpolation in lat/lng coordinate space
function getBezierPoints(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  numPoints: number = 30
): [number, number][] {
  const points: [number, number][] = [];
  
  // Midpoint
  const midLat = (fromLat + toLat) / 2;
  const midLng = (fromLng + toLng) / 2;
  
  // Calculate perpendicular offset factor to make a beautiful curve
  const dLat = toLat - fromLat;
  let dLng = toLng - fromLng;

  // Handle wrap-around meridian gracefully
  if (dLng > 180) dLng -= 360;
  if (dLng < -180) dLng += 360;

  // Offset factor - curve slightly to the side to prevent overlapping lines
  const offsetFactor = 0.15;
  const offsetLat = -dLng * offsetFactor;
  const offsetLng = dLat * offsetFactor;
  
  // Control point for the Bezier curve
  const ctrlLat = midLat + offsetLat;
  const ctrlLng = midLng + offsetLng;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const u = 1 - t;
    
    const lat = u * u * fromLat + 2 * u * t * ctrlLat + t * t * toLat;
    let lng = u * u * fromLng + 2 * u * t * ctrlLng + t * t * toLng;
    
    // Normalize longitude
    if (lng > 180) lng -= 360;
    if (lng < -180) lng += 360;

    points.push([lat, lng]);
  }
  
  return points;
}

export default function WorldMap({
  nodes,
  selectedNode,
  onSelectNode,
  hoveredNode,
  setHoveredNode,
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });

  // Handle Resize beautifully
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const mappedHeight = Math.max(550, Math.min(780, width * 0.65));
        setDimensions({ width, height: mappedHeight });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize Leaflet Map Instance (once)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around global focus point ([22, 15]) with simple zoom level
    const map = L.map(mapContainerRef.current, {
      center: [22, 15],
      zoom: 2,
      zoomControl: false,
      attributionControl: true,
    });

    // Custom styled Zoom buttons placed topright
    L.control.zoom({ position: "topright" }).addTo(map);

    // Gorgeous faithful raster map tiles - CartoDB Voyager
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 18,
    }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    layersGroupRef.current = layersGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layersGroupRef.current = null;
    };
  }, []);

  // Keep map container viewport updated on size changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, [dimensions]);

  // Track structural node changes to smoothly transition viewport bounds on switching companies
  const nodeIdsString = useMemo(() => {
    return nodes.map((n) => n.id).join(",");
  }, [nodes]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || nodes.length === 0) return;

    const bounds = L.latLngBounds(nodes.map((n) => [n.lat, n.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        animate: true,
        duration: 1.2,
        padding: [50, 50],
        maxZoom: 4,
      });
    }
  }, [nodeIdsString]);

  // Synchronize Leaflet Layers & Markers dynamically as scores, node selection or hover state shifts
  useEffect(() => {
    const layersGroup = layersGroupRef.current;
    if (!layersGroup || !mapInstanceRef.current) return;

    // Reset current visualization frame
    layersGroup.clearLayers();

    // 1. Draw connecting routes step-by-step
    if (nodes.length > 1) {
      const stageOrder = [
        SupplyChainStage.SOURCING,
        SupplyChainStage.PROCESSING,
        SupplyChainStage.ASSEMBLY,
        SupplyChainStage.LOGISTICS,
        SupplyChainStage.DISTRIBUTION,
      ];

      const sortedNodes = [...nodes].sort((a, b) => {
        return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
      });

      for (let i = 0; i < sortedNodes.length - 1; i++) {
        const from = sortedNodes[i];
        const to = sortedNodes[i + 1];

        const bezierPoints = getBezierPoints(from.lat, from.lng, to.lat, to.lng);
        const colors = getStageColor(from.stage);

        // Underlying route shadow trail
        L.polyline(bezierPoints, {
          color: colors.hex,
          weight: 2,
          opacity: 0.35,
          interactive: false,
        }).addTo(layersGroup);

        // Overlay animated dash line representing cargo flow
        L.polyline(bezierPoints, {
          color: colors.hex,
          weight: 2.5,
          dashArray: "5, 8",
          opacity: 0.8,
          className: "animate-dash",
          interactive: false,
        }).addTo(layersGroup);
      }
    }

    // 2. Plot modern physical hub node indicators with HTML DOM injected icons
    nodes.forEach((node) => {
      const colors = getStageColor(node.stage);
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;

      const customHtml = `
        <div class="relative flex items-center justify-center pointer-events-auto" style="width: 24px; height: 24px;">
          <!-- Outer Pulsing Glow -->
          <span class="absolute -inset-2 rounded-full ${colors.fill} opacity-20 ${node.riskScore > 60 ? 'animate-ping' : ''}" style="animation-duration: 2s;"></span>
          
          <!-- Mid Glow Border -->
          <span class="absolute -inset-1 rounded-full ${colors.fill} opacity-10"></span>

          <!-- Main Circle containing live Risk Index -->
          <div class="flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white font-extrabold text-[10px] transition-all duration-150 shadow-md ${colors.stroke} ${isSelected ? 'scale-125 ring-4 ring-blue-300' : isHovered ? 'scale-110' : ''}"
               style="box-shadow: 0 0 10px ${colors.hex}30; color: #0f172a;">
            ${node.riskScore}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: "custom-leaflet-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([node.lat, node.lng], { icon });

      marker.on("click", () => {
        onSelectNode(node);
      });

      marker.on("mouseover", () => {
        setHoveredNode(node);
      });

      marker.on("mouseout", () => {
        setHoveredNode(null);
      });

      marker.addTo(layersGroup);
    });
  }, [nodes, selectedNode, hoveredNode]);

  return (
    <div className="relative w-full rounded-2xl border border-gray-100 bg-linear-to-b from-gray-50 to-white p-4 shadow-xs" id="logistics-map-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-blue-50 p-1.5 text-blue-600">
            <Globe className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Intermodal Logistics Map</h3>
            <p className="text-xs text-gray-500">Real-time geographical transit corridors and physical hub vulnerabilities.</p>
          </div>
        </div>
        
        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          {Object.values(SupplyChainStage).map((stage) => {
            const colors = getStageColor(stage);
            return (
              <div key={stage} className="flex items-center gap-1.5 font-medium text-gray-600">
                <span className={`h-2.5 w-2.5 rounded-full ${colors.fill}`} />
                {stage}
              </div>
            );
          })}
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="relative overflow-hidden rounded-xl border border-gray-200 bg-slate-100 transition-all shadow-inner"
        style={{ height: `${dimensions.height}px` }}
      >
        {/* Core Leaflet Container */}
        <div 
          ref={mapContainerRef} 
          className="h-full w-full z-0 pointer-events-auto"
          id="leaflet-map"
        />

        {/* Dynamic Hover Card Overlay - Absolute positioned with high z-index to sit cleanly above interactive leaflet controllers */}
        {hoveredNode && (
          <div 
            className="absolute bottom-4 left-4 right-4 m-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-4 text-white shadow-xl max-w-xl z-[1001] animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto"
          >
            {(() => {
              const activeNode = hoveredNode;
              if (!activeNode) return null;
              const isCrit = activeNode.riskScore >= 70;
              const isMod = activeNode.riskScore >= 40 && activeNode.riskScore < 70;
              const colors = getStageColor(activeNode.stage);

              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${colors.fill}`}>
                          {activeNode.stage.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400 capitalize flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {activeNode.locationName}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-100 mt-1">{activeNode.name}</h4>
                    </div>
                    
                    {/* Dial Index */}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className={`p-1 rounded ${isCrit ? 'bg-red-500/20 text-red-400' : isMod ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          <AlertTriangle className="h-4 w-4" />
                        </span>
                        <span className="text-xl font-bold tracking-tight" style={{ color: colors.hex }}>{activeNode.riskScore}</span>
                        <span className="text-xs text-gray-400">/100</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-mono mt-1 text-right whitespace-nowrap">
                        Severity:{activeNode.eventSeverity || 5} · Crit:{activeNode.supplierCriticality || 5} · Prox:{activeNode.proximity || 5} · Rec:{activeNode.recency || 1}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Math Tooltip Formula Inside Hover Card */}
                  <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Risk Formula calculation:</span>
                    <span className="text-emerald-400 font-medium">
                      ({activeNode.eventSeverity || 5} Sev × {activeNode.supplierCriticality || 5} Crit × {activeNode.proximity || 5} Prox) / ({activeNode.recency || 1} Rec × 10) = <strong className="text-white text-sm bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">{activeNode.riskScore}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 bg-slate-950/50 p-2.5 rounded-lg leading-relaxed border border-slate-800/50">
                    {activeNode.riskReason}
                  </p>

                  {/* Sourced Intel Links strictly mapped */}
                  {activeNode.sources && activeNode.sources.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center gap-2 bg-slate-950/20 px-2 py-1.5 rounded-md border border-slate-800/45">
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <Info className="h-3 w-3" /> VERIFIED INTEL SOURCES:
                      </span>
                      {activeNode.sources.map((src, i) => (
                        <a
                           key={i}
                           href={src.url}
                           target="_blank"
                           rel="noreferrer"
                           className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:underline transition-all bg-blue-500/10 px-2 py-0.5 rounded-sm border border-blue-500/20"
                        >
                          {src.title} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
      
      {/* Footer Info instruction */}
      <div className="mt-2 text-center text-[11px] text-gray-400 italic">
        * Pro Tip: Drag, pinch, or zoom on the interactive map. Hover over any blinking node to view the forensic risk analysis report, or click to focus.
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          stroke-dasharray: 4, 8;
          stroke-dashoffset: 0;
          animation: dash 5s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        .custom-leaflet-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background-color: #e3edf5 !important;
          font-family: inherit;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
        }
        .leaflet-bar a {
          background-color: #ffffff !important;
          color: #1e293b !important;
          border-bottom: 1px solid #f1f5f9 !important;
          transition: all 0.2s ease;
        }
        .leaflet-bar a:hover {
          background-color: #f8fafc !important;
          color: #0f172a !important;
        }
      `}</style>
    </div>
  );
}
