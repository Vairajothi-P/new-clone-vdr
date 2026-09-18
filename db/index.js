
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase
let client;
if (process.env.NODE_ENV !== "production") {
  if (!globalThis.postgresClient) {
    globalThis.postgresClient = postgres(connectionString, { prepare: false, max: 1 });
  }
  client = globalThis.postgresClient;
} else {
  client = postgres(connectionString, { prepare: false });
}

export { client };
export const db = drizzle(client, { schema });
