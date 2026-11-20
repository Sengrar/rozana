import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

// Tests read the app's settings (.env.local: Supabase URL and publishable
// key) and the test-only secret key (.env.secrets). Next.js skips .env.local
// when NODE_ENV is "test", and nothing else reads .env.secrets, so load both.
for (const file of [".env.local", ".env.secrets"]) {
  if (existsSync(file)) loadEnvFile(file);
}
