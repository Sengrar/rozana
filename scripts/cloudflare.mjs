/**
 * Build, preview and deploy the app on Cloudflare Workers (docs/DEPLOY.md).
 *
 *   npm run cf:login     log in to your Cloudflare account (opens the browser)
 *   npm run cf:whoami    show which Cloudflare account is logged in
 *   npm run cf:build     build the Worker into .open-next/
 *   npm run cf:preview   build, then run it on this computer in the Workers runtime
 *   npm run cf:deploy    build, then upload it to Cloudflare
 *   npm run cf:rollback  go back to the previous live version
 *
 * Why a script instead of the adapter's own commands:
 * 1. The adapter copies every value from .env, .env.local and the other .env.*
 *    files into the uploaded Worker. This script refuses to build while any of
 *    those files holds a secret, and checks the build output for the secret
 *    key from .env.secrets.
 * 2. The live site's main domain comes from package.json ("cloudflare" >
 *    "rootDomain"; empty = one address, such as workers.dev), not from
 *    .env.local, which says localhost:3000.
 * 3. The folder name contains "&", which breaks npm's Windows command shims.
 *    The adapter starts wrangler through them, so this script starts wrangler
 *    with `node` directly, and sets OPEN_NEXT_DEPLOY so that `wrangler deploy`
 *    does not hand the deploy back to the adapter.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ADAPTER = "node_modules/@opennextjs/cloudflare/dist/cli/index.js";
const WRANGLER = "node_modules/wrangler/bin/wrangler.js";

/** Every env file the adapter copies into the Worker, for all modes. */
const BUILD_ENV_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development",
  ".env.development.local",
  ".env.test",
  ".env.test.local",
];

/** Settings for every wrangler run started from here. */
const WRANGLER_ENV = {
  // The adapter handles .env files; wrangler must not load them as well.
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "false",
  // Do not send usage data to Cloudflare.
  WRANGLER_SEND_METRICS: "false",
};

function fail(message) {
  console.error(`\nSTOPPED: ${message}\n`);
  process.exit(1);
}

/** Runs a Node.js script and stops this one if it fails. */
function runNode(args, env = {}) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function readEnvFile(file) {
  const entries = [];
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith("#") || !text.includes("=")) continue;
    const name = text
      .slice(0, text.indexOf("="))
      .replace(/^export\s+/, "")
      .trim();
    const value = text
      .slice(text.indexOf("=") + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2");
    entries.push({ name, value });
  }
  return entries;
}

/** Stop before building if a file the build copies holds a secret. */
function checkBuildEnvFiles() {
  for (const file of BUILD_ENV_FILES) {
    if (!existsSync(file)) continue;
    for (const { name, value } of readEnvFile(file)) {
      if (!value) continue;
      const looksSecret =
        /SECRET|SERVICE_ROLE|PASSWORD|TOKEN/i.test(name) ||
        value.startsWith("sb_secret_");
      if (looksSecret) {
        fail(
          `${file} holds "${name}". The Cloudflare build would upload it inside the site.\n` +
            "  Move it to .env.secrets (only the tests read that file), then try again.",
        );
      }
    }
  }
}

/** After building, make sure no value from .env.secrets is in the output. */
function checkOutputForSecrets() {
  if (!existsSync(".env.secrets")) return;
  const secrets = readEnvFile(".env.secrets")
    .map((entry) => entry.value)
    .filter((value) => value.length >= 16)
    .map((value) => Buffer.from(value));
  if (secrets.length === 0) return;

  const folders = [".open-next"];
  let files = 0;
  while (folders.length > 0) {
    const folder = folders.pop();
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        folders.push(full);
      } else if (entry.isFile()) {
        files += 1;
        const content = readFileSync(full);
        if (secrets.some((secret) => content.includes(secret))) {
          fail(`A secret from .env.secrets is inside ${full}. Not continuing.`);
        }
      }
    }
  }
  console.log(`OK: no secret from .env.secrets in ${files} build files.`);
}

/** The live site's main domain, or "none" for one-address mode. */
function liveRootDomain() {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const value = pkg.cloudflare?.rootDomain ?? "";
  if (typeof value !== "string") {
    fail('package.json "cloudflare" > "rootDomain" must be text.');
  }
  // "none", not "": an empty value does not survive Windows' cmd.exe.
  return value.trim().toLowerCase() || "none";
}

function build() {
  checkBuildEnvFiles();
  const domain = liveRootDomain();
  console.log(
    domain === "none"
      ? "Building for one address (shops at /shop/<shop>)."
      : `Building for ${domain}: app.${domain} and <shop>.${domain}.`,
  );
  // A value set here beats the one in .env.local (localhost:3000).
  runNode([ADAPTER, "build"], { NEXT_PUBLIC_ROOT_DOMAIN: domain });
  checkOutputForSecrets();
}

const command = process.argv[2];
switch (command) {
  case "login":
    runNode([WRANGLER, "login"], WRANGLER_ENV);
    break;
  case "whoami":
    runNode([WRANGLER, "whoami"], WRANGLER_ENV);
    break;
  case "build":
    build();
    break;
  case "preview":
    build();
    runNode([WRANGLER, "dev", "--port", "8787"], WRANGLER_ENV);
    break;
  case "deploy":
    build();
    runNode([WRANGLER, "deploy"], {
      ...WRANGLER_ENV,
      OPEN_NEXT_DEPLOY: "true",
    });
    break;
  case "rollback":
    runNode([WRANGLER, "rollback"], WRANGLER_ENV);
    break;
  default:
    fail("Use one of: login, whoami, build, preview, deploy, rollback.");
}
