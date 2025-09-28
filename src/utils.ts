import { camelCase, snakeCase } from "change-case";

export async function manipulateDoc(data: any, serverRoot: string) {
  if (!data.info) {
    data.info = {};
  }
  
  data.info["x-scalar-sdk-installation"] = [
    {
      lang: "Python",
      description: "Install our **Python SDK** from PyPI:",
      source: "pip install crypticorn"
    },
    {
      lang: "Node",
      description: "Install our **TypeScript/JavaScript SDK** from npm:",
      source: "npm install @crypticorn-ai/api-client"
    }
  ];
  for (const path in data.paths) {
    const pathItem = data.paths[path];
    for (const method of Object.keys(pathItem)) {
      const operation = pathItem[method];
      if (!operation.operationId) continue;

      // Get MAIN_PATH: first non-empty segment of the path
      const mainPath = path.split("/").filter((s) => !!s)[0] || "status";

      const snakeCaseOperationId = snakeCase(operation.operationId);
      const camelCaseOperationId = camelCase(operation.operationId);

      const pythonSyncExample = `from crypticorn import SyncClient

with SyncClient(api_key="your-api-key") as client:
    client.${serverRoot}.${mainPath}.${snakeCaseOperationId}(*args, **kwargs)
`;

      const pythonAsyncExample = `from crypticorn import AsyncClient

async with AsyncClient(api_key="your-api-key") as client:
    await client.${serverRoot}.${mainPath}.${snakeCaseOperationId}(*args, **kwargs)
`;

      const typescriptExample = `import { AsyncClient } from '@crypticorn-ai/api-client'

const client = new AsyncClient({
  apiKey: 'your-api-key'
})

const result = await client.${serverRoot}.${camelCaseOperationId}(...args)
`;

      // Append to x-codeSamples
      operation["x-codeSamples"] = operation["x-codeSamples"] || [];
      
      operation["x-codeSamples"].push({
        label: "Python Async SDK",
        lang: "Python",
        source: pythonAsyncExample,
      });
      
      operation["x-codeSamples"].push({
        label: "TypeScript SDK",
        lang: "TypeScript",
        source: typescriptExample,
      });

      operation["x-codeSamples"].push({
        label: "Python Sync SDK", 
        lang: "Python",
        source: pythonSyncExample,
      });
    }
  }

  return data;
}
