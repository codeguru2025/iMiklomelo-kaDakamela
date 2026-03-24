import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Hashed assets get long cache (1 year)
  app.use("/assets", express.static(path.join(distPath, "assets"), {
    maxAge: "365d",
    immutable: true,
  }));

  // Everything else: short cache
  app.use(express.static(distPath, {
    maxAge: "1h",
  }));

  // SPA fallback — no cache on HTML
  app.use("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
