import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini initialization with automatic error defense and client safety
let aiClient: any = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_AI_STUDIO_FALLBACK",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Check if Gemini API key exists
app.get("/api/config", (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({ hasGeminiKey: hasKey });
});

// Endpoint to generate customized supply chain mapping via Gemini
app.post("/api/analyze-company", async (req: Request, res: Response) => {
  const { companyName, description: userDesc, sector: userSector, similarCompany } = req.body;

  if (!companyName) {
    res.status(400).json({ error: "Company name is required." });
    return;
  }

  const sector = userSector || "General Manufacturing";
  const extraDesc = userDesc || "Builds specialized hardware and global consumer electronics components";

  const apiKey = process.env.GEMINI_API_KEY;
  const isMockMode = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "";

  if (isMockMode) {
    // Return high-fidelity simulated response if no API key is set
    console.log(`Generating mock response for ${companyName} due to missing Gemini key. Similar to: ${similarCompany}`);
    const mockRes = generateMockResponse(companyName, sector, extraDesc, similarCompany);
    res.json({ ...mockRes, isSimulated: true });
    return;
  }

  try {
    const ai = getGeminiClient();
    let prompt = `Analyze the supply chain architecture of the following company:
Name: ${companyName}
Sector: ${sector}
Focus: ${extraDesc}
`;

    if (similarCompany) {
      prompt += `\nStructure Comparison: Please model this supply chain similar to the global supply chain design of ${similarCompany}, borrowing its typical regional sourcing patterns, processing hubs, and logistical dependencies (adapted realistically for this custom firm).\n`;
    }

    prompt += `\nTask: Produce 4 critical global hubs across different stages of the supply chain (Sourcing, Processing, Assembly, Logistics, or Distribution).
For each hub:
- Identify its exact real-world industrial location and name.
- Estimate a numerical risk score (0 to 100) capturing logistical, environmental, and geopolitical disruptions.
- Formulate a clear, highly granular description detailing why this risk score was generated.
- Generate exactly 2 high-integrity news or industry report mock headings with realistic simulation URLs (e.g. bloomberg, reuters, or similar news domains) from which this risk score can be derived.
- Create 1 high-impact urgent supply chain alert for one of these nodes.

Coordinate Guidelines: latitude must look realistic (from -50 to 50), matching the geographic region. Longitude from -120 to 140.
Format the output strictly as a JSON object of Type.OBJECT complying with the response schema.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert global logistics forensic auditor and predictive supply chain supply-risk modeling server. Always adhere to strict coordinate schemas and supply chain rules.",
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sector: { type: Type.STRING },
            headquarters: { type: Type.STRING },
            description: { type: Type.STRING },
            globalRiskScore: { type: Type.INTEGER },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  stage: { 
                    type: Type.STRING,
                    description: "Must be exactly one of: 'Sourcing', 'Processing', 'Assembly', 'Logistics', 'Distribution'"
                  },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  riskScore: { type: Type.INTEGER },
                  eventSeverity: { type: Type.INTEGER, description: "Scale 1 to 10 capturing severity of potential disruptions" },
                  supplierCriticality: { type: Type.INTEGER, description: "Scale 1 to 10 capturing dependency importance of this supplier" },
                  proximity: { type: Type.INTEGER, description: "Scale 1 to 10 capturing speed-of-impact or geographic hazard proximity" },
                  recency: { type: Type.INTEGER, description: "Scale 1 to 10 capturing how fresh the threats/incidents are" },
                  riskReason: { type: Type.STRING },
                  locationName: { type: Type.STRING },
                  sources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING }
                      },
                      required: ["title", "url"]
                    }
                  }
                },
                required: ["id", "name", "stage", "lat", "lng", "riskScore", "riskReason", "locationName", "sources", "eventSeverity", "supplierCriticality", "proximity", "recency"]
              }
            },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "Must be exactly one of: 'critical', 'high', 'medium', 'low'" },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  stage: { type: Type.STRING, description: "Must be exactly one of: 'Sourcing', 'Processing', 'Assembly', 'Logistics', 'Distribution'" },
                  timestamp: { type: Type.STRING },
                  affectedNodeName: { type: Type.STRING }
                },
                required: ["id", "severity", "title", "description", "stage", "timestamp", "affectedNodeName"]
              }
            }
          },
          required: ["name", "sector", "headquarters", "description", "globalRiskScore", "nodes", "alerts"]
        }
      }
    });

    const textOutput = result.text;
    if (!textOutput) {
      throw new Error("Empty response returned from Gemini.");
    }

    const payload = JSON.parse(textOutput);
    res.json({ ...payload, isSimulated: false });

  } catch (error: any) {
    console.error("Gemini supply chain analysis error:", error);
    // Graceful fallback to rich mock data if API limits or key issues happen during the call
    const fallback = generateMockResponse(companyName, sector, extraDesc, similarCompany);
    res.json({ 
      ...fallback, 
      isSimulated: true, 
      errorMessage: error.message || "Failed to process request with Gemini. Using high-fidelity local modeling engine instead." 
    });
  }
});

/**
 * Generates secondary fallback mock responses to yield continuous, flawless UI performance even without active API keys
 */
function generateMockResponse(companyName: string, sector: string, focus: string, similarCompany?: string) {
  const key = companyName.toLowerCase().replace(/\s+/g, "-");
  
  // Custom offset based on company name length to make coordinates look different
  const offset = (companyName.length % 5) * 5;
  const sim = (similarCompany || "").toLowerCase();

  let nodes = [];
  let alerts = [];

  if (sim.includes("toyota") || sim.includes("automotive")) {
    nodes = [
      {
        id: `${key}-node-1`,
        name: `High-Grade Steel & Alloys Casting Mine`,
        stage: "Sourcing",
        lat: -31.95,
        lng: 115.86,
        riskScore: 50,
        riskReason: `Dependent on heavy rail transportation from inland metallurgical deposits. Subject to coastal storm alerts.`,
        locationName: "Pilbara Iron Range, Western Australia",
        dependentCompanies: [companyName],
        sources: [
          { title: "Australian Steel & Ore Digest", url: "https://www.reuters.com/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 8,
        proximity: 7,
        recency: 1
      },
      {
        id: `${key}-node-2`,
        name: `Precision Propulsion & Engine Block Foundry`,
        stage: "Processing",
        lat: 35.18,
        lng: 137.01,
        riskScore: 35,
        riskReason: `Centralized powertrain tooling and complex metallurgical hardening line. Seismic monitoring active.`,
        locationName: "Aichi Prefecture Industrial Hub, Japan",
        dependentCompanies: [companyName],
        sources: [
          { title: "Nikkei Auto Sourcing Index", url: "https://asia.nikkei.com/" }
        ],
        eventSeverity: 4,
        supplierCriticality: 9,
        proximity: 6,
        recency: 1
      },
      {
        id: `${key}-node-3`,
        name: `Advanced Vehicle Unified Assembly Plant`,
        stage: "Assembly",
        lat: 38.20,
        lng: -84.55,
        riskScore: 40,
        riskReason: `Just-In-Time part delivery bottlenecking. Over-the-road trucking freight limits.`,
        locationName: "Georgetown Assembly, Kentucky, USA",
        dependentCompanies: [companyName],
        sources: [
          { title: "Automotive News North America", url: "https://www.bloomberg.com/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 9,
        proximity: 8,
        recency: 1
      },
      {
        id: `${key}-node-4`,
        name: `Intermodal Distribution Corridor`,
        stage: "Logistics",
        lat: 41.87,
        lng: -87.62,
        riskScore: 25,
        riskReason: `Class 1 rail congestion and yard container stacking capacity constraints.`,
        locationName: "Chicago Intermodal Yard Gateway, USA",
        dependentCompanies: [companyName],
        sources: [
          { title: "Trains Logistics Weekly", url: "https://www.cnbc.com/" }
        ],
        eventSeverity: 3,
        supplierCriticality: 7,
        proximity: 6,
        recency: 1
      }
    ];

    alerts = [
      {
        id: `${key}-alert-1`,
        severity: "medium",
        title: `${companyName} Parts Logistics Delay`,
        description: `Mild rail congestion at Aichi outbound docks creates 1-2 day delay for transpacific casting kits.`,
        stage: "Logistics",
        timestamp: "Just Now",
        affectedNodeName: "Precision Propulsion & Engine Block Foundry"
      }
    ];
  } else if (sim.includes("lockheed") || sim.includes("aviation") || sim.includes("aerospace")) {
    nodes = [
      {
        id: `${key}-node-1`,
        name: `Advanced Titanium & Aerostructure Alloys Sourcing`,
        stage: "Sourcing",
        lat: 61.21,
        lng: -149.90,
        riskScore: 16 + offset % 30,
        riskReason: `Limited specialty suppliers with long defense-grade qualification lead times and sub-zero transit delays.`,
        locationName: "Kenai Resource Reserve, Alaska, USA",
        dependentCompanies: [companyName],
        sources: [
          { title: "Aerospace Metal Sourcing Review", url: "https://www.reuters.com/" }
        ],
        eventSeverity: 7,
        supplierCriticality: 9,
        proximity: 8,
        recency: 1
      },
      {
        id: `${key}-node-2`,
        name: `Radar & Avionics Guidance Systems Fab`,
        stage: "Processing",
        lat: 52.52,
        lng: 13.40,
        riskScore: 48,
        riskReason: `Precision sensor hardware assembly and export compliance clearance times.`,
        locationName: "Dresden Precision Microsystems, Germany",
        dependentCompanies: [companyName],
        sources: [
          { title: "European Defence Logistics Quarterly", url: "https://www.bloomberg.com/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 8,
        proximity: 7,
        recency: 1
      },
      {
        id: `${key}-node-3`,
        name: `Composite Fuselage & Airframe Integration Facility`,
        stage: "Assembly",
        lat: 32.75,
        lng: -97.33,
        riskScore: 55,
        riskReason: `Highly specialized skilled technician labor constraints and complex structural testing queues.`,
        locationName: "Fort Worth Aerospace Assembly, Texas, USA",
        dependentCompanies: [companyName],
        sources: [
          { title: "Defense Sourcing Weekly", url: "https://www.wsj.com/" }
        ],
        eventSeverity: 6,
        supplierCriticality: 10,
        proximity: 9,
        recency: 1
      },
      {
        id: `${key}-node-4`,
        name: `Strategic Defense Logistical Hub`,
        stage: "Logistics",
        lat: 37.33,
        lng: -121.88,
        riskScore: 32,
        riskReason: `Global military airlift clearance delays and strategic reserve supply queues.`,
        locationName: "Travis Air Force Base Terminal, California, USA",
        dependentCompanies: [companyName],
        sources: [
          { title: "Aviation Logistics Report", url: "https://www.cnbc.com/" }
        ],
        eventSeverity: 3,
        supplierCriticality: 8,
        proximity: 8,
        recency: 1
      }
    ];

    alerts = [
      {
        id: `${key}-alert-1`,
        severity: "high",
        title: `${companyName} Titanium Blockage Threat`,
        description: `New strategic mineral export controls restrict defense-grade titanium ingot shipments.`,
        stage: "Sourcing",
        timestamp: "Just Now",
        affectedNodeName: "Advanced Titanium & Aerostructure Alloys Sourcing"
      }
    ];
  } else {
    // Default Electronic fallback (similar to Apple, Nvidia, Samsung)
    nodes = [
      {
        id: `${key}-node-1`,
        name: `Raw Material Sourcing Mine (Lithium / Cobalt)`,
        stage: "Sourcing",
        lat: -11.72 + offset * 0.1,
        lng: 27.47 + offset * 0.1,
        riskScore: 74,
        riskReason: `Central African corridor bottlenecking and environmental regulations on raw lithium mining.`,
        locationName: "Katanga Basin, Democratic Republic of the Congo",
        dependentCompanies: [companyName],
        sources: [
          { title: "Mining Squeeze Weekly", url: "https://www.reuters.com/" }
        ],
        eventSeverity: 8,
        supplierCriticality: 9,
        proximity: 9,
        recency: 1
      },
      {
        id: `${key}-node-2`,
        name: `${companyName} Precision Fabrication Foundry`,
        stage: "Processing",
        lat: 24.78 + offset * 0.1,
        lng: 120.99 - offset * 0.1,
        riskScore: 61,
        riskReason: `High-density electronics substrate fabrication and regional water utility limitations.`,
        locationName: "Hsinchu Science Loop, Taiwan",
        dependentCompanies: [companyName],
        sources: [
          { title: "Silicon Fab Tracker", url: "https://asia.nikkei.com/" }
        ],
        eventSeverity: 7,
        supplierCriticality: 10,
        proximity: 9,
        recency: 1
      },
      {
        id: `${key}-node-3`,
        name: `Robotic System Final Assembly Hub`,
        stage: "Assembly",
        lat: 31.23 + offset * 0.1,
        lng: 121.47 + offset * 0.1,
        riskScore: 48,
        riskReason: `Localized labor availability buffers and packaging material clearance delays.`,
        locationName: "Zhengzhou Industrial Zone, China",
        dependentCompanies: [companyName],
        sources: [
          { title: "Global Assembly Quarterly Squeeze", url: "https://www.bloomberg.com/" }
        ],
        eventSeverity: 5,
        supplierCriticality: 9,
        proximity: 8,
        recency: 1
      },
      {
        id: `${key}-node-4`,
        name: `Main Oceanic Container Gateway`,
        stage: "Logistics",
        lat: 33.74,
        lng: -118.26,
        riskScore: 32,
        riskReason: `Pacific shipping container backlogs and intermodal chassis pool allocation hurdles.`,
        locationName: "Port of Los Angeles Container Hub, USA",
        dependentCompanies: [companyName],
        sources: [
          { title: "Maritime Bulletin Port Schedules", url: "https://www.cnbc.com/" }
        ],
        eventSeverity: 4,
        supplierCriticality: 8,
        proximity: 8,
        recency: 1
      }
    ];

    alerts = [
      {
        id: `${key}-alert-1`,
        severity: "high",
        title: `${companyName} Sourcing Congestion`,
        description: `Capacity constraints at Raw Material Mines create a 3-day backlog for active metal ore shipments.`,
        stage: "Sourcing",
        timestamp: "Just Now",
        affectedNodeName: "Raw Material Sourcing Mine (Lithium / Cobalt)"
      }
    ];
  }

  return {
    id: key,
    name: companyName,
    sector: sector,
    headquarters: sim.includes("toyota") ? "Toyota City, Aichi, Japan" : sim.includes("lockheed") ? "Bethesda, Maryland, USA" : "Global Corporate Hub",
    description: `${focus} (Custom supply chain modeled under ${similarCompany ? similarCompany : "standalone"} framework).`,
    globalRiskScore: Math.round(nodes.reduce((acc, n) => acc + n.riskScore, 0) / nodes.length),
    nodes,
    alerts
  };
}

// Integrated Vite development middleware setup (serves standard web application build in product phase, and live reloading proxy in dev)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully. Gateway routing at http://0.0.0.0:${PORT}`);
  });
}

startServer();
