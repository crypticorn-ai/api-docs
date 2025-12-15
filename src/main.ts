import { createApiReference } from "@scalar/api-reference";
import { manipulateDoc } from "./utils";

type ApiEnv = "local" | "dev" | "prod";

// Configuration
const CONFIG = {
  baseUrls: {
    local: "http://localhost",
    dev: "https://api.crypticorn.dev",
    prod: "https://api.crypticorn.com",
  },
  env: import.meta.env.VITE_API_ENV as ApiEnv,
};

// API endpoints and titles with version
const API_ENDPOINTS = [
  { service: "hive", title: "Hive AI API", version: "v1" },
  { service: "metrics", title: "Metrics API", version: "v1" },
  { service: "trade", title: "Trading API", version: "v2" },
  { service: "pay", title: "Payment API", version: "v1" },
  { service: "auth", title: "Auth API", version: "v1" },
  { service: "dex", title: "DEX API", version: "v2" },
  { service: "notification", title: "Notification API", version: "v1" },
  { service: "indicator", title: "Indicator API", version: "v1" },
  { service: "klines", title: "Klines API", version: "v1" },
  // Disabled endpoints
  // { service: 'sentiment', title: 'Sentiment API', version: 'v1' },
  // { service: 'market', title: 'Market Data API', version: 'v1' },
  // { service: 'google', title: 'Google Trends API', version: 'v1' },
];

// Server configuration utilities
function getServerConfigs(prefix: string) {
  let servers: Record<string, { url: string; description: string }> = {
    local: {
      url: `${CONFIG.baseUrls.local}${prefix}`,
      description: "Local",
    },
    dev: {
      url: `${CONFIG.baseUrls.dev}${prefix}`,
      description: "Development",
    },
    prod: {
      url: `${CONFIG.baseUrls.prod}${prefix}`,
      description: "Production",
    },
  };

  // Filter servers based on environment
  // if prod drop dev and local
  // the reason for this are:
  // - in the public documentation, we only want to show prod servers
  // - in the other environments, we want to show all servers except local
  // - local (dev) is compatible with the dev&prod (prod) environments, but not vice versa, which means that the generated reference on prod will not work on dev or local, but the reverse is true

  if (CONFIG.env === "prod") {
    delete servers.dev;
    delete servers.local;
  }
  if (CONFIG.env === "dev") {
    delete servers.local;
  }
  // convert to an array
  return Object.values(servers);
}

// Data fetching
async function fetchDoc(service: string, version: string): Promise<any> {
  const root = CONFIG.baseUrls[CONFIG.env];
  const prefix = `/${version}/${service}`;
  const url = `${root}${prefix}/openapi.json`;

  const res = await fetch(url);
  let data = await res.json();
  // for testing purposes, we can import a local file
  // let importedData = await import("./test-doc.json");
  // let data = { ...importedData.default || importedData };

  data.servers = getServerConfigs(prefix);
  data = await manipulateDoc(data, service);
  return data;
}

// API Reference initialization
async function initializeApiReference() {
  try {
    // Fetch all API docs with individual error handling
    const fetchPromises = API_ENDPOINTS.map(async (endpoint) => {
      try {
        const doc = await fetchDoc(endpoint.service, endpoint.version);
        return { endpoint, doc, success: true };
      } catch (error) {
        console.warn(`Failed to fetch ${endpoint.service} API docs:`, error);
        return { endpoint, doc: null, success: false };
      }
    });

    const results = await Promise.all(fetchPromises);
    
    // Filter out failed fetches and create sources only for successful ones
    const successfulResults = results.filter(result => result.success);
    
    if (successfulResults.length === 0) {
      console.error("No API docs could be fetched successfully");
      return;
    }

    // Create reference with only successful docs
    createApiReference("#app", {
      // https://guides.scalar.com/scalar/scalar-api-references/configuration
      sources: successfulResults.map((result) => ({
        title: result.endpoint.title,
        content: JSON.stringify(result.doc),
      })),
      // hideModels: true,
      authentication: {
        preferredSecurityScheme: "APIKeyHeader",
      },
      operationsSorter: (a: any, b: any) => {
        return a.operation.operationId.length - b.operation.operationId.length;
      }, // sort by operationId length ascending (usually the longer the operationId, the more complex the endpoint)
      hideClientButton: true,
      // persistAuth: true,
      // withDefaultFonts: false
      // Proxy option (commented out)
      // proxyUrl: 'https://proxy.scalar.com',
      // plugins: [plugin],
    });
  } catch (error) {
    console.error("Failed to initialize API reference:", error);
  }
}

// Start the initialization
initializeApiReference();
