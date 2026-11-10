import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoMemoryServer } from "mongodb-memory-server";

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data/mongo");

let server: MongoMemoryServer | null = null;

export function usesPortableMongo() {
  return !process.env.MONGODB_URI?.trim();
}

export async function startPortableMongo() {
  if (server) return server.getUri("doctortracker");
  await mkdir(dataDir, { recursive: true });
  server = await MongoMemoryServer.create({
    binary: { version: "7.0.14" },
    instance: {
      dbName: "doctortracker",
      dbPath: dataDir,
      ip: "127.0.0.1",
      storageEngine: "wiredTiger",
      launchTimeout: 60_000,
    },
  });
  const uri = server.getUri("doctortracker");
  console.log("Portable MongoDB is running for this demo.");
  return uri;
}

export async function stopPortableMongo() {
  const current = server;
  server = null;
  if (!current) return;
  await current.stop({ doCleanup: false, force: false });
}
