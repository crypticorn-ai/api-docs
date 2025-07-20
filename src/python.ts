export async function manipulateDoc(data: any, serverRoot: string) {
  for (const path in data.paths) {
    const pathItem = data.paths[path];
    for (const method of Object.keys(pathItem)) {
      const operation = pathItem[method];
      if (!operation.operationId) continue;

      // Get MAIN_PATH: first non-empty segment of the path
      const mainPath = path.split("/").filter((s) => !!s)[0] || "status";

      const operationId = operation.operationId;

      const pythonSyncExample = `from crypticorn import SyncClient

with SyncClient(api_key="your-api-key") as client:
    client.${serverRoot}.${mainPath}.${operationId}(*args, **kwargs)
`;

      const pythonAsyncExample = `from crypticorn import AsyncClient
import asyncio

async with AsyncClient(api_key="your-api-key") as client:
    await client.${serverRoot}.${mainPath}.${operationId}(*args, **kwargs)
`;

      // Append to x-codeSamples
      operation["x-codeSamples"] = operation["x-codeSamples"] || [];
      
      // Add sync example
      operation["x-codeSamples"].push({
        label: "Python Async SDK",
        lang: "Python",
        source: pythonAsyncExample,
      });

      // Add async example
      operation["x-codeSamples"].push({
        label: "Python Sync SDK", 
        lang: "Python",
        source: pythonSyncExample,
      });
    }
  }

  return data;
}
