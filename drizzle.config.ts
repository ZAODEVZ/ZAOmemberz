import { defineConfig } from "drizzle-kit";

// drizzle-kit reads DATABASE_URL from the environment. Load it from .env when
// running CLI commands locally (Next injects it automatically at runtime).
import { config } from "dotenv";
config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
