import { createApp } from "./app/create-app.js";
import { disconnectDB } from "./db/connection.js";
import { seedIfEmpty } from "./db/seed.js";

const port = Number(process.env.PORT || 4000);
let stopping = false;

createApp()
  .then(async (app) => {
    await seedIfEmpty();
    const http = app.listen(port, "127.0.0.1", () => {
      console.log(`Doctor Tracker API listening on http://127.0.0.1:${port}`);
    });

    const shutdown = async () => {
      if (stopping) return;
      stopping = true;
      await new Promise<void>((resolve) => http.close(() => resolve()));
      await disconnectDB();
      process.exit(0);
    };
    process.on("SIGINT", () => void shutdown());
    process.on("SIGTERM", () => void shutdown());
  })
  .catch(async (error) => {
    console.error(error);
    await disconnectDB().catch(() => undefined);
    process.exit(1);
  });
