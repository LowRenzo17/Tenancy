process.env.NODE_ENV = "production";

// Launcher to keep `npm start` working on Windows (no `NODE_ENV=...` shell syntax).
const distEntry = new URL("../dist/index.js", import.meta.url);
await import(distEntry.href);

