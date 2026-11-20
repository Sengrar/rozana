import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No page cache (no R2, KV or static-assets cache): every page is rendered on
// request. Almost every page depends on the logged-in user or the shop, so a
// cache would gain little. The static-assets cache was tried and logged an
// error on every save attempt, because it is read-only. See docs/DEPLOY.md.
export default defineCloudflareConfig({});
