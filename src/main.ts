import { createApiReference } from "@scalar/api-reference";

// Configuration
export const CONFIG = {
  baseUrls: {
    dev: "https://api.crypticorn.dev",
    prod: "https://api.crypticorn.com",
    local: "http://localhost",
  },
  env: import.meta.env.VITE_API_ENV as "dev" | "prod" | "local",
};

// API endpoints and titles with version
export const API_ENDPOINTS = [
  { service: "hive", title: "Hive AI API", version: "v1" },
  { service: "klines", title: "Klines API", version: "v1" },
  { service: "metrics", title: "Metrics API", version: "v1" },
  { service: "trade", title: "Trading API", version: "v1" },
  { service: "pay", title: "Payment API", version: "v1" },
  { service: "auth", title: "Auth API", version: "v1" },
  // Disabled endpoints
  // { service: 'sentiment', title: 'Sentiment API', version: 'v1' },
  // { service: 'market', title: 'Market Data API', version: 'v1' },
  // { service: 'google', title: 'Google Trends API', version: 'v1' },
];

// Server configuration utilities
function getServerConfigs(prefix: string) {
  let servers: Record<string, { url: string; description: string }> = {
    dev: {
      url: `${CONFIG.baseUrls.dev}${prefix}`,
      description: "Development",
    },
    local: {
      url: `${CONFIG.baseUrls.local}${prefix}`,
      description: "Localhost",
    },
    prod: {
      url: `${CONFIG.baseUrls.prod}${prefix}`,
      description: "Production",
    },
  };
  // if local, move to the first position (default arg does not work :/)
  if (CONFIG.env === "local") {
    servers = {
      local: servers.local,
      dev: servers.dev,
      prod: servers.prod,
    };
  }

  // Filter servers based on environment
  // if prod drop dev and local
  // the reason for this are:
  // - in the public documentation, we only want to show prod servers
  // - in the other environments, we want to show all servers
  // - local (dev) is compatible with the dev&prod (prod) environments, but not vice versa, which means that the generated reference on prod will not work on dev or local, but the reverse is true

  if (CONFIG.env === "prod") {
    delete servers.dev;
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
  const data = await res.json();

  data.servers = getServerConfigs(prefix);
  return data;
}

// API Reference initialization
async function initializeApiReference() {
  try {
    // Fetch all API docs
    const docs = await Promise.all(
      API_ENDPOINTS.map((endpoint) =>
        fetchDoc(endpoint.service, endpoint.version)
      )
    );

    // Create reference with all docs
    createApiReference("#app", {
      sources: API_ENDPOINTS.map((endpoint, index) => ({
        title: endpoint.title,
        content: JSON.stringify(docs[index]),
      })),
      // Proxy option (commented out)
      // proxyUrl: 'https://proxy.scalar.com',
    });
  } catch (error) {
    console.error("Failed to initialize API reference:", error);
  }
}

// Start the initialization
initializeApiReference();
