/**
 * Shared Type Definitions for Supply Chain Risk App
 */

export enum SupplyChainStage {
  SOURCING = "Sourcing",
  PROCESSING = "Processing",
  ASSEMBLY = "Assembly",
  LOGISTICS = "Logistics",
  DISTRIBUTION = "Distribution",
}

export interface SupplyChainSource {
  title: string;
  url: string;
}

export interface SupplyChainNode {
  id: string;
  name: string;
  stage: SupplyChainStage;
  lat: number;
  lng: number;
  riskScore: number; // 0 - 100
  riskReason: string;
  locationName: string;
  sources: SupplyChainSource[];
  dependentCompanies: string[]; // e.g. ["Apple", "Tesla"]
  eventSeverity: number;        // 1 - 10
  supplierCriticality: number;  // 1 - 10
  proximity: number;            // 1 - 10
  recency: number;              // 1 - 10
}

export interface CompanyData {
  id: string;
  name: string;
  sector: string;
  headquarters: string;
  description: string;
  globalRiskScore: number;
  nodes: SupplyChainNode[];
}

export interface SupplyChainAlert {
  id: string;
  companyName: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  stage: SupplyChainStage;
  timestamp: string; // ISO string or human-readable (e.g. "2 hours ago")
  affectedNodeName: string;
}
